'use strict';

const fs = require('fs');
const path = require('path');

const MAIN_HEADER_REGEX = /\/\*:[\s\S]*?\*\//m;
const STRUCT_HEADER_REGEX = /\/\*~struct~([^:\r\n]+):[\s\S]*?\*\//gm;
const DIRECTIVE_REGEX = /^\s*\*\s*@([A-Za-z0-9_<>\[\]~\/-]+)(?:\s*(.*))?$/;
const COMMENT_BODY_REGEX = /^\s*\*\s?(.*)$/;

function detectLineEnding(text) {
  return text.includes('\r\n') ? '\r\n' : '\n';
}

function parseDirectiveLine(line) {
  const match = DIRECTIVE_REGEX.exec(line);
  if (!match) return null;

  return {
    key: String(match[1] || '').trim(),
    value: String(match[2] || '')
  };
}

function getCommentBody(line) {
  const match = COMMENT_BODY_REGEX.exec(line);
  if (!match) return null;
  return match[1] === undefined ? '' : String(match[1]);
}

function cloneDirective(directive) {
  return {
    key: String(directive.key || '').trim(),
    value: directive.value === undefined || directive.value === null ? '' : String(directive.value)
  };
}

function normalizeParamSchemaEntry(entry) {
  const name = String(entry && entry.name !== undefined ? entry.name : '').trim();
  const sourceDirectives = Array.isArray(entry && entry.directives) ? entry.directives : [];

  const directivesWithoutParam = [];
  for (let i = 0; i < sourceDirectives.length; i += 1) {
    const directive = cloneDirective(sourceDirectives[i]);
    if (!directive.key) continue;
    if (directive.key.toLowerCase() === 'param') continue;
    directivesWithoutParam.push(directive);
  }

  return {
    name,
    directives: [{ key: 'param', value: name }].concat(directivesWithoutParam)
  };
}

function normalizeSchema(schema) {
  const source = Array.isArray(schema) ? schema : [];
  const out = [];

  for (let i = 0; i < source.length; i += 1) {
    const normalized = normalizeParamSchemaEntry(source[i]);
    if (!normalized.name) continue;
    out.push(normalized);
  }

  return out;
}

function normalizeStructSchemaMap(structSchemaMap) {
  const source = structSchemaMap && typeof structSchemaMap === 'object'
    ? structSchemaMap
    : {};
  const out = {};

  Object.keys(source).forEach((nameRaw) => {
    const name = String(nameRaw || '').trim();
    if (!name) return;
    out[name] = normalizeSchema(source[name]);
  });

  return out;
}

function parseHeaderParameterSchema(headerText) {
  const lines = headerText.split(/\r?\n/);
  const params = [];

  let current = null;
  let firstParamLine = -1;
  let lastParamLine = -1;
  let lastDirective = null;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const directive = parseDirectiveLine(line);

    if (directive && directive.key.toLowerCase() === 'param') {
      if (current) {
        current.endLine = i - 1;
        params.push(current);
      }

      current = {
        name: directive.value || '',
        directives: [{ key: 'param', value: directive.value || '' }],
        startLine: i,
        endLine: i
      };

      if (firstParamLine < 0) firstParamLine = i;
      lastParamLine = i;
      lastDirective = current.directives[current.directives.length - 1];
      continue;
    }

    if (!current) continue;

    if (directive) {
      const cleanDirective = cloneDirective(directive);
      current.directives.push(cleanDirective);
      current.endLine = i;
      lastParamLine = i;
      lastDirective = cleanDirective;
      continue;
    }

    const body = getCommentBody(line);
    if (body !== null) {
      if (body.length > 0 && lastDirective) {
        if (lastDirective.value.length > 0) {
          lastDirective.value += `\n${body}`;
        } else {
          lastDirective.value = body;
        }
      }
      current.endLine = i;
      lastParamLine = i;
    }
  }

  if (current) {
    params.push(current);
  }

  return {
    params,
    lines,
    firstParamLine,
    lastParamLine
  };
}

function extractMainHeader(fileText) {
  const match = MAIN_HEADER_REGEX.exec(fileText);
  if (!match) return null;

  return {
    text: match[0],
    start: match.index,
    end: match.index + match[0].length
  };
}

function parseStructBlocksFromFileText(fileText) {
  const blocks = [];
  STRUCT_HEADER_REGEX.lastIndex = 0;

  let match = STRUCT_HEADER_REGEX.exec(fileText);
  while (match) {
    const blockText = String(match[0] || '');
    const structName = String(match[1] || '').trim();
    if (blockText && structName) {
      blocks.push({
        name: structName,
        text: blockText,
        start: match.index,
        end: match.index + blockText.length
      });
    }
    match = STRUCT_HEADER_REGEX.exec(fileText);
  }

  return blocks;
}

function extractHelpTextFromHeader(headerText) {
  const lines = String(headerText || '').split(/\r?\n/);
  const out = [];
  let inHelp = false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const directive = parseDirectiveLine(line);

    if (!inHelp) {
      if (directive && String(directive.key || '').toLowerCase() === 'help') {
        inHelp = true;
        const firstValue = directive.value === undefined || directive.value === null ? '' : String(directive.value);
        if (firstValue.length > 0) {
          out.push(firstValue);
        }
      }
      continue;
    }

    const body = getCommentBody(line);
    if (body === null) continue;
    out.push(body);
  }

  while (out.length > 0 && String(out[out.length - 1] || '').trim() === '') {
    out.pop();
  }

  return out.join('\n');
}

function getDirectiveValues(paramSchema, key) {
  const values = [];
  const lower = key.toLowerCase();
  const directives = Array.isArray(paramSchema.directives) ? paramSchema.directives : [];

  for (let i = 0; i < directives.length; i += 1) {
    const directive = directives[i];
    if (String(directive.key || '').toLowerCase() === lower) {
      values.push(directive.value === undefined || directive.value === null ? '' : String(directive.value));
    }
  }

  return values;
}

function getFirstDirectiveValue(paramSchema, key, fallback) {
  const values = getDirectiveValues(paramSchema, key);
  if (values.length <= 0) return fallback;
  return values[0];
}

function buildOptionsFromDirectives(paramSchema) {
  const directives = Array.isArray(paramSchema.directives) ? paramSchema.directives : [];
  const options = [];
  let pending = null;

  for (let i = 0; i < directives.length; i += 1) {
    const directive = directives[i];
    const key = String(directive.key || '').toLowerCase();
    const value = directive.value === undefined || directive.value === null ? '' : String(directive.value);

    if (key === 'option') {
      const option = { label: value, value };
      options.push(option);
      pending = option;
      continue;
    }

    if (key === 'value' && pending) {
      pending.value = value;
      pending = null;
    }
  }

  return options;
}

function toParameterMetadata(paramSchema) {
  const type = getFirstDirectiveValue(paramSchema, 'type', 'text') || 'text';
  const lowerType = type.toLowerCase();

  return {
    name: paramSchema.name,
    text: getFirstDirectiveValue(paramSchema, 'text', paramSchema.name),
    desc: getFirstDirectiveValue(paramSchema, 'desc', ''),
    parent: getFirstDirectiveValue(paramSchema, 'parent', ''),
    type,
    defaultValue: getFirstDirectiveValue(paramSchema, 'default', ''),
    min: getFirstDirectiveValue(paramSchema, 'min', ''),
    max: getFirstDirectiveValue(paramSchema, 'max', ''),
    decimals: getFirstDirectiveValue(paramSchema, 'decimals', ''),
    onLabel: getFirstDirectiveValue(paramSchema, 'on', 'ON'),
    offLabel: getFirstDirectiveValue(paramSchema, 'off', 'OFF'),
    dir: getFirstDirectiveValue(paramSchema, 'dir', ''),
    require: getFirstDirectiveValue(paramSchema, 'require', ''),
    options: buildOptionsFromDirectives(paramSchema),
    isList: lowerType.endsWith('[]'),
    isStruct: /^struct<.+>$/.test(lowerType),
    directives: (paramSchema.directives || []).map(cloneDirective)
  };
}

function splitMultilineValue(value) {
  const normalized = String(value === undefined || value === null ? '' : value)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  return normalized.split('\n');
}

function directiveToLines(directive) {
  const key = String(directive.key || '').trim();
  if (!key) return [];

  const value = directive.value === undefined || directive.value === null ? '' : String(directive.value);
  const parts = splitMultilineValue(value);

  if (parts.length <= 1) {
    return [parts[0].length > 0 ? ` * @${key} ${parts[0]}` : ` * @${key}`];
  }

  const lines = [parts[0].length > 0 ? ` * @${key} ${parts[0]}` : ` * @${key}`];
  for (let i = 1; i < parts.length; i += 1) {
    lines.push(parts[i].length > 0 ? ` * ${parts[i]}` : ' *');
  }

  return lines;
}

function buildParamSectionLines(schema) {
  const normalized = normalizeSchema(schema);
  const lines = [];

  for (let i = 0; i < normalized.length; i += 1) {
    const param = normalized[i];

    for (let j = 0; j < param.directives.length; j += 1) {
      const directive = param.directives[j];
      const generated = directiveToLines(directive);
      for (let k = 0; k < generated.length; k += 1) {
        lines.push(generated[k]);
      }
    }

    if (i < normalized.length - 1) {
      lines.push(' *');
    }
  }

  return lines;
}

function buildStructBlockText(structName, schema, lineEnding) {
  const eol = lineEnding || '\n';
  const safeName = String(structName || '').trim();
  const bodyLines = buildParamSectionLines(schema);
  const lines = [`/*~struct~${safeName}:`];

  if (bodyLines.length > 0) {
    for (let i = 0; i < bodyLines.length; i += 1) {
      lines.push(bodyLines[i]);
    }
  } else {
    lines.push(' *');
  }

  lines.push(' */');
  return lines.join(eol);
}

function rewriteStructSections(fileText, structSchemaMap) {
  const normalizedMap = normalizeStructSchemaMap(structSchemaMap);
  const existingBlocks = parseStructBlocksFromFileText(fileText);
  const desiredNames = Object.keys(normalizedMap);
  const lineEnding = detectLineEnding(fileText);

  let cursor = 0;
  let rewritten = '';
  let placed = 0;

  for (let i = 0; i < existingBlocks.length; i += 1) {
    const block = existingBlocks[i];
    rewritten += fileText.slice(cursor, block.start);
    cursor = block.end;

    if (placed >= desiredNames.length) {
      continue;
    }

    const structName = desiredNames[placed];
    const replacement = buildStructBlockText(structName, normalizedMap[structName], lineEnding);
    if (rewritten && !rewritten.endsWith('\n') && !rewritten.endsWith('\r')) {
      rewritten += lineEnding;
    }
    rewritten += replacement;
    placed += 1;
  }

  rewritten += fileText.slice(cursor);

  const pendingNames = desiredNames.slice(placed);
  if (pendingNames.length > 0) {
    if (!rewritten.endsWith(lineEnding)) {
      rewritten += lineEnding;
    }
    if (!rewritten.endsWith(`${lineEnding}${lineEnding}`)) {
      rewritten += lineEnding;
    }

    for (let i = 0; i < pendingNames.length; i += 1) {
      const structName = pendingNames[i];
      rewritten += buildStructBlockText(structName, normalizedMap[structName], lineEnding);
      rewritten += `${lineEnding}${lineEnding}`;
    }

    while (rewritten.endsWith(`${lineEnding}${lineEnding}${lineEnding}`)) {
      rewritten = rewritten.slice(0, -lineEnding.length);
    }
  }

  return rewritten;
}

function rewriteMainHeaderParameterSection(fileText, schema) {
  const header = extractMainHeader(fileText);
  if (!header) {
    throw new Error('Plugin file has no main /*: */ header block');
  }

  const lineEnding = detectLineEnding(fileText);
  const parsed = parseHeaderParameterSchema(header.text);
  const generatedParamLines = buildParamSectionLines(schema);

  let headerLines = parsed.lines.slice();

  if (parsed.firstParamLine >= 0) {
    headerLines = headerLines
      .slice(0, parsed.firstParamLine)
      .concat(generatedParamLines)
      .concat(headerLines.slice(parsed.lastParamLine + 1));
  } else {
    const closeIndex = headerLines.findIndex((line) => line.includes('*/'));
    const insertIndex = closeIndex >= 0 ? closeIndex : headerLines.length;

    const prefix = headerLines.slice(0, insertIndex);
    const suffix = headerLines.slice(insertIndex);

    const merged = prefix.slice();
    if (generatedParamLines.length > 0) {
      if (merged.length > 0 && merged[merged.length - 1] !== ' *') {
        merged.push(' *');
      }
      for (let i = 0; i < generatedParamLines.length; i += 1) {
        merged.push(generatedParamLines[i]);
      }
    }

    headerLines = merged.concat(suffix);
  }

  const rewrittenHeader = headerLines.join(lineEnding);
  return fileText.slice(0, header.start) + rewrittenHeader + fileText.slice(header.end);
}

function parseSchemaAndMetadataFromFileText(fileText) {
  const structSchema = {};
  const structMetadata = {};
  const structBlocks = parseStructBlocksFromFileText(fileText);
  let structMatch = structBlocks.length > 0 ? structBlocks[0] : null;
  let structIndex = 0;

  while (structMatch) {
    const structName = String(structMatch.name || '').trim();
    const structText = structMatch.text || '';

    if (structName && structText) {
      const structParsed = parseHeaderParameterSchema(structText);
      const normalizedStructSchema = normalizeSchema(structParsed.params);

      structSchema[structName] = normalizedStructSchema;
      structMetadata[structName] = normalizedStructSchema.map(toParameterMetadata);
    }

    structIndex += 1;
    structMatch = structIndex < structBlocks.length ? structBlocks[structIndex] : null;
  }

  const header = extractMainHeader(fileText);
  if (!header) {
    return {
      foundHeader: false,
      schema: [],
      metadata: [],
      structSchema,
      structMetadata,
      helpText: ''
    };
  }

  const parsed = parseHeaderParameterSchema(header.text);
  const schema = normalizeSchema(parsed.params);
  const metadata = schema.map(toParameterMetadata);
  const helpText = extractHelpTextFromHeader(header.text);

  return {
    foundHeader: true,
    schema,
    metadata,
    structSchema,
    structMetadata,
    helpText,
    firstParamLine: parsed.firstParamLine,
    lastParamLine: parsed.lastParamLine
  };
}

function readPluginSchema(pluginFilePath) {
  const fileText = fs.readFileSync(pluginFilePath, 'utf8');
  const parsed = parseSchemaAndMetadataFromFileText(fileText);

  return {
    fileText,
    schema: parsed.schema,
    metadata: parsed.metadata,
    structSchema: parsed.structSchema,
    structMetadata: parsed.structMetadata,
    helpText: parsed.helpText,
    foundHeader: parsed.foundHeader
  };
}

function writePluginSchema(pluginFilePath, schema) {
  const fileText = fs.readFileSync(pluginFilePath, 'utf8');
  const rewritten = rewriteMainHeaderParameterSection(fileText, schema);
  fs.writeFileSync(pluginFilePath, rewritten, 'utf8');
  return readPluginSchema(pluginFilePath);
}

function writePluginStructSchema(pluginFilePath, structSchemaMap) {
  const fileText = fs.readFileSync(pluginFilePath, 'utf8');
  const rewritten = rewriteStructSections(fileText, structSchemaMap);
  fs.writeFileSync(pluginFilePath, rewritten, 'utf8');
  return readPluginSchema(pluginFilePath);
}

function resolvePluginFilePath(project, pluginName) {
  if (!project || !project.pluginsDir) return null;

  const raw = String(pluginName === undefined || pluginName === null ? '' : pluginName).trim();
  if (!raw) return null;

  const withExtension = raw.toLowerCase().endsWith('.js') ? raw : `${raw}.js`;
  const normalizedName = withExtension.replace(/[\\/]+/g, path.sep);
  const filePath = path.join(project.pluginsDir, normalizedName);

  try {
    if (fs.statSync(filePath).isFile()) {
      return filePath;
    }
  } catch (err) {
    return null;
  }

  return null;
}

module.exports = {
  normalizeSchema,
  normalizeStructSchemaMap,
  parseSchemaAndMetadataFromFileText,
  readPluginSchema,
  resolvePluginFilePath,
  rewriteStructSections,
  rewriteMainHeaderParameterSection,
  writePluginSchema,
  writePluginStructSchema
};

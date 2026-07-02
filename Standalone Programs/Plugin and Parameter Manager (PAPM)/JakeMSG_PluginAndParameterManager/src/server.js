'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');
const { URL } = require('url');
const childProcess = require('child_process');

const {
  detectFromCandidates,
  resolveFromInputPath
} = require('./gameDetector');
const {
  backupPluginsFile,
  loadPluginsFile,
  normalizePluginEntry,
  savePluginsFile
} = require('./pluginsFile');
const {
  normalizeSchema,
  normalizeStructSchemaMap,
  readPluginSchema,
  resolvePluginFilePath,
  writePluginSchema,
  writePluginStructSchema
} = require('./pluginHeader');
const {
  defaultState,
  loadState,
  saveState,
  sanitizeState
} = require('./stateStore');

const APP_NAME = 'JakeMSG_PluginAndParameterManager';
const APP_VERSION = '0.1.0';
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const APP_PREFS_PATH = path.join(ROOT_DIR, '.JakeMSG_PluginAndParameterManager.app.json');
const SETTINGS_FILE_PATH = path.join(ROOT_DIR, 'ProgramSettings.json');
const PARAMETERS_EXPORT_PREFIX = 'Parameters_';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const cli = parseCliArgs(process.argv.slice(2));

const session = {
  project: null,
  plugins: [],
  lineEnding: '\r\n',
  state: defaultState(),
  dataCatalog: null
};

let electronBridge = null;
let activeServer = null;
const appPrefs = loadAppPrefs();

function loadAppPrefs() {
  try {
    if (!fs.existsSync(APP_PREFS_PATH)) {
      return { lastOpenedGameRoot: '' };
    }

    const text = fs.readFileSync(APP_PREFS_PATH, 'utf8');
    const parsed = JSON.parse(text);

    return {
      lastOpenedGameRoot: parsed && typeof parsed === 'object'
        ? String(parsed.lastOpenedGameRoot || '').trim()
        : ''
    };
  } catch (_ignored) {
    return { lastOpenedGameRoot: '' };
  }
}

function saveAppPrefs(nextPrefs) {
  const payload = {
    lastOpenedGameRoot: nextPrefs && typeof nextPrefs === 'object'
      ? String(nextPrefs.lastOpenedGameRoot || '').trim()
      : ''
  };

  try {
    fs.writeFileSync(APP_PREFS_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  } catch (_ignored) {
    // Non-fatal; app still works without persisted preference.
  }
}

function rememberLastOpenedGameRoot(gameRoot) {
  const normalized = String(gameRoot || '').trim();
  if (!normalized) return;
  if (appPrefs.lastOpenedGameRoot === normalized) return;

  appPrefs.lastOpenedGameRoot = normalized;
  saveAppPrefs(appPrefs);
}

function parseCliArgs(args) {
  const out = {};

  for (let i = 0; i < args.length; i += 1) {
    const value = args[i];
    if (value === '--port' && i + 1 < args.length) {
      out.port = args[i + 1];
      i += 1;
      continue;
    }
  }

  return out;
}

function resolvePort(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 65535) {
    return 47842;
  }
  return parsed;
}

function setElectronBridge(bridge) {
  if (!bridge || typeof bridge !== 'object') {
    electronBridge = null;
    return;
  }
  electronBridge = bridge;
}

function sanitizeProject(project) {
  if (!project) return null;

  return {
    engine: project.engine,
    gameRoot: project.gameRoot,
    jsDir: project.jsDir,
    pluginsDir: project.pluginsDir,
    pluginsJsPath: project.pluginsJsPath,
    displayPath: project.displayPath,
    statePath: project.statePath
  };
}

function stateSnapshot() {
  return {
    folders: Array.isArray(session.state.folders) ? session.state.folders : [],
    pluginFolderMap: session.state.pluginFolderMap && typeof session.state.pluginFolderMap === 'object'
      ? session.state.pluginFolderMap
      : {},
    pluginTags: session.state.pluginTags && typeof session.state.pluginTags === 'object'
      ? session.state.pluginTags
      : {},
    folderCollapsed: session.state.folderCollapsed && typeof session.state.folderCollapsed === 'object'
      ? session.state.folderCollapsed
      : {},
    managerLayout: session.state.managerLayout && typeof session.state.managerLayout === 'object'
      ? session.state.managerLayout
      : null
  };
}

function sanitizeSettingsSourcePlugins(value) {
  const list = Array.isArray(value) ? value : [];
  const out = [];
  const used = new Set();

  for (let i = 0; i < list.length; i += 1) {
    const row = list[i] && typeof list[i] === 'object' ? list[i] : {};
    const key = String(row.key || '').trim();
    if (!key || used.has(key)) continue;

    const fallbackName = String(key.split('::')[0] || '').trim();
    const name = String(row.name || '').trim() || fallbackName;
    if (!name) continue;

    used.add(key);
    out.push({ key, name });
  }

  return out;
}

function sanitizeSettingsBundle(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};

  const sanitizedState = sanitizeState({
    version: 2,
    folders: source.folders,
    pluginFolderMap: source.pluginFolderMap,
    pluginTags: source.pluginTags,
    folderCollapsed: source.folderCollapsed,
    managerLayout: source.managerLayout
  });

  return {
    version: 1,
    sourcePlugins: sanitizeSettingsSourcePlugins(source.sourcePlugins),
    folders: sanitizedState.folders,
    pluginFolderMap: sanitizedState.pluginFolderMap,
    pluginTags: sanitizedState.pluginTags,
    folderCollapsed: sanitizedState.folderCollapsed,
    managerLayout: sanitizedState.managerLayout
  };
}

function legacyStateSnapshot() {
  const state = stateSnapshot();

  return {
    groups: state.folders.map((folder) => ({
      id: folder.id === 'ungrouped' ? 'default' : folder.id,
      name: folder.name
    })),
    pluginToGroup: Object.keys(state.pluginFolderMap).reduce((acc, pluginName) => {
      const folderId = state.pluginFolderMap[pluginName] === 'ungrouped'
        ? 'default'
        : String(state.pluginFolderMap[pluginName] || 'default');
      acc[pluginName] = folderId;
      return acc;
    }, {})
  };
}

function pluginSnapshot() {
  const legacy = legacyStateSnapshot();
  return {
    project: sanitizeProject(session.project),
    plugins: session.plugins,
    pluginsFileSignature: getPluginsFileSignature(session.project ? session.project.pluginsJsPath : ''),
    state: stateSnapshot(),
    groups: legacy.groups,
    pluginToGroup: legacy.pluginToGroup
  };
}

function buildPluginKey(plugin) {
  const source = plugin && typeof plugin === 'object' ? plugin : {};
  return `${String(source.name || '')}::${String(source.description || '')}`;
}

function normalizePluginParameters(parameters) {
  const source = parameters && typeof parameters === 'object' ? parameters : {};
  const out = {};

  Object.keys(source).forEach((key) => {
    const raw = source[key];
    out[String(key)] = raw === undefined || raw === null ? '' : String(raw);
  });

  return out;
}

function getPluginsFileSignature(filePath) {
  const targetPath = String(filePath || '').trim();
  if (!targetPath) {
    return {
      exists: false,
      size: 0,
      mtimeMs: 0,
      key: 'missing'
    };
  }

  try {
    const stats = fs.statSync(targetPath);
    if (!stats.isFile()) {
      return {
        exists: false,
        size: 0,
        mtimeMs: 0,
        key: 'missing'
      };
    }

    const size = Number(stats.size) || 0;
    const mtimeMs = Number(stats.mtimeMs) || 0;

    return {
      exists: true,
      size,
      mtimeMs,
      key: `${size}:${mtimeMs}`
    };
  } catch (_err) {
    return {
      exists: false,
      size: 0,
      mtimeMs: 0,
      key: 'missing'
    };
  }
}

function getSystemJsonPathForProject(project) {
  if (!project || !project.gameRoot) return '';

  if (String(project.engine || '').toUpperCase() === 'MV') {
    return path.join(project.gameRoot, 'www', 'data', 'System.json');
  }

  return path.join(project.gameRoot, 'data', 'System.json');
}

function toggleSystemJsonTrailingSpace(project) {
  const systemPath = getSystemJsonPathForProject(project);
  if (!systemPath) {
    return {
      found: false,
      touched: false,
      path: ''
    };
  }

  try {
    if (!fs.existsSync(systemPath)) {
      return {
        found: false,
        touched: false,
        path: systemPath
      };
    }

    const text = fs.readFileSync(systemPath, 'utf8');
    const braceIndex = text.lastIndexOf('}');
    if (braceIndex <= 0) {
      return {
        found: true,
        touched: false,
        path: systemPath,
        added: false,
        removed: false
      };
    }

    const hasSpace = text[braceIndex - 1] === ' ';
    const nextText = hasSpace
      ? `${text.slice(0, braceIndex - 1)}${text.slice(braceIndex)}`
      : `${text.slice(0, braceIndex)} ${text.slice(braceIndex)}`;

    if (nextText !== text) {
      fs.writeFileSync(systemPath, nextText, 'utf8');
    }

    return {
      found: true,
      touched: nextText !== text,
      path: systemPath,
      added: !hasSpace,
      removed: hasSpace
    };
  } catch (err) {
    return {
      found: true,
      touched: false,
      path: systemPath,
      error: err.message || String(err)
    };
  }
}

function sanitizePluginParameterEntries(value) {
  const list = Array.isArray(value) ? value : [];
  const out = [];
  const used = new Set();

  for (let i = 0; i < list.length; i += 1) {
    const row = list[i] && typeof list[i] === 'object' ? list[i] : {};
    const key = String(row.key || '').trim();
    const name = String(row.name || '').trim();
    const parameters = normalizePluginParameters(row.parameters);

    if (!key && !name) continue;

    const dedupeKey = key || `name:${name.toLowerCase()}`;
    if (used.has(dedupeKey)) continue;
    used.add(dedupeKey);

    out.push({
      key,
      name,
      parameters
    });
  }

  return out;
}

function sanitizeParameterFileNameStem(value) {
  const raw = String(value || '').trim();
  const sanitized = raw.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim();
  return sanitized || 'Plugin';
}

function buildParametersExportFileName(pluginName) {
  return `${PARAMETERS_EXPORT_PREFIX}${sanitizeParameterFileNameStem(pluginName)}.json`;
}

function buildParametersExportFilePath(pluginName) {
  return path.join(ROOT_DIR, buildParametersExportFileName(pluginName));
}

function loadProjectIntoSession(project) {
  const loaded = loadPluginsFile(project.pluginsJsPath);

  session.project = project;
  session.plugins = loaded.plugins;
  session.lineEnding = loaded.lineEnding;
  session.state = loadState(project.statePath);
  session.dataCatalog = null;

  return pluginSnapshot();
}

function tryAutoDetectProject(candidatesOverride) {
  const preferredRoot = String(appPrefs.lastOpenedGameRoot || '').trim();
  if (preferredRoot) {
    const preferredProject = resolveFromInputPath(preferredRoot);
    if (preferredProject) {
      try {
        return loadProjectIntoSession(preferredProject);
      } catch (_ignored) {
        // Fallback to regular detection below.
      }
    }
  }

  const candidates = Array.isArray(candidatesOverride) && candidatesOverride.length > 0
    ? candidatesOverride
    : [
      process.cwd(),
      ROOT_DIR,
      __dirname
    ];

  const project = detectFromCandidates(candidates);
  if (!project) return null;

  try {
    return loadProjectIntoSession(project);
  } catch (err) {
    return null;
  }
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 10 * 1024 * 1024) {
        reject(new Error('Request too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (chunks.length <= 0) {
        resolve({});
        return;
      }

      try {
        const body = Buffer.concat(chunks).toString('utf8');
        const parsed = JSON.parse(body);
        resolve(parsed && typeof parsed === 'object' ? parsed : {});
      } catch (err) {
        reject(new Error('Invalid JSON body'));
      }
    });

    req.on('error', (err) => reject(err));
  });
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

function sendApiError(res, statusCode, message, details) {
  sendJson(res, statusCode, {
    ok: false,
    error: message,
    details: details || null
  });
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendApiError(res, 404, 'File not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': 'no-store'
    });
    res.end(data);
  });
}

function ensureProjectLoaded(res) {
  if (session.project) return true;

  const detected = tryAutoDetectProject();
  if (detected) return true;

  sendApiError(res, 400, 'No RPG Maker project loaded');
  return false;
}

function openFolderPickerDialog() {
  if (electronBridge && typeof electronBridge.pickDirectory === 'function') {
    return Promise.resolve(electronBridge.pickDirectory({
      title: 'Select RPG Maker folder (MV: www/game root, MZ: game root).'
    })).then((picked) => String(picked || '').trim());
  }

  return new Promise((resolve, reject) => {
    const script = [
      'Add-Type -AssemblyName System.Windows.Forms;',
      '$dialog = New-Object System.Windows.Forms.FolderBrowserDialog;',
      '$dialog.Description = "Select RPG Maker folder (MV: www/game root, MZ: game root).";',
      '$dialog.ShowNewFolderButton = $false;',
      '$result = $dialog.ShowDialog();',
      'if ($result -eq [System.Windows.Forms.DialogResult]::OK) { [Console]::Out.Write($dialog.SelectedPath) }'
    ].join(' ');

    childProcess.execFile(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script],
      {
        windowsHide: true,
        maxBuffer: 1024 * 1024
      },
      (err, stdout) => {
        if (err && !stdout) {
          reject(new Error('Failed to open folder dialog'));
          return;
        }

        resolve(String(stdout || '').trim());
      }
    );
  });
}

function openPluginFilePickerDialog(pluginsDir) {
  const targetPluginsDir = path.resolve(String(pluginsDir || ''));

  if (electronBridge && typeof electronBridge.pickPluginFile === 'function') {
    return Promise.resolve(electronBridge.pickPluginFile({
      title: 'Select plugin .js file',
      defaultPath: targetPluginsDir
    })).then((picked) => String(picked || '').trim());
  }

  return new Promise((resolve, reject) => {
    const escapedDir = targetPluginsDir.replace(/'/g, "''");
    const script = [
      'Add-Type -AssemblyName System.Windows.Forms;',
      '$dialog = New-Object System.Windows.Forms.OpenFileDialog;',
      '$dialog.Filter = "JavaScript Plugin (*.js)|*.js";',
      `$dialog.InitialDirectory = '${escapedDir}';`,
      '$dialog.Multiselect = $false;',
      '$result = $dialog.ShowDialog();',
      'if ($result -eq [System.Windows.Forms.DialogResult]::OK) { [Console]::Out.Write($dialog.FileName) }'
    ].join(' ');

    childProcess.execFile(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script],
      {
        windowsHide: true,
        maxBuffer: 1024 * 1024
      },
      (err, stdout) => {
        if (err && !stdout) {
          reject(new Error('Failed to open plugin file dialog'));
          return;
        }

        resolve(String(stdout || '').trim());
      }
    );
  });
}

function resolveRuntimeRoot(project) {
  if (!project || !project.jsDir) return null;
  return path.resolve(project.jsDir, '..');
}

function safeReadJsonFile(filePath, fallback) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    return fallback;
  }
}

function toEntryListFromDataArray(value) {
  const source = Array.isArray(value) ? value : [];
  const out = [];

  for (let i = 0; i < source.length; i += 1) {
    const row = source[i];
    if (!row || typeof row !== 'object') continue;

    const id = Number(row.id);
    if (!Number.isFinite(id) || id <= 0) continue;

    const name = String(row.name || '').trim() || `(ID ${id})`;
    out.push({ id, name });
  }

  out.sort((a, b) => a.id - b.id);
  return out;
}

function toEntryListFromSystemNames(value) {
  const source = Array.isArray(value) ? value : [];
  const out = [];

  for (let i = 1; i < source.length; i += 1) {
    const raw = source[i];
    const id = i;
    const name = String(raw || '').trim() || `(ID ${id})`;
    out.push({ id, name });
  }

  return out;
}

function loadDataCatalogForProject(project) {
  const runtimeRoot = resolveRuntimeRoot(project);
  const dataDir = runtimeRoot ? path.join(runtimeRoot, 'data') : '';

  if (!runtimeRoot || !fs.existsSync(dataDir)) {
    return {
      runtimeRoot: runtimeRoot || '',
      dataDir,
      loaded: false,
      entries: {}
    };
  }

  const files = {
    actor: 'Actors.json',
    class: 'Classes.json',
    skill: 'Skills.json',
    item: 'Items.json',
    weapon: 'Weapons.json',
    armor: 'Armors.json',
    enemy: 'Enemies.json',
    troop: 'Troops.json',
    state: 'States.json',
    tileset: 'Tilesets.json',
    animation: 'Animations.json',
    common_event: 'CommonEvents.json'
  };

  const entries = {};
  Object.keys(files).forEach((typeKey) => {
    const filePath = path.join(dataDir, files[typeKey]);
    entries[typeKey] = toEntryListFromDataArray(safeReadJsonFile(filePath, []));
  });

  const systemJson = safeReadJsonFile(path.join(dataDir, 'System.json'), {});
  entries.switch = toEntryListFromSystemNames(systemJson.switches);
  entries.variable = toEntryListFromSystemNames(systemJson.variables);

  return {
    runtimeRoot,
    dataDir,
    loaded: true,
    entries
  };
}

function ensureDataCatalog(forceReload) {
  if (!session.project) {
    return {
      runtimeRoot: '',
      dataDir: '',
      loaded: false,
      entries: {}
    };
  }

  if (!forceReload && session.dataCatalog) {
    return session.dataCatalog;
  }

  session.dataCatalog = loadDataCatalogForProject(session.project);
  return session.dataCatalog;
}

function listRuntimeFiles(project, relativeDir) {
  const runtimeRoot = resolveRuntimeRoot(project);
  const rawRelativeDir = String(relativeDir || '').replace(/\\+/g, '/').replace(/^\/+/, '');

  if (!runtimeRoot) {
    return {
      runtimeRoot: '',
      dir: rawRelativeDir,
      entries: []
    };
  }

  const targetDir = path.resolve(runtimeRoot, rawRelativeDir || '.');
  if (!targetDir.toLowerCase().startsWith(runtimeRoot.toLowerCase())) {
    return {
      runtimeRoot,
      dir: rawRelativeDir,
      entries: []
    };
  }

  let stats;
  try {
    stats = fs.statSync(targetDir);
  } catch (err) {
    return {
      runtimeRoot,
      dir: rawRelativeDir,
      entries: []
    };
  }

  if (!stats.isDirectory()) {
    return {
      runtimeRoot,
      dir: rawRelativeDir,
      entries: []
    };
  }

  const out = [];
  const stack = [{ dir: targetDir, depth: 0 }];

  while (stack.length > 0 && out.length < 5000) {
    const current = stack.pop();
    if (!current) continue;
    if (current.depth > 7) continue;

    let entries;
    try {
      entries = fs.readdirSync(current.dir, { withFileTypes: true });
    } catch (err) {
      continue;
    }

    entries.sort((a, b) => a.name.localeCompare(b.name));

    for (let i = 0; i < entries.length; i += 1) {
      const row = entries[i];
      const absolute = path.join(current.dir, row.name);

      if (row.isDirectory()) {
        stack.push({ dir: absolute, depth: current.depth + 1 });
        continue;
      }

      if (!row.isFile()) continue;

      const relativeToRuntime = path.relative(runtimeRoot, absolute).replace(/\\+/g, '/');
      out.push(relativeToRuntime);
      if (out.length >= 5000) break;
    }
  }

  out.sort((a, b) => a.localeCompare(b));

  return {
    runtimeRoot,
    dir: rawRelativeDir,
    entries: out
  };
}

async function handleApi(req, res, requestUrl) {
  const pathname = requestUrl.pathname;

  if (req.method === 'GET' && pathname === '/api/bootstrap') {
    if (!session.project) {
      tryAutoDetectProject();
    }

    sendJson(res, 200, {
      ok: true,
      appName: APP_NAME,
      version: APP_VERSION,
      runningInElectron: Boolean(electronBridge),
      ...pluginSnapshot()
    });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/detect') {
    const loaded = tryAutoDetectProject();
    sendJson(res, 200, {
      ok: true,
      detected: Boolean(loaded),
      ...pluginSnapshot()
    });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/open-project') {
    const body = await readJsonBody(req);
    const sourcePath = String(body.path || '').trim();

    if (!sourcePath) {
      sendApiError(res, 400, 'Missing path');
      return;
    }

    const project = resolveFromInputPath(sourcePath);
    if (!project) {
      sendApiError(res, 400, 'Could not detect MV/MZ project from selected path');
      return;
    }

    try {
      const loaded = loadProjectIntoSession(project);
      sendJson(res, 200, {
        ok: true,
        ...loaded
      });
      return;
    } catch (err) {
      sendApiError(res, 500, 'Failed to load project', err.message);
      return;
    }
  }

  if (req.method === 'POST' && pathname === '/api/select-game-folder') {
    try {
      const selectedPath = await openFolderPickerDialog();

      if (!selectedPath) {
        sendJson(res, 200, {
          ok: true,
          selected: false
        });
        return;
      }

      const project = resolveFromInputPath(selectedPath);
      if (!project) {
        sendJson(res, 200, {
          ok: true,
          selected: true,
          selectedPath,
          detected: false,
          message: 'Folder selected, but no MV/MZ project detected there.'
        });
        return;
      }

      const loaded = loadProjectIntoSession(project);
      sendJson(res, 200, {
        ok: true,
        selected: true,
        selectedPath,
        detected: true,
        ...loaded
      });
    } catch (err) {
      sendApiError(res, 500, 'Folder picker failed', err.message);
    }
    return;
  }

  if (req.method === 'POST' && pathname === '/api/select-plugin-file') {
    if (!ensureProjectLoaded(res)) return;

    try {
      const selectedPath = await openPluginFilePickerDialog(session.project.pluginsDir);

      if (!selectedPath) {
        sendJson(res, 200, {
          ok: true,
          selected: false
        });
        return;
      }

      const normalizedPluginsDir = path.resolve(session.project.pluginsDir);
      const normalizedSelectedPath = path.resolve(selectedPath);
      const relative = path.relative(normalizedPluginsDir, normalizedSelectedPath).replace(/\\+/g, '/');
      const insidePlugins = Boolean(relative) && !relative.startsWith('..') && !path.isAbsolute(relative);

      if (!insidePlugins || !/\.js$/i.test(relative)) {
        sendJson(res, 200, {
          ok: true,
          selected: true,
          detected: false,
          selectedPath,
          message: 'Selected file is not a .js plugin under current js/plugins folder.'
        });
        return;
      }

      const pluginName = relative.replace(/\.js$/i, '');
      sendJson(res, 200, {
        ok: true,
        selected: true,
        detected: true,
        selectedPath,
        pluginName,
        existsInList: session.plugins.some((plugin) => String(plugin.name || '').trim() === pluginName)
      });
    } catch (err) {
      sendApiError(res, 500, 'Plugin file picker failed', err.message);
    }
    return;
  }

  if (req.method === 'POST' && pathname === '/api/plugins/save') {
    if (!ensureProjectLoaded(res)) return;

    const body = await readJsonBody(req);
    const plugins = Array.isArray(body.plugins) ? body.plugins.map(normalizePluginEntry) : null;

    if (!plugins) {
      sendApiError(res, 400, 'Invalid plugins payload');
      return;
    }

    try {
      savePluginsFile(session.project.pluginsJsPath, plugins, session.lineEnding);
      session.plugins = plugins;
      const systemJsonTouch = toggleSystemJsonTrailingSpace(session.project);
      const pluginsFileSignature = getPluginsFileSignature(session.project.pluginsJsPath);

      sendJson(res, 200, {
        ok: true,
        count: plugins.length,
        pluginsFileSignature,
        systemJsonTouch
      });
    } catch (err) {
      sendApiError(res, 500, 'Failed saving plugins.js', err.message);
    }
    return;
  }

  if (req.method === 'GET' && pathname === '/api/plugins/signature') {
    if (!ensureProjectLoaded(res)) return;

    sendJson(res, 200, {
      ok: true,
      pluginsJsPath: session.project.pluginsJsPath,
      pluginsFileSignature: getPluginsFileSignature(session.project.pluginsJsPath)
    });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/plugins/parameters/save') {
    if (!ensureProjectLoaded(res)) return;

    const body = await readJsonBody(req);
    const entries = sanitizePluginParameterEntries(body.entries);

    if (entries.length <= 0) {
      sendApiError(res, 400, 'Invalid plugin-parameter save payload');
      return;
    }

    try {
      const loaded = loadPluginsFile(session.project.pluginsJsPath);
      const diskPlugins = Array.isArray(loaded.plugins)
        ? loaded.plugins.map((plugin) => normalizePluginEntry(plugin))
        : [];

      const indexByKey = new Map();
      const indexesByNameToken = new Map();

      for (let i = 0; i < diskPlugins.length; i += 1) {
        const plugin = diskPlugins[i];
        const key = buildPluginKey(plugin);
        const nameToken = String(plugin.name || '').trim().toLowerCase();
        indexByKey.set(key, i);

        if (!nameToken) continue;
        if (!indexesByNameToken.has(nameToken)) {
          indexesByNameToken.set(nameToken, []);
        }
        indexesByNameToken.get(nameToken).push(i);
      }

      const savedPluginNames = [];
      const missingPluginNames = [];
      const touchedDiskIndexes = new Set();

      for (let i = 0; i < entries.length; i += 1) {
        const row = entries[i];
        const key = String(row.key || '').trim();
        const name = String(row.name || '').trim();
        const nameToken = name.toLowerCase();

        let targetIndex = -1;
        if (key && indexByKey.has(key)) {
          targetIndex = Number(indexByKey.get(key));
        } else if (nameToken && indexesByNameToken.has(nameToken)) {
          const indexes = indexesByNameToken.get(nameToken) || [];
          if (indexes.length === 1) {
            targetIndex = Number(indexes[0]);
          }
        }

        if (targetIndex < 0 || targetIndex >= diskPlugins.length) {
          missingPluginNames.push(name || key || `Plugin #${i + 1}`);
          continue;
        }

        diskPlugins[targetIndex].parameters = normalizePluginParameters(row.parameters);
        touchedDiskIndexes.add(targetIndex);

        const diskPlugin = diskPlugins[targetIndex];
        savedPluginNames.push(String(diskPlugin.name || name || key || `Plugin #${i + 1}`));

        const targetKey = buildPluginKey(diskPlugin);
        const sessionIndex = session.plugins.findIndex((plugin) => buildPluginKey(plugin) === targetKey);
        if (sessionIndex >= 0) {
          session.plugins[sessionIndex].parameters = normalizePluginParameters(row.parameters);
        }
      }

      if (touchedDiskIndexes.size > 0) {
        savePluginsFile(session.project.pluginsJsPath, diskPlugins, loaded.lineEnding || session.lineEnding);
      }

      const systemJsonTouch = touchedDiskIndexes.size > 0
        ? toggleSystemJsonTrailingSpace(session.project)
        : {
          found: Boolean(getSystemJsonPathForProject(session.project)),
          touched: false,
          path: getSystemJsonPathForProject(session.project)
        };

      sendJson(res, 200, {
        ok: true,
        savedPluginNames,
        missingPluginNames,
        savedCount: touchedDiskIndexes.size,
        pluginsFileSignature: getPluginsFileSignature(session.project.pluginsJsPath),
        systemJsonTouch
      });
    } catch (err) {
      sendApiError(res, 500, 'Failed saving selected plugin parameters', err.message);
    }

    return;
  }

  if (req.method === 'POST' && pathname === '/api/plugins/parameters/export') {
    if (!ensureProjectLoaded(res)) return;

    const body = await readJsonBody(req);
    const entries = sanitizePluginParameterEntries(body.entries);

    if (entries.length <= 0) {
      sendApiError(res, 400, 'Invalid plugin-parameter export payload');
      return;
    }

    const exported = [];
    const failed = [];

    for (let i = 0; i < entries.length; i += 1) {
      const row = entries[i];
      const key = String(row.key || '').trim();
      const fallbackName = String(key.split('::')[0] || '').trim();
      const pluginName = String(row.name || fallbackName || `Plugin${i + 1}`).trim();
      const fileName = buildParametersExportFileName(pluginName);
      const filePath = path.join(ROOT_DIR, fileName);

      try {
        const payload = {
          pluginName,
          pluginKey: key,
          parameters: normalizePluginParameters(row.parameters)
        };
        fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
        exported.push({ pluginName, fileName, filePath });
      } catch (err) {
        failed.push({
          pluginName,
          fileName,
          error: err.message || String(err)
        });
      }
    }

    sendJson(res, 200, {
      ok: true,
      exported,
      failed
    });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/plugins/parameters/import') {
    if (!ensureProjectLoaded(res)) return;

    const body = await readJsonBody(req);
    let entries = sanitizePluginParameterEntries(body.entries);

    if (entries.length <= 0 && Array.isArray(body.pluginNames)) {
      entries = body.pluginNames.map((rawName) => ({
        key: '',
        name: String(rawName || '').trim(),
        parameters: {}
      })).filter((row) => Boolean(row.name));
    }

    if (entries.length <= 0) {
      sendApiError(res, 400, 'Invalid plugin-parameter import payload');
      return;
    }

    const imported = [];
    const missing = [];
    const failed = [];

    for (let i = 0; i < entries.length; i += 1) {
      const row = entries[i];
      const key = String(row.key || '').trim();
      const fallbackName = String(key.split('::')[0] || '').trim();
      const pluginName = String(row.name || fallbackName || '').trim();
      if (!pluginName) {
        missing.push({
          pluginName: key || `Plugin #${i + 1}`,
          fileName: buildParametersExportFileName(key || `Plugin${i + 1}`)
        });
        continue;
      }

      const fileName = buildParametersExportFileName(pluginName);
      const filePath = buildParametersExportFilePath(pluginName);

      try {
        if (!fs.existsSync(filePath)) {
          missing.push({ pluginName, fileName, filePath });
          continue;
        }

        const raw = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(raw);
        const source = parsed && typeof parsed === 'object' ? parsed : {};
        const parametersSource = source.parameters && typeof source.parameters === 'object'
          ? source.parameters
          : source;

        imported.push({
          key,
          pluginName,
          parameters: normalizePluginParameters(parametersSource),
          fileName,
          filePath
        });
      } catch (err) {
        failed.push({
          pluginName,
          fileName,
          filePath,
          error: err.message || String(err)
        });
      }
    }

    sendJson(res, 200, {
      ok: true,
      imported,
      missing,
      failed
    });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/plugins/backup') {
    if (!ensureProjectLoaded(res)) return;

    try {
      const result = backupPluginsFile(session.project.pluginsJsPath);
      sendJson(res, 200, {
        ok: true,
        backupPath: result.backupPath,
        backupFileName: result.backupFileName
      });
    } catch (err) {
      sendApiError(res, 500, 'Failed creating plugins.js backup', err.message);
    }
    return;
  }

  if (req.method === 'POST' && pathname === '/api/groups/save') {
    if (!ensureProjectLoaded(res)) return;

    const body = await readJsonBody(req);
    const nextState = sanitizeState({
      version: 1,
      groups: body.groups,
      pluginToGroup: body.pluginToGroup
    });

    try {
      session.state = saveState(session.project.statePath, nextState);
      const legacy = legacyStateSnapshot();
      sendJson(res, 200, {
        ok: true,
        state: stateSnapshot(),
        groups: legacy.groups,
        pluginToGroup: legacy.pluginToGroup
      });
    } catch (err) {
      sendApiError(res, 500, 'Failed saving group state', err.message);
    }
    return;
  }

  if (req.method === 'GET' && pathname === '/api/state') {
    if (!ensureProjectLoaded(res)) return;

    const legacy = legacyStateSnapshot();
    sendJson(res, 200, {
      ok: true,
      state: stateSnapshot(),
      groups: legacy.groups,
      pluginToGroup: legacy.pluginToGroup
    });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/state/save') {
    if (!ensureProjectLoaded(res)) return;

    const body = await readJsonBody(req);
    const nextState = sanitizeState(body && typeof body.state === 'object' ? body.state : body);

    try {
      session.state = saveState(session.project.statePath, nextState);
      if (session.state.managerLayout && typeof session.state.managerLayout === 'object') {
        const preferredRoot = String(session.state.managerLayout.lastOpenedGameRoot || '').trim();
        if (preferredRoot) {
          rememberLastOpenedGameRoot(preferredRoot);
        }
      }

      const legacy = legacyStateSnapshot();
      sendJson(res, 200, {
        ok: true,
        state: stateSnapshot(),
        groups: legacy.groups,
        pluginToGroup: legacy.pluginToGroup
      });
    } catch (err) {
      sendApiError(res, 500, 'Failed saving state', err.message);
    }
    return;
  }

  if (req.method === 'POST' && pathname === '/api/settings/export') {
    if (!ensureProjectLoaded(res)) return;

    const body = await readJsonBody(req);
    const source = body && typeof body.settings === 'object' ? body.settings : body;
    const settings = sanitizeSettingsBundle(source);

    try {
      fs.writeFileSync(SETTINGS_FILE_PATH, `${JSON.stringify(settings, null, 2)}\n`, 'utf8');
      sendJson(res, 200, {
        ok: true,
        settingsPath: SETTINGS_FILE_PATH,
        settings
      });
    } catch (err) {
      sendApiError(res, 500, 'Failed writing ProgramSettings.json', err.message);
    }
    return;
  }

  if (req.method === 'POST' && pathname === '/api/settings/import') {
    if (!ensureProjectLoaded(res)) return;

    try {
      if (!fs.existsSync(SETTINGS_FILE_PATH)) {
        sendApiError(res, 404, 'ProgramSettings.json not found in program folder');
        return;
      }

      const raw = fs.readFileSync(SETTINGS_FILE_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      const settings = sanitizeSettingsBundle(parsed);

      sendJson(res, 200, {
        ok: true,
        settingsPath: SETTINGS_FILE_PATH,
        settings
      });
    } catch (err) {
      sendApiError(res, 500, 'Failed reading ProgramSettings.json', err.message);
    }
    return;
  }

  if (req.method === 'GET' && pathname === '/api/data-catalog') {
    if (!ensureProjectLoaded(res)) return;

    const refreshFlag = String(requestUrl.searchParams.get('refresh') || '').trim().toLowerCase();
    const forceReload = refreshFlag === '1' || refreshFlag === 'true' || refreshFlag === 'yes';
    const catalog = ensureDataCatalog(forceReload);

    sendJson(res, 200, {
      ok: true,
      loaded: Boolean(catalog.loaded),
      runtimeRoot: catalog.runtimeRoot,
      dataDir: catalog.dataDir,
      entries: catalog.entries || {}
    });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/files/list') {
    if (!ensureProjectLoaded(res)) return;

    const relativeDir = String(requestUrl.searchParams.get('dir') || '');
    const listed = listRuntimeFiles(session.project, relativeDir);

    sendJson(res, 200, {
      ok: true,
      runtimeRoot: listed.runtimeRoot,
      dir: listed.dir,
      entries: listed.entries
    });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/plugin-metadata') {
    if (!ensureProjectLoaded(res)) return;

    const pluginName = String(requestUrl.searchParams.get('pluginName') || '').trim();
    if (!pluginName) {
      sendApiError(res, 400, 'Missing pluginName');
      return;
    }

    const pluginFilePath = resolvePluginFilePath(session.project, pluginName);
    if (!pluginFilePath) {
      sendJson(res, 200, {
        ok: true,
        found: false,
        pluginName
      });
      return;
    }

    try {
      const parsed = readPluginSchema(pluginFilePath);
      sendJson(res, 200, {
        ok: true,
        found: true,
        pluginName,
        pluginFilePath,
        metadata: parsed.metadata,
        schema: parsed.schema,
        helpText: parsed.helpText,
        structMetadata: parsed.structMetadata,
        structSchema: parsed.structSchema
      });
    } catch (err) {
      sendApiError(res, 500, 'Failed reading plugin schema', err.message);
    }
    return;
  }

  if (req.method === 'POST' && pathname === '/api/plugin-schema/save') {
    if (!ensureProjectLoaded(res)) return;

    const body = await readJsonBody(req);
    const pluginName = String(body.pluginName || '').trim();
    const schema = normalizeSchema(body.schema);

    if (!pluginName) {
      sendApiError(res, 400, 'Missing pluginName');
      return;
    }

    const pluginFilePath = resolvePluginFilePath(session.project, pluginName);
    if (!pluginFilePath) {
      sendApiError(res, 404, `Plugin file not found for ${pluginName}`);
      return;
    }

    try {
      const parsed = writePluginSchema(pluginFilePath, schema);
      sendJson(res, 200, {
        ok: true,
        pluginName,
        pluginFilePath,
        metadata: parsed.metadata,
        schema: parsed.schema,
        helpText: parsed.helpText,
        structMetadata: parsed.structMetadata,
        structSchema: parsed.structSchema
      });
    } catch (err) {
      sendApiError(res, 500, 'Failed saving plugin schema', err.message);
    }
    return;
  }

  if (req.method === 'POST' && pathname === '/api/plugin-struct-schema/save') {
    if (!ensureProjectLoaded(res)) return;

    const body = await readJsonBody(req);
    const pluginName = String(body.pluginName || '').trim();
    const structSchema = normalizeStructSchemaMap(body.structSchema);

    if (!pluginName) {
      sendApiError(res, 400, 'Missing pluginName');
      return;
    }

    const pluginFilePath = resolvePluginFilePath(session.project, pluginName);
    if (!pluginFilePath) {
      sendApiError(res, 404, `Plugin file not found for ${pluginName}`);
      return;
    }

    try {
      const parsed = writePluginStructSchema(pluginFilePath, structSchema);
      sendJson(res, 200, {
        ok: true,
        pluginName,
        pluginFilePath,
        metadata: parsed.metadata,
        schema: parsed.schema,
        helpText: parsed.helpText,
        structMetadata: parsed.structMetadata,
        structSchema: parsed.structSchema
      });
    } catch (err) {
      sendApiError(res, 500, 'Failed saving struct schema', err.message);
    }
    return;
  }

  if (req.method === 'GET' && pathname === '/api/reload') {
    if (!ensureProjectLoaded(res)) return;

    try {
      const loaded = loadProjectIntoSession(session.project);
      sendJson(res, 200, {
        ok: true,
        ...loaded
      });
    } catch (err) {
      sendApiError(res, 500, 'Failed reloading project files', err.message);
    }
    return;
  }

  sendApiError(res, 404, 'API route not found');
}

function createHttpServer() {
  return http.createServer(async (req, res) => {
    try {
      const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

      if (requestUrl.pathname.startsWith('/api/')) {
        await handleApi(req, res, requestUrl);
        return;
      }

      const requested = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname;
      const unsafePath = path.join(PUBLIC_DIR, requested.replace(/^\/+/, ''));
      const safePath = path.normalize(unsafePath);

      if (!safePath.startsWith(PUBLIC_DIR)) {
        sendApiError(res, 403, 'Forbidden path');
        return;
      }

      sendFile(res, safePath);
    } catch (err) {
      sendApiError(res, 500, 'Unhandled server error', err.message);
    }
  });
}

function startServer(options) {
  const opts = options && typeof options === 'object' ? options : {};

  if (opts.electronBridge) {
    setElectronBridge(opts.electronBridge);
  }

  if (activeServer && activeServer.server && activeServer.server.listening) {
    return Promise.resolve({
      port: activeServer.port,
      url: activeServer.url,
      close: () => stopServer(activeServer.server)
    });
  }

  const requestedPort = resolvePort(opts.port !== undefined ? opts.port : cli.port);
  const server = createHttpServer();

  return new Promise((resolve, reject) => {
    const onError = (err) => {
      reject(err);
    };

    server.once('error', onError);
    server.listen(requestedPort, () => {
      server.removeListener('error', onError);

      if (opts.autoDetect !== false) {
        tryAutoDetectProject(opts.autoDetectCandidates);
      }

      const address = server.address();
      const boundPort = address && typeof address === 'object' ? address.port : requestedPort;
      const url = `http://localhost:${boundPort}`;
      const mode = session.project ? `detected ${session.project.engine}` : 'no project detected';

      activeServer = {
        server,
        port: boundPort,
        url
      };

      console.log(`[${APP_NAME}] v${APP_VERSION} listening at ${url} (${mode})`);

      resolve({
        port: boundPort,
        url,
        close: () => stopServer(server)
      });
    });
  });
}

function stopServer(serverRef) {
  const target = serverRef || (activeServer && activeServer.server);
  if (!target) return Promise.resolve();

  return new Promise((resolve, reject) => {
    if (!target.listening) {
      if (activeServer && activeServer.server === target) {
        activeServer = null;
      }
      resolve();
      return;
    }

    target.close((err) => {
      if (err) {
        reject(err);
        return;
      }

      if (activeServer && activeServer.server === target) {
        activeServer = null;
      }
      resolve();
    });
  });
}

module.exports = {
  APP_NAME,
  APP_VERSION,
  ROOT_DIR,
  PUBLIC_DIR,
  startServer,
  stopServer,
  setElectronBridge,
  session
};

if (require.main === module) {
  startServer({
    port: cli.port
  }).catch((err) => {
    console.error(`[${APP_NAME}] failed to start server: ${err && err.message ? err.message : err}`);
    process.exitCode = 1;
  });
}

'use strict';

const fs = require('fs');
const path = require('path');

function isFile(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
}

function isDir(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch (err) {
    return false;
  }
}

function buildProject(engine, gameRoot, jsDir, sourcePath) {
  const normalizedRoot = path.resolve(gameRoot);
  const normalizedJsDir = path.resolve(jsDir);

  return {
    engine,
    gameRoot: normalizedRoot,
    jsDir: normalizedJsDir,
    pluginsDir: path.join(normalizedJsDir, 'plugins'),
    pluginsJsPath: path.join(normalizedJsDir, 'plugins.js'),
    displayPath: path.resolve(sourcePath || normalizedRoot),
    statePath: path.join(normalizedRoot, '.JakeMSG_PluginAndParameterManager.state.json')
  };
}

function classifyPath(inputPath) {
  if (!inputPath) return null;

  let candidate = path.resolve(inputPath);
  if (isFile(candidate)) candidate = path.dirname(candidate);
  if (!isDir(candidate)) return null;

  // MV game root
  if (isFile(path.join(candidate, 'www', 'js', 'plugins.js'))) {
    return buildProject('MV', candidate, path.join(candidate, 'www', 'js'), candidate);
  }

  // MV www folder
  if (
    path.basename(candidate).toLowerCase() === 'www' &&
    isFile(path.join(candidate, 'js', 'plugins.js'))
  ) {
    return buildProject('MV', path.dirname(candidate), path.join(candidate, 'js'), candidate);
  }

  // js folder (MV or MZ)
  if (
    path.basename(candidate).toLowerCase() === 'js' &&
    isFile(path.join(candidate, 'plugins.js'))
  ) {
    const parent = path.dirname(candidate);
    if (path.basename(parent).toLowerCase() === 'www') {
      return buildProject('MV', path.dirname(parent), candidate, candidate);
    }
    return buildProject('MZ', parent, candidate, candidate);
  }

  // plugins folder (MV or MZ)
  if (path.basename(candidate).toLowerCase() === 'plugins') {
    const jsDir = path.dirname(candidate);
    if (
      path.basename(jsDir).toLowerCase() === 'js' &&
      isFile(path.join(jsDir, 'plugins.js'))
    ) {
      const parent = path.dirname(jsDir);
      if (path.basename(parent).toLowerCase() === 'www') {
        return buildProject('MV', path.dirname(parent), jsDir, candidate);
      }
      return buildProject('MZ', parent, jsDir, candidate);
    }
  }

  // MZ game root
  if (
    isFile(path.join(candidate, 'js', 'plugins.js')) &&
    !isFile(path.join(candidate, 'www', 'js', 'plugins.js'))
  ) {
    return buildProject('MZ', candidate, path.join(candidate, 'js'), candidate);
  }

  return null;
}

function getAncestorPaths(startPath) {
  const list = [];
  if (!startPath) return list;

  let current = path.resolve(startPath);
  if (isFile(current)) current = path.dirname(current);

  while (true) {
    list.push(current);
    const next = path.dirname(current);
    if (next === current) break;
    current = next;
  }

  return list;
}

function resolveFromInputPath(inputPath) {
  if (!inputPath) return null;

  const direct = classifyPath(inputPath);
  if (direct) return direct;

  const ancestors = getAncestorPaths(inputPath);
  for (let i = 0; i < ancestors.length; i += 1) {
    const project = classifyPath(ancestors[i]);
    if (project) return project;
  }

  return null;
}

function detectFromCandidates(candidatePaths) {
  const seen = new Set();
  const candidates = Array.isArray(candidatePaths) ? candidatePaths : [];

  for (let i = 0; i < candidates.length; i += 1) {
    const candidate = candidates[i];
    if (!candidate) continue;

    const ancestorPaths = getAncestorPaths(candidate);
    for (let j = 0; j < ancestorPaths.length; j += 1) {
      const testPath = ancestorPaths[j];
      const key = testPath.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      const project = classifyPath(testPath);
      if (project) return project;
    }
  }

  return null;
}

module.exports = {
  classifyPath,
  detectFromCandidates,
  getAncestorPaths,
  resolveFromInputPath
};

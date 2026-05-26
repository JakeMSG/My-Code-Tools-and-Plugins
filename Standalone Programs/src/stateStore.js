'use strict';

const fs = require('fs');

const VERSION = 2;

function defaultState() {
  return {
    version: VERSION,
    folders: [
      {
        id: 'ungrouped',
        name: 'Ungrouped',
        parentId: null,
        order: 0
      }
    ],
    pluginFolderMap: {},
    pluginTags: {},
    folderCollapsed: {},
    managerLayout: null
  };
}

function sanitizeScrollPositionPoint(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const leftRaw = Number(source.left);
  const topRaw = Number(source.top);

  return {
    left: Number.isFinite(leftRaw) && leftRaw > 0 ? leftRaw : 0,
    top: Number.isFinite(topRaw) && topRaw > 0 ? topRaw : 0
  };
}

function sanitizeManagerLayoutScrollPositions(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};

  return {
    window: sanitizeScrollPositionPoint(source.window),
    workspaceLayout: sanitizeScrollPositionPoint(source.workspaceLayout),
    folderTree: sanitizeScrollPositionPoint(source.folderTree),
    pluginList: sanitizeScrollPositionPoint(source.pluginList),
    editorContent: sanitizeScrollPositionPoint(source.editorContent),
    tabsBar: sanitizeScrollPositionPoint(source.tabsBar)
  };
}

function managerLayoutHasScrollData(scrollPositions) {
  if (!scrollPositions || typeof scrollPositions !== 'object') return false;

  return Object.keys(scrollPositions).some((key) => {
    const point = scrollPositions[key] && typeof scrollPositions[key] === 'object'
      ? scrollPositions[key]
      : null;
    if (!point) return false;
    return (Number(point.left) || 0) > 0 || (Number(point.top) || 0) > 0;
  });
}

function sanitizeBooleanRecord(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const out = {};

  Object.keys(source).forEach((rawKey) => {
    const key = String(rawKey || '').trim();
    if (!key) return;
    out[key] = Boolean(source[rawKey]);
  });

  return out;
}

function sanitizeManagerLayout(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const zoomRaw = Math.round(Number(raw.uiZoomPercent));
  const uiZoomPercent = Number.isFinite(zoomRaw)
    ? Math.max(50, Math.min(300, zoomRaw))
    : 100;

  const scrollPositions = sanitizeManagerLayoutScrollPositions(raw.scrollPositions);
  const editorDetailsOpenState = sanitizeBooleanRecord(raw.editorDetailsOpenState);
  const typedTreeOpenState = sanitizeBooleanRecord(raw.typedTreeOpenState);
  const devEntryOpenState = sanitizeBooleanRecord(raw.devEntryOpenState);

  const manager = {
    openTabs: uniqueArrayOfStrings(raw.openTabs),
    activeTab: String(raw.activeTab || '').trim(),
    folderSearch: String(raw.folderSearch || ''),
    pluginSearch: String(raw.pluginSearch || ''),
    tabSearch: String(raw.tabSearch || ''),
    paramSearch: String(raw.paramSearch || ''),
    schemaSearch: String(raw.schemaSearch || ''),
    structSchemaSearch: String(raw.structSchemaSearch || ''),
    uiZoomPercent,
    scrollPositions,
    editorDetailsOpenState,
    typedTreeOpenState,
    devEntryOpenState,
    lastOpenedGameRoot: String(raw.lastOpenedGameRoot || '').trim()
  };

  const hasContent = manager.openTabs.length > 0
    || manager.activeTab
    || manager.folderSearch
    || manager.pluginSearch
    || manager.tabSearch
    || manager.paramSearch
    || manager.schemaSearch
    || manager.structSchemaSearch
    || manager.uiZoomPercent !== 100
    || managerLayoutHasScrollData(manager.scrollPositions)
    || Object.keys(manager.editorDetailsOpenState).length > 0
    || Object.keys(manager.typedTreeOpenState).length > 0
    || Object.keys(manager.devEntryOpenState).length > 0
    || manager.lastOpenedGameRoot;

  return hasContent ? manager : null;
}

function normalizeFolderRecord(candidate, orderFallback) {
  const source = candidate && typeof candidate === 'object' ? candidate : {};
  const id = String(source.id || '').trim();
  const name = String(source.name || '').trim();
  const parentIdRaw = source.parentId === undefined || source.parentId === null
    ? null
    : String(source.parentId).trim();

  if (!id || !name) return null;

  return {
    id,
    name,
    parentId: parentIdRaw || null,
    order: Number.isFinite(Number(source.order)) ? Number(source.order) : Number(orderFallback || 0)
  };
}

function uniqueArrayOfStrings(value) {
  const list = Array.isArray(value) ? value : [];
  const out = [];
  const used = new Set();

  for (let i = 0; i < list.length; i += 1) {
    const raw = String(list[i] === undefined || list[i] === null ? '' : list[i]).trim();
    if (!raw) continue;
    const key = raw.toLowerCase();
    if (used.has(key)) continue;
    used.add(key);
    out.push(raw);
  }

  return out;
}

function migrateV1State(source) {
  const groups = Array.isArray(source.groups) ? source.groups : [];
  const folders = [];

  for (let i = 0; i < groups.length; i += 1) {
    const group = groups[i] || {};
    const id = String(group.id || '').trim();
    const name = String(group.name || '').trim();
    if (!id || !name) continue;

    folders.push({
      id: id === 'default' ? 'ungrouped' : id,
      name: id === 'default' ? 'Ungrouped' : name,
      parentId: null,
      order: i
    });
  }

  if (!folders.some((folder) => folder.id === 'ungrouped')) {
    folders.unshift({ id: 'ungrouped', name: 'Ungrouped', parentId: null, order: 0 });
  }

  const pluginFolderMap = {};
  const pluginToGroup = source.pluginToGroup && typeof source.pluginToGroup === 'object'
    ? source.pluginToGroup
    : {};

  Object.keys(pluginToGroup).forEach((pluginKey) => {
    const groupId = String(pluginToGroup[pluginKey] || '').trim();
    if (!groupId) return;
    pluginFolderMap[String(pluginKey)] = groupId === 'default' ? 'ungrouped' : groupId;
  });

  return {
    version: VERSION,
    folders,
    pluginFolderMap,
    pluginTags: {},
    folderCollapsed: {}
  };
}

function sanitizeState(raw) {
  const base = defaultState();
  const source = raw && typeof raw === 'object' ? raw : {};

  const fromLegacy = source.groups || source.pluginToGroup
    ? migrateV1State(source)
    : source;

  const normalizedSource = fromLegacy && typeof fromLegacy === 'object' ? fromLegacy : {};

  const foldersSource = Array.isArray(normalizedSource.folders) ? normalizedSource.folders : [];
  const folders = [];
  const usedFolderIds = new Set();

  for (let i = 0; i < foldersSource.length; i += 1) {
    const folder = normalizeFolderRecord(foldersSource[i], i);
    if (!folder) continue;
    if (usedFolderIds.has(folder.id)) continue;
    usedFolderIds.add(folder.id);
    folders.push(folder);
  }

  if (!usedFolderIds.has('ungrouped')) {
    folders.unshift({ id: 'ungrouped', name: 'Ungrouped', parentId: null, order: -999999 });
    usedFolderIds.add('ungrouped');
  }

  // Remove invalid parent links and self-links.
  for (let i = 0; i < folders.length; i += 1) {
    const folder = folders[i];
    if (!folder.parentId) continue;
    if (folder.parentId === folder.id) {
      folder.parentId = null;
      continue;
    }
    if (!usedFolderIds.has(folder.parentId)) {
      folder.parentId = null;
    }
  }

  folders.sort((a, b) => {
    if (a.id === 'ungrouped') return -1;
    if (b.id === 'ungrouped') return 1;
    if (a.parentId === b.parentId) {
      if (a.order !== b.order) return a.order - b.order;
      return a.name.localeCompare(b.name);
    }
    return String(a.parentId || '').localeCompare(String(b.parentId || ''));
  });

  // Rebase sibling order to stable sequence.
  const siblingCounters = {};
  for (let i = 0; i < folders.length; i += 1) {
    const folder = folders[i];
    const key = String(folder.parentId || 'ROOT');
    const next = siblingCounters[key] || 0;
    folder.order = next;
    siblingCounters[key] = next + 1;
  }

  const pluginFolderMap = {};
  const mapSource = normalizedSource.pluginFolderMap && typeof normalizedSource.pluginFolderMap === 'object'
    ? normalizedSource.pluginFolderMap
    : {};

  Object.keys(mapSource).forEach((key) => {
    const folderId = String(mapSource[key] || '').trim() || 'ungrouped';
    pluginFolderMap[String(key)] = usedFolderIds.has(folderId) ? folderId : 'ungrouped';
  });

  const pluginTags = {};
  const tagsSource = normalizedSource.pluginTags && typeof normalizedSource.pluginTags === 'object'
    ? normalizedSource.pluginTags
    : {};

  Object.keys(tagsSource).forEach((pluginKey) => {
    const tags = uniqueArrayOfStrings(tagsSource[pluginKey]);
    if (tags.length <= 0) return;
    pluginTags[String(pluginKey)] = tags;
  });

  const folderCollapsed = {};
  const collapsedSource = normalizedSource.folderCollapsed && typeof normalizedSource.folderCollapsed === 'object'
    ? normalizedSource.folderCollapsed
    : {};

  Object.keys(collapsedSource).forEach((folderId) => {
    if (!usedFolderIds.has(folderId)) return;
    folderCollapsed[folderId] = Boolean(collapsedSource[folderId]);
  });

  const managerLayout = sanitizeManagerLayout(normalizedSource.managerLayout);

  return {
    version: VERSION,
    folders: folders.length > 0 ? folders : base.folders,
    pluginFolderMap,
    pluginTags,
    folderCollapsed,
    managerLayout
  };
}

function loadState(filePath) {
  if (!filePath) return defaultState();

  try {
    if (!fs.existsSync(filePath)) {
      return defaultState();
    }

    const text = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(text);
    return sanitizeState(parsed);
  } catch (err) {
    return defaultState();
  }
}

function saveState(filePath, state) {
  if (!filePath) {
    throw new Error('Missing state file path');
  }

  const sanitized = sanitizeState(state);
  fs.writeFileSync(filePath, `${JSON.stringify(sanitized, null, 2)}\n`, 'utf8');
  return sanitized;
}

module.exports = {
  defaultState,
  loadState,
  saveState,
  sanitizeState
};

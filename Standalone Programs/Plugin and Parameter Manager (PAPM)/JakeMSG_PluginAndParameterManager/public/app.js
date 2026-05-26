/* eslint-disable no-alert */
(() => {
  'use strict';

  const dom = {
    appShell: document.querySelector('.app-shell'),
    projectBadge: document.getElementById('projectBadge'),
    btnDetect: document.getElementById('btnDetect'),
    btnSelectFolder: document.getElementById('btnSelectFolder'),
    btnReload: document.getElementById('btnReload'),
    btnExportSettings: document.getElementById('btnExportSettings'),
    btnImportSettings: document.getElementById('btnImportSettings'),
    btnResetLayout: document.getElementById('btnResetLayout'),
    btnResetFolders: document.getElementById('btnResetFolders'),
    btnSavePlugins: document.getElementById('btnSavePlugins'),
    btnBackupPlugins: document.getElementById('btnBackupPlugins'),
    btnSaveState: document.getElementById('btnSaveState'),
    btnSaveManagerLayout: document.getElementById('btnSaveManagerLayout'),

    workspaceLayout: document.getElementById('workspaceLayout'),
    navigatorShell: document.getElementById('navigatorShell'),
    foldersPanel: document.getElementById('foldersPanel'),
    pluginsPanel: document.getElementById('pluginsPanel'),

    inputFolderSearch: document.getElementById('inputFolderSearch'),
    btnAddFolder: document.getElementById('btnAddFolder'),
    btnRenameFolder: document.getElementById('btnRenameFolder'),
    btnDeleteFolder: document.getElementById('btnDeleteFolder'),
    folderTree: document.getElementById('folderTree'),
    folderCountBadge: document.getElementById('folderCountBadge'),

    inputSearch: document.getElementById('inputSearch'),
    btnAddPlugin: document.getElementById('btnAddPlugin'),
    btnRenamePlugin: document.getElementById('btnRenamePlugin'),
    btnDeletePlugin: document.getElementById('btnDeletePlugin'),
    pluginCountBadge: document.getElementById('pluginCountBadge'),

    pluginList: document.getElementById('pluginList'),
    btnTabsLeft: document.getElementById('btnTabsLeft'),
    btnTabsRight: document.getElementById('btnTabsRight'),
    tabsWrap: document.getElementById('tabsWrap'),
    tabsBar: document.getElementById('tabsBar'),
    inputTabSearch: document.getElementById('inputTabSearch'),

    editorShell: document.getElementById('editorShell'),
    editorContent: document.getElementById('editorContent'),
    emptyState: document.getElementById('emptyState'),
    pluginEditor: document.getElementById('pluginEditor'),
    activePluginTitle: document.getElementById('activePluginTitle'),
    activePluginFileHint: document.getElementById('activePluginFileHint'),
    activePluginStatus: document.getElementById('activePluginStatus'),
    btnActivePluginHelp: document.getElementById('btnActivePluginHelp'),
    activePluginFolder: document.getElementById('activePluginFolder'),
    activePluginTags: document.getElementById('activePluginTags'),
    btnMoveUp: document.getElementById('btnMoveUp'),
    btnMoveDown: document.getElementById('btnMoveDown'),

    paramsDetails: document.getElementById('paramsDetails'),
    inputParamSearch: document.getElementById('inputParamSearch'),
    paramsTree: document.getElementById('paramsTree'),

    developerDetails: document.getElementById('developerDetails'),
    inputSchemaSearch: document.getElementById('inputSchemaSearch'),
    schemaEditor: document.getElementById('schemaEditor'),
    btnAddSchemaParam: document.getElementById('btnAddSchemaParam'),
    btnSaveSchema: document.getElementById('btnSaveSchema'),

    structDeveloperDetails: document.getElementById('structDeveloperDetails'),
    inputStructSchemaSearch: document.getElementById('inputStructSchemaSearch'),
    structSchemaEditor: document.getElementById('structSchemaEditor'),
    btnAddStructSchema: document.getElementById('btnAddStructSchema'),
    btnSaveStructSchema: document.getElementById('btnSaveStructSchema'),

    toastStack: document.getElementById('toastStack'),
    contextMenu: document.getElementById('contextMenu'),
    tagSuggestMenu: document.getElementById('tagSuggestMenu'),

    textPromptModal: document.getElementById('textPromptModal'),
    textPromptTitle: document.getElementById('textPromptTitle'),
    textPromptMessage: document.getElementById('textPromptMessage'),
    textPromptInput: document.getElementById('textPromptInput'),
    textPromptCancel: document.getElementById('textPromptCancel'),
    textPromptConfirm: document.getElementById('textPromptConfirm'),

    textViewModal: document.getElementById('textViewModal'),
    textViewCard: document.querySelector('#textViewModal .text-view-card'),
    textViewTitle: document.getElementById('textViewTitle'),
    textViewMessage: document.getElementById('textViewMessage'),
    textViewInput: document.getElementById('textViewInput'),
    textViewCancel: document.getElementById('textViewCancel'),
    textViewConfirm: document.getElementById('textViewConfirm')
  };

  const DEFAULT_FOLDER = {
    id: 'ungrouped',
    name: 'Ungrouped',
    parentId: null,
    order: 0
  };

  const OBJECT_TYPE_TO_KEY = {
    actor: 'actor',
    class: 'class',
    skill: 'skill',
    item: 'item',
    weapon: 'weapon',
    armor: 'armor',
    enemy: 'enemy',
    troop: 'troop',
    state: 'state',
    tileset: 'tileset',
    common_event: 'common_event',
    switch: 'switch',
    variable: 'variable',
    animation: 'animation'
  };

  const NUMBERISH_TYPES = new Set([
    'number',
    'actor',
    'class',
    'skill',
    'item',
    'weapon',
    'armor',
    'enemy',
    'troop',
    'state',
    'tileset',
    'common_event',
    'switch',
    'variable',
    'animation'
  ]);

  const FILE_ROOT_OPTIONS = ['img', 'audio', 'movies'];

  const WHEEL_SCROLL_ZONE_SELECTORS = [
    '#folderTree',
    '#pluginList',
    '#paramsDetails',
    '#structDeveloperDetails',
    '#developerDetails',
    '#paramsTree',
    '#schemaEditor',
    '#structSchemaEditor'
  ];

  const state = {
    project: null,
    plugins: [],

    folders: [cloneJson(DEFAULT_FOLDER)],
    pluginFolderMap: {},
    pluginTags: {},
    folderCollapsed: {},

    selectedFolderId: 'all',
    selectedFolderIds: ['all'],
    lastFolderSelectionId: 'all',
    folderSearch: '',

    searchText: '',
    tabSearch: '',
    paramSearch: '',
    schemaSearch: '',
    structSchemaSearch: '',

    selectedPluginKeys: [],
    lastPluginSelectionKey: null,

    openTabs: [],
    activeTab: null,

    pluginsDirty: false,
    layoutDirty: false,
    managerLayoutDirty: false,

    metadataCache: {},
    metadataPromise: {},

    schemaDrafts: {},
    schemaDirtyKeys: {},
    structSchemaDrafts: {},
    structSchemaDirtyKeys: {},
    managerLayout: null,

    dataCatalog: null,
    dataCatalogPromise: null,
    fileListCache: {},

    dragSource: '',
    dragPluginKey: null,
    dragPluginKeys: [],
    dragFolderId: null,
    dragFolderIds: [],
    dragTabKey: null,
    dragSchemaIndex: null,
    dragStructSchemaIndex: null,
    dragSchemaSelectionUids: [],
    dragStructSchemaSelectionUids: [],

    visibleFolderOrder: [],
    visiblePluginOrder: [],

    paramClipboard: '',
    listItemClipboard: '',
    listItemClipboardItems: [],
    structEntryClipboard: null,
    pluginEntryClipboard: null,
    schemaParamClipboard: null,
    structBlockClipboard: null,

    tagSuggest: {
      input: null,
      options: [],
      activeIndex: -1,
      tokenStart: 0,
      tokenEnd: 0
    },

    typedTreeOpenState: {},
    devEntryOpenState: {},
    devSelectionByScope: {},
    paramSelectionByPlugin: {},
    paramSelectionAnchorByPlugin: {},
    editorDetailsOpenState: {},
    nextDevUid: 1,

    uiZoomPercent: 100,
    lastSelectionScope: '',
    lastEditorSelectionContext: null,

    undoStack: [],
    redoStack: [],
    historyLastSnapshot: null,
    historyLastHash: '',
    historySuspend: false,
    numberWheelCaptureBound: false,

    wheelScrollBound: false,
    activePanelRenderToken: 0
  };

  let managerLayoutLabelRefreshQueued = false;
  let savePluginsHotkeyTimer = null;
  const hotkeyHeldCodes = new Set();
  const listControlRegistry = new Map();
  let nextListControlId = 1;
  const SETTINGS_BUTTON_TOOLTIP_DELAY_MS = 2000;
  let settingsButtonTooltipTimer = null;
  let settingsButtonTooltipNode = null;

  function makePluginKey(plugin) {
    return `${String(plugin.name || '')}::${String(plugin.description || '')}`;
  }

  function pluginNameToken(value) {
    return cleanText(value).toLowerCase();
  }

  function getListClipboardItems() {
    if (Array.isArray(state.listItemClipboardItems) && state.listItemClipboardItems.length > 0) {
      return state.listItemClipboardItems
        .map((entry) => String(entry === undefined || entry === null ? '' : entry));
    }

    if (state.listItemClipboard !== '') {
      return [String(state.listItemClipboard)];
    }

    return [];
  }

  function setListClipboardItems(items) {
    const source = Array.isArray(items) ? items : [];
    const normalized = source
      .map((entry) => String(entry === undefined || entry === null ? '' : entry));

    state.listItemClipboardItems = normalized;
    state.listItemClipboard = normalized.length > 0 ? normalized[0] : '';
  }

  function isPluginSelectionEditableTarget(target) {
    if (!target || !(target instanceof Element)) return false;

    if (target.closest('#contextMenu')) return false;

    const tag = String(target.tagName || '').toUpperCase();
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (target.isContentEditable) return true;

    return Boolean(target.closest('[contenteditable="true"]'));
  }

  function showTextViewModal(options) {
    const config = options && typeof options === 'object' ? options : {};

    return new Promise((resolve) => {
      const readOnly = Boolean(config.readOnly);
      const windowFit = Boolean(config.windowFit);

      dom.textViewTitle.textContent = cleanText(config.title) || 'Value';
      dom.textViewMessage.textContent = cleanText(config.message) || '';
      dom.textViewInput.value = String(config.value === undefined || config.value === null ? '' : config.value);
      dom.textViewInput.readOnly = readOnly;
      if (dom.textViewCard) {
        dom.textViewCard.classList.toggle('window-fit', windowFit);
      }
      dom.textViewModal.classList.toggle('window-fit', windowFit);

      dom.textViewCancel.textContent = readOnly
        ? (cleanText(config.cancelLabel) || 'Close')
        : (cleanText(config.cancelLabel) || 'Cancel');

      dom.textViewConfirm.textContent = cleanText(config.confirmLabel) || 'Apply';
      dom.textViewConfirm.classList.toggle('hidden', readOnly);

      dom.textViewModal.classList.remove('hidden');
      dom.textViewInput.focus();
      if (!readOnly) {
        dom.textViewInput.select();
      }

      function cleanup(result) {
        dom.textViewModal.classList.add('hidden');
        dom.textViewInput.value = '';
        if (dom.textViewCard) {
          dom.textViewCard.classList.remove('window-fit');
        }
        dom.textViewModal.classList.remove('window-fit');

        dom.textViewCancel.removeEventListener('click', onCancel);
        dom.textViewConfirm.removeEventListener('click', onConfirm);
        dom.textViewModal.removeEventListener('click', onBackdrop);
        dom.textViewInput.removeEventListener('keydown', onKeyDown);

        resolve(result);
      }

      function onCancel() {
        cleanup(null);
      }

      function onConfirm() {
        if (readOnly) {
          cleanup(null);
          return;
        }
        cleanup(dom.textViewInput.value);
      }

      function onBackdrop(event) {
        if (event.target === dom.textViewModal) {
          cleanup(null);
        }
      }

      function onKeyDown(event) {
        if (event.key === 'Escape') {
          event.preventDefault();
          cleanup(null);
          return;
        }

        if (!readOnly && event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          cleanup(dom.textViewInput.value);
        }
      }

      dom.textViewCancel.addEventListener('click', onCancel);
      dom.textViewConfirm.addEventListener('click', onConfirm);
      dom.textViewModal.addEventListener('click', onBackdrop);
      dom.textViewInput.addEventListener('keydown', onKeyDown);
    });
  }

  function showPlainTextPreview(title, value, options) {
    const config = options && typeof options === 'object' ? options : {};
    return showTextViewModal({
      title,
      value,
      message: config.message || '',
      readOnly: Boolean(config.readOnly),
      confirmLabel: config.confirmLabel || 'Apply',
      cancelLabel: config.cancelLabel || (config.readOnly ? 'Close' : 'Cancel')
    });
  }

  function openReadOnlyTextPopupWindow(options) {
    const config = options && typeof options === 'object' ? options : {};
    const title = cleanText(config.title) || 'Value';
    const message = cleanText(config.message) || '';
    const value = String(config.value === undefined || config.value === null ? '' : config.value);

    const availWidth = Math.max(900, Number(window.screen && window.screen.availWidth) || 1280);
    const availHeight = Math.max(700, Number(window.screen && window.screen.availHeight) || 900);

    const width = Math.max(960, Math.min(1600, Math.floor(availWidth * 0.84)));
    const height = Math.max(720, Math.min(1200, Math.floor(availHeight * 0.88)));
    const left = Math.max(0, Math.floor((availWidth - width) / 2));
    const top = Math.max(0, Math.floor((availHeight - height) / 2));

    const popup = window.open(
      'about:blank',
      '_blank',
      [
        'popup=yes',
        `width=${width}`,
        `height=${height}`,
        `left=${left}`,
        `top=${top}`,
        'resizable=yes',
        'scrollbars=yes'
      ].join(',')
    );

    if (!popup) {
      return false;
    }

    const safeTitle = escapeHtml(title);
    const safeMessage = escapeHtml(message);
    const safeValue = escapeHtml(value);

    popup.document.open();
    popup.document.write(`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <style>
    :root {
      --bg: #0d1117;
      --panel: #15212d;
      --line: #3f5d75;
      --text: #ecf4fb;
      --muted: #9eb8cc;
      --accent: #e97c34;
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: var(--bg);
      color: var(--text);
      font-family: "Bahnschrift", "Trebuchet MS", "Verdana", sans-serif;
    }
    .shell {
      width: 100%;
      height: 100%;
      padding: 10px;
      display: grid;
      grid-template-rows: auto auto 1fr auto;
      gap: 8px;
    }
    h1 {
      margin: 0;
      font-size: 1.05rem;
      letter-spacing: 0.02em;
      color: var(--text);
    }
    .message {
      margin: 0;
      font-size: 0.82rem;
      color: var(--muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .viewer {
      width: 100%;
      height: 100%;
      min-height: 0;
      align-self: stretch;
      border: 1px solid var(--line);
      border-radius: 10px;
      background: var(--panel);
      color: var(--text);
      padding: 10px;
      resize: none;
      line-height: 1.35;
      white-space: pre-wrap;
      font-family: "Consolas", "Courier New", monospace;
      overflow: auto;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    button {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(21, 33, 45, 0.95);
      color: var(--text);
      padding: 6px 12px;
      cursor: pointer;
    }
    button.primary {
      border-color: rgba(233, 124, 52, 0.6);
      background: rgba(233, 124, 52, 0.18);
      color: #ffd7b8;
    }
  </style>
</head>
<body>
  <div class="shell">
    <h1>${safeTitle}</h1>
    <p class="message" title="${safeMessage}">${safeMessage}</p>
    <textarea class="viewer" readonly>${safeValue}</textarea>
    <div class="actions">
      <button id="btnClose" class="primary" type="button">Close</button>
    </div>
  </div>
  <script>
    const btn = document.getElementById('btnClose');
    if (btn) btn.addEventListener('click', () => window.close());
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        window.close();
      }
    });
  <\/script>
</body>
</html>`);
    popup.document.close();
    popup.focus();
    return true;
  }

  function getCurrentProjectRoot() {
    return state.project
      ? cleanText(state.project.gameRoot || state.project.displayPath || '')
      : '';
  }

  function captureHistorySnapshot() {
    return {
      projectRoot: getCurrentProjectRoot(),
      plugins: cloneJson(state.plugins),
      folders: cloneJson(state.folders),
      pluginFolderMap: cloneJson(state.pluginFolderMap),
      pluginTags: cloneJson(state.pluginTags),
      folderCollapsed: cloneJson(state.folderCollapsed),

      selectedFolderId: state.selectedFolderId,
      selectedFolderIds: cloneJson(state.selectedFolderIds),
      lastFolderSelectionId: state.lastFolderSelectionId,

      searchText: state.searchText,
      tabSearch: state.tabSearch,
      paramSearch: state.paramSearch,
      schemaSearch: state.schemaSearch,
      structSchemaSearch: state.structSchemaSearch,
      folderSearch: state.folderSearch,

      selectedPluginKeys: cloneJson(state.selectedPluginKeys),
      lastPluginSelectionKey: state.lastPluginSelectionKey,

      openTabs: cloneJson(state.openTabs),
      activeTab: state.activeTab,

      pluginsDirty: Boolean(state.pluginsDirty),
      layoutDirty: Boolean(state.layoutDirty),

      schemaDrafts: cloneJson(state.schemaDrafts),
      schemaDirtyKeys: cloneJson(state.schemaDirtyKeys),
      structSchemaDrafts: cloneJson(state.structSchemaDrafts),
      structSchemaDirtyKeys: cloneJson(state.structSchemaDirtyKeys),

      pluginEntryClipboard: cloneJson(state.pluginEntryClipboard),
      schemaParamClipboard: cloneJson(state.schemaParamClipboard),
      structBlockClipboard: cloneJson(state.structBlockClipboard),

      typedTreeOpenState: cloneJson(state.typedTreeOpenState),
      devEntryOpenState: cloneJson(state.devEntryOpenState),
      editorDetailsOpenState: cloneJson(state.editorDetailsOpenState),
      nextDevUid: Number(state.nextDevUid) || 1,

      lastSelectionScope: String(state.lastSelectionScope || ''),
      uiZoomPercent: Number(state.uiZoomPercent) || 100
    };
  }

  function computeHistoryHash(snapshot) {
    try {
      return JSON.stringify(snapshot);
    } catch (_error) {
      return '';
    }
  }

  function resetHistoryBaseline() {
    state.undoStack = [];
    state.redoStack = [];

    const snapshot = captureHistorySnapshot();
    state.historyLastSnapshot = snapshot;
    state.historyLastHash = computeHistoryHash(snapshot);
  }

  function recordHistoryCheckpoint() {
    if (state.historySuspend) return;

    const snapshot = captureHistorySnapshot();
    const hash = computeHistoryHash(snapshot);
    if (!hash) return;

    if (!state.historyLastSnapshot || !state.historyLastHash) {
      state.historyLastSnapshot = snapshot;
      state.historyLastHash = hash;
      return;
    }

    if (hash === state.historyLastHash) {
      return;
    }

    state.undoStack.push(state.historyLastSnapshot);
    if (state.undoStack.length > 120) {
      state.undoStack.shift();
    }

    state.redoStack = [];
    state.historyLastSnapshot = snapshot;
    state.historyLastHash = hash;
  }

  function restoreHistorySnapshot(snapshot) {
    const source = snapshot && typeof snapshot === 'object' ? snapshot : null;
    if (!source) return;

    state.plugins = cloneJson(source.plugins || []);
    state.folders = cloneJson(source.folders || [cloneJson(DEFAULT_FOLDER)]);
    state.pluginFolderMap = cloneJson(source.pluginFolderMap || {});
    state.pluginTags = cloneJson(source.pluginTags || {});
    state.folderCollapsed = cloneJson(source.folderCollapsed || {});

    state.selectedFolderId = cleanText(source.selectedFolderId || 'all') || 'all';
    state.selectedFolderIds = uniqueStringList(source.selectedFolderIds || [state.selectedFolderId]);
    state.lastFolderSelectionId = cleanText(source.lastFolderSelectionId || state.selectedFolderId);

    state.searchText = String(source.searchText || '');
    state.tabSearch = String(source.tabSearch || '');
    state.paramSearch = String(source.paramSearch || '');
    state.schemaSearch = String(source.schemaSearch || '');
    state.structSchemaSearch = String(source.structSchemaSearch || '');
    state.folderSearch = String(source.folderSearch || '');

    state.selectedPluginKeys = uniqueStringList(source.selectedPluginKeys || []);
    state.lastPluginSelectionKey = cleanText(source.lastPluginSelectionKey || '');

    state.openTabs = uniqueStringList(source.openTabs || []);
    state.activeTab = cleanText(source.activeTab || '') || null;

    state.pluginsDirty = Boolean(source.pluginsDirty);
    state.layoutDirty = Boolean(source.layoutDirty);

    state.schemaDrafts = cloneJson(source.schemaDrafts || {});
    state.schemaDirtyKeys = cloneJson(source.schemaDirtyKeys || {});
    state.structSchemaDrafts = cloneJson(source.structSchemaDrafts || {});
    state.structSchemaDirtyKeys = cloneJson(source.structSchemaDirtyKeys || {});

    state.pluginEntryClipboard = cloneJson(source.pluginEntryClipboard || null);
    state.schemaParamClipboard = cloneJson(source.schemaParamClipboard || null);
    state.structBlockClipboard = cloneJson(source.structBlockClipboard || null);
    state.dragSchemaSelectionUids = [];
    state.dragStructSchemaSelectionUids = [];

    state.typedTreeOpenState = cloneJson(source.typedTreeOpenState || {});
    state.devEntryOpenState = cloneJson(source.devEntryOpenState || {});
    state.devSelectionByScope = {};
    state.paramSelectionByPlugin = {};
    state.paramSelectionAnchorByPlugin = {};
    state.editorDetailsOpenState = cloneJson(source.editorDetailsOpenState || {});
    state.nextDevUid = Number(source.nextDevUid) > 0 ? Number(source.nextDevUid) : 1;

    state.lastSelectionScope = cleanText(source.lastSelectionScope || '');
    state.lastEditorSelectionContext = null;
    state.uiZoomPercent = Number(source.uiZoomPercent) || 100;

    state.metadataCache = {};
    state.metadataPromise = {};
    state.dataCatalog = null;
    state.dataCatalogPromise = null;
    state.fileListCache = {};

    applyUiZoom();
    applyEditorSectionDetailsState();
    syncSearchInputsFromState();
    hideTagSuggest();
    renderAll();
  }

  function undoHistory() {
    if (state.undoStack.length <= 0) {
      showToast('Nothing to undo.', 'bad');
      return;
    }

    const target = state.undoStack[state.undoStack.length - 1];
    if (!target || cleanText(target.projectRoot || '') !== getCurrentProjectRoot()) {
      showToast('Undo history reset (project changed).', 'bad');
      resetHistoryBaseline();
      return;
    }

    const current = captureHistorySnapshot();
    const previous = state.undoStack.pop();

    state.redoStack.push(current);
    if (state.redoStack.length > 120) {
      state.redoStack.shift();
    }

    state.historySuspend = true;
    restoreHistorySnapshot(previous);

    const now = captureHistorySnapshot();
    state.historyLastSnapshot = now;
    state.historyLastHash = computeHistoryHash(now);
    state.historySuspend = false;

    showToast('Undo applied.', 'good');
  }

  function redoHistory() {
    if (state.redoStack.length <= 0) {
      showToast('Nothing to redo.', 'bad');
      return;
    }

    const target = state.redoStack[state.redoStack.length - 1];
    if (!target || cleanText(target.projectRoot || '') !== getCurrentProjectRoot()) {
      showToast('Redo history reset (project changed).', 'bad');
      resetHistoryBaseline();
      return;
    }

    const current = captureHistorySnapshot();
    const next = state.redoStack.pop();

    state.undoStack.push(current);
    if (state.undoStack.length > 120) {
      state.undoStack.shift();
    }

    state.historySuspend = true;
    restoreHistorySnapshot(next);

    const now = captureHistorySnapshot();
    state.historyLastSnapshot = now;
    state.historyLastHash = computeHistoryHash(now);
    state.historySuspend = false;

    showToast('Redo applied.', 'good');
  }

  function applyUiZoom() {
    const normalized = Math.max(50, Math.min(300, Number(state.uiZoomPercent) || 100));
    const factor = normalized / 100;
    state.uiZoomPercent = normalized;

    const shell = dom.appShell || document.querySelector('.app-shell');
    if (!shell) {
      document.body.style.zoom = String(factor);
      return;
    }

    document.body.style.zoom = '';
    shell.style.zoom = String(factor);

    if (factor < 1) {
      const inverse = 100 / factor;
      shell.style.width = `${inverse}%`;
      shell.style.height = `${inverse}vh`;
      shell.style.minHeight = `${inverse}vh`;
      shell.style.overflow = 'visible';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'auto';
      return;
    }

    shell.style.width = '100%';
    shell.style.height = '100vh';
    shell.style.minHeight = '100vh';

    if (factor > 1) {
      shell.style.width = `${Math.round(factor * 10000) / 100}%`;
      shell.style.height = `${Math.round(factor * 10000) / 100}vh`;
      shell.style.minHeight = `${Math.round(factor * 10000) / 100}vh`;
      shell.style.overflow = 'visible';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'auto';
      return;
    }

    shell.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  function setUiZoomPercent(percent, silent) {
    const rounded = Math.round(Number(percent) || 100);
    const next = Math.max(50, Math.min(300, rounded));
    if (next === state.uiZoomPercent) return;

    state.uiZoomPercent = next;
    applyUiZoom();

    if (!silent) {
      showToast(`Zoom ${next}%`, 'good');
    }

    requestManagerLayoutDirtyLabelRefresh();
    recordHistoryCheckpoint();
  }

  function adjustUiZoomBy(deltaPercent) {
    setUiZoomPercent((Number(state.uiZoomPercent) || 100) + Number(deltaPercent || 0), false);
  }

  function resolveSelectionScopeFromTarget(target) {
    const element = target instanceof Element ? target : null;

    if (element && (element.closest('#folderTree') || element.closest('#foldersPanel'))) {
      return 'folders';
    }

    if (element && (element.closest('#pluginList') || element.closest('#pluginsPanel'))) {
      return 'plugins';
    }

    if (state.lastSelectionScope === 'folders' || state.lastSelectionScope === 'plugins') {
      return state.lastSelectionScope;
    }

    if (state.selectedPluginKeys.length > 0 || state.activeTab) {
      return 'plugins';
    }

    return 'folders';
  }

  function findListAddButtonFromTarget(target) {
    const candidates = [];

    if (target instanceof Element) {
      candidates.push(target);
    }

    if (document.activeElement instanceof Element && !candidates.includes(document.activeElement)) {
      candidates.push(document.activeElement);
    }

    for (let i = 0; i < candidates.length; i += 1) {
      const listRoot = candidates[i].closest('.typed-list');
      if (!listRoot) continue;

      const addBtn = listRoot.querySelector('.typed-list-add-btn');
      if (addBtn instanceof HTMLButtonElement && !addBtn.disabled) {
        return addBtn;
      }
    }

    return null;
  }

  function triggerAddEntryFromCurrentSelection(target) {
    const element = target instanceof Element ? target : null;

    if (element && element.closest('#textPromptModal, #textViewModal, #contextMenu, #tagSuggestMenu')) {
      return false;
    }

    const listAddBtn = findListAddButtonFromTarget(element);
    if (listAddBtn) {
      listAddBtn.click();
      return true;
    }

    if (element && element.closest('#structDeveloperDetails')) {
      dom.btnAddStructSchema.click();
      return true;
    }

    if (element && element.closest('#developerDetails')) {
      dom.btnAddSchemaParam.click();
      return true;
    }

    const scope = resolveSelectionScopeFromTarget(element);
    if (scope === 'folders') {
      addFolder();
      return true;
    }

    if (scope === 'plugins') {
      addPluginRow();
      return true;
    }

    return false;
  }

  function selectAllVisiblePlugins() {
    const keys = state.visiblePluginOrder.slice();
    if (keys.length <= 0) {
      showToast('No visible plugin rows to select.', 'bad');
      return;
    }

    const active = state.activeTab && keys.includes(state.activeTab)
      ? state.activeTab
      : keys[keys.length - 1];

    setSelectedPluginKeys(keys, active);
    state.lastSelectionScope = 'plugins';
    renderPluginList();
  }

  function selectAllVisibleFolders() {
    const ids = state.visibleFolderOrder.slice();
    if (ids.length <= 0) {
      showToast('No visible folder rows to select.', 'bad');
      return;
    }

    const active = ids.includes(state.selectedFolderId)
      ? state.selectedFolderId
      : ids[0];

    setSelectedFolderIds(ids, active);
    state.lastSelectionScope = 'folders';
    renderFolderTree();
    renderPluginList();
  }

  function cleanupListControlRegistry() {
    listControlRegistry.forEach((context, id) => {
      if (!context || !context.wrapper || !context.wrapper.isConnected) {
        listControlRegistry.delete(id);
      }
    });
  }

  function resolveListControlContextFromTarget(target) {
    cleanupListControlRegistry();

    const element = target instanceof Element
      ? target
      : (document.activeElement instanceof Element ? document.activeElement : null);
    if (!element) return null;

    const listRoot = element.closest('.typed-list[data-list-control-id]');
    if (!(listRoot instanceof Element)) return null;

    const listControlId = cleanText(listRoot.dataset.listControlId || '');
    if (!listControlId) return null;

    const context = listControlRegistry.get(listControlId);
    if (!context || context.wrapper !== listRoot) {
      listControlRegistry.delete(listControlId);
      return null;
    }

    return context;
  }

  function resolveLastListSelectionContext() {
    cleanupListControlRegistry();

    if (state.lastSelectionScope !== 'editor') {
      return null;
    }

    const source = state.lastEditorSelectionContext && typeof state.lastEditorSelectionContext === 'object'
      ? state.lastEditorSelectionContext
      : null;
    if (!source || source.kind !== 'list') {
      return null;
    }

    const listControlId = cleanText(source.listControlId || '');
    if (!listControlId) {
      return null;
    }

    const context = listControlRegistry.get(listControlId);
    if (!context || !context.wrapper || !context.wrapper.isConnected) {
      return null;
    }

    if (!context.hasSelection || !context.hasSelection()) {
      return null;
    }

    return context;
  }

  function clearVisibleParamSelectionClasses() {
    if (!dom.paramsTree) return;

    const nodes = dom.paramsTree.querySelectorAll('.param-node.selected');
    for (let i = 0; i < nodes.length; i += 1) {
      nodes[i].classList.remove('selected');
    }
  }

  function applyVisibleDevSelectionClassesFromState() {
    const scopeNodes = document.querySelectorAll('[data-dev-scope][data-dev-plugin-key]');

    for (let i = 0; i < scopeNodes.length; i += 1) {
      const scopeNode = scopeNodes[i];
      if (!(scopeNode instanceof Element)) continue;

      const scope = cleanText(scopeNode.dataset.devScope || '');
      const pluginKey = cleanText(scopeNode.dataset.devPluginKey || '');
      if (!scope || !pluginKey) continue;

      const selectedSet = new Set(getDevSelectionUids(scope, pluginKey));
      const cards = scopeNode.querySelectorAll('.schema-entry[data-entry-uid]');

      for (let j = 0; j < cards.length; j += 1) {
        const card = cards[j];
        if (!(card instanceof Element)) continue;
        const entryUid = cleanText(card.dataset.entryUid || '');
        card.classList.toggle('selected', selectedSet.has(entryUid));
      }
    }
  }

  function keepOnlyLatestEditorSelection(context) {
    const source = context && typeof context === 'object' ? context : null;
    if (!source) return;

    const kind = cleanText(source.kind || '');
    if (!kind) return;

    const listControlId = kind === 'list' ? cleanText(source.listControlId || '') : '';
    const devScope = kind === 'dev' ? cleanText(source.scope || '') : '';
    const devPluginKey = kind === 'dev' ? cleanText(source.pluginKey || '') : '';
    const paramPluginKey = kind === 'param' ? cleanText(source.pluginKey || '') : '';

    cleanupListControlRegistry();
    listControlRegistry.forEach((listContext, id) => {
      if (kind === 'list' && id === listControlId) {
        return;
      }

      if (listContext && typeof listContext.clearSelection === 'function') {
        listContext.clearSelection();
      }
    });

    if (kind === 'dev' && devScope && devPluginKey) {
      const keepKey = buildDevSelectionScopeKey(devScope, devPluginKey);
      const keepSelection = uniqueStringList(state.devSelectionByScope[keepKey] || []);
      state.devSelectionByScope = keepSelection.length > 0
        ? { [keepKey]: keepSelection }
        : {};
    } else {
      state.devSelectionByScope = {};
    }
    applyVisibleDevSelectionClassesFromState();

    if (kind === 'param' && paramPluginKey) {
      const keepSelection = uniqueStringList(state.paramSelectionByPlugin[paramPluginKey] || []);
      const keepAnchor = cleanText(state.paramSelectionAnchorByPlugin[paramPluginKey] || '');

      state.paramSelectionByPlugin = keepSelection.length > 0
        ? { [paramPluginKey]: keepSelection }
        : {};

      state.paramSelectionAnchorByPlugin = keepAnchor
        ? { [paramPluginKey]: keepAnchor }
        : {};

      const selectedSet = new Set(keepSelection);
      const entries = getVisibleParamNodeEntries();
      for (let i = 0; i < entries.length; i += 1) {
        entries[i].node.classList.toggle('selected', selectedSet.has(entries[i].uid));
      }
    } else {
      state.paramSelectionByPlugin = {};
      state.paramSelectionAnchorByPlugin = {};
      clearVisibleParamSelectionClasses();
    }
  }

  function handleListSelectionHotkey(target, hotkey) {
    const normalizedHotkey = String(hotkey || '').toLowerCase();
    if (normalizedHotkey !== 'a'
      && normalizedHotkey !== 'c'
      && normalizedHotkey !== 'v'
      && normalizedHotkey !== 'd'
      && normalizedHotkey !== 'e'
      && normalizedHotkey !== 'w') {
      return false;
    }

    let context = resolveListControlContextFromTarget(target);
    if (!context && (normalizedHotkey === 'e' || normalizedHotkey === 'w')) {
      context = resolveLastListSelectionContext();
    }
    if (!context) return false;

    const editingText = isPluginSelectionEditableTarget(target);
    const hasSelection = Boolean(context.hasSelection && context.hasSelection());

    if (normalizedHotkey === 'a') {
      return Boolean(context.selectAllRows && context.selectAllRows(target));
    }

    if (normalizedHotkey === 'c') {
      if (editingText && !hasSelection) {
        return false;
      }
      return Boolean(context.copySelection && context.copySelection(target));
    }

    if (normalizedHotkey === 'v') {
      if (editingText && !hasSelection) {
        return false;
      }
      const clipboard = getListClipboardItems();
      if (clipboard.length <= 0) {
        return false;
      }
      return Boolean(context.pasteSelection && context.pasteSelection(target));
    }

    if (normalizedHotkey === 'e' || normalizedHotkey === 'w') {
      const expand = normalizedHotkey === 'e';
      return Boolean(context.expandSelection && context.expandSelection(target, expand));
    }

    return Boolean(context.deleteSelection && context.deleteSelection(target));
  }

  function setLastEditorSelectionContext(context) {
    const source = context && typeof context === 'object' ? context : null;
    if (!source) {
      state.lastEditorSelectionContext = null;
      return;
    }

    const kind = cleanText(source.kind || '');
    if (kind === 'list') {
      const listControlId = cleanText(source.listControlId || '');
      if (!listControlId) {
        state.lastEditorSelectionContext = null;
        return;
      }

      keepOnlyLatestEditorSelection({
        kind,
        listControlId
      });

      state.lastEditorSelectionContext = {
        kind,
        listControlId
      };
      state.lastSelectionScope = 'editor';
      return;
    }

    if (kind === 'dev') {
      const scope = cleanText(source.scope || '');
      const pluginKey = cleanText(source.pluginKey || '');
      if (!scope || !pluginKey) {
        state.lastEditorSelectionContext = null;
        return;
      }

      keepOnlyLatestEditorSelection({
        kind,
        scope,
        pluginKey
      });

      state.lastEditorSelectionContext = {
        kind,
        scope,
        pluginKey
      };
      state.lastSelectionScope = 'editor';
      return;
    }

    if (kind === 'param') {
      const pluginKey = cleanText(source.pluginKey || '');
      if (!pluginKey) {
        state.lastEditorSelectionContext = null;
        return;
      }

      keepOnlyLatestEditorSelection({
        kind,
        pluginKey
      });

      state.lastEditorSelectionContext = {
        kind,
        pluginKey
      };
      state.lastSelectionScope = 'editor';
      return;
    }

    state.lastEditorSelectionContext = null;
  }

  function resolveLastEditorDeleteContext() {
    const source = state.lastEditorSelectionContext && typeof state.lastEditorSelectionContext === 'object'
      ? state.lastEditorSelectionContext
      : null;
    if (!source) return null;

    if (source.kind === 'list') {
      cleanupListControlRegistry();
      const listControlId = cleanText(source.listControlId || '');
      if (!listControlId) return null;

      const listContext = listControlRegistry.get(listControlId);
      if (!listContext || !listContext.wrapper || !listContext.wrapper.isConnected) {
        return null;
      }

      if (!listContext.hasSelection || !listContext.hasSelection()) {
        return null;
      }

      return {
        kind: 'list',
        listContext
      };
    }

    if (source.kind === 'dev') {
      const scope = cleanText(source.scope || '');
      const pluginKey = cleanText(source.pluginKey || '');
      if (!scope || !pluginKey) return null;

      if (getDevSelectionUids(scope, pluginKey).length <= 0) {
        return null;
      }

      return {
        kind: 'dev',
        devContext: {
          scope,
          pluginKey,
          container: null
        }
      };
    }

    return null;
  }

  function collectDevScopeCards(container) {
    if (!(container instanceof Element)) return [];

    const cards = [];
    const children = container.children;
    for (let i = 0; i < children.length; i += 1) {
      const child = children[i];
      if (!(child instanceof Element)) continue;
      if (!child.classList.contains('schema-entry')) continue;

      const entryUid = cleanText(child.dataset.entryUid || '');
      if (!entryUid) continue;

      cards.push({
        card: child,
        entryUid
      });
    }

    return cards;
  }

  function resolveDevSelectionContextFromTarget(target) {
    const activeIndex = getActivePluginIndex();
    if (activeIndex < 0) return null;

    const plugin = state.plugins[activeIndex];
    if (!plugin) return null;

    const activePluginKey = makePluginKey(plugin);
    const element = target instanceof Element
      ? target
      : (document.activeElement instanceof Element ? document.activeElement : null);

    if (!element || !element.closest('#developerDetails, #structDeveloperDetails')) {
      return null;
    }

    const scopeNode = element.closest('[data-dev-scope]');
    if (scopeNode) {
      const scope = cleanText(scopeNode.dataset.devScope || '');
      if (scope) {
        const pluginKey = cleanText(scopeNode.dataset.devPluginKey || '') || activePluginKey;
        return {
          scope,
          pluginKey,
          container: scopeNode
        };
      }
    }

    if (element.closest('#structDeveloperDetails')) {
      return {
        scope: 'struct-schema-block',
        pluginKey: activePluginKey,
        container: dom.structSchemaEditor
      };
    }

    return {
      scope: 'plugin-schema-param',
      pluginKey: activePluginKey,
      container: dom.schemaEditor
    };
  }

  function selectAllVisibleDevEntries(scopeContext) {
    const context = scopeContext && typeof scopeContext === 'object' ? scopeContext : null;
    if (!context || !context.scope || !context.pluginKey) return false;

    const cards = collectDevScopeCards(context.container);
    const entryUids = cards.map((entry) => entry.entryUid);

    setDevSelectionUids(context.scope, context.pluginKey, entryUids);

    if (entryUids.length > 0) {
      setLastEditorSelectionContext({
        kind: 'dev',
        scope: context.scope,
        pluginKey: context.pluginKey
      });
    }

    if (cards.length <= 0) {
      showToast('No visible Dev-option entries to select.', 'bad');
      return true;
    }

    for (let i = 0; i < cards.length; i += 1) {
      cards[i].card.classList.add('selected');
    }

    return true;
  }

  function getDevScopeEntries(scope, pluginKey) {
    const normalizedScope = String(scope || '');
    const normalizedPluginKey = String(pluginKey || '');

    if (!normalizedScope || !normalizedPluginKey) {
      return [];
    }

    if (normalizedScope === 'plugin-schema-param') {
      return schemaDraftEnsureList(state.schemaDrafts[normalizedPluginKey] || []);
    }

    if (normalizedScope === 'struct-schema-block') {
      return structDraftEnsureBlockList(state.structSchemaDrafts[normalizedPluginKey] || []);
    }

    if (normalizedScope.startsWith('struct-param:')) {
      const blockUid = normalizedScope.slice('struct-param:'.length);
      if (!blockUid) return [];

      const blocks = structDraftEnsureBlockList(state.structSchemaDrafts[normalizedPluginKey] || []);
      for (let i = 0; i < blocks.length; i += 1) {
        const block = blocks[i];
        if (ensureDraftEntryUid(block) !== blockUid) continue;
        return schemaDraftEnsureList(block.params);
      }
    }

    return [];
  }

  function setDevParentTreeExpandedForSelection(scope, pluginKey, selectedUids, expanded) {
    if (scope === 'struct-schema-block') {
      return false;
    }

    const entries = getDevScopeEntries(scope, pluginKey);
    if (entries.length <= 0) {
      return false;
    }

    const selectedSet = new Set(uniqueStringList(selectedUids));
    if (selectedSet.size <= 0) {
      return false;
    }

    const depths = schemaDraftComputeDepths(entries);
    const nextState = Boolean(expanded);
    let changed = false;

    for (let i = 0; i < entries.length; i += 1) {
      const entry = entries[i];
      const entryUid = ensureDraftEntryUid(entry);
      if (!selectedSet.has(entryUid)) continue;

      const subtreeEnd = schemaDraftFindSubtreeEnd(depths, i);
      if (subtreeEnd <= i) continue;

      const key = buildDevEntryOpenKey(`${scope}:parent-tree`, pluginKey, entryUid);
      if (Boolean(state.devEntryOpenState[key]) === nextState
        && Object.prototype.hasOwnProperty.call(state.devEntryOpenState, key)) {
        continue;
      }

      state.devEntryOpenState[key] = nextState;
      changed = true;
    }

    return changed;
  }

  function setDevSelectionExpanded(scopeContext, expanded) {
    const context = scopeContext && typeof scopeContext === 'object' ? scopeContext : null;
    if (!context || !context.scope || !context.pluginKey) return false;

    const selectedUids = getDevSelectionUids(context.scope, context.pluginKey);
    if (selectedUids.length <= 0) {
      showToast('No Dev-option entries selected.', 'bad');
      return true;
    }

    const selectedSet = new Set(selectedUids);
    const cards = collectDevScopeCards(context.container);
    const nextOpen = Boolean(expanded);

    for (let i = 0; i < cards.length; i += 1) {
      const cardInfo = cards[i];
      if (!selectedSet.has(cardInfo.entryUid)) continue;
      if (cardInfo.card instanceof HTMLDetailsElement) {
        cardInfo.card.open = nextOpen;
      }
    }

    for (let i = 0; i < selectedUids.length; i += 1) {
      const entryUid = selectedUids[i];
      const key = buildDevEntryOpenKey(context.scope, context.pluginKey, entryUid);
      state.devEntryOpenState[key] = nextOpen;
    }

    const parentTreeChanged = setDevParentTreeExpandedForSelection(
      context.scope,
      context.pluginKey,
      selectedUids,
      nextOpen
    );

    requestManagerLayoutDirtyLabelRefresh();

    if (parentTreeChanged) {
      renderActivePluginPanel();
    }

    return true;
  }

  function deleteDevSelection(scopeContext) {
    const context = scopeContext && typeof scopeContext === 'object' ? scopeContext : null;
    if (!context || !context.scope || !context.pluginKey) return false;

    const selectedUids = getDevSelectionUids(context.scope, context.pluginKey);
    if (selectedUids.length <= 0) {
      showToast('No Dev-option entries selected.', 'bad');
      return true;
    }

    const selectedSet = new Set(selectedUids);
    let removedCount = 0;

    if (context.scope === 'struct-schema-block') {
      const blocks = structDraftEnsureBlockList(state.structSchemaDrafts[context.pluginKey] || []);

      for (let i = blocks.length - 1; i >= 0; i -= 1) {
        const blockUid = ensureDraftEntryUid(blocks[i]);
        if (!selectedSet.has(blockUid)) continue;
        blocks.splice(i, 1);
        removedCount += 1;
      }

      if (removedCount > 0) {
        state.structSchemaDrafts[context.pluginKey] = blocks;
        markStructSchemaDirty(context.pluginKey);
      }
    } else {
      const entries = getDevScopeEntries(context.scope, context.pluginKey);
      const depths = schemaDraftComputeDepths(entries);
      const rootIndexes = schemaDraftResolveBranchRootIndicesByUid(entries, depths, selectedUids);

      for (let i = rootIndexes.length - 1; i >= 0; i -= 1) {
        const index = rootIndexes[i];
        const subtreeEnd = schemaDraftFindSubtreeEnd(depths, index);
        removedCount += Math.max(0, subtreeEnd - index + 1);
        entries.splice(index, subtreeEnd - index + 1);
      }

      if (removedCount > 0) {
        if (context.scope === 'plugin-schema-param') {
          markSchemaDirty(context.pluginKey);
        } else {
          markStructSchemaDirty(context.pluginKey);
        }
      }
    }

    if (removedCount <= 0) {
      showToast('No Dev-option entries removed.', 'bad');
      return true;
    }

    setDevSelectionUids(context.scope, context.pluginKey, []);
    renderActivePluginPanel();
    showToast(removedCount > 1 ? 'Selected Dev-option entries removed.' : 'Dev-option entry removed.', 'good');
    return true;
  }

  function setFolderSelectionExpanded(expanded) {
    const childrenMap = getFolderChildrenMap();
    let targetIds = uniqueStringList(state.selectedFolderIds)
      .filter((folderId) => folderId !== 'all' && getFolderById(folderId));

    if (targetIds.length <= 0) {
      const activeFolderId = cleanText(state.selectedFolderId || '');
      if (activeFolderId && activeFolderId !== 'all' && getFolderById(activeFolderId)) {
        targetIds = [activeFolderId];
      }
    }

    if (targetIds.length <= 0) {
      targetIds = state.visibleFolderOrder.filter((folderId) => folderId !== 'all' && getFolderById(folderId));
    }

    if (targetIds.length <= 0) {
      showToast('No folders to expand/collapse.', 'bad');
      return true;
    }

    const nextCollapsed = !Boolean(expanded);
    let changed = false;

    for (let i = 0; i < targetIds.length; i += 1) {
      const folderId = targetIds[i];
      const children = childrenMap.get(folderId) || [];
      if (children.length <= 0) continue;

      if (Boolean(state.folderCollapsed[folderId]) === nextCollapsed) continue;
      state.folderCollapsed[folderId] = nextCollapsed;
      changed = true;
    }

    if (changed) {
      markLayoutDirty();
      renderFolderTree();
    }

    return true;
  }

  function getActiveParamSelectionPluginKey() {
    const activeIndex = getActivePluginIndex();
    if (activeIndex < 0) return '';

    const plugin = state.plugins[activeIndex];
    if (!plugin) return '';

    return makePluginKey(plugin);
  }

  function getVisibleParamNodeEntries() {
    if (!dom.paramsTree) return [];

    const nodes = dom.paramsTree.querySelectorAll('.param-node[data-param-select-uid]');
    const entries = [];

    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      if (!(node instanceof Element)) continue;

      const uid = cleanText(node.dataset.paramSelectUid || '');
      if (!uid) continue;

      const detailsList = [];
      const seen = new Set();

      function pushDetail(detail) {
        if (!(detail instanceof HTMLDetailsElement)) return;
        if (seen.has(detail)) return;
        seen.add(detail);
        detailsList.push(detail);
      }

      const children = node.children;
      for (let j = 0; j < children.length; j += 1) {
        const child = children[j];
        if (!(child instanceof HTMLDetailsElement)) continue;
        if (!child.classList.contains('param-children-tree')) continue;
        pushDetail(child);
      }

      if (node.classList.contains('param-list') || node.classList.contains('param-struct')) {
        let inputGrid = null;
        for (let j = 0; j < children.length; j += 1) {
          const child = children[j];
          if (!(child instanceof Element)) continue;
          if (!child.classList.contains('param-input-grid')) continue;
          inputGrid = child;
          break;
        }

        if (inputGrid) {
          const typedTrees = inputGrid.querySelectorAll('.typed-list-tree');
          for (let j = 0; j < typedTrees.length; j += 1) {
            pushDetail(typedTrees[j]);
          }
        }
      }

      entries.push({
        uid,
        node,
        detailsList
      });
    }

    return entries;
  }

  function getParamSelectionUids(pluginKey) {
    const normalizedPluginKey = cleanText(pluginKey || '');
    if (!normalizedPluginKey) return [];
    return uniqueStringList(state.paramSelectionByPlugin[normalizedPluginKey] || []);
  }

  function setParamSelectionUids(pluginKey, nextUids, options) {
    const normalizedPluginKey = cleanText(pluginKey || '');
    if (!normalizedPluginKey) return [];

    const config = options && typeof options === 'object' ? options : {};
    const entries = getVisibleParamNodeEntries();
    const validUids = entries.map((entry) => entry.uid);
    const validUidSet = new Set(validUids);

    const selectedUids = uniqueStringList(nextUids).filter((uid) => validUidSet.has(uid));
    state.paramSelectionByPlugin[normalizedPluginKey] = selectedUids;

    let anchorUid = cleanText(state.paramSelectionAnchorByPlugin[normalizedPluginKey] || '');
    if (!config.keepAnchor) {
      anchorUid = selectedUids.length > 0
        ? selectedUids[selectedUids.length - 1]
        : '';
    } else if (anchorUid && !validUidSet.has(anchorUid)) {
      anchorUid = selectedUids.length > 0
        ? selectedUids[selectedUids.length - 1]
        : '';
    }
    state.paramSelectionAnchorByPlugin[normalizedPluginKey] = anchorUid;

    const selectedUidSet = new Set(selectedUids);
    for (let i = 0; i < entries.length; i += 1) {
      entries[i].node.classList.toggle('selected', selectedUidSet.has(entries[i].uid));
    }

    if (selectedUids.length > 0) {
      setLastEditorSelectionContext({
        kind: 'param',
        pluginKey: normalizedPluginKey
      });
    }

    return selectedUids.slice();
  }

  function selectParamRangeTo(pluginKey, targetUid) {
    const normalizedPluginKey = cleanText(pluginKey || '');
    const normalizedTargetUid = cleanText(targetUid || '');
    if (!normalizedPluginKey || !normalizedTargetUid) return [];

    const entries = getVisibleParamNodeEntries();
    const orderedUids = entries.map((entry) => entry.uid);
    const targetIndex = orderedUids.indexOf(normalizedTargetUid);
    if (targetIndex < 0) {
      return setParamSelectionUids(normalizedPluginKey, [normalizedTargetUid]);
    }

    const anchorUid = cleanText(state.paramSelectionAnchorByPlugin[normalizedPluginKey] || '');
    if (!anchorUid) {
      return setParamSelectionUids(normalizedPluginKey, [normalizedTargetUid]);
    }

    const anchorIndex = orderedUids.indexOf(anchorUid);
    if (anchorIndex < 0) {
      return setParamSelectionUids(normalizedPluginKey, [normalizedTargetUid]);
    }

    const start = Math.min(anchorIndex, targetIndex);
    const end = Math.max(anchorIndex, targetIndex);
    const rangeUids = [];

    for (let i = start; i <= end; i += 1) {
      rangeUids.push(orderedUids[i]);
    }

    return setParamSelectionUids(normalizedPluginKey, rangeUids, { keepAnchor: true });
  }

  function paramSelectionForUid(pluginKey, uid) {
    const normalizedPluginKey = cleanText(pluginKey || '');
    const normalizedUid = cleanText(uid || '');
    if (!normalizedPluginKey || !normalizedUid) return [];

    const selectedUids = getParamSelectionUids(normalizedPluginKey);
    if (selectedUids.includes(normalizedUid) && selectedUids.length > 0) {
      return selectedUids.slice();
    }

    return setParamSelectionUids(normalizedPluginKey, [normalizedUid]);
  }

  function setParameterSelectionExpanded(pluginKey, targetUids, expanded) {
    const normalizedPluginKey = cleanText(pluginKey || '');
    if (!normalizedPluginKey) return false;

    const entries = getVisibleParamNodeEntries();
    if (entries.length <= 0) {
      showToast('No parameter entries to expand/collapse.', 'bad');
      return true;
    }

    const detailsByUid = new Map();
    for (let i = 0; i < entries.length; i += 1) {
      const detailsList = Array.isArray(entries[i].detailsList)
        ? entries[i].detailsList.filter((detail) => detail instanceof HTMLDetailsElement)
        : [];
      if (detailsList.length <= 0) continue;
      detailsByUid.set(entries[i].uid, detailsList);
    }

    const targets = uniqueStringList(targetUids).filter((uid) => detailsByUid.has(uid));
    if (targets.length <= 0) {
      showToast('Selected parameters have no expandable sections.', 'bad');
      return true;
    }

    const nextOpen = Boolean(expanded);
    let changed = false;

    for (let i = 0; i < targets.length; i += 1) {
      const detailsList = detailsByUid.get(targets[i]) || [];
      for (let j = 0; j < detailsList.length; j += 1) {
        const details = detailsList[j];
        if (!(details instanceof HTMLDetailsElement)) continue;
        if (details.open === nextOpen) continue;
        details.open = nextOpen;
        changed = true;
      }
    }

    if (changed) {
      requestManagerLayoutDirtyLabelRefresh();
    }

    setParamSelectionUids(normalizedPluginKey, uniqueStringList(targetUids), { keepAnchor: true });
    return true;
  }

  function handleParamExpandCollapseHotkey(target, hotkey) {
    const normalizedHotkey = String(hotkey || '').toLowerCase();
    if (normalizedHotkey !== 'e' && normalizedHotkey !== 'w') {
      return false;
    }

    const pluginKey = getActiveParamSelectionPluginKey();
    if (!pluginKey) return false;

    const element = target instanceof Element
      ? target
      : (document.activeElement instanceof Element ? document.activeElement : null);
    const insideParams = Boolean(element && element.closest('#paramsDetails'));

    const lastContext = state.lastEditorSelectionContext && typeof state.lastEditorSelectionContext === 'object'
      ? state.lastEditorSelectionContext
      : null;
    const fallbackFromEditor = !insideParams
      && state.lastSelectionScope === 'editor'
      && lastContext
      && lastContext.kind === 'param'
      && cleanText(lastContext.pluginKey || '') === pluginKey;

    if (!insideParams && !fallbackFromEditor) {
      return false;
    }

    const entries = getVisibleParamNodeEntries();
    if (entries.length <= 0) {
      showToast('No parameter entries to expand/collapse.', 'bad');
      return true;
    }

    const visibleUidSet = new Set(entries.map((entry) => entry.uid));
    let targetUids = getParamSelectionUids(pluginKey).filter((uid) => visibleUidSet.has(uid));

    if (targetUids.length <= 0 && element) {
      const targetNode = element.closest('.param-node[data-param-select-uid]');
      if (targetNode instanceof Element) {
        const targetUid = cleanText(targetNode.dataset.paramSelectUid || '');
        if (targetUid) {
          targetUids = [targetUid];
          setParamSelectionUids(pluginKey, targetUids);
        }
      }
    }

    if (targetUids.length <= 0) {
      targetUids = entries.map((entry) => entry.uid);
    }

    return setParameterSelectionExpanded(pluginKey, targetUids, normalizedHotkey === 'e');
  }

  function handleExpandCollapseHotkey(target, hotkey) {
    const normalizedHotkey = String(hotkey || '').toLowerCase();
    if (normalizedHotkey !== 'e' && normalizedHotkey !== 'w') {
      return false;
    }

    if (handleDevSelectionHotkey(target, normalizedHotkey)) {
      return true;
    }

    if (handleListSelectionHotkey(target, normalizedHotkey)) {
      return true;
    }

    const expand = normalizedHotkey === 'e';
    const element = target instanceof Element
      ? target
      : (document.activeElement instanceof Element ? document.activeElement : null);

    if (handleParamExpandCollapseHotkey(element, normalizedHotkey)) {
      return true;
    }

    const scope = resolveSelectionScopeFromTarget(element);
    if (scope === 'folders') {
      return setFolderSelectionExpanded(expand);
    }

    return false;
  }

  function handleMultiSelectionDeleteHotkey(target) {
    const listContext = resolveListControlContextFromTarget(target);
    if (listContext) {
      if (handleListSelectionHotkey(target, 'd')) {
        return true;
      }

      showToast('No list elements selected.', 'bad');
      return true;
    }

    const devContext = resolveDevSelectionContextFromTarget(target);
    if (devContext && deleteDevSelection(devContext)) {
      return true;
    }

    if (state.lastSelectionScope === 'editor') {
      const editorFallback = resolveLastEditorDeleteContext();
      if (editorFallback) {
        if (editorFallback.kind === 'list') {
          return Boolean(editorFallback.listContext.deleteSelection
            && editorFallback.listContext.deleteSelection(null));
        }

        if (editorFallback.kind === 'dev') {
          return deleteDevSelection(editorFallback.devContext);
        }
      }
    }

    const scope = resolveSelectionScopeFromTarget(target);
    if (scope === 'folders') {
      const ids = uniqueStringList(state.selectedFolderIds)
        .filter((folderId) => folderId !== 'all' && getFolderById(folderId));
      if (ids.length <= 0) {
        showToast('Select folder(s) first.', 'bad');
        return true;
      }

      deleteFoldersById(ids);
      return true;
    }

    const keys = getSelectedOrActivePluginKeys();
    if (keys.length <= 0) {
      showToast('Select plugin row(s) first.', 'bad');
      return true;
    }

    deletePluginsByKey(keys);
    return true;
  }

  function handleDevSelectionHotkey(target, hotkey) {
    const normalizedHotkey = String(hotkey || '').toLowerCase();
    if (normalizedHotkey !== 'a' && normalizedHotkey !== 'e' && normalizedHotkey !== 'w') {
      return false;
    }

    const context = resolveDevSelectionContextFromTarget(target);
    if (!context) return false;

    if (normalizedHotkey === 'a') {
      return selectAllVisibleDevEntries(context);
    }

    return setDevSelectionExpanded(context, normalizedHotkey === 'e');
  }

  function buildTypedTreeStateKey(meta, scope) {
    const source = meta && typeof meta === 'object' ? meta : {};
    const keyBase = cleanText(source.path || source.name || source.text || source.type || 'typed');
    const pluginKey = cleanText(state.activeTab || '');
    const suffix = cleanText(scope || 'tree');
    return `${pluginKey}::${keyBase}::${suffix}`;
  }

  function bindEditorSectionDetailsState(details, key, fallbackOpen) {
    if (!details) return;

    const stateKey = cleanText(key || '');
    if (!stateKey) return;

    const hasStored = Object.prototype.hasOwnProperty.call(state.editorDetailsOpenState, stateKey);
    details.open = hasStored ? Boolean(state.editorDetailsOpenState[stateKey]) : Boolean(fallbackOpen);

    if (details.dataset.openStateBound === '1') return;
    details.dataset.openStateBound = '1';

    details.addEventListener('toggle', () => {
      state.editorDetailsOpenState[stateKey] = details.open;
      requestManagerLayoutDirtyLabelRefresh();
    });
  }

  function bindStaticEditorDetailsStates() {
    bindEditorSectionDetailsState(dom.paramsDetails, 'params', true);
    bindEditorSectionDetailsState(dom.developerDetails, 'schema', false);
    bindEditorSectionDetailsState(dom.structDeveloperDetails, 'structSchema', false);
  }

  function applyEditorSectionDetailsState() {
    const sections = [
      { key: 'params', element: dom.paramsDetails },
      { key: 'schema', element: dom.developerDetails },
      { key: 'structSchema', element: dom.structDeveloperDetails }
    ];

    for (let i = 0; i < sections.length; i += 1) {
      const section = sections[i];
      if (!section.element) continue;
      if (!Object.prototype.hasOwnProperty.call(state.editorDetailsOpenState, section.key)) continue;
      section.element.open = Boolean(state.editorDetailsOpenState[section.key]);
    }
  }

  function bindTypedTreeDetailsState(details, meta, scope, fallbackOpen) {
    if (!details) return;

    const key = buildTypedTreeStateKey(meta, scope);
    const hasStored = Object.prototype.hasOwnProperty.call(state.typedTreeOpenState, key);
    details.open = hasStored ? Boolean(state.typedTreeOpenState[key]) : Boolean(fallbackOpen);

    details.addEventListener('toggle', () => {
      state.typedTreeOpenState[key] = details.open;
      requestManagerLayoutDirtyLabelRefresh();
    });
  }

  function bindTypedFileFolderDetailsState(details, meta, relativePrefix, fallbackOpen) {
    const source = meta && typeof meta === 'object' ? meta : {};
    const baseKey = cleanText(source.path || source.name || source.text || source.type || 'file');
    const folderKey = cleanText(relativePrefix || '/');

    bindTypedTreeDetailsState(details, {
      ...source,
      path: `${baseKey}::${folderKey}`
    }, 'file-folder', fallbackOpen);
  }

  function ensureDraftEntryUid(entry) {
    if (!entry || typeof entry !== 'object') return '';

    if (!entry._uid) {
      entry._uid = `d${state.nextDevUid}`;
      state.nextDevUid += 1;
    }

    return String(entry._uid);
  }

  function buildDevEntryOpenKey(scope, pluginKey, entryUid) {
    return `${cleanText(scope || 'dev')}::${cleanText(pluginKey || '')}::${cleanText(entryUid || '')}`;
  }

  function buildDevSelectionScopeKey(scope, pluginKey) {
    return `${cleanText(scope || 'dev')}::${cleanText(pluginKey || '')}`;
  }

  function getDevSelectionUids(scope, pluginKey) {
    const key = buildDevSelectionScopeKey(scope, pluginKey);
    return uniqueStringList(state.devSelectionByScope[key] || []);
  }

  function setDevSelectionUids(scope, pluginKey, entryUids) {
    const key = buildDevSelectionScopeKey(scope, pluginKey);
    const list = uniqueStringList(entryUids || []);

    if (list.length <= 0) {
      delete state.devSelectionByScope[key];
      return [];
    }

    state.devSelectionByScope[key] = list;
    return list;
  }

  function isMetaOrCtrlPressed(event) {
    return Boolean(event && (event.ctrlKey || event.metaKey));
  }

  function schemaDraftResolveBranchRootIndicesByUid(entries, depths, entryUids) {
    const list = Array.isArray(entries) ? entries : [];
    if (list.length <= 0) return [];

    const depthList = Array.isArray(depths) && depths.length === list.length
      ? depths
      : schemaDraftComputeDepths(list);

    const selectedSet = new Set(uniqueStringList(entryUids));
    const indexes = [];

    for (let i = 0; i < list.length; i += 1) {
      const uid = ensureDraftEntryUid(list[i]);
      if (!selectedSet.has(uid)) continue;
      indexes.push(i);
    }

    indexes.sort((a, b) => a - b);

    const roots = [];
    for (let i = 0; i < indexes.length; i += 1) {
      const index = indexes[i];
      let nested = false;

      for (let j = 0; j < roots.length; j += 1) {
        const root = roots[j];
        const subtreeEnd = schemaDraftFindSubtreeEnd(depthList, root);
        if (index > root && index <= subtreeEnd) {
          nested = true;
          break;
        }
      }

      if (!nested) {
        roots.push(index);
      }
    }

    return roots;
  }

  function schemaDraftMoveEntryBranchesByUid(entries, depths, entryUids, toIndex) {
    const list = Array.isArray(entries) ? entries : [];
    if (list.length <= 0) return false;

    const depthList = Array.isArray(depths) && depths.length === list.length
      ? depths
      : schemaDraftComputeDepths(list);

    const roots = schemaDraftResolveBranchRootIndicesByUid(list, depthList, entryUids);
    if (roots.length <= 0) return false;

    const targetRaw = Number(toIndex);
    const targetIndex = Number.isFinite(targetRaw)
      ? Math.max(0, Math.min(list.length, targetRaw))
      : 0;

    const segments = roots.map((start) => {
      const end = schemaDraftFindSubtreeEnd(depthList, start);
      return {
        start,
        end,
        size: end - start + 1
      };
    });

    for (let i = 0; i < segments.length; i += 1) {
      const segment = segments[i];
      if (targetIndex > segment.start && targetIndex <= segment.end + 1) {
        return false;
      }
    }

    const beforeOrder = list.map((entry) => ensureDraftEntryUid(entry)).join('|');

    let insertAfterRemoval = targetIndex;
    for (let i = 0; i < segments.length; i += 1) {
      const segment = segments[i];
      if (segment.start < targetIndex) {
        insertAfterRemoval -= segment.size;
      }
    }

    const chunks = segments.map((segment) => list.slice(segment.start, segment.end + 1));

    for (let i = segments.length - 1; i >= 0; i -= 1) {
      const segment = segments[i];
      list.splice(segment.start, segment.size);
    }

    let insertIndex = Math.max(0, Math.min(list.length, insertAfterRemoval));
    for (let i = 0; i < chunks.length; i += 1) {
      const chunk = chunks[i];
      if (!chunk || chunk.length <= 0) continue;
      list.splice(insertIndex, 0, ...chunk);
      insertIndex += chunk.length;
    }

    const afterOrder = list.map((entry) => ensureDraftEntryUid(entry)).join('|');
    return beforeOrder !== afterOrder;
  }

  function schemaDraftMoveItemsByUid(entries, entryUids, toIndex) {
    const list = Array.isArray(entries) ? entries : [];
    if (list.length <= 0) return false;

    const selectedSet = new Set(uniqueStringList(entryUids));
    if (selectedSet.size <= 0) return false;

    const beforeOrder = list.map((entry) => ensureDraftEntryUid(entry)).join('|');

    const selected = [];
    const remaining = [];
    for (let i = 0; i < list.length; i += 1) {
      const entry = list[i];
      const uid = ensureDraftEntryUid(entry);
      if (selectedSet.has(uid)) {
        selected.push(entry);
      } else {
        remaining.push(entry);
      }
    }

    if (selected.length <= 0) return false;

    const targetRaw = Number(toIndex);
    const targetIndex = Number.isFinite(targetRaw)
      ? Math.max(0, Math.min(list.length, targetRaw))
      : 0;

    let selectedBeforeTarget = 0;
    for (let i = 0; i < targetIndex && i < list.length; i += 1) {
      const uid = ensureDraftEntryUid(list[i]);
      if (selectedSet.has(uid)) {
        selectedBeforeTarget += 1;
      }
    }

    const insertIndex = Math.max(0, Math.min(remaining.length, targetIndex - selectedBeforeTarget));
    remaining.splice(insertIndex, 0, ...selected);

    list.splice(0, list.length, ...remaining);

    const afterOrder = list.map((entry) => ensureDraftEntryUid(entry)).join('|');
    return beforeOrder !== afterOrder;
  }

  function bindDevEntryOpenState(details, scope, pluginKey, entryUid, fallbackOpen) {
    const key = buildDevEntryOpenKey(scope, pluginKey, entryUid);
    const hasStored = Object.prototype.hasOwnProperty.call(state.devEntryOpenState, key);
    details.open = hasStored ? Boolean(state.devEntryOpenState[key]) : Boolean(fallbackOpen);

    details.addEventListener('toggle', () => {
      state.devEntryOpenState[key] = details.open;
      requestManagerLayoutDirtyLabelRefresh();
    });
  }

  function remapPluginScopedOpenState(oldPluginKey, newPluginKey) {
    const oldPrefix = `${cleanText(oldPluginKey || '')}::`;
    const newPrefix = `${cleanText(newPluginKey || '')}::`;

    Object.keys(state.typedTreeOpenState).forEach((key) => {
      if (!String(key).startsWith(oldPrefix)) return;
      const suffix = String(key).slice(oldPrefix.length);
      state.typedTreeOpenState[`${newPrefix}${suffix}`] = state.typedTreeOpenState[key];
      delete state.typedTreeOpenState[key];
    });

    const needle = `::${cleanText(oldPluginKey || '')}::`;
    const replaceWith = `::${cleanText(newPluginKey || '')}::`;

    Object.keys(state.devEntryOpenState).forEach((key) => {
      if (!String(key).includes(needle)) return;
      const nextKey = String(key).replace(needle, replaceWith);
      state.devEntryOpenState[nextKey] = state.devEntryOpenState[key];
      delete state.devEntryOpenState[key];
    });
  }

  function clearPluginScopedOpenState(pluginKey) {
    const pluginPrefix = `${cleanText(pluginKey || '')}::`;
    Object.keys(state.typedTreeOpenState).forEach((key) => {
      if (String(key).startsWith(pluginPrefix)) {
        delete state.typedTreeOpenState[key];
      }
    });

    const needle = `::${cleanText(pluginKey || '')}::`;
    Object.keys(state.devEntryOpenState).forEach((key) => {
      if (String(key).includes(needle)) {
        delete state.devEntryOpenState[key];
      }
    });
  }

  function autoScrollVerticalOnDrag(event, container) {
    if (!event || !container) return;

    const rect = container.getBoundingClientRect();
    const pointerY = Number(event.clientY);
    if (!Number.isFinite(pointerY)) return;
    if (pointerY < rect.top || pointerY > rect.bottom) return;

    const threshold = 44;
    const maxStep = 28;
    let delta = 0;

    if (pointerY <= rect.top + threshold) {
      const ratio = (rect.top + threshold - pointerY) / threshold;
      delta = -Math.max(6, Math.round(maxStep * ratio));
    } else if (pointerY >= rect.bottom - threshold) {
      const ratio = (pointerY - (rect.bottom - threshold)) / threshold;
      delta = Math.max(6, Math.round(maxStep * ratio));
    }

    if (delta !== 0) {
      container.scrollTop += delta;
    }
  }

  function autoScrollHorizontalOnDrag(event, container) {
    if (!event || !container) return;

    const rect = container.getBoundingClientRect();
    const pointerX = Number(event.clientX);
    if (!Number.isFinite(pointerX)) return;
    if (pointerX < rect.left || pointerX > rect.right) return;

    const threshold = 44;
    const maxStep = 28;
    let delta = 0;

    if (pointerX <= rect.left + threshold) {
      const ratio = (rect.left + threshold - pointerX) / threshold;
      delta = -Math.max(6, Math.round(maxStep * ratio));
    } else if (pointerX >= rect.right - threshold) {
      const ratio = (pointerX - (rect.right - threshold)) / threshold;
      delta = Math.max(6, Math.round(maxStep * ratio));
    }

    if (delta !== 0) {
      container.scrollLeft += delta;
    }
  }

  function sortPluginKeysByOrder(keys) {
    return uniqueStringList(keys)
      .map((key) => ({ key, index: getPluginIndexByKey(key) }))
      .filter((entry) => entry.index >= 0)
      .sort((a, b) => a.index - b.index)
      .map((entry) => entry.key);
  }

  function getSelectedOrActivePluginKeys(fallbackKey) {
    const selected = state.selectedPluginKeys && state.selectedPluginKeys.length > 0
      ? state.selectedPluginKeys.slice()
      : [];

    if (selected.length > 0) {
      return sortPluginKeysByOrder(selected);
    }

    const key = cleanText(fallbackKey || state.activeTab);
    if (!key) return [];
    return getPluginIndexByKey(key) >= 0 ? [key] : [];
  }

  function duplicatePluginEntryWithUniqueKey(sourcePlugin, usedKeys) {
    const cloned = cloneJson(sourcePlugin || {});
    const name = String(cloned.name || '');
    const baseDescription = String(cloned.description || '');

    cloned.parameters = cloned.parameters && typeof cloned.parameters === 'object'
      ? cloned.parameters
      : {};

    let nextDescription = baseDescription;
    let nextKey = `${name}::${nextDescription}`;
    const used = usedKeys instanceof Set
      ? usedKeys
      : new Set(state.plugins.map((plugin) => makePluginKey(plugin)));

    let copyIndex = 2;

    while (used.has(nextKey)) {
      const suffix = ` [Copy ${copyIndex}]`;
      nextDescription = `${baseDescription}${suffix}`;
      nextKey = `${name}::${nextDescription}`;
      copyIndex += 1;
    }

    cloned.description = nextDescription;
    used.add(nextKey);
    return cloned;
  }

  function setPluginClipboard(mode, pluginKeys) {
    const orderedKeys = sortPluginKeysByOrder(pluginKeys);
    if (orderedKeys.length <= 0) return false;

    const entries = orderedKeys
      .map((key) => {
        const index = getPluginIndexByKey(key);
        return index >= 0 ? cloneJson(state.plugins[index]) : null;
      })
      .filter(Boolean);

    if (entries.length <= 0) return false;

    state.pluginEntryClipboard = {
      mode: mode === 'cut' ? 'cut' : 'copy',
      sourceKeys: orderedKeys,
      entries
    };

    return true;
  }

  function copyPluginEntries(pluginKeys) {
    const explicitKeys = Array.isArray(pluginKeys)
      ? sortPluginKeysByOrder(pluginKeys)
      : (cleanText(pluginKeys) ? [cleanText(pluginKeys)] : []);
    const keys = explicitKeys.length > 0 ? explicitKeys : getSelectedOrActivePluginKeys();
    if (keys.length <= 0) {
      showToast('Select plugin row(s) first.', 'bad');
      return;
    }

    if (!setPluginClipboard('copy', keys)) {
      showToast('Failed to copy plugin entries.', 'bad');
      return;
    }

    showToast(keys.length === 1 ? 'Plugin entry copied.' : `${keys.length} plugin entries copied.`, 'good');
  }

  function cutPluginEntries(pluginKeys) {
    const explicitKeys = Array.isArray(pluginKeys)
      ? sortPluginKeysByOrder(pluginKeys)
      : (cleanText(pluginKeys) ? [cleanText(pluginKeys)] : []);
    const keys = explicitKeys.length > 0 ? explicitKeys : getSelectedOrActivePluginKeys();
    if (keys.length <= 0) {
      showToast('Select plugin row(s) first.', 'bad');
      return;
    }

    if (!setPluginClipboard('cut', keys)) {
      showToast('Failed to cut plugin entries.', 'bad');
      return;
    }

    showToast(keys.length === 1 ? 'Plugin entry cut.' : `${keys.length} plugin entries cut.`, 'good');
  }

  function hasPluginClipboardData() {
    return Boolean(
      state.pluginEntryClipboard
      && Array.isArray(state.pluginEntryClipboard.entries)
      && state.pluginEntryClipboard.entries.length > 0
    );
  }

  function getPluginPasteInsertIndex(targetKey) {
    const preferred = cleanText(targetKey)
      || (state.selectedPluginKeys.length > 0 ? state.selectedPluginKeys[state.selectedPluginKeys.length - 1] : '')
      || cleanText(state.activeTab);

    if (!preferred) return state.plugins.length;

    const index = getPluginIndexByKey(preferred);
    return index >= 0 ? index + 1 : state.plugins.length;
  }

  function pastePluginEntries(targetKey) {
    if (!hasPluginClipboardData()) {
      showToast('Plugin clipboard is empty.', 'bad');
      return;
    }

    const clipboard = state.pluginEntryClipboard;
    const sourceKeys = sortPluginKeysByOrder(clipboard.sourceKeys || []);
    const isCut = clipboard.mode === 'cut' && sourceKeys.length > 0;
    let insertAt = getPluginPasteInsertIndex(targetKey);
    let pastedKeys = [];

    if (isCut) {
      const movingSet = new Set(sourceKeys);
      const moving = [];
      const rest = [];

      for (let i = 0; i < state.plugins.length; i += 1) {
        const plugin = state.plugins[i];
        const key = makePluginKey(plugin);
        if (movingSet.has(key)) {
          moving.push(plugin);
        } else {
          rest.push(plugin);
        }
      }

      if (moving.length <= 0) {
        showToast('Cut source entries no longer exist.', 'bad');
        state.pluginEntryClipboard = null;
        return;
      }

      const removedBeforeInsert = sourceKeys.reduce((count, key) => {
        const index = getPluginIndexByKey(key);
        return index >= 0 && index < insertAt ? count + 1 : count;
      }, 0);

      const safeInsert = Math.max(0, Math.min(rest.length, insertAt - removedBeforeInsert));
      state.plugins = rest.slice(0, safeInsert).concat(moving).concat(rest.slice(safeInsert));

      pastedKeys = moving.map((plugin) => makePluginKey(plugin));
      state.pluginEntryClipboard = null;
    } else {
      const toInsert = [];
      const usedKeys = new Set(state.plugins.map((plugin) => makePluginKey(plugin)));

      for (let i = 0; i < clipboard.entries.length; i += 1) {
        const duplicated = duplicatePluginEntryWithUniqueKey(clipboard.entries[i], usedKeys);
        const key = makePluginKey(duplicated);
        const sourceKey = sourceKeys[i] || sourceKeys[sourceKeys.length - 1] || '';

        if (sourceKey && Object.prototype.hasOwnProperty.call(state.pluginFolderMap, sourceKey)) {
          state.pluginFolderMap[key] = state.pluginFolderMap[sourceKey];
        }

        if (sourceKey && Object.prototype.hasOwnProperty.call(state.pluginTags, sourceKey)) {
          state.pluginTags[key] = cloneJson(state.pluginTags[sourceKey]);
        }

        toInsert.push(duplicated);
      }

      if (toInsert.length <= 0) {
        showToast('Nothing to paste from plugin clipboard.', 'bad');
        return;
      }

      const boundedInsert = Math.max(0, Math.min(state.plugins.length, insertAt));
      state.plugins.splice(boundedInsert, 0, ...toInsert);
      pastedKeys = toInsert.map((plugin) => makePluginKey(plugin));
    }

    if (pastedKeys.length <= 0) {
      showToast('Nothing changed after paste.', 'bad');
      return;
    }

    for (let i = 0; i < pastedKeys.length; i += 1) {
      if (!state.openTabs.includes(pastedKeys[i])) {
        state.openTabs.push(pastedKeys[i]);
      }
    }

    const nextActive = pastedKeys[pastedKeys.length - 1];
    setSelectedPluginKeys(pastedKeys, nextActive);

    markPluginsDirty();
    markLayoutDirty();
    renderAll();

    showToast(
      pastedKeys.length === 1
        ? (isCut ? 'Plugin entry moved.' : 'Plugin entry pasted.')
        : (isCut ? `${pastedKeys.length} plugin entries moved.` : `${pastedKeys.length} plugin entries pasted.`),
      'good'
    );
  }

  function cloneJson(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function cleanText(value) {
    return String(value === undefined || value === null ? '' : value).trim();
  }

  function normalizeRuntimeRelativePath(value) {
    return cleanText(value || '')
      .replace(/\\+/g, '/')
      .replace(/^\/+/, '')
      .replace(/\/+/g, '/');
  }

  function ensureTrailingSlash(value) {
    const normalized = normalizeRuntimeRelativePath(value);
    if (!normalized) return '';
    return normalized.endsWith('/') ? normalized : `${normalized}/`;
  }

  function splitPathSegments(value) {
    return normalizeRuntimeRelativePath(value)
      .split('/')
      .map((segment) => cleanText(segment))
      .filter(Boolean);
  }

  function decodeNoteEscapeInput(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\\\\/g, '\\')
      .replace(/\\n/gi, '\n');
  }

  function encodeNoteEscapeOutput(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\\/g, '\\\\')
      .replace(/\\\\(?=")/g, '\\')
      .replace(/\n/g, '\\n');
  }

  function parseSearchQuery(rawValue) {
    const raw = String(rawValue || '').trim();
    if (!raw) {
      return {
        textTerms: [],
        tagTerms: []
      };
    }

    const tokens = raw.split(/\s+/).filter(Boolean);
    const textTerms = [];
    const tagTerms = [];
    const usedTags = new Set();

    for (let i = 0; i < tokens.length; i += 1) {
      const token = tokens[i];
      if (token.charAt(0) === '#') {
        const tag = token.slice(1).trim().toLowerCase();
        if (!tag || usedTags.has(tag)) continue;
        usedTags.add(tag);
        tagTerms.push(tag);
      } else {
        textTerms.push(token.toLowerCase());
      }
    }

    return {
      textTerms,
      tagTerms
    };
  }

  function normalizeScrollPositionPoint(value) {
    const source = value && typeof value === 'object' ? value : {};
    const leftRaw = Number(source.left);
    const topRaw = Number(source.top);

    return {
      left: Number.isFinite(leftRaw) && leftRaw > 0 ? leftRaw : 0,
      top: Number.isFinite(topRaw) && topRaw > 0 ? topRaw : 0
    };
  }

  function normalizeManagerLayoutScrollPositions(value) {
    const source = value && typeof value === 'object' ? value : {};

    return {
      window: normalizeScrollPositionPoint(source.window),
      workspaceLayout: normalizeScrollPositionPoint(source.workspaceLayout),
      folderTree: normalizeScrollPositionPoint(source.folderTree),
      pluginList: normalizeScrollPositionPoint(source.pluginList),
      editorContent: normalizeScrollPositionPoint(source.editorContent),
      tabsBar: normalizeScrollPositionPoint(source.tabsBar)
    };
  }

  function normalizeBooleanRecord(value) {
    const source = value && typeof value === 'object' ? value : {};
    const out = {};

    Object.keys(source).forEach((rawKey) => {
      const key = cleanText(rawKey || '');
      if (!key) return;
      out[key] = Boolean(source[rawKey]);
    });

    return out;
  }

  function hasManagerLayoutScrollData(scrollPositions) {
    if (!scrollPositions || typeof scrollPositions !== 'object') return false;

    return Object.keys(scrollPositions).some((key) => {
      const point = scrollPositions[key] && typeof scrollPositions[key] === 'object'
        ? scrollPositions[key]
        : null;
      if (!point) return false;
      return (Number(point.left) || 0) > 0 || (Number(point.top) || 0) > 0;
    });
  }

  function captureElementScrollPosition(element) {
    if (!element) return { left: 0, top: 0 };

    return {
      left: Math.max(0, Number(element.scrollLeft) || 0),
      top: Math.max(0, Number(element.scrollTop) || 0)
    };
  }

  function captureWindowScrollPosition() {
    const left = Math.max(0,
      Number(window.scrollX)
      || Number(window.pageXOffset)
      || Number(document.documentElement.scrollLeft)
      || Number(document.body.scrollLeft)
      || 0
    );

    const top = Math.max(0,
      Number(window.scrollY)
      || Number(window.pageYOffset)
      || Number(document.documentElement.scrollTop)
      || Number(document.body.scrollTop)
      || 0
    );

    return { left, top };
  }

  function restoreElementScrollPosition(element, value) {
    if (!element) return;
    const point = normalizeScrollPositionPoint(value);
    element.scrollLeft = point.left;
    element.scrollTop = point.top;
  }

  function restoreWindowScrollPosition(value) {
    const point = normalizeScrollPositionPoint(value);
    window.scrollTo(point.left, point.top);
    document.documentElement.scrollLeft = point.left;
    document.documentElement.scrollTop = point.top;
    document.body.scrollLeft = point.left;
    document.body.scrollTop = point.top;
  }

  function resetManagerViewRuntimeState() {
    state.uiZoomPercent = 100;
    applyUiZoom();

    const zero = { left: 0, top: 0 };
    restoreElementScrollPosition(dom.workspaceLayout, zero);
    restoreElementScrollPosition(dom.folderTree, zero);
    restoreElementScrollPosition(dom.pluginList, zero);
    restoreElementScrollPosition(dom.editorContent, zero);
    restoreElementScrollPosition(dom.tabsBar, zero);
    restoreWindowScrollPosition(zero);
  }

  function applyManagerLayoutScrollPositions(managerLayout) {
    const normalized = normalizeManagerLayout(managerLayout);
    if (!normalized) return;

    const scrollPositions = normalized.scrollPositions || normalizeManagerLayoutScrollPositions(null);

    restoreElementScrollPosition(dom.workspaceLayout, scrollPositions.workspaceLayout);
    restoreElementScrollPosition(dom.folderTree, scrollPositions.folderTree);
    restoreElementScrollPosition(dom.pluginList, scrollPositions.pluginList);
    restoreElementScrollPosition(dom.editorContent, scrollPositions.editorContent);
    restoreElementScrollPosition(dom.tabsBar, scrollPositions.tabsBar);
    restoreWindowScrollPosition(scrollPositions.window);
  }

  function scheduleManagerLayoutScrollRestore(managerLayout) {
    const normalized = normalizeManagerLayout(managerLayout);
    if (!normalized) return;

    const apply = () => {
      if (!state.managerLayout) return;
      applyManagerLayoutScrollPositions(state.managerLayout);
    };

    requestAnimationFrame(() => {
      apply();
      requestAnimationFrame(() => {
        apply();
      });
    });

    setTimeout(apply, 120);
    setTimeout(apply, 360);
  }

  function normalizeManagerLayout(value) {
    if (!value || typeof value !== 'object') return null;

    const zoomRaw = Math.round(Number(value.uiZoomPercent));
    const uiZoomPercent = Number.isFinite(zoomRaw)
      ? Math.max(50, Math.min(300, zoomRaw))
      : 100;

    const scrollPositions = normalizeManagerLayoutScrollPositions(value.scrollPositions);
    const editorDetailsOpenState = normalizeBooleanRecord(value.editorDetailsOpenState);
    const typedTreeOpenState = normalizeBooleanRecord(value.typedTreeOpenState);
    const devEntryOpenState = normalizeBooleanRecord(value.devEntryOpenState);

    const next = {
      openTabs: uniqueStringList(value.openTabs),
      activeTab: cleanText(value.activeTab || ''),
      folderSearch: String(value.folderSearch || ''),
      pluginSearch: String(value.pluginSearch || ''),
      tabSearch: String(value.tabSearch || ''),
      paramSearch: String(value.paramSearch || ''),
      schemaSearch: String(value.schemaSearch || ''),
      structSchemaSearch: String(value.structSchemaSearch || ''),
      uiZoomPercent,
      scrollPositions,
      editorDetailsOpenState,
      typedTreeOpenState,
      devEntryOpenState,
      lastOpenedGameRoot: cleanText(value.lastOpenedGameRoot || '')
    };

    const hasData = next.openTabs.length > 0
      || next.activeTab
      || next.folderSearch
      || next.pluginSearch
      || next.tabSearch
      || next.paramSearch
      || next.schemaSearch
      || next.structSchemaSearch
      || next.uiZoomPercent !== 100
      || hasManagerLayoutScrollData(next.scrollPositions)
      || Object.keys(next.editorDetailsOpenState).length > 0
      || Object.keys(next.typedTreeOpenState).length > 0
      || Object.keys(next.devEntryOpenState).length > 0
      || next.lastOpenedGameRoot;

    return hasData ? next : null;
  }

  function captureManagerLayout() {
    const zoomRaw = Math.round(Number(state.uiZoomPercent) || 100);
    const uiZoomPercent = Math.max(50, Math.min(300, zoomRaw));

    return {
      openTabs: state.openTabs.slice(),
      activeTab: state.activeTab || '',
      folderSearch: state.folderSearch || '',
      pluginSearch: state.searchText || '',
      tabSearch: state.tabSearch || '',
      paramSearch: state.paramSearch || '',
      schemaSearch: state.schemaSearch || '',
      structSchemaSearch: state.structSchemaSearch || '',
      uiZoomPercent,
      scrollPositions: {
        window: captureWindowScrollPosition(),
        workspaceLayout: captureElementScrollPosition(dom.workspaceLayout),
        folderTree: captureElementScrollPosition(dom.folderTree),
        pluginList: captureElementScrollPosition(dom.pluginList),
        editorContent: captureElementScrollPosition(dom.editorContent),
        tabsBar: captureElementScrollPosition(dom.tabsBar)
      },
      editorDetailsOpenState: cloneJson(state.editorDetailsOpenState),
      typedTreeOpenState: cloneJson(state.typedTreeOpenState),
      devEntryOpenState: cloneJson(state.devEntryOpenState),
      lastOpenedGameRoot: state.project
        ? cleanText(state.project.gameRoot || state.project.displayPath || '')
        : ''
    };
  }

  function getAllKnownTags() {
    const out = [];
    const used = new Set();

    Object.keys(state.pluginTags).forEach((pluginKey) => {
      const tags = toUniqueTags(state.pluginTags[pluginKey]);
      for (let i = 0; i < tags.length; i += 1) {
        const raw = cleanText(tags[i]);
        if (!raw) continue;
        const key = raw.toLowerCase();
        if (used.has(key)) continue;
        used.add(key);
        out.push(raw);
      }
    });

    out.sort((a, b) => a.localeCompare(b));
    return out;
  }

  function syncSearchInputsFromState() {
    dom.inputFolderSearch.value = state.folderSearch || '';
    dom.inputSearch.value = state.searchText || '';
    dom.inputTabSearch.value = state.tabSearch || '';
    dom.inputParamSearch.value = state.paramSearch || '';
    dom.inputSchemaSearch.value = state.schemaSearch || '';
    dom.inputStructSchemaSearch.value = state.structSchemaSearch || '';
  }

  function applyManagerLayout(managerLayout, validPluginKeys) {
    const normalized = normalizeManagerLayout(managerLayout);
    if (!normalized) return;

    const pluginSet = validPluginKeys || new Set(state.plugins.map((plugin) => makePluginKey(plugin)));
    state.openTabs = normalized.openTabs.filter((key) => pluginSet.has(key));

    if (normalized.activeTab && pluginSet.has(normalized.activeTab)) {
      state.activeTab = normalized.activeTab;
    } else {
      state.activeTab = state.openTabs.length > 0 ? state.openTabs[0] : null;
    }

    state.folderSearch = normalized.folderSearch;
    state.searchText = normalized.pluginSearch;
    state.tabSearch = normalized.tabSearch;
    state.paramSearch = normalized.paramSearch;
    state.schemaSearch = normalized.schemaSearch;
    state.structSchemaSearch = normalized.structSchemaSearch;
    state.uiZoomPercent = normalized.uiZoomPercent;
    state.editorDetailsOpenState = cloneJson(normalized.editorDetailsOpenState || {});
    state.typedTreeOpenState = cloneJson(normalized.typedTreeOpenState || {});
    state.devEntryOpenState = cloneJson(normalized.devEntryOpenState || {});

    applyEditorSectionDetailsState();

    if (state.activeTab) {
      setSelectedPluginKeys([state.activeTab], state.activeTab);
    }

    state.managerLayout = normalized;
  }

  function showTextPrompt(options) {
    const config = options && typeof options === 'object' ? options : {};

    return new Promise((resolve) => {
      const previousActive = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

      dom.textPromptTitle.textContent = cleanText(config.title) || 'Enter value';
      dom.textPromptMessage.textContent = cleanText(config.message) || '';
      dom.textPromptInput.placeholder = cleanText(config.placeholder) || '';
      dom.textPromptInput.value = String(config.defaultValue || '');
      dom.textPromptInput.classList.remove('hidden');
      dom.textPromptInput.readOnly = false;
      dom.textPromptCancel.textContent = cleanText(config.cancelLabel) || 'Cancel';
      dom.textPromptConfirm.textContent = cleanText(config.confirmLabel) || 'OK';

      dom.textPromptModal.classList.remove('hidden');
      dom.textPromptInput.focus();
      dom.textPromptInput.select();

      function cleanup(result) {
        dom.textPromptModal.classList.add('hidden');
        dom.textPromptInput.value = '';
        dom.textPromptInput.classList.remove('hidden');
        dom.textPromptInput.readOnly = false;

        dom.textPromptCancel.removeEventListener('click', onCancel);
        dom.textPromptConfirm.removeEventListener('click', onConfirm);
        dom.textPromptModal.removeEventListener('click', onBackdrop);
        dom.textPromptInput.removeEventListener('keydown', onKeyDown);

        if (previousActive && document.contains(previousActive)) {
          try {
            previousActive.focus();
          } catch (_error) {
            // no-op
          }
        }

        resolve(result);
      }

      function onCancel() {
        cleanup(null);
      }

      function onConfirm() {
        cleanup(dom.textPromptInput.value);
      }

      function onBackdrop(event) {
        if (event.target === dom.textPromptModal) {
          cleanup(null);
        }
      }

      function onKeyDown(event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          cleanup(dom.textPromptInput.value);
          return;
        }

        if (event.key === 'Escape') {
          event.preventDefault();
          cleanup(null);
        }
      }

      dom.textPromptCancel.addEventListener('click', onCancel);
      dom.textPromptConfirm.addEventListener('click', onConfirm);
      dom.textPromptModal.addEventListener('click', onBackdrop);
      dom.textPromptInput.addEventListener('keydown', onKeyDown);
    });
  }

  function showConfirmPrompt(options) {
    const config = options && typeof options === 'object' ? options : {};

    return new Promise((resolve) => {
      const previousActive = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

      dom.textPromptTitle.textContent = cleanText(config.title) || 'Confirm';
      dom.textPromptMessage.textContent = cleanText(config.message) || '';
      dom.textPromptInput.value = '';
      dom.textPromptInput.placeholder = '';
      dom.textPromptInput.classList.add('hidden');
      dom.textPromptInput.readOnly = true;
      dom.textPromptCancel.textContent = cleanText(config.cancelLabel) || 'Cancel';
      dom.textPromptConfirm.textContent = cleanText(config.confirmLabel) || 'OK';

      dom.textPromptModal.classList.remove('hidden');
      dom.textPromptConfirm.focus();

      function cleanup(result) {
        dom.textPromptModal.classList.add('hidden');
        dom.textPromptInput.classList.remove('hidden');
        dom.textPromptInput.readOnly = false;

        dom.textPromptCancel.removeEventListener('click', onCancel);
        dom.textPromptConfirm.removeEventListener('click', onConfirm);
        dom.textPromptModal.removeEventListener('click', onBackdrop);
        dom.textPromptModal.removeEventListener('keydown', onKeyDown);

        if (previousActive && document.contains(previousActive)) {
          try {
            previousActive.focus();
          } catch (_error) {
            // no-op
          }
        }

        resolve(Boolean(result));
      }

      function onCancel() {
        cleanup(false);
      }

      function onConfirm() {
        cleanup(true);
      }

      function onBackdrop(event) {
        if (event.target === dom.textPromptModal) {
          cleanup(false);
        }
      }

      function onKeyDown(event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          cleanup(true);
          return;
        }

        if (event.key === 'Escape') {
          event.preventDefault();
          cleanup(false);
        }
      }

      dom.textPromptCancel.addEventListener('click', onCancel);
      dom.textPromptConfirm.addEventListener('click', onConfirm);
      dom.textPromptModal.addEventListener('click', onBackdrop);
      dom.textPromptModal.addEventListener('keydown', onKeyDown);
    });
  }

  function getTagTokenAtCursor(input) {
    if (!input) return null;

    const value = String(input.value || '');
    const cursor = typeof input.selectionStart === 'number' ? input.selectionStart : value.length;

    let start = cursor;
    while (start > 0 && !/\s/.test(value.charAt(start - 1))) {
      start -= 1;
    }

    let end = cursor;
    while (end < value.length && !/\s/.test(value.charAt(end))) {
      end += 1;
    }

    const token = value.slice(start, end);
    if (!token || token.charAt(0) !== '#') return null;

    return {
      start,
      end,
      prefix: token.slice(1).toLowerCase()
    };
  }

  function hideTagSuggest() {
    state.tagSuggest.input = null;
    state.tagSuggest.options = [];
    state.tagSuggest.activeIndex = -1;
    state.tagSuggest.tokenStart = 0;
    state.tagSuggest.tokenEnd = 0;

    dom.tagSuggestMenu.classList.add('hidden');
    dom.tagSuggestMenu.innerHTML = '';
  }

  function applyTagSuggestion(tagValue) {
    const input = state.tagSuggest.input;
    if (!input) return;

    const value = String(input.value || '');
    const start = state.tagSuggest.tokenStart;
    const end = state.tagSuggest.tokenEnd;
    const replacement = `#${tagValue}`;

    let next = `${value.slice(0, start)}${replacement}${value.slice(end)}`;
    let cursor = start + replacement.length;

    if (cursor >= next.length || !/\s/.test(next.charAt(cursor))) {
      next = `${next.slice(0, cursor)} ${next.slice(cursor)}`;
      cursor += 1;
    }

    input.value = next;
    input.focus();
    input.setSelectionRange(cursor, cursor);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    hideTagSuggest();
  }

  function renderTagSuggestMenu(input, token, options) {
    const rect = input.getBoundingClientRect();

    state.tagSuggest.input = input;
    state.tagSuggest.options = options.slice();
    state.tagSuggest.activeIndex = options.length > 0 ? 0 : -1;
    state.tagSuggest.tokenStart = token.start;
    state.tagSuggest.tokenEnd = token.end;

    dom.tagSuggestMenu.innerHTML = '';
    dom.tagSuggestMenu.style.left = `${Math.round(rect.left)}px`;
    dom.tagSuggestMenu.style.top = `${Math.round(rect.bottom + 6)}px`;
    dom.tagSuggestMenu.style.width = `${Math.round(rect.width)}px`;

    options.forEach((tagName, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `tag-suggest-option ${index === state.tagSuggest.activeIndex ? 'active' : ''}`;
      btn.textContent = `#${tagName}`;
      btn.addEventListener('mousedown', (event) => {
        event.preventDefault();
      });
      btn.addEventListener('click', () => {
        applyTagSuggestion(tagName);
      });
      dom.tagSuggestMenu.appendChild(btn);
    });

    dom.tagSuggestMenu.classList.remove('hidden');
  }

  function updateTagSuggestForInput(input) {
    const token = getTagTokenAtCursor(input);
    if (!token) {
      hideTagSuggest();
      return;
    }

    const tags = getAllKnownTags();
    const options = tags.filter((tagName) => {
      if (!token.prefix) return true;
      return tagName.toLowerCase().includes(token.prefix);
    }).slice(0, 40);

    if (options.length <= 0) {
      hideTagSuggest();
      return;
    }

    renderTagSuggestMenu(input, token, options);
  }

  function handleTagSuggestKeyDown(event) {
    if (dom.tagSuggestMenu.classList.contains('hidden')) return;
    if (state.tagSuggest.input !== event.currentTarget) return;

    const maxIndex = state.tagSuggest.options.length - 1;
    if (maxIndex < 0) {
      hideTagSuggest();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      state.tagSuggest.activeIndex = Math.min(maxIndex, state.tagSuggest.activeIndex + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      state.tagSuggest.activeIndex = Math.max(0, state.tagSuggest.activeIndex - 1);
    } else if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      const chosen = state.tagSuggest.options[state.tagSuggest.activeIndex] || state.tagSuggest.options[0];
      if (chosen) {
        applyTagSuggestion(chosen);
      }
      return;
    } else if (event.key === 'Escape') {
      event.preventDefault();
      hideTagSuggest();
      return;
    } else {
      return;
    }

    const buttons = dom.tagSuggestMenu.querySelectorAll('.tag-suggest-option');
    buttons.forEach((button, index) => {
      button.classList.toggle('active', index === state.tagSuggest.activeIndex);
    });
  }

  function normalizeFolderRecord(candidate, fallbackOrder) {
    const source = candidate && typeof candidate === 'object' ? candidate : {};
    const id = cleanText(source.id);
    const name = cleanText(source.name);
    if (!id || !name) return null;

    return {
      id,
      name,
      parentId: source.parentId === undefined || source.parentId === null
        ? null
        : cleanText(source.parentId) || null,
      order: Number.isFinite(Number(source.order)) ? Number(source.order) : Number(fallbackOrder || 0)
    };
  }

  function reindexSiblingOrders(folders) {
    const counts = {};
    for (let i = 0; i < folders.length; i += 1) {
      const folder = folders[i];
      const key = String(folder.parentId || 'ROOT');
      const nextOrder = counts[key] || 0;
      folder.order = nextOrder;
      counts[key] = nextOrder + 1;
    }
  }

  function ensureFolders(rawFolders) {
    const source = Array.isArray(rawFolders) ? rawFolders : [];
    const output = [];
    const used = new Set();

    for (let i = 0; i < source.length; i += 1) {
      const normalized = normalizeFolderRecord(source[i], i);
      if (!normalized) continue;
      if (used.has(normalized.id)) continue;
      used.add(normalized.id);
      output.push(normalized);
    }

    if (!used.has('ungrouped')) {
      output.unshift(cloneJson(DEFAULT_FOLDER));
      used.add('ungrouped');
    }

    for (let i = 0; i < output.length; i += 1) {
      const folder = output[i];
      if (!folder.parentId) continue;
      if (folder.parentId === folder.id || !used.has(folder.parentId)) {
        folder.parentId = null;
      }
    }

    output.sort((a, b) => {
      if (a.id === 'ungrouped') return -1;
      if (b.id === 'ungrouped') return 1;
      if (a.parentId === b.parentId) {
        if (a.order !== b.order) return a.order - b.order;
        return a.name.localeCompare(b.name);
      }
      return String(a.parentId || '').localeCompare(String(b.parentId || ''));
    });

    reindexSiblingOrders(output);
    return output;
  }

  function toUniqueTags(value) {
    const source = Array.isArray(value)
      ? value
      : String(value || '').split(',');
    const out = [];
    const used = new Set();

    for (let i = 0; i < source.length; i += 1) {
      const clean = cleanText(source[i]);
      if (!clean) continue;
      const key = clean.toLowerCase();
      if (used.has(key)) continue;
      used.add(key);
      out.push(clean);
    }

    return out;
  }

  function toLegacyStatePayload(snapshot) {
    const groups = Array.isArray(snapshot.groups) ? snapshot.groups : [];
    const pluginToGroup = snapshot.pluginToGroup && typeof snapshot.pluginToGroup === 'object'
      ? snapshot.pluginToGroup
      : {};

    const folders = groups.map((group, index) => {
      const id = cleanText(group.id);
      const name = cleanText(group.name);
      if (!id || !name) return null;

      return {
        id: id === 'default' ? 'ungrouped' : id,
        name: id === 'default' ? 'Ungrouped' : name,
        parentId: null,
        order: index
      };
    }).filter(Boolean);

    const pluginFolderMap = {};
    Object.keys(pluginToGroup).forEach((pluginKey) => {
      const folderId = cleanText(pluginToGroup[pluginKey]) || 'default';
      pluginFolderMap[pluginKey] = folderId === 'default' ? 'ungrouped' : folderId;
    });

    return {
      folders,
      pluginFolderMap,
      pluginTags: {},
      folderCollapsed: {}
    };
  }

  function normalizeIncomingState(snapshot) {
    let payload = null;

    if (snapshot && snapshot.state && typeof snapshot.state === 'object') {
      payload = snapshot.state;
    } else if (snapshot && (snapshot.groups || snapshot.pluginToGroup)) {
      payload = toLegacyStatePayload(snapshot);
    } else if (snapshot && typeof snapshot === 'object') {
      payload = snapshot;
    } else {
      payload = {};
    }

    const folders = ensureFolders(payload.folders);
    const folderIds = new Set(folders.map((folder) => folder.id));

    const pluginFolderMap = {};
    const sourceMap = payload.pluginFolderMap && typeof payload.pluginFolderMap === 'object'
      ? payload.pluginFolderMap
      : {};

    const pluginTags = {};
    const sourceTags = payload.pluginTags && typeof payload.pluginTags === 'object'
      ? payload.pluginTags
      : {};

    const folderCollapsed = {};
    const sourceCollapsed = payload.folderCollapsed && typeof payload.folderCollapsed === 'object'
      ? payload.folderCollapsed
      : {};

    const managerLayout = normalizeManagerLayout(payload.managerLayout);

    Object.keys(sourceCollapsed).forEach((folderId) => {
      if (!folderIds.has(folderId)) return;
      folderCollapsed[folderId] = Boolean(sourceCollapsed[folderId]);
    });

    state.plugins.forEach((plugin) => {
      const key = makePluginKey(plugin);
      const folderId = cleanText(sourceMap[key]) || 'ungrouped';
      pluginFolderMap[key] = folderIds.has(folderId) ? folderId : 'ungrouped';

      const tags = toUniqueTags(sourceTags[key]);
      if (tags.length > 0) {
        pluginTags[key] = tags;
      }
    });

    return {
      folders,
      pluginFolderMap,
      pluginTags,
      folderCollapsed,
      managerLayout
    };
  }

  function getFolderLookup() {
    const map = new Map();
    for (let i = 0; i < state.folders.length; i += 1) {
      const folder = state.folders[i];
      map.set(folder.id, folder);
    }
    return map;
  }

  function getFolderById(folderId) {
    const id = cleanText(folderId);
    if (!id) return null;
    for (let i = 0; i < state.folders.length; i += 1) {
      if (state.folders[i].id === id) return state.folders[i];
    }
    return null;
  }

  function getFolderChildrenMap() {
    const map = new Map();
    for (let i = 0; i < state.folders.length; i += 1) {
      const folder = state.folders[i];
      const parentKey = folder.parentId || '__ROOT__';
      if (!map.has(parentKey)) map.set(parentKey, []);
      map.get(parentKey).push(folder);
    }

    map.forEach((list) => {
      list.sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.name.localeCompare(b.name);
      });
    });

    return map;
  }

  function getFolderDisplayPath(folderId) {
    if (!folderId) return 'Ungrouped';
    const lookup = getFolderLookup();
    const folder = lookup.get(folderId);
    if (!folder) return 'Ungrouped';

    const labels = [folder.name];
    let current = folder;
    let guard = 0;

    while (current && current.parentId && guard < 40) {
      guard += 1;
      current = lookup.get(current.parentId) || null;
      if (!current) break;
      labels.unshift(current.name);
    }

    return labels.join(' / ');
  }

  function getFolderDescendantSet(folderId) {
    const targetId = cleanText(folderId);
    if (!targetId || targetId === 'all') {
      return null;
    }

    const childrenMap = getFolderChildrenMap();
    const out = new Set([targetId]);
    const stack = [targetId];

    while (stack.length > 0) {
      const current = stack.pop();
      const children = childrenMap.get(current) || [];
      for (let i = 0; i < children.length; i += 1) {
        const child = children[i];
        if (out.has(child.id)) continue;
        out.add(child.id);
        stack.push(child.id);
      }
    }

    return out;
  }

  function isFolderDescendant(candidateId, parentId) {
    const lookup = getFolderLookup();
    let current = lookup.get(candidateId);
    let guard = 0;

    while (current && current.parentId && guard < 50) {
      guard += 1;
      if (current.parentId === parentId) return true;
      current = lookup.get(current.parentId) || null;
    }

    return false;
  }

  function getPluginFolderIdByKey(pluginKey) {
    const folderId = cleanText(state.pluginFolderMap[pluginKey]) || 'ungrouped';
    return getFolderById(folderId) ? folderId : 'ungrouped';
  }

  function setPluginFolderIdByKey(pluginKey, folderId) {
    const target = cleanText(folderId) || 'ungrouped';
    const safe = getFolderById(target) ? target : 'ungrouped';
    state.pluginFolderMap[pluginKey] = safe;
  }

  function getPluginTagsByKey(pluginKey) {
    return toUniqueTags(state.pluginTags[pluginKey]);
  }

  function setPluginTagsByKey(pluginKey, tags) {
    const normalized = toUniqueTags(tags);
    if (normalized.length <= 0) {
      delete state.pluginTags[pluginKey];
    } else {
      state.pluginTags[pluginKey] = normalized;
    }
  }

  function slugify(value) {
    return cleanText(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function generateFolderId(name) {
    const used = new Set(state.folders.map((folder) => folder.id));
    const base = slugify(name) || `folder-${Date.now()}`;
    let candidate = base;
    let count = 1;

    while (used.has(candidate)) {
      count += 1;
      candidate = `${base}-${count}`;
    }

    return candidate;
  }

  function getNextFolderOrder(parentId) {
    const siblingOrders = state.folders
      .filter((folder) => (folder.parentId || null) === (parentId || null))
      .map((folder) => Number(folder.order) || 0);

    if (siblingOrders.length <= 0) return 0;
    return Math.max(...siblingOrders) + 1;
  }

  function moveFolderToParent(folderId, parentId) {
    const folder = getFolderById(folderId);
    if (!folder || folder.id === 'ungrouped') return false;

    const normalizedParent = parentId === 'all' ? null : cleanText(parentId) || null;

    if (normalizedParent === folder.id) return false;
    if (normalizedParent && !getFolderById(normalizedParent)) return false;
    if (normalizedParent && isFolderDescendant(normalizedParent, folder.id)) return false;

    folder.parentId = normalizedParent;
    folder.order = getNextFolderOrder(normalizedParent);
    reindexSiblingOrders(state.folders);
    return true;
  }

  function normalizePluginKeys(pluginKeys) {
    return uniqueStringList(pluginKeys).filter((pluginKey) => getPluginIndexByKey(pluginKey) >= 0);
  }

  function setPluginEnabledStateByKeys(pluginKeys, enabled) {
    const keys = normalizePluginKeys(pluginKeys);
    if (keys.length <= 0) return 0;

    const target = Boolean(enabled);
    let changed = 0;

    for (let i = 0; i < keys.length; i += 1) {
      const pluginIndex = getPluginIndexByKey(keys[i]);
      if (pluginIndex < 0) continue;

      const plugin = state.plugins[pluginIndex];
      if (Boolean(plugin.status) === target) continue;
      plugin.status = target;
      changed += 1;
    }

    return changed;
  }

  function togglePluginEnabledStateByKeys(pluginKeys) {
    const keys = normalizePluginKeys(pluginKeys);
    if (keys.length <= 0) return 0;

    let changed = 0;
    for (let i = 0; i < keys.length; i += 1) {
      const pluginIndex = getPluginIndexByKey(keys[i]);
      if (pluginIndex < 0) continue;

      const plugin = state.plugins[pluginIndex];
      plugin.status = !Boolean(plugin.status);
      changed += 1;
    }

    return changed;
  }

  function applyPluginStatusAction(pluginKeys, mode) {
    const keys = normalizePluginKeys(pluginKeys);
    if (keys.length <= 0) return;

    let changed = 0;
    if (mode === 'enable') {
      changed = setPluginEnabledStateByKeys(keys, true);
    } else if (mode === 'disable') {
      changed = setPluginEnabledStateByKeys(keys, false);
    } else {
      changed = togglePluginEnabledStateByKeys(keys);
    }

    if (changed <= 0) {
      renderPluginList();
      return;
    }

    markPluginsDirty();
    renderAll();
  }

  function buildPluginStatusMenuEntry(pluginKeys) {
    const keys = normalizePluginKeys(pluginKeys);
    if (keys.length <= 0) {
      return {
        label: 'Enable',
        disabled: true,
        action: () => {}
      };
    }

    const statuses = keys.map((pluginKey) => {
      const index = getPluginIndexByKey(pluginKey);
      return index >= 0 ? Boolean(state.plugins[index].status) : false;
    });

    const allOn = statuses.every(Boolean);
    const allOff = statuses.every((value) => !value);

    if (allOn) {
      return {
        label: keys.length > 1 ? 'Disable Selected' : 'Disable',
        action: () => applyPluginStatusAction(keys, 'disable')
      };
    }

    if (allOff) {
      return {
        label: keys.length > 1 ? 'Enable Selected' : 'Enable',
        action: () => applyPluginStatusAction(keys, 'enable')
      };
    }

    return {
      label: keys.length > 1 ? 'Toggle Selected Enable/Disable' : 'Toggle Enable/Disable',
      action: () => applyPluginStatusAction(keys, 'toggle')
    };
  }

  function collectPluginKeysInsideFolders(folderIds) {
    const ids = uniqueStringList(folderIds).filter((folderId) => {
      return folderId === 'all' || Boolean(getFolderById(folderId));
    });

    if (ids.length <= 0) return [];
    if (ids.includes('all')) {
      return state.plugins.map((plugin) => makePluginKey(plugin));
    }

    const descendantSets = ids.map((folderId) => getFolderDescendantSet(folderId));
    const out = [];

    state.plugins.forEach((plugin) => {
      const key = makePluginKey(plugin);
      const folderId = getPluginFolderIdByKey(key);

      const matched = descendantSets.some((set) => set && set.has(folderId));
      if (matched) {
        out.push(key);
      }
    });

    return uniqueStringList(out);
  }

  function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'bad' ? 'bad' : 'good'}`;
    toast.textContent = message;
    dom.toastStack.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3200);
  }

  function removeSettingsButtonTooltip() {
    if (settingsButtonTooltipTimer) {
      clearTimeout(settingsButtonTooltipTimer);
      settingsButtonTooltipTimer = null;
    }

    if (settingsButtonTooltipNode && settingsButtonTooltipNode.parentElement) {
      settingsButtonTooltipNode.remove();
    }
    settingsButtonTooltipNode = null;
  }

  function showSettingsButtonTooltip(target, message) {
    if (!target || !message) return;

    removeSettingsButtonTooltip();

    settingsButtonTooltipTimer = setTimeout(() => {
      settingsButtonTooltipTimer = null;

      const rect = target.getBoundingClientRect();
      const tooltip = document.createElement('div');
      tooltip.className = 'hover-tooltip';
      tooltip.textContent = String(message);
      tooltip.style.left = `${Math.max(8, Math.round(rect.left + (rect.width / 2)))}px`;
      tooltip.style.top = `${Math.max(8, Math.round(rect.top - 8))}px`;
      tooltip.style.transform = 'translate(-50%, -100%)';

      document.body.appendChild(tooltip);
      settingsButtonTooltipNode = tooltip;
    }, SETTINGS_BUTTON_TOOLTIP_DELAY_MS);
  }

  function bindSettingsButtonTooltip(target, message) {
    if (!target) return;

    target.addEventListener('mouseenter', () => {
      showSettingsButtonTooltip(target, message);
    });

    target.addEventListener('mouseleave', removeSettingsButtonTooltip);
    target.addEventListener('blur', removeSettingsButtonTooltip);
    target.addEventListener('mousedown', removeSettingsButtonTooltip);
  }

  async function apiGet(url) {
    const response = await fetch(url, { cache: 'no-store' });
    const json = await response.json();
    if (!response.ok || json.ok === false) {
      throw new Error(json.error || `GET ${url} failed`);
    }
    return json;
  }

  async function apiPost(url, data) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data || {})
    });

    const json = await response.json();
    if (!response.ok || json.ok === false) {
      throw new Error(json.error || `POST ${url} failed`);
    }
    return json;
  }

  function applySnapshot(snapshot) {
    state.project = snapshot.project || null;
    state.plugins = Array.isArray(snapshot.plugins) ? snapshot.plugins : [];

    const normalized = normalizeIncomingState(snapshot);
    state.folders = normalized.folders;
    state.pluginFolderMap = normalized.pluginFolderMap;
    state.pluginTags = normalized.pluginTags;
    state.folderCollapsed = normalized.folderCollapsed;
    state.managerLayout = normalized.managerLayout;

    // Reload starts from neutral view state, then reapplies saved manager layout if present.
    resetManagerViewRuntimeState();

    if (state.selectedFolderId !== 'all' && !getFolderById(state.selectedFolderId)) {
      state.selectedFolderId = 'all';
    }

    state.pluginsDirty = false;
    state.layoutDirty = false;
    state.managerLayoutDirty = false;

    state.metadataCache = {};
    state.metadataPromise = {};
    state.schemaDrafts = {};
    state.schemaDirtyKeys = {};
    state.structSchemaDrafts = {};
    state.structSchemaDirtyKeys = {};

    state.dataCatalog = null;
    state.dataCatalogPromise = null;
    state.fileListCache = {};
    state.pluginEntryClipboard = null;
    state.schemaParamClipboard = null;
    state.structBlockClipboard = null;
    state.devSelectionByScope = {};
    state.paramSelectionByPlugin = {};
    state.paramSelectionAnchorByPlugin = {};
    state.dragSchemaSelectionUids = [];
    state.dragStructSchemaSelectionUids = [];

    // Keep tabs that still exist.
    const pluginKeys = new Set(state.plugins.map(makePluginKey));
    state.openTabs = state.openTabs.filter((key) => pluginKeys.has(key));
    if (state.activeTab && !pluginKeys.has(state.activeTab)) {
      state.activeTab = state.openTabs.length > 0 ? state.openTabs[0] : null;
    }

    state.selectedPluginKeys = state.selectedPluginKeys.filter((key) => pluginKeys.has(key));
    if (state.selectedPluginKeys.length <= 0 && state.activeTab) {
      state.selectedPluginKeys = [state.activeTab];
    }
    if (state.lastPluginSelectionKey && !pluginKeys.has(state.lastPluginSelectionKey)) {
      state.lastPluginSelectionKey = state.selectedPluginKeys[0] || null;
    }

    const folderIds = new Set(['all'].concat(state.folders.map((folder) => folder.id)));
    state.selectedFolderIds = state.selectedFolderIds.filter((folderId) => folderIds.has(folderId));
    if (state.selectedFolderIds.length <= 0) {
      state.selectedFolderIds = ['all'];
    }
    if (!folderIds.has(state.selectedFolderId)) {
      state.selectedFolderId = state.selectedFolderIds[0] || 'all';
    }
    if (!state.selectedFolderIds.includes(state.selectedFolderId)) {
      state.selectedFolderIds.push(state.selectedFolderId);
    }
    if (state.lastFolderSelectionId && !folderIds.has(state.lastFolderSelectionId)) {
      state.lastFolderSelectionId = state.selectedFolderId;
    }

    if (state.managerLayout) {
      applyManagerLayout(state.managerLayout, pluginKeys);
    } else {
      state.managerLayout = normalizeManagerLayout(captureManagerLayout());
    }

    syncSearchInputsFromState();
    applyUiZoom();
    state.lastSelectionScope = '';
    state.lastEditorSelectionContext = null;
    resetHistoryBaseline();
    hideTagSuggest();

    renderAll();

    if (state.managerLayout) {
      scheduleManagerLayoutScrollRestore(state.managerLayout);
    } else {
      resetManagerViewRuntimeState();
    }
  }

  function markPluginsDirty() {
    recordHistoryCheckpoint();
    state.pluginsDirty = true;
    dom.btnSavePlugins.textContent = 'Save plugins.js *';
  }

  function markLayoutDirty() {
    recordHistoryCheckpoint();
    state.layoutDirty = true;
    dom.btnSaveState.textContent = 'Save Internal Folders *';
  }

  function managerLayoutFingerprint(layout) {
    try {
      return JSON.stringify(normalizeManagerLayout(layout) || null);
    } catch (_error) {
      return '';
    }
  }

  function refreshManagerLayoutDirtyState() {
    if (!state.project) {
      state.managerLayoutDirty = false;
      return;
    }

    const savedFingerprint = managerLayoutFingerprint(state.managerLayout);
    const currentFingerprint = managerLayoutFingerprint(captureManagerLayout());
    state.managerLayoutDirty = savedFingerprint !== currentFingerprint;
  }

  function requestManagerLayoutDirtyLabelRefresh() {
    if (managerLayoutLabelRefreshQueued) return;

    managerLayoutLabelRefreshQueued = true;
    requestAnimationFrame(() => {
      managerLayoutLabelRefreshQueued = false;
      clearDirtyLabels();
    });
  }

  function updateSchemaSaveButtonLabel() {
    const activeIndex = getActivePluginIndex();
    if (activeIndex < 0) {
      dom.btnSaveSchema.textContent = 'Save Plugin Parameter Schema';
      return;
    }

    const pluginKey = makePluginKey(state.plugins[activeIndex]);
    dom.btnSaveSchema.textContent = state.schemaDirtyKeys[pluginKey]
      ? 'Save Plugin Parameter Schema *'
      : 'Save Plugin Parameter Schema';
  }

  function updateStructSchemaSaveButtonLabel() {
    const activeIndex = getActivePluginIndex();
    if (activeIndex < 0) {
      dom.btnSaveStructSchema.textContent = 'Save Struct Schema';
      return;
    }

    const pluginKey = makePluginKey(state.plugins[activeIndex]);
    dom.btnSaveStructSchema.textContent = state.structSchemaDirtyKeys[pluginKey]
      ? 'Save Struct Schema *'
      : 'Save Struct Schema';
  }

  function clearDirtyLabels() {
    refreshManagerLayoutDirtyState();

    dom.btnSavePlugins.textContent = state.pluginsDirty
      ? 'Save plugins.js *'
      : 'Save plugins.js';

    dom.btnSaveState.textContent = state.layoutDirty
      ? 'Save Internal Folders *'
      : 'Save Internal Folders';

    dom.btnSaveManagerLayout.textContent = state.managerLayoutDirty
      ? 'Save Manager Layout *'
      : 'Save Manager Layout';

    updateSchemaSaveButtonLabel();
    updateStructSchemaSaveButtonLabel();
  }

  function getPluginIndexByKey(pluginKey) {
    return state.plugins.findIndex((plugin) => makePluginKey(plugin) === pluginKey);
  }

  function getActivePluginIndex() {
    if (!state.activeTab) return -1;
    return getPluginIndexByKey(state.activeTab);
  }

  function uniqueStringList(list) {
    const source = Array.isArray(list) ? list : [];
    const out = [];
    const used = new Set();

    for (let i = 0; i < source.length; i += 1) {
      const value = cleanText(source[i]);
      if (!value || used.has(value)) continue;
      used.add(value);
      out.push(value);
    }

    return out;
  }

  function setSelectedPluginKeys(nextKeys, activeKey) {
    const valid = new Set(state.plugins.map((plugin) => makePluginKey(plugin)));
    const selected = uniqueStringList(nextKeys).filter((key) => valid.has(key));

    state.selectedPluginKeys = selected;
    if (activeKey && valid.has(activeKey)) {
      state.activeTab = activeKey;
    } else if (state.activeTab && !valid.has(state.activeTab)) {
      state.activeTab = selected[0] || null;
    }

    if (selected.length > 0) {
      state.lastPluginSelectionKey = selected[selected.length - 1];
    }
  }

  function pluginSelectionForKey(pluginKey) {
    if (state.selectedPluginKeys.includes(pluginKey)) {
      return state.selectedPluginKeys.slice();
    }
    return [pluginKey];
  }

  function setSelectedFolderIds(nextIds, activeId) {
    const valid = new Set(['all'].concat(state.folders.map((folder) => folder.id)));
    const selected = uniqueStringList(nextIds).filter((folderId) => valid.has(folderId));
    const nextActive = cleanText(activeId || state.selectedFolderId);
    const fallback = valid.has(nextActive) ? nextActive : 'all';

    state.selectedFolderIds = selected.length > 0 ? selected : [fallback];
    state.selectedFolderId = valid.has(nextActive) ? nextActive : state.selectedFolderIds[0];
    if (!state.selectedFolderIds.includes(state.selectedFolderId)) {
      state.selectedFolderIds.push(state.selectedFolderId);
    }
    state.lastFolderSelectionId = state.selectedFolderId;
  }

  function folderSelectionForId(folderId) {
    if (state.selectedFolderIds.includes(folderId)) {
      return state.selectedFolderIds.slice();
    }
    return [folderId];
  }

  function handlePluginSelectionClick(pluginKey, event) {
    const order = state.visiblePluginOrder.slice();
    const toggleMode = Boolean(event && (event.ctrlKey || event.metaKey));
    const rangeMode = Boolean(event && event.shiftKey);

    state.lastSelectionScope = 'plugins';

    if (rangeMode && state.lastPluginSelectionKey && order.includes(state.lastPluginSelectionKey)) {
      const from = order.indexOf(state.lastPluginSelectionKey);
      const to = order.indexOf(pluginKey);
      if (from >= 0 && to >= 0) {
        const min = Math.min(from, to);
        const max = Math.max(from, to);
        const range = order.slice(min, max + 1);
        setSelectedPluginKeys(range, pluginKey);
        return;
      }
    }

    if (toggleMode) {
      const selected = state.selectedPluginKeys.slice();
      const idx = selected.indexOf(pluginKey);
      if (idx >= 0) {
        selected.splice(idx, 1);
      } else {
        selected.push(pluginKey);
      }
      setSelectedPluginKeys(selected, pluginKey);
      return;
    }

    setSelectedPluginKeys([pluginKey], pluginKey);
  }

  function handleFolderSelectionClick(folderId, event) {
    const order = ['all'].concat(state.visibleFolderOrder.slice());
    const toggleMode = Boolean(event && (event.ctrlKey || event.metaKey));
    const rangeMode = Boolean(event && event.shiftKey);

    state.lastSelectionScope = 'folders';

    if (rangeMode && state.lastFolderSelectionId && order.includes(state.lastFolderSelectionId)) {
      const from = order.indexOf(state.lastFolderSelectionId);
      const to = order.indexOf(folderId);
      if (from >= 0 && to >= 0) {
        const min = Math.min(from, to);
        const max = Math.max(from, to);
        const range = order.slice(min, max + 1);
        setSelectedFolderIds(range, folderId);
        return;
      }
    }

    if (toggleMode) {
      const selected = state.selectedFolderIds.slice();
      const idx = selected.indexOf(folderId);
      if (idx >= 0) {
        selected.splice(idx, 1);
      } else {
        selected.push(folderId);
      }
      setSelectedFolderIds(selected, folderId);
      return;
    }

    setSelectedFolderIds([folderId], folderId);
  }

  function renderProjectBadge() {
    if (!state.project) {
      dom.projectBadge.textContent = 'No project loaded';
      return;
    }

    const root = state.project.gameRoot || state.project.displayPath || '(unknown)';
    dom.projectBadge.textContent = `${state.project.engine} • ${root}`;
  }

  function getFilteredPluginsWithIndex() {
    const query = parseSearchQuery(state.searchText);
    const selectedSet = getFolderDescendantSet(state.selectedFolderId);

    return state.plugins
      .map((plugin, index) => {
        const key = makePluginKey(plugin);
        const folderId = getPluginFolderIdByKey(key);
        const tags = getPluginTagsByKey(key);

        return {
          plugin,
          index,
          key,
          folderId,
          tags
        };
      })
      .filter(({ plugin }) => {
        if (selectedSet && !selectedSet.has(getPluginFolderIdByKey(makePluginKey(plugin)))) {
          return false;
        }

        if (query.textTerms.length <= 0 && query.tagTerms.length <= 0) return true;

        const pluginKey = makePluginKey(plugin);
        const folderPath = getFolderDisplayPath(getPluginFolderIdByKey(pluginKey));
        const tags = getPluginTagsByKey(pluginKey);
        const tagsLower = tags.map((tag) => tag.toLowerCase());
        const haystack = `${plugin.name} ${plugin.description} ${folderPath} ${tags.join(' ')}`.toLowerCase();

        const textMatch = query.textTerms.every((term) => haystack.includes(term));
        const tagsMatch = query.tagTerms.every((tagTerm) => tagsLower.includes(tagTerm));

        return textMatch && tagsMatch;
      });
  }

  function openTabForPluginIndex(index) {
    const plugin = state.plugins[index];
    if (!plugin) return;

    const key = makePluginKey(plugin);
    if (!state.openTabs.includes(key)) {
      state.openTabs.push(key);
    }

    state.activeTab = key;
    setSelectedPluginKeys([key], key);
    renderAll();
  }

  function locatePluginByKey(pluginKey) {
    locatePluginInFoldersColumn(pluginKey);
  }

  function locatePluginInPluginsColumn(pluginKey) {
    const pluginIndex = getPluginIndexByKey(pluginKey);
    if (pluginIndex < 0) return;

    const folderId = getPluginFolderIdByKey(pluginKey);
    setSelectedFolderIds([folderId], folderId);
    setSelectedPluginKeys([pluginKey], pluginKey);

    if (!state.openTabs.includes(pluginKey)) {
      state.openTabs.push(pluginKey);
    }

    state.activeTab = pluginKey;
    renderAll();

    requestAnimationFrame(() => {
      const rows = dom.pluginList.querySelectorAll('.plugin-item');
      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        if (row.dataset.pluginKey === pluginKey) {
          row.scrollIntoView({ block: 'center', behavior: 'smooth' });
          break;
        }
      }
    });
  }

  function locatePluginInFoldersColumn(pluginKey) {
    const pluginIndex = getPluginIndexByKey(pluginKey);
    if (pluginIndex < 0) return;

    const folderId = getPluginFolderIdByKey(pluginKey);
    const folderLookup = getFolderLookup();

    // Ensure parent chain visible before scrolling target row.
    let current = folderLookup.get(folderId);
    let guard = 0;
    while (current && current.parentId && guard < 60) {
      guard += 1;
      state.folderCollapsed[current.parentId] = false;
      current = folderLookup.get(current.parentId) || null;
    }

    setSelectedFolderIds([folderId], folderId);
    setSelectedPluginKeys([pluginKey], pluginKey);

    if (!state.openTabs.includes(pluginKey)) {
      state.openTabs.push(pluginKey);
    }

    state.activeTab = pluginKey;
    renderAll();

    requestAnimationFrame(() => {
      const rows = dom.folderTree.querySelectorAll('.folder-row');
      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        if (row.dataset.folderId === folderId) {
          row.scrollIntoView({ block: 'center', behavior: 'smooth' });
          break;
        }
      }
    });
  }

  function clearFolderSearchAndLocate(folderId) {
    const targetFolderId = cleanText(folderId || '') || 'all';
    state.folderSearch = '';
    dom.inputFolderSearch.value = '';

    renderFolderTree();
    renderPluginList();
    requestManagerLayoutDirtyLabelRefresh();

    requestAnimationFrame(() => {
      const rows = dom.folderTree.querySelectorAll('.folder-row');
      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        if (row.dataset.folderId !== targetFolderId) continue;
        row.scrollIntoView({ block: 'center', behavior: 'smooth' });
        break;
      }
    });
  }

  function clearPluginSearchAndLocate(pluginKey) {
    const targetPluginKey = cleanText(pluginKey || '');
    if (!targetPluginKey) return;

    state.searchText = '';
    dom.inputSearch.value = '';

    renderPluginList();
    requestManagerLayoutDirtyLabelRefresh();

    requestAnimationFrame(() => {
      const rows = dom.pluginList.querySelectorAll('.plugin-item');
      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        if (row.dataset.pluginKey !== targetPluginKey) continue;
        row.scrollIntoView({ block: 'center', behavior: 'smooth' });
        break;
      }
    });
  }

  function clearParamSearchAndLocate(paramName) {
    const targetParamName = String(paramName === undefined || paramName === null ? '' : paramName);
    if (!targetParamName) return;

    state.paramSearch = '';
    dom.inputParamSearch.value = '';

    renderActivePluginPanel();
    requestManagerLayoutDirtyLabelRefresh();

    requestAnimationFrame(() => {
      const nodes = dom.paramsTree.querySelectorAll('.param-node');
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        if (String(node.dataset.paramName || '') !== targetParamName) continue;
        node.scrollIntoView({ block: 'center', behavior: 'smooth' });
        break;
      }
    });
  }

  function clearSchemaSearchAndLocate(entryUid) {
    const targetEntryUid = cleanText(entryUid || '');
    if (!targetEntryUid) return;

    state.schemaSearch = '';
    dom.inputSchemaSearch.value = '';

    renderActivePluginPanel();
    requestManagerLayoutDirtyLabelRefresh();

    requestAnimationFrame(() => {
      const entries = dom.schemaEditor.querySelectorAll('.schema-entry');
      for (let i = 0; i < entries.length; i += 1) {
        const entry = entries[i];
        if (entry.dataset.entryUid !== targetEntryUid) continue;
        entry.scrollIntoView({ block: 'center', behavior: 'smooth' });
        break;
      }
    });
  }

  function clearStructSchemaSearchAndLocate(entryUid) {
    const targetEntryUid = cleanText(entryUid || '');
    if (!targetEntryUid) return;

    state.structSchemaSearch = '';
    dom.inputStructSchemaSearch.value = '';

    renderActivePluginPanel();
    requestManagerLayoutDirtyLabelRefresh();

    requestAnimationFrame(() => {
      const entries = dom.structSchemaEditor.querySelectorAll('.schema-entry');
      for (let i = 0; i < entries.length; i += 1) {
        const entry = entries[i];
        if (entry.dataset.entryUid !== targetEntryUid) continue;
        entry.scrollIntoView({ block: 'center', behavior: 'smooth' });
        break;
      }
    });
  }

  function closeTab(pluginKey) {
    state.openTabs = state.openTabs.filter((key) => key !== pluginKey);
    if (state.activeTab === pluginKey) {
      state.activeTab = state.openTabs.length > 0 ? state.openTabs[state.openTabs.length - 1] : null;
    }
    renderAll();
  }

  function closeTabs(pluginKeys) {
    const keys = uniqueStringList(pluginKeys);
    if (keys.length <= 0) return;

    state.openTabs = state.openTabs.filter((key) => !keys.includes(key));
    if (state.activeTab && !state.openTabs.includes(state.activeTab)) {
      state.activeTab = state.openTabs.length > 0 ? state.openTabs[state.openTabs.length - 1] : null;
    }
    renderAll();
  }

  function switchActiveTabByOffset(offset) {
    const step = Number(offset) < 0 ? -1 : 1;
    const keys = state.openTabs.filter((key) => getPluginIndexByKey(key) >= 0);
    if (keys.length <= 0) return;

    const currentKey = keys.includes(state.activeTab) ? state.activeTab : keys[0];
    const currentIndex = keys.indexOf(currentKey);
    const nextIndex = (currentIndex + step + keys.length) % keys.length;
    const nextKey = keys[nextIndex];

    state.activeTab = nextKey;
    setSelectedPluginKeys([nextKey], nextKey);
    renderAll();

    requestAnimationFrame(() => {
      const tabs = dom.tabsBar.querySelectorAll('.tab-btn');
      for (let i = 0; i < tabs.length; i += 1) {
        const tab = tabs[i];
        if (tab.dataset.pluginKey !== nextKey) continue;
        tab.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
        break;
      }
    });
  }

  function mergeTabsAt(pluginKeys, insertIndex) {
    const keys = uniqueStringList(pluginKeys).filter((key) => getPluginIndexByKey(key) >= 0);
    if (keys.length <= 0) return;

    const old = state.openTabs.slice();
    const cleaned = old.filter((key) => !keys.includes(key));
    const safeInsert = Math.max(0, Math.min(Number(insertIndex) || 0, cleaned.length));

    state.openTabs = cleaned.slice(0, safeInsert).concat(keys).concat(cleaned.slice(safeInsert));
    state.activeTab = keys[keys.length - 1] || state.activeTab;
  }

  function reorderTabsToKey(pluginKeys, targetKey) {
    const keys = uniqueStringList(pluginKeys).filter((key) => state.openTabs.includes(key));
    if (keys.length <= 0) return;

    const existing = state.openTabs.slice();
    const targetIndex = existing.indexOf(targetKey);
    if (targetIndex < 0) {
      mergeTabsAt(keys, existing.length);
      return;
    }

    const filtered = existing.filter((key) => !keys.includes(key));
    const targetInFiltered = filtered.indexOf(targetKey);
    const insertAt = targetInFiltered < 0 ? filtered.length : targetInFiltered;
    state.openTabs = filtered.slice(0, insertAt).concat(keys).concat(filtered.slice(insertAt));
    state.activeTab = keys[keys.length - 1] || state.activeTab;
  }

  function dropPluginKeysToTabs(pluginKeys, targetKey) {
    const keys = uniqueStringList(pluginKeys).filter((key) => getPluginIndexByKey(key) >= 0);
    if (keys.length <= 0) return;

    if (targetKey) {
      const beforeIndex = state.openTabs.indexOf(targetKey);
      if (beforeIndex >= 0) {
        mergeTabsAt(keys, beforeIndex);
        return;
      }
    }

    mergeTabsAt(keys, state.openTabs.length);
  }

  function renderTabs() {
    dom.tabsBar.innerHTML = '';

    const search = state.tabSearch.trim().toLowerCase();
    let rendered = 0;

    state.openTabs.forEach((pluginKey) => {
      const index = getPluginIndexByKey(pluginKey);
      if (index < 0) return;

      const plugin = state.plugins[index];
      const pluginName = String(plugin.name || '(Unnamed Plugin)');

      if (search && !pluginName.toLowerCase().includes(search)) {
        return;
      }

      const tab = document.createElement('button');
      tab.className = `tab-btn ${state.activeTab === pluginKey ? 'active' : ''}`;
      if (state.selectedPluginKeys.includes(pluginKey)) {
        tab.classList.add('selected');
      }
      tab.type = 'button';
      tab.draggable = true;
      tab.dataset.pluginKey = pluginKey;
      tab.innerHTML = `<span>${escapeHtml(pluginName)}</span>`;
      tab.addEventListener('click', (event) => {
        handlePluginSelectionClick(pluginKey, event);
        state.activeTab = pluginKey;
        renderAll();
      });

      tab.addEventListener('dragstart', () => {
        const dragKeys = pluginSelectionForKey(pluginKey).filter((key) => state.openTabs.includes(key));
        state.dragSource = 'tabs';
        state.dragTabKey = pluginKey;
        state.dragPluginKeys = dragKeys.length > 0 ? dragKeys : [pluginKey];
        state.dragPluginKey = pluginKey;
      });

      tab.addEventListener('dragend', () => {
        state.dragSource = '';
        state.dragTabKey = null;
        state.dragPluginKeys = [];
        state.dragPluginKey = null;
      });

      tab.addEventListener('dragover', (event) => {
        event.preventDefault();
      });

      tab.addEventListener('drop', (event) => {
        event.preventDefault();

        if (!state.dragPluginKeys || state.dragPluginKeys.length <= 0) return;

        if (state.dragSource === 'tabs') {
          reorderTabsToKey(state.dragPluginKeys, pluginKey);
        } else {
          dropPluginKeysToTabs(state.dragPluginKeys, pluginKey);
        }

        renderAll();
      });

      tab.addEventListener('contextmenu', (event) => {
        const selected = pluginSelectionForKey(pluginKey);

        event.preventDefault();
        showContextMenu(event, [
          {
            label: selected.length > 1 ? 'Close Selected Tabs' : 'Close Tab',
            action: () => closeTabs(selected)
          },
          {
            label: 'Close Other Tabs',
            action: () => {
              state.openTabs = selected.slice();
              state.activeTab = pluginKey;
              renderAll();
            }
          },
          {
            label: 'Locate in Plugins Column',
            action: () => locatePluginInPluginsColumn(pluginKey)
          },
          {
            label: 'Locate in Internal Folders Column',
            action: () => locatePluginInFoldersColumn(pluginKey)
          }
        ]);
      });

      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'tab-close';
      close.textContent = 'x';
      close.addEventListener('click', (event) => {
        event.stopPropagation();
        closeTab(pluginKey);
      });

      tab.appendChild(close);
      dom.tabsBar.appendChild(tab);
      rendered += 1;
    });

    if (rendered <= 0) {
      const hint = document.createElement('div');
      hint.className = 'hint';
      hint.textContent = state.tabSearch.trim()
        ? 'No open tabs match your tab search.'
        : 'No tabs open.';
      dom.tabsBar.appendChild(hint);
    }
  }

  function showContextMenu(event, actions) {
    const list = Array.isArray(actions) ? actions.filter(Boolean) : [];
    if (list.length <= 0) return;

    event.preventDefault();
    event.stopPropagation();

    dom.contextMenu.innerHTML = '';

    list.forEach((entry) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = String(entry.label || '').trim() || 'Action';
      btn.disabled = Boolean(entry.disabled);
      btn.addEventListener('click', () => {
        hideContextMenu();
        if (!entry.disabled && typeof entry.action === 'function') {
          entry.action();
        }
      });
      dom.contextMenu.appendChild(btn);
    });

    dom.contextMenu.classList.remove('hidden');
    dom.contextMenu.style.left = `${event.clientX}px`;
    dom.contextMenu.style.top = `${event.clientY}px`;

    const rect = dom.contextMenu.getBoundingClientRect();
    let left = event.clientX;
    let top = event.clientY;

    if (left + rect.width > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - rect.width - 8);
    }
    if (top + rect.height > window.innerHeight - 8) {
      top = Math.max(8, window.innerHeight - rect.height - 8);
    }

    dom.contextMenu.style.left = `${left}px`;
    dom.contextMenu.style.top = `${top}px`;
  }

  function hideContextMenu() {
    dom.contextMenu.classList.add('hidden');
    dom.contextMenu.innerHTML = '';
  }

  function assignPluginKeysToFolder(pluginKeys, folderId) {
    const keys = uniqueStringList(pluginKeys).filter((key) => getPluginIndexByKey(key) >= 0);
    if (keys.length <= 0) return 0;

    const safeFolderId = getFolderById(folderId) ? folderId : 'ungrouped';
    let changed = 0;

    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (getPluginFolderIdByKey(key) === safeFolderId) continue;
      setPluginFolderIdByKey(key, safeFolderId);
      changed += 1;
    }

    return changed;
  }

  function movePluginKeysBefore(pluginKeys, targetKey) {
    const keys = uniqueStringList(pluginKeys).filter((key) => getPluginIndexByKey(key) >= 0);
    if (keys.length <= 0) return false;

    if (targetKey && keys.length === 1 && keys[0] === targetKey) {
      return false;
    }

    const movingSet = new Set(keys);
    const moving = [];
    const rest = [];

    for (let i = 0; i < state.plugins.length; i += 1) {
      const plugin = state.plugins[i];
      const key = makePluginKey(plugin);
      if (movingSet.has(key)) {
        moving.push(plugin);
      } else {
        rest.push(plugin);
      }
    }

    if (moving.length <= 0) return false;

    let insertAt = rest.length;
    if (targetKey) {
      const targetIndex = rest.findIndex((plugin) => makePluginKey(plugin) === targetKey);
      if (targetIndex >= 0) {
        insertAt = targetIndex;
      }
    }

    state.plugins = rest.slice(0, insertAt).concat(moving).concat(rest.slice(insertAt));
    return true;
  }

  function moveFolderKeysToParent(folderIds, parentId) {
    const ids = uniqueStringList(folderIds).filter((folderId) => {
      return folderId && folderId !== 'all' && folderId !== 'ungrouped' && getFolderById(folderId);
    });

    if (ids.length <= 0) return 0;

    const normalizedParent = parentId === 'all' ? null : cleanText(parentId) || null;
    if (normalizedParent && ids.includes(normalizedParent)) {
      return 0;
    }

    let moved = 0;
    for (let i = 0; i < ids.length; i += 1) {
      if (moveFolderToParent(ids[i], normalizedParent)) {
        moved += 1;
      }
    }
    return moved;
  }

  function renderFolderTree() {
    dom.folderTree.innerHTML = '';
    state.visibleFolderOrder = [];

    const childrenMap = getFolderChildrenMap();
    const folderLookup = getFolderLookup();
    const folderQuery = parseSearchQuery(state.folderSearch);

    const pluginRows = state.plugins.map((plugin) => {
      const key = makePluginKey(plugin);
      return {
        key,
        folderId: getPluginFolderIdByKey(key),
        tags: getPluginTagsByKey(key).map((tag) => tag.toLowerCase())
      };
    });

    const directCounts = {};
    state.plugins.forEach((plugin) => {
      const key = makePluginKey(plugin);
      const folderId = getPluginFolderIdByKey(key);
      directCounts[folderId] = (directCounts[folderId] || 0) + 1;
    });

    const totalFolders = state.folders.length;
    dom.folderCountBadge.textContent = String(totalFolders);

    const recursiveCountMemo = {};
    function recursiveCount(folderId) {
      if (recursiveCountMemo[folderId] !== undefined) {
        return recursiveCountMemo[folderId];
      }

      let total = directCounts[folderId] || 0;
      const children = childrenMap.get(folderId) || [];
      for (let i = 0; i < children.length; i += 1) {
        total += recursiveCount(children[i].id);
      }

      recursiveCountMemo[folderId] = total;
      return total;
    }

    const includeMemo = {};
    const tagMatchMemo = {};

    function folderHasMatchingPluginTags(folderId) {
      if (folderQuery.tagTerms.length <= 0) return true;
      if (tagMatchMemo[folderId] !== undefined) return tagMatchMemo[folderId];

      const descendants = getFolderDescendantSet(folderId);
      if (!descendants || descendants.size <= 0) {
        tagMatchMemo[folderId] = false;
        return false;
      }

      const matched = pluginRows.some((row) => {
        if (!descendants.has(row.folderId)) return false;
        return folderQuery.tagTerms.every((tagTerm) => row.tags.includes(tagTerm));
      });

      tagMatchMemo[folderId] = matched;
      return matched;
    }

    function includeFolder(folderId) {
      if (folderQuery.textTerms.length <= 0 && folderQuery.tagTerms.length <= 0) return true;
      if (includeMemo[folderId] !== undefined) return includeMemo[folderId];

      const folder = folderLookup.get(folderId);
      if (!folder) {
        includeMemo[folderId] = false;
        return false;
      }

      const folderPath = getFolderDisplayPath(folder.id).toLowerCase();
      const selfMatch = folderQuery.textTerms.length <= 0
        ? true
        : folderQuery.textTerms.every((term) => folderPath.includes(term));
      const children = childrenMap.get(folderId) || [];
      let childMatch = false;

      for (let i = 0; i < children.length; i += 1) {
        if (includeFolder(children[i].id)) {
          childMatch = true;
          break;
        }
      }

      const textMatch = selfMatch || childMatch;
      const tagMatch = folderHasMatchingPluginTags(folder.id);

      includeMemo[folderId] = textMatch && tagMatch;
      return includeMemo[folderId];
    }

    const allItem = document.createElement('div');
    allItem.className = 'folder-item';

    const allRow = document.createElement('div');
    allRow.className = `folder-row ${state.selectedFolderId === 'all' ? 'active' : ''}`;
    if (state.selectedFolderIds.includes('all')) {
      allRow.classList.add('selected');
    }
    allRow.innerHTML = `
      <span class="folder-toggle"></span>
      <span class="folder-name">All Plugins</span>
      <span class="folder-count">${state.plugins.length}</span>
    `;
    allRow.dataset.folderId = 'all';
    allRow.addEventListener('click', (event) => {
      handleFolderSelectionClick('all', event);
      renderFolderTree();
      renderPluginList();
    });
    allRow.addEventListener('contextmenu', (event) => {
      const allPluginKeys = state.plugins.map((plugin) => makePluginKey(plugin));

      showContextMenu(event, [
        {
          label: 'Enable plugins inside',
          disabled: allPluginKeys.length <= 0,
          action: () => applyPluginStatusAction(allPluginKeys, 'enable')
        },
        {
          label: 'Disable plugins inside',
          disabled: allPluginKeys.length <= 0,
          action: () => applyPluginStatusAction(allPluginKeys, 'disable')
        },
        {
          label: 'Add Root Folder',
          action: () => addFolder(null)
        },
        {
          label: 'Move Dragged Folder To Root',
          disabled: !state.dragFolderId && (!state.dragFolderIds || state.dragFolderIds.length <= 0),
          action: () => {
            const moved = moveFolderKeysToParent(
              state.dragFolderIds && state.dragFolderIds.length > 0 ? state.dragFolderIds : [state.dragFolderId],
              null
            );
            if (moved > 0) {
              markLayoutDirty();
              renderAll();
            }
          }
        }
      ]);
    });

    allItem.addEventListener('dragover', (event) => {
      event.preventDefault();
      autoScrollVerticalOnDrag(event, dom.folderTree);
      allItem.classList.add('folder-target');
    });

    allItem.addEventListener('dragleave', () => {
      allItem.classList.remove('folder-target');
    });

    allItem.addEventListener('drop', (event) => {
      event.preventDefault();
      event.stopPropagation();
      allItem.classList.remove('folder-target');

      if (state.dragPluginKeys && state.dragPluginKeys.length > 0) {
        const changed = assignPluginKeysToFolder(state.dragPluginKeys, 'ungrouped');
        if (changed > 0) {
          markLayoutDirty();
          renderAll();
        }
        return;
      }

      if (state.dragFolderIds && state.dragFolderIds.length > 0) {
        const moved = moveFolderKeysToParent(state.dragFolderIds, null);
        if (moved > 0) {
          markLayoutDirty();
          renderAll();
        }
      }
    });

    allItem.appendChild(allRow);
    dom.folderTree.appendChild(allItem);

    function appendFolderNode(folder, depth) {
      if (!includeFolder(folder.id)) return;

      const children = childrenMap.get(folder.id) || [];
      const isCollapsed = Boolean(state.folderCollapsed[folder.id]);

      const item = document.createElement('div');
      item.className = 'folder-item';

      const row = document.createElement('div');
      row.className = `folder-row ${state.selectedFolderId === folder.id ? 'active' : ''}`;
      row.style.paddingLeft = `${8 + depth * 16 + (depth > 0 ? 1 : 0)}px`;
      row.dataset.folderId = folder.id;

      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'folder-toggle';
      toggle.textContent = children.length > 0 ? (isCollapsed ? '▸' : '▾') : '';
      toggle.disabled = children.length <= 0;
      toggle.addEventListener('click', (event) => {
        event.stopPropagation();
        if (children.length <= 0) return;
        state.folderCollapsed[folder.id] = !state.folderCollapsed[folder.id];
        markLayoutDirty();
        renderFolderTree();
      });

      const name = document.createElement('span');
      name.className = 'folder-name';
      name.textContent = folder.name;

      const count = document.createElement('span');
      count.className = 'folder-count';
      count.textContent = String(recursiveCount(folder.id));

      row.appendChild(toggle);
      row.appendChild(name);
      row.appendChild(count);

      if (state.selectedFolderIds.includes(folder.id)) {
        row.classList.add('selected');
      }

      row.addEventListener('click', (event) => {
        handleFolderSelectionClick(folder.id, event);
        renderFolderTree();
        renderPluginList();
      });

      row.addEventListener('contextmenu', (event) => {
        const selectedIds = folderSelectionForId(folder.id).filter((id) => id !== 'all');
        const selectedPluginKeys = collectPluginKeysInsideFolders(selectedIds);

        const actions = [];

        if (state.folderSearch.trim()) {
          actions.push({
            label: 'Clear Search and Locate element',
            action: () => clearFolderSearchAndLocate(folder.id)
          });
        }

        actions.push(
          {
            label: 'Enable plugins inside',
            disabled: selectedPluginKeys.length <= 0,
            action: () => applyPluginStatusAction(selectedPluginKeys, 'enable')
          },
          {
            label: 'Disable plugins inside',
            disabled: selectedPluginKeys.length <= 0,
            action: () => applyPluginStatusAction(selectedPluginKeys, 'disable')
          },
          {
            label: 'Add Child Folder',
            action: () => addFolder(folder.id)
          },
          {
            label: 'Rename Folder',
            disabled: selectedIds.length !== 1 || selectedIds[0] === 'ungrouped',
            action: () => renameFolder(selectedIds[0])
          },
          {
            label: state.folderCollapsed[folder.id] ? 'Expand Folder' : 'Collapse Folder',
            disabled: children.length <= 0,
            action: () => {
              state.folderCollapsed[folder.id] = !state.folderCollapsed[folder.id];
              markLayoutDirty();
              renderFolderTree();
            }
          },
          {
            label: selectedIds.length > 1 ? 'Delete Selected Folders' : 'Delete Folder',
            disabled: selectedIds.length <= 0 || selectedIds.includes('ungrouped'),
            action: () => deleteFoldersById(selectedIds)
          }
        );

        showContextMenu(event, actions);
      });

      row.draggable = folder.id !== 'ungrouped';
      row.addEventListener('dragstart', () => {
        const selectedIds = folderSelectionForId(folder.id)
          .filter((id) => id !== 'all' && id !== 'ungrouped');
        state.dragSource = 'folders';
        state.dragFolderId = folder.id;
        state.dragFolderIds = selectedIds.length > 0 ? selectedIds : [folder.id];
      });
      row.addEventListener('dragend', () => {
        state.dragSource = '';
        state.dragFolderId = null;
        state.dragFolderIds = [];
      });

      item.addEventListener('dragover', (event) => {
        event.preventDefault();
        autoScrollVerticalOnDrag(event, dom.folderTree);
        item.classList.add('folder-target');
      });

      item.addEventListener('dragleave', () => {
        item.classList.remove('folder-target');
      });

      item.addEventListener('drop', (event) => {
        event.preventDefault();
        event.stopPropagation();
        item.classList.remove('folder-target');

        if (state.dragPluginKeys && state.dragPluginKeys.length > 0) {
          const changed = assignPluginKeysToFolder(state.dragPluginKeys, folder.id);
          if (changed <= 0) return;
          markLayoutDirty();
          renderAll();
          return;
        }

        if (state.dragFolderIds && state.dragFolderIds.length > 0) {
          const moved = moveFolderKeysToParent(state.dragFolderIds, folder.id);
          if (moved > 0) {
            markLayoutDirty();
            renderAll();
          }
        }
      });

      item.appendChild(row);
      dom.folderTree.appendChild(item);
      state.visibleFolderOrder.push(folder.id);

      if (!isCollapsed) {
        for (let i = 0; i < children.length; i += 1) {
          appendFolderNode(children[i], depth + 1);
        }
      }
    }

    const roots = childrenMap.get('__ROOT__') || [];
    for (let i = 0; i < roots.length; i += 1) {
      appendFolderNode(roots[i], 0);
    }
  }

  function renderPluginList() {
    dom.pluginList.innerHTML = '';

    const rows = getFilteredPluginsWithIndex();
    state.visiblePluginOrder = rows.map((row) => row.key);
    dom.pluginCountBadge.textContent = `${rows.length} / ${state.plugins.length}`;

    if (rows.length <= 0) {
      const empty = document.createElement('div');
      empty.className = 'hint';
      empty.textContent = 'No plugins match current filters.';
      dom.pluginList.appendChild(empty);
      return;
    }

    rows.forEach(({ plugin, index, key, folderId, tags }) => {
      const item = document.createElement('div');
      item.className = `plugin-item ${state.activeTab === key ? 'active' : ''}`;
      if (state.selectedPluginKeys.includes(key)) {
        item.classList.add('selected');
      }
      item.draggable = true;
      item.dataset.pluginKey = key;

      const tagsHtml = tags.length > 0
        ? `<div class="plugin-tags">${tags.map((tag) => `<span class="tag-chip">${escapeHtml(tag)}</span>`).join('')}</div>`
        : '';

      item.innerHTML = `
        <div class="plugin-row-top">
          <span class="plugin-name">${escapeHtml(plugin.name || '(Unnamed Plugin)')}</span>
          <span class="plugin-state ${plugin.status ? 'on' : 'off'}">${plugin.status ? 'ON' : 'OFF'}</span>
        </div>
        <div class="plugin-meta-line">Folder: ${escapeHtml(getFolderDisplayPath(folderId))}</div>
        ${tagsHtml}
      `;

      item.addEventListener('click', (event) => {
        handlePluginSelectionClick(key, event);

        if (!state.openTabs.includes(key)) {
          state.openTabs.push(key);
        }
        state.activeTab = key;
        renderAll();
      });

      item.addEventListener('contextmenu', (event) => {
        const selectedKeys = pluginSelectionForKey(key);
        const statusMenuEntry = buildPluginStatusMenuEntry(selectedKeys);
        const canPaste = hasPluginClipboardData();

        const actions = [];

        if (state.searchText.trim()) {
          actions.push({
            label: 'Clear Search and Locate element',
            action: () => clearPluginSearchAndLocate(key)
          });
        }

        actions.push(
          statusMenuEntry,
          {
            label: selectedKeys.length > 1 ? 'Copy Selected Plugin Entries' : 'Copy Plugin Entry',
            action: () => copyPluginEntries(selectedKeys)
          },
          {
            label: selectedKeys.length > 1 ? 'Cut Selected Plugin Entries' : 'Cut Plugin Entry',
            action: () => cutPluginEntries(selectedKeys)
          },
          {
            label: 'Paste Plugin Entry',
            disabled: !canPaste,
            action: () => pastePluginEntries(key)
          },
          {
            label: selectedKeys.length > 1 ? 'Open Selected In Tabs' : 'Open In Tab',
            action: () => {
              const list = uniqueStringList(selectedKeys);
              for (let i = 0; i < list.length; i += 1) {
                const pluginIndex = getPluginIndexByKey(list[i]);
                if (pluginIndex < 0) continue;
                if (!state.openTabs.includes(list[i])) {
                  state.openTabs.push(list[i]);
                }
              }
              state.activeTab = selectedKeys[selectedKeys.length - 1] || key;
              renderAll();
            }
          },
          {
            label: selectedKeys.length > 1 ? 'Move Selected To Folder' : 'Move To Selected Folder',
            disabled: state.selectedFolderId === 'all',
            action: () => {
              if (state.selectedFolderId === 'all') return;
              const changed = assignPluginKeysToFolder(selectedKeys, state.selectedFolderId);
              if (changed <= 0) return;
              markLayoutDirty();
              renderAll();
            }
          },
          {
            label: selectedKeys.length > 1 ? 'Remove Plugins' : 'Remove Plugin',
            action: () => deletePluginsByKey(selectedKeys)
          }
        );

        showContextMenu(event, actions);
      });

      item.addEventListener('dragstart', () => {
        const selectedKeys = pluginSelectionForKey(key);
        state.dragSource = 'plugins';
        state.dragPluginKey = key;
        state.dragPluginKeys = selectedKeys.length > 0 ? selectedKeys : [key];
      });

      item.addEventListener('dragend', () => {
        state.dragSource = '';
        state.dragPluginKey = null;
        state.dragPluginKeys = [];
      });

      item.addEventListener('dragover', (event) => {
        event.preventDefault();
        autoScrollVerticalOnDrag(event, dom.pluginList);
        item.classList.add('plugin-target');
      });

      item.addEventListener('dragleave', () => {
        item.classList.remove('plugin-target');
      });

      item.addEventListener('drop', (event) => {
        event.preventDefault();
        event.stopPropagation();
        item.classList.remove('plugin-target');

        if (!state.dragPluginKeys || state.dragPluginKeys.length <= 0) return;

        const moved = movePluginKeysBefore(state.dragPluginKeys, key);
        if (!moved) return;

        markPluginsDirty();
        renderAll();
      });

      dom.pluginList.appendChild(item);
    });
  }

  function normalizeBooleanText(value) {
    const lowered = String(value || '').trim().toLowerCase();
    if (lowered === 'true' || lowered === 'on' || lowered === '1' || lowered === 'yes') return 'true';
    if (lowered === 'false' || lowered === 'off' || lowered === '0' || lowered === 'no') return 'false';
    return 'false';
  }

  function addNumberWheelLock(input) {
    if (!input || input.dataset.numberWheelBound === '1') return;
    input.dataset.numberWheelBound = '1';
    input.dataset.numberWheel = '1';

    input.addEventListener('wheel', (event) => {
      if (event.defaultPrevented) return;
      applyNumberWheelStep(input, event, true);
    }, { passive: false });
  }

  function parseNumberInputAttr(rawValue) {
    const text = String(rawValue === undefined || rawValue === null ? '' : rawValue).trim();
    if (!text) return NaN;

    const out = Number(text);
    return Number.isFinite(out) ? out : NaN;
  }

  function applyNumberWheelStep(input, event, allowHover) {
    if (!(input instanceof HTMLInputElement)) return false;
    if (input.type !== 'number' || input.disabled || input.readOnly) return false;

    const focused = document.activeElement === input;
    const hovered = Boolean(allowHover && input.matches(':hover'));
    if (!focused && !hovered) return false;

    const raw = String(input.value || '').trim();
    let current = raw.length > 0 ? Number(raw) : NaN;

    if (!Number.isFinite(current)) {
      const minValue = parseNumberInputAttr(input.min);
      const maxValue = parseNumberInputAttr(input.max);
      if (Number.isFinite(minValue)) {
        current = minValue;
      } else if (Number.isFinite(maxValue)) {
        current = maxValue;
      } else {
        current = 0;
      }
    }

    if (!Number.isFinite(current)) return false;

    const stepRaw = Number(input.step);
    const step = Number.isFinite(stepRaw) && stepRaw > 0 ? stepRaw : 1;
    const multiplier = (event.shiftKey ? 10 : 1) * (event.altKey ? 100 : 1);
    const direction = event.deltaY < 0 ? 1 : -1;
    const delta = direction * step * multiplier;

    let nextValue = current + delta;

    const min = parseNumberInputAttr(input.min);
    const max = parseNumberInputAttr(input.max);
    if (Number.isFinite(min)) nextValue = Math.max(min, nextValue);
    if (Number.isFinite(max)) nextValue = Math.min(max, nextValue);

    const epsilon = Math.max(Number.EPSILON, step / 1000000);
    if (Math.abs(nextValue - current) <= epsilon && raw.length <= 0) {
      let alternateValue = current - delta;
      if (Number.isFinite(min)) alternateValue = Math.max(min, alternateValue);
      if (Number.isFinite(max)) alternateValue = Math.min(max, alternateValue);

      if (Math.abs(alternateValue - current) > epsilon) {
        nextValue = alternateValue;
      }
    }

    const changed = Math.abs(nextValue - current) > epsilon;
    if (!changed) {
      event.preventDefault();
      return true;
    }

    const stepText = String(step);
    const dotIndex = stepText.indexOf('.');
    const precision = dotIndex >= 0 ? stepText.length - dotIndex - 1 : 0;

    input.value = precision > 0 ? nextValue.toFixed(precision) : String(Math.round(nextValue));
    input.dispatchEvent(new Event('input', { bubbles: true }));
    event.preventDefault();
    return true;
  }

  function ensureOption(select, valueText) {
    const value = String(valueText === undefined || valueText === null ? '' : valueText);
    const exists = Array.from(select.options).some((option) => option.value === value);
    if (!exists && value !== '') {
      const custom = document.createElement('option');
      custom.value = value;
      custom.textContent = `(custom) ${value}`;
      select.appendChild(custom);
    }
    select.value = value;
  }

  async function ensureDataCatalog() {
    if (state.dataCatalog) return state.dataCatalog;

    if (!state.dataCatalogPromise) {
      state.dataCatalogPromise = apiGet('/api/data-catalog')
        .then((result) => {
          state.dataCatalog = result.entries && typeof result.entries === 'object'
            ? result.entries
            : {};
          return state.dataCatalog;
        })
        .finally(() => {
          state.dataCatalogPromise = null;
        });
    }

    return state.dataCatalogPromise;
  }

  async function ensureFileList(relativeDir) {
    const normalizedDir = cleanText(relativeDir || '');
    if (state.fileListCache[normalizedDir]) {
      return state.fileListCache[normalizedDir];
    }

    const result = await apiGet(`/api/files/list?dir=${encodeURIComponent(normalizedDir)}`);
    const entries = Array.isArray(result.entries) ? result.entries : [];
    state.fileListCache[normalizedDir] = entries;
    return entries;
  }

  function parseFileDirConfig(dirValue) {
    const rawDir = normalizeRuntimeRelativePath(dirValue || '');
    const out = {
      rawDir,
      fixedRoot: '',
      fixedCategory: '',
      fixedSubpath: '',
      customBase: ''
    };

    if (!rawDir) return out;

    const segments = splitPathSegments(rawDir);
    const root = String(segments[0] || '').toLowerCase();

    if (FILE_ROOT_OPTIONS.includes(root)) {
      out.fixedRoot = root;

      if ((root === 'img' || root === 'audio') && segments.length > 1) {
        out.fixedCategory = segments[1];
        out.fixedSubpath = segments.slice(2).join('/');
      } else {
        out.fixedSubpath = segments.slice(1).join('/');
      }

      return out;
    }

    out.customBase = rawDir;
    return out;
  }

  function listCategoryFolders(entries, root) {
    const normalizedRoot = String(root || '').toLowerCase();
    if (!normalizedRoot) return [];

    const prefix = `${normalizedRoot}/`;
    const set = new Set();
    const list = Array.isArray(entries) ? entries : [];

    for (let i = 0; i < list.length; i += 1) {
      const entry = normalizeRuntimeRelativePath(list[i]);
      if (!entry.startsWith(prefix)) continue;

      const rest = entry.slice(prefix.length);
      const slashIndex = rest.indexOf('/');
      if (slashIndex <= 0) continue;

      set.add(rest.slice(0, slashIndex));
    }

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  function makeFileTreeNode() {
    return {
      folders: new Map(),
      files: []
    };
  }

  function buildFileTreeFromEntries(entries, basePrefix) {
    const root = makeFileTreeNode();
    const prefix = ensureTrailingSlash(basePrefix);
    const list = Array.isArray(entries) ? entries : [];

    for (let i = 0; i < list.length; i += 1) {
      const entry = normalizeRuntimeRelativePath(list[i]);
      if (prefix && !entry.startsWith(prefix)) continue;

      const relative = prefix ? entry.slice(prefix.length) : entry;
      const segments = splitPathSegments(relative);
      if (segments.length <= 0) continue;

      let current = root;
      for (let j = 0; j < segments.length - 1; j += 1) {
        const folderName = segments[j];
        if (!current.folders.has(folderName)) {
          current.folders.set(folderName, makeFileTreeNode());
        }
        current = current.folders.get(folderName);
      }

      current.files.push(segments[segments.length - 1]);
    }

    return root;
  }

  function appendFileTreeRows(node, container, selectedRelativePath, onPick, relativePrefix, openStateMeta) {
    const folderNames = Array.from(node.folders.keys()).sort((a, b) => a.localeCompare(b));
    const files = node.files.slice().sort((a, b) => a.localeCompare(b));

    for (let i = 0; i < folderNames.length; i += 1) {
      const folderName = folderNames[i];
      const child = node.folders.get(folderName);
      const folderPrefix = `${relativePrefix}${folderName}/`;

      const details = document.createElement('details');
      details.className = 'typed-file-folder';
      bindTypedFileFolderDetailsState(
        details,
        openStateMeta,
        folderPrefix,
        Boolean(selectedRelativePath && selectedRelativePath.startsWith(folderPrefix))
      );

      const summary = document.createElement('summary');
      summary.textContent = `${folderName}/`;

      const childWrap = document.createElement('div');
      childWrap.className = 'typed-file-folder-children';
      appendFileTreeRows(child, childWrap, selectedRelativePath, onPick, folderPrefix, openStateMeta);

      details.appendChild(summary);
      details.appendChild(childWrap);
      container.appendChild(details);
    }

    for (let i = 0; i < files.length; i += 1) {
      const fileName = files[i];
      const relativePath = `${relativePrefix}${fileName}`;

      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'typed-file-option';
      if (relativePath === selectedRelativePath) {
        option.classList.add('active');
      }
      option.textContent = fileName;
      option.addEventListener('click', (event) => {
        event.preventDefault();
        onPick(relativePath);
      });
      container.appendChild(option);
    }
  }

  function renderTypedFileTreePanel(panel, entries, basePrefix, currentValue, onPick, openStateMeta) {
    panel.innerHTML = '';

    const prefix = ensureTrailingSlash(basePrefix);
    const selectedValue = normalizeRuntimeRelativePath(currentValue || '');
    const selectedRelativePath = prefix && selectedValue.startsWith(prefix)
      ? selectedValue.slice(prefix.length)
      : '';

    const tree = buildFileTreeFromEntries(entries, prefix);
    if (tree.folders.size <= 0 && tree.files.length <= 0) {
      const empty = document.createElement('div');
      empty.className = 'typed-file-empty';
      empty.textContent = 'No files found for current selection.';
      panel.appendChild(empty);
      return;
    }

    appendFileTreeRows(tree, panel, selectedRelativePath, (relativePath) => {
      const fullPath = normalizeRuntimeRelativePath(`${prefix}${relativePath}`);
      onPick(fullPath);
    }, '', openStateMeta);
  }

  function padDataId(value) {
    return String(Math.max(0, Number(value) || 0)).padStart(4, '0');
  }

  function formatDataRangeLabel(start, end) {
    return `[ ${padDataId(start)} - ${padDataId(end)} ]`;
  }

  function buildDataIdGroups(entries) {
    const validRows = (Array.isArray(entries) ? entries : [])
      .map((row) => {
        const id = Number(row && row.id);
        if (!Number.isFinite(id) || id <= 0) return null;
        return {
          id,
          name: cleanText(row && row.name) || '(Unnamed)'
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.id - b.id);

    if (validRows.length <= 0) {
      return [];
    }

    const maxId = validRows[validRows.length - 1].id;
    const groups = [];

    for (let start = 1; start <= maxId; start += 20) {
      const end = start + 19;
      const rows = validRows.filter((row) => row.id >= start && row.id <= end);
      groups.push({
        key: String(Math.floor((start - 1) / 20)),
        start,
        end,
        rows
      });
    }

    return groups;
  }

  function parseListValue(value) {
    const raw = String(value === undefined || value === null ? '' : value).trim();
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((entry) => String(entry === undefined || entry === null ? '' : entry));
      }
    } catch (_ignored) {
      // ignored
    }

    return raw
      .split(/\r?\n|,/)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }

  function parseStructValue(value) {
    const raw = String(value === undefined || value === null ? '' : value).trim();
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return Object.keys(parsed).map((key) => ({
          key,
          value: String(parsed[key] === undefined || parsed[key] === null ? '' : parsed[key])
        }));
      }
    } catch (_ignored) {
      // ignored
    }

    return [];
  }

  function parseStructObjectValue(value) {
    const raw = String(value === undefined || value === null ? '' : value).trim();
    if (!raw) return {};

    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const out = {};
        Object.keys(parsed).forEach((key) => {
          out[key] = String(parsed[key] === undefined || parsed[key] === null ? '' : parsed[key]);
        });
        return out;
      }
    } catch (_ignored) {
      // ignored
    }

    return {};
  }

  function getStructTypeName(typeValue) {
    const text = String(typeValue || '').trim();
    const match = /^struct<([^>]+)>$/i.exec(text);
    return match ? cleanText(match[1]) : '';
  }

  function resolveStructFields(meta) {
    const source = meta && typeof meta === 'object' ? meta : {};

    if (Array.isArray(source.structFields) && source.structFields.length > 0) {
      return source.structFields.map((field) => ({
        ...field,
        structMetadataMap: source.structMetadataMap || field.structMetadataMap || null
      }));
    }

    const structName = getStructTypeName(source.type);
    if (!structName) return [];

    const structMap = source.structMetadataMap && typeof source.structMetadataMap === 'object'
      ? source.structMetadataMap
      : null;
    if (!structMap) return [];

    const fields = Array.isArray(structMap[structName]) ? structMap[structName] : [];
    return fields.map((field) => ({
      ...field,
      structMetadataMap: structMap
    }));
  }

  function getListElementMeta(meta) {
    const sourceType = String(meta && meta.type ? meta.type : 'text');
    const elementType = sourceType.endsWith('[]') ? sourceType.slice(0, -2) : 'text';
    const lowerElementType = elementType.toLowerCase();

    return {
      ...meta,
      type: elementType,
      isList: false,
      isStruct: /^struct<.+>$/.test(lowerElementType)
    };
  }

  function createListControl(meta, initialValue, onChanged) {
    const wrapper = document.createElement('div');
    wrapper.className = 'typed-list';
    const listControlId = `list${nextListControlId}`;
    nextListControlId += 1;
    wrapper.dataset.listControlId = listControlId;

    const tree = document.createElement('details');
    tree.className = 'typed-list-tree';
    bindTypedTreeDetailsState(tree, meta, 'list', true);

    const summary = document.createElement('summary');
    summary.textContent = 'List Elements (0)';

    const treePanel = document.createElement('div');
    treePanel.className = 'typed-list-tree-panel';

    tree.appendChild(summary);
    tree.appendChild(treePanel);
    wrapper.appendChild(tree);

    const actions = document.createElement('div');
    actions.className = 'typed-list-actions';
    wrapper.appendChild(actions);

    let rows = parseListValue(initialValue);
    let rowUids = [];
    let selectedRowUids = [];
    let selectionAnchorUid = '';
    let dragSelectionUids = [];
    const elementMeta = getListElementMeta(meta);

    function buildListRowUid() {
      const uid = `li${state.nextDevUid}`;
      state.nextDevUid += 1;
      return uid;
    }

    function resetRowUids() {
      rowUids = rows.map(() => buildListRowUid());
      selectedRowUids = [];
      selectionAnchorUid = '';
      dragSelectionUids = [];
    }

    resetRowUids();

    function emit() {
      summary.textContent = `List Elements (${rows.length})`;
      onChanged(JSON.stringify(rows));
    }

    function indexByRowUid(rowUid) {
      return rowUids.indexOf(String(rowUid || ''));
    }

    function orderedSelectionUids(uids) {
      const selectedSet = new Set(uniqueStringList(uids));
      const out = [];

      for (let i = 0; i < rowUids.length; i += 1) {
        const uid = rowUids[i];
        if (!selectedSet.has(uid)) continue;
        out.push(uid);
      }

      return out;
    }

    function setSelectedRows(nextUids, options) {
      const config = options && typeof options === 'object' ? options : {};
      const validSet = new Set(rowUids);
      selectedRowUids = orderedSelectionUids(nextUids).filter((uid) => validSet.has(uid));

      if (!config.keepAnchor) {
        selectionAnchorUid = selectedRowUids.length > 0
          ? selectedRowUids[selectedRowUids.length - 1]
          : '';
      } else if (selectionAnchorUid && !validSet.has(selectionAnchorUid)) {
        selectionAnchorUid = selectedRowUids.length > 0
          ? selectedRowUids[selectedRowUids.length - 1]
          : '';
      }

      if (selectedRowUids.length > 0) {
        setLastEditorSelectionContext({
          kind: 'list',
          listControlId
        });
      }

      applySelectionClasses();
      return selectedRowUids.slice();
    }

    function resolveRowUidFromTarget(target) {
      const element = target instanceof Element
        ? target
        : (document.activeElement instanceof Element ? document.activeElement : null);
      if (!element) return '';

      const row = element.closest('.typed-list-row');
      if (!(row instanceof Element)) return '';
      if (!wrapper.contains(row)) return '';

      return cleanText(row.dataset.listRowUid || '');
    }

    function selectionForRow(rowUid) {
      if (selectedRowUids.includes(rowUid) && selectedRowUids.length > 0) {
        return selectedRowUids.slice();
      }
      return rowUid ? [rowUid] : [];
    }

    function selectionFromTarget(target, preferCurrentSelection) {
      const rowUid = resolveRowUidFromTarget(target);

      if (selectedRowUids.length > 0) {
        if (preferCurrentSelection || !rowUid || selectedRowUids.includes(rowUid)) {
          return selectedRowUids.slice();
        }
      }

      return rowUid ? [rowUid] : selectedRowUids.slice();
    }

    function selectedIndexesFromUids(selectionUids) {
      const selectedSet = new Set(uniqueStringList(selectionUids));
      const indexes = [];

      for (let i = 0; i < rowUids.length; i += 1) {
        if (!selectedSet.has(rowUids[i])) continue;
        indexes.push(i);
      }

      return indexes;
    }

    function selectedIndexes() {
      return selectedIndexesFromUids(selectedRowUids);
    }

    function copyRowsByUids(selectionUids) {
      const selectedSet = new Set(uniqueStringList(selectionUids));
      const copied = [];

      for (let i = 0; i < rows.length; i += 1) {
        if (!selectedSet.has(rowUids[i])) continue;
        copied.push(String(rows[i] === undefined || rows[i] === null ? '' : rows[i]));
      }

      if (copied.length <= 0) {
        return false;
      }

      setListClipboardItems(copied);
      showToast(copied.length > 1 ? 'List elements copied.' : 'List element copied.', 'good');
      return true;
    }

    function pasteRowsAt(index) {
      const clipboardItems = getListClipboardItems();
      if (clipboardItems.length <= 0) {
        return false;
      }

      const safeIndex = Math.max(0, Math.min(rows.length, Number(index) || 0));
      const insertedValues = clipboardItems.map((entry) => String(entry === undefined || entry === null ? '' : entry));
      const insertedUids = insertedValues.map(() => buildListRowUid());

      rows.splice(safeIndex, 0, ...insertedValues);
      rowUids.splice(safeIndex, 0, ...insertedUids);

      setSelectedRows(insertedUids);
      emit();
      renderRows();
      showToast(insertedValues.length > 1 ? 'List elements pasted.' : 'List element pasted.', 'good');
      return true;
    }

    function deleteRowsByUids(selectionUids) {
      const selectedSet = new Set(uniqueStringList(selectionUids));
      if (selectedSet.size <= 0) {
        return false;
      }

      let removed = 0;
      for (let i = rows.length - 1; i >= 0; i -= 1) {
        if (!selectedSet.has(rowUids[i])) continue;
        rows.splice(i, 1);
        rowUids.splice(i, 1);
        removed += 1;
      }

      if (removed <= 0) {
        return false;
      }

      setSelectedRows([]);
      emit();
      renderRows();
      showToast(removed > 1 ? 'Selected list elements removed.' : 'List element removed.', 'good');
      return true;
    }

    function moveRowsByUids(selectionUids, toIndex) {
      const selectedSet = new Set(uniqueStringList(selectionUids));
      if (selectedSet.size <= 0) return false;

      const beforeOrder = rowUids.join('|');
      const targetRaw = Number(toIndex);
      const targetIndex = Number.isFinite(targetRaw)
        ? Math.max(0, Math.min(rows.length, targetRaw))
        : 0;

      const selectedRows = [];
      const selectedIds = [];
      const remainingRows = [];
      const remainingIds = [];

      for (let i = 0; i < rows.length; i += 1) {
        if (selectedSet.has(rowUids[i])) {
          selectedRows.push(rows[i]);
          selectedIds.push(rowUids[i]);
        } else {
          remainingRows.push(rows[i]);
          remainingIds.push(rowUids[i]);
        }
      }

      if (selectedRows.length <= 0) {
        return false;
      }

      let selectedBeforeTarget = 0;
      for (let i = 0; i < targetIndex && i < rowUids.length; i += 1) {
        if (selectedSet.has(rowUids[i])) {
          selectedBeforeTarget += 1;
        }
      }

      const insertIndex = Math.max(0, Math.min(remainingRows.length, targetIndex - selectedBeforeTarget));

      remainingRows.splice(insertIndex, 0, ...selectedRows);
      remainingIds.splice(insertIndex, 0, ...selectedIds);

      rows.splice(0, rows.length, ...remainingRows);
      rowUids.splice(0, rowUids.length, ...remainingIds);

      if (beforeOrder === rowUids.join('|')) {
        return false;
      }

      setSelectedRows(selectedIds, { keepAnchor: true });
      emit();
      renderRows();
      return true;
    }

    function applySelectionClasses() {
      const selectedSet = new Set(selectedRowUids);
      const rowNodes = treePanel.querySelectorAll('.typed-list-row');

      for (let i = 0; i < rowNodes.length; i += 1) {
        const rowNode = rowNodes[i];
        const rowUid = cleanText(rowNode.dataset.listRowUid || '');
        rowNode.classList.toggle('selected', selectedSet.has(rowUid));
      }
    }

    function collectExpandableDetailsForRow(rowNode) {
      if (!(rowNode instanceof Element)) return [];

      const details = [];
      const seen = new Set();

      function pushDetails(nodeList) {
        for (let i = 0; i < nodeList.length; i += 1) {
          const detail = nodeList[i];
          if (!(detail instanceof HTMLDetailsElement)) continue;
          if (seen.has(detail)) continue;
          seen.add(detail);
          details.push(detail);
        }
      }

      const valueWrap = rowNode.querySelector('.typed-list-cell');
      const scope = valueWrap instanceof Element ? valueWrap : rowNode;
      pushDetails(scope.querySelectorAll('.typed-list-tree'));

      return details;
    }

    function countExpandableRows(selectionUids) {
      const selectedSet = new Set(uniqueStringList(selectionUids));
      if (selectedSet.size <= 0) return 0;

      const rowNodes = treePanel.querySelectorAll('.typed-list-row');
      let count = 0;

      for (let i = 0; i < rowNodes.length; i += 1) {
        const rowNode = rowNodes[i];
        const rowUid = cleanText(rowNode.dataset.listRowUid || '');
        if (!selectedSet.has(rowUid)) continue;
        if (collectExpandableDetailsForRow(rowNode).length <= 0) continue;
        count += 1;
      }

      return count;
    }

    function setRowsExpandedByUids(selectionUids, expanded) {
      const selected = uniqueStringList(selectionUids);
      if (selected.length <= 0) {
        showToast('No list elements selected.', 'bad');
        return true;
      }

      const selectedSet = new Set(selected);
      const rowNodes = treePanel.querySelectorAll('.typed-list-row');
      const nextOpen = Boolean(expanded);

      let expandableRows = 0;
      let changed = false;

      for (let i = 0; i < rowNodes.length; i += 1) {
        const rowNode = rowNodes[i];
        const rowUid = cleanText(rowNode.dataset.listRowUid || '');
        if (!selectedSet.has(rowUid)) continue;

        const details = collectExpandableDetailsForRow(rowNode);
        if (details.length <= 0) continue;

        expandableRows += 1;
        for (let j = 0; j < details.length; j += 1) {
          if (details[j].open === nextOpen) continue;
          details[j].open = nextOpen;
          changed = true;
        }
      }

      if (expandableRows <= 0) {
        showToast('Selected list elements have no expandable sections.', 'bad');
        return true;
      }

      if (changed) {
        requestManagerLayoutDirtyLabelRefresh();
      }

      setSelectedRows(selected, { keepAnchor: true });
      return true;
    }

    function clearDragClasses() {
      const rowNodes = treePanel.querySelectorAll('.typed-list-row');
      for (let i = 0; i < rowNodes.length; i += 1) {
        rowNodes[i].classList.remove('dragging');
        rowNodes[i].classList.remove('drop-before');
      }

      const gapNodes = treePanel.querySelectorAll('.typed-list-gap');
      for (let i = 0; i < gapNodes.length; i += 1) {
        gapNodes[i].classList.remove('drop-before');
      }
    }

    function hasDragSelection() {
      return Array.isArray(dragSelectionUids) && dragSelectionUids.length > 0;
    }

    function selectRangeTo(rowUid) {
      if (!rowUid) return;

      if (!selectionAnchorUid || indexByRowUid(selectionAnchorUid) < 0) {
        setSelectedRows([rowUid]);
        return;
      }

      const fromIndex = indexByRowUid(selectionAnchorUid);
      const toIndex = indexByRowUid(rowUid);
      if (fromIndex < 0 || toIndex < 0) {
        setSelectedRows([rowUid]);
        return;
      }

      const start = Math.min(fromIndex, toIndex);
      const end = Math.max(fromIndex, toIndex);
      const rangeUids = [];

      for (let i = start; i <= end; i += 1) {
        rangeUids.push(rowUids[i]);
      }

      setSelectedRows(rangeUids, { keepAnchor: true });
    }

    async function editElementPlainText(index) {
      const nextValue = await showPlainTextPreview(`List element ${index + 1}`, rows[index], {
        readOnly: false,
        message: 'Plain Text for this element. Edit and press Apply (or Ctrl+Enter).',
        confirmLabel: 'Apply',
        cancelLabel: 'Cancel'
      });

      if (nextValue === null) return;
      rows[index] = String(nextValue === undefined || nextValue === null ? '' : nextValue);
      emit();
      renderRows();
    }

    function appendPasteGap(container, insertIndex) {
      const gap = document.createElement('div');
      gap.className = 'typed-list-gap';

      gap.addEventListener('dragover', (event) => {
        if (!hasDragSelection()) return;
        event.preventDefault();
        autoScrollVerticalOnDrag(event, dom.editorContent);
        gap.classList.add('drop-before');
      });

      gap.addEventListener('dragleave', () => {
        gap.classList.remove('drop-before');
      });

      gap.addEventListener('drop', (event) => {
        if (!hasDragSelection()) return;
        event.preventDefault();
        event.stopPropagation();
        gap.classList.remove('drop-before');

        const moved = moveRowsByUids(dragSelectionUids, insertIndex);
        dragSelectionUids = [];
        clearDragClasses();

        if (!moved) {
          applySelectionClasses();
        }
      });

      gap.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const clipboardCount = getListClipboardItems().length;

        showContextMenu(event, [
          {
            label: clipboardCount > 1 ? 'Paste Items Here' : 'Paste Item Here',
            disabled: clipboardCount <= 0,
            action: () => pasteRowsAt(insertIndex)
          }
        ]);
      });

      container.appendChild(gap);
    }

    function renderRows() {
      summary.textContent = `List Elements (${rows.length})`;
      treePanel.innerHTML = '';
      actions.innerHTML = '';

      const clipboardCount = getListClipboardItems().length;
      const selectedCount = selectedRowUids.length;

      for (let i = 0; i < rows.length; i += 1) {
        appendPasteGap(treePanel, i);

        const rowUid = rowUids[i];

        const rowWrap = document.createElement('div');
        rowWrap.className = 'typed-list-row';
        rowWrap.dataset.listRowUid = rowUid;
        rowWrap.classList.toggle('selected', selectedRowUids.includes(rowUid));

        rowWrap.addEventListener('click', (event) => {
          const target = event.target;
          if (target instanceof Element && target.closest('input, textarea, select, button, [contenteditable="true"]')) {
            return;
          }

          if (event.shiftKey) {
            selectRangeTo(rowUid);
            return;
          }

          if (isMetaOrCtrlPressed(event)) {
            if (selectedRowUids.includes(rowUid)) {
              setSelectedRows(selectedRowUids.filter((uid) => uid !== rowUid), { keepAnchor: true });
            } else {
              const nextSelection = selectedRowUids.concat(rowUid);
              selectionAnchorUid = rowUid;
              setSelectedRows(nextSelection, { keepAnchor: true });
            }
            return;
          }

          setSelectedRows([rowUid]);
        });

        rowWrap.addEventListener('dragover', (event) => {
          if (!hasDragSelection()) return;
          event.preventDefault();
          autoScrollVerticalOnDrag(event, dom.editorContent);
          rowWrap.classList.add('drop-before');
        });

        rowWrap.addEventListener('dragleave', () => {
          rowWrap.classList.remove('drop-before');
        });

        rowWrap.addEventListener('drop', (event) => {
          if (!hasDragSelection()) return;
          event.preventDefault();
          event.stopPropagation();
          rowWrap.classList.remove('drop-before');

          const moved = moveRowsByUids(dragSelectionUids, i);
          dragSelectionUids = [];
          clearDragClasses();

          if (!moved) {
            applySelectionClasses();
          }
        });

        rowWrap.addEventListener('contextmenu', (event) => {
          event.preventDefault();
          event.stopPropagation();

          const initialSelection = selectionForRow(rowUid);
          setSelectedRows(initialSelection);

          const scopedSelection = selectionForRow(rowUid);
          const scopedCount = scopedSelection.length;
          const expandableCount = countExpandableRows(scopedSelection);
          const listClipboardCount = getListClipboardItems().length;

          showContextMenu(event, [
            {
              label: scopedCount > 1 ? 'Copy Selected Items' : 'Copy Item',
              action: () => copyRowsByUids(scopedSelection)
            },
            {
              label: listClipboardCount > 1 ? 'Paste Items Below' : 'Paste Item Below',
              disabled: listClipboardCount <= 0,
              action: () => pasteRowsAt(i + 1)
            },
            {
              label: scopedCount > 1 ? 'Expand Selected Items' : 'Expand Item',
              disabled: expandableCount <= 0,
              action: () => setRowsExpandedByUids(scopedSelection, true)
            },
            {
              label: scopedCount > 1 ? 'Collapse Selected Items' : 'Collapse Item',
              disabled: expandableCount <= 0,
              action: () => setRowsExpandedByUids(scopedSelection, false)
            },
            {
              label: 'Preview Raw Text',
              action: () => editElementPlainText(i)
            },
            {
              label: scopedCount > 1 ? 'Delete Selected Items' : 'Delete Item',
              action: () => deleteRowsByUids(scopedSelection)
            }
          ]);
        });

        const dragHandle = document.createElement('button');
        dragHandle.type = 'button';
        dragHandle.className = 'typed-grab-handle';
        dragHandle.draggable = true;
        dragHandle.title = 'Drag to reorder element';
        dragHandle.setAttribute('aria-label', 'Drag element');

        dragHandle.addEventListener('mousedown', (event) => {
          event.stopPropagation();
          setSelectedRows(selectionForRow(rowUid));
        });

        dragHandle.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
        });

        dragHandle.addEventListener('dragstart', (event) => {
          const scopedSelection = selectionForRow(rowUid);
          setSelectedRows(scopedSelection);

          dragSelectionUids = scopedSelection;
          rowWrap.classList.add('dragging');

          if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', String(rowUid));
          }
        });

        dragHandle.addEventListener('dragend', () => {
          dragSelectionUids = [];
          clearDragClasses();
          applySelectionClasses();
        });

        const actionWrap = document.createElement('div');
        actionWrap.className = 'typed-list-row-actions';

        const valueWrap = document.createElement('div');
        valueWrap.className = 'typed-list-cell';

        const control = createTypedControl(elementMeta, rows[i], (nextValue) => {
          rows[i] = String(nextValue === undefined || nextValue === null ? '' : nextValue);
          emit();
        });

        valueWrap.appendChild(control.element);

        const viewBtn = document.createElement('button');
        viewBtn.type = 'button';
        viewBtn.className = 'typed-mini';
        viewBtn.textContent = '🔍';
        viewBtn.title = 'View/Edit plain text';
        viewBtn.addEventListener('click', () => editElementPlainText(i));

        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'typed-mini';
        copyBtn.textContent = selectionForRow(rowUid).length > 1 ? 'Copy Sel' : 'Copy';
        copyBtn.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          copyRowsByUids(selectionForRow(rowUid));
        });

        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'typed-mini';
        delBtn.textContent = selectionForRow(rowUid).length > 1 ? 'Del Sel' : 'X';
        delBtn.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          deleteRowsByUids(selectionForRow(rowUid));
        });

        actionWrap.appendChild(viewBtn);
        actionWrap.appendChild(copyBtn);
        actionWrap.appendChild(delBtn);

        rowWrap.appendChild(dragHandle);
        rowWrap.appendChild(valueWrap);
        rowWrap.appendChild(actionWrap);
        treePanel.appendChild(rowWrap);
      }

      appendPasteGap(treePanel, rows.length);

      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'typed-mini typed-list-add-btn';
      addBtn.textContent = '+ Add Item';
      addBtn.addEventListener('click', () => {
        const newUid = buildListRowUid();
        rows.push('');
        rowUids.push(newUid);
        setSelectedRows([newUid]);
        emit();
        renderRows();
      });

      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'typed-mini';
      copyBtn.textContent = selectedCount > 1 ? 'Copy Selected' : 'Copy Item';
      copyBtn.disabled = selectedCount <= 0;
      copyBtn.addEventListener('click', () => {
        if (selectedRowUids.length <= 0) return;
        copyRowsByUids(selectedRowUids);
      });

      const pasteBtn = document.createElement('button');
      pasteBtn.type = 'button';
      pasteBtn.className = 'typed-mini';
      pasteBtn.textContent = clipboardCount > 1 ? 'Paste Items' : 'Paste Item';
      pasteBtn.disabled = clipboardCount <= 0;
      pasteBtn.addEventListener('click', () => {
        const indexes = selectedIndexes();
        if (indexes.length > 0) {
          pasteRowsAt(indexes[indexes.length - 1] + 1);
          return;
        }

        pasteRowsAt(rows.length);
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'typed-mini';
      deleteBtn.textContent = selectedCount > 1 ? 'Delete Selected' : 'Delete Item';
      deleteBtn.disabled = selectedCount <= 0;
      deleteBtn.addEventListener('click', () => {
        if (selectedRowUids.length <= 0) return;
        deleteRowsByUids(selectedRowUids);
      });

      actions.appendChild(addBtn);
      actions.appendChild(copyBtn);
      actions.appendChild(pasteBtn);
      actions.appendChild(deleteBtn);

      if (rows.length <= 0) {
        const empty = document.createElement('div');
        empty.className = 'typed-file-empty';
        empty.textContent = 'No elements in list.';
        treePanel.appendChild(empty);
      }

      applySelectionClasses();
    }

    const listControlContext = {
      wrapper,
      hasSelection() {
        return selectedRowUids.length > 0;
      },
      clearSelection() {
        if (selectedRowUids.length <= 0) return true;
        setSelectedRows([]);
        return true;
      },
      selectAllRows() {
        if (rows.length <= 0) {
          showToast('No list elements to select.', 'bad');
          return true;
        }

        setSelectedRows(rowUids.slice());
        return true;
      },
      copySelection(target) {
        const selectionUids = selectionFromTarget(target, true);
        if (selectionUids.length <= 0) {
          return false;
        }
        return copyRowsByUids(selectionUids);
      },
      pasteSelection(target) {
        if (getListClipboardItems().length <= 0) {
          return false;
        }

        const targetRowUid = resolveRowUidFromTarget(target);
        if (targetRowUid) {
          return pasteRowsAt(indexByRowUid(targetRowUid) + 1);
        }

        const indexes = selectedIndexes();
        if (indexes.length > 0) {
          return pasteRowsAt(indexes[indexes.length - 1] + 1);
        }

        return pasteRowsAt(rows.length);
      },
      deleteSelection(target) {
        const selectionUids = selectionFromTarget(target, true);
        if (selectionUids.length <= 0) {
          return false;
        }
        return deleteRowsByUids(selectionUids);
      },
      expandSelection(target, expanded) {
        const selectionUids = selectionFromTarget(target, true);
        return setRowsExpandedByUids(selectionUids, expanded);
      }
    };

    listControlRegistry.set(listControlId, listControlContext);

    renderRows();

    return {
      element: wrapper,
      setFromPlain(value) {
        rows = parseListValue(value);
        resetRowUids();
        renderRows();
      }
    };
  }

  function createStructControl(meta, initialValue, onChanged) {
    const structFields = resolveStructFields(meta);

    if (structFields.length > 0) {
      const wrapper = document.createElement('div');
      wrapper.className = 'typed-struct';

      const tree = document.createElement('details');
      tree.className = 'typed-list-tree';
      bindTypedTreeDetailsState(tree, meta, 'struct', true);

      const summary = document.createElement('summary');
      summary.textContent = `Struct Elements (${structFields.length})`;

      const treePanel = document.createElement('div');
      treePanel.className = 'typed-list-tree-panel';

      tree.appendChild(summary);
      tree.appendChild(treePanel);
      wrapper.appendChild(tree);

      const actions = document.createElement('div');
      actions.className = 'typed-list-actions';
      wrapper.appendChild(actions);

      const fieldMap = new Map();
      structFields.forEach((field) => {
        const fieldName = String(field && field.name ? field.name : '').trim();
        if (!fieldName || fieldMap.has(fieldName)) return;
        fieldMap.set(fieldName, {
          ...field,
          structMetadataMap: meta && meta.structMetadataMap ? meta.structMetadataMap : field.structMetadataMap || null
        });
      });

      let fieldOrder = Array.from(fieldMap.keys());
      let values = parseStructObjectValue(initialValue);
      let dragIndex = -1;

      function emit() {
        const out = {};
        fieldOrder.forEach((fieldName) => {
          out[fieldName] = String(values[fieldName] === undefined || values[fieldName] === null ? '' : values[fieldName]);
        });
        onChanged(JSON.stringify(out));
      }

      function copyField(fieldName) {
        state.structEntryClipboard = {
          key: fieldName,
          value: String(values[fieldName] === undefined || values[fieldName] === null ? '' : values[fieldName])
        };
        showToast(`Struct field '${fieldName}' copied.`, 'good');
      }

      function pasteField(fieldName) {
        if (!state.structEntryClipboard) return;
        values[fieldName] = String(state.structEntryClipboard.value === undefined || state.structEntryClipboard.value === null
          ? ''
          : state.structEntryClipboard.value);
        emit();
        renderRows();
      }

      function pasteFieldAt(index) {
        if (!state.structEntryClipboard || fieldOrder.length <= 0) return;
        const safeIndex = Math.max(0, Math.min(fieldOrder.length - 1, Number(index) || 0));
        const targetField = fieldOrder[safeIndex];
        if (!targetField) return;
        pasteField(targetField);
      }

      function moveField(fromIndex, toIndex) {
        if (fromIndex === toIndex) return;
        if (fromIndex < 0 || fromIndex >= fieldOrder.length) return;
        if (toIndex < 0 || toIndex >= fieldOrder.length) return;

        const moved = fieldOrder.splice(fromIndex, 1);
        if (moved.length <= 0) return;
        fieldOrder.splice(toIndex, 0, moved[0]);

        emit();
        renderRows();
      }

      function appendPasteGap(container, insertIndex) {
        const gap = document.createElement('div');
        gap.className = 'typed-list-gap';

        gap.addEventListener('contextmenu', (event) => {
          event.preventDefault();
          event.stopPropagation();

          showContextMenu(event, [
            {
              label: 'Paste (field value) here',
              disabled: !state.structEntryClipboard,
              action: () => pasteFieldAt(insertIndex)
            }
          ]);
        });

        container.appendChild(gap);
      }

      function renderRows() {
        treePanel.innerHTML = '';
        actions.innerHTML = '';

        for (let i = 0; i < fieldOrder.length; i += 1) {
          appendPasteGap(treePanel, i);

          const fieldName = fieldOrder[i];
          const fieldMeta = fieldMap.get(fieldName);

          const rowWrap = document.createElement('div');
          rowWrap.className = 'typed-struct-row typed-struct-fixed-row';

          rowWrap.addEventListener('dragover', (event) => {
            if (dragIndex < 0 || dragIndex === i) return;
            event.preventDefault();
            autoScrollVerticalOnDrag(event, dom.editorContent);
            rowWrap.classList.add('drop-before');
          });

          rowWrap.addEventListener('dragleave', () => {
            rowWrap.classList.remove('drop-before');
          });

          rowWrap.addEventListener('drop', (event) => {
            if (dragIndex < 0) return;
            event.preventDefault();
            event.stopPropagation();
            rowWrap.classList.remove('drop-before');

            const fromIndex = dragIndex;
            const toIndex = fromIndex < i ? i - 1 : i;
            dragIndex = -1;
            moveField(fromIndex, toIndex);
          });

          rowWrap.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            event.stopPropagation();

            showContextMenu(event, [
              {
                label: 'Copy (field value)',
                action: () => copyField(fieldName)
              },
              {
                label: 'Paste (field value)',
                disabled: !state.structEntryClipboard,
                action: () => pasteField(fieldName)
              },
              {
                label: 'Preview Raw Text',
                action: () => showPlainTextPreview(`Struct field ${fieldName}`, values[fieldName])
              }
            ]);
          });

          const dragHandle = document.createElement('button');
          dragHandle.type = 'button';
          dragHandle.className = 'typed-grab-handle';
          dragHandle.draggable = true;
          dragHandle.title = 'Drag to reorder fields';
          dragHandle.setAttribute('aria-label', 'Drag field');

          dragHandle.addEventListener('dragstart', (event) => {
            dragIndex = i;
            rowWrap.classList.add('dragging');

            if (event.dataTransfer) {
              event.dataTransfer.effectAllowed = 'move';
              event.dataTransfer.setData('text/plain', String(i));
            }
          });

          dragHandle.addEventListener('dragend', () => {
            dragIndex = -1;
            rowWrap.classList.remove('dragging');
            rowWrap.classList.remove('drop-before');
          });

          const keyLabel = document.createElement('span');
          keyLabel.className = 'typed-struct-key';
          keyLabel.textContent = fieldName;

          const valueWrap = document.createElement('div');
          valueWrap.className = 'typed-list-cell';

          const control = createTypedControl(fieldMeta || { type: 'text' }, values[fieldName], (nextValue) => {
            values[fieldName] = String(nextValue === undefined || nextValue === null ? '' : nextValue);
            emit();
          });

          valueWrap.appendChild(control.element);

          const viewBtn = document.createElement('button');
          viewBtn.type = 'button';
          viewBtn.className = 'typed-mini';
          viewBtn.textContent = 'View';
          viewBtn.addEventListener('click', () => {
            showPlainTextPreview(`Struct field ${fieldName}`, values[fieldName]);
          });

          const copyBtn = document.createElement('button');
          copyBtn.type = 'button';
          copyBtn.className = 'typed-mini';
          copyBtn.textContent = 'Copy';
          copyBtn.addEventListener('click', () => copyField(fieldName));

          rowWrap.appendChild(dragHandle);
          rowWrap.appendChild(keyLabel);
          rowWrap.appendChild(valueWrap);
          rowWrap.appendChild(viewBtn);
          rowWrap.appendChild(copyBtn);

          treePanel.appendChild(rowWrap);
        }

        appendPasteGap(treePanel, fieldOrder.length);

        const pasteBtn = document.createElement('button');
        pasteBtn.type = 'button';
        pasteBtn.className = 'typed-mini';
        pasteBtn.textContent = 'Paste Field Value';
        pasteBtn.disabled = !state.structEntryClipboard || fieldOrder.length <= 0;
        pasteBtn.addEventListener('click', () => {
          if (!state.structEntryClipboard || fieldOrder.length <= 0) return;
          pasteField(fieldOrder[fieldOrder.length - 1]);
        });

        actions.appendChild(pasteBtn);

        if (fieldOrder.length <= 0) {
          const empty = document.createElement('div');
          empty.className = 'typed-file-empty';
          empty.textContent = 'No struct fields found for this type.';
          treePanel.appendChild(empty);
        }
      }

      renderRows();

      return {
        element: wrapper,
        setFromPlain(value) {
          values = parseStructObjectValue(value);
          dragIndex = -1;
          renderRows();
        }
      };
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'typed-struct';

    let rows = parseStructValue(initialValue);
    let dragIndex = -1;

    function emit() {
      const obj = {};
      rows.forEach((row) => {
        const key = cleanText(row.key);
        if (!key) return;
        obj[key] = String(row.value === undefined || row.value === null ? '' : row.value);
      });
      onChanged(JSON.stringify(obj));
    }

    function pasteEntryAt(index) {
      if (!state.structEntryClipboard) return;
      const safeIndex = Math.max(0, Math.min(rows.length, Number(index) || 0));
      rows.splice(safeIndex, 0, {
        key: String(state.structEntryClipboard.key || ''),
        value: String(state.structEntryClipboard.value || '')
      });
      emit();
      renderRows();
    }

    function moveEntry(fromIndex, toIndex) {
      if (fromIndex === toIndex) return;
      if (fromIndex < 0 || fromIndex >= rows.length) return;
      if (toIndex < 0 || toIndex >= rows.length) return;

      const moved = rows.splice(fromIndex, 1);
      if (moved.length <= 0) return;
      rows.splice(toIndex, 0, moved[0]);
      emit();
      renderRows();
    }

    function appendPasteGap(container, insertIndex) {
      const gap = document.createElement('div');
      gap.className = 'typed-list-gap';

      gap.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        event.stopPropagation();

        showContextMenu(event, [
          {
            label: 'Paste Entry Here',
            disabled: !state.structEntryClipboard,
            action: () => pasteEntryAt(insertIndex)
          }
        ]);
      });

      container.appendChild(gap);
    }

    function renderRows() {
      wrapper.innerHTML = '';

      for (let i = 0; i < rows.length; i += 1) {
        appendPasteGap(wrapper, i);

        const row = rows[i];
        const rowWrap = document.createElement('div');
        rowWrap.className = 'typed-struct-row';

        rowWrap.addEventListener('dragover', (event) => {
          if (dragIndex < 0 || dragIndex === i) return;
          event.preventDefault();
          autoScrollVerticalOnDrag(event, dom.editorContent);
          rowWrap.classList.add('drop-before');
        });

        rowWrap.addEventListener('dragleave', () => {
          rowWrap.classList.remove('drop-before');
        });

        rowWrap.addEventListener('drop', (event) => {
          if (dragIndex < 0) return;
          event.preventDefault();
          event.stopPropagation();
          rowWrap.classList.remove('drop-before');

          const fromIndex = dragIndex;
          const toIndex = fromIndex < i ? i - 1 : i;
          dragIndex = -1;
          moveEntry(fromIndex, toIndex);
        });

        rowWrap.addEventListener('contextmenu', (event) => {
          event.preventDefault();
          event.stopPropagation();

          showContextMenu(event, [
            {
              label: 'Copy Entry',
              action: () => {
                state.structEntryClipboard = { key: row.key, value: row.value };
                showToast('Struct entry copied.', 'good');
              }
            },
            {
              label: 'Paste Entry',
              disabled: !state.structEntryClipboard,
              action: () => {
                if (!state.structEntryClipboard) return;
                row.key = String(state.structEntryClipboard.key || '');
                row.value = String(state.structEntryClipboard.value || '');
                emit();
                renderRows();
              }
            },
            {
              label: 'Preview Raw Text',
              action: () => showPlainTextPreview(`Struct entry ${i + 1}`, row.value)
            }
          ]);
        });

        const dragHandle = document.createElement('button');
        dragHandle.type = 'button';
        dragHandle.className = 'typed-grab-handle';
        dragHandle.draggable = true;
        dragHandle.title = 'Drag to reorder entry';
        dragHandle.setAttribute('aria-label', 'Drag entry');

        dragHandle.addEventListener('dragstart', (event) => {
          dragIndex = i;
          rowWrap.classList.add('dragging');

          if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', String(i));
          }
        });

        dragHandle.addEventListener('dragend', () => {
          dragIndex = -1;
          rowWrap.classList.remove('dragging');
          rowWrap.classList.remove('drop-before');
        });

        const keyInput = document.createElement('input');
        keyInput.type = 'text';
        keyInput.placeholder = 'key';
        keyInput.value = row.key;
        keyInput.addEventListener('input', () => {
          row.key = keyInput.value;
          emit();
        });

        const valueInput = document.createElement('input');
        valueInput.type = 'text';
        valueInput.placeholder = 'value';
        valueInput.value = row.value;
        valueInput.addEventListener('input', () => {
          row.value = valueInput.value;
          emit();
        });

        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'typed-mini';
        copyBtn.textContent = 'Copy';
        copyBtn.addEventListener('click', () => {
          state.structEntryClipboard = { key: row.key, value: row.value };
          showToast('Struct entry copied.', 'good');
        });

        const viewBtn = document.createElement('button');
        viewBtn.type = 'button';
        viewBtn.className = 'typed-mini';
        viewBtn.textContent = 'View';
        viewBtn.addEventListener('click', () => {
          showPlainTextPreview(`Struct entry ${i + 1}`, row.value);
        });

        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'typed-mini';
        delBtn.textContent = 'X';
        delBtn.addEventListener('click', () => {
          rows.splice(i, 1);
          emit();
          renderRows();
        });

        rowWrap.appendChild(dragHandle);
        rowWrap.appendChild(keyInput);
        rowWrap.appendChild(valueInput);
        rowWrap.appendChild(viewBtn);
        rowWrap.appendChild(copyBtn);
        rowWrap.appendChild(delBtn);

        wrapper.appendChild(rowWrap);
      }

      appendPasteGap(wrapper, rows.length);

      const actions = document.createElement('div');
      actions.className = 'schema-actions';

      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'typed-mini';
      addBtn.textContent = '+ Add Entry';
      addBtn.addEventListener('click', () => {
        rows.push({ key: '', value: '' });
        emit();
        renderRows();
      });

      const pasteBtn = document.createElement('button');
      pasteBtn.type = 'button';
      pasteBtn.className = 'typed-mini';
      pasteBtn.textContent = 'Paste Entry';
      pasteBtn.disabled = !state.structEntryClipboard;
      pasteBtn.addEventListener('click', () => {
        if (!state.structEntryClipboard) return;
        rows.push({
          key: state.structEntryClipboard.key,
          value: state.structEntryClipboard.value
        });
        emit();
        renderRows();
      });

      actions.appendChild(addBtn);
      actions.appendChild(pasteBtn);
      wrapper.appendChild(actions);
    }

    renderRows();

    return {
      element: wrapper,
      setFromPlain(value) {
        rows = parseStructValue(value);
        dragIndex = -1;
        renderRows();
      }
    };
  }

  function createTypedControl(meta, plainValue, onChanged) {
    const sourceMeta = meta && typeof meta === 'object' ? meta : {};
    const resolvedStructFields = resolveStructFields(sourceMeta);
    meta = resolvedStructFields.length > 0
      ? { ...sourceMeta, structFields: resolvedStructFields }
      : sourceMeta;

    const type = String(meta.type || 'text').toLowerCase();

    if (meta.isList || type.endsWith('[]')) {
      return createListControl(meta, plainValue, onChanged);
    }

    if (meta.isStruct || /^struct<.+>$/.test(type)) {
      return createStructControl(meta, plainValue, onChanged);
    }

    if (type === 'boolean') {
      const wrapper = document.createElement('div');
      wrapper.className = 'typed-boolean';
      const onLabel = meta.onLabel || 'ON';
      const offLabel = meta.offLabel || 'OFF';

      const onBtn = document.createElement('button');
      onBtn.type = 'button';
      onBtn.textContent = onLabel;

      const offBtn = document.createElement('button');
      offBtn.type = 'button';
      offBtn.textContent = offLabel;

      function setValue(value) {
        const normalized = normalizeBooleanText(value);
        onBtn.classList.toggle('active', normalized === 'true');
        offBtn.classList.toggle('active', normalized === 'false');
      }

      onBtn.addEventListener('click', () => {
        setValue('true');
        onChanged('true');
      });

      offBtn.addEventListener('click', () => {
        setValue('false');
        onChanged('false');
      });

      wrapper.appendChild(onBtn);
      wrapper.appendChild(offBtn);

      setValue(plainValue);

      return {
        element: wrapper,
        setFromPlain(value) {
          setValue(value);
        }
      };
    }

    if (OBJECT_TYPE_TO_KEY[type]) {
      const wrap = document.createElement('div');
      wrap.className = 'typed-dual-select';

      const groupSelect = document.createElement('select');
      const valueSelect = document.createElement('select');
      wrap.appendChild(groupSelect);
      wrap.appendChild(valueSelect);

      let entries = [];
      let currentValue = String(plainValue === undefined || plainValue === null ? '' : plainValue);

      function getGroups() {
        return buildDataIdGroups(entries);
      }

      function getSelectedGroupKey(groups) {
        const selectedId = Number(currentValue);
        if (!Number.isFinite(selectedId) || selectedId <= 0) return '';

        for (let i = 0; i < groups.length; i += 1) {
          if (selectedId >= groups[i].start && selectedId <= groups[i].end) {
            return groups[i].key;
          }
        }

        return '';
      }

      function renderGroupSelect(groups) {
        groupSelect.innerHTML = '';

        const none = document.createElement('option');
        none.value = '';
        none.textContent = 'None';
        groupSelect.appendChild(none);

        for (let i = 0; i < groups.length; i += 1) {
          const group = groups[i];
          const option = document.createElement('option');
          option.value = group.key;
          option.textContent = formatDataRangeLabel(group.start, group.end);
          groupSelect.appendChild(option);
        }

        groupSelect.value = getSelectedGroupKey(groups);
      }

      function renderValueSelect(groups) {
        valueSelect.innerHTML = '';

        const selectedGroup = groups.find((group) => group.key === groupSelect.value);

        const none = document.createElement('option');
        none.value = '';
        none.textContent = '(None)';
        valueSelect.appendChild(none);

        if (selectedGroup) {
          for (let i = 0; i < selectedGroup.rows.length; i += 1) {
            const row = selectedGroup.rows[i];
            const option = document.createElement('option');
            option.value = String(row.id);
            option.textContent = `[${padDataId(row.id)}] ${row.name}`;
            valueSelect.appendChild(option);
          }
        }

        const exists = Array.from(valueSelect.options).some((option) => option.value === currentValue);
        if (!exists && currentValue) {
          const custom = document.createElement('option');
          custom.value = currentValue;
          custom.textContent = `(custom) ${currentValue}`;
          valueSelect.appendChild(custom);
        }

        valueSelect.value = currentValue;
      }

      function refreshSelectors() {
        const groups = getGroups();
        renderGroupSelect(groups);
        renderValueSelect(groups);
      }

      ensureDataCatalog().then((catalog) => {
        const key = OBJECT_TYPE_TO_KEY[type];
        entries = Array.isArray(catalog[key]) ? catalog[key] : [];
        refreshSelectors();
      }).catch(() => {
        groupSelect.innerHTML = '<option value="">(Failed loading data entries)</option>';
        valueSelect.innerHTML = '<option value="">(Failed loading data entries)</option>';
      });

      groupSelect.addEventListener('change', () => {
        if (!groupSelect.value) {
          currentValue = '';
          renderValueSelect(getGroups());
          onChanged('');
          return;
        }

        currentValue = '';
        renderValueSelect(getGroups());
        onChanged('');
      });

      valueSelect.addEventListener('change', () => {
        currentValue = valueSelect.value;
        onChanged(currentValue);
      });

      return {
        element: wrap,
        setFromPlain(value) {
          currentValue = String(value === undefined || value === null ? '' : value);
          refreshSelectors();
        }
      };
    }

    if (NUMBERISH_TYPES.has(type)) {
      const input = document.createElement('input');
      input.type = 'number';
      input.value = plainValue;

      if (meta.min !== '') input.min = meta.min;
      if (meta.max !== '') input.max = meta.max;
      if (meta.decimals !== '') {
        const decimals = Number(meta.decimals);
        if (!Number.isNaN(decimals) && decimals >= 0) {
          input.step = String(1 / Math.pow(10, decimals));
        }
      }

      addNumberWheelLock(input);

      input.addEventListener('input', () => onChanged(input.value));

      return {
        element: input,
        setFromPlain(value) {
          input.value = value;
        }
      };
    }

    if (type === 'select' && Array.isArray(meta.options) && meta.options.length > 0) {
      const select = document.createElement('select');

      meta.options.forEach((option) => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.textContent = option.label;
        select.appendChild(opt);
      });

      const hasValue = meta.options.some((option) => String(option.value) === String(plainValue));
      if (!hasValue && plainValue !== '') {
        const custom = document.createElement('option');
        custom.value = plainValue;
        custom.textContent = `(custom) ${plainValue}`;
        select.appendChild(custom);
      }

      select.value = plainValue;
      select.addEventListener('change', () => onChanged(select.value));

      return {
        element: select,
        setFromPlain(value) {
          const exists = Array.from(select.options).some((option) => option.value === String(value));
          if (!exists && value !== '') {
            const custom = document.createElement('option');
            custom.value = value;
            custom.textContent = `(custom) ${value}`;
            select.appendChild(custom);
          }
          select.value = value;
        }
      };
    }

    if (type === 'combo' && Array.isArray(meta.options) && meta.options.length > 0) {
      const wrapper = document.createElement('div');
      const input = document.createElement('input');
      const listId = `combo_${Math.random().toString(16).slice(2)}`;
      const dataList = document.createElement('datalist');
      dataList.id = listId;

      meta.options.forEach((option) => {
        const opt = document.createElement('option');
        opt.value = option.label;
        dataList.appendChild(opt);
      });

      input.setAttribute('list', listId);
      input.value = plainValue;
      input.addEventListener('input', () => onChanged(input.value));

      wrapper.appendChild(input);
      wrapper.appendChild(dataList);

      return {
        element: wrapper,
        setFromPlain(value) {
          input.value = value;
        }
      };
    }

    if (type === 'file') {
      const wrapper = document.createElement('div');
      wrapper.className = 'typed-file';

      const dirConfig = parseFileDirConfig(meta.dir || '');

      const rootSelect = document.createElement('select');
      for (let i = 0; i < FILE_ROOT_OPTIONS.length; i += 1) {
        const root = FILE_ROOT_OPTIONS[i];
        const option = document.createElement('option');
        option.value = root;
        option.textContent = `${root}/`;
        rootSelect.appendChild(option);
      }

      const categorySelect = document.createElement('select');

      const treeDetails = document.createElement('details');
      treeDetails.className = 'typed-file-tree';
      bindTypedTreeDetailsState(treeDetails, meta, 'file-tree', true);

      const treeSummary = document.createElement('summary');
      treeSummary.textContent = 'Select file...';

      const treePanel = document.createElement('div');
      treePanel.className = 'typed-file-tree-panel';

      treeDetails.appendChild(treeSummary);
      treeDetails.appendChild(treePanel);

      wrapper.appendChild(rootSelect);
      wrapper.appendChild(categorySelect);
      wrapper.appendChild(treeDetails);

      let currentValue = normalizeRuntimeRelativePath(plainValue || '');
      let rootValue = dirConfig.fixedRoot || '';
      let categoryValue = dirConfig.fixedCategory || '';
      let rootEntries = [];
      let loadToken = 0;

      function getEffectiveRoot() {
        return dirConfig.fixedRoot || rootValue;
      }

      function getEffectiveCategory() {
        return dirConfig.fixedCategory || categoryValue;
      }

      function shouldShowRootSelect() {
        return !dirConfig.customBase && !dirConfig.fixedRoot;
      }

      function shouldShowCategorySelect() {
        if (dirConfig.customBase || dirConfig.fixedCategory) return false;
        const root = getEffectiveRoot();
        return root === 'img' || root === 'audio';
      }

      function applyControlLayout() {
        const showRoot = shouldShowRootSelect();
        const showCategory = shouldShowCategorySelect();

        rootSelect.hidden = !showRoot;
        categorySelect.hidden = !showCategory;

        const visibleControls = (showRoot ? 1 : 0) + (showCategory ? 1 : 0) + 1;
        wrapper.classList.toggle('compact', visibleControls === 2);
        wrapper.classList.toggle('file-only', visibleControls === 1);
      }

      function inferSelectionFromCurrentValue() {
        const segments = splitPathSegments(currentValue);
        if (segments.length <= 0) return;

        if (!dirConfig.fixedRoot) {
          const candidateRoot = String(segments[0] || '').toLowerCase();
          if (FILE_ROOT_OPTIONS.includes(candidateRoot)) {
            rootValue = candidateRoot;
          }
        }

        const root = getEffectiveRoot();
        if (!dirConfig.fixedCategory && (root === 'img' || root === 'audio')) {
          const candidateCategory = cleanText(segments[1] || '');
          if (candidateCategory) {
            categoryValue = candidateCategory;
          }
        }
      }

      function buildBasePrefix() {
        if (dirConfig.customBase) {
          return ensureTrailingSlash(dirConfig.customBase);
        }

        const root = getEffectiveRoot();
        if (!root) return '';

        const segments = [root];
        if (root !== 'movies') {
          const category = getEffectiveCategory();
          if (category) {
            segments.push(category);
          }
        }

        const subSegments = splitPathSegments(dirConfig.fixedSubpath);
        for (let i = 0; i < subSegments.length; i += 1) {
          segments.push(subSegments[i]);
        }

        return ensureTrailingSlash(segments.join('/'));
      }

      function updateTreeSummary(basePrefix) {
        const prefix = ensureTrailingSlash(basePrefix);
        const value = normalizeRuntimeRelativePath(currentValue || '');

        if (!value) {
          treeSummary.textContent = 'Select file...';
          return;
        }

        if (prefix && value.startsWith(prefix)) {
          const relative = value.slice(prefix.length);
          treeSummary.textContent = relative || value;
          return;
        }

        treeSummary.textContent = value;
      }

      function setCurrentValue(nextValue, emitChange) {
        currentValue = normalizeRuntimeRelativePath(nextValue || '');
        updateTreeSummary(buildBasePrefix());
        if (emitChange) {
          onChanged(currentValue);
        }
      }

      function renderCategoryOptions() {
        if (!shouldShowCategorySelect()) return;

        const categories = listCategoryFolders(rootEntries, getEffectiveRoot());
        categorySelect.innerHTML = '';

        const prompt = document.createElement('option');
        prompt.value = '';
        prompt.textContent = '(Select folder)';
        categorySelect.appendChild(prompt);

        for (let i = 0; i < categories.length; i += 1) {
          const option = document.createElement('option');
          option.value = categories[i];
          option.textContent = categories[i];
          categorySelect.appendChild(option);
        }

        if (!categoryValue && categories.length > 0) {
          categoryValue = categories[0];
        }

        if (categoryValue) {
          ensureOption(categorySelect, categoryValue);
        } else {
          categorySelect.value = '';
        }
      }

      function renderFileTree() {
        const basePrefix = buildBasePrefix();
        updateTreeSummary(basePrefix);

        renderTypedFileTreePanel(treePanel, rootEntries, basePrefix, currentValue, (selectedPath) => {
          setCurrentValue(selectedPath, true);
        }, meta);
      }

      async function reloadRootEntries() {
        applyControlLayout();

        if (shouldShowRootSelect()) {
          if (!FILE_ROOT_OPTIONS.includes(rootValue)) {
            rootValue = 'img';
          }
          rootSelect.value = rootValue;
        }

        const sourceDir = dirConfig.customBase || getEffectiveRoot();
        if (!sourceDir) {
          rootEntries = [];
          renderCategoryOptions();
          renderFileTree();
          return;
        }

        const activeToken = loadToken + 1;
        loadToken = activeToken;
        treePanel.innerHTML = '<div class="typed-file-empty">Loading files...</div>';

        try {
          const entries = await ensureFileList(sourceDir);
          if (activeToken !== loadToken) return;

          rootEntries = Array.isArray(entries) ? entries : [];
          renderCategoryOptions();
          renderFileTree();
        } catch (_error) {
          if (activeToken !== loadToken) return;

          rootEntries = [];
          renderCategoryOptions();
          treePanel.innerHTML = '<div class="typed-file-empty">Could not load files.</div>';
          updateTreeSummary(buildBasePrefix());
        }
      }

      rootSelect.addEventListener('change', () => {
        rootValue = rootSelect.value;
        if (!dirConfig.fixedCategory) {
          categoryValue = '';
        }
        reloadRootEntries();
      });

      categorySelect.addEventListener('change', () => {
        categoryValue = categorySelect.value;
        renderFileTree();
      });

      inferSelectionFromCurrentValue();
      if (!dirConfig.customBase && !getEffectiveRoot()) {
        rootValue = 'img';
      }

      setCurrentValue(currentValue, false);
      reloadRootEntries();

      return {
        element: wrapper,
        setFromPlain(value) {
          currentValue = normalizeRuntimeRelativePath(value || '');
          inferSelectionFromCurrentValue();

          if (!dirConfig.customBase && !getEffectiveRoot()) {
            rootValue = 'img';
          }

          reloadRootEntries();
        }
      };
    }

    if (type === 'note') {
      const textarea = document.createElement('textarea');
      textarea.value = decodeNoteEscapeInput(plainValue);
      textarea.rows = 3;
      textarea.addEventListener('input', () => onChanged(encodeNoteEscapeOutput(textarea.value)));

      return {
        element: textarea,
        setFromPlain(value) {
          textarea.value = decodeNoteEscapeInput(value);
        }
      };
    }

    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.value = plainValue;
    textInput.addEventListener('input', () => onChanged(textInput.value));

    return {
      element: textInput,
      setFromPlain(value) {
        textInput.value = value;
      }
    };
  }

  function updatePluginParameterValue(pluginIndex, parameterName, valueText) {
    if (pluginIndex < 0 || !state.plugins[pluginIndex]) return;

    const plugin = state.plugins[pluginIndex];
    if (!plugin.parameters || typeof plugin.parameters !== 'object') {
      plugin.parameters = {};
    }

    plugin.parameters[parameterName] = String(valueText === undefined || valueText === null ? '' : valueText);
    markPluginsDirty();
  }

  function buildParameterTree(metadata, pluginParameters, structMetadataMap) {
    const params = Array.isArray(metadata) ? metadata : [];
    const structMap = structMetadataMap && typeof structMetadataMap === 'object'
      ? structMetadataMap
      : {};
    const byName = new Map();
    const nodes = [];

    params.forEach((meta) => {
      const node = {
        ...meta,
        structMetadataMap: structMap,
        value: pluginParameters[meta.name] !== undefined
          ? String(pluginParameters[meta.name])
          : String(meta.defaultValue || ''),
        children: []
      };
      nodes.push(node);
      if (!byName.has(meta.name)) {
        byName.set(meta.name, node);
      }
    });

    Object.keys(pluginParameters).forEach((paramName) => {
      if (byName.has(paramName)) return;

      const value = pluginParameters[paramName];
      const node = {
        name: paramName,
        text: paramName,
        desc: '(Parameter exists in plugins.js but not in plugin header @param list)',
        parent: '',
        type: 'text',
        defaultValue: '',
        min: '',
        max: '',
        decimals: '',
        onLabel: 'ON',
        offLabel: 'OFF',
        dir: '',
        require: '',
        options: [],
        isList: false,
        isStruct: false,
        structMetadataMap: structMap,
        directives: [],
        value: String(value),
        children: []
      };
      nodes.push(node);
      byName.set(paramName, node);
    });

    const roots = [];

    nodes.forEach((node) => {
      const parentName = String(node.parent || '').trim();
      if (parentName && parentName !== node.name && byName.has(parentName)) {
        byName.get(parentName).children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  function filterParameterTree(nodes, queryText) {
    const query = cleanText(queryText).toLowerCase();
    if (!query) return nodes;

    function filterNode(node) {
      const selfText = `${node.name} ${node.text} ${node.desc} ${node.type}`.toLowerCase();
      const childMatches = [];

      for (let i = 0; i < (node.children || []).length; i += 1) {
        const next = filterNode(node.children[i]);
        if (next) childMatches.push(next);
      }

      if (selfText.includes(query) || childMatches.length > 0) {
        return {
          ...node,
          children: childMatches
        };
      }

      return null;
    }

    const out = [];
    for (let i = 0; i < nodes.length; i += 1) {
      const filtered = filterNode(nodes[i]);
      if (filtered) out.push(filtered);
    }
    return out;
  }

  function renderParameterNode(node, pluginIndex, container, pathTokens) {
    const plugin = state.plugins[pluginIndex];
    const pluginKey = plugin ? makePluginKey(plugin) : '';
    const tokens = Array.isArray(pathTokens) ? pathTokens : [];
    const fallbackToken = `0:${encodeURIComponent(String(node && node.name ? node.name : ''))}`;
    const nodeUid = tokens.length > 0 ? tokens.join('/') : fallbackToken;

    const wrapper = document.createElement('div');
    wrapper.className = 'param-node';
    wrapper.dataset.paramName = String(node.name || '');
    wrapper.dataset.paramSelectUid = nodeUid;
    if (node.isList) wrapper.classList.add('param-list');
    if (node.isStruct) wrapper.classList.add('param-struct');

    if (pluginKey && getParamSelectionUids(pluginKey).includes(nodeUid)) {
      wrapper.classList.add('selected');
    }

    wrapper.addEventListener('contextmenu', (event) => {
      const activePlugin = state.plugins[pluginIndex];
      if (!activePlugin) return;

      const activePluginKey = makePluginKey(activePlugin);
      const currentValue = activePlugin.parameters && activePlugin.parameters[node.name] !== undefined
        ? activePlugin.parameters[node.name]
        : '';

      const selectedUids = paramSelectionForUid(activePluginKey, nodeUid);
      const selectedUidSet = new Set(selectedUids);
      const visibleEntries = getVisibleParamNodeEntries();
      let expandableCount = 0;

      for (let i = 0; i < visibleEntries.length; i += 1) {
        const entry = visibleEntries[i];
        if (!selectedUidSet.has(entry.uid)) continue;
        if (!Array.isArray(entry.detailsList) || entry.detailsList.length <= 0) continue;
        expandableCount += 1;
      }

      const actions = [];

      if (state.paramSearch.trim()) {
        actions.push({
          label: 'Clear Search and Locate element',
          action: () => clearParamSearchAndLocate(node.name)
        });
      }

      actions.push(
        {
          label: 'Copy Param Value',
          action: () => {
            state.paramClipboard = String(currentValue || '');
            showToast(`Copied ${node.name} value.`, 'good');
          }
        },
        {
          label: 'Paste Param Value',
          disabled: state.paramClipboard === '',
          action: () => {
            updatePluginParameterValue(pluginIndex, node.name, state.paramClipboard);
            renderActivePluginPanel();
          }
        },
        {
          label: selectedUids.length > 1 ? 'Expand Selected Parameters' : 'Expand Parameter',
          disabled: expandableCount <= 0,
          action: () => setParameterSelectionExpanded(activePluginKey, selectedUids, true)
        },
        {
          label: selectedUids.length > 1 ? 'Collapse Selected Parameters' : 'Collapse Parameter',
          disabled: expandableCount <= 0,
          action: () => setParameterSelectionExpanded(activePluginKey, selectedUids, false)
        }
      );

      showContextMenu(event, actions);
    });

    const displayTitle = node.text && node.text !== node.name
      ? `${node.text} (${node.name})`
      : node.name;

    const head = document.createElement('div');
    head.className = 'param-head';
    head.innerHTML = `
      <span class="param-title">${escapeHtml(displayTitle)}</span>
      <span class="param-type">@type ${escapeHtml(node.type || 'text')}</span>
    `;

    head.addEventListener('click', (event) => {
      const activePlugin = state.plugins[pluginIndex];
      if (!activePlugin) return;

      const activePluginKey = makePluginKey(activePlugin);

      if (event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();
        selectParamRangeTo(activePluginKey, nodeUid);
        return;
      }

      if (isMetaOrCtrlPressed(event)) {
        event.preventDefault();
        event.stopPropagation();

        const current = getParamSelectionUids(activePluginKey);
        if (current.includes(nodeUid)) {
          setParamSelectionUids(activePluginKey, current.filter((uid) => uid !== nodeUid), { keepAnchor: true });
        } else {
          state.paramSelectionAnchorByPlugin[activePluginKey] = nodeUid;
          setParamSelectionUids(activePluginKey, current.concat(nodeUid), { keepAnchor: true });
        }
        return;
      }

      setParamSelectionUids(activePluginKey, [nodeUid]);
    });

    wrapper.appendChild(head);

    if (node.desc) {
      const desc = document.createElement('p');
      desc.className = 'param-desc';
      desc.textContent = node.desc;
      wrapper.appendChild(desc);
    }

    const inputGrid = document.createElement('div');
    inputGrid.className = 'param-input-grid';

    const typedLabel = document.createElement('label');
    typedLabel.textContent = 'Typed';

    const plainLabel = document.createElement('label');
    plainLabel.textContent = 'Plain Text';

    const plainInput = document.createElement(node.type === 'note' || node.isList || node.isStruct ? 'textarea' : 'input');
    if (plainInput.tagName.toLowerCase() === 'input') {
      plainInput.type = 'text';
    } else {
      plainInput.rows = 3;
    }

    plainInput.value = node.value;

    const typedControl = createTypedControl(node, node.value, (typedValue) => {
      updatePluginParameterValue(pluginIndex, node.name, typedValue);
      if (plainInput.value !== String(typedValue)) {
        plainInput.value = String(typedValue);
      }
    });

    plainInput.addEventListener('input', () => {
      const value = plainInput.value;
      updatePluginParameterValue(pluginIndex, node.name, value);
      typedControl.setFromPlain(value);
    });

    typedLabel.appendChild(typedControl.element);
    plainLabel.appendChild(plainInput);

    if (node.isList) {
      inputGrid.classList.add('list-mode');
      inputGrid.appendChild(plainLabel);
      inputGrid.appendChild(typedLabel);
    } else {
      inputGrid.appendChild(typedLabel);
      inputGrid.appendChild(plainLabel);
    }

    wrapper.appendChild(inputGrid);

    if (node.children && node.children.length > 0) {
      const childrenDetails = document.createElement('details');
      childrenDetails.className = 'param-children-tree';
      childrenDetails.dataset.paramSelectUid = nodeUid;
      bindTypedTreeDetailsState(childrenDetails, node, 'param-children', true);

      const childrenSummary = document.createElement('summary');
      childrenSummary.textContent = `Child Parameters (${node.children.length})`;

      const childWrap = document.createElement('div');
      childWrap.className = 'param-children';
      node.children.forEach((child, childIndex) => {
        const childName = encodeURIComponent(String(child && child.name ? child.name : ''));
        renderParameterNode(
          child,
          pluginIndex,
          childWrap,
          tokens.concat(`${childIndex}:${childName}`)
        );
      });

      childrenDetails.appendChild(childrenSummary);
      childrenDetails.appendChild(childWrap);
      wrapper.appendChild(childrenDetails);
    }

    container.appendChild(wrapper);
  }

  async function ensureMetadata(pluginName) {
    if (!pluginName) {
      return {
        found: false,
        metadata: [],
        schema: [],
        helpText: '',
        structMetadata: {},
        structSchema: {}
      };
    }
    if (state.metadataCache[pluginName]) return state.metadataCache[pluginName];

    if (!state.metadataPromise[pluginName]) {
      state.metadataPromise[pluginName] = apiGet(`/api/plugin-metadata?pluginName=${encodeURIComponent(pluginName)}`)
        .then((result) => {
          const normalized = {
            found: Boolean(result.found),
            pluginFilePath: result.pluginFilePath || '',
            metadata: Array.isArray(result.metadata) ? result.metadata : [],
            schema: Array.isArray(result.schema) ? result.schema : [],
            helpText: String(result.helpText || ''),
            structMetadata: result.structMetadata && typeof result.structMetadata === 'object'
              ? result.structMetadata
              : {},
            structSchema: result.structSchema && typeof result.structSchema === 'object'
              ? result.structSchema
              : {}
          };
          state.metadataCache[pluginName] = normalized;
          return normalized;
        })
        .catch((error) => {
          const fallback = {
            found: false,
            pluginFilePath: '',
            metadata: [],
            schema: [],
            helpText: '',
            structMetadata: {},
            structSchema: {}
          };
          state.metadataCache[pluginName] = fallback;
          showToast(error.message, 'bad');
          return fallback;
        })
        .finally(() => {
          delete state.metadataPromise[pluginName];
        });
    }

    return state.metadataPromise[pluginName];
  }

  function ensureSchemaDraftForPlugin(pluginKey, plugin, metadataResult) {
    if (!state.schemaDrafts[pluginKey]) {
      let draft = [];

      if (metadataResult && metadataResult.found && metadataResult.schema.length > 0) {
        draft = cloneJson(metadataResult.schema);
      } else {
        draft = Object.keys(plugin.parameters || {}).map((name) => ({
          name,
          directives: [
            { key: 'param', value: name },
            { key: 'type', value: 'text' },
            { key: 'default', value: String(plugin.parameters[name] || '') }
          ]
        }));
      }

      state.schemaDrafts[pluginKey] = Array.isArray(draft) ? draft : [];
    }

    return schemaDraftEnsureList(state.schemaDrafts[pluginKey]);
  }

  function ensureStructSchemaDraftForPlugin(pluginKey, metadataResult) {
    if (!state.structSchemaDrafts[pluginKey]) {
      const sourceMap = metadataResult && metadataResult.structSchema && typeof metadataResult.structSchema === 'object'
        ? metadataResult.structSchema
        : {};

      const blockNames = Object.keys(sourceMap);
      const blocks = blockNames.map((name) => {
        const params = Array.isArray(sourceMap[name]) ? cloneJson(sourceMap[name]) : [];
        const block = {
          name: String(name || '').trim(),
          params
        };
        ensureDraftEntryUid(block);
        block.params = schemaDraftEnsureList(block.params);
        return block;
      });

      state.structSchemaDrafts[pluginKey] = blocks;
    }

    return structDraftEnsureBlockList(state.structSchemaDrafts[pluginKey]);
  }

  function schemaDraftCloneDirectiveList(directives) {
    const list = Array.isArray(directives) ? directives : [];
    const out = [];

    for (let i = 0; i < list.length; i += 1) {
      const source = list[i] && typeof list[i] === 'object' ? list[i] : {};
      const key = String(source.key === undefined || source.key === null ? '' : source.key).trim();
      if (!key) continue;

      out.push({
        key,
        value: source.value === undefined || source.value === null ? '' : String(source.value)
      });
    }

    return out;
  }

  function schemaDraftCloneEntry(entry, keepUid) {
    const source = entry && typeof entry === 'object' ? entry : {};
    const out = {
      name: String(source.name === undefined || source.name === null ? '' : source.name).trim(),
      directives: schemaDraftCloneDirectiveList(source.directives)
    };

    if (keepUid && source._uid) {
      out._uid = String(source._uid);
    }

    return schemaDraftNormalizeEntryInPlace(out, out.name || 'Param');
  }

  function schemaDraftNormalizeEntryInPlace(entry, fallbackName) {
    const target = entry && typeof entry === 'object' ? entry : {};
    const name = String(target.name === undefined || target.name === null ? fallbackName || '' : target.name).trim();
    const directives = schemaDraftCloneDirectiveList(target.directives);

    const withoutParam = directives.filter((directive) => {
      return String(directive.key || '').toLowerCase() !== 'param';
    });

    target.name = name;
    target.directives = [{ key: 'param', value: name }].concat(withoutParam);
    ensureDraftEntryUid(target);
    return target;
  }

  function schemaDraftEnsureList(list) {
    const draft = Array.isArray(list) ? list : [];
    for (let i = 0; i < draft.length; i += 1) {
      draft[i] = schemaDraftNormalizeEntryInPlace(draft[i], `Param${i + 1}`);
    }
    return draft;
  }

  function structDraftEnsureBlockList(list) {
    const draft = Array.isArray(list) ? list : [];
    for (let i = 0; i < draft.length; i += 1) {
      const block = draft[i] && typeof draft[i] === 'object' ? draft[i] : {};
      block.name = String(block.name === undefined || block.name === null ? '' : block.name).trim();
      block.params = schemaDraftEnsureList(block.params);
      ensureDraftEntryUid(block);
      draft[i] = block;
    }
    return draft;
  }

  function schemaDraftCreateEntry(nameSeed) {
    const name = String(nameSeed || '').trim();
    const entry = {
      name,
      directives: [
        { key: 'param', value: name },
        { key: 'type', value: 'text' },
        { key: 'default', value: '' }
      ]
    };
    ensureDraftEntryUid(entry);
    return entry;
  }

  function structDraftCreateBlock(nameSeed) {
    const name = String(nameSeed || '').trim();
    const block = {
      name,
      params: [schemaDraftCreateEntry('Param1')]
    };
    ensureDraftEntryUid(block);
    return block;
  }

  function schemaDraftBuildUniqueParamName(entries, seed) {
    const base = String(seed || 'Param').trim() || 'Param';
    const used = new Set();
    const list = Array.isArray(entries) ? entries : [];

    for (let i = 0; i < list.length; i += 1) {
      const name = String(list[i] && list[i].name ? list[i].name : '').trim().toLowerCase();
      if (name) used.add(name);
    }

    let candidate = base;
    let counter = 1;
    while (used.has(candidate.toLowerCase())) {
      counter += 1;
      candidate = `${base}${counter}`;
    }
    return candidate;
  }

  function structDraftBuildUniqueBlockName(blocks, seed) {
    const base = String(seed || 'Struct').trim() || 'Struct';
    const used = new Set();
    const list = Array.isArray(blocks) ? blocks : [];

    for (let i = 0; i < list.length; i += 1) {
      const name = String(list[i] && list[i].name ? list[i].name : '').trim().toLowerCase();
      if (name) used.add(name);
    }

    let candidate = base;
    let counter = 1;
    while (used.has(candidate.toLowerCase())) {
      counter += 1;
      candidate = `${base}${counter}`;
    }
    return candidate;
  }

  function schemaDraftGetDirectiveValue(entry, key) {
    const lower = String(key || '').toLowerCase();
    const directives = Array.isArray(entry && entry.directives) ? entry.directives : [];

    for (let i = 0; i < directives.length; i += 1) {
      const directive = directives[i];
      if (String(directive && directive.key ? directive.key : '').toLowerCase() !== lower) continue;
      return directive.value === undefined || directive.value === null ? '' : String(directive.value);
    }

    return '';
  }

  function schemaDraftMoveItem(list, fromIndex, toIndex) {
    if (!Array.isArray(list)) return false;
    if (fromIndex < 0 || fromIndex >= list.length) return false;
    if (toIndex < 0 || toIndex > list.length) return false;
    if (fromIndex === toIndex || fromIndex + 1 === toIndex) return false;

    const moved = list.splice(fromIndex, 1)[0];
    const target = fromIndex < toIndex ? toIndex - 1 : toIndex;
    list.splice(target, 0, moved);
    return true;
  }

  function schemaDraftFindSubtreeEnd(depths, startIndex) {
    const depthList = Array.isArray(depths) ? depths : [];
    const baseDepth = Number(depthList[startIndex] || 0);
    let end = startIndex;

    for (let i = startIndex + 1; i < depthList.length; i += 1) {
      const nextDepth = Number(depthList[i] || 0);
      if (nextDepth <= baseDepth) break;
      end = i;
    }

    return end;
  }

  function schemaDraftMoveEntryBranch(list, depths, fromIndex, toIndex) {
    if (!Array.isArray(list)) return false;
    if (fromIndex < 0 || fromIndex >= list.length) return false;

    const targetRaw = Number(toIndex);
    const targetIndex = Number.isFinite(targetRaw)
      ? Math.max(0, Math.min(list.length, targetRaw))
      : 0;

    const depthList = Array.isArray(depths) && depths.length === list.length
      ? depths
      : schemaDraftComputeDepths(list);

    const subtreeEnd = schemaDraftFindSubtreeEnd(depthList, fromIndex);
    const subtreeLength = subtreeEnd - fromIndex + 1;

    if (targetIndex > fromIndex && targetIndex <= subtreeEnd + 1) {
      return false;
    }

    const insertAfterRemoval = targetIndex > subtreeEnd
      ? targetIndex - subtreeLength
      : targetIndex;

    if (insertAfterRemoval === fromIndex) {
      return false;
    }

    const moved = list.splice(fromIndex, subtreeLength);
    list.splice(insertAfterRemoval, 0, ...moved);
    return true;
  }

  function schemaDraftComputeDepths(entries) {
    const list = Array.isArray(entries) ? entries : [];
    const indexByName = {};

    for (let i = 0; i < list.length; i += 1) {
      const name = String(list[i] && list[i].name ? list[i].name : '').trim().toLowerCase();
      if (!name || Object.prototype.hasOwnProperty.call(indexByName, name)) continue;
      indexByName[name] = i;
    }

    const memo = new Array(list.length).fill(-1);

    function resolveDepth(index, stack) {
      if (index < 0 || index >= list.length) return 0;
      if (memo[index] >= 0) return memo[index];
      if (stack.has(index)) return 0;

      stack.add(index);

      const parentName = schemaDraftGetDirectiveValue(list[index], 'parent').trim().toLowerCase();
      let depth = 0;
      if (parentName && Object.prototype.hasOwnProperty.call(indexByName, parentName)) {
        const parentIndex = indexByName[parentName];
        depth = Math.min(8, resolveDepth(parentIndex, stack) + 1);
      }

      stack.delete(index);
      memo[index] = depth;
      return depth;
    }

    const out = [];
    for (let i = 0; i < list.length; i += 1) {
      out[i] = resolveDepth(i, new Set());
    }
    return out;
  }

  function schemaDraftBuildStructMap(blocks) {
    const out = {};
    const list = structDraftEnsureBlockList(blocks);

    for (let i = 0; i < list.length; i += 1) {
      const block = list[i];
      const name = String(block.name || '').trim();
      if (!name) continue;
      out[name] = schemaDraftEnsureList(block.params)
        .map((entry) => schemaDraftCloneEntry(entry, false))
        .filter((entry) => Boolean(String(entry.name || '').trim()));
    }

    return out;
  }

  function markSchemaDirty(pluginKey) {
    recordHistoryCheckpoint();
    state.schemaDirtyKeys[pluginKey] = true;
    updateSchemaSaveButtonLabel();
  }

  function clearSchemaDirty(pluginKey) {
    delete state.schemaDirtyKeys[pluginKey];
    updateSchemaSaveButtonLabel();
  }

  function markStructSchemaDirty(pluginKey) {
    recordHistoryCheckpoint();
    state.structSchemaDirtyKeys[pluginKey] = true;
    updateStructSchemaSaveButtonLabel();
  }

  function clearStructSchemaDirty(pluginKey) {
    delete state.structSchemaDirtyKeys[pluginKey];
    updateStructSchemaSaveButtonLabel();
  }

  function renderSchemaDraftList(options) {
    const config = options && typeof options === 'object' ? options : {};
    const container = config.container;
    const pluginKey = String(config.pluginKey || '');
    const scope = String(config.scope || 'schema');
    const entries = schemaDraftEnsureList(config.entries);
    const onDirty = typeof config.onDirty === 'function' ? config.onDirty : () => {};
    const onRefresh = typeof config.onRefresh === 'function' ? config.onRefresh : () => {};
    const emptyMessage = String(config.emptyMessage || 'No entries.');
    const search = String(config.searchText || '').trim().toLowerCase();
    const searchScope = String(config.searchScope || '');
    const enableClipboard = Boolean(config.enableClipboard);
    const dragSourceKey = `schema-entry:${scope}`;

    if (!container) return;
    container.innerHTML = '';
    container.dataset.devScope = scope;
    container.dataset.devPluginKey = pluginKey;

    const depths = schemaDraftComputeDepths(entries);
    const validEntryUidSet = new Set(entries.map((entry) => ensureDraftEntryUid(entry)));
    let selectedEntryUids = getDevSelectionUids(scope, pluginKey)
      .filter((uid) => validEntryUidSet.has(uid));
    selectedEntryUids = setDevSelectionUids(scope, pluginKey, selectedEntryUids);

    let selectionAnchorUid = selectedEntryUids.length > 0
      ? selectedEntryUids[selectedEntryUids.length - 1]
      : '';

    function setSelection(nextUids, options) {
      const config = options && typeof options === 'object' ? options : {};
      selectedEntryUids = setDevSelectionUids(scope, pluginKey, uniqueStringList(nextUids)
        .filter((uid) => validEntryUidSet.has(uid)));

      if (!config.keepAnchor) {
        selectionAnchorUid = selectedEntryUids.length > 0
          ? selectedEntryUids[selectedEntryUids.length - 1]
          : '';
      } else if (selectionAnchorUid && !validEntryUidSet.has(selectionAnchorUid)) {
        selectionAnchorUid = selectedEntryUids.length > 0
          ? selectedEntryUids[selectedEntryUids.length - 1]
          : '';
      }

      if (selectedEntryUids.length > 0) {
        setLastEditorSelectionContext({
          kind: 'dev',
          scope,
          pluginKey
        });
      }

      return selectedEntryUids;
    }

    function selectRangeToEntry(entryUid) {
      if (!entryUid) return;

      const targetIndex = entries.findIndex((entry) => ensureDraftEntryUid(entry) === entryUid);
      if (targetIndex < 0) {
        setSelection([entryUid]);
        return;
      }

      if (!selectionAnchorUid || !validEntryUidSet.has(selectionAnchorUid)) {
        setSelection([entryUid]);
        return;
      }

      const anchorIndex = entries.findIndex((entry) => ensureDraftEntryUid(entry) === selectionAnchorUid);
      if (anchorIndex < 0) {
        setSelection([entryUid]);
        return;
      }

      const start = Math.min(anchorIndex, targetIndex);
      const end = Math.max(anchorIndex, targetIndex);
      const rangeUids = [];

      for (let i = start; i <= end; i += 1) {
        rangeUids.push(ensureDraftEntryUid(entries[i]));
      }

      setSelection(rangeUids, { keepAnchor: true });
    }

    function applySelectionClasses() {
      const selectedSet = new Set(selectedEntryUids);
      const cards = container.querySelectorAll('.schema-entry');
      for (let i = 0; i < cards.length; i += 1) {
        const card = cards[i];
        const uid = String(card.dataset.entryUid || '');
        card.classList.toggle('selected', selectedSet.has(uid));
      }
    }

    function selectedRootUidsForEntry(entryUid) {
      const scoped = selectedEntryUids.includes(entryUid)
        ? selectedEntryUids.slice()
        : [entryUid];
      const rootIndexes = schemaDraftResolveBranchRootIndicesByUid(entries, depths, scoped);
      return rootIndexes.map((index) => ensureDraftEntryUid(entries[index]));
    }

    function schemaClipboardEntries() {
      if (!state.schemaParamClipboard || typeof state.schemaParamClipboard !== 'object') {
        return [];
      }

      if (Array.isArray(state.schemaParamClipboard.entries)) {
        return state.schemaParamClipboard.entries;
      }

      if (state.schemaParamClipboard.entry && typeof state.schemaParamClipboard.entry === 'object') {
        return [state.schemaParamClipboard.entry];
      }

      return [];
    }

    function schemaClipboardCount() {
      return schemaClipboardEntries().length;
    }

    function hasActiveScopeSearch() {
      if (searchScope === 'schema') {
        return Boolean(state.schemaSearch.trim());
      }
      if (searchScope === 'structSchema') {
        return Boolean(state.structSchemaSearch.trim());
      }
      return false;
    }

    function clearSearchAndLocateEntry(entryUid) {
      if (searchScope === 'schema') {
        clearSchemaSearchAndLocate(entryUid);
        return;
      }
      if (searchScope === 'structSchema') {
        clearStructSchemaSearchAndLocate(entryUid);
      }
    }

    function parentTreeStateKey(entry) {
      return buildDevEntryOpenKey(`${scope}:parent-tree`, pluginKey, ensureDraftEntryUid(entry));
    }

    function isParentTreeExpanded(entry) {
      const key = parentTreeStateKey(entry);
      if (!Object.prototype.hasOwnProperty.call(state.devEntryOpenState, key)) {
        return true;
      }
      return Boolean(state.devEntryOpenState[key]);
    }

    function setParentTreeExpanded(entry, expanded) {
      const key = parentTreeStateKey(entry);
      state.devEntryOpenState[key] = Boolean(expanded);
      requestManagerLayoutDirtyLabelRefresh();
    }

    function buildEntryHaystack(entry) {
      const directives = Array.isArray(entry && entry.directives) ? entry.directives : [];
      return `${String(entry && entry.name ? entry.name : '')} ${directives.map((d) => `${d.key}:${d.value}`).join(' ')}`.toLowerCase();
    }

    function insertNewAt(insertIndex) {
      const nextName = schemaDraftBuildUniqueParamName(entries, 'NewParam');
      entries.splice(Math.max(0, Math.min(entries.length, insertIndex)), 0, schemaDraftCreateEntry(nextName));
      onDirty();
      onRefresh();
    }

    function copySelection(entryUids, isCut) {
      const rootIndexes = schemaDraftResolveBranchRootIndicesByUid(entries, depths, entryUids);
      if (rootIndexes.length <= 0) return;

      const payload = rootIndexes
        .map((index) => schemaDraftCloneEntry(entries[index], false))
        .filter(Boolean);

      state.schemaParamClipboard = {
        mode: isCut ? 'cut' : 'copy',
        entries: payload
      };

      if (!isCut) {
        showToast(payload.length > 1 ? 'Schema parameters copied.' : 'Schema parameter copied.', 'good');
        return;
      }

      for (let i = rootIndexes.length - 1; i >= 0; i -= 1) {
        const index = rootIndexes[i];
        const subtreeEnd = schemaDraftFindSubtreeEnd(depths, index);
        entries.splice(index, subtreeEnd - index + 1);
      }

      setSelection([]);
      onDirty();
      onRefresh();
      showToast(payload.length > 1 ? 'Schema parameters cut.' : 'Schema parameter cut.', 'good');
    }

    function deleteSelection(entryUids) {
      const rootIndexes = schemaDraftResolveBranchRootIndicesByUid(entries, depths, entryUids);
      if (rootIndexes.length <= 0) return;

      for (let i = rootIndexes.length - 1; i >= 0; i -= 1) {
        const index = rootIndexes[i];
        const subtreeEnd = schemaDraftFindSubtreeEnd(depths, index);
        entries.splice(index, subtreeEnd - index + 1);
      }

      setSelection([]);
      onDirty();
      onRefresh();
    }

    function pasteAt(insertIndex) {
      const clipboardEntries = schemaClipboardEntries();
      if (clipboardEntries.length <= 0) {
        showToast('Schema parameter clipboard is empty.', 'bad');
        return;
      }

      const clones = clipboardEntries
        .map((entry) => schemaDraftCloneEntry(entry, false))
        .filter(Boolean);

      const safeIndex = Math.max(0, Math.min(entries.length, insertIndex));
      entries.splice(safeIndex, 0, ...clones);

      if (state.schemaParamClipboard && state.schemaParamClipboard.mode === 'cut') {
        state.schemaParamClipboard = null;
      }

      onDirty();
      onRefresh();
      showToast(clones.length > 1 ? 'Schema parameters pasted.' : 'Schema parameter pasted.', 'good');
    }

    function hasDragSelection() {
      return state.dragSource === dragSourceKey
        && Array.isArray(state.dragSchemaSelectionUids)
        && state.dragSchemaSelectionUids.length > 0;
    }

    function buildGap(insertIndex) {
      const gap = document.createElement('div');
      gap.className = 'schema-gap';
      gap.title = 'Double-click to insert new parameter here.';

      gap.addEventListener('dblclick', () => {
        insertNewAt(insertIndex);
      });

      gap.addEventListener('contextmenu', (event) => {
        const clipboardCount = schemaClipboardCount();

        showContextMenu(event, [
          {
            label: 'Insert New Parameter Here',
            action: () => insertNewAt(insertIndex)
          },
          {
            label: clipboardCount > 1 ? 'Paste Parameters Here' : 'Paste Parameter Here',
            disabled: clipboardCount <= 0,
            action: () => pasteAt(insertIndex)
          }
        ]);
      });

      gap.addEventListener('dragover', (event) => {
        if (!hasDragSelection()) return;
        event.preventDefault();
        autoScrollVerticalOnDrag(event, dom.editorContent);
        gap.classList.add('drop-before');
      });

      gap.addEventListener('dragleave', () => {
        gap.classList.remove('drop-before');
      });

      gap.addEventListener('drop', (event) => {
        gap.classList.remove('drop-before');
        if (!hasDragSelection()) return;
        event.preventDefault();

        const moved = schemaDraftMoveEntryBranchesByUid(
          entries,
          depths,
          state.dragSchemaSelectionUids,
          insertIndex
        );

        state.dragSchemaIndex = null;
        state.dragSchemaSelectionUids = [];
        state.dragSource = '';

        if (moved) {
          onDirty();
          onRefresh();
        }
      });

      return gap;
    }

    let rendered = 0;
    const includeGaps = search.length <= 0;
    let collapsedDepth = -1;

    for (let entryIndex = 0; entryIndex < entries.length; entryIndex += 1) {
      const entry = entries[entryIndex];
      const depth = Number(depths[entryIndex] || 0);

      if (includeGaps && collapsedDepth >= 0) {
        if (depth > collapsedDepth) {
          continue;
        }
        collapsedDepth = -1;
      }

      if (search && !buildEntryHaystack(entry).includes(search)) {
        continue;
      }

      const entryUid = ensureDraftEntryUid(entry);
      const subtreeEnd = schemaDraftFindSubtreeEnd(depths, entryIndex);
      const hasChildren = subtreeEnd > entryIndex;
      const parentExpanded = hasChildren ? isParentTreeExpanded(entry) : true;

      if (includeGaps) {
        container.appendChild(buildGap(entryIndex));
      }

      rendered += 1;

      const details = document.createElement('details');
      details.className = 'schema-card schema-entry';
      bindDevEntryOpenState(details, scope, pluginKey, entryUid, true);
      details.dataset.entryUid = entryUid;
      details.classList.toggle('selected', selectedEntryUids.includes(entryUid));

      if (hasChildren) {
        details.classList.add('has-parent-toggle');
      }

      if (depth > 0) {
        details.classList.add('schema-nested');
        details.style.marginLeft = `${Math.min(depth, 8) * 14}px`;
      }

      details.addEventListener('dragover', (event) => {
        if (!hasDragSelection()) return;
        event.preventDefault();
        autoScrollVerticalOnDrag(event, dom.editorContent);
        details.classList.add('drop-before');
      });

      details.addEventListener('dragleave', () => {
        details.classList.remove('drop-before');
      });

      details.addEventListener('drop', (event) => {
        details.classList.remove('drop-before');
        if (!hasDragSelection()) return;
        event.preventDefault();

        const moved = schemaDraftMoveEntryBranchesByUid(
          entries,
          depths,
          state.dragSchemaSelectionUids,
          entryIndex
        );

        state.dragSchemaIndex = null;
        state.dragSchemaSelectionUids = [];
        state.dragSource = '';

        if (moved) {
          onDirty();
          onRefresh();
        }
      });

      details.addEventListener('contextmenu', (event) => {
        const selectionUids = selectedRootUidsForEntry(entryUid);
        const selectionCount = selectionUids.length;
        const clipboardCount = schemaClipboardCount();
        const actions = [];

        if (hasActiveScopeSearch()) {
          actions.push({
            label: 'Clear Search and Locate element',
            action: () => clearSearchAndLocateEntry(entryUid)
          });
        }

        actions.push(
          {
            label: 'Insert New Parameter Above',
            action: () => insertNewAt(entryIndex)
          },
          {
            label: 'Insert New Parameter Below',
            action: () => insertNewAt(entryIndex + 1)
          }
        );

        if (enableClipboard) {
          actions.push(
            {
              label: selectionCount > 1 ? 'Copy Selected Parameters' : 'Copy Parameter',
              action: () => copySelection(selectionUids, false)
            },
            {
              label: selectionCount > 1 ? 'Cut Selected Parameters' : 'Cut Parameter',
              action: () => copySelection(selectionUids, true)
            },
            {
              label: clipboardCount > 1 ? 'Paste Parameters Above' : 'Paste Above',
              disabled: clipboardCount <= 0,
              action: () => pasteAt(entryIndex)
            },
            {
              label: clipboardCount > 1 ? 'Paste Parameters Below' : 'Paste Below',
              disabled: clipboardCount <= 0,
              action: () => pasteAt(entryIndex + 1)
            }
          );
        }

        actions.push({
          label: selectionCount > 1 ? 'Delete Selected Parameters' : 'Delete Parameter',
          action: () => deleteSelection(selectionUids)
        });

        showContextMenu(event, actions);
      });

      const summary = document.createElement('summary');

      summary.addEventListener('click', (event) => {
        if (event.shiftKey) {
          event.preventDefault();
          event.stopPropagation();

          selectRangeToEntry(entryUid);
          applySelectionClasses();
          return;
        }

        if (isMetaOrCtrlPressed(event)) {
          event.preventDefault();
          event.stopPropagation();

          if (selectedEntryUids.includes(entryUid)) {
            setSelection(selectedEntryUids.filter((uid) => uid !== entryUid), { keepAnchor: true });
          } else {
            selectionAnchorUid = entryUid;
            setSelection(selectedEntryUids.concat(entryUid), { keepAnchor: true });
          }
          applySelectionClasses();
          return;
        }

        setSelection([entryUid]);
        applySelectionClasses();
      });

      const grabHandle = document.createElement('span');
      grabHandle.className = 'typed-grab-handle';
      grabHandle.title = 'Drag parameter to reorder.';
      grabHandle.draggable = true;

      grabHandle.addEventListener('mousedown', (event) => {
        event.stopPropagation();
        setSelection(selectedRootUidsForEntry(entryUid));
        applySelectionClasses();
      });

      grabHandle.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
      });

      grabHandle.addEventListener('dragstart', (event) => {
        state.dragSource = dragSourceKey;
        state.dragSchemaIndex = entryIndex;
        state.dragSchemaSelectionUids = selectedRootUidsForEntry(entryUid);
        details.classList.add('dragging');
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = 'move';
        }
      });

      grabHandle.addEventListener('dragend', () => {
        details.classList.remove('dragging');
        if (state.dragSource === dragSourceKey) {
          state.dragSource = '';
          state.dragSchemaIndex = null;
          state.dragSchemaSelectionUids = [];
        }
      });

      const title = document.createElement('span');
      title.className = 'schema-entry-title';
      title.textContent = entry.name || '(Unnamed @param)';

      if (hasChildren) {
        const parentToggle = document.createElement('button');
        parentToggle.type = 'button';
        parentToggle.className = 'schema-parent-toggle';
        parentToggle.textContent = parentExpanded ? '▾' : '▸';
        parentToggle.title = parentExpanded ? 'Collapse child parameters' : 'Expand child parameters';
        parentToggle.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          setParentTreeExpanded(entry, !parentExpanded);
          onRefresh();
        });
        summary.appendChild(grabHandle);
        summary.appendChild(parentToggle);
      } else {
        summary.appendChild(grabHandle);
      }

      const actions = document.createElement('div');
      actions.className = 'schema-entry-actions';

      if (enableClipboard) {
        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.textContent = selectedRootUidsForEntry(entryUid).length > 1 ? 'Copy Selected' : 'Copy';
        copyBtn.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          copySelection(selectedRootUidsForEntry(entryUid), false);
        });
        actions.appendChild(copyBtn);

        const pasteBtn = document.createElement('button');
        pasteBtn.type = 'button';
        pasteBtn.textContent = schemaClipboardCount() > 1 ? 'Paste Many' : 'Paste';
        pasteBtn.disabled = schemaClipboardCount() <= 0;
        pasteBtn.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          pasteAt(entryIndex + 1);
        });
        actions.appendChild(pasteBtn);
      }

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.textContent = selectedRootUidsForEntry(entryUid).length > 1 ? 'Delete Selected' : 'Delete';
      deleteBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        deleteSelection(selectedRootUidsForEntry(entryUid));
      });
      actions.appendChild(deleteBtn);

      summary.appendChild(title);
      summary.appendChild(actions);
      details.appendChild(summary);

      const body = document.createElement('div');
      body.className = 'schema-entry-body';

      const top = document.createElement('div');
      top.className = 'schema-card-top';

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.placeholder = '@param name';
      nameInput.value = entry.name;
      nameInput.addEventListener('input', () => {
        entry.name = nameInput.value;
        schemaDraftNormalizeEntryInPlace(entry, entry.name || 'Param');
        title.textContent = entry.name || '(Unnamed @param)';
        onDirty();
      });

      const topActions = document.createElement('div');
      topActions.className = 'schema-actions';

      const addAboveBtn = document.createElement('button');
      addAboveBtn.type = 'button';
      addAboveBtn.textContent = 'Insert Above';
      addAboveBtn.addEventListener('click', () => {
        insertNewAt(entryIndex);
      });

      const addBelowBtn = document.createElement('button');
      addBelowBtn.type = 'button';
      addBelowBtn.textContent = 'Insert Below';
      addBelowBtn.addEventListener('click', () => {
        insertNewAt(entryIndex + 1);
      });

      topActions.appendChild(addAboveBtn);
      topActions.appendChild(addBelowBtn);
      top.appendChild(nameInput);
      top.appendChild(topActions);
      body.appendChild(top);

      const directives = Array.isArray(entry.directives) ? entry.directives : [];
      for (let directiveIndex = 1; directiveIndex < directives.length; directiveIndex += 1) {
        const directive = directives[directiveIndex];

        const row = document.createElement('div');
        row.className = 'schema-directive-row';

        const keyInput = document.createElement('input');
        keyInput.type = 'text';
        keyInput.placeholder = 'directive (ex: type, default, parent, desc)';
        keyInput.value = directive.key || '';

        const valueInput = document.createElement('textarea');
        valueInput.placeholder = 'directive value';
        valueInput.value = directive.value || '';

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = 'x';

        keyInput.addEventListener('input', () => {
          directive.key = keyInput.value;
          onDirty();
        });

        valueInput.addEventListener('input', () => {
          directive.value = valueInput.value;
          onDirty();
        });

        removeBtn.addEventListener('click', () => {
          directives.splice(directiveIndex, 1);
          schemaDraftNormalizeEntryInPlace(entry, entry.name || 'Param');
          onDirty();
          onRefresh();
        });

        row.appendChild(keyInput);
        row.appendChild(valueInput);
        row.appendChild(removeBtn);
        body.appendChild(row);
      }

      const addDirective = document.createElement('button');
      addDirective.type = 'button';
      addDirective.textContent = '+ Add Directive';
      addDirective.addEventListener('click', () => {
        directives.push({ key: 'desc', value: '' });
        onDirty();
        onRefresh();
      });

      body.appendChild(addDirective);
      details.appendChild(body);
      container.appendChild(details);

      if (includeGaps && hasChildren && !parentExpanded) {
        collapsedDepth = depth;
      }
    }

    if (includeGaps) {
      container.appendChild(buildGap(entries.length));
    }

    if (rendered <= 0) {
      const empty = document.createElement('p');
      empty.className = 'hint';
      empty.textContent = search
        ? 'No schema entries match your search.'
        : emptyMessage;
      container.appendChild(empty);
    }
  }

  function renderSchemaEditor(pluginIndex, metadataResult) {
    dom.schemaEditor.innerHTML = '';

    const plugin = state.plugins[pluginIndex];
    const pluginKey = makePluginKey(plugin);

    if (!metadataResult.found) {
      const msg = document.createElement('p');
      msg.className = 'hint';
      msg.textContent = 'Plugin file not found in js/plugins. Schema editing unavailable for this row.';
      dom.schemaEditor.appendChild(msg);
      return;
    }

    const draft = ensureSchemaDraftForPlugin(pluginKey, plugin, metadataResult);

    renderSchemaDraftList({
      container: dom.schemaEditor,
      pluginKey,
      scope: 'plugin-schema-param',
      entries: draft,
      searchText: state.schemaSearch,
      searchScope: 'schema',
      emptyMessage: 'No parameters in schema yet.',
      enableClipboard: true,
      onDirty: () => markSchemaDirty(pluginKey),
      onRefresh: () => renderSchemaEditor(pluginIndex, metadataResult)
    });

  }

  function renderStructSchemaEditor(pluginIndex, metadataResult) {
    dom.structSchemaEditor.innerHTML = '';

    const plugin = state.plugins[pluginIndex];
    const pluginKey = makePluginKey(plugin);
    dom.structSchemaEditor.dataset.devScope = 'struct-schema-block';
    dom.structSchemaEditor.dataset.devPluginKey = pluginKey;
    const search = String(state.structSchemaSearch || '').trim().toLowerCase();

    if (!metadataResult.found) {
      const msg = document.createElement('p');
      msg.className = 'hint';
      msg.textContent = 'Plugin file not found in js/plugins. Struct editing unavailable for this row.';
      dom.structSchemaEditor.appendChild(msg);
      return;
    }

    const blocks = ensureStructSchemaDraftForPlugin(pluginKey, metadataResult);
    const dragSourceKey = `struct-block:${pluginKey}`;
    const selectionScope = 'struct-schema-block';

    const validBlockUidSet = new Set(blocks.map((block) => ensureDraftEntryUid(block)));
    let selectedBlockUids = getDevSelectionUids(selectionScope, pluginKey)
      .filter((uid) => validBlockUidSet.has(uid));
    selectedBlockUids = setDevSelectionUids(selectionScope, pluginKey, selectedBlockUids);

    let blockSelectionAnchorUid = selectedBlockUids.length > 0
      ? selectedBlockUids[selectedBlockUids.length - 1]
      : '';

    function setBlockSelection(nextUids, options) {
      const config = options && typeof options === 'object' ? options : {};
      selectedBlockUids = setDevSelectionUids(selectionScope, pluginKey, uniqueStringList(nextUids)
        .filter((uid) => validBlockUidSet.has(uid)));

      if (!config.keepAnchor) {
        blockSelectionAnchorUid = selectedBlockUids.length > 0
          ? selectedBlockUids[selectedBlockUids.length - 1]
          : '';
      } else if (blockSelectionAnchorUid && !validBlockUidSet.has(blockSelectionAnchorUid)) {
        blockSelectionAnchorUid = selectedBlockUids.length > 0
          ? selectedBlockUids[selectedBlockUids.length - 1]
          : '';
      }

      if (selectedBlockUids.length > 0) {
        setLastEditorSelectionContext({
          kind: 'dev',
          scope: selectionScope,
          pluginKey
        });
      }

      return selectedBlockUids;
    }

    function selectBlockRangeTo(blockUid) {
      if (!blockUid) return;

      const targetIndex = blocks.findIndex((block) => ensureDraftEntryUid(block) === blockUid);
      if (targetIndex < 0) {
        setBlockSelection([blockUid]);
        return;
      }

      if (!blockSelectionAnchorUid || !validBlockUidSet.has(blockSelectionAnchorUid)) {
        setBlockSelection([blockUid]);
        return;
      }

      const anchorIndex = blocks.findIndex((block) => ensureDraftEntryUid(block) === blockSelectionAnchorUid);
      if (anchorIndex < 0) {
        setBlockSelection([blockUid]);
        return;
      }

      const start = Math.min(anchorIndex, targetIndex);
      const end = Math.max(anchorIndex, targetIndex);
      const rangeUids = [];

      for (let i = start; i <= end; i += 1) {
        rangeUids.push(ensureDraftEntryUid(blocks[i]));
      }

      setBlockSelection(rangeUids, { keepAnchor: true });
    }

    function applyBlockSelectionClasses() {
      const selectedSet = new Set(selectedBlockUids);
      const cards = dom.structSchemaEditor.querySelectorAll('.schema-entry');
      for (let i = 0; i < cards.length; i += 1) {
        const card = cards[i];
        const uid = String(card.dataset.entryUid || '');
        card.classList.toggle('selected', selectedSet.has(uid));
      }
    }

    function selectedBlockUidsForBlock(blockUid) {
      if (selectedBlockUids.includes(blockUid) && selectedBlockUids.length > 0) {
        return selectedBlockUids.slice();
      }
      return [blockUid];
    }

    function structClipboardBlocks() {
      if (!state.structBlockClipboard || typeof state.structBlockClipboard !== 'object') {
        return [];
      }

      if (Array.isArray(state.structBlockClipboard.blocks)) {
        return state.structBlockClipboard.blocks;
      }

      if (state.structBlockClipboard.block && typeof state.structBlockClipboard.block === 'object') {
        return [state.structBlockClipboard.block];
      }

      return [];
    }

    function structClipboardCount() {
      return structClipboardBlocks().length;
    }

    function refresh() {
      renderStructSchemaEditor(pluginIndex, metadataResult);
    }

    function markDirty() {
      markStructSchemaDirty(pluginKey);
    }

    function pasteBlockAt(insertIndex) {
      const clipboardBlocks = structClipboardBlocks();
      if (clipboardBlocks.length <= 0) {
        showToast('Struct block clipboard is empty.', 'bad');
        return;
      }

      const clones = clipboardBlocks.map((source) => {
        const clone = cloneJson(source || {});
        const block = {
          name: String(clone && clone.name ? clone.name : '').trim(),
          params: schemaDraftEnsureList(clone && clone.params)
        };
        delete block._uid;
        ensureDraftEntryUid(block);
        return block;
      });

      const safeIndex = Math.max(0, Math.min(blocks.length, insertIndex));
      blocks.splice(safeIndex, 0, ...clones);

      if (state.structBlockClipboard && state.structBlockClipboard.mode === 'cut') {
        state.structBlockClipboard = null;
      }

      markDirty();
      refresh();
      showToast(clones.length > 1 ? 'Struct blocks pasted.' : 'Struct block pasted.', 'good');
    }

    function insertBlockAt(insertIndex) {
      const name = structDraftBuildUniqueBlockName(blocks, 'Struct');
      blocks.splice(Math.max(0, Math.min(blocks.length, insertIndex)), 0, structDraftCreateBlock(name));
      markDirty();
      refresh();
    }

    function copyBlockSelection(blockUids, isCut) {
      const selectedSet = new Set(uniqueStringList(blockUids));
      const selectedBlocks = [];

      for (let i = 0; i < blocks.length; i += 1) {
        const block = blocks[i];
        const uid = ensureDraftEntryUid(block);
        if (!selectedSet.has(uid)) continue;

        selectedBlocks.push({
          name: String(block.name || '').trim(),
          params: schemaDraftEnsureList(block.params).map((entry) => schemaDraftCloneEntry(entry, false))
        });
      }

      if (selectedBlocks.length <= 0) return;

      state.structBlockClipboard = {
        mode: isCut ? 'cut' : 'copy',
        blocks: selectedBlocks
      };

      if (!isCut) {
        showToast(selectedBlocks.length > 1 ? 'Struct blocks copied.' : 'Struct block copied.', 'good');
        return;
      }

      for (let i = blocks.length - 1; i >= 0; i -= 1) {
        const uid = ensureDraftEntryUid(blocks[i]);
        if (!selectedSet.has(uid)) continue;
        blocks.splice(i, 1);
      }

      setBlockSelection([]);
      markDirty();
      refresh();
      showToast(selectedBlocks.length > 1 ? 'Struct blocks cut.' : 'Struct block cut.', 'good');
    }

    function deleteBlockSelection(blockUids) {
      const selectedSet = new Set(uniqueStringList(blockUids));
      let changed = false;

      for (let i = blocks.length - 1; i >= 0; i -= 1) {
        const uid = ensureDraftEntryUid(blocks[i]);
        if (!selectedSet.has(uid)) continue;
        blocks.splice(i, 1);
        changed = true;
      }

      if (!changed) return;

      setBlockSelection([]);
      markDirty();
      refresh();
    }

    function hasBlockDragSelection() {
      return state.dragSource === dragSourceKey
        && Array.isArray(state.dragStructSchemaSelectionUids)
        && state.dragStructSchemaSelectionUids.length > 0;
    }

    function buildGap(insertIndex) {
      const gap = document.createElement('div');
      gap.className = 'schema-gap';
      gap.title = 'Double-click to insert new struct block here.';

      gap.addEventListener('dblclick', () => {
        insertBlockAt(insertIndex);
      });

      gap.addEventListener('contextmenu', (event) => {
        const clipboardCount = structClipboardCount();

        showContextMenu(event, [
          {
            label: 'Insert New Struct Block Here',
            action: () => insertBlockAt(insertIndex)
          },
          {
            label: clipboardCount > 1 ? 'Paste Struct Blocks Here' : 'Paste Struct Block Here',
            disabled: clipboardCount <= 0,
            action: () => pasteBlockAt(insertIndex)
          }
        ]);
      });

      gap.addEventListener('dragover', (event) => {
        if (!hasBlockDragSelection()) return;
        event.preventDefault();
        autoScrollVerticalOnDrag(event, dom.editorContent);
        gap.classList.add('drop-before');
      });

      gap.addEventListener('dragleave', () => {
        gap.classList.remove('drop-before');
      });

      gap.addEventListener('drop', (event) => {
        gap.classList.remove('drop-before');
        if (!hasBlockDragSelection()) return;
        event.preventDefault();

        const moved = schemaDraftMoveItemsByUid(
          blocks,
          state.dragStructSchemaSelectionUids,
          insertIndex
        );

        state.dragStructSchemaIndex = null;
        state.dragStructSchemaSelectionUids = [];
        state.dragSource = '';

        if (moved) {
          markDirty();
          refresh();
        }
      });

      return gap;
    }

    let rendered = 0;
    const includeGaps = search.length <= 0;

    for (let blockIndex = 0; blockIndex < blocks.length; blockIndex += 1) {
      const block = blocks[blockIndex];
      const params = schemaDraftEnsureList(block.params);

      const haystack = [
        String(block.name || ''),
        ...params.map((entry) => `${entry.name} ${(entry.directives || []).map((d) => `${d.key}:${d.value}`).join(' ')}`)
      ].join(' ').toLowerCase();

      if (search && !haystack.includes(search)) {
        continue;
      }

      if (includeGaps) {
        dom.structSchemaEditor.appendChild(buildGap(blockIndex));
      }

      rendered += 1;

      const blockUid = ensureDraftEntryUid(block);
      const details = document.createElement('details');
      details.className = 'schema-card schema-entry';
      bindDevEntryOpenState(details, 'struct-schema-block', pluginKey, blockUid, true);
      details.dataset.entryUid = blockUid;
      details.classList.toggle('selected', selectedBlockUids.includes(blockUid));

      details.addEventListener('dragover', (event) => {
        if (!hasBlockDragSelection()) return;
        event.preventDefault();
        autoScrollVerticalOnDrag(event, dom.editorContent);
        details.classList.add('drop-before');
      });

      details.addEventListener('dragleave', () => {
        details.classList.remove('drop-before');
      });

      details.addEventListener('drop', (event) => {
        details.classList.remove('drop-before');
        if (!hasBlockDragSelection()) return;
        event.preventDefault();

        const moved = schemaDraftMoveItemsByUid(
          blocks,
          state.dragStructSchemaSelectionUids,
          blockIndex
        );

        state.dragStructSchemaIndex = null;
        state.dragStructSchemaSelectionUids = [];
        state.dragSource = '';

        if (moved) {
          markDirty();
          refresh();
        }
      });

      details.addEventListener('contextmenu', (event) => {
        const selectedUids = selectedBlockUidsForBlock(blockUid);
        const selectedCount = selectedUids.length;
        const clipboardCount = structClipboardCount();
        const actions = [];

        if (state.structSchemaSearch.trim()) {
          actions.push({
            label: 'Clear Search and Locate element',
            action: () => clearStructSchemaSearchAndLocate(blockUid)
          });
        }

        actions.push(
          {
            label: 'Insert New Struct Block Above',
            action: () => insertBlockAt(blockIndex)
          },
          {
            label: 'Insert New Struct Block Below',
            action: () => insertBlockAt(blockIndex + 1)
          },
          {
            label: selectedCount > 1 ? 'Copy Selected Struct Blocks' : 'Copy Struct Block',
            action: () => copyBlockSelection(selectedUids, false)
          },
          {
            label: selectedCount > 1 ? 'Cut Selected Struct Blocks' : 'Cut Struct Block',
            action: () => copyBlockSelection(selectedUids, true)
          },
          {
            label: clipboardCount > 1 ? 'Paste Struct Blocks Above' : 'Paste Above',
            disabled: clipboardCount <= 0,
            action: () => pasteBlockAt(blockIndex)
          },
          {
            label: clipboardCount > 1 ? 'Paste Struct Blocks Below' : 'Paste Below',
            disabled: clipboardCount <= 0,
            action: () => pasteBlockAt(blockIndex + 1)
          },
          {
            label: selectedCount > 1 ? 'Delete Selected Struct Blocks' : 'Delete Struct Block',
            action: () => deleteBlockSelection(selectedUids)
          }
        );

        showContextMenu(event, actions);
      });

      const summary = document.createElement('summary');

      summary.addEventListener('click', (event) => {
        if (event.shiftKey) {
          event.preventDefault();
          event.stopPropagation();

          selectBlockRangeTo(blockUid);
          applyBlockSelectionClasses();
          return;
        }

        if (isMetaOrCtrlPressed(event)) {
          event.preventDefault();
          event.stopPropagation();

          if (selectedBlockUids.includes(blockUid)) {
            setBlockSelection(selectedBlockUids.filter((uid) => uid !== blockUid), { keepAnchor: true });
          } else {
            blockSelectionAnchorUid = blockUid;
            setBlockSelection(selectedBlockUids.concat(blockUid), { keepAnchor: true });
          }
          applyBlockSelectionClasses();
          return;
        }

        setBlockSelection([blockUid]);
        applyBlockSelectionClasses();
      });

      const grabHandle = document.createElement('span');
      grabHandle.className = 'typed-grab-handle';
      grabHandle.title = 'Drag struct block to reorder.';
      grabHandle.draggable = true;

      grabHandle.addEventListener('mousedown', (event) => {
        event.stopPropagation();
        setBlockSelection(selectedBlockUidsForBlock(blockUid));
        applyBlockSelectionClasses();
      });

      grabHandle.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
      });

      grabHandle.addEventListener('dragstart', (event) => {
        state.dragSource = dragSourceKey;
        state.dragStructSchemaIndex = blockIndex;
        state.dragStructSchemaSelectionUids = selectedBlockUidsForBlock(blockUid);
        details.classList.add('dragging');
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = 'move';
        }
      });

      grabHandle.addEventListener('dragend', () => {
        details.classList.remove('dragging');
        if (state.dragSource === dragSourceKey) {
          state.dragSource = '';
          state.dragStructSchemaIndex = null;
          state.dragStructSchemaSelectionUids = [];
        }
      });

      const title = document.createElement('span');
      title.className = 'schema-entry-title';
      title.textContent = block.name || '(Unnamed Struct Block)';

      const actions = document.createElement('div');
      actions.className = 'schema-entry-actions';

      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.textContent = selectedBlockUidsForBlock(blockUid).length > 1 ? 'Copy Selected' : 'Copy';
      copyBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        copyBlockSelection(selectedBlockUidsForBlock(blockUid), false);
      });

      const pasteBtn = document.createElement('button');
      pasteBtn.type = 'button';
      pasteBtn.textContent = structClipboardCount() > 1 ? 'Paste Many' : 'Paste';
      pasteBtn.disabled = structClipboardCount() <= 0;
      pasteBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        pasteBlockAt(blockIndex + 1);
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.textContent = selectedBlockUidsForBlock(blockUid).length > 1 ? 'Delete Selected' : 'Delete';
      deleteBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        deleteBlockSelection(selectedBlockUidsForBlock(blockUid));
      });

      actions.appendChild(copyBtn);
      actions.appendChild(pasteBtn);
      actions.appendChild(deleteBtn);

      summary.appendChild(grabHandle);
      summary.appendChild(title);
      summary.appendChild(actions);
      details.appendChild(summary);

      const body = document.createElement('div');
      body.className = 'schema-entry-body';

      const top = document.createElement('div');
      top.className = 'schema-card-top';

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.placeholder = '~struct~ block name';
      nameInput.value = block.name || '';
      nameInput.addEventListener('input', () => {
        block.name = nameInput.value;
        title.textContent = block.name || '(Unnamed Struct Block)';
        markDirty();
      });

      const topActions = document.createElement('div');
      topActions.className = 'schema-actions';

      const addParamBtn = document.createElement('button');
      addParamBtn.type = 'button';
      addParamBtn.textContent = 'Add Param';
      addParamBtn.addEventListener('click', () => {
        const nextName = schemaDraftBuildUniqueParamName(params, 'Param');
        params.push(schemaDraftCreateEntry(nextName));
        block.params = params;
        markDirty();
        refresh();
      });

      topActions.appendChild(addParamBtn);
      top.appendChild(nameInput);
      top.appendChild(topActions);
      body.appendChild(top);

      const nestedEditor = document.createElement('div');
      nestedEditor.className = 'schema-editor';

      renderSchemaDraftList({
        container: nestedEditor,
        pluginKey,
        scope: `struct-param:${ensureDraftEntryUid(block)}`,
        entries: params,
        searchText: '',
        searchScope: 'structSchema',
        emptyMessage: 'No parameters in this struct block yet.',
        enableClipboard: true,
        onDirty: () => {
          block.params = params;
          markDirty();
        },
        onRefresh: () => {
          block.params = params;
          refresh();
        }
      });

      body.appendChild(nestedEditor);
      details.appendChild(body);
      dom.structSchemaEditor.appendChild(details);
    }

    if (includeGaps) {
      dom.structSchemaEditor.appendChild(buildGap(blocks.length));
    }

    if (rendered <= 0) {
      const empty = document.createElement('p');
      empty.className = 'hint';
      empty.textContent = search
        ? 'No struct blocks match your search.'
        : 'No struct blocks in schema yet.';
      dom.structSchemaEditor.appendChild(empty);
    }

  }

  function renderActivePluginPanelLoading(plugin) {
    dom.paramsTree.innerHTML = '';
    const loading = document.createElement('p');
    loading.className = 'hint';
    loading.textContent = `Loading metadata for ${plugin.name}...`;
    dom.paramsTree.appendChild(loading);
  }

  async function openActivePluginHelp() {
    const activeIndex = getActivePluginIndex();
    if (activeIndex < 0) {
      showToast('No active plugin tab.', 'bad');
      return;
    }

    const plugin = state.plugins[activeIndex];
    const metadataResult = await ensureMetadata(plugin.name);
    const helpText = String(metadataResult.helpText || '').trim();

    const opened = openReadOnlyTextPopupWindow({
      title: `${plugin.name || '(Unnamed Plugin)'} Help`,
      message: metadataResult.found
        ? (metadataResult.pluginFilePath || '')
        : 'No matching plugin file found in js/plugins',
      value: helpText || 'No @help section found in this plugin header.'
    });

    if (opened) return;

    await showTextViewModal({
      title: `${plugin.name || '(Unnamed Plugin)'} Help`,
      message: metadataResult.found
        ? (metadataResult.pluginFilePath || '')
        : 'No matching plugin file found in js/plugins',
      value: helpText || 'No @help section found in this plugin header.',
      readOnly: true,
      windowFit: true,
      cancelLabel: 'Close'
    });
  }

  async function renderActivePluginPanel() {
    const renderToken = state.activePanelRenderToken + 1;
    state.activePanelRenderToken = renderToken;

    const activeIndex = getActivePluginIndex();
    applyEditorSectionDetailsState();

    if (activeIndex < 0) {
      dom.btnActivePluginHelp.disabled = true;
      dom.emptyState.classList.remove('hidden');
      dom.pluginEditor.classList.add('hidden');
      return;
    }

    const plugin = state.plugins[activeIndex];
    const pluginKey = makePluginKey(plugin);

    dom.emptyState.classList.add('hidden');
    dom.pluginEditor.classList.remove('hidden');
    dom.btnActivePluginHelp.disabled = false;

    dom.activePluginTitle.textContent = plugin.name || '(Unnamed Plugin)';
    dom.activePluginStatus.checked = Boolean(plugin.status);
    dom.activePluginTags.value = getPluginTagsByKey(pluginKey).join(', ');

    dom.activePluginFolder.innerHTML = '';

    const childrenMap = getFolderChildrenMap();
    function appendOptions(parentId, depth) {
      const siblings = childrenMap.get(parentId || '__ROOT__') || [];
      for (let i = 0; i < siblings.length; i += 1) {
        const folder = siblings[i];
        const option = document.createElement('option');
        option.value = folder.id;
        option.textContent = `${'  '.repeat(depth)}${folder.name}`;
        dom.activePluginFolder.appendChild(option);
        appendOptions(folder.id, depth + 1);
      }
    }
    appendOptions(null, 0);
    dom.activePluginFolder.value = getPluginFolderIdByKey(pluginKey);

    dom.activePluginFileHint.textContent = '';
    renderActivePluginPanelLoading(plugin);

    const metadataResult = await ensureMetadata(plugin.name);

    // If active tab changed while waiting, stop.
    if (renderToken !== state.activePanelRenderToken || activeIndex !== getActivePluginIndex()) return;

    if (metadataResult.found) {
      dom.activePluginFileHint.textContent = metadataResult.pluginFilePath;
    } else {
      dom.activePluginFileHint.textContent = 'No matching plugin file found in js/plugins';
    }

    const parameterRoots = buildParameterTree(
      metadataResult.metadata,
      plugin.parameters || {},
      metadataResult.structMetadata || {}
    );
    const filteredRoots = filterParameterTree(parameterRoots, state.paramSearch);
    dom.paramsTree.innerHTML = '';

    if (filteredRoots.length <= 0) {
      const empty = document.createElement('p');
      empty.className = 'hint';
      empty.textContent = state.paramSearch.trim()
        ? 'No parameters match your search.'
        : 'No parameters found.';
      dom.paramsTree.appendChild(empty);
    } else {
      filteredRoots.forEach((rootNode, rootIndex) => {
        const rootName = encodeURIComponent(String(rootNode && rootNode.name ? rootNode.name : ''));
        renderParameterNode(rootNode, activeIndex, dom.paramsTree, [`${rootIndex}:${rootName}`]);
      });
    }

    setParamSelectionUids(pluginKey, getParamSelectionUids(pluginKey), { keepAnchor: true });

    renderSchemaEditor(activeIndex, metadataResult);
    renderStructSchemaEditor(activeIndex, metadataResult);
    updateSchemaSaveButtonLabel();
    updateStructSchemaSaveButtonLabel();
  }

  function renderAll() {
    renderProjectBadge();
    renderFolderTree();
    renderPluginList();
    renderTabs();
    clearDirtyLabels();
    renderActivePluginPanel();
    recordHistoryCheckpoint();
  }

  function reorderActivePlugin(direction) {
    const activeIndex = getActivePluginIndex();
    if (activeIndex < 0) return;

    const target = activeIndex + direction;
    if (target < 0 || target >= state.plugins.length) return;

    const temp = state.plugins[target];
    state.plugins[target] = state.plugins[activeIndex];
    state.plugins[activeIndex] = temp;

    markPluginsDirty();
    renderAll();
  }

  async function addFolder(parentIdOverride) {
    const name = await showTextPrompt({
      title: 'Create Internal Folder',
      message: 'Enter new internal folder name.',
      placeholder: 'Folder name',
      confirmLabel: 'Create'
    });
    if (name === null) return;

    const clean = String(name).trim();
    if (!clean) return;

    let parentId = parentIdOverride;
    if (parentId === undefined) {
      parentId = state.selectedFolderId === 'all' ? null : state.selectedFolderId;
    }

    if (parentId && !getFolderById(parentId)) {
      parentId = null;
    }

    const nextFolder = {
      id: generateFolderId(clean),
      name: clean,
      parentId: parentId || null,
      order: getNextFolderOrder(parentId || null)
    };

    state.folders.push(nextFolder);
    markLayoutDirty();
    renderAll();
  }

  async function renameFolder(folderIdOverride) {
    const folderId = folderIdOverride || state.selectedFolderId;
    if (!folderId || folderId === 'all' || folderId === 'ungrouped') {
      showToast('Select a non-default folder first.', 'bad');
      return;
    }

    const target = getFolderById(folderId);
    if (!target) return;

    const name = await showTextPrompt({
      title: 'Rename Internal Folder',
      message: 'Enter new folder name.',
      defaultValue: target.name,
      placeholder: 'Folder name',
      confirmLabel: 'Rename',
      cancelLabel: 'Cancel'
    });
    if (name === null) return;

    const clean = String(name).trim();
    if (!clean) return;

    target.name = clean;
    markLayoutDirty();
    renderAll();
  }

  async function deleteFoldersById(folderIds) {
    const ids = uniqueStringList(folderIds).filter((folderId) => {
      return folderId && folderId !== 'all' && folderId !== 'ungrouped' && getFolderById(folderId);
    });

    if (ids.length <= 0) {
      showToast('Select a non-default folder first.', 'bad');
      return;
    }

    const names = ids
      .map((folderId) => {
        const folder = getFolderById(folderId);
        return folder ? folder.name : folderId;
      })
      .filter(Boolean);

    const ok = await showConfirmPrompt({
      title: ids.length === 1 ? 'Delete Internal Folder' : 'Delete Internal Folders',
      message: ids.length === 1
        ? `Delete folder '${names[0]}'? Child folders move up one level. Plugins move to Ungrouped.`
        : `Delete ${ids.length} folders? Child folders move up one level. Plugins move to Ungrouped.`,
      confirmLabel: ids.length === 1 ? 'Delete Folder' : 'Delete Folders',
      cancelLabel: 'Cancel'
    });
    if (!ok) return;

    const deletedSet = new Set(ids);
    const parentFallbackById = {};

    ids.forEach((folderId) => {
      const folder = getFolderById(folderId);
      if (!folder) return;
      const parentId = cleanText(folder.parentId || '') || null;
      parentFallbackById[folderId] = parentId && !deletedSet.has(parentId) ? parentId : null;
    });

    state.folders = state.folders.filter((folder) => !deletedSet.has(folder.id));

    state.folders.forEach((folder) => {
      if (!deletedSet.has(folder.parentId)) return;
      folder.parentId = parentFallbackById[folder.parentId] || null;
    });

    Object.keys(state.pluginFolderMap).forEach((pluginKey) => {
      if (deletedSet.has(state.pluginFolderMap[pluginKey])) {
        state.pluginFolderMap[pluginKey] = 'ungrouped';
      }
    });

    ids.forEach((folderId) => {
      delete state.folderCollapsed[folderId];
    });

    if (deletedSet.has(state.selectedFolderId)) {
      state.selectedFolderId = 'all';
    }
    setSelectedFolderIds(
      state.selectedFolderIds.filter((folderId) => !deletedSet.has(folderId)),
      state.selectedFolderId
    );

    reindexSiblingOrders(state.folders);
    markLayoutDirty();
    renderAll();
  }

  async function deleteFolder(folderIdOverride) {
    const folderId = folderIdOverride || state.selectedFolderId;
    await deleteFoldersById([folderId]);
  }

  function remapPluginStateKey(oldKey, newKey) {
    if (!oldKey || !newKey || oldKey === newKey) return;

    if (Object.prototype.hasOwnProperty.call(state.pluginFolderMap, oldKey)) {
      state.pluginFolderMap[newKey] = state.pluginFolderMap[oldKey];
      delete state.pluginFolderMap[oldKey];
    }

    if (Object.prototype.hasOwnProperty.call(state.pluginTags, oldKey)) {
      state.pluginTags[newKey] = state.pluginTags[oldKey];
      delete state.pluginTags[oldKey];
    }

    if (Object.prototype.hasOwnProperty.call(state.schemaDrafts, oldKey)) {
      state.schemaDrafts[newKey] = state.schemaDrafts[oldKey];
      delete state.schemaDrafts[oldKey];
    }

    if (Object.prototype.hasOwnProperty.call(state.schemaDirtyKeys, oldKey)) {
      state.schemaDirtyKeys[newKey] = state.schemaDirtyKeys[oldKey];
      delete state.schemaDirtyKeys[oldKey];
    }

    if (Object.prototype.hasOwnProperty.call(state.structSchemaDrafts, oldKey)) {
      state.structSchemaDrafts[newKey] = state.structSchemaDrafts[oldKey];
      delete state.structSchemaDrafts[oldKey];
    }

    if (Object.prototype.hasOwnProperty.call(state.structSchemaDirtyKeys, oldKey)) {
      state.structSchemaDirtyKeys[newKey] = state.structSchemaDirtyKeys[oldKey];
      delete state.structSchemaDirtyKeys[oldKey];
    }

    if (Object.prototype.hasOwnProperty.call(state.paramSelectionByPlugin, oldKey)) {
      state.paramSelectionByPlugin[newKey] = state.paramSelectionByPlugin[oldKey];
      delete state.paramSelectionByPlugin[oldKey];
    }

    if (Object.prototype.hasOwnProperty.call(state.paramSelectionAnchorByPlugin, oldKey)) {
      state.paramSelectionAnchorByPlugin[newKey] = state.paramSelectionAnchorByPlugin[oldKey];
      delete state.paramSelectionAnchorByPlugin[oldKey];
    }

    remapPluginScopedOpenState(oldKey, newKey);

    state.openTabs = uniqueStringList(state.openTabs.map((key) => (key === oldKey ? newKey : key)));
    state.selectedPluginKeys = uniqueStringList(state.selectedPluginKeys.map((key) => (key === oldKey ? newKey : key)));

    if (state.activeTab === oldKey) {
      state.activeTab = newKey;
    }
    if (state.lastPluginSelectionKey === oldKey) {
      state.lastPluginSelectionKey = newKey;
    }
    if (state.dragPluginKey === oldKey) {
      state.dragPluginKey = newKey;
    }
    state.dragPluginKeys = uniqueStringList(state.dragPluginKeys.map((key) => (key === oldKey ? newKey : key)));
  }

  async function renamePluginByKey(pluginKey) {
    const index = getPluginIndexByKey(pluginKey);
    if (index < 0) return;

    const plugin = state.plugins[index];
    const oldName = String(plugin.name || '');
    const oldKey = makePluginKey(plugin);

    const renamed = await showTextPrompt({
      title: 'Rename Plugin Row',
      message: 'Enter new plugin name.',
      defaultValue: oldName,
      placeholder: 'Plugin name',
      confirmLabel: 'Rename',
      cancelLabel: 'Cancel'
    });
    if (renamed === null) return;

    const nextName = cleanText(renamed);
    if (!nextName) {
      showToast('Plugin name cannot be blank.', 'bad');
      return;
    }

    plugin.name = nextName;
    const nextKey = makePluginKey(plugin);

    const duplicate = state.plugins.some((entry, entryIndex) => {
      return entryIndex !== index && makePluginKey(entry) === nextKey;
    });

    if (duplicate) {
      plugin.name = oldName;
      showToast('A plugin row with same name and description already exists.', 'bad');
      return;
    }

    remapPluginStateKey(oldKey, nextKey);
    delete state.metadataCache[oldName];
    delete state.metadataPromise[oldName];

    markPluginsDirty();
    renderAll();
  }

  async function addPluginRow() {
    if (!state.project) {
      showToast('No project loaded.', 'bad');
      return;
    }

    try {
      const result = await apiPost('/api/select-plugin-file', {});
      if (!result.selected) {
        showToast('Plugin file selection canceled.', 'bad');
        return;
      }

      if (!result.detected || !result.pluginName) {
        showToast(result.message || 'Selected file is not a valid plugin in js/plugins.', 'bad');
        return;
      }

      const pluginName = cleanText(result.pluginName);
      if (!pluginName) {
        showToast('Selected plugin file has no valid name.', 'bad');
        return;
      }

      const existingIndex = state.plugins.findIndex((plugin) => {
        return cleanText(plugin.name) === pluginName;
      });

      if (existingIndex >= 0) {
        const existingKey = makePluginKey(state.plugins[existingIndex]);
        if (!state.openTabs.includes(existingKey)) {
          state.openTabs.push(existingKey);
        }
        state.activeTab = existingKey;
        setSelectedPluginKeys([existingKey], existingKey);
        renderAll();
        showToast('Plugin already in list. Focused existing row.', 'good');
        return;
      }

      const plugin = {
        name: pluginName,
        status: true,
        description: pluginName,
        parameters: {}
      };

      state.plugins.push(plugin);

      const key = makePluginKey(plugin);
      const folderId = state.selectedFolderId === 'all' ? 'ungrouped' : state.selectedFolderId;
      setPluginFolderIdByKey(key, folderId);

      if (!state.openTabs.includes(key)) {
        state.openTabs.push(key);
      }
      state.activeTab = key;
      setSelectedPluginKeys([key], key);

      markPluginsDirty();
      markLayoutDirty();
      renderAll();
      showToast(`Added plugin row for ${pluginName}.js`, 'good');
    } catch (error) {
      showToast(error.message, 'bad');
    }
  }

  async function deletePluginsByKey(pluginKeys) {
    const keys = uniqueStringList(pluginKeys).filter((key) => getPluginIndexByKey(key) >= 0);
    if (keys.length <= 0) return;

    const names = keys
      .map((key) => {
        const index = getPluginIndexByKey(key);
        return index >= 0 ? state.plugins[index].name || '(Unnamed Plugin)' : null;
      })
      .filter(Boolean);

    const ok = await showConfirmPrompt({
      title: keys.length === 1 ? 'Remove Plugin Row' : 'Remove Plugin Rows',
      message: keys.length === 1
        ? `Remove plugin '${names[0]}' from plugins.js list?`
        : `Remove ${keys.length} plugins from plugins.js list?`,
      confirmLabel: keys.length === 1 ? 'Remove Plugin' : 'Remove Plugins',
      cancelLabel: 'Cancel'
    });
    if (!ok) return;

    const keySet = new Set(keys);
    state.plugins = state.plugins.filter((plugin) => !keySet.has(makePluginKey(plugin)));

    keys.forEach((key) => {
      delete state.pluginFolderMap[key];
      delete state.pluginTags[key];
      delete state.schemaDrafts[key];
      delete state.schemaDirtyKeys[key];
      delete state.structSchemaDrafts[key];
      delete state.structSchemaDirtyKeys[key];
      delete state.paramSelectionByPlugin[key];
      delete state.paramSelectionAnchorByPlugin[key];
      clearPluginScopedOpenState(key);
    });

    state.openTabs = state.openTabs.filter((key) => !keySet.has(key));
    state.selectedPluginKeys = state.selectedPluginKeys.filter((key) => !keySet.has(key));

    if (state.activeTab && keySet.has(state.activeTab)) {
      state.activeTab = state.openTabs.length > 0 ? state.openTabs[state.openTabs.length - 1] : null;
    }

    if (state.lastPluginSelectionKey && keySet.has(state.lastPluginSelectionKey)) {
      state.lastPluginSelectionKey = state.selectedPluginKeys[0] || state.activeTab || null;
    }

    markPluginsDirty();
    markLayoutDirty();
    renderAll();
  }

  async function deletePluginByKey(pluginKey) {
    await deletePluginsByKey([pluginKey]);
  }

  async function savePluginsFile() {
    if (!state.project) {
      showToast('No project loaded.', 'bad');
      return;
    }

    try {
      await apiPost('/api/plugins/save', { plugins: state.plugins });
      state.pluginsDirty = false;
      clearDirtyLabels();
      showToast('Saved plugins.js', 'good');
    } catch (error) {
      showToast(error.message, 'bad');
    }
  }

  async function backupPluginsFile() {
    if (!state.project) {
      showToast('No project loaded.', 'bad');
      return;
    }

    try {
      const result = await apiPost('/api/plugins/backup', {});
      const name = String(result && result.backupFileName ? result.backupFileName : 'plugins.js-bak');
      showToast(`Backed up plugins.js to ${name}`, 'good');
    } catch (error) {
      showToast(error.message, 'bad');
    }
  }

  async function saveLayoutState() {
    if (!state.project) {
      showToast('No project loaded.', 'bad');
      return false;
    }

    try {
      const payload = {
        version: 2,
        folders: state.folders,
        pluginFolderMap: state.pluginFolderMap,
        pluginTags: state.pluginTags,
        folderCollapsed: state.folderCollapsed,
        managerLayout: state.managerLayout
      };

      const saved = await apiPost('/api/state/save', {
        state: payload
      });

      const normalized = normalizeIncomingState(saved);
      state.folders = normalized.folders;
      state.pluginFolderMap = normalized.pluginFolderMap;
      state.pluginTags = normalized.pluginTags;
      state.folderCollapsed = normalized.folderCollapsed;
      state.managerLayout = normalized.managerLayout;

      state.layoutDirty = false;
      clearDirtyLabels();
      showToast('Saved internal folders', 'good');
      renderAll();
      return true;
    } catch (error) {
      showToast(error.message, 'bad');
      return false;
    }
  }

  async function saveManagerLayoutState() {
    if (!state.project) {
      showToast('No project loaded.', 'bad');
      return;
    }

    try {
      const capturedLayout = captureManagerLayout();

      const payload = {
        version: 2,
        folders: state.folders,
        pluginFolderMap: state.pluginFolderMap,
        pluginTags: state.pluginTags,
        folderCollapsed: state.folderCollapsed,
        managerLayout: capturedLayout
      };

      const saved = await apiPost('/api/state/save', {
        state: payload
      });

      const normalized = normalizeIncomingState(saved);
      state.folders = normalized.folders;
      state.pluginFolderMap = normalized.pluginFolderMap;
      state.pluginTags = normalized.pluginTags;
      state.folderCollapsed = normalized.folderCollapsed;
      state.managerLayout = normalized.managerLayout || normalizeManagerLayout(capturedLayout);

      clearDirtyLabels();
      showToast('Saved manager layout', 'good');
      renderAll();
    } catch (error) {
      showToast(error.message, 'bad');
    }
  }

  function captureFoldersLayoutExportBundle() {
    if (!state.project) return null;

    return {
      sourcePlugins: state.plugins.map((plugin) => ({
        key: makePluginKey(plugin),
        name: String(plugin && plugin.name ? plugin.name : '')
      })),
      folders: cloneJson(state.folders),
      pluginFolderMap: cloneJson(state.pluginFolderMap),
      pluginTags: cloneJson(state.pluginTags),
      folderCollapsed: cloneJson(state.folderCollapsed),
      managerLayout: normalizeManagerLayout(captureManagerLayout())
    };
  }

  function buildPluginKeyRemapByName(sourcePlugins, targetPlugins) {
    const source = Array.isArray(sourcePlugins) ? sourcePlugins : [];
    const target = Array.isArray(targetPlugins) ? targetPlugins : [];

    const targetQueueByName = new Map();
    for (let i = 0; i < target.length; i += 1) {
      const plugin = target[i] && typeof target[i] === 'object' ? target[i] : {};
      const token = pluginNameToken(plugin.name);
      if (!token) continue;

      if (!targetQueueByName.has(token)) {
        targetQueueByName.set(token, []);
      }

      targetQueueByName.get(token).push(makePluginKey(plugin));
    }

    const remap = {};

    for (let i = 0; i < source.length; i += 1) {
      const row = source[i] && typeof source[i] === 'object' ? source[i] : {};
      const oldKey = cleanText(row.key);
      if (!oldKey) continue;

      const fallbackName = String(oldKey.split('::')[0] || '');
      const token = pluginNameToken(row.name || fallbackName);
      if (!token) continue;

      const queue = targetQueueByName.get(token);
      if (!queue || queue.length <= 0) continue;

      const nextKey = cleanText(queue.shift());
      if (!nextKey) continue;
      remap[oldKey] = nextKey;
    }

    return remap;
  }

  function remapTypedTreeOpenStateByPluginMap(sourceState, keyMap, validPluginKeys) {
    const source = sourceState && typeof sourceState === 'object' ? sourceState : {};
    const out = {};

    Object.keys(source).forEach((stateKey) => {
      const raw = String(stateKey || '');
      const firstSep = raw.indexOf('::');
      if (firstSep <= 0) return;

      const oldPluginKey = raw.slice(0, firstSep);
      const newPluginKey = cleanText(keyMap[oldPluginKey] || '');
      if (!newPluginKey || !validPluginKeys.has(newPluginKey)) return;

      out[`${newPluginKey}${raw.slice(firstSep)}`] = Boolean(source[stateKey]);
    });

    return out;
  }

  function remapDevEntryOpenStateByPluginMap(sourceState, keyMap, validPluginKeys) {
    const source = sourceState && typeof sourceState === 'object' ? sourceState : {};
    const out = {};

    Object.keys(source).forEach((stateKey) => {
      const raw = String(stateKey || '');
      const parts = raw.split('::');
      if (parts.length < 3) return;

      const oldPluginKey = cleanText(parts[1]);
      const newPluginKey = cleanText(keyMap[oldPluginKey] || '');
      if (!newPluginKey || !validPluginKeys.has(newPluginKey)) return;

      parts[1] = newPluginKey;
      out[parts.join('::')] = Boolean(source[stateKey]);
    });

    return out;
  }

  function remapManagerLayoutForProject(layout, keyMap, validPluginKeys) {
    const normalized = normalizeManagerLayout(layout);
    if (!normalized) return null;

    const remapPluginKey = (pluginKey) => cleanText(keyMap[cleanText(pluginKey)] || '');

    const openTabs = uniqueStringList(normalized.openTabs)
      .map((pluginKey) => remapPluginKey(pluginKey))
      .filter((pluginKey) => validPluginKeys.has(pluginKey));

    let activeTab = remapPluginKey(normalized.activeTab);
    if (!activeTab || !validPluginKeys.has(activeTab)) {
      activeTab = openTabs[0] || '';
    }

    return normalizeManagerLayout({
      ...normalized,
      openTabs,
      activeTab,
      typedTreeOpenState: remapTypedTreeOpenStateByPluginMap(
        normalized.typedTreeOpenState,
        keyMap,
        validPluginKeys
      ),
      devEntryOpenState: remapDevEntryOpenStateByPluginMap(
        normalized.devEntryOpenState,
        keyMap,
        validPluginKeys
      )
    });
  }

  function applyExportedFoldersAndLayoutToCurrentProject(bundle) {
    const source = bundle && typeof bundle === 'object' ? bundle : {};
    const sourcePlugins = Array.isArray(source.sourcePlugins) ? source.sourcePlugins : [];
    const keyRemap = buildPluginKeyRemapByName(sourcePlugins, state.plugins);

    const sourcePluginKeys = new Set(
      sourcePlugins
        .map((row) => cleanText(row && row.key))
        .filter(Boolean)
    );

    const folders = ensureFolders(source.folders);
    const folderIds = new Set(folders.map((folder) => folder.id));

    const pluginFolderMap = {};
    const sourceFolderMap = source.pluginFolderMap && typeof source.pluginFolderMap === 'object'
      ? source.pluginFolderMap
      : {};

    Object.keys(sourceFolderMap).forEach((oldKey) => {
      const newKey = cleanText(keyRemap[oldKey] || '');
      if (!newKey) return;

      const folderId = cleanText(sourceFolderMap[oldKey]) || 'ungrouped';
      pluginFolderMap[newKey] = folderIds.has(folderId) ? folderId : 'ungrouped';
    });

    const pluginTags = {};
    const sourceTags = source.pluginTags && typeof source.pluginTags === 'object'
      ? source.pluginTags
      : {};

    Object.keys(sourceTags).forEach((oldKey) => {
      const newKey = cleanText(keyRemap[oldKey] || '');
      if (!newKey) return;

      const tags = toUniqueTags(sourceTags[oldKey]);
      if (tags.length > 0) {
        pluginTags[newKey] = tags;
      }
    });

    state.plugins.forEach((plugin) => {
      const key = makePluginKey(plugin);
      if (!pluginFolderMap[key]) {
        pluginFolderMap[key] = 'ungrouped';
      }
    });

    const folderCollapsed = {};
    const sourceCollapsed = source.folderCollapsed && typeof source.folderCollapsed === 'object'
      ? source.folderCollapsed
      : {};

    Object.keys(sourceCollapsed).forEach((folderId) => {
      if (!folderIds.has(folderId)) return;
      folderCollapsed[folderId] = Boolean(sourceCollapsed[folderId]);
    });

    state.folders = folders;
    state.pluginFolderMap = pluginFolderMap;
    state.pluginTags = pluginTags;
    state.folderCollapsed = folderCollapsed;

    const validPluginKeys = new Set(state.plugins.map((plugin) => makePluginKey(plugin)));
    const remappedLayout = remapManagerLayoutForProject(source.managerLayout, keyRemap, validPluginKeys);

    if (remappedLayout) {
      remappedLayout.lastOpenedGameRoot = getCurrentProjectRoot();
      applyManagerLayout(remappedLayout, validPluginKeys);
      state.managerLayout = remappedLayout;
    } else {
      state.managerLayout = normalizeManagerLayout(captureManagerLayout());
    }

    const validFolderIds = new Set(['all'].concat(state.folders.map((folder) => folder.id)));
    state.selectedFolderIds = state.selectedFolderIds.filter((folderId) => validFolderIds.has(folderId));
    if (state.selectedFolderIds.length <= 0) {
      state.selectedFolderIds = ['all'];
    }
    if (!validFolderIds.has(state.selectedFolderId)) {
      state.selectedFolderId = state.selectedFolderIds[0] || 'all';
    }
    if (!state.selectedFolderIds.includes(state.selectedFolderId)) {
      state.selectedFolderIds.push(state.selectedFolderId);
    }
    if (state.lastFolderSelectionId && !validFolderIds.has(state.lastFolderSelectionId)) {
      state.lastFolderSelectionId = state.selectedFolderId;
    }

    markLayoutDirty();
    requestManagerLayoutDirtyLabelRefresh();

    return {
      mappedPlugins: Object.keys(keyRemap).length,
      missingPlugins: Math.max(0, sourcePluginKeys.size - Object.keys(keyRemap).length)
    };
  }

  async function resetInternalFoldersForCurrentProject() {
    if (!state.project) {
      showToast('No project loaded.', 'bad');
      return;
    }

    state.folders = [cloneJson(DEFAULT_FOLDER)];
    state.pluginFolderMap = {};
    state.pluginTags = {};
    state.folderCollapsed = {};

    state.plugins.forEach((plugin) => {
      state.pluginFolderMap[makePluginKey(plugin)] = 'ungrouped';
    });

    state.selectedFolderId = 'all';
    state.selectedFolderIds = ['all'];
    state.lastFolderSelectionId = 'all';
    state.folderSearch = '';
    dom.inputFolderSearch.value = '';

    markLayoutDirty();
    renderAll();
    showToast('Current internal folders reset. Save Internal Folders to persist.', 'good');
  }

  async function exportSettingsToProgramFolder() {
    if (!state.project) {
      showToast('No project loaded.', 'bad');
      return;
    }

    const exportBundle = captureFoldersLayoutExportBundle();
    if (!exportBundle) {
      showToast('Nothing to export yet.', 'bad');
      return;
    }

    try {
      const result = await apiPost('/api/settings/export', {
        settings: exportBundle
      });
      const filePath = String(result && result.settingsPath ? result.settingsPath : 'Settings.json');
      showToast(`Settings exported to ${filePath}`, 'good');
    } catch (error) {
      showToast(error.message, 'bad');
    }
  }

  async function importSettingsFromProgramFolder() {
    if (!state.project) {
      showToast('No project loaded.', 'bad');
      return;
    }

    try {
      const result = await apiPost('/api/settings/import', {});
      const settings = result && typeof result.settings === 'object' ? result.settings : null;
      if (!settings) {
        showToast('Settings file is empty or invalid.', 'bad');
        return;
      }

      const summary = applyExportedFoldersAndLayoutToCurrentProject(settings);
      const saved = await saveLayoutState();
      if (!saved) return;

      // Mirror snapshot-load runtime layout apply path for full layout restore.
      syncSearchInputsFromState();
      applyUiZoom();
      if (state.managerLayout) {
        scheduleManagerLayoutScrollRestore(state.managerLayout);
      }

      if (summary.missingPlugins > 0) {
        showToast(`Settings imported. ${summary.missingPlugins} missing plugin(s) skipped.`, 'good');
      } else {
        showToast('Settings imported from Settings.json', 'good');
      }
    } catch (error) {
      showToast(error.message, 'bad');
    }
  }

  function clearRuntimeManagerLayoutState(options) {
    const config = options && typeof options === 'object' ? options : {};
    if (!config.preserveSavedLayout) {
      state.managerLayout = null;
    }
    state.openTabs = [];
    state.activeTab = null;
    state.selectedPluginKeys = [];
    state.lastPluginSelectionKey = null;
    state.folderSearch = '';
    state.searchText = '';
    state.tabSearch = '';
    state.paramSearch = '';
    state.schemaSearch = '';
    state.structSchemaSearch = '';
    resetManagerViewRuntimeState();
    syncSearchInputsFromState();
  }

  async function resetManagerLayoutAndReload() {
    if (!state.project) {
      showToast('No project loaded.', 'bad');
      return;
    }

    clearRuntimeManagerLayoutState({ preserveSavedLayout: true });
    renderAll();
    showToast('Current layout reset. Saved layout unchanged.', 'good');
  }

  async function saveActiveSchema() {
    const index = getActivePluginIndex();
    if (index < 0) {
      showToast('No active plugin tab.', 'bad');
      return;
    }

    const plugin = state.plugins[index];
    const pluginKey = makePluginKey(plugin);
    const draft = state.schemaDrafts[pluginKey];

    if (!draft) {
      showToast('No schema draft loaded.', 'bad');
      return;
    }

    try {
      const result = await apiPost('/api/plugin-schema/save', {
        pluginName: plugin.name,
        schema: draft
      });

      state.metadataCache[plugin.name] = {
        found: true,
        pluginFilePath: result.pluginFilePath || '',
        metadata: result.metadata || [],
        schema: result.schema || [],
        helpText: String(result.helpText || ''),
        structMetadata: result.structMetadata && typeof result.structMetadata === 'object'
          ? result.structMetadata
          : {},
        structSchema: result.structSchema && typeof result.structSchema === 'object'
          ? result.structSchema
          : {}
      };
      state.schemaDrafts[pluginKey] = cloneJson(result.schema || []);
      clearSchemaDirty(pluginKey);

      showToast(`Saved schema in ${plugin.name}.js`, 'good');
      renderAll();
    } catch (error) {
      showToast(error.message, 'bad');
    }
  }

  async function saveActiveStructSchema() {
    const index = getActivePluginIndex();
    if (index < 0) {
      showToast('No active plugin tab.', 'bad');
      return;
    }

    const plugin = state.plugins[index];
    const pluginKey = makePluginKey(plugin);
    const draftBlocks = state.structSchemaDrafts[pluginKey];

    if (!draftBlocks) {
      showToast('No struct schema draft loaded.', 'bad');
      return;
    }

    const structSchema = schemaDraftBuildStructMap(draftBlocks);

    try {
      const result = await apiPost('/api/plugin-struct-schema/save', {
        pluginName: plugin.name,
        structSchema
      });

      state.metadataCache[plugin.name] = {
        found: true,
        pluginFilePath: result.pluginFilePath || '',
        metadata: result.metadata || [],
        schema: result.schema || [],
        helpText: String(result.helpText || ''),
        structMetadata: result.structMetadata && typeof result.structMetadata === 'object'
          ? result.structMetadata
          : {},
        structSchema: result.structSchema && typeof result.structSchema === 'object'
          ? result.structSchema
          : {}
      };

      delete state.structSchemaDrafts[pluginKey];
      ensureStructSchemaDraftForPlugin(pluginKey, state.metadataCache[plugin.name]);
      clearStructSchemaDirty(pluginKey);

      showToast(`Saved struct schema in ${plugin.name}.js`, 'good');
      renderAll();
    } catch (error) {
      showToast(error.message, 'bad');
    }
  }

  function normalizeWheelDeltaY(event, referenceHeight) {
    if (!event) return 0;
    if (event.deltaMode === 1) return event.deltaY * 16;
    if (event.deltaMode === 2) {
      const fallback = Math.max(120, Number(referenceHeight) || 0);
      return event.deltaY * fallback;
    }
    return event.deltaY;
  }

  function asElement(node) {
    if (!node || typeof node !== 'object') return null;
    if (node.nodeType === 1) return node;
    if (node.nodeType === 3 && node.parentElement) return node.parentElement;
    return null;
  }

  function collectWheelCandidateElements(event) {
    const out = [];
    const seen = new Set();

    function add(node) {
      const element = asElement(node);
      if (!element || seen.has(element)) return;
      seen.add(element);
      out.push(element);
    }

    add(event && event.target);

    if (event && typeof event.composedPath === 'function') {
      const path = event.composedPath();
      for (let i = 0; i < path.length; i += 1) {
        add(path[i]);
      }
    }

    if (event && Number.isFinite(event.clientX) && Number.isFinite(event.clientY)) {
      add(document.elementFromPoint(event.clientX, event.clientY));
    }

    return out;
  }

  function getWheelScrollZone(event) {
    const candidates = collectWheelCandidateElements(event);

    for (let i = 0; i < candidates.length; i += 1) {
      const candidate = candidates[i];
      for (let j = 0; j < WHEEL_SCROLL_ZONE_SELECTORS.length; j += 1) {
        const zone = candidate.closest(WHEEL_SCROLL_ZONE_SELECTORS[j]);
        if (zone) return zone;
      }
    }

    return null;
  }

  function getWheelScrollTarget(event, zone, deltaY) {
    const candidates = collectWheelCandidateElements(event);
    const direction = deltaY >= 0 ? 1 : -1;

    for (let i = 0; i < candidates.length; i += 1) {
      let current = candidates[i];
      if (!(current === zone || zone.contains(current))) continue;

      while (current && current instanceof Element) {
        if (!(current === zone || zone.contains(current))) break;

        const maxScrollTop = Math.max(0, current.scrollHeight - current.clientHeight);
        if (maxScrollTop > 0) {
          const canMove = direction > 0
            ? current.scrollTop < maxScrollTop - 0.5
            : current.scrollTop > 0.5;

          if (canMove) {
            return current;
          }
        }

        if (current === zone) break;
        current = current.parentElement;
      }
    }

    return zone;
  }

  function setupColumnWheelScroll() {
    if (state.wheelScrollBound) return;
    state.wheelScrollBound = true;
    // Use native overflow scrolling per column; custom wheel routing caused state-dependent conflicts.
  }

  function bindEvents() {
    setupColumnWheelScroll();
    bindStaticEditorDetailsStates();

    if (!state.numberWheelCaptureBound) {
      state.numberWheelCaptureBound = true;
      document.addEventListener('wheel', (event) => {
        if (event.defaultPrevented) return;
        const active = document.activeElement;
        if (!(active instanceof HTMLInputElement)) return;
        if (active.type !== 'number') return;
        if (active.dataset.numberWheel !== '1') return;
        applyNumberWheelStep(active, event, false);
      }, { passive: false, capture: true });
    }

    dom.inputFolderSearch.addEventListener('input', () => {
      state.folderSearch = dom.inputFolderSearch.value || '';
      renderFolderTree();
      updateTagSuggestForInput(dom.inputFolderSearch);
      requestManagerLayoutDirtyLabelRefresh();
    });

    dom.inputSearch.addEventListener('input', () => {
      state.searchText = dom.inputSearch.value || '';
      renderPluginList();
      updateTagSuggestForInput(dom.inputSearch);
      requestManagerLayoutDirtyLabelRefresh();
    });

    dom.inputFolderSearch.addEventListener('keydown', handleTagSuggestKeyDown);
    dom.inputSearch.addEventListener('keydown', handleTagSuggestKeyDown);

    dom.inputFolderSearch.addEventListener('click', () => updateTagSuggestForInput(dom.inputFolderSearch));
    dom.inputSearch.addEventListener('click', () => updateTagSuggestForInput(dom.inputSearch));
    dom.inputFolderSearch.addEventListener('focus', () => updateTagSuggestForInput(dom.inputFolderSearch));
    dom.inputSearch.addEventListener('focus', () => updateTagSuggestForInput(dom.inputSearch));

    dom.inputTabSearch.addEventListener('input', () => {
      state.tabSearch = dom.inputTabSearch.value || '';
      renderTabs();
      requestManagerLayoutDirtyLabelRefresh();
    });

    dom.inputParamSearch.addEventListener('input', () => {
      state.paramSearch = dom.inputParamSearch.value || '';
      renderActivePluginPanel();
      requestManagerLayoutDirtyLabelRefresh();
    });

    dom.inputSchemaSearch.addEventListener('input', () => {
      state.schemaSearch = dom.inputSchemaSearch.value || '';
      renderActivePluginPanel();
      requestManagerLayoutDirtyLabelRefresh();
    });

    dom.inputStructSchemaSearch.addEventListener('input', () => {
      state.structSchemaSearch = dom.inputStructSchemaSearch.value || '';
      renderActivePluginPanel();
      requestManagerLayoutDirtyLabelRefresh();
    });

    dom.activePluginStatus.addEventListener('change', () => {
      const index = getActivePluginIndex();
      if (index < 0) return;

      state.plugins[index].status = dom.activePluginStatus.checked;
      markPluginsDirty();
      renderPluginList();
    });

    dom.btnActivePluginHelp.addEventListener('click', () => {
      openActivePluginHelp().catch((error) => {
        showToast(error && error.message ? error.message : 'Failed opening plugin help.', 'bad');
      });
    });

    dom.activePluginFolder.addEventListener('change', () => {
      const index = getActivePluginIndex();
      if (index < 0) return;

      const plugin = state.plugins[index];
      const key = makePluginKey(plugin);
      setPluginFolderIdByKey(key, dom.activePluginFolder.value);

      markLayoutDirty();
      renderAll();
    });

    function commitActiveTags() {
      const index = getActivePluginIndex();
      if (index < 0) return;

      const plugin = state.plugins[index];
      const key = makePluginKey(plugin);
      setPluginTagsByKey(key, dom.activePluginTags.value);
      markLayoutDirty();
      renderPluginList();
    }

    dom.activePluginTags.addEventListener('change', commitActiveTags);
    dom.activePluginTags.addEventListener('blur', commitActiveTags);
    dom.activePluginTags.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      commitActiveTags();
    });

    dom.btnTabsLeft.addEventListener('click', () => {
      switchActiveTabByOffset(-1);
    });

    dom.btnTabsRight.addEventListener('click', () => {
      switchActiveTabByOffset(1);
    });

    dom.tabsBar.addEventListener('wheel', (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      dom.tabsBar.scrollLeft += event.deltaY;
    }, { passive: false });

    dom.btnMoveUp.addEventListener('click', () => reorderActivePlugin(-1));
    dom.btnMoveDown.addEventListener('click', () => reorderActivePlugin(1));

    dom.btnAddFolder.addEventListener('click', () => addFolder());
    dom.btnRenameFolder.addEventListener('click', () => {
      const ids = uniqueStringList(state.selectedFolderIds)
        .filter((folderId) => folderId !== 'all' && folderId !== 'ungrouped');
      if (ids.length !== 1) {
        showToast('Select exactly one non-default folder to rename.', 'bad');
        return;
      }
      renameFolder(ids[0]);
    });
    dom.btnDeleteFolder.addEventListener('click', () => {
      const ids = uniqueStringList(state.selectedFolderIds)
        .filter((folderId) => folderId !== 'all' && folderId !== 'ungrouped');
      if (ids.length <= 0) {
        showToast('Select folder(s) first.', 'bad');
        return;
      }
      deleteFoldersById(ids);
    });

    dom.btnAddPlugin.addEventListener('click', addPluginRow);
    dom.btnRenamePlugin.addEventListener('click', () => {
      const keys = state.selectedPluginKeys.length > 0
        ? state.selectedPluginKeys.slice()
        : (state.activeTab ? [state.activeTab] : []);

      if (keys.length !== 1) {
        showToast('Select exactly one plugin row to rename.', 'bad');
        return;
      }

      renamePluginByKey(keys[0]);
    });
    dom.btnDeletePlugin.addEventListener('click', () => {
      const keys = state.selectedPluginKeys.length > 0
        ? state.selectedPluginKeys.slice()
        : (state.activeTab ? [state.activeTab] : []);

      if (keys.length <= 0) {
        showToast('Select plugin row(s) first.', 'bad');
        return;
      }

      deletePluginsByKey(keys);
    });

    dom.btnSavePlugins.addEventListener('click', savePluginsFile);
    dom.btnBackupPlugins.addEventListener('click', backupPluginsFile);
    dom.btnSaveState.addEventListener('click', saveLayoutState);
    dom.btnSaveManagerLayout.addEventListener('click', saveManagerLayoutState);
    dom.btnResetLayout.addEventListener('click', resetManagerLayoutAndReload);
    dom.btnResetFolders.addEventListener('click', resetInternalFoldersForCurrentProject);

    dom.btnAddSchemaParam.addEventListener('click', () => {
      const index = getActivePluginIndex();
      if (index < 0) return;

      const plugin = state.plugins[index];
      const pluginKey = makePluginKey(plugin);
      const draft = schemaDraftEnsureList(state.schemaDrafts[pluginKey] || []);

      const nextName = schemaDraftBuildUniqueParamName(draft, 'NewParam');
      draft.push(schemaDraftCreateEntry(nextName));

      state.schemaDrafts[pluginKey] = draft;
      markSchemaDirty(pluginKey);

      const cached = state.metadataCache[plugin.name] || { found: true, metadata: [], schema: [] };
      renderSchemaEditor(index, cached);
    });

    dom.btnAddStructSchema.addEventListener('click', () => {
      const index = getActivePluginIndex();
      if (index < 0) return;

      const plugin = state.plugins[index];
      const pluginKey = makePluginKey(plugin);
      const blocks = structDraftEnsureBlockList(state.structSchemaDrafts[pluginKey] || []);

      const nextName = structDraftBuildUniqueBlockName(blocks, 'Struct');
      blocks.push(structDraftCreateBlock(nextName));

      state.structSchemaDrafts[pluginKey] = blocks;
      markStructSchemaDirty(pluginKey);

      const cached = state.metadataCache[plugin.name] || {
        found: true,
        metadata: [],
        schema: [],
        helpText: '',
        structMetadata: {},
        structSchema: {}
      };
      renderStructSchemaEditor(index, cached);
    });

    dom.btnSaveSchema.addEventListener('click', saveActiveSchema);
    dom.btnSaveStructSchema.addEventListener('click', saveActiveStructSchema);

    dom.btnDetect.addEventListener('click', async () => {
      try {
        const snapshot = await apiGet('/api/detect');
        if (snapshot.detected) {
          applySnapshot(snapshot);
          showToast('Project auto-detected.', 'good');
        } else {
          showToast('No project auto-detected. Use Select Folder.', 'bad');
        }
      } catch (error) {
        showToast(error.message, 'bad');
      }
    });

    dom.btnSelectFolder.addEventListener('click', async () => {
      try {
        const result = await apiPost('/api/select-game-folder', {});
        if (!result.selected) {
          showToast('Folder selection canceled.', 'bad');
          return;
        }

        if (!result.detected) {
          showToast(result.message || 'Folder selected, but project not detected.', 'bad');
          return;
        }

        applySnapshot(result);
        showToast('Project loaded from selected folder.', 'good');
      } catch (error) {
        showToast(error.message, 'bad');
      }
    });

    if (dom.btnExportSettings) {
      dom.btnExportSettings.addEventListener('click', async () => {
        await exportSettingsToProgramFolder();
      });

      bindSettingsButtonTooltip(
        dom.btnExportSettings,
        'Export current Internal Folders + Manager Layout settings (including scrollbars and expanded/collapsed states) to Settings.json in this program folder.'
      );
    }

    if (dom.btnImportSettings) {
      dom.btnImportSettings.addEventListener('click', async () => {
        await importSettingsFromProgramFolder();
      });

      bindSettingsButtonTooltip(
        dom.btnImportSettings,
        'Import Internal Folders + Manager Layout settings (including scrollbars and expanded/collapsed states) from Settings.json in this program folder.'
      );
    }

    dom.btnReload.addEventListener('click', async () => {
      try {
        const snapshot = await apiGet('/api/reload');
        applySnapshot(snapshot);
        showToast('Project data reloaded from disk.', 'good');
      } catch (error) {
        showToast(error.message, 'bad');
      }
    });

    dom.tabsBar.addEventListener('dragover', (event) => {
      event.preventDefault();
      autoScrollHorizontalOnDrag(event, dom.tabsBar);
    });

    dom.tabsBar.addEventListener('drop', (event) => {
      event.preventDefault();
      if (event.target && event.target.closest && event.target.closest('.tab-btn')) {
        return;
      }

      if (!state.dragPluginKeys || state.dragPluginKeys.length <= 0) return;

      if (state.dragSource === 'tabs') {
        mergeTabsAt(state.dragPluginKeys, state.openTabs.length);
      } else {
        dropPluginKeysToTabs(state.dragPluginKeys, null);
      }
      renderAll();
    });

    dom.pluginList.addEventListener('dragover', (event) => {
      event.preventDefault();
      autoScrollVerticalOnDrag(event, dom.pluginList);
    });

    dom.pluginList.addEventListener('drop', (event) => {
      event.preventDefault();
      if (event.target && event.target.closest && event.target.closest('.plugin-item')) {
        return;
      }

      if (!state.dragPluginKeys || state.dragPluginKeys.length <= 0) return;

      const moved = movePluginKeysBefore(state.dragPluginKeys, null);
      if (!moved) return;

      markPluginsDirty();
      renderAll();
    });

    dom.folderTree.addEventListener('dragover', (event) => {
      event.preventDefault();
      autoScrollVerticalOnDrag(event, dom.folderTree);
    });

    dom.folderTree.addEventListener('drop', (event) => {
      event.preventDefault();
      if (event.target && event.target.closest && event.target.closest('.folder-item')) {
        return;
      }

      if (state.dragPluginKeys && state.dragPluginKeys.length > 0) {
        const changed = assignPluginKeysToFolder(state.dragPluginKeys, 'ungrouped');
        if (changed > 0) {
          markLayoutDirty();
          renderAll();
        }
        return;
      }

      if (state.dragFolderIds && state.dragFolderIds.length > 0) {
        const moved = moveFolderKeysToParent(state.dragFolderIds, null);
        if (moved > 0) {
          markLayoutDirty();
          renderAll();
        }
      }
    });

    document.addEventListener('click', () => {
      hideContextMenu();
      removeSettingsButtonTooltip();
    });

    document.addEventListener('mousedown', (event) => {
      if (dom.tagSuggestMenu.classList.contains('hidden')) return;

      const target = event.target;
      if (!target) {
        hideTagSuggest();
        return;
      }

      if (dom.tagSuggestMenu.contains(target)) return;
      if (target === dom.inputFolderSearch || target === dom.inputSearch) return;

      hideTagSuggest();
    });

    document.addEventListener('keydown', (event) => {
      if (event.code) {
        hotkeyHeldCodes.add(event.code);
      }

      if (event.key === 'Escape') {
        hideContextMenu();
        hideTagSuggest();
        return;
      }

      const keyRaw = String(event.key || '');
      const hotkey = keyRaw.toLowerCase();

      if (keyRaw === 'F5' || event.code === 'F5') {
        event.preventDefault();
        dom.btnReload.click();
        return;
      }

      if (keyRaw === 'F6' || event.code === 'F6') {
        event.preventDefault();
        dom.btnResetLayout.click();
        return;
      }

      if ((event.ctrlKey || event.metaKey)
        && !event.altKey
        && !event.shiftKey
        && (hotkey === 'a' || event.code === 'KeyA')
        && hotkeyHeldCodes.has('KeyS')) {
        event.preventDefault();
        if (savePluginsHotkeyTimer) {
          clearTimeout(savePluginsHotkeyTimer);
          savePluginsHotkeyTimer = null;
        }
        Promise.resolve()
          .then(() => saveActiveSchema())
          .then(() => saveActiveStructSchema());
        return;
      }

      if ((event.ctrlKey || event.metaKey)
        && (hotkey === 'b' || event.code === 'KeyB')
        && !event.altKey
        && !event.shiftKey) {
        event.preventDefault();
        dom.btnBackupPlugins.click();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && (hotkey === 's' || event.code === 'KeyS')) {
        event.preventDefault();

        if (event.altKey) {
          if (savePluginsHotkeyTimer) {
            clearTimeout(savePluginsHotkeyTimer);
            savePluginsHotkeyTimer = null;
          }
          dom.btnSaveState.click();
          return;
        }

        if (event.shiftKey) {
          if (savePluginsHotkeyTimer) {
            clearTimeout(savePluginsHotkeyTimer);
            savePluginsHotkeyTimer = null;
          }
          dom.btnSaveManagerLayout.click();
          return;
        }

        if (hotkeyHeldCodes.has('KeyA')) {
          if (savePluginsHotkeyTimer) {
            clearTimeout(savePluginsHotkeyTimer);
            savePluginsHotkeyTimer = null;
          }
          Promise.resolve()
            .then(() => saveActiveSchema())
            .then(() => saveActiveStructSchema());
          return;
        }

        if (savePluginsHotkeyTimer) {
          clearTimeout(savePluginsHotkeyTimer);
        }
        savePluginsHotkeyTimer = setTimeout(() => {
          savePluginsHotkeyTimer = null;
          dom.btnSavePlugins.click();
        }, 180);
        return;
      }

      if ((event.ctrlKey || event.metaKey)
        && !event.altKey
        && !event.shiftKey
        && (hotkey === 'q' || event.code === 'KeyQ')) {
        event.preventDefault();

        const handled = triggerAddEntryFromCurrentSelection(event.target);
        if (!handled) {
          showToast('No add target in current selection.', 'bad');
        }
        return;
      }

      if (!(event.ctrlKey || event.metaKey) || event.altKey) return;

      const isZoomIn = keyRaw === '+' || keyRaw === '=' || event.code === 'NumpadAdd';
      const isZoomOut = keyRaw === '-' || keyRaw === '_' || event.code === 'NumpadSubtract';

      if (isZoomIn) {
        event.preventDefault();
        adjustUiZoomBy(10);
        return;
      }

      if (isZoomOut) {
        event.preventDefault();
        adjustUiZoomBy(-10);
        return;
      }

      if (hotkey === '0' || event.code === 'Digit0' || event.code === 'Numpad0') {
        event.preventDefault();
        setUiZoomPercent(100, false);
        return;
      }

      const expandCollapseHotkey = hotkey === 'e' || event.code === 'KeyE'
        ? 'e'
        : (hotkey === 'w' || event.code === 'KeyW' ? 'w' : '');

      if (!event.shiftKey
        && expandCollapseHotkey
        && handleExpandCollapseHotkey(event.target, expandCollapseHotkey)) {
        event.preventDefault();
        return;
      }

      if (!event.shiftKey && handleDevSelectionHotkey(event.target, hotkey)) {
        event.preventDefault();
        return;
      }

      if (!event.shiftKey && handleListSelectionHotkey(event.target, hotkey)) {
        event.preventDefault();
        return;
      }

      if (!event.shiftKey && (hotkey === 'd' || event.code === 'KeyD')) {
        if (handleMultiSelectionDeleteHotkey(event.target)) {
          event.preventDefault();
          return;
        }
      }

      if (isPluginSelectionEditableTarget(event.target)) return;

      if (hotkey === 'a') {
        event.preventDefault();
        const scope = resolveSelectionScopeFromTarget(event.target);
        if (scope === 'folders') {
          selectAllVisibleFolders();
        } else {
          selectAllVisiblePlugins();
        }
        return;
      }

      if (hotkey === 'z' && event.shiftKey) {
        event.preventDefault();
        redoHistory();
        return;
      }

      if (hotkey === 'z') {
        event.preventDefault();
        undoHistory();
        return;
      }

      if (hotkey === 'y') {
        event.preventDefault();
        redoHistory();
        return;
      }

      if (hotkey === 'c') {
        const keys = getSelectedOrActivePluginKeys();
        if (keys.length <= 0) return;
        event.preventDefault();
        copyPluginEntries(keys);
        return;
      }

      if (hotkey === 'x') {
        const keys = getSelectedOrActivePluginKeys();
        if (keys.length <= 0) return;
        event.preventDefault();
        cutPluginEntries(keys);
        return;
      }

      if (hotkey === 'v') {
        if (!hasPluginClipboardData()) return;
        event.preventDefault();
        pastePluginEntries();
      }
    });

    document.addEventListener('keyup', (event) => {
      if (!event.code) return;
      hotkeyHeldCodes.delete(event.code);
    });

    const managerScrollTargets = [
      dom.workspaceLayout,
      dom.folderTree,
      dom.pluginList,
      dom.editorContent,
      dom.tabsBar
    ];

    const onManagerLayoutScroll = () => {
      requestManagerLayoutDirtyLabelRefresh();
    };

    window.addEventListener('scroll', onManagerLayoutScroll, { passive: true });
    for (let i = 0; i < managerScrollTargets.length; i += 1) {
      const target = managerScrollTargets[i];
      if (!target) continue;
      target.addEventListener('scroll', onManagerLayoutScroll, { passive: true });
    }

    window.addEventListener('blur', () => {
      hideContextMenu();
      hideTagSuggest();
      removeSettingsButtonTooltip();
      hotkeyHeldCodes.clear();
      if (savePluginsHotkeyTimer) {
        clearTimeout(savePluginsHotkeyTimer);
        savePluginsHotkeyTimer = null;
      }
    });

    window.addEventListener('resize', () => {
      hideTagSuggest();
      removeSettingsButtonTooltip();
    });
  }

  async function bootstrap() {
    try {
      const snapshot = await apiGet('/api/bootstrap');
      applySnapshot(snapshot);

      if (snapshot.project) {
        showToast(`Loaded ${snapshot.project.engine} project.`, 'good');
      } else {
        showToast('No project detected yet. Use Auto Detect or Select Folder.', 'bad');
      }
    } catch (error) {
      showToast(error.message, 'bad');
    }
  }

  bindEvents();
  bootstrap();
})();

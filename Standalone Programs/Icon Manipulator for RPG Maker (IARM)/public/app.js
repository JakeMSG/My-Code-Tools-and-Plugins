'use strict';

const APP = window.iarm;
const COLUMNS = ICONFX.COLUMNS;

const state = {
  view: 'format',
  format: 0,
  utility: '',
  tray: [],
  make: {
    sources: [],
    groupMode: true,
    selected: new Set(),
    outSelected: new Set(),
    seededOut: false,
    groupSettings: ICONFX.defaultSettings()
  },
  extract: {
    kind: 0,
    sheet: null,
    selected: new Set(),
    outSelected: new Set(),
    knownPool: new Set(),
    seededOut: false,
    lastId: 0,
    hoverId: -1,
    drag: null
  },
  add: {
    sheet: null,
    assignments: {},
    heldId: null,
    hoverId: -1
  }
};

const els = {};

function uid() {
  return 'id' + Math.random().toString(36).slice(2, 10);
}

function $(id) {
  return document.getElementById(id);
}

function iconSize() {
  return state.format || ICONFX.MV;
}

function formatLabel(size) {
  return size === ICONFX.ACE ? 'VX Ace (24×24)' : 'MV/MZ (32×32)';
}

function toUint8(bytes) {
  if (bytes instanceof Uint8Array) return bytes;
  if (bytes && bytes.buffer instanceof ArrayBuffer) {
    return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }
  if (bytes && Array.isArray(bytes.data)) return Uint8Array.from(bytes.data);
  return new Uint8Array(bytes || []);
}

function bytesToUrl(bytes) {
  const copy = toUint8(bytes);
  const buffer = copy.buffer.slice(copy.byteOffset, copy.byteOffset + copy.byteLength);
  return URL.createObjectURL(new Blob([buffer], { type: 'image/png' }));
}

function loadHtmlImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not decode PNG.'));
    img.src = url;
  });
}

function canvasFromImage(img) {
  const canvas = ICONFX.makeCanvas(img.naturalWidth || img.width, img.naturalHeight || img.height);
  canvas.getContext('2d').drawImage(img, 0, 0);
  return canvas;
}

function setLoading(on) {
  $('loading').classList.toggle('hidden', !on);
}

function toast(message, type) {
  const node = document.createElement('div');
  node.className = 'toast ' + (type || 'ok');
  node.textContent = message;
  $('toasts').appendChild(node);
  setTimeout(() => node.remove(), 4500);
}

async function askConfirm(options) {
  const data = options || {};
  const overlay = $('appModal');
  if (!overlay) {
    return window.confirm(data.message + (data.detail ? '\n\n' + data.detail : '')) ? 1 : 0;
  }
  return new Promise((resolve) => {
    const title = $('appModalTitle');
    const kicker = $('appModalKicker');
    const message = $('appModalMessage');
    const detail = $('appModalDetail');
    const actions = $('appModalButtons');
    const type = data.type || 'question';
    const buttons = Array.isArray(data.buttons) && data.buttons.length ? data.buttons : ['Cancel', 'OK'];
    const defaultId = Number.isInteger(data.defaultId) ? data.defaultId : Math.max(0, buttons.length - 1);
    const cancelId = Number.isInteger(data.cancelId) ? data.cancelId : 0;
    const kickers = { warning: 'Warning', error: 'Error', question: 'Confirm' };

    overlay.classList.remove('hidden', 'is-warning', 'is-error', 'is-question');
    overlay.classList.add(type === 'error' ? 'is-error' : type === 'warning' ? 'is-warning' : 'is-question');
    kicker.textContent = kickers[type] || 'Notice';
    title.textContent = data.title || 'Icon Manipulator for RPG Maker';
    message.textContent = data.message || '';
    if (data.detail) {
      detail.textContent = data.detail;
      detail.classList.remove('hidden');
    } else {
      detail.textContent = '';
      detail.classList.add('hidden');
    }
    actions.replaceChildren();

    const finish = (index) => {
      overlay.classList.add('hidden');
      overlay.removeEventListener('click', onOverlay);
      document.removeEventListener('keydown', onKey);
      resolve(index);
    };
    const onOverlay = (event) => {
      if (event.target === overlay) finish(cancelId);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        finish(cancelId);
      } else if (event.key === 'Enter' && event.target.tagName !== 'BUTTON') {
        event.preventDefault();
        finish(defaultId);
      }
    };

    buttons.forEach((label, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      if (index === defaultId) btn.classList.add('accent');
      btn.addEventListener('click', (event) => {
        event.stopPropagation();
        finish(index);
      });
      actions.appendChild(btn);
    });

    overlay.addEventListener('click', onOverlay);
    document.addEventListener('keydown', onKey);
    const focusBtn = actions.children[defaultId] || actions.children[0];
    if (focusBtn) focusBtn.focus();
  });
}

function revoke(url) {
  if (url && String(url).startsWith('blob:')) URL.revokeObjectURL(url);
}

function dirName(filePath) {
  return String(filePath || '').replace(/[\\/][^\\/]+$/, '');
}

function baseNameOf(filePath) {
  return String(filePath || '').replace(/^.*[\\/]/, '').replace(/\.png$/i, '') || 'Icon';
}

function flow() {
  const steps = ['format', 'utils'];
  if (state.utility === 'make') steps.push('make-pick', 'make-edit', 'make-export');
  if (state.utility === 'extract') steps.push('extract-kind', 'extract-pick', 'extract-select', 'extract-export');
  if (state.utility === 'add') steps.push('add-pick', 'add-place');
  return steps;
}

function canEnter(view) {
  if (view === 'format') return true;
  if (!state.format) return false;
  if (view === 'utils') return true;
  if (view.startsWith('make')) {
    if (state.utility !== 'make') return false;
    if (view === 'make-pick') return true;
    if (state.make.sources.length <= 0) return false;
    return true;
  }
  if (view.startsWith('extract')) {
    if (state.utility !== 'extract') return false;
    if (view === 'extract-kind') return true;
    if (!state.extract.kind) return false;
    if (view === 'extract-pick') return true;
    if (!state.extract.sheet) return false;
    if (view === 'extract-export') return state.extract.selected.size > 0;
    return true;
  }
  if (view.startsWith('add')) {
    if (state.utility !== 'add') return false;
    if (view === 'add-pick') return true;
    if (!state.add.sheet) return false;
    return true;
  }
  return false;
}

function goTo(view) {
  if (!canEnter(view)) return;
  state.view = view;
  renderAll();
}

function nextView() {
  const list = flow();
  const index = list.indexOf(state.view);
  return list[index + 1] || '';
}

function prevView() {
  const list = flow();
  const index = list.indexOf(state.view);
  return list[index - 1] || '';
}

function statusText() {
  if (state.view === 'format') return 'Choose VX Ace (24×24) or MV/MZ (32×32) as the output format.';
  if (state.view === 'utils') return 'Output format ' + formatLabel(state.format) + '. Choose a utility.';
  if (state.view === 'make-pick') return 'Choose pictures or Tray icons to turn into ' + iconSize() + '×' + iconSize() + ' icons.';
  if (state.view === 'make-edit') return 'Edit corners and borders. Group mode ' + (state.make.groupMode ? 'on' : 'off') + '.';
  if (state.view === 'make-export') return 'Export icons or add them to the Tray. This step can be repeated.';
  if (state.view === 'extract-kind') return 'Choose the format of the Iconset you will load.';
  if (state.view === 'extract-pick') return 'Load an Iconset.png to extract from.';
  if (state.view === 'extract-select') return state.extract.selected.size + ' icon(s) selected.';
  if (state.view === 'extract-export') return 'Export extracted icons or add them to the Tray.';
  if (state.view === 'add-pick') return 'Load an Iconset.png to place Tray icons into.';
  if (state.view === 'add-place') return 'Place Tray icons on slots, add rows if needed, then export.';
  return '';
}

function nextEnabled() {
  if (state.view === 'format') return !!state.format;
  if (state.view === 'utils') return false;
  if (state.view === 'make-pick') return state.make.sources.length > 0;
  if (state.view === 'make-edit') return state.make.sources.length > 0;
  if (state.view === 'extract-kind') return !!state.extract.kind;
  if (state.view === 'extract-pick') return !!state.extract.sheet;
  if (state.view === 'extract-select') return state.extract.selected.size > 0;
  if (state.view === 'add-pick') return !!state.add.sheet;
  return false;
}

function nextLabel() {
  if (state.view === 'make-edit') return 'Continue';
  if (state.view === 'extract-select') return 'Continue';
  return 'Next';
}

function renderStepper() {
  const host = $('stepper');
  host.replaceChildren();
  const items = [{ view: 'format', label: 'Format', num: '1' }, { view: 'utils', label: 'Utilities', num: '2' }];
  if (state.utility === 'make') {
    items.push(
      { view: 'make-pick', label: 'Pictures', num: '3' },
      { view: 'make-edit', label: 'Edit', num: '4' },
      { view: 'make-export', label: 'Export', num: '5' }
    );
  } else if (state.utility === 'extract') {
    items.push(
      { view: 'extract-kind', label: 'Iconset type', num: '3' },
      { view: 'extract-pick', label: 'Load', num: '4' },
      { view: 'extract-select', label: 'Select', num: '5' },
      { view: 'extract-export', label: 'Export', num: '6' }
    );
  } else if (state.utility === 'add') {
    items.push(
      { view: 'add-pick', label: 'Load', num: '3' },
      { view: 'add-place', label: 'Place', num: '4' }
    );
  }
  const order = items.map((item) => item.view);
  const activeIndex = order.indexOf(state.view);
  items.forEach((item, index) => {
    const hub = item.view === 'format' || item.view === 'utils';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = hub ? 'step-btn step-hub' : 'step-btn';
    if (item.view === state.view) btn.classList.add('active');
    if (index < activeIndex) btn.classList.add('done');
    btn.disabled = !canEnter(item.view);
    btn.title = hub ? 'Return to ' + item.label + ' at any time' : item.label;
    btn.innerHTML = '<span class="step-num">' + item.num + '</span><span class="step-label">' + item.label + '</span>';
    btn.addEventListener('click', () => goTo(item.view));
    host.appendChild(btn);
    if (item.view === 'utils' && items.length > 2) {
      const split = document.createElement('span');
      split.className = 'step-split';
      split.setAttribute('aria-hidden', 'true');
      host.appendChild(split);
    }
  });
}

function renderPanels() {
  document.querySelectorAll('.step-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.id === 'view-' + state.view);
  });
  $('workspace').classList.toggle('with-tray', !!state.format);
  $('trayPanel').classList.toggle('hidden', !state.format);
  $('statusText').textContent = statusText();
  $('btnBack').disabled = !prevView();
  const showNext = !['utils', 'make-export', 'extract-export', 'add-place'].includes(state.view);
  $('btnNext').classList.toggle('hidden', !showNext);
  $('btnNext').disabled = !nextEnabled();
  $('btnNext').textContent = nextLabel();
  document.querySelectorAll('[data-format]').forEach((btn) => {
    btn.classList.toggle('selected', Number(btn.getAttribute('data-format')) === state.format);
  });
  document.querySelectorAll('[data-utility]').forEach((btn) => {
    btn.classList.toggle('selected', btn.getAttribute('data-utility') === state.utility);
  });
  document.querySelectorAll('[data-extract-kind]').forEach((btn) => {
    btn.classList.toggle('selected', Number(btn.getAttribute('data-extract-kind')) === state.extract.kind);
  });
}

async function readPng(filePath) {
  if (!APP || typeof APP.readPng !== 'function') {
    throw new Error('Start this program with Icon Manipulator for RPG Maker - v1.0.bat');
  }
  const info = await APP.readPng(filePath);
  const url = bytesToUrl(info.bytes);
  const img = await loadHtmlImage(url);
  return {
    path: info.path,
    name: info.name,
    width: info.width,
    height: info.height,
    url,
    img,
    canvas: canvasFromImage(img)
  };
}

function scaleIconCanvas(canvas, fromSize, toSize) {
  if (fromSize === toSize) return ICONFX.scaleCanvas(canvas, toSize, toSize, false);
  return ICONFX.scaleCanvas(canvas, toSize, toSize, false);
}

function convertSheet(canvas, fromSize, toSize) {
  if (fromSize === toSize) return canvas;
  const rows = canvas.height / fromSize;
  const out = ICONFX.makeCanvas(ICONFX.sheetWidth(toSize), rows * toSize);
  const ctx = out.getContext('2d', { alpha: true });
  ctx.imageSmoothingEnabled = false;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < COLUMNS; col += 1) {
      const cell = ICONFX.extractCell(canvas, col, row, fromSize);
      ctx.drawImage(scaleIconCanvas(cell, fromSize, toSize), col * toSize, row * toSize);
    }
  }
  return out;
}

async function setFormat(next) {
  const size = Number(next);
  if (size !== ICONFX.ACE && size !== ICONFX.MV) return;
  if (state.format === size) {
    goTo('utils');
    return;
  }
  if (state.tray.length > 0 && state.format) {
    const choice = await askConfirm({
      type: 'warning',
      title: 'Switch icon format',
      message: 'The Tray currently holds ' + state.tray.length + ' icon(s) in ' + formatLabel(state.format) + '.',
      detail: 'Convert them to ' + formatLabel(size) + ', or clear the Tray first.',
      buttons: ['Cancel', 'Clear Tray and Switch', 'Convert and Switch'],
      defaultId: 2,
      cancelId: 0
    });
    if (choice === 0) return;
    if (choice === 1) {
      clearTray();
    } else {
      state.tray = state.tray.map((item) => {
        const scaled = scaleIconCanvas(item.canvas, state.format, size);
        const payload = ICONFX.canvasPayload(scaled);
        return {
          id: item.id,
          name: item.name,
          canvas: scaled,
          url: payload.url
        };
      });
    }
  }
  const previous = state.format;
  state.format = size;
  if (previous && previous !== size) {
    convertLoadedSheets(previous, size);
  }
  goTo('utils');
}

function convertLoadedSheets(fromSize, toSize) {
  if (!fromSize || !toSize || fromSize === toSize) return;
  if (state.extract.sheet) {
    state.extract.sheet.canvas = convertSheet(state.extract.sheet.canvas, fromSize, toSize);
  }
  if (state.add.sheet) {
    state.add.sheet.canvas = convertSheet(state.add.sheet.canvas, fromSize, toSize);
  }
}

function clearTray() {
  state.tray = [];
  state.add.heldId = null;
  renderTray();
}

async function clearMakePictures() {
  if (!state.make.sources.length) return;
  const choice = await askConfirm({
    type: 'warning',
    title: 'Clear Pictures',
    message: 'Remove all pictures from Make/Edit Icon(s)?',
    buttons: ['Cancel', 'Clear'],
    defaultId: 1,
    cancelId: 0
  });
  if (choice !== 1) return;
  state.make.sources.forEach((source) => revoke(source.url));
  state.make.sources = [];
  state.make.selected = new Set();
  state.make.outSelected = new Set();
  state.make.seededOut = false;
  if (state.view === 'make-edit' || state.view === 'make-export') goTo('make-pick');
  else renderAll();
}

function addToTray(items) {
  for (const item of items) {
    state.tray.push({
      id: uid(),
      name: item.name,
      canvas: item.canvas,
      url: item.url || ICONFX.canvasPayload(item.canvas).url
    });
  }
  renderTray();
  toast('Added ' + items.length + ' icon(s) to the Tray.');
}

async function importSingleIcons(filePaths) {
  if (!state.format) {
    toast('Choose an output format first.', 'warn');
    return;
  }
  const size = iconSize();
  const other = size === ICONFX.ACE ? ICONFX.MV : ICONFX.ACE;
  const skipped = [];
  const added = [];
  setLoading(true);
  try {
    for (const filePath of filePaths) {
      const info = await readPng(filePath);
      const detected = ICONFX.detectSingleIcon(info.width, info.height);
      if (!detected) {
        skipped.push(info.name + ' (' + info.width + '×' + info.height + ')');
        revoke(info.url);
        continue;
      }
      let canvas = info.canvas;
      if (detected === other) {
        canvas = scaleIconCanvas(canvas, detected, size);
      }
      added.push({ name: info.name, canvas, url: ICONFX.canvasPayload(canvas).url });
      revoke(info.url);
    }
    if (added.length) addToTray(added);
    if (skipped.length) {
      await askConfirm({
        type: 'warning',
        title: 'Wrong picture size',
        message: 'These files are not 24×24 or 32×32 single icons and were not added to the Tray.',
        detail: skipped.join('\n'),
        buttons: ['OK'],
        defaultId: 0,
        cancelId: 0
      });
    }
  } catch (err) {
    toast(err.message || String(err), 'danger');
  } finally {
    setLoading(false);
  }
}

function renderTray() {
  $('trayCount').textContent = String(state.tray.length);
  const host = $('trayList');
  host.replaceChildren();
  for (const item of state.tray) {
    const row = document.createElement('div');
    row.className = 'tray-item' + (state.add.heldId === item.id ? ' selected' : '');
    const img = document.createElement('img');
    img.src = item.url;
    img.alt = item.name;
    const meta = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = item.name;
    meta.appendChild(title);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Remove';
    remove.addEventListener('click', (event) => {
      event.stopPropagation();
      state.tray = state.tray.filter((entry) => entry.id !== item.id);
      if (state.add.heldId === item.id) state.add.heldId = null;
      renderAll();
    });
    row.appendChild(img);
    row.appendChild(meta);
    row.appendChild(remove);
    row.addEventListener('click', () => {
      if (state.view === 'make-pick' || state.view === 'make-edit') {
        addMakeSourcesFromTray([item]);
        return;
      }
      state.add.heldId = state.add.heldId === item.id ? null : item.id;
      renderAll();
    });
    row.draggable = true;
    row.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('text/plain', item.id);
      state.add.heldId = item.id;
    });
    host.appendChild(row);
  }
  const fromTray = $('btnMakeFromTray');
  const fromTrayEdit = $('btnMakeFromTrayEdit');
  if (fromTray) fromTray.disabled = state.tray.length <= 0;
  if (fromTrayEdit) fromTrayEdit.disabled = state.tray.length <= 0;
}

function renderedMakeCanvas(source) {
  const settings = state.make.groupMode ? state.make.groupSettings : source.settings;
  const fitted = ICONFX.fitToIcon(source.img, iconSize());
  return ICONFX.renderIcon(fitted, iconSize(), settings);
}

function readMakeForm() {
  const settings = ICONFX.cloneSettings(state.make.groupSettings);
  settings.corners = $('cornerMode').value;
  settings.cornerSize = Number($('cornerSize').value) || 0;
  settings.borderMode = $('borderMode').value;
  settings.thickness = Number($('borderThickness').value) || 0;
  settings.color = normalizeHex($('borderColor').value);
  settings.style = $('borderStyle').value;
  settings.dotGap = Number($('dotGap').value) || 1;
  settings.dash = Number($('dashLen').value) || 1;
  settings.gap = Number($('dashGap').value) || 1;
  settings.multi = $('multiBorder').checked;
  settings.extras = [];
  if (settings.multi) {
    document.querySelectorAll('.extra-card').forEach((card) => {
      settings.extras.push({
        relative: card.querySelector('.ex-rel').value,
        thickness: Number(card.querySelector('.ex-th').value) || 0,
        color: normalizeHex(card.querySelector('.ex-col').value),
        style: card.querySelector('.ex-style').value,
        dotGap: Number(card.querySelector('.ex-dot').value) || 1,
        dash: Number(card.querySelector('.ex-dash').value) || 1,
        gap: Number(card.querySelector('.ex-gap').value) || 1,
        transparent: card.querySelector('.ex-tr').checked
      });
    });
  }
  return settings;
}

function normalizeHex(value) {
  const text = String(value || '').trim();
  if (/^#[0-9a-fA-F]{6}$/.test(text)) return text.toLowerCase();
  if (/^[0-9a-fA-F]{6}$/.test(text)) return '#' + text.toLowerCase();
  return '#ffffff';
}

function syncMakeFormChrome(cfg) {
  $('cornerSizeWrap').classList.toggle('hidden', cfg.corners === 'normal');
  $('dotGapWrap').classList.toggle('hidden', cfg.style !== 'dotted');
  $('dashWrap').classList.toggle('hidden', cfg.style !== 'interrupted');
  $('extraBorders').classList.toggle('hidden', !cfg.multi);
  $('btnAddBorder').classList.toggle('hidden', !cfg.multi);
}

function writeMakeForm(settings) {
  const cfg = ICONFX.cloneSettings(settings);
  $('cornerMode').value = cfg.corners;
  $('cornerSize').value = String(cfg.cornerSize);
  $('borderMode').value = cfg.borderMode;
  $('borderThickness').value = String(cfg.thickness);
  $('borderColor').value = cfg.color;
  $('borderColorPicker').value = cfg.color;
  $('borderStyle').value = cfg.style;
  $('dotGap').value = String(cfg.dotGap);
  $('dashLen').value = String(cfg.dash);
  $('dashGap').value = String(cfg.gap);
  $('makeGroupMode').checked = state.make.groupMode;
  $('multiBorder').checked = cfg.multi;
  syncMakeFormChrome(cfg);
  renderExtraBorders(cfg.extras);
}

function renderExtraBorders(extras) {
  const host = $('extraBorders');
  host.replaceChildren();
  extras.forEach((extra, index) => {
    const color = normalizeHex(extra.color);
    const card = document.createElement('div');
    card.className = 'extra-card';
    card.innerHTML =
      '<div class="card-head"><strong>Extra border ' + (index + 1) + '</strong>' +
      '<button type="button" data-remove="' + index + '">Remove</button></div>' +
      '<label class="stack-field">Relative to main<select class="ex-rel">' +
      '<option value="outside">Outside of main</option><option value="inside">Inside of main</option></select></label>' +
      '<label class="check-row"><input class="ex-tr" type="checkbox"> Transparent spacer</label>' +
      '<label class="stack-field">Thickness (pixels)<input class="ex-th" type="number" min="0" max="16" value="' + extra.thickness + '"></label>' +
      '<label class="stack-field">Color<span class="color-row">' +
      '<input class="ex-col-pick" type="color" value="' + color + '">' +
      '<input class="ex-col" type="text" value="' + color + '" spellcheck="false"></span></label>' +
      '<label class="stack-field">Style<select class="ex-style">' +
      '<option value="normal">Normal (contiguous)</option><option value="dotted">Dotted</option><option value="interrupted">Interrupted line</option></select></label>' +
      '<label class="stack-field">Space between dots (pixels)<input class="ex-dot" type="number" min="1" max="16" value="' + extra.dotGap + '"></label>' +
      '<label class="stack-field">Line / space<input class="ex-dash" type="number" min="1" value="' + extra.dash + '">' +
      '<input class="ex-gap" type="number" min="1" value="' + extra.gap + '"></label>';
    card.querySelector('.ex-rel').value = extra.relative;
    card.querySelector('.ex-style').value = extra.style;
    card.querySelector('.ex-tr').checked = !!extra.transparent;
    card.querySelector('.ex-col-pick').value = color;
    card.querySelector('[data-remove]').addEventListener('click', () => {
      const current = readMakeForm();
      current.extras.splice(index, 1);
      applyMakeSettings(current, true);
    });
    const pick = card.querySelector('.ex-col-pick');
    const hex = card.querySelector('.ex-col');
    pick.addEventListener('input', () => {
      hex.value = pick.value;
      applyMakeSettings(readMakeForm(), false);
    });
    hex.addEventListener('input', () => {
      const normalized = normalizeHex(hex.value);
      if (/^#[0-9a-fA-F]{6}$/.test(hex.value.trim()) || /^[0-9a-fA-F]{6}$/.test(hex.value.trim())) {
        pick.value = normalized;
      }
      applyMakeSettings(readMakeForm(), false);
    });
    card.querySelectorAll('input:not(.ex-col):not(.ex-col-pick),select').forEach((input) => {
      input.addEventListener('change', () => applyMakeSettings(readMakeForm(), false));
      if (input.tagName !== 'SELECT' && input.type !== 'checkbox') {
        input.addEventListener('input', () => applyMakeSettings(readMakeForm(), false));
      }
    });
    host.appendChild(card);
  });
}

function applyMakeSettings(settings, rebuildExtras) {
  const cfg = ICONFX.cloneSettings(settings);
  if (state.make.groupMode) {
    state.make.groupSettings = cfg;
    for (const source of state.make.sources) source.settings = ICONFX.cloneSettings(cfg);
  } else {
    const selected = state.make.sources.filter((source) => state.make.selected.has(source.id));
    if (!selected.length) {
      toast('Select one or more pictures to edit separately.', 'warn');
      return;
    }
    for (const source of selected) source.settings = ICONFX.cloneSettings(cfg);
  }
  syncMakeFormChrome(cfg);
  if (rebuildExtras) renderExtraBorders(cfg.extras);
  renderMakePreview();
}

function renderMakeList() {
  $('makeCount').textContent = state.make.sources.length + (state.make.sources.length === 1 ? ' file' : ' files');
  const host = $('makeList');
  host.replaceChildren();
  for (const source of state.make.sources) {
    const item = document.createElement('li');
    item.className = 'file-item';
    const img = document.createElement('img');
    img.src = source.url;
    const meta = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = source.name;
    const sub = document.createElement('div');
    sub.className = 'muted tiny';
    sub.textContent = source.width + '×' + source.height;
    meta.appendChild(title);
    meta.appendChild(sub);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => {
      revoke(source.url);
      state.make.sources = state.make.sources.filter((entry) => entry.id !== source.id);
      state.make.selected.delete(source.id);
      renderAll();
    });
    item.appendChild(img);
    item.appendChild(meta);
    item.appendChild(remove);
    host.appendChild(item);
  }
}

function renderMakeEditList() {
  const host = $('makeEditList');
  host.replaceChildren();
  for (const source of state.make.sources) {
    const item = document.createElement('div');
    item.className = 'file-item' + (state.make.selected.has(source.id) ? ' selected' : '');
    const img = document.createElement('img');
    img.src = source.url;
    const meta = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = source.name;
    meta.appendChild(title);
    item.appendChild(img);
    item.appendChild(meta);
    item.addEventListener('click', (event) => {
      if (event.ctrlKey) {
        if (state.make.selected.has(source.id)) state.make.selected.delete(source.id);
        else state.make.selected.add(source.id);
      } else {
        state.make.selected = new Set([source.id]);
        if (!state.make.groupMode) writeMakeForm(source.settings);
      }
      renderMakeEditList();
      renderMakePreview();
    });
    host.appendChild(item);
  }
}

function renderMakePreview() {
  const host = $('makePreview');
  host.replaceChildren();
  const sources = state.make.groupMode
    ? state.make.sources
    : state.make.sources.filter((source) => state.make.selected.has(source.id));
  const list = sources.length ? sources : state.make.sources;
  $('makePreviewHint').textContent = list.length + ' preview(s)';
  for (const source of list) {
    const card = document.createElement('div');
    card.className = 'preview-card';
    card.appendChild(renderedMakeCanvas(source));
    const label = document.createElement('div');
    label.className = 'meta';
    label.textContent = source.name;
    card.appendChild(label);
    host.appendChild(card);
  }
}

function renderMakeExport() {
  const host = $('makeOutList');
  host.replaceChildren();
  if (!state.make.seededOut) {
    state.make.sources.forEach((source) => state.make.outSelected.add(source.id));
    state.make.seededOut = true;
  }
  for (const source of state.make.sources) {
    const card = document.createElement('div');
    card.className = 'preview-card' + (state.make.outSelected.has(source.id) ? ' selected' : '');
    card.appendChild(renderedMakeCanvas(source));
    const label = document.createElement('div');
    label.className = 'meta';
    label.textContent = source.name;
    card.appendChild(label);
    card.addEventListener('click', () => {
      if (state.make.outSelected.has(source.id)) state.make.outSelected.delete(source.id);
      else state.make.outSelected.add(source.id);
      renderMakeExport();
    });
    host.appendChild(card);
  }
}

async function addMakeSources(filePaths) {
  setLoading(true);
  try {
    const known = new Set(state.make.sources.map((item) => item.path.toLowerCase()));
    let added = 0;
    for (const filePath of filePaths) {
      const key = String(filePath).toLowerCase();
      if (!key.endsWith('.png') || known.has(key)) continue;
      const info = await readPng(filePath);
      const source = {
        id: uid(),
        path: info.path,
        name: info.name,
        width: info.width,
        height: info.height,
        url: info.url,
        img: info.img,
        settings: ICONFX.cloneSettings(state.make.groupSettings)
      };
      state.make.sources.push(source);
      state.make.selected.add(source.id);
      state.make.outSelected.add(source.id);
      added += 1;
    }
    renderAll();
    if (added) toast('Added ' + added + ' picture(s).');
  } catch (err) {
    toast(err.message || String(err), 'danger');
  } finally {
    setLoading(false);
  }
}

async function addMakeSourcesFromTray(trayItems) {
  const items = Array.isArray(trayItems) ? trayItems : state.tray.slice();
  if (!items.length) {
    toast('The Tray is empty.', 'warn');
    return;
  }
  const known = new Set(state.make.sources.map((source) => source.trayId).filter(Boolean));
  let added = 0;
  setLoading(true);
  try {
    for (const item of items) {
      if (known.has(item.id)) continue;
      const img = await loadHtmlImage(item.url);
      const source = {
        id: uid(),
        path: 'tray://' + item.id,
        trayId: item.id,
        name: item.name,
        width: item.canvas.width,
        height: item.canvas.height,
        url: item.url,
        img,
        settings: ICONFX.cloneSettings(state.make.groupSettings)
      };
      state.make.sources.push(source);
      state.make.selected.add(source.id);
      state.make.outSelected.add(source.id);
      known.add(item.id);
      added += 1;
    }
    renderAll();
    if (added) toast('Added ' + added + ' Tray icon(s) to edit.');
    else toast('Those Tray icons are already in the picture list.', 'warn');
  } catch (err) {
    toast(err.message || String(err), 'danger');
  } finally {
    setLoading(false);
  }
}

function trayItemFromDrop(event) {
  const trayId = event.dataTransfer && event.dataTransfer.getData('text/plain');
  if (!trayId) return null;
  return state.tray.find((item) => item.id === trayId) || null;
}

function selectedMakeOutputs() {
  return state.make.sources.filter((source) => state.make.outSelected.has(source.id));
}

function payloadFromCanvas(canvas, name) {
  const data = ICONFX.canvasPayload(canvas);
  return {
    name,
    width: data.width,
    height: data.height,
    rgba: data.rgba,
    canvas,
    url: data.url
  };
}

async function exportPngFiles(items) {
  if (!items.length) {
    toast('Select at least one icon.', 'warn');
    return;
  }
  const directory = await APP.pickDirectory({ title: 'Choose folder for icon PNG files' });
  if (!directory) return;
  setLoading(true);
  try {
    let result = await APP.savePngFiles({
      directory,
      files: items.map((item) => ({ name: item.name, width: item.width, height: item.height, rgba: item.rgba })),
      overwrite: false
    });
    if (!result.ok && result.code === 'exists') {
      setLoading(false);
      const choice = await askConfirm({
        type: 'warning',
        title: 'Files already exist',
        message: 'Overwrite existing PNG file(s)?',
        detail: (result.paths || []).map((filePath) => String(filePath).replace(/^.*[\\/]/, '')).join('\n'),
        buttons: ['Cancel', 'Overwrite'],
        defaultId: 1,
        cancelId: 0
      });
      if (choice !== 1) return;
      setLoading(true);
      result = await APP.savePngFiles({
        directory,
        files: items.map((item) => ({ name: item.name, width: item.width, height: item.height, rgba: item.rgba })),
        overwrite: true
      });
    }
    if (!result.ok) throw new Error('Could not save PNG files.');
    toast('Saved ' + result.paths.length + ' PNG file(s).');
    if (result.paths[0]) await APP.showItemInFolder(result.paths[0]);
  } catch (err) {
    toast(err.message || String(err), 'danger');
  } finally {
    setLoading(false);
  }
}

async function loadIconsetFromPath(filePath, expectedKind) {
  const info = await readPng(filePath);
  const detected = ICONFX.detectIconset(info.width, info.height);
  if (!detected) {
    revoke(info.url);
    await askConfirm({
      type: 'error',
      title: 'Not an Iconset',
      message: '"' + info.name + '" is ' + info.width + '×' + info.height + '.',
      detail: 'An Iconset must be 384px wide (VX Ace, height multiple of 24) or 512px wide (MV/MZ, height multiple of 32).',
      buttons: ['OK'],
      defaultId: 0,
      cancelId: 0
    });
    return null;
  }
  if (expectedKind && detected !== expectedKind) {
    revoke(info.url);
    await askConfirm({
      type: 'warning',
      title: 'Wrong Iconset format',
      message: '"' + info.name + '" looks like a ' + formatLabel(detected) + ' Iconset.',
      detail: 'Go back and choose that input format, or pick a matching file.',
      buttons: ['OK'],
      defaultId: 0,
      cancelId: 0
    });
    return null;
  }
  let canvas = info.canvas;
  const from = detected;
  if (from !== iconSize()) {
    canvas = convertSheet(canvas, from, iconSize());
    toast('Converted Iconset from ' + formatLabel(from) + ' to ' + formatLabel(iconSize()) + '.');
  }
  revoke(info.url);
  return {
    path: info.path,
    name: info.name,
    canvas,
    rows: canvas.height / iconSize()
  };
}

function sheetCellDisplay() {
  return iconSize() * 2;
}

function pointerToCell(canvas, event, rows) {
  const rect = canvas.getBoundingClientRect();
  const display = sheetCellDisplay();
  const x = (event.clientX - rect.left) * (canvas.width / Math.max(1, rect.width));
  const y = (event.clientY - rect.top) * (canvas.height / Math.max(1, rect.height));
  const col = clampInt(Math.floor(x / display), 0, COLUMNS - 1);
  const row = clampInt(Math.floor(y / display), 0, rows - 1);
  return { col, row, id: ICONFX.xyToId(col, row) };
}

function clampInt(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function drawIconset(canvasEl, sheet, selected, hoverId, assignments) {
  const display = sheetCellDisplay();
  const rows = sheet.rows;
  const nextW = COLUMNS * display;
  const nextH = rows * display;
  if (canvasEl.width !== nextW) canvasEl.width = nextW;
  if (canvasEl.height !== nextH) canvasEl.height = nextH;
  const ctx = canvasEl.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.lineWidth = 1;
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  ctx.drawImage(sheet.canvas, 0, 0, canvasEl.width, canvasEl.height);
  if (assignments) {
    for (const [id, trayId] of Object.entries(assignments)) {
      const tray = state.tray.find((item) => item.id === trayId);
      if (!tray) continue;
      const pos = ICONFX.idToXY(Number(id));
      ctx.clearRect(pos.x * display, pos.y * display, display, display);
      ctx.drawImage(tray.canvas, pos.x * display, pos.y * display, display, display);
    }
  }
  ctx.strokeStyle = 'rgba(236,244,251,0.18)';
  for (let c = 0; c <= COLUMNS; c += 1) {
    ctx.beginPath();
    ctx.moveTo(c * display + 0.5, 0);
    ctx.lineTo(c * display + 0.5, canvasEl.height);
    ctx.stroke();
  }
  for (let r = 0; r <= rows; r += 1) {
    ctx.beginPath();
    ctx.moveTo(0, r * display + 0.5);
    ctx.lineTo(canvasEl.width, r * display + 0.5);
    ctx.stroke();
  }
  if (selected && selected.size) {
    ctx.fillStyle = 'rgba(233,124,52,0.4)';
    ctx.strokeStyle = '#e97c34';
    ctx.lineWidth = 2;
    selected.forEach((id) => {
      const pos = ICONFX.idToXY(Number(id));
      ctx.fillRect(pos.x * display, pos.y * display, display, display);
      ctx.strokeRect(pos.x * display + 1, pos.y * display + 1, display - 2, display - 2);
    });
    ctx.lineWidth = 1;
  }
  if (hoverId >= 0) {
    const pos = ICONFX.idToXY(hoverId);
    ctx.strokeStyle = '#f3a35e';
    ctx.lineWidth = 2;
    ctx.strokeRect(pos.x * display + 1, pos.y * display + 1, display - 2, display - 2);
    const xy = 'X ' + pos.x + '  Y ' + pos.y;
    const label = 'ID ' + hoverId;
    ctx.font = '11px Bahnschrift, Trebuchet MS, sans-serif';
    ctx.fillStyle = 'rgba(12, 19, 27, 0.86)';
    ctx.fillRect(pos.x * display + 2, pos.y * display + 2, display - 4, 28);
    ctx.fillStyle = '#ecf4fb';
    ctx.fillText(xy, pos.x * display + 6, pos.y * display + 14);
    ctx.fillText(label, pos.x * display + 6, pos.y * display + 26);
  }
}

function renderSelectionOverlay(overlay, display, rows, selected, hoverId) {
  if (!overlay) return;
  overlay.style.width = (COLUMNS * display) + 'px';
  overlay.style.height = (Math.max(1, rows) * display) + 'px';
  overlay.replaceChildren();
  const mark = (id, className) => {
    const pos = ICONFX.idToXY(Number(id));
    const cell = document.createElement('div');
    cell.className = className;
    cell.style.left = (pos.x * display) + 'px';
    cell.style.top = (pos.y * display) + 'px';
    cell.style.width = display + 'px';
    cell.style.height = display + 'px';
    overlay.appendChild(cell);
  };
  if (selected) selected.forEach((id) => mark(id, 'icon-cell selected'));
  if (hoverId >= 0) mark(hoverId, 'icon-cell hover');
}

function syncExtractNav(rebuildSteps) {
  $('extractSelCount').textContent = state.extract.selected.size + ' selected';
  $('statusText').textContent = statusText();
  $('btnNext').disabled = !nextEnabled();
  if (rebuildSteps) renderStepper();
}

function renderExtractSelect(opts) {
  if (!state.extract.sheet) return;
  const sheet = state.extract.sheet;
  $('extractSheetInfo').textContent = sheet.name + ' · ' + sheet.rows + ' row(s) · ' + (sheet.rows * COLUMNS) + ' icons';
  drawIconset($('extractCanvas'), sheet, state.extract.selected, state.extract.hoverId, null);
  renderSelectionOverlay($('extractSelOverlay'), sheetCellDisplay(), sheet.rows, state.extract.selected, state.extract.hoverId);
  if (state.extract.hoverId >= 0) {
    const pos = ICONFX.idToXY(state.extract.hoverId);
    $('extractHoverInfo').textContent = 'X ' + pos.x + '  Y ' + pos.y + '  ID ' + state.extract.hoverId;
  } else {
    $('extractHoverInfo').textContent = 'Hover an icon';
  }
  syncExtractNav(!(opts && opts.hoverOnly));
}

function renderExtractExport() {
  const host = $('extractOutList');
  host.replaceChildren();
  if (!state.extract.sheet) return;
  syncExtractOutSelected();
  const ids = Array.from(state.extract.selected).sort((a, b) => a - b);
  for (const id of ids) {
    const pos = ICONFX.idToXY(id);
    const cell = ICONFX.extractCell(state.extract.sheet.canvas, pos.x, pos.y, iconSize());
    const card = document.createElement('div');
    card.className = 'preview-card' + (state.extract.outSelected.has(id) ? ' selected' : '');
    card.appendChild(cell);
    const label = document.createElement('div');
    label.className = 'meta';
    label.textContent = 'ID ' + id + '  (' + pos.x + ',' + pos.y + ')';
    card.appendChild(label);
    card.addEventListener('click', () => {
      if (state.extract.outSelected.has(id)) state.extract.outSelected.delete(id);
      else state.extract.outSelected.add(id);
      renderExtractExport();
    });
    host.appendChild(card);
  }
}

function syncExtractOutSelected() {
  const pool = state.extract.selected;
  if (!state.extract.seededOut) {
    state.extract.outSelected = new Set(pool);
    state.extract.knownPool = new Set(pool);
    state.extract.seededOut = true;
    return;
  }
  Array.from(state.extract.outSelected).forEach((id) => {
    if (!pool.has(id)) state.extract.outSelected.delete(id);
  });
  pool.forEach((id) => {
    if (!state.extract.knownPool.has(id)) state.extract.outSelected.add(id);
  });
  state.extract.knownPool = new Set(pool);
}

function selectedExtractOutputs() {
  return Array.from(state.extract.outSelected).sort((a, b) => a - b);
}

function extractOutputItems() {
  return selectedExtractOutputs().map((id) => {
    const pos = ICONFX.idToXY(id);
    const canvas = ICONFX.extractCell(state.extract.sheet.canvas, pos.x, pos.y, iconSize());
    return payloadFromCanvas(canvas, baseNameOf(state.extract.sheet.name) + '_id' + String(id).padStart(3, '0'));
  });
}

function mergeExtractSelection(ids) {
  filterIds(ids).forEach((id) => state.extract.selected.add(id));
  renderExtractSelect();
}

function parseIds(text) {
  const ids = new Set();
  String(text || '').split(/[,\s]+/).forEach((part) => {
    if (!part) return;
    const range = part.split('-');
    if (range.length === 2) {
      const a = Number(range[0]);
      const b = Number(range[1]);
      if (!Number.isInteger(a) || !Number.isInteger(b)) return;
      const from = Math.min(a, b);
      const to = Math.max(a, b);
      for (let i = from; i <= to; i += 1) ids.add(i);
      return;
    }
    const id = Number(part);
    if (Number.isInteger(id)) ids.add(id);
  });
  return ids;
}

function parseXY(text) {
  const ids = new Set();
  String(text || '').split(/[;]+/).forEach((pair) => {
    const parts = pair.trim().split(/[,\s]+/).filter(Boolean);
    if (parts.length < 2) return;
    const x = Number(parts[0]);
    const y = Number(parts[1]);
    if (Number.isInteger(x) && Number.isInteger(y)) ids.add(ICONFX.xyToId(x, y));
  });
  return ids;
}

function maxId() {
  const sheet = state.view.startsWith('add') ? state.add.sheet : state.extract.sheet;
  if (!sheet) return 0;
  return sheet.rows * COLUMNS - 1;
}

function filterIds(ids) {
  const max = maxId();
  return new Set(Array.from(ids).filter((id) => id >= 0 && id <= max));
}

function renderAddPlace() {
  if (!state.add.sheet) return;
  const sheet = state.add.sheet;
  $('addSheetInfo').textContent = sheet.name + ' · ' + sheet.rows + ' row(s)';
  const hover = $('addHoverInfo');
  if (hover) {
    if (state.add.hoverId >= 0) {
      const pos = ICONFX.idToXY(state.add.hoverId);
      hover.textContent = 'X ' + pos.x + '  Y ' + pos.y + '  ID ' + state.add.hoverId;
    } else {
      hover.textContent = 'Hover an icon';
    }
  }
  drawIconset($('addCanvas'), sheet, null, state.add.hoverId, state.add.assignments);
  const host = $('addTrayList');
  host.replaceChildren();
  for (const item of state.tray) {
    const card = document.createElement('div');
    card.className = 'preview-card' + (state.add.heldId === item.id ? ' selected' : '');
    const img = document.createElement('img');
    img.src = item.url;
    card.appendChild(img);
    const label = document.createElement('div');
    label.className = 'meta';
    label.textContent = item.name;
    card.appendChild(label);
    card.addEventListener('click', () => {
      state.add.heldId = state.add.heldId === item.id ? null : item.id;
      renderAddPlace();
      renderTray();
    });
    card.draggable = true;
    card.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('text/plain', item.id);
      state.add.heldId = item.id;
    });
    host.appendChild(card);
  }
}

function buildAddSheetCanvas() {
  const sheet = state.add.sheet;
  const size = iconSize();
  const out = ICONFX.makeCanvas(sheet.canvas.width, sheet.canvas.height);
  const ctx = out.getContext('2d', { alpha: true });
  ctx.drawImage(sheet.canvas, 0, 0);
  for (const [id, trayId] of Object.entries(state.add.assignments)) {
    const tray = state.tray.find((item) => item.id === trayId);
    const pos = ICONFX.idToXY(Number(id));
    ICONFX.clearAndDrawCell(ctx, out.width, size, pos.x, pos.y, tray ? tray.canvas : null);
  }
  return out;
}

async function saveAddSheet(saveAs) {
  if (!state.add.sheet) return;
  const canvas = buildAddSheetCanvas();
  const payload = ICONFX.canvasPayload(canvas);
  let filePath = state.add.sheet.path;
  if (saveAs) {
    const picked = await APP.pickSavePng({
      title: 'Save Iconset as',
      defaultPath: filePath
    });
    if (!picked) return;
    filePath = picked;
  } else {
    const choice = await askConfirm({
      type: 'warning',
      title: 'Overwrite Iconset',
      message: 'Overwrite "' + state.add.sheet.name + '"?',
      buttons: ['Cancel', 'Save'],
      defaultId: 1,
      cancelId: 0
    });
    if (choice !== 1) return;
  }
  setLoading(true);
  try {
    let result = await APP.savePngFile({
      filePath,
      width: payload.width,
      height: payload.height,
      rgba: payload.rgba,
      overwrite: !saveAs
    });
    if (!result.ok && result.code === 'exists') {
      setLoading(false);
      const choice = await askConfirm({
        type: 'warning',
        title: 'File exists',
        message: 'Overwrite the existing file?',
        buttons: ['Cancel', 'Overwrite'],
        defaultId: 1,
        cancelId: 0
      });
      if (choice !== 1) return;
      setLoading(true);
      result = await APP.savePngFile({
        filePath,
        width: payload.width,
        height: payload.height,
        rgba: payload.rgba,
        overwrite: true
      });
    }
    if (!result.ok) throw new Error('Could not save Iconset.');
    toast('Saved Iconset.');
    if (result.paths[0]) await APP.showItemInFolder(result.paths[0]);
  } catch (err) {
    toast(err.message || String(err), 'danger');
  } finally {
    setLoading(false);
  }
}

function renderAll() {
  renderStepper();
  renderPanels();
  renderTray();
  if (state.view === 'make-pick') renderMakeList();
  if (state.view === 'make-edit') {
    writeMakeForm(state.make.groupMode
      ? state.make.groupSettings
      : ((state.make.sources.find((source) => state.make.selected.has(source.id)) || state.make.sources[0] || {}).settings || state.make.groupSettings));
    renderMakeEditList();
    renderMakePreview();
  }
  if (state.view === 'make-export') renderMakeExport();
  if (state.view === 'extract-select') renderExtractSelect();
  if (state.view === 'extract-export') renderExtractExport();
  if (state.view === 'add-place') renderAddPlace();
}

function pngPathsFromDrop(event) {
  const files = event.dataTransfer && event.dataTransfer.files ? Array.from(event.dataTransfer.files) : [];
  const paths = [];
  for (const file of files) {
    let filePath = '';
    try {
      filePath = APP && APP.getPathForFile ? APP.getPathForFile(file) : '';
    } catch (_error) {
      filePath = file.path || '';
    }
    if (!filePath && file.path) filePath = String(file.path);
    if (filePath && /\.png$/i.test(filePath)) paths.push(filePath);
  }
  return paths;
}

function bindExtractCanvas() {
  const canvas = $('extractCanvas');
  canvas.draggable = false;
  canvas.addEventListener('dragstart', (event) => event.preventDefault());
  canvas.addEventListener('mousemove', (event) => {
    if (!state.extract.sheet) return;
    const cell = pointerToCell(canvas, event, state.extract.sheet.rows);
    state.extract.hoverId = cell.id;
    if (state.extract.drag) {
      const a = state.extract.drag.start;
      const ids = new Set(state.extract.drag.base);
      const minX = Math.min(a.col, cell.col);
      const maxX = Math.max(a.col, cell.col);
      const minY = Math.min(a.row, cell.row);
      const maxY = Math.max(a.row, cell.row);
      for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) ids.add(ICONFX.xyToId(x, y));
      }
      state.extract.selected = ids;
    }
    renderExtractSelect({ hoverOnly: true });
  });
  canvas.addEventListener('mouseleave', () => {
    state.extract.hoverId = -1;
    renderExtractSelect({ hoverOnly: true });
  });
  canvas.addEventListener('mousedown', (event) => {
    if (!state.extract.sheet) return;
    event.preventDefault();
    const cell = pointerToCell(canvas, event, state.extract.sheet.rows);
    if (event.shiftKey) {
      const last = ICONFX.idToXY(state.extract.lastId);
      const minX = Math.min(last.x, cell.col);
      const maxX = Math.max(last.x, cell.col);
      const minY = Math.min(last.y, cell.row);
      const maxY = Math.max(last.y, cell.row);
      for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) state.extract.selected.add(ICONFX.xyToId(x, y));
      }
    } else if (event.ctrlKey) {
      if (state.extract.selected.has(cell.id)) state.extract.selected.delete(cell.id);
      else state.extract.selected.add(cell.id);
      state.extract.lastId = cell.id;
    } else {
      state.extract.selected = new Set([cell.id]);
      state.extract.lastId = cell.id;
    }
    state.extract.drag = {
      start: cell,
      base: event.ctrlKey ? new Set(state.extract.selected) : new Set()
    };
    renderExtractSelect();
  });
  window.addEventListener('mouseup', () => {
    const wasDragging = !!state.extract.drag;
    state.extract.drag = null;
    if (wasDragging && state.view === 'extract-select') renderExtractSelect();
  });
}

function bindAddCanvas() {
  const canvas = $('addCanvas');
  canvas.addEventListener('dragover', (event) => event.preventDefault());
  canvas.addEventListener('drop', (event) => {
    event.preventDefault();
    if (!state.add.sheet) return;
    const trayId = event.dataTransfer.getData('text/plain') || state.add.heldId;
    if (!trayId) return;
    const cell = pointerToCell(canvas, event, state.add.sheet.rows);
    state.add.assignments[String(cell.id)] = trayId;
    state.add.heldId = null;
    renderAll();
  });
  canvas.addEventListener('click', (event) => {
    if (!state.add.sheet) return;
    const cell = pointerToCell(canvas, event, state.add.sheet.rows);
    const key = String(cell.id);
    if (state.add.heldId) {
      state.add.assignments[key] = state.add.heldId;
      state.add.heldId = null;
    } else if (state.add.assignments[key]) {
      delete state.add.assignments[key];
    }
    renderAll();
  });
  canvas.addEventListener('mousemove', (event) => {
    if (!state.add.sheet) return;
    const cell = pointerToCell(canvas, event, state.add.sheet.rows);
    const pos = ICONFX.idToXY(cell.id);
    state.add.hoverId = cell.id;
    $('addSheetInfo').textContent = state.add.sheet.name + ' · ' + state.add.sheet.rows + ' row(s)';
    $('addHoverInfo').textContent = 'X ' + pos.x + '  Y ' + pos.y + '  ID ' + cell.id;
    drawIconset(canvas, state.add.sheet, null, cell.id, state.add.assignments);
  });
  canvas.addEventListener('mouseleave', () => {
    state.add.hoverId = -1;
    if (state.add.sheet) renderAddPlace();
  });
}

const dragState = { depth: 0 };

function updateDropOverlay() {
  const mainCard = $('dropMainCard');
  const trayCard = $('dropTrayCard');
  trayCard.classList.toggle('hidden', !state.format);
  if (!state.format) {
    mainCard.classList.remove('hidden');
    $('dropOverlayTitle').textContent = 'Choose a format first';
    $('dropOverlayText').textContent = 'Select VX Ace or MV/MZ before dropping files.';
    return;
  }
  if (state.view === 'make-pick') {
    mainCard.classList.remove('hidden');
    $('dropOverlayTitle').textContent = 'Drop pictures to make/edit icons';
    $('dropOverlayText').textContent = 'Any PNG will be fitted to the output icon size. You can also add icons from the Tray.';
  } else if (state.view === 'extract-pick' || state.view === 'add-pick') {
    mainCard.classList.remove('hidden');
    $('dropOverlayTitle').textContent = 'Drop an Iconset.png';
    $('dropOverlayText').textContent = 'Width must be 384 or 512 pixels.';
  } else {
    mainCard.classList.add('hidden');
  }
}

function dropGoesToTray(event) {
  if (!state.format) return false;
  if (event.target && event.target.closest && event.target.closest('#dropTrayCard')) return true;
  if (state.view === 'make-pick' || state.view === 'extract-pick' || state.view === 'add-pick') return false;
  return true;
}

function bindEvents() {
  $('btnStartOver').addEventListener('click', async () => {
    const choice = await askConfirm({
      type: 'warning',
      title: 'Start Over',
      message: 'Clear format, utilities, pictures, and Tray?',
      buttons: ['Cancel', 'Start Over'],
      defaultId: 1,
      cancelId: 0
    });
    if (choice !== 1) return;
    state.make.sources.forEach((source) => revoke(source.url));
    state.view = 'format';
    state.format = 0;
    state.utility = '';
    state.tray = [];
    state.make = { sources: [], groupMode: true, selected: new Set(), outSelected: new Set(), seededOut: false, groupSettings: ICONFX.defaultSettings() };
    state.extract = { kind: 0, sheet: null, selected: new Set(), outSelected: new Set(), knownPool: new Set(), seededOut: false, lastId: 0, hoverId: -1, drag: null };
    state.add = { sheet: null, assignments: {}, heldId: null, hoverId: -1 };
    renderAll();
  });

  $('btnBack').addEventListener('click', () => {
    const prev = prevView();
    if (prev) goTo(prev);
  });

  $('btnNext').addEventListener('click', () => {
    const next = nextView();
    if (next) goTo(next);
  });

  document.querySelectorAll('[data-format]').forEach((btn) => {
    btn.addEventListener('click', () => setFormat(Number(btn.getAttribute('data-format'))));
  });

  document.querySelectorAll('[data-utility]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.utility = btn.getAttribute('data-utility');
      if (state.utility === 'make') goTo('make-pick');
      if (state.utility === 'extract') goTo('extract-kind');
      if (state.utility === 'add') goTo('add-pick');
    });
  });

  $('btnMakePick').addEventListener('click', async () => {
    const paths = await APP.pickPngs({ title: 'Select pictures to turn into icons' });
    if (paths && paths.length) await addMakeSources(paths);
  });
  $('btnMakeFromTray').addEventListener('click', () => addMakeSourcesFromTray(state.tray));
  $('btnMakeFromTrayEdit').addEventListener('click', () => addMakeSourcesFromTray(state.tray));
  $('btnMakeClearPictures').addEventListener('click', () => clearMakePictures());
  $('btnMakeClearPicturesEdit').addEventListener('click', () => clearMakePictures());

  $('makeGroupMode').addEventListener('change', () => {
    state.make.groupMode = $('makeGroupMode').checked;
    if (state.make.groupMode) applyMakeSettings(state.make.groupSettings, true);
    else renderAll();
  });

  ['cornerMode', 'cornerSize', 'borderMode', 'borderThickness', 'borderColor', 'borderColorPicker', 'borderStyle', 'dotGap', 'dashLen', 'dashGap', 'multiBorder'].forEach((id) => {
    const node = $(id);
    const eventName = node.type === 'checkbox' || node.tagName === 'SELECT' ? 'change' : 'input';
    node.addEventListener(eventName, () => {
      if (id === 'borderColorPicker') $('borderColor').value = $('borderColorPicker').value;
      if (id === 'borderColor') $('borderColorPicker').value = normalizeHex($('borderColor').value);
      if (id === 'multiBorder' && $('multiBorder').checked && !readMakeForm().extras.length) {
        const cfg = readMakeForm();
        cfg.extras.push(ICONFX.extraBorder());
        applyMakeSettings(cfg, true);
        return;
      }
      applyMakeSettings(readMakeForm(), id === 'multiBorder');
    });
  });

  $('btnAddBorder').addEventListener('click', () => {
    const cfg = readMakeForm();
    cfg.multi = true;
    cfg.extras.push(ICONFX.extraBorder());
    applyMakeSettings(cfg, true);
  });

  $('btnMakeSelectAll').addEventListener('click', () => {
    state.make.selected = new Set(state.make.sources.map((source) => source.id));
    renderAll();
  });
  $('btnMakeSelectNone').addEventListener('click', () => {
    state.make.selected = new Set();
    renderAll();
  });
  $('btnMakeSelectAllOut').addEventListener('click', () => {
    state.make.outSelected = new Set(state.make.sources.map((source) => source.id));
    renderMakeExport();
  });
  $('btnMakeSelectNoneOut').addEventListener('click', () => {
    state.make.outSelected = new Set();
    renderMakeExport();
  });
  $('btnMakeToTray').addEventListener('click', () => {
    const items = selectedMakeOutputs().map((source) => {
      const canvas = renderedMakeCanvas(source);
      return payloadFromCanvas(canvas, source.name);
    });
    addToTray(items);
  });
  $('btnMakeExport').addEventListener('click', () => {
    const items = selectedMakeOutputs().map((source) => {
      const canvas = renderedMakeCanvas(source);
      return payloadFromCanvas(canvas, baseNameOf(source.name) + '_icon');
    });
    exportPngFiles(items);
  });

  document.querySelectorAll('[data-extract-kind]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.extract.kind = Number(btn.getAttribute('data-extract-kind'));
      goTo('extract-pick');
    });
  });

  $('btnExtractPick').addEventListener('click', async () => {
    const filePath = await APP.pickPng({ title: 'Select an Iconset.png' });
    if (!filePath) return;
    setLoading(true);
    try {
      const sheet = await loadIconsetFromPath(filePath, state.extract.kind);
      if (!sheet) return;
      state.extract.sheet = sheet;
      state.extract.selected = new Set();
      state.extract.outSelected = new Set();
      state.extract.knownPool = new Set();
      state.extract.seededOut = false;
      goTo('extract-select');
    } finally {
      setLoading(false);
    }
  });

  $('btnExtractApplyIds').addEventListener('click', () => {
    state.extract.selected = filterIds(parseIds($('extractIds').value));
    renderExtractSelect();
  });
  $('btnExtractAddIds').addEventListener('click', () => {
    mergeExtractSelection(parseIds($('extractIds').value));
  });
  $('btnExtractApplyXY').addEventListener('click', () => {
    state.extract.selected = filterIds(parseXY($('extractXY').value));
    renderExtractSelect();
  });
  $('btnExtractAddXY').addEventListener('click', () => {
    mergeExtractSelection(parseXY($('extractXY').value));
  });
  $('btnExtractSelectAll').addEventListener('click', () => {
    const ids = new Set();
    for (let i = 0; i <= maxId(); i += 1) ids.add(i);
    state.extract.selected = ids;
    renderExtractSelect();
  });
  $('btnExtractSelectNone').addEventListener('click', () => {
    state.extract.selected = new Set();
    renderExtractSelect();
  });
  $('btnExtractSelectAllOut').addEventListener('click', () => {
    state.extract.outSelected = new Set(state.extract.selected);
    renderExtractExport();
  });
  $('btnExtractSelectNoneOut').addEventListener('click', () => {
    state.extract.outSelected = new Set();
    renderExtractExport();
  });
  $('btnExtractToTray').addEventListener('click', () => {
    addToTray(extractOutputItems());
  });
  $('btnExtractExport').addEventListener('click', () => {
    exportPngFiles(extractOutputItems());
  });

  $('btnAddPick').addEventListener('click', async () => {
    const filePath = await APP.pickPng({ title: 'Select an Iconset.png to modify' });
    if (!filePath) return;
    setLoading(true);
    try {
      const sheet = await loadIconsetFromPath(filePath, 0);
      if (!sheet) return;
      state.add.sheet = sheet;
      state.add.assignments = {};
      goTo('add-place');
    } finally {
      setLoading(false);
    }
  });

  $('btnAddRow').addEventListener('click', () => {
    if (!state.add.sheet) return;
    const size = iconSize();
    const next = ICONFX.makeCanvas(state.add.sheet.canvas.width, state.add.sheet.canvas.height + size);
    next.getContext('2d').drawImage(state.add.sheet.canvas, 0, 0);
    state.add.sheet.canvas = next;
    state.add.sheet.rows += 1;
    renderAddPlace();
  });

  $('btnRemoveRow').addEventListener('click', () => {
    if (!state.add.sheet || state.add.sheet.rows <= 1) return;
    const size = iconSize();
    const lastStart = (state.add.sheet.rows - 1) * COLUMNS;
    Object.keys(state.add.assignments).forEach((id) => {
      if (Number(id) >= lastStart) delete state.add.assignments[id];
    });
    const next = ICONFX.makeCanvas(state.add.sheet.canvas.width, state.add.sheet.canvas.height - size);
    next.getContext('2d').drawImage(state.add.sheet.canvas, 0, 0);
    state.add.sheet.canvas = next;
    state.add.sheet.rows -= 1;
    renderAddPlace();
  });

  $('btnAddSave').addEventListener('click', () => saveAddSheet(false));
  $('btnAddSaveAs').addEventListener('click', () => saveAddSheet(true));

  $('btnTrayPick').addEventListener('click', async () => {
    const paths = await APP.pickPngs({ title: 'Select 24×24 or 32×32 single icon PNG files' });
    if (paths && paths.length) await importSingleIcons(paths);
  });
  $('btnTrayClear').addEventListener('click', async () => {
    if (!state.tray.length) return;
    const choice = await askConfirm({
      type: 'warning',
      title: 'Clear Tray',
      message: 'Remove all icons from the Tray?',
      buttons: ['Cancel', 'Clear'],
      defaultId: 1,
      cancelId: 0
    });
    if (choice === 1) {
      clearTray();
      renderAll();
    }
  });

  bindExtractCanvas();
  bindAddCanvas();

  window.addEventListener('dragenter', (event) => {
    if (!event.dataTransfer || !Array.from(event.dataTransfer.types || []).includes('Files')) return;
    event.preventDefault();
    dragState.depth += 1;
    $('dropOverlay').classList.remove('hidden');
    updateDropOverlay();
  });
  window.addEventListener('dragover', (event) => {
    event.preventDefault();
    const overTray = !!(event.target && event.target.closest && event.target.closest('#dropTrayCard'));
    const overMain = !!(event.target && event.target.closest && event.target.closest('#dropMainCard'));
    $('dropTrayCard').classList.toggle('hot', overTray);
    $('dropMainCard').classList.toggle('hot', overMain);
  });
  window.addEventListener('dragleave', () => {
    dragState.depth = Math.max(0, dragState.depth - 1);
    if (dragState.depth <= 0) $('dropOverlay').classList.add('hidden');
  });
  window.addEventListener('drop', async (event) => {
    event.preventDefault();
    dragState.depth = 0;
    $('dropOverlay').classList.add('hidden');
    const trayItem = trayItemFromDrop(event);
    if (trayItem) {
      if (state.view === 'make-pick' || state.view === 'make-edit') {
        await addMakeSourcesFromTray([trayItem]);
      }
      return;
    }
    const paths = pngPathsFromDrop(event);
    if (!paths.length) {
      toast('Only .png files are accepted.', 'warn');
      return;
    }
    if (!state.format) {
      toast('Choose an output format first.', 'warn');
      return;
    }
    if (dropGoesToTray(event)) {
      await importSingleIcons(paths);
      return;
    }
    if (state.view === 'make-pick') await addMakeSources(paths);
    else if (state.view === 'extract-pick') {
      setLoading(true);
      try {
        const sheet = await loadIconsetFromPath(paths[0], state.extract.kind);
        if (!sheet) return;
        state.extract.sheet = sheet;
        state.extract.selected = new Set();
        state.extract.outSelected = new Set();
        state.extract.knownPool = new Set();
        state.extract.seededOut = false;
        goTo('extract-select');
      } finally {
        setLoading(false);
      }
    } else if (state.view === 'add-pick') {
      setLoading(true);
      try {
        const sheet = await loadIconsetFromPath(paths[0], 0);
        if (!sheet) return;
        state.add.sheet = sheet;
        state.add.assignments = {};
        goTo('add-place');
      } finally {
        setLoading(false);
      }
    } else {
      await importSingleIcons(paths);
    }
  });
}

function init() {
  bindEvents();
  writeMakeForm(state.make.groupSettings);
  renderAll();
  if (!APP || !APP.isElectron) {
    toast('Start this program with “Icon Manipulator for RPG Maker - v1.0.bat”.', 'warn');
  }
}

init();

'use strict';

const SLOTS = 8;
const COLUMNS = 4;
const APP = window.fcrm;

const state = {
  step: 1,
  maxReached: 1,
  sources: [],
  selectedSourceId: null,
  squareSize: 0,
  cropX: 0,
  cropY: 0,
  cropReady: false,
  cuts: [],
  cutsStale: true,
  exportReady: false,
  exportMode: 'create',
  heldCutId: null,
  createSheets: [],
  modifySheets: [],
  outputFolder: '',
  baseName: 'Faces',
  alignOpacity: 0.55,
  alignCamera: { zoom: 1, panX: 0, panY: 0 },
  cutCamera: { zoom: 1, panX: 0, panY: 0 },
  imageScale: 1,
  imageShiftX: 0,
  imageShiftY: 0
};

const drag = {
  depth: 0,
  mode: '',
  pointerId: null,
  startX: 0,
  startY: 0,
  offsetX: 0,
  offsetY: 0,
  cutId: ''
};

const els = {
  stepper: document.getElementById('stepper'),
  statusText: document.getElementById('statusText'),
  btnBack: document.getElementById('btnBack'),
  btnNext: document.getElementById('btnNext'),
  btnStartOver: document.getElementById('btnStartOver'),
  dropOverlay: document.getElementById('dropOverlay'),
  dropOverlayTitle: document.getElementById('dropOverlayTitle'),
  dropOverlayText: document.getElementById('dropOverlayText'),
  loading: document.getElementById('loading'),
  toasts: document.getElementById('toasts'),
  sourceDropZone: document.getElementById('sourceDropZone'),
  btnPickSources: document.getElementById('btnPickSources'),
  sourceList: document.getElementById('sourceList'),
  sourceCount: document.getElementById('sourceCount'),
  alignCanvas: document.getElementById('alignCanvas'),
  alignList: document.getElementById('alignList'),
  alignOpacity: document.getElementById('alignOpacity'),
  alignHint: document.getElementById('alignHint'),
  offsetX: document.getElementById('offsetX'),
  offsetY: document.getElementById('offsetY'),
  btnResetOffsets: document.getElementById('btnResetOffsets'),
  btnAlignFit: document.getElementById('btnAlignFit'),
  size96: document.getElementById('size96'),
  size144: document.getElementById('size144'),
  cutCanvas: document.getElementById('cutCanvas'),
  btnCutFit: document.getElementById('btnCutFit'),
  cutZoom: document.getElementById('cutZoom'),
  cropX: document.getElementById('cropX'),
  cropY: document.getElementById('cropY'),
  cropSizeLabel: document.getElementById('cropSizeLabel'),
  imageScale: document.getElementById('imageScale'),
  imageScalePct: document.getElementById('imageScalePct'),
  btnScaleDown: document.getElementById('btnScaleDown'),
  btnScaleUp: document.getElementById('btnScaleUp'),
  btnScaleReset: document.getElementById('btnScaleReset'),
  livePreview: document.getElementById('livePreview'),
  previewCount: document.getElementById('previewCount'),
  cutPalette: document.getElementById('cutPalette'),
  btnSelectAllCuts: document.getElementById('btnSelectAllCuts'),
  btnSelectNoneCuts: document.getElementById('btnSelectNoneCuts'),
  modeCreate: document.getElementById('modeCreate'),
  modeModify: document.getElementById('modeModify'),
  createPane: document.getElementById('createPane'),
  modifyPane: document.getElementById('modifyPane'),
  outputFolder: document.getElementById('outputFolder'),
  btnPickFolder: document.getElementById('btnPickFolder'),
  baseName: document.getElementById('baseName'),
  btnAutoFill: document.getElementById('btnAutoFill'),
  btnAddSheet: document.getElementById('btnAddSheet'),
  btnCreateSave: document.getElementById('btnCreateSave'),
  createSheets: document.getElementById('createSheets'),
  modifyDropZone: document.getElementById('modifyDropZone'),
  btnPickFaces: document.getElementById('btnPickFaces'),
  btnModifySave: document.getElementById('btnModifySave'),
  btnModifySaveAs: document.getElementById('btnModifySaveAs'),
  modifySheets: document.getElementById('modifySheets')
};

function uid() {
  return 'id' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function $(selector, root) {
  return (root || document).querySelector(selector);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function dirName(filePath) {
  return String(filePath || '').replace(/[\\/][^\\/]+$/, '');
}

function joinPath(folder, name) {
  const text = String(folder || '');
  const sep = text.indexOf('/') >= 0 && text.indexOf('\\') < 0 ? '/' : '\\';
  return text.replace(/[\\/]+$/, '') + sep + name;
}

function baseNameOf(filePath) {
  const name = String(filePath || '').replace(/^.*[\\/]/, '');
  return name.replace(/\.png$/i, '') || 'Faces';
}

function toUint8(bytes) {
  if (bytes instanceof Uint8Array) return bytes;
  if (bytes && bytes.buffer instanceof ArrayBuffer) return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
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

function sheetSize() {
  return {
    width: state.squareSize * COLUMNS,
    height: state.squareSize * 2
  };
}

function emptySlots() {
  return [null, null, null, null, null, null, null, null];
}

function selectedSource() {
  return state.sources.find((item) => item.id === state.selectedSourceId) || state.sources[0] || null;
}

function selectedCuts() {
  return state.cuts.filter((cut) => cut.selected);
}

function findCut(cutId) {
  return state.cuts.find((cut) => cut.id === cutId) || null;
}

function setLoading(on) {
  els.loading.classList.toggle('hidden', !on);
}

function toast(message, type) {
  const node = document.createElement('div');
  node.className = 'toast ' + (type || 'ok');
  node.textContent = message;
  els.toasts.appendChild(node);
  setTimeout(() => {
    node.remove();
  }, 4200);
}

async function askConfirm(options) {
  if (APP && typeof APP.confirm === 'function') {
    return APP.confirm(options);
  }
  return window.confirm(options.message + (options.detail ? '\n\n' + options.detail : '')) ? 1 : 0;
}

function hasFileDrag(event) {
  const types = event.dataTransfer && event.dataTransfer.types;
  if (!types) return false;
  return Array.from(types).includes('Files');
}

function pngFilesFromDrop(event) {
  return event.dataTransfer && event.dataTransfer.files ? Array.from(event.dataTransfer.files) : [];
}

function pathFromDroppedFile(file) {
  let filePath = '';
  try {
    if (APP && typeof APP.getPathForFile === 'function') {
      filePath = APP.getPathForFile(file) || '';
    }
  } catch (_error) {
    filePath = '';
  }
  if (!filePath && file && file.path) {
    filePath = String(file.path);
  }
  return filePath;
}

function pngPathsFromDrop(event) {
  const paths = [];
  for (const file of pngFilesFromDrop(event)) {
    const filePath = pathFromDroppedFile(file);
    if (filePath && /\.png$/i.test(filePath)) {
      paths.push(filePath);
    }
  }
  return paths;
}

async function addMemorySources(files) {
  const pngFiles = files.filter((file) => /\.png$/i.test(file.name) || file.type === 'image/png');
  if (pngFiles.length <= 0) return;
  setLoading(true);
  try {
    for (const file of pngFiles) {
      const url = URL.createObjectURL(file);
      const img = await loadHtmlImage(url);
      state.sources.push({
        id: uid(),
        path: file.name,
        name: file.name,
        width: img.naturalWidth,
        height: img.naturalHeight,
        offsetX: 0,
        offsetY: 0,
        url,
        img
      });
    }
    if (!state.selectedSourceId && state.sources[0]) {
      state.selectedSourceId = state.sources[0].id;
    }
    invalidateCuts();
    state.cropReady = false;
    renderAll();
    toast('Added ' + pngFiles.length + ' dropped picture' + (pngFiles.length === 1 ? '' : 's') + '.');
  } catch (err) {
    toast(err.message || String(err), 'danger');
  } finally {
    setLoading(false);
  }
}

function cropCenter() {
  const size = state.squareSize || 96;
  return {
    x: state.cropX + size / 2,
    y: state.cropY + size / 2
  };
}

function setImageScale(nextScale) {
  const current = state.imageScale || 1;
  const next = clamp(Number(nextScale) || 1, 0.1, 8);
  if (Math.abs(next - current) < 0.0001) {
    syncScaleFields();
    return;
  }
  const center = cropCenter();
  state.imageShiftX = center.x - (next / current) * (center.x - (state.imageShiftX || 0));
  state.imageShiftY = center.y - (next / current) * (center.y - (state.imageShiftY || 0));
  state.imageScale = next;
  invalidateCuts();
  syncScaleFields();
}

function resetImageScale() {
  state.imageScale = 1;
  state.imageShiftX = 0;
  state.imageShiftY = 0;
  invalidateCuts();
  syncScaleFields();
}

function syncScaleFields() {
  if (!els.imageScale || !els.imageScalePct) return;
  const percent = Math.round((state.imageScale || 1) * 100);
  els.imageScale.value = String(clamp(percent, 10, 400));
  els.imageScalePct.value = String(percent);
}

function imageWorldRect(src) {
  const scale = state.imageScale || 1;
  return {
    x: src.offsetX * scale + (state.imageShiftX || 0),
    y: src.offsetY * scale + (state.imageShiftY || 0),
    w: src.width * scale,
    h: src.height * scale
  };
}

function sourceCropRect(src) {
  const scale = state.imageScale || 1;
  const size = state.squareSize || 96;
  return {
    sx: (state.cropX - (state.imageShiftX || 0)) / scale - src.offsetX,
    sy: (state.cropY - (state.imageShiftY || 0)) / scale - src.offsetY,
    sw: size / scale,
    sh: size / scale
  };
}

function scaledSourceBounds() {
  if (state.sources.length <= 0) {
    return { x: 0, y: 0, w: 1, h: 1 };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const src of state.sources) {
    const rect = imageWorldRect(src);
    minX = Math.min(minX, rect.x);
    minY = Math.min(minY, rect.y);
    maxX = Math.max(maxX, rect.x + rect.w);
    maxY = Math.max(maxY, rect.y + rect.h);
  }
  const size = state.squareSize || 0;
  minX = Math.min(minX, state.cropX);
  minY = Math.min(minY, state.cropY);
  maxX = Math.max(maxX, state.cropX + size);
  maxY = Math.max(maxY, state.cropY + size);
  return { x: minX, y: minY, w: Math.max(1, maxX - minX), h: Math.max(1, maxY - minY) };
}

function sourceBounds() {
  if (state.sources.length <= 0) {
    return { x: 0, y: 0, w: 1, h: 1 };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const src of state.sources) {
    minX = Math.min(minX, src.offsetX);
    minY = Math.min(minY, src.offsetY);
    maxX = Math.max(maxX, src.offsetX + src.width);
    maxY = Math.max(maxY, src.offsetY + src.height);
  }
  return { x: minX, y: minY, w: Math.max(1, maxX - minX), h: Math.max(1, maxY - minY) };
}

function sizeCanvas(canvas) {
  const parent = canvas.parentElement;
  const rect = parent.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const cssW = Math.max(1, Math.floor(rect.width));
  const cssH = Math.max(1, Math.floor(rect.height));
  if (canvas.width !== Math.floor(cssW * dpr) || canvas.height !== Math.floor(cssH * dpr)) {
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
  }
  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';
  return { cssW, cssH, dpr };
}

function worldFromEvent(camera, canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const sx = event.clientX - rect.left;
  const sy = event.clientY - rect.top;
  return {
    x: (sx - camera.panX) / camera.zoom,
    y: (sy - camera.panY) / camera.zoom,
    sx,
    sy
  };
}

function fitCamera(camera, canvas, bounds, padding) {
  const rect = canvas.getBoundingClientRect();
  const pad = padding == null ? 48 : padding;
  const zoom = clamp(
    Math.min((rect.width - pad * 2) / Math.max(1, bounds.w), (rect.height - pad * 2) / Math.max(1, bounds.h)),
    0.05,
    8
  );
  camera.zoom = zoom;
  camera.panX = (rect.width - bounds.w * zoom) / 2 - bounds.x * zoom;
  camera.panY = (rect.height - bounds.h * zoom) / 2 - bounds.y * zoom;
}

function drawSources(ctx, camera, options) {
  const selected = options && options.highlightId;
  const dim = options && options.opacity != null ? options.opacity : 1;
  const scaled = options && options.scaled;
  for (const src of state.sources) {
    const isSel = src.id === selected;
    ctx.globalAlpha = isSel ? 1 : dim;
    if (scaled) {
      const rect = imageWorldRect(src);
      ctx.drawImage(src.img, rect.x, rect.y, rect.w, rect.h);
    } else {
      ctx.drawImage(src.img, src.offsetX, src.offsetY);
    }
  }
  ctx.globalAlpha = 1;
}

function cropRegion(img, sx, sy, sw, sh, outSize, smooth) {
  const canvas = document.createElement('canvas');
  canvas.width = outSize;
  canvas.height = outSize;
  const ctx = canvas.getContext('2d', { willReadFrequently: true, alpha: true });
  ctx.clearRect(0, 0, outSize, outSize);
  ctx.imageSmoothingEnabled = !!smooth;
  if (smooth) {
    ctx.imageSmoothingQuality = 'high';
  }
  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;
  if (!(sw > 0) || !(sh > 0)) return canvas;
  const srcLeft = Math.max(sx, 0);
  const srcTop = Math.max(sy, 0);
  const srcRight = Math.min(sx + sw, imgW);
  const srcBottom = Math.min(sy + sh, imgH);
  if (srcRight <= srcLeft || srcBottom <= srcTop) return canvas;
  const dstLeft = ((srcLeft - sx) / sw) * outSize;
  const dstTop = ((srcTop - sy) / sh) * outSize;
  const dstW = ((srcRight - srcLeft) / sw) * outSize;
  const dstH = ((srcBottom - srcTop) / sh) * outSize;
  ctx.drawImage(img, srcLeft, srcTop, srcRight - srcLeft, srcBottom - srcTop, dstLeft, dstTop, dstW, dstH);
  return canvas;
}

function cropToCanvas(img, sx, sy, size, targetCanvas) {
  const canvas = cropRegion(img, sx, sy, size, size, size, state.squareSize >= 144);
  if (targetCanvas) {
    targetCanvas.width = size;
    targetCanvas.height = size;
    const ctx = targetCanvas.getContext('2d', { willReadFrequently: true, alpha: true });
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(canvas, 0, 0);
    return targetCanvas;
  }
  return canvas;
}

function cropFaceFromSource(src) {
  const size = state.squareSize;
  const rect = sourceCropRect(src);
  const canvas = cropRegion(src.img, rect.sx, rect.sy, rect.sw, rect.sh, size, size >= 144);
  const ctx = canvas.getContext('2d', { willReadFrequently: true, alpha: true });
  return {
    imageData: ctx.getImageData(0, 0, size, size),
    url: canvas.toDataURL('image/png')
  };
}

function cropFace(img, sx, sy, size) {
  const canvas = cropRegion(img, sx, sy, size, size, size, size >= 144);
  const ctx = canvas.getContext('2d', { willReadFrequently: true, alpha: true });
  const imageData = ctx.getImageData(0, 0, size, size);
  return {
    imageData,
    url: canvas.toDataURL('image/png')
  };
}

function makeSlotPreviews(img, size) {
  const urls = [];
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { alpha: true });
  for (let i = 0; i < SLOTS; i += 1) {
    ctx.clearRect(0, 0, size, size);
    const sx = (i % COLUMNS) * size;
    const sy = Math.floor(i / COLUMNS) * size;
    ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
    urls.push(canvas.toDataURL('image/png'));
  }
  return urls;
}

function invalidateCuts() {
  if (state.cuts.length > 0) {
    state.cutsStale = true;
  }
}

function revokeSource(src) {
  if (src && src.url) {
    URL.revokeObjectURL(src.url);
  }
}

function revokeSheet(sheet) {
  if (sheet && sheet.url) {
    URL.revokeObjectURL(sheet.url);
  }
}

async function readPng(filePath) {
  if (!APP || typeof APP.readPng !== 'function') {
    throw new Error('Start this program with Face Cutter for RPG Maker - v1.0.bat');
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
    img
  };
}

async function addSources(filePaths) {
  const unique = [];
  const known = new Set(state.sources.map((item) => item.path.toLowerCase()));
  for (const filePath of filePaths) {
    const key = String(filePath).toLowerCase();
    if (!key.endsWith('.png') || known.has(key)) continue;
    known.add(key);
    unique.push(filePath);
  }
  if (unique.length <= 0) {
    if (filePaths.length > 0) toast('Those PNG files are already in the list.', 'warn');
    return;
  }

  setLoading(true);
  try {
    for (const filePath of unique) {
      const info = await readPng(filePath);
      state.sources.push({
        id: uid(),
        path: info.path,
        name: info.name,
        width: info.width,
        height: info.height,
        offsetX: 0,
        offsetY: 0,
        url: info.url,
        img: info.img
      });
    }
    if (!state.selectedSourceId && state.sources[0]) {
      state.selectedSourceId = state.sources[0].id;
    }
    if (!state.outputFolder && state.sources[0]) {
      state.outputFolder = dirName(state.sources[0].path);
    }
    if (state.baseName === 'Faces' && state.sources[0]) {
      state.baseName = baseNameOf(state.sources[0].name) + '_Faces';
    }
    invalidateCuts();
    state.cropReady = false;
    renderAll();
    toast('Added ' + unique.length + ' picture' + (unique.length === 1 ? '' : 's') + '.');
  } catch (err) {
    toast(err.message || String(err), 'danger');
  } finally {
    setLoading(false);
  }
}

function removeSource(id) {
  const index = state.sources.findIndex((item) => item.id === id);
  if (index < 0) return;
  revokeSource(state.sources[index]);
  state.sources.splice(index, 1);
  if (state.selectedSourceId === id) {
    state.selectedSourceId = state.sources[0] ? state.sources[0].id : null;
  }
  invalidateCuts();
  state.cropReady = false;
  renderAll();
}

function resetState() {
  for (const src of state.sources) revokeSource(src);
  for (const sheet of state.modifySheets) revokeSheet(sheet);
  state.step = 1;
  state.maxReached = 1;
  state.sources = [];
  state.selectedSourceId = null;
  state.squareSize = 0;
  state.cropX = 0;
  state.cropY = 0;
  state.cropReady = false;
  state.cuts = [];
  state.cutsStale = true;
  state.exportReady = false;
  state.exportMode = 'create';
  state.heldCutId = null;
  state.createSheets = [];
  state.modifySheets = [];
  state.outputFolder = '';
  state.baseName = 'Faces';
  state.alignOpacity = 0.55;
  state.alignCamera = { zoom: 1, panX: 0, panY: 0 };
  state.cutCamera = { zoom: 1, panX: 0, panY: 0 };
  state.imageScale = 1;
  state.imageShiftX = 0;
  state.imageShiftY = 0;
  els.alignOpacity.value = '55';
  els.baseName.value = 'Faces';
  els.outputFolder.value = '';
  syncScaleFields();
  renderAll();
}

function canEnter(step) {
  if (step <= 1) return true;
  if (state.sources.length <= 0) return false;
  if (step >= 4 && !state.squareSize) return false;
  if (step >= 5 && (state.cuts.length <= 0 || state.cutsStale)) return false;
  return true;
}

function goToStep(step) {
  if (!canEnter(step)) return;
  state.step = step;
  state.maxReached = Math.max(state.maxReached, step);
  if (step === 2) {
    requestAnimationFrame(() => {
      fitCamera(state.alignCamera, els.alignCanvas, sourceBounds());
      renderAlign();
    });
  }
  if (step === 4) {
    if (!state.cropReady) {
      const first = state.sources[0];
      state.cropX = first ? Math.round((first.width - state.squareSize) / 2) : 0;
      state.cropY = first ? Math.round((first.height - state.squareSize) / 2) : 0;
      state.cropReady = true;
    }
    requestAnimationFrame(() => {
      fitCamera(state.cutCamera, els.cutCanvas, scaledSourceBounds());
      els.cutZoom.value = String(Math.round(state.cutCamera.zoom * 100));
      renderCut();
    });
  }
  if (step === 5 && !state.exportReady) {
    autoFillCreate();
    state.exportReady = true;
  }
  renderAll();
}

function nextLabel() {
  if (state.step === 4) {
    return state.cuts.length > 0 ? 'Re-cut Faces and Continue' : 'Cut Faces and Continue';
  }
  return 'Next';
}

function statusForStep() {
  if (state.step === 1) {
    return state.sources.length ? state.sources.length + ' picture(s) selected.' : 'Select one or more PNG pictures to begin.';
  }
  if (state.step === 2) {
    return state.sources.length === 1
      ? 'Only one picture is loaded, so alignment is optional.'
      : 'Offset pictures so the same face lines up, then continue.';
  }
  if (state.step === 3) {
    return state.squareSize
      ? 'Square size ' + state.squareSize + '×' + state.squareSize + ' selected.'
      : 'Choose 96×96 (VX Ace) or 144×144 (MV/MZ).';
  }
  if (state.step === 4) {
    return 'Cutting square at ' + state.cropX + ', ' + state.cropY +
      ' (' + state.squareSize + '×' + state.squareSize + '), pictures at ' +
      Math.round((state.imageScale || 1) * 100) + '%.';
  }
  return 'Create new Face files or modify existing ones. This step can be repeated.';
}

function renderStepper() {
  const buttons = els.stepper.querySelectorAll('.step-btn');
  buttons.forEach((btn) => {
    const step = Number(btn.getAttribute('data-step'));
    btn.classList.toggle('active', step === state.step);
    btn.classList.toggle('done', step < state.step);
    btn.disabled = !(step <= state.maxReached && canEnter(step));
  });
}

function renderPanels() {
  document.querySelectorAll('.step-panel').forEach((panel) => {
    panel.classList.toggle('active', Number(panel.getAttribute('data-step')) === state.step);
  });
  els.btnBack.disabled = state.step <= 1;
  els.btnNext.classList.toggle('hidden', state.step === 5);
  els.btnNext.textContent = nextLabel();
  if (state.step === 1) els.btnNext.disabled = state.sources.length <= 0;
  else if (state.step === 2) els.btnNext.disabled = state.sources.length <= 0;
  else if (state.step === 3) els.btnNext.disabled = !state.squareSize;
  else if (state.step === 4) els.btnNext.disabled = !state.squareSize || state.sources.length <= 0;
  els.statusText.textContent = statusForStep();
  els.outputFolder.value = state.outputFolder;
  els.baseName.value = state.baseName;
  els.cropSizeLabel.textContent = state.squareSize ? (state.squareSize + '×' + state.squareSize) : '—';
  els.size96.classList.toggle('selected', state.squareSize === 96);
  els.size144.classList.toggle('selected', state.squareSize === 144);
  els.modeCreate.classList.toggle('active', state.exportMode === 'create');
  els.modeModify.classList.toggle('active', state.exportMode === 'modify');
  els.createPane.classList.toggle('hidden', state.exportMode !== 'create');
  els.modifyPane.classList.toggle('hidden', state.exportMode !== 'modify');
}

function fileItem(src, options) {
  const item = document.createElement('li');
  item.className = options.className || 'file-item';
  if (options.selected) item.classList.add('selected');
  const img = document.createElement('img');
  img.alt = src.name;
  img.src = src.url;
  const meta = document.createElement('div');
  meta.className = 'meta';
  const title = document.createElement('strong');
  title.textContent = src.name;
  const sub = document.createElement('div');
  sub.className = 'muted tiny';
  sub.textContent = options.subtitle || (src.width + '×' + src.height);
  meta.appendChild(title);
  meta.appendChild(sub);
  item.appendChild(img);
  item.appendChild(meta);
  if (options.extra) item.appendChild(options.extra);
  if (options.onClick) item.addEventListener('click', options.onClick);
  return item;
}

function renderSourceList() {
  els.sourceCount.textContent = state.sources.length + (state.sources.length === 1 ? ' file' : ' files');
  els.sourceList.replaceChildren();
  for (const src of state.sources) {
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Remove';
    remove.addEventListener('click', (event) => {
      event.stopPropagation();
      removeSource(src.id);
    });
    els.sourceList.appendChild(fileItem(src, { extra: remove }));
  }
}

function renderAlignList() {
  els.alignList.replaceChildren();
  for (const src of state.sources) {
    els.alignList.appendChild(fileItem(src, {
      className: 'align-item',
      selected: src.id === state.selectedSourceId,
      subtitle: src.width + '×' + src.height + '  offset ' + src.offsetX + ', ' + src.offsetY,
      onClick: () => {
        state.selectedSourceId = src.id;
        renderAll();
      }
    }));
  }
  const selected = selectedSource();
  els.offsetX.value = selected ? String(selected.offsetX) : '0';
  els.offsetY.value = selected ? String(selected.offsetY) : '0';
  els.offsetX.disabled = !selected;
  els.offsetY.disabled = !selected;
  els.alignHint.textContent = selected
    ? 'Moving "' + selected.name + '".'
    : 'Select a picture, then drag it or nudge it.';
}

function renderAlign() {
  const canvas = els.alignCanvas;
  const { cssW, cssH, dpr } = sizeCanvas(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);
  canvas.style.imageRendering = state.alignCamera.zoom >= 1.25 ? 'pixelated' : 'auto';
  ctx.save();
  ctx.translate(state.alignCamera.panX, state.alignCamera.panY);
  ctx.scale(state.alignCamera.zoom, state.alignCamera.zoom);
  drawSources(ctx, state.alignCamera, {
    highlightId: state.selectedSourceId,
    opacity: state.alignOpacity
  });
  ctx.restore();
}

function renderLivePreview() {
  els.previewCount.textContent = String(state.sources.length);
  const size = state.squareSize || 96;
  els.livePreview.replaceChildren();
  for (const src of state.sources) {
    const wrap = document.createElement('div');
    wrap.className = 'preview-face' + (size >= 144 ? ' hd' : '');
    const rect = sourceCropRect(src);
    const canvas = cropRegion(src.img, rect.sx, rect.sy, rect.sw, rect.sh, size, size >= 144);
    canvas.style.width = '96px';
    canvas.style.height = '96px';
    canvas.style.imageRendering = size === 96 ? 'pixelated' : 'auto';
    const label = document.createElement('span');
    label.className = 'muted tiny';
    label.textContent = src.name;
    wrap.appendChild(canvas);
    wrap.appendChild(label);
    els.livePreview.appendChild(wrap);
  }
}

function renderCut() {
  const canvas = els.cutCanvas;
  const { cssW, cssH, dpr } = sizeCanvas(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);
  canvas.style.imageRendering = state.cutCamera.zoom >= 1.25 ? 'pixelated' : 'auto';
  const size = state.squareSize || 96;
  ctx.save();
  ctx.translate(state.cutCamera.panX, state.cutCamera.panY);
  ctx.scale(state.cutCamera.zoom, state.cutCamera.zoom);
  drawSources(ctx, state.cutCamera, { opacity: 0.92, scaled: true });
  ctx.beginPath();
  const viewX = -state.cutCamera.panX / state.cutCamera.zoom;
  const viewY = -state.cutCamera.panY / state.cutCamera.zoom;
  const viewW = cssW / state.cutCamera.zoom;
  const viewH = cssH / state.cutCamera.zoom;
  ctx.rect(viewX, viewY, viewW, viewH);
  ctx.rect(state.cropX, state.cropY, size, size);
  ctx.fillStyle = 'rgba(6, 10, 14, 0.42)';
  ctx.fill('evenodd');
  ctx.strokeStyle = '#e97c34';
  ctx.lineWidth = 2 / state.cutCamera.zoom;
  ctx.strokeRect(state.cropX + 0.5 / state.cutCamera.zoom, state.cropY + 0.5 / state.cutCamera.zoom, size, size);
  ctx.restore();
  els.cropX.value = String(state.cropX);
  els.cropY.value = String(state.cropY);
  els.cutZoom.value = String(Math.round(state.cutCamera.zoom * 100));
  syncScaleFields();
  if (drag.mode === 'crop' || drag.mode === 'pan') {
    if (!renderCut.previewFrame) {
      renderCut.previewFrame = requestAnimationFrame(() => {
        renderCut.previewFrame = 0;
        renderLivePreview();
      });
    }
    return;
  }
  renderLivePreview();
}

function performCut() {
  state.cuts = state.sources.map((src) => {
    const cropped = cropFaceFromSource(src);
    return {
      id: uid(),
      sourceId: src.id,
      name: src.name,
      selected: true,
      url: cropped.url,
      imageData: cropped.imageData
    };
  });
  state.cutsStale = false;
  state.exportReady = false;
  state.heldCutId = null;
  for (const sheet of state.modifySheets) revokeSheet(sheet);
  state.modifySheets = [];
  goToStep(5);
  toast('Cut ' + state.cuts.length + ' face' + (state.cuts.length === 1 ? '' : 's') + '.');
}

function autoFillCreate() {
  const chosen = selectedCuts();
  const needed = Math.max(1, Math.ceil(chosen.length / SLOTS) || 1);
  const sheets = [];
  for (let s = 0; s < needed; s += 1) {
    const slots = emptySlots();
    for (let i = 0; i < SLOTS; i += 1) {
      const cut = chosen[s * SLOTS + i];
      slots[i] = cut ? cut.id : null;
    }
    sheets.push({ id: uid(), slots });
  }
  state.createSheets = sheets;
}

function rgbaPayload(cut) {
  return new Uint8Array(cut.imageData.data);
}

function renderPalette() {
  els.cutPalette.replaceChildren();
  const hd = state.squareSize >= 144;
  for (const cut of state.cuts) {
    const item = document.createElement('div');
    item.className = 'cut-item' + (hd ? ' hd' : '') + (state.heldCutId === cut.id ? ' held' : '');
    item.draggable = true;
    item.dataset.cutId = cut.id;
    const check = document.createElement('input');
    check.type = 'checkbox';
    check.checked = cut.selected;
    check.addEventListener('click', (event) => event.stopPropagation());
    check.addEventListener('change', () => {
      cut.selected = check.checked;
      sub.textContent = cut.selected ? 'Selected' : 'Not used';
    });
    const img = document.createElement('img');
    img.src = cut.url;
    img.alt = cut.name;
    const meta = document.createElement('div');
    meta.className = 'meta';
    const title = document.createElement('strong');
    title.textContent = cut.name;
    const sub = document.createElement('div');
    sub.className = 'muted tiny';
    sub.textContent = cut.selected ? 'Selected' : 'Not used';
    meta.appendChild(title);
    meta.appendChild(sub);
    item.appendChild(check);
    item.appendChild(img);
    item.appendChild(meta);
    item.addEventListener('click', (event) => {
      if (event.target === check) return;
      state.heldCutId = state.heldCutId === cut.id ? null : cut.id;
      renderExport();
    });
    item.addEventListener('dragstart', (event) => {
      drag.cutId = cut.id;
      event.dataTransfer.setData('text/plain', cut.id);
      event.dataTransfer.effectAllowed = 'copyMove';
    });
    item.addEventListener('dragover', (event) => {
      event.preventDefault();
    });
    item.addEventListener('drop', (event) => {
      event.preventDefault();
      const fromId = event.dataTransfer.getData('text/plain') || drag.cutId;
      const fromIndex = state.cuts.findIndex((itemCut) => itemCut.id === fromId);
      const toIndex = state.cuts.findIndex((itemCut) => itemCut.id === cut.id);
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
      const [moved] = state.cuts.splice(fromIndex, 1);
      state.cuts.splice(toIndex, 0, moved);
      renderExport();
    });
    els.cutPalette.appendChild(item);
  }
}

function slotNode(sheet, index, options) {
  const cutId = sheet.slots[index];
  const cut = cutId ? findCut(cutId) : null;
  const slot = document.createElement('div');
  const hd = state.squareSize >= 144;
  slot.className = 'face-slot' + (hd ? ' hd' : '');
  if (cut) slot.classList.add('filled');
  else if (options.originalUrl) slot.classList.add('original');
  const img = document.createElement('img');
  if (cut) img.src = cut.url;
  else if (options.originalUrl) img.src = options.originalUrl;
  if (img.src) slot.appendChild(img);
  const label = document.createElement('span');
  label.className = 'slot-index';
  label.textContent = String(index);
  slot.appendChild(label);
  slot.addEventListener('dragover', (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  });
  slot.addEventListener('drop', (event) => {
    event.preventDefault();
    const id = event.dataTransfer.getData('text/plain') || drag.cutId || state.heldCutId;
    if (!id) return;
    sheet.slots[index] = id;
    state.heldCutId = null;
    renderExport();
  });
  slot.addEventListener('click', () => {
    if (state.heldCutId) {
      sheet.slots[index] = state.heldCutId;
      state.heldCutId = null;
      renderExport();
      return;
    }
    if (sheet.slots[index]) {
      sheet.slots[index] = null;
      renderExport();
    }
  });
  slot.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    sheet.slots[index] = null;
    renderExport();
  });
  return slot;
}

function renderCreateSheets() {
  els.createSheets.replaceChildren();
  if (state.createSheets.length <= 0) {
    state.createSheets.push({ id: uid(), slots: emptySlots() });
  }
  state.createSheets.forEach((sheet, sheetIndex) => {
    const card = document.createElement('article');
    card.className = 'sheet-card';
    const head = document.createElement('div');
    head.className = 'sheet-head';
    const title = document.createElement('strong');
    const count = state.createSheets.length;
    const fileName = count <= 1 ? state.baseName + '.png' : state.baseName + '_' + (sheetIndex + 1) + '.png';
    title.textContent = fileName;
    head.appendChild(title);
    if (state.createSheets.length > 1) {
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Remove file';
      remove.addEventListener('click', () => {
        state.createSheets.splice(sheetIndex, 1);
        renderExport();
      });
      head.appendChild(remove);
    }
    const grid = document.createElement('div');
    grid.className = 'sheet-grid' + (state.squareSize >= 144 ? ' hd' : '');
    for (let i = 0; i < SLOTS; i += 1) {
      grid.appendChild(slotNode(sheet, i, {}));
    }
    card.appendChild(head);
    card.appendChild(grid);
    els.createSheets.appendChild(card);
  });
}

function renderModifySheets() {
  els.modifySheets.replaceChildren();
  state.modifySheets.forEach((sheet, sheetIndex) => {
    const card = document.createElement('article');
    card.className = 'sheet-card';
    const head = document.createElement('div');
    head.className = 'sheet-head';
    const title = document.createElement('strong');
    title.textContent = sheet.name;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => {
      revokeSheet(sheet);
      state.modifySheets.splice(sheetIndex, 1);
      renderExport();
    });
    head.appendChild(title);
    head.appendChild(remove);
    const grid = document.createElement('div');
    grid.className = 'sheet-grid' + (state.squareSize >= 144 ? ' hd' : '');
    for (let i = 0; i < SLOTS; i += 1) {
      grid.appendChild(slotNode(sheet, i, { originalUrl: sheet.slotUrls[i] }));
    }
    card.appendChild(head);
    card.appendChild(grid);
    els.modifySheets.appendChild(card);
  });
}

function renderExport() {
  renderPalette();
  renderCreateSheets();
  renderModifySheets();
}

function renderAll() {
  renderStepper();
  renderPanels();
  renderSourceList();
  renderAlignList();
  if (state.step === 2) renderAlign();
  if (state.step === 4) renderCut();
  if (state.step === 5) renderExport();
}

async function addFaceSheets(filePaths) {
  if (!state.squareSize) {
    toast('Choose a square size before loading Face files.', 'warn');
    return;
  }
  const expected = sheetSize();
  setLoading(true);
  try {
    let added = 0;
    const known = new Set(state.modifySheets.map((item) => item.path.toLowerCase()));
    for (const filePath of filePaths) {
      const key = String(filePath).toLowerCase();
      if (!key.endsWith('.png') || known.has(key)) continue;
      const info = await readPng(filePath);
      if (info.width !== expected.width || info.height !== expected.height) {
        toast(
          '"' + info.name + '" is ' + info.width + '×' + info.height +
          '. A ' + state.squareSize + '×' + state.squareSize + ' Face file must be ' +
          expected.width + '×' + expected.height + '.',
          'danger'
        );
        URL.revokeObjectURL(info.url);
        continue;
      }
      known.add(key);
      state.modifySheets.push({
        id: uid(),
        path: info.path,
        name: info.name,
        width: info.width,
        height: info.height,
        url: info.url,
        img: info.img,
        slotUrls: makeSlotPreviews(info.img, state.squareSize),
        slots: emptySlots()
      });
      added += 1;
    }
    renderExport();
    if (added > 0) toast('Loaded ' + added + ' Face file' + (added === 1 ? '' : 's') + '.');
  } catch (err) {
    toast(err.message || String(err), 'danger');
  } finally {
    setLoading(false);
  }
}

function assignedSlots(sheet) {
  const list = [];
  sheet.slots.forEach((cutId, index) => {
    const cut = cutId ? findCut(cutId) : null;
    if (!cut) return;
    list.push({ index, rgba: rgbaPayload(cut) });
  });
  return list;
}

async function saveCreate(overwrite) {
  const sheets = state.createSheets
    .map((sheet) => ({ slots: assignedSlots(sheet) }))
    .filter((sheet) => sheet.slots.length > 0);
  if (sheets.length <= 0) {
    toast('Place at least one cut face into a slot, or use Auto-fill selected.', 'warn');
    return;
  }
  if (!state.outputFolder) {
    toast('Choose an output folder.', 'warn');
    return;
  }
  const baseName = String(els.baseName.value || '').trim() || 'Faces';
  state.baseName = baseName;
  setLoading(true);
  try {
    const result = await APP.saveCreateSheets({
      directory: state.outputFolder,
      baseName,
      squareSize: state.squareSize,
      sheets,
      overwrite: !!overwrite
    });
    if (!result.ok && result.code === 'exists') {
      setLoading(false);
      const names = (result.paths || []).map((filePath) => filePath.replace(/^.*[\\/]/, ''));
      const choice = await askConfirm({
        type: 'warning',
        title: 'Files already exist',
        message: 'Overwrite existing Face file(s)?',
        detail: names.join('\n'),
        buttons: ['Cancel', 'Overwrite'],
        defaultId: 1,
        cancelId: 0
      });
      if (choice === 1) {
        await saveCreate(true);
      }
      return;
    }
    if (!result.ok || !result.paths || result.paths.length <= 0) {
      throw new Error('Could not create Face file(s).');
    }
    toast('Created ' + result.paths.length + ' Face file' + (result.paths.length === 1 ? '' : 's') + '.');
    if (result.paths[0] && APP.showItemInFolder) {
      await APP.showItemInFolder(result.paths[0]);
    }
  } catch (err) {
    toast(err.message || String(err), 'danger');
  } finally {
    setLoading(false);
  }
}

async function saveModify(saveAs) {
  const used = state.modifySheets.filter((sheet) => assignedSlots(sheet).length > 0);
  if (used.length <= 0) {
    toast('Assign at least one cut face to a slot in an existing Face file.', 'warn');
    return;
  }

  let sheets = used.map((sheet) => ({
    path: sheet.path,
    outputPath: sheet.path,
    slots: assignedSlots(sheet)
  }));

  if (saveAs) {
    if (used.length === 1) {
      const picked = await APP.pickSavePng({
        title: 'Save modified Face file as',
        defaultPath: used[0].path
      });
      if (!picked) return;
      sheets[0].outputPath = picked;
    } else {
      const folder = await APP.pickDirectory({
        title: 'Choose folder for modified Face copies',
        defaultPath: dirName(used[0].path)
      });
      if (!folder) return;
      sheets = used.map((sheet) => ({
        path: sheet.path,
        outputPath: joinPath(folder, sheet.name),
        slots: assignedSlots(sheet)
      }));
    }
  } else {
    const choice = await askConfirm({
      type: 'warning',
      title: 'Overwrite Face files',
      message: 'Replace the assigned squares in the original Face file(s)?',
      detail: used.map((sheet) => sheet.name).join('\n'),
      buttons: ['Cancel', 'Save'],
      defaultId: 1,
      cancelId: 0
    });
    if (choice !== 1) return;
  }

  setLoading(true);
  try {
    let result = await APP.saveModifySheets({
      squareSize: state.squareSize,
      sheets,
      overwrite: !saveAs
    });
    if (!result.ok && result.code === 'exists') {
      setLoading(false);
      const choice = await askConfirm({
        type: 'warning',
        title: 'Files already exist',
        message: 'Overwrite existing file(s)?',
        detail: (result.paths || []).map((filePath) => String(filePath).replace(/^.*[\\/]/, '')).join('\n'),
        buttons: ['Cancel', 'Overwrite'],
        defaultId: 1,
        cancelId: 0
      });
      if (choice !== 1) return;
      setLoading(true);
      result = await APP.saveModifySheets({
        squareSize: state.squareSize,
        sheets,
        overwrite: true
      });
    }
    if (!result.ok) {
      throw new Error('Could not save Face file(s).');
    }
    toast('Saved ' + result.paths.length + ' Face file' + (result.paths.length === 1 ? '' : 's') + '.');
    if (result.paths[0] && APP.showItemInFolder) {
      await APP.showItemInFolder(result.paths[0]);
    }
  } catch (err) {
    toast(err.message || String(err), 'danger');
  } finally {
    setLoading(false);
  }
}

function nudgeSelected(dx, dy) {
  const selected = selectedSource();
  if (!selected) return;
  selected.offsetX += dx;
  selected.offsetY += dy;
  invalidateCuts();
  renderAlignList();
  renderAlign();
}

function nudgeCrop(dx, dy) {
  state.cropX += dx;
  state.cropY += dy;
  invalidateCuts();
  renderCut();
}

function hitSource(world, src) {
  return world.x >= src.offsetX && world.x < src.offsetX + src.width &&
    world.y >= src.offsetY && world.y < src.offsetY + src.height;
}

function onCanvasPointerDown(kind, event) {
  const canvas = kind === 'align' ? els.alignCanvas : els.cutCanvas;
  const camera = kind === 'align' ? state.alignCamera : state.cutCamera;
  const world = worldFromEvent(camera, canvas, event);
  canvas.setPointerCapture(event.pointerId);
  canvas.classList.add('dragging');
  drag.pointerId = event.pointerId;
  if (kind === 'align') {
    const hit = [...state.sources].reverse().find((src) => hitSource(world, src));
    if (hit) {
      state.selectedSourceId = hit.id;
      drag.mode = 'align';
      drag.offsetX = world.x - hit.offsetX;
      drag.offsetY = world.y - hit.offsetY;
      renderAlignList();
    } else {
      drag.mode = 'pan';
      drag.offsetX = event.clientX - camera.panX;
      drag.offsetY = event.clientY - camera.panY;
    }
    return;
  }
  const size = state.squareSize;
  const inside = world.x >= state.cropX && world.x <= state.cropX + size &&
    world.y >= state.cropY && world.y <= state.cropY + size;
  if (inside) {
    drag.mode = 'crop';
    drag.offsetX = world.x - state.cropX;
    drag.offsetY = world.y - state.cropY;
  } else {
    drag.mode = 'pan';
    drag.offsetX = event.clientX - camera.panX;
    drag.offsetY = event.clientY - camera.panY;
  }
}

function onCanvasPointerMove(kind, event) {
  if (drag.pointerId !== event.pointerId) return;
  const canvas = kind === 'align' ? els.alignCanvas : els.cutCanvas;
  const camera = kind === 'align' ? state.alignCamera : state.cutCamera;
  const world = worldFromEvent(camera, canvas, event);
  if (drag.mode === 'align') {
    const selected = selectedSource();
    if (!selected) return;
    selected.offsetX = Math.round(world.x - drag.offsetX);
    selected.offsetY = Math.round(world.y - drag.offsetY);
    invalidateCuts();
    renderAlignList();
    renderAlign();
    return;
  }
  if (drag.mode === 'crop') {
    state.cropX = Math.round(world.x - drag.offsetX);
    state.cropY = Math.round(world.y - drag.offsetY);
    invalidateCuts();
    renderCut();
    return;
  }
  if (drag.mode === 'pan') {
    camera.panX = event.clientX - drag.offsetX;
    camera.panY = event.clientY - drag.offsetY;
    if (kind === 'align') renderAlign();
    else renderCut();
  }
}

function onCanvasPointerUp(kind, event) {
  if (drag.pointerId !== event.pointerId) return;
  const canvas = kind === 'align' ? els.alignCanvas : els.cutCanvas;
  canvas.classList.remove('dragging');
  drag.pointerId = null;
  drag.mode = '';
}

function onCanvasWheel(kind, event) {
  event.preventDefault();
  if (kind === 'cut' && (event.ctrlKey || event.metaKey)) {
    const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
    setImageScale((state.imageScale || 1) * factor);
    renderCut();
    renderPanels();
    return;
  }
  const canvas = kind === 'align' ? els.alignCanvas : els.cutCanvas;
  const camera = kind === 'align' ? state.alignCamera : state.cutCamera;
  const world = worldFromEvent(camera, canvas, event);
  const next = clamp(camera.zoom * (event.deltaY < 0 ? 1.1 : 1 / 1.1), 0.05, 8);
  camera.panX = world.sx - world.x * next;
  camera.panY = world.sy - world.y * next;
  camera.zoom = next;
  if (kind === 'cut') els.cutZoom.value = String(Math.round(next * 100));
  if (kind === 'align') renderAlign();
  else renderCut();
}

function currentDropMode() {
  if (state.step === 1) return 'source';
  if (state.step === 5 && state.exportMode === 'modify') return 'face';
  return '';
}

function bindEvents() {
  els.stepper.addEventListener('click', (event) => {
    const btn = event.target.closest('.step-btn');
    if (!btn || btn.disabled) return;
    goToStep(Number(btn.getAttribute('data-step')));
  });

  els.btnBack.addEventListener('click', () => goToStep(state.step - 1));
  els.btnNext.addEventListener('click', () => {
    if (state.step === 4) {
      performCut();
      return;
    }
    goToStep(state.step + 1);
  });

  els.btnStartOver.addEventListener('click', async () => {
    const choice = await askConfirm({
      type: 'warning',
      title: 'Start Over',
      message: 'Clear all pictures, cuts, and Face file work?',
      buttons: ['Cancel', 'Start Over'],
      defaultId: 1,
      cancelId: 0
    });
    if (choice === 1) resetState();
  });

  els.btnPickSources.addEventListener('click', async () => {
    const paths = await APP.pickSourcePngs();
    if (paths && paths.length) await addSources(paths);
  });

  els.btnAlignFit.addEventListener('click', () => {
    fitCamera(state.alignCamera, els.alignCanvas, sourceBounds());
    renderAlign();
  });

  els.alignOpacity.addEventListener('input', () => {
    state.alignOpacity = Number(els.alignOpacity.value) / 100;
    renderAlign();
  });

  els.offsetX.addEventListener('change', () => {
    const selected = selectedSource();
    if (!selected) return;
    selected.offsetX = Number(els.offsetX.value) || 0;
    invalidateCuts();
    renderAlign();
    renderAlignList();
  });

  els.offsetY.addEventListener('change', () => {
    const selected = selectedSource();
    if (!selected) return;
    selected.offsetY = Number(els.offsetY.value) || 0;
    invalidateCuts();
    renderAlign();
    renderAlignList();
  });

  els.btnResetOffsets.addEventListener('click', () => {
    for (const src of state.sources) {
      src.offsetX = 0;
      src.offsetY = 0;
    }
    invalidateCuts();
    renderAll();
  });

  document.querySelectorAll('[data-nudge]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const parts = btn.getAttribute('data-nudge').split(',');
      nudgeSelected(Number(parts[0]), Number(parts[1]));
    });
  });

  els.size96.addEventListener('click', () => {
    if (state.squareSize !== 96) {
      state.squareSize = 96;
      state.cropReady = false;
      invalidateCuts();
    }
    renderAll();
  });

  els.size144.addEventListener('click', () => {
    if (state.squareSize !== 144) {
      state.squareSize = 144;
      state.cropReady = false;
      invalidateCuts();
    }
    renderAll();
  });

  els.btnCutFit.addEventListener('click', () => {
    fitCamera(state.cutCamera, els.cutCanvas, scaledSourceBounds());
    els.cutZoom.value = String(Math.round(state.cutCamera.zoom * 100));
    renderCut();
  });

  els.cutZoom.addEventListener('input', () => {
    const rect = els.cutCanvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const worldX = (cx - state.cutCamera.panX) / state.cutCamera.zoom;
    const worldY = (cy - state.cutCamera.panY) / state.cutCamera.zoom;
    const next = clamp(Number(els.cutZoom.value) / 100, 0.05, 8);
    state.cutCamera.zoom = next;
    state.cutCamera.panX = cx - worldX * next;
    state.cutCamera.panY = cy - worldY * next;
    renderCut();
  });

  els.cropX.addEventListener('change', () => {
    state.cropX = Number(els.cropX.value) || 0;
    invalidateCuts();
    renderCut();
  });

  els.cropY.addEventListener('change', () => {
    state.cropY = Number(els.cropY.value) || 0;
    invalidateCuts();
    renderCut();
  });

  els.imageScale.addEventListener('input', () => {
    setImageScale(Number(els.imageScale.value) / 100);
    renderCut();
    renderPanels();
  });

  els.imageScalePct.addEventListener('change', () => {
    setImageScale(Number(els.imageScalePct.value) / 100);
    renderCut();
    renderPanels();
  });

  els.btnScaleDown.addEventListener('click', () => {
    setImageScale((state.imageScale || 1) / 1.1);
    renderCut();
    renderPanels();
  });

  els.btnScaleUp.addEventListener('click', () => {
    setImageScale((state.imageScale || 1) * 1.1);
    renderCut();
    renderPanels();
  });

  els.btnScaleReset.addEventListener('click', () => {
    resetImageScale();
    renderCut();
    renderPanels();
  });

  els.alignCanvas.addEventListener('pointerdown', (event) => onCanvasPointerDown('align', event));
  els.alignCanvas.addEventListener('pointermove', (event) => onCanvasPointerMove('align', event));
  els.alignCanvas.addEventListener('pointerup', (event) => onCanvasPointerUp('align', event));
  els.alignCanvas.addEventListener('pointercancel', (event) => onCanvasPointerUp('align', event));
  els.alignCanvas.addEventListener('wheel', (event) => onCanvasWheel('align', event), { passive: false });

  els.cutCanvas.addEventListener('pointerdown', (event) => onCanvasPointerDown('cut', event));
  els.cutCanvas.addEventListener('pointermove', (event) => onCanvasPointerMove('cut', event));
  els.cutCanvas.addEventListener('pointerup', (event) => onCanvasPointerUp('cut', event));
  els.cutCanvas.addEventListener('pointercancel', (event) => onCanvasPointerUp('cut', event));
  els.cutCanvas.addEventListener('wheel', (event) => onCanvasWheel('cut', event), { passive: false });

  els.btnSelectAllCuts.addEventListener('click', () => {
    for (const cut of state.cuts) cut.selected = true;
    renderExport();
  });

  els.btnSelectNoneCuts.addEventListener('click', () => {
    for (const cut of state.cuts) cut.selected = false;
    renderExport();
  });

  els.modeCreate.addEventListener('click', () => {
    state.exportMode = 'create';
    state.heldCutId = null;
    renderAll();
  });

  els.modeModify.addEventListener('click', () => {
    state.exportMode = 'modify';
    state.heldCutId = null;
    renderAll();
  });

  els.btnPickFolder.addEventListener('click', async () => {
    const folder = await APP.pickDirectory({
      title: 'Choose output folder for new Face files',
      defaultPath: state.outputFolder || undefined
    });
    if (folder) {
      state.outputFolder = folder;
      els.outputFolder.value = folder;
    }
  });

  els.baseName.addEventListener('change', () => {
    state.baseName = String(els.baseName.value || '').trim() || 'Faces';
    renderCreateSheets();
  });

  els.btnAutoFill.addEventListener('click', () => {
    if (selectedCuts().length <= 0) {
      toast('Select at least one cut face first.', 'warn');
      return;
    }
    autoFillCreate();
    renderExport();
  });

  els.btnAddSheet.addEventListener('click', () => {
    state.createSheets.push({ id: uid(), slots: emptySlots() });
    renderExport();
  });

  els.btnCreateSave.addEventListener('click', () => saveCreate(false));

  els.btnPickFaces.addEventListener('click', async () => {
    const paths = await APP.pickFacePngs();
    if (paths && paths.length) await addFaceSheets(paths);
  });

  els.btnModifySave.addEventListener('click', () => saveModify(false));
  els.btnModifySaveAs.addEventListener('click', () => saveModify(true));

  window.addEventListener('keydown', (event) => {
    const typing = /^(INPUT|TEXTAREA)$/.test(event.target.tagName);
    if (typing) return;
    const amount = event.shiftKey ? 10 : 1;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const dx = event.key === 'ArrowLeft' ? -amount : event.key === 'ArrowRight' ? amount : 0;
      const dy = event.key === 'ArrowUp' ? -amount : event.key === 'ArrowDown' ? amount : 0;
      if (state.step === 2) nudgeSelected(dx, dy);
      if (state.step === 4) nudgeCrop(dx, dy);
    }
    if (event.key === 'Escape') {
      state.heldCutId = null;
      if (state.step === 5) renderExport();
    }
  });

  window.addEventListener('resize', () => {
    if (state.step === 2) renderAlign();
    if (state.step === 4) renderCut();
  });

  window.addEventListener('dragenter', (event) => {
    if (!hasFileDrag(event)) return;
    event.preventDefault();
    drag.depth += 1;
    const mode = currentDropMode();
    if (!mode) {
      els.dropOverlayTitle.textContent = 'PNG files detected';
      els.dropOverlayText.textContent = state.step === 5
        ? 'Switch to “Modify existing Face file(s)” to drop Face sheets here.'
        : 'Return to Step 1 to drop pictures to cut.';
    } else if (mode === 'source') {
      els.dropOverlayTitle.textContent = 'Drop PNG pictures';
      els.dropOverlayText.textContent = 'These will be added as pictures to cut faces from.';
    } else {
      els.dropOverlayTitle.textContent = 'Drop Face PNG files';
      els.dropOverlayText.textContent = 'These must match the current square size (384×192 or 576×288).';
    }
    els.dropOverlay.classList.remove('hidden');
  });

  window.addEventListener('dragover', (event) => {
    if (!hasFileDrag(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  });

  window.addEventListener('dragleave', (event) => {
    if (!hasFileDrag(event)) return;
    drag.depth = Math.max(0, drag.depth - 1);
    if (drag.depth <= 0) els.dropOverlay.classList.add('hidden');
  });

  window.addEventListener('drop', async (event) => {
    event.preventDefault();
    drag.depth = 0;
    els.dropOverlay.classList.add('hidden');
    const files = pngFilesFromDrop(event);
    const paths = pngPathsFromDrop(event);
    const mode = currentDropMode();
    if (mode === 'source') {
      if (paths.length) await addSources(paths);
      else if (files.some((file) => /\.png$/i.test(file.name) || file.type === 'image/png')) {
        await addMemorySources(files);
      } else {
        toast('Only .png files are accepted.', 'warn');
      }
      return;
    }
    if (mode === 'face') {
      if (paths.length) await addFaceSheets(paths);
      else toast('Could not read Face file paths. Use Choose Face file(s) instead.', 'warn');
      return;
    }
    toast(state.step === 5
      ? 'Switch to Modify existing Face file(s) to drop Face sheets.'
      : 'Go back to Step 1 to add pictures.', 'warn');
  });

  els.sourceDropZone.addEventListener('dragover', (event) => {
    if (!hasFileDrag(event)) return;
    event.preventDefault();
    els.sourceDropZone.classList.add('dragover');
  });
  els.sourceDropZone.addEventListener('dragleave', () => els.sourceDropZone.classList.remove('dragover'));
  els.modifyDropZone.addEventListener('dragover', (event) => {
    if (!hasFileDrag(event)) return;
    event.preventDefault();
    els.modifyDropZone.classList.add('dragover');
  });
  els.modifyDropZone.addEventListener('dragleave', () => els.modifyDropZone.classList.remove('dragover'));
}

function fillMiniSheets() {
  document.querySelectorAll('.mini-sheet').forEach((sheet) => {
    sheet.replaceChildren();
    for (let i = 0; i < SLOTS; i += 1) {
      sheet.appendChild(document.createElement('span'));
    }
  });
}

function init() {
  fillMiniSheets();
  bindEvents();
  renderAll();
  if (!APP || !APP.isElectron) {
    toast('Start this program with “Face Cutter for RPG Maker - v1.0.bat”.', 'warn');
  }
}

init();

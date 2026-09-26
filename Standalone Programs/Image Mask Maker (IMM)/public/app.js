'use strict';

const APP = window.imm;
const STEPS = ['select', 'align', 'premask', 'draw', 'cut', 'save'];
const STEP_LABELS = {
  select: 'Select',
  align: 'Align',
  premask: 'Pre-Mask (Optional)',
  draw: 'Mask',
  cut: 'Cut (Optional)',
  save: 'Save'
};
const UNDO_LIMIT = 25;

const state = {
  step: 'select',
  sources: [],
  selectedSourceId: '',
  alignOpacity: 0.55,
  alignCamera: { zoom: 1, panX: 0, panY: 0 },
  preCamera: { zoom: 1, panX: 0, panY: 0 },
  drawCamera: { zoom: 1, panX: 0, panY: 0 },
  tool: 'brush',
  color: 'white',
  gray: 128,
  filled: true,
  brush: 16,
  overlayOpacity: 0.45,
  preMaskOpacity: 0.45,
  showRaw: false,
  spaceDown: false,
  outputDir: '',
  cutDir: '',
  preMask: null,
  appliedPreMaskKey: '',
  nextId: 1
};

const history = { undo: [], redo: [] };
const drag = { pointerId: null, mode: '', depth: 0, lastX: null, lastY: null };
const listDrag = { id: '' };

let mask = null;
let view = null;
let originX = 0;
let originY = 0;
let strokeBase = null;
let shapeStart = null;

const els = {
  stepper: document.getElementById('stepper'),
  dropOverlay: document.getElementById('dropOverlay'),
  dropOverlayTitle: document.getElementById('dropOverlayTitle'),
  dropOverlayText: document.getElementById('dropOverlayText'),
  btnStartOver: document.getElementById('btnStartOver'),
  btnPick: document.getElementById('btnPick'),
  sourceList: document.getElementById('sourceList'),
  sourceCount: document.getElementById('sourceCount'),
  alignCanvas: document.getElementById('alignCanvas'),
  alignList: document.getElementById('alignList'),
  alignOpacity: document.getElementById('alignOpacity'),
  alignHint: document.getElementById('alignHint'),
  btnAlignFit: document.getElementById('btnAlignFit'),
  preMaskCanvas: document.getElementById('preMaskCanvas'),
  preMaskHint: document.getElementById('preMaskHint'),
  preMaskName: document.getElementById('preMaskName'),
  preMaskOpacity: document.getElementById('preMaskOpacity'),
  preOffsetX: document.getElementById('preOffsetX'),
  preOffsetY: document.getElementById('preOffsetY'),
  btnPickPreMask: document.getElementById('btnPickPreMask'),
  btnClearPreMask: document.getElementById('btnClearPreMask'),
  btnPreMaskFit: document.getElementById('btnPreMaskFit'),
  btnResetPreMask: document.getElementById('btnResetPreMask'),
  offsetX: document.getElementById('offsetX'),
  offsetY: document.getElementById('offsetY'),
  btnResetOffsets: document.getElementById('btnResetOffsets'),
  drawCanvas: document.getElementById('drawCanvas'),
  btnDrawFit: document.getElementById('btnDrawFit'),
  zoomInput: document.getElementById('zoomInput'),
  brushInput: document.getElementById('brushInput'),
  btnZoomOut: document.getElementById('btnZoomOut'),
  btnZoomIn: document.getElementById('btnZoomIn'),
  btnBrushDown: document.getElementById('btnBrushDown'),
  btnBrushUp: document.getElementById('btnBrushUp'),
  drawReadout: document.getElementById('drawReadout'),
  btnColorWhite: document.getElementById('btnColorWhite'),
  btnColorGray: document.getElementById('btnColorGray'),
  grayLevel: document.getElementById('grayLevel'),
  grayLevelNum: document.getElementById('grayLevelNum'),
  shapeFilled: document.getElementById('shapeFilled'),
  shapeOutline: document.getElementById('shapeOutline'),
  brushSize: document.getElementById('brushSize'),
  brushSizeNum: document.getElementById('brushSizeNum'),
  overlayOpacity: document.getElementById('overlayOpacity'),
  chkRaw: document.getElementById('chkRaw'),
  btnUndo: document.getElementById('btnUndo'),
  btnRedo: document.getElementById('btnRedo'),
  btnClear: document.getElementById('btnClear'),
  cutPreviews: document.getElementById('cutPreviews'),
  cutCount: document.getElementById('cutCount'),
  cutMaskList: document.getElementById('cutMaskList'),
  btnPickCutMasks: document.getElementById('btnPickCutMasks'),
  btnClearCutMasks: document.getElementById('btnClearCutMasks'),
  cutMpName: document.getElementById('cutMpName'),
  cutSfName: document.getElementById('cutSfName'),
  btnSaveCutMp: document.getElementById('btnSaveCutMp'),
  btnSaveCutSf: document.getElementById('btnSaveCutSf'),
  cutMultiDir: document.getElementById('cutMultiDir'),
  cutDirLabel: document.getElementById('cutDirLabel'),
  btnPickCutDir: document.getElementById('btnPickCutDir'),
  btnSkipMask: document.getElementById('btnSkipMask'),
  btnSkipSave: document.getElementById('btnSkipSave'),
  saveIntro: document.getElementById('saveIntro'),
  savePreviews: document.getElementById('savePreviews'),
  saveCount: document.getElementById('saveCount'),
  saveSingle: document.getElementById('saveSingle'),
  saveMulti: document.getElementById('saveMulti'),
  btnSaveOne: document.getElementById('btnSaveOne'),
  saveOneName: document.getElementById('saveOneName'),
  btnPickOutDir: document.getElementById('btnPickOutDir'),
  outDirLabel: document.getElementById('outDirLabel'),
  btnSaveMany: document.getElementById('btnSaveMany'),
  saveNameList: document.getElementById('saveNameList'),
  statusText: document.getElementById('statusText'),
  btnBack: document.getElementById('btnBack'),
  btnNext: document.getElementById('btnNext'),
  toasts: document.getElementById('toasts'),
  loading: document.getElementById('loading')
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function uid() {
  const id = 'p' + state.nextId;
  state.nextId += 1;
  return id;
}

function selectedSource() {
  return state.sources.find((item) => item.id === state.selectedSourceId) || state.sources[0] || null;
}

function dirName(filePath) {
  const norm = String(filePath || '').replace(/\//g, '\\');
  const index = norm.lastIndexOf('\\');
  return index >= 0 ? norm.slice(0, index) : '';
}

function joinPath(folder, name) {
  if (!folder) return name;
  return folder.replace(/[\\/]+$/, '') + '\\' + name;
}

function stripExt(name) {
  return String(name || 'Picture').replace(/\.[^.]+$/, '') || 'Picture';
}

function setLoading(on) {
  els.loading.classList.toggle('hidden', !on);
}

function toast(message, type) {
  const node = document.createElement('div');
  node.className = 'toast ' + (type || 'ok');
  node.textContent = message;
  els.toasts.appendChild(node);
  setTimeout(() => node.remove(), 4600);
}

function typingTarget(event) {
  const tag = event.target && event.target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

function toUint8(bytes) {
  if (bytes instanceof Uint8Array) return bytes;
  if (bytes && bytes.buffer instanceof ArrayBuffer) {
    return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }
  if (bytes && Array.isArray(bytes.data)) return Uint8Array.from(bytes.data);
  return new Uint8Array(bytes || []);
}

function bytesToUrl(bytes, mime) {
  const copy = toUint8(bytes);
  const buffer = copy.buffer.slice(copy.byteOffset, copy.byteOffset + copy.byteLength);
  return URL.createObjectURL(new Blob([buffer], { type: mime || 'image/png' }));
}

function loadHtmlImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not decode the picture.'));
    img.src = url;
  });
}

function hasFileDrag(event) {
  const types = event.dataTransfer && event.dataTransfer.types;
  if (!types) return false;
  return Array.from(types).includes('Files');
}

function isPictureFile(name, mime) {
  const text = String(name || '');
  const type = String(mime || '');
  return /\.(png|webp)$/i.test(text) || type === 'image/png' || type === 'image/webp';
}

function imageExt(name) {
  return /\.webp$/i.test(String(name || '')) ? '.webp' : '.png';
}

function isEditorPictureDrag(event) {
  if (listDrag.id && state.sources.some((src) => src.id === listDrag.id)) return true;
  const transfer = event.dataTransfer;
  if (!transfer) return false;
  let id = '';
  try {
    id = transfer.getData('text/plain') || '';
  } catch (_error) {
    id = '';
  }
  return !!id && state.sources.some((src) => src.id === id);
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
  if (!filePath && file && file.path) filePath = String(file.path);
  return filePath;
}

function sourceBounds() {
  if (state.sources.length <= 0) return { x: 0, y: 0, w: 1, h: 1 };
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

function floorPoint(world) {
  return { x: Math.floor(world.x), y: Math.floor(world.y), sx: world.sx, sy: world.sy };
}

function fitCamera(camera, canvas, bounds) {
  const rect = canvas.getBoundingClientRect();
  const pad = 48;
  const zoom = clamp(
    Math.min((rect.width - pad * 2) / Math.max(1, bounds.w), (rect.height - pad * 2) / Math.max(1, bounds.h)),
    0.05,
    32
  );
  camera.zoom = zoom || 1;
  camera.panX = (rect.width - bounds.w * camera.zoom) / 2 - bounds.x * camera.zoom;
  camera.panY = (rect.height - bounds.h * camera.zoom) / 2 - bounds.y * camera.zoom;
}

function hitSource(world, src) {
  return world.x >= src.offsetX && world.x < src.offsetX + src.width &&
    world.y >= src.offsetY && world.y < src.offsetY + src.height;
}

function maskContext() {
  return mask.getContext('2d', { willReadFrequently: true });
}

function overlayAlpha() {
  return Math.round(clamp(state.overlayOpacity, 0.05, 1) * 255);
}

function rebuildView() {
  if (!mask) return;
  if (!view) view = document.createElement('canvas');
  view.width = mask.width;
  view.height = mask.height;
  const img = maskContext().getImageData(0, 0, mask.width, mask.height);
  blitViewImage(img, 0, 0);
}

function blitViewImage(img, dx, dy) {
  const vctx = view.getContext('2d');
  const out = vctx.createImageData(img.width, img.height);
  const alpha = overlayAlpha();
  for (let i = 0; i < img.data.length; i += 4) {
    const value = img.data[i];
    out.data[i] = value;
    out.data[i + 1] = value;
    out.data[i + 2] = value;
    out.data[i + 3] = value === 0 ? 0 : alpha;
  }
  vctx.putImageData(out, dx, dy);
}

function blitView(x, y, width, height) {
  if (!mask || !view) return;
  const img = maskContext().getImageData(x, y, width, height);
  blitViewImage(img, x, y);
}

function createMask(x, y, width, height) {
  mask = document.createElement('canvas');
  mask.width = Math.max(1, width);
  mask.height = Math.max(1, height);
  originX = x;
  originY = y;
  const ctx = maskContext();
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, mask.width, mask.height);
  view = document.createElement('canvas');
  view.width = mask.width;
  view.height = mask.height;
  rebuildView();
}

function ensureCover(minX, minY, maxX, maxY) {
  if (maxX < minX || maxY < minY) return;
  if (!mask) {
    createMask(minX, minY, maxX - minX + 1, maxY - minY + 1);
    return;
  }
  const left = Math.min(originX, minX);
  const top = Math.min(originY, minY);
  const right = Math.max(originX + mask.width - 1, maxX);
  const bottom = Math.max(originY + mask.height - 1, maxY);
  const newW = right - left + 1;
  const newH = bottom - top + 1;
  if (left === originX && top === originY && newW === mask.width && newH === mask.height) return;
  const next = document.createElement('canvas');
  next.width = newW;
  next.height = newH;
  const ctx = next.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, newW, newH);
  ctx.drawImage(mask, originX - left, originY - top);
  mask = next;
  originX = left;
  originY = top;
  view = document.createElement('canvas');
  view.width = newW;
  view.height = newH;
  rebuildView();
}

function initMaskToSources() {
  const bounds = sourceBounds();
  if (!mask) {
    createMask(bounds.x, bounds.y, bounds.w, bounds.h);
    return;
  }
  ensureCover(bounds.x, bounds.y, bounds.x + bounds.w - 1, bounds.y + bounds.h - 1);
}

function snapshotNow() {
  const img = maskContext().getImageData(0, 0, mask.width, mask.height);
  return {
    originX,
    originY,
    width: mask.width,
    height: mask.height,
    data: new Uint8ClampedArray(img.data)
  };
}

function restoreSnapshot(snap) {
  if (!snap) return;
  mask = document.createElement('canvas');
  mask.width = snap.width;
  mask.height = snap.height;
  originX = snap.originX;
  originY = snap.originY;
  const img = new ImageData(new Uint8ClampedArray(snap.data), snap.width, snap.height);
  maskContext().putImageData(img, 0, 0);
  view = document.createElement('canvas');
  view.width = snap.width;
  view.height = snap.height;
  rebuildView();
}

function pushUndo() {
  if (!mask) return;
  history.undo.push(snapshotNow());
  if (history.undo.length > UNDO_LIMIT) history.undo.shift();
  history.redo.length = 0;
  updateHistoryButtons();
}

function undo() {
  if (strokeBase || history.undo.length <= 0 || !mask) return;
  history.redo.push(snapshotNow());
  restoreSnapshot(history.undo.pop());
  updateHistoryButtons();
  renderDraw();
}

function redo() {
  if (strokeBase || history.redo.length <= 0) return;
  history.undo.push(snapshotNow());
  restoreSnapshot(history.redo.pop());
  updateHistoryButtons();
  renderDraw();
}

function updateHistoryButtons() {
  els.btnUndo.disabled = history.undo.length <= 0 || !!strokeBase;
  els.btnRedo.disabled = history.redo.length <= 0 || !!strokeBase;
}

function resetMask() {
  mask = null;
  view = null;
  originX = 0;
  originY = 0;
  strokeBase = null;
  shapeStart = null;
  history.undo.length = 0;
  history.redo.length = 0;
  updateHistoryButtons();
}

function paintValue() {
  if (state.tool === 'erase') return 0;
  if (state.color === 'gray') return clamp(state.gray, 1, 254);
  return 255;
}

function brushRadius(diameter) {
  return (Math.max(1, diameter) - 1) / 2;
}

function setLocal(img, x, y, value) {
  if (x < 0 || y < 0 || x >= img.width || y >= img.height) return;
  const index = (y * img.width + x) * 4;
  img.data[index] = value;
  img.data[index + 1] = value;
  img.data[index + 2] = value;
  img.data[index + 3] = 255;
}

function stampInto(img, worldX, worldY, diameter, value, regionMinX, regionMinY) {
  const rad = brushRadius(diameter);
  const cx = worldX - regionMinX;
  const cy = worldY - regionMinY;
  const r2 = rad * rad + 0.01;
  const x0 = Math.max(0, Math.floor(cx - rad));
  const y0 = Math.max(0, Math.floor(cy - rad));
  const x1 = Math.min(img.width - 1, Math.ceil(cx + rad));
  const y1 = Math.min(img.height - 1, Math.ceil(cy + rad));
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) setLocal(img, x, y, value);
    }
  }
}

function forLine(x0, y0, x1, y1, visit) {
  let x = x0;
  let y = y0;
  const dx = Math.abs(x1 - x0);
  const sx = x0 < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - y0);
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  while (true) {
    visit(x, y);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x += sx; }
    if (e2 <= dx) { err += dx; y += sy; }
  }
}

function editRegion(minX, minY, maxX, maxY, painter) {
  if (maxX < minX || maxY < minY) return;
  ensureCover(minX, minY, maxX, maxY);
  const mx = minX - originX;
  const my = minY - originY;
  const rw = maxX - minX + 1;
  const rh = maxY - minY + 1;
  const ctx = maskContext();
  const img = ctx.getImageData(mx, my, rw, rh);
  painter(img);
  ctx.putImageData(img, mx, my);
  blitView(mx, my, rw, rh);
}

function brushBounds(x0, y0, x1, y1, diameter) {
  const rad = Math.ceil(brushRadius(diameter));
  return {
    minX: Math.min(x0, x1) - rad,
    minY: Math.min(y0, y1) - rad,
    maxX: Math.max(x0, x1) + rad,
    maxY: Math.max(y0, y1) + rad
  };
}

function paintLine(x0, y0, x1, y1, value, diameter) {
  const bounds = brushBounds(x0, y0, x1, y1, diameter);
  editRegion(bounds.minX, bounds.minY, bounds.maxX, bounds.maxY, (img) => {
    forLine(x0, y0, x1, y1, (x, y) => {
      stampInto(img, x, y, diameter, value, bounds.minX, bounds.minY);
    });
  });
}

function paintRect(x0, y0, x1, y1, value, filled, diameter) {
  const minX = Math.min(x0, x1);
  const minY = Math.min(y0, y1);
  const maxX = Math.max(x0, x1);
  const maxY = Math.max(y0, y1);
  if (filled) {
    editRegion(minX, minY, maxX, maxY, (img) => {
      for (let i = 0; i < img.data.length; i += 4) {
        img.data[i] = value;
        img.data[i + 1] = value;
        img.data[i + 2] = value;
        img.data[i + 3] = 255;
      }
    });
    return;
  }
  const rad = Math.ceil(brushRadius(diameter));
  const regionX = minX - rad;
  const regionY = minY - rad;
  editRegion(regionX, regionY, maxX + rad, maxY + rad, (img) => {
    const stamp = (x, y) => stampInto(img, x, y, diameter, value, regionX, regionY);
    forLine(minX, minY, maxX, minY, stamp);
    forLine(maxX, minY, maxX, maxY, stamp);
    forLine(maxX, maxY, minX, maxY, stamp);
    forLine(minX, maxY, minX, minY, stamp);
  });
}

function paintEllipse(x0, y0, x1, y1, value, filled, diameter) {
  const minX = Math.min(x0, x1);
  const minY = Math.min(y0, y1);
  const maxX = Math.max(x0, x1);
  const maxY = Math.max(y0, y1);
  if (minX === maxX && minY === maxY) {
    paintLine(minX, minY, maxX, maxY, value, diameter);
    return;
  }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const rx = Math.max(0.5, (maxX - minX) / 2);
  const ry = Math.max(0.5, (maxY - minY) / 2);
  if (filled) {
    editRegion(minX, minY, maxX, maxY, (img) => {
      for (let y = 0; y < img.height; y += 1) {
        for (let x = 0; x < img.width; x += 1) {
          const nx = ((minX + x) - cx) / rx;
          const ny = ((minY + y) - cy) / ry;
          if (nx * nx + ny * ny <= 1) setLocal(img, x, y, value);
        }
      }
    });
    return;
  }
  const rad = Math.ceil(brushRadius(diameter));
  const regionX = minX - rad;
  const regionY = minY - rad;
  const steps = Math.max(24, Math.ceil(Math.PI * 2 * Math.max(rx, ry)));
  editRegion(regionX, regionY, maxX + rad, maxY + rad, (img) => {
    for (let i = 0; i < steps; i += 1) {
      const t = (i / steps) * Math.PI * 2;
      stampInto(img, Math.round(cx + Math.cos(t) * rx), Math.round(cy + Math.sin(t) * ry), diameter, value, regionX, regionY);
    }
  });
}

function drawShape(from, to) {
  const value = state.tool === 'erase' ? 0 : paintValue();
  if (state.tool === 'line') paintLine(from.x, from.y, to.x, to.y, value, state.brush);
  else if (state.tool === 'rect') paintRect(from.x, from.y, to.x, to.y, value, state.filled, state.brush);
  else if (state.tool === 'ellipse') paintEllipse(from.x, from.y, to.x, to.y, value, state.filled, state.brush);
}

function floodFill(worldX, worldY, value) {
  initMaskToSources();
  const mx = worldX - originX;
  const my = worldY - originY;
  if (mx < 0 || my < 0 || mx >= mask.width || my >= mask.height) return false;
  const ctx = maskContext();
  const img = ctx.getImageData(0, 0, mask.width, mask.height);
  const width = mask.width;
  const height = mask.height;
  const start = img.data[(my * width + mx) * 4];
  if (start === value) return false;
  pushUndo();
  const stack = [mx, my];
  const seen = new Uint8Array(width * height);
  seen[my * width + mx] = 1;
  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    const pixel = (y * width + x) * 4;
    img.data[pixel] = value;
    img.data[pixel + 1] = value;
    img.data[pixel + 2] = value;
    img.data[pixel + 3] = 255;
    const tryPush = (nx, ny) => {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) return;
      const id = ny * width + nx;
      if (seen[id]) return;
      if (img.data[id * 4] !== start) return;
      seen[id] = 1;
      stack.push(nx, ny);
    };
    tryPush(x - 1, y);
    tryPush(x + 1, y);
    tryPush(x, y - 1);
    tryPush(x, y + 1);
  }
  ctx.putImageData(img, 0, 0);
  rebuildView();
  return true;
}

function valueAt(worldX, worldY) {
  if (!mask) return 0;
  const mx = worldX - originX;
  const my = worldY - originY;
  if (mx < 0 || my < 0 || mx >= mask.width || my >= mask.height) return 0;
  return maskContext().getImageData(mx, my, 1, 1).data[0];
}

function canEnter(step) {
  if (step === 'select') return true;
  if (step === 'align') return state.sources.length > 1;
  return state.sources.length >= 1;
}

function nextStepId() {
  if (state.step === 'select') return state.sources.length > 1 ? 'align' : 'premask';
  if (state.step === 'align') return 'premask';
  if (state.step === 'premask') return 'draw';
  if (state.step === 'draw') return 'cut';
  if (state.step === 'cut') return 'save';
  return '';
}

function prevStepId() {
  if (state.step === 'save') return 'cut';
  if (state.step === 'cut') return 'draw';
  if (state.step === 'draw') return 'premask';
  if (state.step === 'premask') return state.sources.length > 1 ? 'align' : 'select';
  if (state.step === 'align') return 'select';
  return '';
}

function goTo(step) {
  if (!canEnter(step)) return;
  if (strokeBase) {
    restoreSnapshot(strokeBase);
    strokeBase = null;
    shapeStart = null;
  }
  state.step = step;
  if (step === 'draw') syncMaskFromPreMask();
  else if (step === 'cut' || step === 'save') initMaskToSources();
  if ((step === 'save' || step === 'cut') && state.sources[0]) {
    const folder = dirName(state.sources[0].path);
    if (step === 'save' && !state.outputDir) state.outputDir = folder;
    if (step === 'cut' && !state.cutDir) state.cutDir = folder;
  }
  renderAll();
  if (step === 'align' || step === 'premask' || step === 'draw') {
    requestAnimationFrame(() => {
      if (state.step !== step) return;
      const canvas = step === 'align' ? els.alignCanvas : (step === 'premask' ? els.preMaskCanvas : els.drawCanvas);
      const camera = step === 'align' ? state.alignCamera : (step === 'premask' ? state.preCamera : state.drawCamera);
      fitCamera(camera, canvas, step === 'premask' ? preMaskBounds() : sourceBounds());
      if (step === 'align') renderAlign();
      else if (step === 'premask') renderPreMask();
      else renderDraw();
    });
  }
}

function statusForStep() {
  if (state.step === 'select') {
    return state.sources.length
      ? state.sources.length + ' picture' + (state.sources.length === 1 ? '' : 's') + ' selected.'
      : 'Select one or more PNG or WebP pictures to begin.';
  }
  if (state.step === 'align') return 'Drag the selected picture. Reorder the Pictures list to change what is drawn on top.';
  if (state.step === 'premask') {
    return state.preMask
      ? 'Drag the pre-mask onto the pictures. Mask opens with this as the drawing.'
      : 'Choose a starting mask, or continue and draw on a blank mask.';
  }
  if (state.step === 'draw') return 'White redraws. Gray softens. Erase paints black. Next opens Cut (Optional), or skip straight to Save.';
  if (state.step === 'cut') return 'White is kept. Gray is a softer edge. Black becomes empty. Originals are not changed.';
  if (state.sources.length <= 1) return 'Choose where to save the mask. The suggested name ends in _Mask.';
  return 'Each picture gets its own mask, shifted by the alignment offset.';
}

function renderStepper() {
  els.stepper.replaceChildren();
  const currentIndex = STEPS.indexOf(state.step);
  STEPS.forEach((id, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'step-btn';
    if (id === state.step) button.classList.add('active');
    const skipped = id === 'align' && state.sources.length < 2;
    if (!skipped && index < currentIndex) button.classList.add('done');
    button.disabled = !canEnter(id);
    if (skipped) button.title = 'Add at least two pictures to align them.';
    const num = document.createElement('span');
    num.className = 'step-num';
    num.textContent = String(index + 1);
    const label = document.createElement('span');
    label.className = 'step-label';
    label.textContent = STEP_LABELS[id];
    button.append(num, label);
    button.addEventListener('click', () => goTo(id));
    els.stepper.appendChild(button);
  });
}

function renderPanels() {
  document.querySelectorAll('.step-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.dataset.step === state.step);
  });
  const next = nextStepId();
  const nextLabels = {
    premask: 'Pre-Mask (Optional)',
    draw: 'Mask step',
    cut: 'Cut (Optional)',
    save: 'Save step'
  };
  els.btnBack.disabled = !prevStepId();
  els.btnNext.disabled = !next || !canEnter(next);
  els.btnNext.textContent = nextLabels[next] || 'Next';
  const showSkipMask = state.step === 'select' || state.step === 'align';
  els.btnSkipMask.classList.toggle('hidden', !showSkipMask);
  els.btnSkipMask.disabled = !canEnter('draw');
  els.btnSkipSave.classList.toggle('hidden', state.step !== 'draw');
  els.btnSkipSave.disabled = !canEnter('save');
  els.statusText.textContent = statusForStep();
}

function fileItem(src, options) {
  const item = document.createElement('li');
  item.className = (options.className || 'file-item') + (options.selected ? ' selected' : '');
  const img = document.createElement('img');
  img.src = src.url;
  img.alt = '';
  img.draggable = false;
  const meta = document.createElement('div');
  const title = document.createElement('strong');
  title.textContent = src.name;
  title.title = src.path || src.name;
  const sub = document.createElement('div');
  sub.className = 'muted tiny';
  sub.textContent = options.subtitle || (src.width + '×' + src.height);
  meta.append(title, sub);
  item.append(img, meta);
  if (options.onClick) item.addEventListener('click', options.onClick);
  if (options.extra) item.appendChild(options.extra);
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
    const item = fileItem(src, {
      className: 'align-item',
      selected: src.id === state.selectedSourceId,
      subtitle: src.width + '×' + src.height + '   offset ' + src.offsetX + ', ' + src.offsetY,
      onClick: () => {
        state.selectedSourceId = src.id;
        renderAll();
      }
    });
    const grip = document.createElement('span');
    grip.className = 'drag-grip';
    grip.textContent = '⋮⋮';
    grip.title = 'Drag to change which picture is on top';
    item.prepend(grip);
    item.draggable = true;
    item.addEventListener('dragstart', (event) => {
      listDrag.id = src.id;
      state.selectedSourceId = src.id;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', src.id);
      els.alignList.querySelectorAll('.align-item.selected').forEach((row) => row.classList.remove('selected'));
      item.classList.add('selected', 'reorder-source');
      els.offsetX.value = String(src.offsetX);
      els.offsetY.value = String(src.offsetY);
      els.alignHint.textContent = 'Moving "' + src.name + '".';
      renderAlign();
    });
    item.addEventListener('dragend', () => {
      if (!listDrag.id) return;
      listDrag.id = '';
      clearAlignDropMarks();
      renderAlign();
    });
    item.addEventListener('dragover', (event) => {
      if (!listDrag.id || listDrag.id === src.id) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      const after = event.clientY > item.getBoundingClientRect().top + item.offsetHeight / 2;
      item.dataset.dropAfter = after ? '1' : '0';
      els.alignList.querySelectorAll('.drop-before, .drop-after').forEach((row) => {
        row.classList.remove('drop-before', 'drop-after');
      });
      item.classList.add(after ? 'drop-after' : 'drop-before');
    });
    item.addEventListener('drop', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const fromId = listDrag.id;
      const after = item.dataset.dropAfter === '1';
      reorderSource(fromId, src.id, after);
    });
    els.alignList.appendChild(item);
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

function clearAlignDropMarks() {
  els.alignList.querySelectorAll('.drop-before, .drop-after, .reorder-source').forEach((row) => {
    row.classList.remove('drop-before', 'drop-after', 'reorder-source');
  });
}

function reorderSource(fromId, toId, after) {
  const from = state.sources.findIndex((item) => item.id === fromId);
  if (from < 0) return;
  const [moved] = state.sources.splice(from, 1);
  let to = state.sources.findIndex((item) => item.id === toId);
  if (to < 0) {
    state.sources.splice(from, 0, moved);
    renderAlignList();
    return;
  }
  if (after) to += 1;
  state.sources.splice(to, 0, moved);
  renderAlignList();
  renderAlign();
}

function renderAlign() {
  const canvas = els.alignCanvas;
  const { cssW, cssH, dpr } = sizeCanvas(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);
  ctx.imageSmoothingEnabled = state.alignCamera.zoom < 1.25;
  ctx.save();
  ctx.translate(state.alignCamera.panX, state.alignCamera.panY);
  ctx.scale(state.alignCamera.zoom, state.alignCamera.zoom);
  for (const src of state.sources) {
    ctx.globalAlpha = src.id === state.selectedSourceId ? 1 : state.alignOpacity;
    ctx.drawImage(src.img, src.offsetX, src.offsetY);
  }
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1 / state.alignCamera.zoom;
  for (const src of state.sources) {
    ctx.strokeStyle = src.id === state.selectedSourceId ? 'rgba(243, 163, 94, 0.95)' : 'rgba(158, 184, 204, 0.45)';
    ctx.strokeRect(src.offsetX, src.offsetY, src.width, src.height);
  }
  ctx.restore();
}

function preMaskBounds() {
  const bounds = sourceBounds();
  const pre = state.preMask;
  if (!pre) return bounds;
  const minX = Math.min(bounds.x, pre.offsetX);
  const minY = Math.min(bounds.y, pre.offsetY);
  const maxX = Math.max(bounds.x + bounds.w, pre.offsetX + pre.width);
  const maxY = Math.max(bounds.y + bounds.h, pre.offsetY + pre.height);
  return { x: minX, y: minY, w: Math.max(1, maxX - minX), h: Math.max(1, maxY - minY) };
}

function preMaskKey() {
  const pre = state.preMask;
  if (!pre) return '';
  return [pre.path, pre.offsetX, pre.offsetY, pre.width, pre.height].join('|');
}

function preMaskTint(img) {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < image.data.length; i += 4) {
    const covered = image.data[i + 3] === 0
      ? 0
      : Math.round(Math.max(image.data[i], image.data[i + 1], image.data[i + 2]) * (image.data[i + 3] / 255));
    image.data[i] = covered;
    image.data[i + 1] = covered;
    image.data[i + 2] = covered;
    image.data[i + 3] = covered === 0 ? 0 : 255;
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

function renderPreMask() {
  const pre = state.preMask;
  els.preMaskName.textContent = pre
    ? pre.name + '   ' + pre.width + '×' + pre.height
    : 'No mask loaded';
  els.preOffsetX.disabled = !pre;
  els.preOffsetY.disabled = !pre;
  els.preOffsetX.value = pre ? String(pre.offsetX) : '0';
  els.preOffsetY.value = pre ? String(pre.offsetY) : '0';
  els.preMaskHint.textContent = pre
    ? 'Moving "' + pre.name + '".'
    : 'Choose a mask file, then drag it into place.';
  if (document.activeElement !== els.preMaskOpacity) {
    els.preMaskOpacity.value = String(Math.round(state.preMaskOpacity * 100));
  }
  const canvas = els.preMaskCanvas;
  const { cssW, cssH, dpr } = sizeCanvas(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);
  ctx.imageSmoothingEnabled = state.preCamera.zoom < 1.25;
  ctx.save();
  ctx.translate(state.preCamera.panX, state.preCamera.panY);
  ctx.scale(state.preCamera.zoom, state.preCamera.zoom);
  for (const src of state.sources) ctx.drawImage(src.img, src.offsetX, src.offsetY);
  if (pre && pre.tint) {
    ctx.globalAlpha = state.preMaskOpacity;
    ctx.drawImage(pre.tint, pre.offsetX, pre.offsetY);
    ctx.globalAlpha = 1;
  }
  ctx.lineWidth = 1 / Math.max(0.05, state.preCamera.zoom);
  ctx.strokeStyle = 'rgba(158, 184, 204, 0.45)';
  for (const src of state.sources) ctx.strokeRect(src.offsetX, src.offsetY, src.width, src.height);
  if (pre) {
    ctx.strokeStyle = 'rgba(243, 163, 94, 0.95)';
    ctx.strokeRect(pre.offsetX, pre.offsetY, pre.width, pre.height);
  }
  ctx.restore();
}

function syncMaskFromPreMask() {
  const key = preMaskKey();
  if (key && key !== state.appliedPreMaskKey) {
    applyPreMask();
    toast('The mask drawing now starts from the pre-mask.');
    return;
  }
  initMaskToSources();
}

function applyPreMask() {
  const bounds = sourceBounds();
  createMask(bounds.x, bounds.y, bounds.w, bounds.h);
  history.undo.length = 0;
  history.redo.length = 0;
  const pre = state.preMask;
  if (!pre) {
    state.appliedPreMaskKey = '';
    updateHistoryButtons();
    return;
  }
  const sample = document.createElement('canvas');
  sample.width = pre.width;
  sample.height = pre.height;
  const sampleCtx = sample.getContext('2d', { willReadFrequently: true });
  sampleCtx.drawImage(pre.img, 0, 0);
  const src = sampleCtx.getImageData(0, 0, pre.width, pre.height).data;
  const dst = maskContext().getImageData(0, 0, mask.width, mask.height);
  for (let y = 0; y < pre.height; y += 1) {
    for (let x = 0; x < pre.width; x += 1) {
      const mx = pre.offsetX + x - originX;
      const my = pre.offsetY + y - originY;
      if (mx < 0 || my < 0 || mx >= mask.width || my >= mask.height) continue;
      const si = (y * pre.width + x) * 4;
      const alpha = src[si + 3];
      const value = alpha === 0
        ? 0
        : Math.round(Math.max(src[si], src[si + 1], src[si + 2]) * (alpha / 255));
      const di = (my * mask.width + mx) * 4;
      dst.data[di] = value;
      dst.data[di + 1] = value;
      dst.data[di + 2] = value;
      dst.data[di + 3] = 255;
    }
  }
  maskContext().putImageData(dst, 0, 0);
  rebuildView();
  state.appliedPreMaskKey = preMaskKey();
  updateHistoryButtons();
}

function renderDraw() {
  const canvas = els.drawCanvas;
  const { cssW, cssH, dpr } = sizeCanvas(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);
  ctx.imageSmoothingEnabled = false;
  canvas.classList.toggle('tool-pan', state.tool === 'pan' || state.spaceDown);
  canvas.classList.toggle('tool-draw', state.tool !== 'pan' && !state.spaceDown);
  ctx.save();
  ctx.translate(state.drawCamera.panX, state.drawCamera.panY);
  ctx.scale(state.drawCamera.zoom, state.drawCamera.zoom);
  if (!state.showRaw) {
    for (const src of state.sources) ctx.drawImage(src.img, src.offsetX, src.offsetY);
    if (view) ctx.drawImage(view, originX, originY);
  } else if (mask) {
    ctx.drawImage(mask, originX, originY);
  }
  ctx.lineWidth = 1 / Math.max(0.05, state.drawCamera.zoom);
  ctx.strokeStyle = 'rgba(243, 163, 94, 0.75)';
  for (const src of state.sources) ctx.strokeRect(src.offsetX, src.offsetY, src.width, src.height);
  ctx.restore();
  syncMetricFields();
  updateHistoryButtons();
  syncToolButtons();
}

function plannedNames() {
  return plannedSuffixNames('_Mask');
}

function plannedSuffixNames(suffix) {
  const used = new Set();
  return state.sources.map((src) => {
    const base = stripExt(src.name) + suffix;
    let name = base;
    let n = 2;
    while (used.has(name.toLowerCase())) {
      name = base + '_' + n;
      n += 1;
    }
    used.add(name.toLowerCase());
    return name + imageExt(src.name);
  });
}

function syncMetricFields() {
  if (document.activeElement !== els.zoomInput) {
    els.zoomInput.value = String(Math.round(state.drawCamera.zoom * 100));
  }
  if (document.activeElement !== els.brushInput) {
    els.brushInput.value = String(state.brush);
  }
}

function setZoomPercent(percent) {
  const canvas = els.drawCanvas;
  const rect = canvas.getBoundingClientRect();
  const camera = state.drawCamera;
  const next = clamp(Number(percent) / 100, 0.05, 32);
  if (rect.width > 0 && rect.height > 0 && camera.zoom > 0) {
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const worldX = (cx - camera.panX) / camera.zoom;
    const worldY = (cy - camera.panY) / camera.zoom;
    camera.zoom = next;
    camera.panX = cx - worldX * next;
    camera.panY = cy - worldY * next;
  } else {
    camera.zoom = next;
  }
  if (state.step === 'draw') renderDraw();
  else syncMetricFields();
}

function pictureMaskValues(src) {
  if (src.cutMask && src.cutMask.width === src.width && src.cutMask.height === src.height) {
    return src.cutMask.values;
  }
  const rgba = buildMaskRgba(src);
  const values = new Uint8Array(src.width * src.height);
  for (let i = 0; i < values.length; i += 1) values[i] = rgba[i * 4];
  return values;
}

function sourcePixels(src) {
  const canvas = document.createElement('canvas');
  canvas.width = src.width;
  canvas.height = src.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(src.img, 0, 0);
  return ctx.getImageData(0, 0, src.width, src.height).data;
}

function buildCut(src) {
  const values = pictureMaskValues(src);
  const width = src.width;
  const height = src.height;
  const srcData = sourcePixels(src);
  const full = new Uint8Array(width * height * 4);
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      const maskValue = values[i];
      if (maskValue <= 0) continue;
      const s = i * 4;
      const alpha = Math.round(srcData[s + 3] * (maskValue / 255));
      if (alpha <= 0) continue;
      full[s] = srcData[s];
      full[s + 1] = srcData[s + 1];
      full[s + 2] = srcData[s + 2];
      full[s + 3] = alpha;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return null;
  return { width, height, rgba: full, minX, minY, maxX, maxY };
}

function shrinkCut(cut) {
  const cw = cut.maxX - cut.minX + 1;
  const ch = cut.maxY - cut.minY + 1;
  const rgba = new Uint8Array(cw * ch * 4);
  for (let y = 0; y < ch; y += 1) {
    for (let x = 0; x < cw; x += 1) {
      const s = ((cut.minY + y) * cut.width + (cut.minX + x)) * 4;
      const d = (y * cw + x) * 4;
      rgba[d] = cut.rgba[s];
      rgba[d + 1] = cut.rgba[s + 1];
      rgba[d + 2] = cut.rgba[s + 2];
      rgba[d + 3] = cut.rgba[s + 3];
    }
  }
  return { width: cw, height: ch, rgba };
}

function renderCut() {
  const many = state.sources.length > 1;
  const namesMp = plannedSuffixNames('_CutMP');
  const namesSf = plannedSuffixNames('_CutSF');
  const maskNames = plannedNames();
  els.cutCount.textContent = String(state.sources.length);
  els.cutMultiDir.classList.toggle('hidden', !many);
  els.cutDirLabel.textContent = state.cutDir || 'Not chosen';
  els.cutMpName.textContent = many ? 'One _CutMP file per picture.' : (namesMp[0] || '_CutMP.png');
  els.cutSfName.textContent = many ? 'One _CutSF file per picture.' : (namesSf[0] || '_CutSF.png');
  els.btnSaveCutMp.textContent = many ? 'Save Maintain position' : 'Save Maintain position…';
  els.btnSaveCutSf.textContent = many ? 'Save Shrinking Fit' : 'Save Shrinking Fit…';
  els.cutMaskList.replaceChildren();
  els.cutPreviews.replaceChildren();
  state.sources.forEach((src, index) => {
    const li = document.createElement('li');
    li.textContent = src.cutMask
      ? src.name + ' ← ' + src.cutMask.name
      : src.name + ' ← drawn mask (' + maskNames[index] + ')';
    els.cutMaskList.appendChild(li);

    const cut = buildCut(src);
    const card = document.createElement('div');
    card.className = 'preview-card';
    const label = document.createElement('span');
    label.className = 'muted tiny';
    if (!cut) {
      label.textContent = src.name + ' — no white or gray mask yet';
      card.appendChild(label);
    } else {
      const maxW = 640;
      const maxH = 280;
      const scale = Math.min(1, maxW / cut.width, maxH / cut.height);
      const fullCanvas = document.createElement('canvas');
      fullCanvas.width = cut.width;
      fullCanvas.height = cut.height;
      const fullCtx = fullCanvas.getContext('2d');
      fullCtx.putImageData(new ImageData(new Uint8ClampedArray(cut.rgba), cut.width, cut.height), 0, 0);
      const viewCanvas = document.createElement('canvas');
      viewCanvas.width = Math.max(1, Math.round(cut.width * scale));
      viewCanvas.height = Math.max(1, Math.round(cut.height * scale));
      const ctx = viewCanvas.getContext('2d');
      ctx.imageSmoothingEnabled = scale < 1;
      ctx.drawImage(fullCanvas, 0, 0, viewCanvas.width, viewCanvas.height);
      ctx.strokeStyle = '#e97c34';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        cut.minX * scale,
        cut.minY * scale,
        Math.max(1, (cut.maxX - cut.minX + 1) * scale),
        Math.max(1, (cut.maxY - cut.minY + 1) * scale)
      );
      const shrunkW = cut.maxX - cut.minX + 1;
      const shrunkH = cut.maxY - cut.minY + 1;
      label.textContent = namesMp[index] + '  ' + cut.width + '×' + cut.height
        + '    ' + namesSf[index] + '  ' + shrunkW + '×' + shrunkH;
      card.append(viewCanvas, label);
    }
    els.cutPreviews.appendChild(card);
  });
}

function renderSave() {
  const many = state.sources.length > 1;
  els.saveSingle.classList.toggle('hidden', many);
  els.saveMulti.classList.toggle('hidden', !many);
  els.saveCount.textContent = String(state.sources.length);
  els.saveIntro.textContent = many
    ? 'Each file is the shared mask cut into that picture, using its alignment offset. Pixel size matches the picture.'
    : 'The mask matches this picture’s pixel size. White redraws, black keeps, gray softens.';
  const names = plannedNames();
  if (!many && state.sources[0]) els.saveOneName.textContent = names[0];
  els.outDirLabel.textContent = state.outputDir || 'Not chosen';
  els.saveNameList.replaceChildren();
  names.forEach((name) => {
    const li = document.createElement('li');
    li.textContent = name;
    els.saveNameList.appendChild(li);
  });
  els.savePreviews.replaceChildren();
  state.sources.forEach((src, index) => {
    const card = document.createElement('div');
    card.className = 'preview-card';
    const canvas = previewCanvas(src);
    const label = document.createElement('span');
    label.className = 'muted tiny';
    label.textContent = names[index] + '  ·  offset ' + src.offsetX + ', ' + src.offsetY;
    card.append(canvas, label);
    els.savePreviews.appendChild(card);
  });
}

function previewCanvas(src) {
  const maxW = 520;
  const maxH = 220;
  const scale = Math.min(1, maxW / src.width, maxH / src.height);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(src.width * scale));
  canvas.height = Math.max(1, Math.round(src.height * scale));
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = scale < 1;
  ctx.drawImage(src.img, 0, 0, canvas.width, canvas.height);
  if (view) {
    ctx.drawImage(view, src.offsetX - originX, src.offsetY - originY, src.width, src.height, 0, 0, canvas.width, canvas.height);
  }
  return canvas;
}

function renderAll() {
  renderStepper();
  renderPanels();
  renderSourceList();
  if (state.step === 'align') {
    renderAlignList();
    renderAlign();
  }
  if (state.step === 'premask') renderPreMask();
  if (state.step === 'draw') renderDraw();
  if (state.step === 'cut') renderCut();
  if (state.step === 'save') renderSave();
  syncPaintControls();
}

function syncToolButtons() {
  document.querySelectorAll('[data-tool]').forEach((button) => {
    button.classList.toggle('active', button.getAttribute('data-tool') === state.tool);
  });
}

function syncPaintControls() {
  els.btnColorWhite.classList.toggle('active', state.color === 'white');
  els.btnColorGray.classList.toggle('active', state.color === 'gray');
  els.grayLevel.disabled = state.color !== 'gray';
  els.grayLevelNum.disabled = state.color !== 'gray';
  els.grayLevel.value = String(state.gray);
  els.grayLevelNum.value = String(state.gray);
  els.shapeFilled.classList.toggle('active', state.filled);
  els.shapeOutline.classList.toggle('active', !state.filled);
  els.brushSize.value = String(clamp(state.brush, 1, 128));
  els.brushSizeNum.value = String(state.brush);
  els.overlayOpacity.value = String(Math.round(state.overlayOpacity * 100));
  els.chkRaw.checked = state.showRaw;
  syncMetricFields();
}

function setTool(tool) {
  state.tool = tool;
  if (state.step === 'draw') renderDraw();
  else syncToolButtons();
}

function setColor(color) {
  state.color = color;
  syncPaintControls();
}

function setBrush(size) {
  state.brush = clamp(Math.round(Number(size) || 1), 1, 256);
  syncPaintControls();
}

function setGray(value) {
  state.gray = clamp(Math.round(Number(value) || 128), 1, 254);
  syncPaintControls();
}

async function addSources(filePaths) {
  const incoming = [];
  let skipped = 0;
  for (const filePath of filePaths) {
    if (!isPictureFile(filePath)) {
      skipped += 1;
      continue;
    }
    if (state.sources.some((src) => src.path.toLowerCase() === filePath.toLowerCase())) continue;
    incoming.push(filePath);
  }
  if (skipped) toast('Only .png and .webp pictures can be added.', 'warn');
  if (!incoming.length) return;
  setLoading(true);
  try {
    for (const filePath of incoming) {
      const data = await APP.readPng(filePath);
      const url = bytesToUrl(data.bytes, data.mime);
      const img = await loadHtmlImage(url);
      state.sources.push({
        id: uid(),
        path: data.path,
        name: data.name,
        width: img.naturalWidth || data.width,
        height: img.naturalHeight || data.height,
        offsetX: 0,
        offsetY: 0,
        url,
        img
      });
    }
    if (!state.selectedSourceId && state.sources[0]) state.selectedSourceId = state.sources[0].id;
    renderAll();
  } catch (err) {
    toast(err.message || String(err), 'danger');
  } finally {
    setLoading(false);
  }
}

function removeSource(id) {
  const src = state.sources.find((item) => item.id === id);
  if (!src) return;
  if (src.url) URL.revokeObjectURL(src.url);
  state.sources = state.sources.filter((item) => item.id !== id);
  if (state.selectedSourceId === id) state.selectedSourceId = state.sources[0] ? state.sources[0].id : '';
  if (state.sources.length === 0) {
    clearPreMask();
    state.appliedPreMaskKey = '';
    resetMask();
    state.step = 'select';
  } else if (state.step === 'align' && state.sources.length < 2) {
    state.step = 'select';
  }
  renderAll();
}

function resetSession() {
  for (const src of state.sources) {
    if (src.url) URL.revokeObjectURL(src.url);
  }
  state.sources = [];
  state.selectedSourceId = '';
  state.step = 'select';
  state.outputDir = '';
  state.cutDir = '';
  state.alignCamera = { zoom: 1, panX: 0, panY: 0 };
  state.preCamera = { zoom: 1, panX: 0, panY: 0 };
  state.drawCamera = { zoom: 1, panX: 0, panY: 0 };
  clearPreMask();
  state.appliedPreMaskKey = '';
  resetMask();
  renderAll();
}

function clearPreMask() {
  if (state.preMask && state.preMask.url) URL.revokeObjectURL(state.preMask.url);
  state.preMask = null;
}

async function loadPreMask(filePath) {
  if (!isPictureFile(filePath)) {
    toast('Only .png and .webp mask files can be used.', 'warn');
    return;
  }
  setLoading(true);
  try {
    const data = await APP.readPng(filePath);
    const url = bytesToUrl(data.bytes, data.mime);
    const img = await loadHtmlImage(url);
    const previous = state.preMask;
    const anchor = state.sources[0];
    state.preMask = {
      path: data.path,
      name: data.name,
      width: img.naturalWidth || data.width,
      height: img.naturalHeight || data.height,
      offsetX: previous ? previous.offsetX : (anchor ? anchor.offsetX : 0),
      offsetY: previous ? previous.offsetY : (anchor ? anchor.offsetY : 0),
      url,
      img,
      tint: preMaskTint(img)
    };
    if (previous && previous.url) URL.revokeObjectURL(previous.url);
    if (state.step === 'premask') renderAll();
  } catch (err) {
    toast(err.message || String(err), 'danger');
  } finally {
    setLoading(false);
  }
}

function nudgePreMask(dx, dy) {
  if (!state.preMask || state.step !== 'premask') return;
  state.preMask.offsetX += dx;
  state.preMask.offsetY += dy;
  renderPreMask();
}

function hitPreMask(world) {
  const pre = state.preMask;
  return !!pre && world.x >= pre.offsetX && world.y >= pre.offsetY &&
    world.x < pre.offsetX + pre.width && world.y < pre.offsetY + pre.height;
}

function onPreMaskDown(event) {
  if (event.button !== 0 && event.button !== 1) return;
  const canvas = els.preMaskCanvas;
  const world = worldFromEvent(state.preCamera, canvas, event);
  canvas.setPointerCapture(event.pointerId);
  canvas.classList.add('dragging');
  drag.pointerId = event.pointerId;
  if (event.button === 0 && hitPreMask(world)) {
    drag.mode = 'premask';
    drag.grabX = world.x - state.preMask.offsetX;
    drag.grabY = world.y - state.preMask.offsetY;
    return;
  }
  drag.mode = 'prepan';
  drag.grabX = event.clientX - state.preCamera.panX;
  drag.grabY = event.clientY - state.preCamera.panY;
}

function onPreMaskMove(event) {
  if (drag.pointerId !== event.pointerId) return;
  if (drag.mode === 'premask' && state.preMask) {
    const world = worldFromEvent(state.preCamera, els.preMaskCanvas, event);
    state.preMask.offsetX = Math.round(world.x - drag.grabX);
    state.preMask.offsetY = Math.round(world.y - drag.grabY);
    renderPreMask();
    return;
  }
  if (drag.mode === 'prepan') {
    state.preCamera.panX = event.clientX - drag.grabX;
    state.preCamera.panY = event.clientY - drag.grabY;
    renderPreMask();
  }
}

function nudgeSelected(dx, dy) {
  const selected = selectedSource();
  if (!selected || state.step !== 'align') return;
  selected.offsetX += dx;
  selected.offsetY += dy;
  renderAlignList();
  renderAlign();
}

function zoomCamera(camera, canvas, event) {
  const world = worldFromEvent(camera, canvas, event);
  const next = clamp(camera.zoom * (event.deltaY < 0 ? 1.1 : 1 / 1.1), 0.05, 32);
  camera.panX = world.sx - world.x * next;
  camera.panY = world.sy - world.y * next;
  camera.zoom = next;
}

function onAlignDown(event) {
  if (event.button !== 0 && event.button !== 1) return;
  const canvas = els.alignCanvas;
  const world = worldFromEvent(state.alignCamera, canvas, event);
  canvas.setPointerCapture(event.pointerId);
  canvas.classList.add('dragging');
  drag.pointerId = event.pointerId;
  const selected = selectedSource();
  if (event.button === 0 && selected && hitSource(world, selected)) {
    drag.mode = 'align';
    drag.grabX = world.x - selected.offsetX;
    drag.grabY = world.y - selected.offsetY;
    return;
  }
  const hit = event.button === 0
    ? [...state.sources].reverse().find((src) => hitSource(world, src))
    : null;
  if (hit) {
    state.selectedSourceId = hit.id;
    drag.mode = 'align';
    drag.grabX = world.x - hit.offsetX;
    drag.grabY = world.y - hit.offsetY;
    renderAlignList();
  } else {
    drag.mode = 'pan';
    drag.grabX = event.clientX - state.alignCamera.panX;
    drag.grabY = event.clientY - state.alignCamera.panY;
  }
}

function onAlignMove(event) {
  if (drag.pointerId !== event.pointerId) return;
  if (drag.mode === 'align') {
    const selected = selectedSource();
    if (!selected) return;
    const world = worldFromEvent(state.alignCamera, els.alignCanvas, event);
    selected.offsetX = Math.round(world.x - drag.grabX);
    selected.offsetY = Math.round(world.y - drag.grabY);
    renderAlignList();
    renderAlign();
    return;
  }
  if (drag.mode === 'pan') {
    state.alignCamera.panX = event.clientX - drag.grabX;
    state.alignCamera.panY = event.clientY - drag.grabY;
    renderAlign();
  }
}

function endDrag(event, canvas) {
  if (drag.pointerId !== event.pointerId) return;
  canvas.classList.remove('dragging');
  drag.pointerId = null;
  drag.mode = '';
  drag.lastX = null;
  drag.lastY = null;
}

function wantsPan(event) {
  return event.button === 1 || event.button === 2 || state.spaceDown || state.tool === 'pan';
}

function onDrawDown(event) {
  if (event.button !== 0 && event.button !== 1 && event.button !== 2) return;
  els.drawCanvas.focus();
  initMaskToSources();
  const canvas = els.drawCanvas;
  canvas.setPointerCapture(event.pointerId);
  drag.pointerId = event.pointerId;
  if (wantsPan(event)) {
    drag.mode = 'pan';
    canvas.classList.add('dragging');
    drag.grabX = event.clientX - state.drawCamera.panX;
    drag.grabY = event.clientY - state.drawCamera.panY;
    return;
  }
  const point = floorPoint(worldFromEvent(state.drawCamera, canvas, event));
  if (state.tool === 'fill') {
    const changed = floodFill(point.x, point.y, paintValue());
    drag.mode = '';
    if (changed) renderDraw();
    return;
  }
  if (state.tool === 'line' || state.tool === 'rect' || state.tool === 'ellipse') {
    strokeBase = snapshotNow();
    shapeStart = point;
    drag.mode = 'shape';
    drag.lastX = point.x;
    drag.lastY = point.y;
    updateHistoryButtons();
    return;
  }
  pushUndo();
  drag.mode = 'brush';
  drag.lastX = point.x;
  drag.lastY = point.y;
  paintLine(point.x, point.y, point.x, point.y, paintValue(), state.brush);
  renderDraw();
}

function onDrawMove(event) {
  const point = floorPoint(worldFromEvent(state.drawCamera, els.drawCanvas, event));
  els.drawReadout.textContent = 'x ' + point.x + ', y ' + point.y + ' · value ' + valueAt(point.x, point.y);
  if (drag.pointerId !== event.pointerId) return;
  if (drag.mode === 'pan') {
    state.drawCamera.panX = event.clientX - drag.grabX;
    state.drawCamera.panY = event.clientY - drag.grabY;
    renderDraw();
    return;
  }
  if (drag.mode === 'brush') {
    if (point.x === drag.lastX && point.y === drag.lastY) return;
    paintLine(drag.lastX, drag.lastY, point.x, point.y, paintValue(), state.brush);
    drag.lastX = point.x;
    drag.lastY = point.y;
    renderDraw();
    return;
  }
  if (drag.mode === 'shape' && strokeBase && shapeStart) {
    if (point.x === drag.lastX && point.y === drag.lastY) return;
    drag.lastX = point.x;
    drag.lastY = point.y;
    restoreSnapshot(strokeBase);
    drawShape(shapeStart, point);
    renderDraw();
  }
}

function onDrawUp(event) {
  if (drag.pointerId !== event.pointerId) return;
  if (drag.mode === 'shape' && strokeBase && shapeStart) {
    const point = floorPoint(worldFromEvent(state.drawCamera, els.drawCanvas, event));
    restoreSnapshot(strokeBase);
    drawShape(shapeStart, point);
    history.undo.push(strokeBase);
    if (history.undo.length > UNDO_LIMIT) history.undo.shift();
    history.redo.length = 0;
    strokeBase = null;
    shapeStart = null;
  }
  endDrag(event, els.drawCanvas);
  updateHistoryButtons();
  if (state.step === 'draw') renderDraw();
}

function buildMaskRgba(src) {
  const width = src.width;
  const height = src.height;
  const out = new Uint8Array(width * height * 4);
  let srcData = null;
  let maskW = 0;
  let maskH = 0;
  if (mask) {
    srcData = maskContext().getImageData(0, 0, mask.width, mask.height).data;
    maskW = mask.width;
    maskH = mask.height;
  }
  for (let y = 0; y < height; y += 1) {
    const my = y + src.offsetY - originY;
    for (let x = 0; x < width; x += 1) {
      const mx = x + src.offsetX - originX;
      let value = 0;
      if (srcData && mx >= 0 && my >= 0 && mx < maskW && my < maskH) {
        value = srcData[(my * maskW + mx) * 4];
      }
      const index = (y * width + x) * 4;
      out[index] = value;
      out[index + 1] = value;
      out[index + 2] = value;
      out[index + 3] = 255;
    }
  }
  return out;
}

async function confirmOverwrite(paths) {
  const answer = await APP.confirm({
    type: 'warning',
    title: 'Image Mask Maker - v1.0',
    message: 'Replace the existing file' + (paths.length === 1 ? '' : 's') + '?',
    detail: paths.join('\n'),
    buttons: ['Cancel', 'Overwrite'],
    defaultId: 0,
    cancelId: 0
  });
  return answer === 1;
}

async function finishSave(result, noun) {
  if (!result || !result.ok) return;
  const word = noun || 'mask';
  toast('Saved ' + result.paths.length + ' ' + word + (result.paths.length === 1 ? '' : 's') + '.');
  if (result.paths[0]) await APP.showItemInFolder(result.paths[0]);
}

async function saveOne() {
  if (state.sources.length !== 1) return;
  initMaskToSources();
  const src = state.sources[0];
  const suggested = joinPath(dirName(src.path), plannedNames()[0]);
  const filePath = await APP.pickSavePng({
    title: 'Save mask',
    defaultPath: suggested
  });
  if (!filePath) return;
  setLoading(true);
  try {
    const payload = {
      filePath,
      width: src.width,
      height: src.height,
      rgba: buildMaskRgba(src),
      overwrite: false
    };
    let result = await APP.savePngFile(payload);
    if (result && result.code === 'exists') {
      const ok = await confirmOverwrite(result.paths || [filePath]);
      if (!ok) return;
      payload.overwrite = true;
      result = await APP.savePngFile(payload);
    }
    await finishSave(result);
  } catch (err) {
    toast(err.message || String(err), 'danger');
  } finally {
    setLoading(false);
  }
}

async function saveMany() {
  if (state.sources.length < 2) return;
  initMaskToSources();
  if (!state.outputDir) {
    toast('Choose an output folder first.', 'warn');
    return;
  }
  setLoading(true);
  try {
    const names = plannedNames();
    const payload = {
      directory: state.outputDir,
      overwrite: false,
      files: state.sources.map((src, index) => ({
        name: names[index].replace(/\.(png|webp)$/i, ''),
        ext: imageExt(names[index]),
        width: src.width,
        height: src.height,
        rgba: buildMaskRgba(src)
      }))
    };
    let result = await APP.savePngFiles(payload);
    if (result && result.code === 'exists') {
      const ok = await confirmOverwrite(result.paths || []);
      if (!ok) return;
      payload.overwrite = true;
      result = await APP.savePngFiles(payload);
    }
    await finishSave(result);
  } catch (err) {
    toast(err.message || String(err), 'danger');
  } finally {
    setLoading(false);
  }
}

async function decodeMaskValues(bytes, width, height, mime) {
  const url = bytesToUrl(bytes, mime);
  try {
    const img = await loadHtmlImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, width, height).data;
    const values = new Uint8Array(width * height);
    for (let i = 0; i < values.length; i += 1) values[i] = data[i * 4];
    return values;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function loadCutMasks(filePaths) {
  const pictures = filePaths.filter((filePath) => isPictureFile(filePath));
  if (!pictures.length) {
    toast('Only .png and .webp mask files can be loaded.', 'warn');
    return;
  }
  setLoading(true);
  try {
    const expected = plannedNames();
    let loaded = 0;
    for (const filePath of pictures) {
      const data = await APP.readPng(filePath);
      const key = stripExt(data.name).toLowerCase();
      let index = expected.findIndex((name) => stripExt(name).toLowerCase() === key);
      const loose = index < 0 && state.sources.length === 1 && pictures.length === 1;
      if (loose) index = 0;
      if (index < 0) {
        toast(data.name + ' does not match a mask name (' + expected.join(', ') + ').', 'warn');
        continue;
      }
      const src = state.sources[index];
      if (data.width !== src.width || data.height !== src.height) {
        toast(data.name + ' is ' + data.width + '×' + data.height + '. ' + src.name + ' is ' + src.width + '×' + src.height + '.', 'warn');
        continue;
      }
      src.cutMask = {
        name: data.name,
        width: data.width,
        height: data.height,
        values: await decodeMaskValues(data.bytes, data.width, data.height, data.mime)
      };
      loaded += 1;
      if (loose && key !== stripExt(expected[0]).toLowerCase()) {
        toast('Using ' + data.name + ' as the mask for ' + src.name + '.');
      }
    }
    if (loaded) renderAll();
  } catch (err) {
    toast(err.message || String(err), 'danger');
  } finally {
    setLoading(false);
  }
}

async function saveCuts(mode) {
  initMaskToSources();
  const suffix = mode === 'sf' ? '_CutSF' : '_CutMP';
  const title = mode === 'sf' ? 'Save Shrinking Fit' : 'Save Maintain position';
  const names = plannedSuffixNames(suffix);
  const many = state.sources.length > 1;
  const prepared = [];
  const empty = [];
  for (let i = 0; i < state.sources.length; i += 1) {
    const cut = buildCut(state.sources[i]);
    if (!cut) {
      empty.push(state.sources[i].name);
      continue;
    }
    const piece = mode === 'sf' ? shrinkCut(cut) : cut;
    prepared.push({
      name: names[i].replace(/\.(png|webp)$/i, ''),
      ext: imageExt(names[i]),
      displayName: names[i],
      width: piece.width,
      height: piece.height,
      rgba: piece.rgba,
      src: state.sources[i]
    });
  }
  if (empty.length) toast('Nothing to cut from: ' + empty.join(', ') + '.', 'warn');
  if (!prepared.length) return;

  if (!many) {
    const file = prepared[0];
    const filePath = await APP.pickSavePng({
      title,
      defaultPath: joinPath(dirName(file.src.path), file.displayName)
    });
    if (!filePath) return;
    setLoading(true);
    try {
      const payload = {
        filePath,
        width: file.width,
        height: file.height,
        rgba: file.rgba,
        overwrite: false
      };
      let result = await APP.savePngFile(payload);
      if (result && result.code === 'exists') {
        const ok = await confirmOverwrite(result.paths || [filePath]);
        if (!ok) return;
        payload.overwrite = true;
        result = await APP.savePngFile(payload);
      }
      await finishSave(result, 'picture');
    } catch (err) {
      toast(err.message || String(err), 'danger');
    } finally {
      setLoading(false);
    }
    return;
  }

  if (!state.cutDir) {
    toast('Choose an output folder first.', 'warn');
    return;
  }
  setLoading(true);
  try {
    const payload = {
      directory: state.cutDir,
      overwrite: false,
      files: prepared.map((file) => ({
        name: file.name,
        ext: file.ext,
        width: file.width,
        height: file.height,
        rgba: file.rgba
      }))
    };
    let result = await APP.savePngFiles(payload);
    if (result && result.code === 'exists') {
      const ok = await confirmOverwrite(result.paths || []);
      if (!ok) return;
      payload.overwrite = true;
      result = await APP.savePngFiles(payload);
    }
    await finishSave(result, 'picture');
  } catch (err) {
    toast(err.message || String(err), 'danger');
  } finally {
    setLoading(false);
  }
}

function wire() {
  els.btnPick.addEventListener('click', async () => {
    const paths = await APP.pickPngs({ title: 'Select PNG or WebP pictures' });
    if (paths && paths.length) await addSources(paths);
  });

  els.btnStartOver.addEventListener('click', async () => {
    if (!state.sources.length && !mask) return;
    const answer = await APP.confirm({
      title: 'Image Mask Maker - v1.0',
      message: 'Start over?',
      detail: 'Pictures, alignment, the pre-mask, the mask drawing, and any loaded cut masks will be cleared.',
      buttons: ['Cancel', 'Start over'],
      defaultId: 0,
      cancelId: 0
    });
    if (answer === 1) resetSession();
  });

  els.btnBack.addEventListener('click', () => {
    const prev = prevStepId();
    if (prev) goTo(prev);
  });

  els.btnNext.addEventListener('click', () => {
    const next = nextStepId();
    if (next) goTo(next);
  });

  els.btnSkipMask.addEventListener('click', () => goTo('draw'));

  els.btnPickPreMask.addEventListener('click', async () => {
    const paths = await APP.pickPngs({ title: 'Select a pre-mask PNG or WebP' });
    if (paths && paths[0]) {
      if (paths.length > 1) toast('Using the first file as the pre-mask.');
      await loadPreMask(paths[0]);
    }
  });
  els.btnClearPreMask.addEventListener('click', () => {
    clearPreMask();
    if (state.step === 'premask') renderAll();
  });
  els.btnPreMaskFit.addEventListener('click', () => {
    fitCamera(state.preCamera, els.preMaskCanvas, preMaskBounds());
    renderPreMask();
  });
  els.preMaskOpacity.addEventListener('input', () => {
    state.preMaskOpacity = clamp(Number(els.preMaskOpacity.value) / 100, 0.15, 0.9);
    if (state.step === 'premask') renderPreMask();
  });
  els.btnResetPreMask.addEventListener('click', () => {
    if (!state.preMask) return;
    const anchor = state.sources[0];
    state.preMask.offsetX = anchor ? anchor.offsetX : 0;
    state.preMask.offsetY = anchor ? anchor.offsetY : 0;
    renderPreMask();
  });
  els.preOffsetX.addEventListener('change', () => {
    if (!state.preMask) return;
    state.preMask.offsetX = Math.round(Number(els.preOffsetX.value) || 0);
    renderPreMask();
  });
  els.preOffsetY.addEventListener('change', () => {
    if (!state.preMask) return;
    state.preMask.offsetY = Math.round(Number(els.preOffsetY.value) || 0);
    renderPreMask();
  });
  document.querySelectorAll('[data-pre-nudge]').forEach((button) => {
    button.addEventListener('click', () => {
      const parts = button.getAttribute('data-pre-nudge').split(',');
      nudgePreMask(Number(parts[0]), Number(parts[1]));
    });
  });
  els.preMaskCanvas.addEventListener('pointerdown', onPreMaskDown);
  els.preMaskCanvas.addEventListener('pointermove', onPreMaskMove);
  els.preMaskCanvas.addEventListener('pointerup', (event) => endDrag(event, els.preMaskCanvas));
  els.preMaskCanvas.addEventListener('pointercancel', (event) => endDrag(event, els.preMaskCanvas));
  els.preMaskCanvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    zoomCamera(state.preCamera, els.preMaskCanvas, event);
    renderPreMask();
  });
  els.preMaskCanvas.addEventListener('contextmenu', (event) => event.preventDefault());

  els.btnAlignFit.addEventListener('click', () => {
    fitCamera(state.alignCamera, els.alignCanvas, sourceBounds());
    renderAlign();
  });

  els.alignOpacity.addEventListener('input', () => {
    state.alignOpacity = clamp(Number(els.alignOpacity.value) / 100, 0.15, 1);
    renderAlign();
  });

  els.offsetX.addEventListener('change', () => {
    const selected = selectedSource();
    if (!selected) return;
    selected.offsetX = Math.round(Number(els.offsetX.value) || 0);
    renderAlignList();
    renderAlign();
  });

  els.offsetY.addEventListener('change', () => {
    const selected = selectedSource();
    if (!selected) return;
    selected.offsetY = Math.round(Number(els.offsetY.value) || 0);
    renderAlignList();
    renderAlign();
  });

  els.btnResetOffsets.addEventListener('click', () => {
    for (const src of state.sources) {
      src.offsetX = 0;
      src.offsetY = 0;
    }
    renderAlignList();
    renderAlign();
  });

  document.querySelectorAll('[data-nudge]').forEach((button) => {
    button.addEventListener('click', () => {
      const parts = button.getAttribute('data-nudge').split(',');
      nudgeSelected(Number(parts[0]), Number(parts[1]));
    });
  });

  els.alignCanvas.addEventListener('pointerdown', onAlignDown);
  els.alignCanvas.addEventListener('pointermove', onAlignMove);
  els.alignCanvas.addEventListener('pointerup', (event) => endDrag(event, els.alignCanvas));
  els.alignCanvas.addEventListener('pointercancel', (event) => endDrag(event, els.alignCanvas));
  els.alignCanvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    zoomCamera(state.alignCamera, els.alignCanvas, event);
    renderAlign();
  }, { passive: false });
  els.alignCanvas.addEventListener('contextmenu', (event) => event.preventDefault());

  document.querySelectorAll('[data-tool]').forEach((button) => {
    button.addEventListener('click', () => setTool(button.getAttribute('data-tool')));
  });
  els.btnColorWhite.addEventListener('click', () => setColor('white'));
  els.btnColorGray.addEventListener('click', () => setColor('gray'));
  els.grayLevel.addEventListener('input', () => setGray(els.grayLevel.value));
  els.grayLevelNum.addEventListener('change', () => setGray(els.grayLevelNum.value));
  els.shapeFilled.addEventListener('click', () => { state.filled = true; syncPaintControls(); });
  els.shapeOutline.addEventListener('click', () => { state.filled = false; syncPaintControls(); });
  els.brushSize.addEventListener('input', () => setBrush(els.brushSize.value));
  els.brushSizeNum.addEventListener('change', () => setBrush(els.brushSizeNum.value));
  els.overlayOpacity.addEventListener('input', () => {
    state.overlayOpacity = clamp(Number(els.overlayOpacity.value) / 100, 0.15, 0.9);
    if (mask) rebuildView();
    if (state.step === 'draw') renderDraw();
  });
  els.chkRaw.addEventListener('change', () => {
    state.showRaw = els.chkRaw.checked;
    if (state.step === 'draw') renderDraw();
  });
  els.btnUndo.addEventListener('click', undo);
  els.btnRedo.addEventListener('click', redo);
  els.btnClear.addEventListener('click', async () => {
    if (!mask) return;
    const answer = await APP.confirm({
      title: 'Image Mask Maker - v1.0',
      message: 'Clear the mask?',
      detail: 'The drawing becomes black. Pictures and alignment stay. You can undo this.',
      buttons: ['Cancel', 'Clear'],
      defaultId: 0,
      cancelId: 0
    });
    if (answer !== 1) return;
    pushUndo();
    maskContext().fillStyle = '#000000';
    maskContext().fillRect(0, 0, mask.width, mask.height);
    rebuildView();
    renderDraw();
  });
  els.btnDrawFit.addEventListener('click', () => {
    fitCamera(state.drawCamera, els.drawCanvas, sourceBounds());
    renderDraw();
  });

  function commitOnEnter(input, apply) {
    input.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      apply(input.value);
    });
  }
  commitOnEnter(els.zoomInput, (raw) => {
    const text = String(raw).trim().replace('%', '');
    const value = Number(text);
    if (!text || !Number.isFinite(value)) {
      toast('Type a zoom percentage, then press Enter.', 'warn');
      syncMetricFields();
      return;
    }
    setZoomPercent(value);
    els.zoomInput.value = String(Math.round(state.drawCamera.zoom * 100));
    els.zoomInput.blur();
  });
  commitOnEnter(els.brushInput, (raw) => {
    const text = String(raw).trim();
    const value = Number(text);
    if (!text || !Number.isFinite(value)) {
      toast('Type a brush size in pixels, then press Enter.', 'warn');
      syncMetricFields();
      return;
    }
    setBrush(value);
    els.brushInput.value = String(state.brush);
    els.brushInput.blur();
  });
  els.zoomInput.addEventListener('blur', () => syncMetricFields());
  els.brushInput.addEventListener('blur', () => syncMetricFields());
  els.btnZoomOut.addEventListener('click', () => {
    setZoomPercent(Math.round(state.drawCamera.zoom * 100) - 10);
  });
  els.btnZoomIn.addEventListener('click', () => {
    setZoomPercent(Math.round(state.drawCamera.zoom * 100) + 10);
  });
  els.btnBrushDown.addEventListener('click', () => setBrush(state.brush - 1));
  els.btnBrushUp.addEventListener('click', () => setBrush(state.brush + 1));

  els.btnSkipSave.addEventListener('click', () => goTo('save'));
  els.btnPickCutMasks.addEventListener('click', async () => {
    const paths = await APP.pickPngs({ title: 'Select mask PNG or WebP files' });
    if (paths && paths.length) await loadCutMasks(paths);
  });
  els.btnClearCutMasks.addEventListener('click', () => {
    for (const src of state.sources) src.cutMask = null;
    if (state.step === 'cut') renderAll();
  });
  els.btnPickCutDir.addEventListener('click', async () => {
    const folder = await APP.pickDirectory({
      title: 'Select the folder for the cut pictures',
      defaultPath: state.cutDir || (state.sources[0] ? dirName(state.sources[0].path) : '')
    });
    if (!folder) return;
    state.cutDir = folder;
    if (state.step === 'cut') renderCut();
  });
  els.btnSaveCutMp.addEventListener('click', () => saveCuts('mp'));
  els.btnSaveCutSf.addEventListener('click', () => saveCuts('sf'));

  els.drawCanvas.addEventListener('pointerdown', onDrawDown);
  els.drawCanvas.addEventListener('pointermove', onDrawMove);
  els.drawCanvas.addEventListener('pointerup', onDrawUp);
  els.drawCanvas.addEventListener('pointercancel', (event) => {
    if (strokeBase) {
      restoreSnapshot(strokeBase);
      strokeBase = null;
      shapeStart = null;
    }
    endDrag(event, els.drawCanvas);
    renderDraw();
  });
  els.drawCanvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    zoomCamera(state.drawCamera, els.drawCanvas, event);
    renderDraw();
  }, { passive: false });
  els.drawCanvas.addEventListener('contextmenu', (event) => event.preventDefault());

  els.btnSaveOne.addEventListener('click', saveOne);
  els.btnPickOutDir.addEventListener('click', async () => {
    const folder = await APP.pickDirectory({
      title: 'Select the folder for the masks',
      defaultPath: state.outputDir || (state.sources[0] ? dirName(state.sources[0].path) : '')
    });
    if (!folder) return;
    state.outputDir = folder;
    renderSave();
  });
  els.btnSaveMany.addEventListener('click', saveMany);

  window.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !typingTarget(event)) {
      state.spaceDown = true;
      if (state.step === 'draw') els.drawCanvas.classList.add('tool-pan');
    }
    if (typingTarget(event)) return;
    const key = event.key.toLowerCase();
    if ((event.ctrlKey || event.metaKey) && key === 'z') {
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && key === 'y') {
      event.preventDefault();
      redo();
      return;
    }
    if (state.step === 'align' && event.key.startsWith('Arrow')) {
      event.preventDefault();
      const step = event.shiftKey ? 10 : 1;
      if (event.key === 'ArrowLeft') nudgeSelected(-step, 0);
      if (event.key === 'ArrowRight') nudgeSelected(step, 0);
      if (event.key === 'ArrowUp') nudgeSelected(0, -step);
      if (event.key === 'ArrowDown') nudgeSelected(0, step);
      return;
    }
    if (state.step === 'premask' && event.key.startsWith('Arrow')) {
      event.preventDefault();
      const step = event.shiftKey ? 10 : 1;
      if (event.key === 'ArrowLeft') nudgePreMask(-step, 0);
      if (event.key === 'ArrowRight') nudgePreMask(step, 0);
      if (event.key === 'ArrowUp') nudgePreMask(0, -step);
      if (event.key === 'ArrowDown') nudgePreMask(0, step);
      return;
    }
    if (state.step !== 'draw' || event.ctrlKey || event.metaKey || event.altKey) return;
    if (key === 'b') setTool('brush');
    else if (key === 'l') setTool('line');
    else if (key === 'r') setTool('rect');
    else if (key === 'c') setTool('ellipse');
    else if (key === 'f') setTool('fill');
    else if (key === 'e') setTool('erase');
    else if (key === 'p') setTool('pan');
    else if (key === '1') setColor('white');
    else if (key === '2') setColor('gray');
    else if (event.key === '[') setBrush(state.brush - 1);
    else if (event.key === ']') setBrush(state.brush + 1);
  });

  window.addEventListener('keyup', (event) => {
    if (event.code === 'Space') {
      state.spaceDown = false;
      if (state.step === 'draw') renderDraw();
    }
  });

  window.addEventListener('blur', () => {
    state.spaceDown = false;
  });

  window.addEventListener('resize', () => {
    if (state.step === 'align') renderAlign();
    if (state.step === 'premask') renderPreMask();
    if (state.step === 'draw') renderDraw();
  });

  window.addEventListener('dragenter', (event) => {
    if (isEditorPictureDrag(event) || !hasFileDrag(event)) return;
    event.preventDefault();
    drag.depth += 1;
    if (state.step === 'cut') {
      els.dropOverlayTitle.textContent = 'Drop mask PNG or WebP files';
      els.dropOverlayText.textContent = 'Name them like the pictures, with _Mask at the end.';
    } else if (state.step === 'premask') {
      els.dropOverlayTitle.textContent = 'Drop a pre-mask';
      els.dropOverlayText.textContent = 'One PNG or WebP mask. You can move it on this step.';
    } else {
      els.dropOverlayTitle.textContent = 'Drop PNG or WebP pictures';
      els.dropOverlayText.textContent = 'These will be added to the picture list.';
    }
    els.dropOverlay.classList.remove('hidden');
  });
  window.addEventListener('dragover', (event) => {
    if (isEditorPictureDrag(event) || !hasFileDrag(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  });
  window.addEventListener('dragleave', (event) => {
    if (isEditorPictureDrag(event) || !hasFileDrag(event)) return;
    drag.depth = Math.max(0, drag.depth - 1);
    if (drag.depth <= 0) els.dropOverlay.classList.add('hidden');
  });
  window.addEventListener('drop', async (event) => {
    event.preventDefault();
    drag.depth = 0;
    els.dropOverlay.classList.add('hidden');
    if (isEditorPictureDrag(event)) return;
    const files = event.dataTransfer && event.dataTransfer.files ? Array.from(event.dataTransfer.files) : [];
    if (!files.length) return;
    const paths = [];
    let foreignFile = false;
    for (const file of files) {
      const filePath = pathFromDroppedFile(file);
      const name = filePath ? filePath.split(/[/\\]/).pop() : file.name;
      if (!isPictureFile(name, file.type)) {
        foreignFile = true;
        continue;
      }
      if (filePath) paths.push(filePath);
    }
    if (foreignFile) {
      toast('Drop .png or .webp files from a folder. Only PNG and WebP pictures are accepted.', 'warn');
    }
    if (!paths.length) return;
    if (state.step === 'premask') {
      if (paths.length > 1) toast('Using the first file as the pre-mask.');
      await loadPreMask(paths[0]);
    } else if (state.step === 'cut') await loadCutMasks(paths);
    else await addSources(paths);
  });
}

if (!APP) {
  els.statusText.textContent = 'Open this program with Image Mask Maker - v1.0.bat.';
} else {
  wire();
  renderAll();
}

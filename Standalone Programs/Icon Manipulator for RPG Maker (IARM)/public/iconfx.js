'use strict';

const ICONFX = (() => {
  const COLUMNS = 16;
  const ACE = 24;
  const MV = 32;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function defaultSettings() {
    return {
      corners: 'normal',
      cornerSize: 4,
      borderMode: 'outside',
      thickness: 0,
      color: '#ffffff',
      style: 'normal',
      dotGap: 1,
      dash: 3,
      gap: 2,
      multi: false,
      extras: []
    };
  }

  function extraBorder() {
    return {
      relative: 'outside',
      thickness: 0,
      color: '#ffffff',
      style: 'normal',
      dotGap: 1,
      dash: 3,
      gap: 2,
      transparent: false
    };
  }

  function cloneSettings(settings) {
    const base = Object.assign(defaultSettings(), settings || {});
    base.extras = Array.isArray(base.extras)
      ? base.extras.map((item) => Object.assign(extraBorder(), item))
      : [];
    return base;
  }

  function sheetWidth(iconSize) {
    return iconSize * COLUMNS;
  }

  function detectSingleIcon(width, height) {
    if (width === ACE && height === ACE) return ACE;
    if (width === MV && height === MV) return MV;
    return 0;
  }

  function detectIconset(width, height) {
    if (width === sheetWidth(ACE) && height >= ACE && height % ACE === 0) return ACE;
    if (width === sheetWidth(MV) && height >= MV && height % MV === 0) return MV;
    return 0;
  }

  function idToXY(id) {
    return { x: id % COLUMNS, y: Math.floor(id / COLUMNS) };
  }

  function xyToId(x, y) {
    return y * COLUMNS + x;
  }

  function makeCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  function scaleCanvas(source, width, height, smooth) {
    const canvas = makeCanvas(width, height);
    const ctx = canvas.getContext('2d', { alpha: true });
    ctx.imageSmoothingEnabled = !!smooth;
    if (smooth) ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(source, 0, 0, width, height);
    return canvas;
  }

  function fitToIcon(source, size) {
    const canvas = makeCanvas(size, size);
    const ctx = canvas.getContext('2d', { alpha: true });
    ctx.clearRect(0, 0, size, size);
    const srcW = source.naturalWidth || source.width;
    const srcH = source.naturalHeight || source.height;
    if (!srcW || !srcH) return canvas;
    const scale = Math.min(size / srcW, size / srcH);
    const drawW = srcW * scale;
    const drawH = srcH * scale;
    ctx.imageSmoothingEnabled = scale < 0.999;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, (size - drawW) / 2, (size - drawH) / 2, drawW, drawH);
    return canvas;
  }

  function addShapePath(ctx, x, y, w, h, corners, cornerSize) {
    const size = Math.min(w, h);
    ctx.beginPath();
    if (corners === 'round') {
      const r = clamp(Number(cornerSize) || 0, 0, size / 2);
      const right = x + w;
      const bottom = y + h;
      ctx.moveTo(x + r, y);
      ctx.lineTo(right - r, y);
      ctx.quadraticCurveTo(right, y, right, y + r);
      ctx.lineTo(right, bottom - r);
      ctx.quadraticCurveTo(right, bottom, right - r, bottom);
      ctx.lineTo(x + r, bottom);
      ctx.quadraticCurveTo(x, bottom, x, bottom - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      return;
    }
    if (corners === 'sharp') {
      const edge = Math.max(0, Number(cornerSize) || 0);
      const inset = clamp(edge / Math.SQRT2, 0, size / 2);
      const right = x + w;
      const bottom = y + h;
      ctx.moveTo(x + inset, y);
      ctx.lineTo(right - inset, y);
      ctx.lineTo(right, y + inset);
      ctx.lineTo(right, bottom - inset);
      ctx.lineTo(right - inset, bottom);
      ctx.lineTo(x + inset, bottom);
      ctx.lineTo(x, bottom - inset);
      ctx.lineTo(x, y + inset);
      ctx.closePath();
      return;
    }
    ctx.rect(x, y, w, h);
  }

  function applyDash(ctx, style, settings) {
    if (style === 'dotted') {
      ctx.setLineDash([1, Math.max(1, Number(settings.dotGap) || 1)]);
      ctx.lineCap = 'butt';
      return;
    }
    if (style === 'interrupted') {
      ctx.setLineDash([
        Math.max(1, Number(settings.dash) || 1),
        Math.max(1, Number(settings.gap) || 1)
      ]);
      ctx.lineCap = 'butt';
      return;
    }
    ctx.setLineDash([]);
    ctx.lineCap = 'butt';
  }

  function collectRings(settings) {
    const extras = settings.multi && Array.isArray(settings.extras) ? settings.extras : [];
    const outside = extras.filter((item) => item.relative !== 'inside');
    const inside = extras.filter((item) => item.relative === 'inside');
    const main = {
      thickness: Math.max(0, Number(settings.thickness) || 0),
      color: settings.color || '#ffffff',
      style: settings.style || 'normal',
      dotGap: settings.dotGap,
      dash: settings.dash,
      gap: settings.gap,
      transparent: false,
      isMain: true
    };
    return outside.slice().reverse().concat([main], inside);
  }

  function strokeRing(ctx, size, pad, thickness, ring, corners, cornerSize) {
    if (thickness <= 0 || ring.transparent) return;
    const half = thickness / 2;
    const inset = pad + half;
    if (size - inset * 2 <= 0) return;
    ctx.save();
    ctx.strokeStyle = ring.color || '#ffffff';
    ctx.lineWidth = thickness;
    ctx.lineJoin = corners === 'round' ? 'round' : 'miter';
    applyDash(ctx, ring.style, ring);
    addShapePath(ctx, inset, inset, size - inset * 2, size - inset * 2, corners, cornerSize);
    ctx.stroke();
    ctx.restore();
  }

  function renderIcon(source, size, settings) {
    const cfg = cloneSettings(settings);
    const fitted = (source.width === size && source.height === size)
      ? source
      : fitToIcon(source, size);

    const cut = makeCanvas(size, size);
    const cutCtx = cut.getContext('2d', { alpha: true });
    cutCtx.drawImage(fitted, 0, 0);
    cutCtx.globalCompositeOperation = 'destination-in';
    addShapePath(cutCtx, 0, 0, size, size, cfg.corners, cfg.cornerSize);
    cutCtx.fillStyle = '#000';
    cutCtx.fill();
    cutCtx.globalCompositeOperation = 'source-over';

    const rings = collectRings(cfg);
    const out = makeCanvas(size, size);
    const ctx = out.getContext('2d', { alpha: true });

    if (cfg.borderMode === 'inside') {
      ctx.drawImage(cut, 0, 0);
      let pad = 0;
      for (const ring of rings) {
        const thickness = Math.max(0, Number(ring.thickness) || 0);
        strokeRing(ctx, size, pad, thickness, ring, cfg.corners, cfg.cornerSize);
        pad += thickness;
      }
      return out;
    }

    let outer = 0;
    for (const ring of rings) {
      outer += Math.max(0, Number(ring.thickness) || 0);
    }
    const maxOuter = Math.floor((size - 1) / 2);
    if (outer > maxOuter) outer = maxOuter;

    const inner = size - outer * 2;
    if (inner > 0) {
      ctx.imageSmoothingEnabled = inner !== size;
      ctx.drawImage(cut, outer, outer, inner, inner);
    }

    let pad = 0;
    let used = 0;
    for (const ring of rings) {
      const wanted = Math.max(0, Number(ring.thickness) || 0);
      const thickness = Math.min(wanted, Math.max(0, outer - used));
      strokeRing(ctx, size, pad, thickness, ring, cfg.corners, cfg.cornerSize);
      pad += thickness;
      used += thickness;
    }
    return out;
  }

  function canvasPayload(canvas) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true, alpha: true });
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return {
      width: canvas.width,
      height: canvas.height,
      imageData,
      rgba: new Uint8Array(imageData.data),
      url: canvas.toDataURL('image/png')
    };
  }

  function extractCell(source, col, row, iconSize) {
    const canvas = makeCanvas(iconSize, iconSize);
    const ctx = canvas.getContext('2d', { alpha: true });
    ctx.clearRect(0, 0, iconSize, iconSize);
    ctx.drawImage(
      source,
      col * iconSize,
      row * iconSize,
      iconSize,
      iconSize,
      0,
      0,
      iconSize,
      iconSize
    );
    return canvas;
  }

  function clearAndDrawCell(ctx, sheetWidth, iconSize, col, row, iconCanvas) {
    const x = col * iconSize;
    const y = row * iconSize;
    ctx.clearRect(x, y, iconSize, iconSize);
    if (iconCanvas) {
      ctx.drawImage(iconCanvas, x, y, iconSize, iconSize);
    }
  }

  return {
    COLUMNS,
    ACE,
    MV,
    defaultSettings,
    extraBorder,
    cloneSettings,
    sheetWidth,
    detectSingleIcon,
    detectIconset,
    idToXY,
    xyToId,
    makeCanvas,
    scaleCanvas,
    fitToIcon,
    renderIcon,
    canvasPayload,
    extractCell,
    clearAndDrawCell
  };
})();

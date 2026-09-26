'use strict';

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function parsePngBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const png = new PNG();
    png.parse(buffer, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(png);
    });
  });
}

function sanitizeBaseName(name) {
  const trimmed = String(name || 'Mask').trim() || 'Mask';
  const withoutExt = trimmed.replace(/\.(png|webp)$/i, '');
  return withoutExt.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_');
}

function imageExt(ext) {
  return String(ext || '').toLowerCase() === '.webp' ? '.webp' : '.png';
}

function writePngFile(filePath, png) {
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filePath);
    stream.on('finish', resolve);
    stream.on('error', reject);
    png.pack().on('error', reject).pipe(stream);
  });
}

function pngFromRgba(width, height, rgbaBytes) {
  const png = new PNG({
    width: Number(width),
    height: Number(height),
    colorType: 6
  });
  const src = Buffer.isBuffer(rgbaBytes) ? rgbaBytes : Buffer.from(rgbaBytes);
  const expected = png.width * png.height * 4;
  if (src.length < expected) {
    throw new Error('PNG pixel data is too small.');
  }
  src.copy(png.data, 0, 0, expected);
  return png;
}

async function saveRgbaPng(filePath, width, height, rgbaBytes) {
  const resolved = path.resolve(String(filePath || ''));
  if (path.extname(resolved).toLowerCase() !== '.png') {
    throw new Error('Pictures are saved as .png or .webp files.');
  }
  await fs.promises.mkdir(path.dirname(resolved), { recursive: true });
  await writePngFile(resolved, pngFromRgba(width, height, rgbaBytes));
  return resolved;
}

async function saveRgbaImage(filePath, width, height, rgbaBytes) {
  const resolved = path.resolve(String(filePath || ''));
  const ext = path.extname(resolved).toLowerCase();
  if (ext === '.webp') {
    const webp = require('./webp');
    await fs.promises.mkdir(path.dirname(resolved), { recursive: true });
    await fs.promises.writeFile(resolved, await webp.encodeWebpRgba(width, height, rgbaBytes));
    return resolved;
  }
  return saveRgbaPng(resolved, width, height, rgbaBytes);
}

async function saveRgbaPngs(options) {
  const directory = String(options.directory || '');
  const files = Array.isArray(options.files) ? options.files : [];
  if (!directory) {
    throw new Error('No output folder was chosen.');
  }
  if (files.length <= 0) {
    throw new Error('There are no mask files to write.');
  }
  await fs.promises.mkdir(directory, { recursive: true });
  const written = [];
  for (const file of files) {
    const name = sanitizeBaseName(file.name) + imageExt(file.ext);
    const filePath = path.join(directory, name);
    await saveRgbaImage(filePath, file.width, file.height, file.rgba);
    written.push(filePath);
  }
  return written;
}

module.exports = {
  parsePngBuffer,
  sanitizeBaseName,
  imageExt,
  saveRgbaPng,
  saveRgbaImage,
  saveRgbaPngs
};

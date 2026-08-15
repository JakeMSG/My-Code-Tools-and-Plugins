'use strict';

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const SLOTS_PER_SHEET = 8;
const COLUMNS = 4;
const ROWS = 2;

function sheetSizeFor(squareSize) {
  const size = Number(squareSize);
  return {
    width: size * COLUMNS,
    height: size * ROWS
  };
}

function isStandardFaceSheet(width, height, squareSize) {
  const expected = sheetSizeFor(squareSize);
  return Number(width) === expected.width && Number(height) === expected.height;
}

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

async function readPngFile(filePath) {
  const buffer = await fs.promises.readFile(filePath);
  const png = await parsePngBuffer(buffer);
  return png;
}

function createTransparentSheet(squareSize) {
  const { width, height } = sheetSizeFor(squareSize);
  const png = new PNG({
    width,
    height,
    colorType: 6
  });
  png.data.fill(0);
  return png;
}

function slotOrigin(slotIndex, squareSize) {
  const index = Number(slotIndex);
  return {
    x: (index % COLUMNS) * squareSize,
    y: Math.floor(index / COLUMNS) * squareSize
  };
}

function replaceSlot(png, squareSize, slotIndex, rgbaBytes) {
  const size = Number(squareSize);
  const origin = slotOrigin(slotIndex, size);
  const src = Buffer.isBuffer(rgbaBytes) ? rgbaBytes : Buffer.from(rgbaBytes);
  const expectedLength = size * size * 4;

  if (src.length < expectedLength) {
    throw new Error(`Face pixel data is too small for a ${size}x${size} square.`);
  }

  for (let y = 0; y < size; y += 1) {
    const srcStart = y * size * 4;
    const dstStart = ((origin.y + y) * png.width + origin.x) * 4;
    src.copy(png.data, dstStart, srcStart, srcStart + size * 4);
  }
}

function writePngFile(filePath, png) {
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filePath);
    stream.on('finish', resolve);
    stream.on('error', reject);
    png.pack().on('error', reject).pipe(stream);
  });
}

function sanitizeBaseName(name) {
  const trimmed = String(name || 'Faces').trim() || 'Faces';
  const withoutExt = trimmed.replace(/\.png$/i, '');
  return withoutExt.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_');
}

function fileNameForSheet(baseName, sheetIndex, sheetCount) {
  const safe = sanitizeBaseName(baseName);
  if (sheetCount <= 1) {
    return `${safe}.png`;
  }
  return `${safe}_${sheetIndex + 1}.png`;
}

async function createSheets(options) {
  const squareSize = Number(options.squareSize);
  const directory = String(options.directory || '');
  const baseName = sanitizeBaseName(options.baseName);
  const sheets = Array.isArray(options.sheets) ? options.sheets : [];

  if (!directory) {
    throw new Error('No output folder was chosen.');
  }
  if (squareSize !== 96 && squareSize !== 144) {
    throw new Error('Square size must be 96 or 144.');
  }
  if (sheets.length <= 0) {
    throw new Error('There are no Face files to create.');
  }

  await fs.promises.mkdir(directory, { recursive: true });

  const written = [];
  for (let i = 0; i < sheets.length; i += 1) {
    const png = createTransparentSheet(squareSize);
    const slots = Array.isArray(sheets[i].slots) ? sheets[i].slots : [];

    for (const slot of slots) {
      if (!slot || slot.rgba == null) continue;
      const index = Number(slot.index);
      if (index < 0 || index >= SLOTS_PER_SHEET) continue;
      replaceSlot(png, squareSize, index, slot.rgba);
    }

    const filePath = path.join(directory, fileNameForSheet(baseName, i, sheets.length));
    await writePngFile(filePath, png);
    written.push(filePath);
  }

  return written;
}

async function modifySheets(options) {
  const squareSize = Number(options.squareSize);
  const sheets = Array.isArray(options.sheets) ? options.sheets : [];

  if (squareSize !== 96 && squareSize !== 144) {
    throw new Error('Square size must be 96 or 144.');
  }
  if (sheets.length <= 0) {
    throw new Error('There are no Face files to modify.');
  }

  const expected = sheetSizeFor(squareSize);
  const written = [];

  for (const sheet of sheets) {
    const sourcePath = String(sheet.path || '');
    const outputPath = String(sheet.outputPath || sourcePath);
    if (!sourcePath) {
      throw new Error('A Face file path is missing.');
    }

    const png = await readPngFile(sourcePath);
    if (!isStandardFaceSheet(png.width, png.height, squareSize)) {
      throw new Error(
        `"${path.basename(sourcePath)}" is ${png.width}x${png.height}, but a ${squareSize}x${squareSize} Face file must be ${expected.width}x${expected.height}.`
      );
    }

    const slots = Array.isArray(sheet.slots) ? sheet.slots : [];
    for (const slot of slots) {
      if (!slot || slot.rgba == null) continue;
      const index = Number(slot.index);
      if (index < 0 || index >= SLOTS_PER_SHEET) continue;
      replaceSlot(png, squareSize, index, slot.rgba);
    }

    await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
    await writePngFile(outputPath, png);
    written.push(outputPath);
  }

  return written;
}

module.exports = {
  SLOTS_PER_SHEET,
  COLUMNS,
  ROWS,
  sheetSizeFor,
  isStandardFaceSheet,
  parsePngBuffer,
  readPngFile,
  createTransparentSheet,
  replaceSlot,
  writePngFile,
  sanitizeBaseName,
  fileNameForSheet,
  createSheets,
  modifySheets
};

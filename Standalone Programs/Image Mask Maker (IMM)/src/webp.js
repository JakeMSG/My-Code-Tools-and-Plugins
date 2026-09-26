'use strict';

const fs = require('fs');
const path = require('path');

const WEBP_OPTIONS = {
  quality: 100,
  target_size: 0,
  target_PSNR: 0,
  method: 4,
  sns_strength: 50,
  filter_strength: 60,
  filter_sharpness: 0,
  filter_type: 1,
  partitions: 0,
  segments: 4,
  pass: 1,
  show_compressed: 0,
  preprocessing: 0,
  autofilter: 0,
  partition_limit: 0,
  alpha_compression: 1,
  alpha_filtering: 1,
  alpha_quality: 100,
  lossless: 1,
  exact: 1,
  image_hint: 0,
  emulate_jpeg_size: 0,
  thread_level: 0,
  low_memory: 0,
  near_lossless: 100,
  use_delta_palette: 0,
  use_sharp_yuv: 0
};

let encoderPromise = null;

function readWebpSize(buffer) {
  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  if (buf.length < 16 || buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error('That file is not a WebP picture.');
  }
  let offset = 12;
  let vp8 = -1;
  let vp8l = -1;
  let vp8x = -1;
  while (offset + 8 <= buf.length) {
    const id = buf.toString('ascii', offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    const data = offset + 8;
    if (data + size > buf.length) break;
    if (id === 'VP8X' && size >= 10) vp8x = data;
    if (id === 'VP8 ' && size >= 10) vp8 = data;
    if (id === 'VP8L' && size >= 5) vp8l = data;
    offset = data + size + (size & 1);
  }
  if (vp8x >= 0) {
    return {
      width: 1 + (buf[vp8x + 4] | (buf[vp8x + 5] << 8) | (buf[vp8x + 6] << 16)),
      height: 1 + (buf[vp8x + 7] | (buf[vp8x + 8] << 8) | (buf[vp8x + 9] << 16))
    };
  }
  if (vp8l >= 0) {
    if (buf[vp8l] !== 0x2f) throw new Error('That WebP picture could not be read.');
    const bits = buf.readUInt32LE(vp8l + 1);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1
    };
  }
  if (vp8 >= 0) {
    const limit = Math.min(buf.length - 7, vp8 + 32);
    for (let i = vp8; i < limit; i += 1) {
      if (buf[i] === 0x9d && buf[i + 1] === 0x01 && buf[i + 2] === 0x2a) {
        return {
          width: buf.readUInt16LE(i + 3) & 0x3fff,
          height: buf.readUInt16LE(i + 5) & 0x3fff
        };
      }
    }
  }
  throw new Error('That WebP picture could not be read.');
}

async function encoder() {
  if (!encoderPromise) {
    encoderPromise = (async () => {
      const pkgJson = require.resolve('@jsquash/webp/package.json');
      const wasmPath = path.join(path.dirname(pkgJson), 'codec', 'enc', 'webp_enc.wasm');
      const wasmBinary = await fs.promises.readFile(wasmPath);
      const imported = await import('@jsquash/webp/codec/enc/webp_enc.js');
      return imported.default({ noInitialRun: true, wasmBinary });
    })();
  }
  return encoderPromise;
}

async function encodeWebpRgba(width, height, rgbaBytes) {
  const w = Number(width);
  const h = Number(height);
  const src = Buffer.isBuffer(rgbaBytes) ? rgbaBytes : Buffer.from(rgbaBytes);
  const expected = w * h * 4;
  if (!w || !h || src.length < expected) {
    throw new Error('WebP pixel data is too small.');
  }
  const pixels = new Uint8Array(expected);
  src.copy(pixels, 0, 0, expected);
  const module = await encoder();
  const result = module.encode(pixels, w, h, WEBP_OPTIONS);
  if (!result) throw new Error('Could not write the WebP picture.');
  if (Buffer.isBuffer(result)) return result;
  if (result instanceof ArrayBuffer) return Buffer.from(result);
  if (ArrayBuffer.isView(result)) {
    return Buffer.from(result.buffer, result.byteOffset, result.byteLength);
  }
  throw new Error('Could not write the WebP picture.');
}

module.exports = {
  readWebpSize,
  encodeWebpRgba
};

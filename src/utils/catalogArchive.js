import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { parseAndValidateExcelFile } from './excelManager.js';

const MB = 1024 * 1024;
const mediaFields = ['photo1', 'photo2', 'photo3', 'drawingUrl', 'boxUrl'];
const mimeTypes = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif' };
const mediaPrefix = 'https://catalog-import.invalid/';
const normalizePath = path => path.replace(/\\/g, '/').normalize('NFC').toLowerCase();
const basename = path => path.split('/').pop();

function matchesImageType(type, bytes) {
  const tag = (offset, length) => String.fromCharCode(...bytes.slice(offset, offset + length));
  if (type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === 'image/png') return bytes[0] === 0x89 && tag(1, 7) === 'PNG\r\n\x1a\n';
  if (type === 'image/webp') return tag(0, 4) === 'RIFF' && tag(8, 4) === 'WEBP';
  return tag(4, 4) === 'ftyp' && ['avif', 'avis'].includes(tag(8, 4));
}

function readEntry(entry, limit) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    const stream = entry.internalStream('uint8array');
    stream.on('data', chunk => {
      size += chunk.length;
      if (size > limit) {
        stream.pause();
        reject(new Error(`Превышен допустимый размер файла «${entry.name}».`));
        return;
      }
      chunks.push(chunk);
    }).on('error', reject).on('end', () => resolve(chunks)).resume();
  });
}

function readKztPrices(workbook) {
  const sheet = workbook.Sheets['Цены и поставка'];
  const prices = new Map();
  if (!sheet) return prices;
  const [headers = [], ...rows] = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false });
  const skuCol = headers.findIndex(label => /^артикул(?:\s|$)/i.test(String(label).trim()));
  const priceCol = headers.findIndex(label => /^ррц казахстан,\s*kzt$/i.test(String(label).trim()));
  if (skuCol === -1 || priceCol === -1) return prices;
  for (const row of rows) {
    const sku = String(row[skuCol] ?? '').trim().toUpperCase();
    const price = Number(String(row[priceCol] ?? '').replace(/\s+/g, '').replace(',', '.'));
    if (!sku || !Number.isFinite(price) || price <= 0) continue;
    if (prices.has(sku) && prices.get(sku) !== price) {
      throw new Error(`В листе «Цены и поставка» указаны разные цены для ${sku}.`);
    }
    prices.set(sku, price);
  }
  return prices;
}

export async function validateCatalogArchive(file, products) {
  const bytes = file instanceof Uint8Array ? file : null;
  if ((bytes?.length ?? file.size) > 80 * MB) throw new Error('Размер ZIP не должен превышать 80 МБ.');
  const zip = await JSZip.loadAsync(bytes || await file.arrayBuffer()).catch(() => {
    throw new Error('Не удалось открыть ZIP. Проверь архив и выбери его снова.');
  });
  const entries = Object.values(zip.files).filter(entry => !entry.dir && !/(^|\/)(__MACOSX|\._)[^/]*(\/|$)/.test(entry.name));
  if (entries.length > 2500) throw new Error('В архиве должно быть не более 2500 файлов.');
  const books = entries.filter(entry => /\.(xlsx|xlsm|xls)$/i.test(entry.name) && !basename(entry.name).startsWith('~$'));
  if (books.length !== 1) throw new Error('В архиве должна быть одна книга Excel (.xlsx, .xlsm или .xls).');

  const paths = new Map();
  const names = new Map();
  for (const entry of entries) {
    const original = normalizePath(entry.unsafeOriginalName || entry.name);
    if (original.split('/').includes('..') || /^(\/|[a-z]:)/.test(original)) {
      throw new Error('В архиве есть недопустимый путь к файлу.');
    }
    const path = normalizePath(entry.name);
    const name = basename(path);
    const extension = name.split('.').pop();
    if (!Object.hasOwn(mimeTypes, extension)) continue;
    const type = mimeTypes[extension];
    if (paths.has(path)) throw new Error(`В архиве повторяется путь «${entry.name}».`);
    const record = { entry, type, name: basename(entry.name.replace(/\\/g, '/')), url: `${mediaPrefix}${paths.size}/${encodeURIComponent(name)}` };
    paths.set(path, record);
    names.set(name, names.has(name) ? null : record);
  }

  const references = new Map();
  const resolveMedia = value => {
    if (/^https?:\/\//i.test(value)) {
      if (new URL(value).origin === new URL(mediaPrefix).origin) throw new Error('Недопустимая ссылка на медиа.');
      return value;
    }
    const path = normalizePath(value).replace(/^(?:\.\/|\/)+/, '');
    const name = basename(path);
    const media = paths.get(path) ?? names.get(name);
    if (media === null) throw new Error(`В архиве несколько файлов с именем «${name}». Укажи точный путь.`);
    if (!media) throw new Error(`В архиве не найден файл «${value}».`);
    references.set(media.url, media);
    return media.url;
  };

  const book = new Blob(await readEntry(books[0], 32 * MB));
  const result = await parseAndValidateExcelFile(await book.arrayBuffer(), products, workbook => ({
    prices: readKztPrices(workbook),
    resolveMedia
  }));
  const media = new Map();
  const urls = new Set(result.validRows.flatMap(row => mediaFields.map(field => row[field])).filter(url => references.has(url)));
  let totalSize = 0;
  if (result.success) {
    for (const url of urls) {
      const { entry, name, type } = references.get(url);
      const chunks = await readEntry(entry, Math.min(20 * MB, 160 * MB - totalSize));
      const image = new File(chunks, name, { type });
      if (!matchesImageType(type, new Uint8Array(await image.slice(0, 12).arrayBuffer()))) {
        throw new Error(`Файл «${name}» повреждён или его формат не совпадает с расширением.`);
      }
      totalSize += image.size;
      media.set(url, image);
    }
  }

  return {
    ...result,
    archive: {
      media,
      uploaded: new Map(),
      mediaCount: urls.size,
      unlinkedCount: paths.size - references.size,
      hidesExistingCount: result.validRows.filter(row => row.hidesExisting).length,
      missingPriceCount: result.validRows.filter(row => row.missingDraftPrice && !Number(row.price)).length,
      priceFromWorkbookCount: result.validRows.filter(row => row.priceFromWorkbook).length
    }
  };
}

export async function uploadCatalogArchiveMedia(validation, upload, onProgress) {
  if (!validation.success) throw new Error('Исправь ошибки в архиве перед импортом.');
  const { media, uploaded } = validation.archive;
  const pending = [...media].filter(([url]) => !uploaded.has(url));
  let cursor = 0;
  let failure;
  onProgress(uploaded.size, media.size);
  const worker = async () => {
    while (!failure && cursor < pending.length) {
      const [url, file] = pending[cursor++];
      try {
        const result = await upload(file);
        if (!result?.url || new URL(result.url).protocol !== 'https:') throw new Error('Хранилище не вернуло ссылку.');
        uploaded.set(url, result.url);
        onProgress(uploaded.size, media.size);
      } catch (error) {
        failure ??= new Error(`${file.name}: ${error.message}`);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(4, pending.length) }, worker));
  if (failure) throw failure;
  return validation.validRows.map(row => {
    const linked = row.missingDraftPrice ? { ...row, price: undefined } : { ...row };
    if (row.preserveDraftCurrency) linked.currency = undefined;
    for (const field of mediaFields) {
      if (uploaded.has(row[field])) linked[field] = uploaded.get(row[field]);
    }
    return linked;
  });
}

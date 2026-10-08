/**
 * Токенизатор собственной модели LAUTE
 * Поддерживает субсловную и пословную токенизацию, работу со спецсимволами,
 * паддинг, маски внимания и кодирование/декодирование для RU, EN, KZ.
 */

import { LauteVocabulary, SPECIAL_TOKENS } from './vocabulary.js';

export class LauteTokenizer {
  constructor(vocabulary = null, maxSeqLen = 128) {
    this.vocab = vocabulary || new LauteVocabulary();
    this.maxSeqLen = maxSeqLen;
  }

  /**
   * Нормализация строки перед токенизацией
   */
  normalize(text) {
    if (!text || typeof text !== 'string') return '';
    return text
      .toLowerCase()
      .replace(/ё/g, 'е')
      .replace(/[«»""''`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Разбиение текста на токены
   */
  tokenize(rawText) {
    const text = this.normalize(rawText);
    if (!text) return [];

    // Регулярное выражение для разделения слов, чисел и пунктуации
    const rawTokens = text
      .replace(/([.,!?;:()\[\]{}"'\\\/])/g, ' $1 ')
      .split(/\s+/)
      .filter(t => t.length > 0);

    const tokens = [];
    for (const t of rawTokens) {
      if (this.vocab.hasToken(t)) {
        tokens.push(t);
      } else {
        // Субсловная разбивка (n-gram subwords) для редких слов
        const subwords = this.splitSubwords(t);
        tokens.push(...subwords);
      }
    }
    return tokens;
  }

  /**
   * Субсловная эвристика для неизвестных терминов
   */
  splitSubwords(word) {
    if (word.length <= 3) return [word];
    const chunks = [];
    let start = 0;
    while (start < word.length) {
      let matched = false;
      for (let len = Math.min(6, word.length - start); len >= 2; len--) {
        const sub = word.slice(start, start + len);
        if (this.vocab.hasToken(sub)) {
          chunks.push(sub);
          start += len;
          matched = true;
          break;
        }
      }
      if (!matched) {
        // Если подстрока не найдена в словаре, добавляем символ или часть
        chunks.push(word.slice(start, start + 2));
        start += 2;
      }
    }
    return chunks.length > 0 ? chunks : [word];
  }

  /**
   * Преобразование строки в вектор токенов с добавлением <bos>, <eos>, padding
   */
  encode(text, options = {}) {
    const {
      addSpecialTokens = true,
      padToMax = false,
      maxLen = this.maxSeqLen,
      returnMask = false,
    } = options;

    const tokens = this.tokenize(text);
    const tokenIds = [];

    if (addSpecialTokens) {
      tokenIds.push(this.vocab.getId(SPECIAL_TOKENS.BOS));
    }

    for (const t of tokens) {
      tokenIds.push(this.vocab.getId(t));
      if (tokenIds.length >= (addSpecialTokens ? maxLen - 1 : maxLen)) {
        break;
      }
    }

    if (addSpecialTokens) {
      tokenIds.push(this.vocab.getId(SPECIAL_TOKENS.EOS));
    }

    // Создаем attention mask (1 для реальных токенов, 0 для <pad>)
    const mask = tokenIds.map(() => 1);

    if (padToMax) {
      const padId = this.vocab.getId(SPECIAL_TOKENS.PAD);
      while (tokenIds.length < maxLen) {
        tokenIds.push(padId);
        mask.push(0);
      }
    }

    if (returnMask) {
      return { inputIds: tokenIds, attentionMask: mask };
    }
    return tokenIds;
  }

  /**
   * Декодирование массива идентификаторов обратно в читаемый текст
   */
  decode(tokenIds, options = {}) {
    const { skipSpecialTokens = true } = options;
    if (!Array.isArray(tokenIds)) return '';

    const specialSet = new Set([
      this.vocab.getId(SPECIAL_TOKENS.PAD),
      this.vocab.getId(SPECIAL_TOKENS.BOS),
      this.vocab.getId(SPECIAL_TOKENS.EOS),
      this.vocab.getId(SPECIAL_TOKENS.UNK),
      this.vocab.getId(SPECIAL_TOKENS.MASK),
      this.vocab.getId(SPECIAL_TOKENS.SEP),
    ]);

    const words = [];
    for (const id of tokenIds) {
      if (skipSpecialTokens && specialSet.has(id)) {
        continue;
      }
      const token = this.vocab.getToken(id);
      words.push(token);
    }

    // Склейка токенов с аккуратной расстановкой пробелов
    let result = '';
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      if (/^[.,!?;:]$/.test(w)) {
        result += w;
      } else {
        result += (result.length > 0 ? ' ' : '') + w;
      }
    }
    return result;
  }

  /**
   * Пакетная токенизация массива текстов
   */
  batchEncode(texts, options = {}) {
    return texts.map(t => this.encode(t, { padToMax: true, returnMask: true, ...options }));
  }
}

export default LauteTokenizer;

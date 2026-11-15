import { SUPABASE_CONFIG } from './adminApi.js';

let retryConfigurationAfter = 0;

export async function requestConsultantAnswer({ messages, lang, region, signal }) {
  if (retryConfigurationAfter > Date.now()) return null;
  const { url, anonKey } = SUPABASE_CONFIG;
  const response = await fetch(url + '/functions/v1/laute-consultant', {
    method: 'POST',
    signal: AbortSignal.any([signal, AbortSignal.timeout(24000)]),
    headers: { apikey: anonKey, Authorization: 'Bearer ' + anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: messages.slice(-9), lang, region }),
  });
  const result = await response.json();
  if (response.status === 503 && ['model_unconfigured', 'backend_unconfigured', 'BOOT_ERROR'].includes(result.code)) {
    retryConfigurationAfter = Date.now() + 30_000;
  }
  if (!response.ok || result.provider !== 'openai' || typeof result.text !== 'string' ||
      !Array.isArray(result.articles) || !Array.isArray(result.sources)) return null;
  return result;
}

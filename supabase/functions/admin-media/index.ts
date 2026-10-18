// Storage stays private for writes. Existing LAUTE sessions authorize media operations.
const bucket = 'laute-media';
const allowedOrigins = new Set(['https://markpronenko7-cloud.github.io', 'http://localhost:5173', 'http://127.0.0.1:5173']);

Deno.serve(async (request: Request) => {
  const origin = request.headers.get('origin') || '';
  const cors = {
    'Access-Control-Allow-Origin': allowedOrigins.has(origin) ? origin : 'https://markpronenko7-cloud.github.io',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-laute-token',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Vary': 'Origin',
  };
  const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  if (origin && !allowedOrigins.has(origin)) return reply({ error: 'Origin not allowed' }, 403);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const token = request.headers.get('x-laute-token');
    if (!token) return reply({ error: 'Требуется авторизация администратора' }, 401);
    const verification = await fetch(`${url}/rest/v1/rpc/laute_verify_session`, {
      method: 'POST', headers: { apikey: anonKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_token: token }),
    });
    const session = await verification.json();
    if (!verification.ok || session?.valid !== true) return reply({ error: 'Сессия истекла. Войди снова.' }, 401);
    const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };
    if (request.method === 'GET') {
      const response = await fetch(`${url}/storage/v1/object/list/${bucket}`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ prefix: '', limit: 1000, sortBy: { column: 'created_at', order: 'desc' } }) });
      if (!response.ok) return reply({ error: 'Не удалось прочитать медиатеку' }, 502);
      return reply(await response.json());
    }
    if (request.method === 'POST') {
      const form = await request.formData();
      const file = form.get('file');
      if (!(file instanceof File) || !file.type.startsWith('image/') || !file.size || file.size > 20 * 1024 * 1024) return reply({ error: 'Выбери изображение размером до 20 МБ' }, 400);
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'svg', 'bmp', 'ico'].includes(ext)) return reply({ error: 'Неподдерживаемый формат изображения' }, 400);
      const name = `${crypto.randomUUID()}.${ext}`;
      const response = await fetch(`${url}/storage/v1/object/${bucket}/${name}`, { method: 'POST', headers: { ...headers, 'Content-Type': file.type, 'x-upsert': 'false' }, body: file });
      if (!response.ok) return reply({ error: 'Не удалось сохранить файл в Storage' }, 502);
      return reply({ success: true, name, url: `${url}/storage/v1/object/public/${bucket}/${name}`, size: file.size, isStorage: true });
    }
    if (request.method === 'DELETE') {
      const { name } = await request.json();
      if (typeof name !== 'string' || !/^[a-zA-Z0-9_.-]+$/.test(name) || name.includes('..')) return reply({ error: 'Некорректное имя файла' }, 400);
      const response = await fetch(`${url}/storage/v1/object/${bucket}`, { method: 'DELETE', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ prefixes: [name] }) });
      if (!response.ok) return reply({ error: 'Не удалось удалить файл из Storage' }, 502);
      return reply({ success: true });
    }
    return reply({ error: 'Method not allowed' }, 405);
  } catch {
    return reply({ error: 'Ошибка медиасервиса. Повтори попытку.' }, 500);
  }
});

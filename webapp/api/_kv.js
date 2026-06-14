// Upstash Redis (Vercel KV) bilan ishlash — REST API orqali (paket kerak emas).
// Vercel ulanishda kalitlarni avtomatik qo'shadi (KV_REST_API_URL / KV_REST_API_TOKEN).

const KV_URL =
  process.env.KV_REST_API_URL ||
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.STORAGE_REST_API_URL;

const KV_TOKEN =
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.STORAGE_REST_API_TOKEN;

export function kvConfigured() {
  return !!(KV_URL && KV_TOKEN);
}

async function kvCommand(cmd) {
  const res = await fetch(KV_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cmd),
  });
  const data = await res.json();
  if (!res.ok || data?.error) {
    throw new Error(data?.error || `KV xatosi (${res.status})`);
  }
  return data.result;
}

export async function kvGetJSON(key, fallback) {
  const v = await kvCommand(['GET', key]);
  if (v == null) return fallback;
  try {
    return typeof v === 'string' ? JSON.parse(v) : v;
  } catch {
    return fallback;
  }
}

export async function kvSetJSON(key, value) {
  return kvCommand(['SET', key, JSON.stringify(value)]);
}

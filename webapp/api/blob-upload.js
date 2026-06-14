// Vercel Blob — katta fayllar (1 daqiqagacha video) uchun to'g'ridan-to'g'ri (client) yuklash tokeni.
// Klient @vercel/blob/client orqali shu endpointga ulanib, faylni to'g'ridan Blob'ga yuklaydi.

import { handleUpload } from '@vercel/blob/client';

// BLOB tokenini har qanday nom bilan topadi (BLOB_READ_WRITE_TOKEN yoki prefiksli variant)
function findBlobToken() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  for (const [k, v] of Object.entries(process.env)) {
    if (k.includes('BLOB') && k.includes('TOKEN') && v) return v;
  }
  return null;
}

export default async function handler(req, res) {
  const token = findBlobToken();

  // Diagnostika
  if (req.method === 'GET') {
    const blobEnvKeys = Object.keys(process.env).filter((k) => k.includes('BLOB'));
    return res.status(200).json({
      ok: true,
      blobConfigured: !!token,
      blobEnvKeys,
      hint: token
        ? 'Blob ulangan — video yuklash ishlashi kerak.'
        : 'Blob kaliti topilmadi: Storage -> Blob -> loyihaga ulang va QAYTA DEPLOY qiling.',
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!token) {
    return res.status(500).json({
      error: "Blob store ulanmagan (kalit topilmadi). Vercel -> Storage -> Blob -> loyihaga ulang va qayta deploy qiling.",
    });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

  try {
    const jsonResponse = await handleUpload({
      token,
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          'video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska', 'video/3gpp',
          'image/jpeg', 'image/png', 'image/webp',
        ],
        maximumSizeInBytes: 200 * 1024 * 1024,
      }),
      onUploadCompleted: async () => {},
    });
    return res.status(200).json(jsonResponse);
  } catch (e) {
    return res.status(400).json({ error: String(e) });
  }
}

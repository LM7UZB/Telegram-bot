// Vercel Blob — katta fayllar (1 daqiqagacha video) uchun to'g'ridan-to'g'ri (client) yuklash tokeni.
// Klient @vercel/blob/client orqali shu endpointga ulanib, faylni to'g'ridan Blob'ga yuklaydi.
//
// MUHIM: Ishlashi uchun Vercel'da Blob store yaratilgan VA loyihaga ulangan bo'lishi kerak.
//        Ulangach loyihani QAYTA DEPLOY qiling (env BLOB_READ_WRITE_TOKEN shunda qo'shiladi).
//
// Tekshirish: brauzerda /api/blob-upload ni oching -> {"blobConfigured": true} bo'lishi kerak.

import { handleUpload } from '@vercel/blob/client';

export default async function handler(req, res) {
  const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN;

  // Diagnostika: Blob ulanganmi yoki yo'q
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      blobConfigured: hasToken,
      hint: hasToken
        ? "Blob ulangan — video yuklash ishlashi kerak."
        : "Blob ulanmagan: Vercel -> Storage -> Blob yarating, loyihaga ulang va QAYTA DEPLOY qiling.",
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!hasToken) {
    return res.status(500).json({
      error: "Blob store ulanmagan. Vercel -> Storage -> Blob yarating, loyihaga ulang va qayta deploy qiling.",
    });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          'video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska', 'video/3gpp',
          'image/jpeg', 'image/png', 'image/webp',
        ],
        maximumSizeInBytes: 200 * 1024 * 1024, // 200 MB (1 daqiqagacha video uchun yetarli)
      }),
      onUploadCompleted: async () => {},
    });
    return res.status(200).json(jsonResponse);
  } catch (e) {
    return res.status(400).json({ error: String(e) });
  }
}

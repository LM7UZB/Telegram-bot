// Vercel Blob — katta fayllar (video) uchun to'g'ridan-to'g'ri (client) yuklash tokeni.
// Klient @vercel/blob/client orqali shu endpointga ulanib, faylni to'g'ridan Blob'ga yuklaydi.
// Ishlashi uchun Vercel'da Blob store yaratilgan bo'lishi kerak (BLOB_READ_WRITE_TOKEN avtomatik qo'shiladi).

import { handleUpload } from '@vercel/blob/client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ error: "Blob store ulanmagan: Vercel -> Storage -> Blob yarating" });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          'video/mp4', 'video/webm', 'video/quicktime',
          'image/jpeg', 'image/png', 'image/webp',
        ],
        maximumSizeInBytes: 50 * 1024 * 1024, // 50 MB
      }),
      onUploadCompleted: async () => {},
    });
    return res.status(200).json(jsonResponse);
  } catch (e) {
    return res.status(400).json({ error: String(e) });
  }
}

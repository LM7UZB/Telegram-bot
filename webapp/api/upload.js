// Rasmni server tomonda yuklaydi (CORS muammosiz).
// Klient base64 yuboradi -> bu funksiya rasm xizmatiga (freeimage.host) yuklaydi -> URL qaytaradi.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const image = body?.image; // data: prefixsiz base64
  if (!image || typeof image !== 'string') {
    return res.status(400).json({ ok: false, error: "Rasm ma'lumoti yo'q" });
  }

  // freeimage.host demo kaliti (yoki o'zingizniki: IMG_API_KEY env)
  const KEY = process.env.IMG_API_KEY || process.env.VITE_IMG_API_KEY || '6d207e02198a847aa98d0a2a901485a5';

  try {
    const form = new URLSearchParams();
    form.append('key', KEY);
    form.append('source', image);
    form.append('format', 'json');

    const r = await fetch('https://freeimage.host/api/1/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    const data = await r.json();
    const url = data?.image?.url || data?.image?.display_url;
    if (url) {
      return res.status(200).json({ ok: true, url });
    }
    return res.status(502).json({
      ok: false,
      error: data?.error?.message || data?.status_txt || 'Rasm xizmati xatosi',
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
}

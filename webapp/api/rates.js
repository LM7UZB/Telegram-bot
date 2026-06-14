// Markaziy Bank (CBU) dan USD/UZS kursini olib beradi (server orqali, CORS muammosiz).
// Manba: https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/

export default async function handler(req, res) {
  try {
    const r = await fetch('https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/', {
      headers: { Accept: 'application/json' },
    });
    const data = await r.json();
    const usd = Array.isArray(data) ? data[0] : null;
    if (!usd || !usd.Rate) {
      return res.status(502).json({ ok: false, error: 'CBU javobi bo\'sh' });
    }
    // 1 soat keshlash (Vercel CDN)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({
      ok: true,
      ccy: usd.Ccy || 'USD',
      rate: usd.Rate, // masalan "12049.44"
      diff: usd.Diff, // masalan "52.23" yoki "-39.55"
      date: usd.Date, // masalan "14.06.2026"
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
}

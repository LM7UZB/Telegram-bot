// Backend (Vercel serverless) bilan ishlash uchun klient yordamchilari.
import { Product } from '../types';

function initData(): string {
  return (window as any).Telegram?.WebApp?.initData || '';
}

/** Faylni canvas orqali kichiklashtirib, base64 (jpeg) ga aylantiradi. */
function fileToResizedBase64(file: File, maxDim = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Faylni o\'qib bo\'lmadi'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Rasm yuklanmadi'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('canvas xatosi'));
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl.split(',')[1] || '');
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/** Rasmni server orqali yuklaydi (CORS muammosiz) va URL qaytaradi. */
export async function uploadImage(file: File): Promise<{ ok: boolean; url?: string; error?: string }> {
  try {
    const base64 = await fileToResizedBase64(file);
    if (!base64) return { ok: false, error: 'rasm tayyorlanmadi' };
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64 }),
    });
    return await res.json();
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/** Hammaga ko'rinadigan (tasdiqlangan) mahsulotlar. */
export async function fetchApprovedProducts(): Promise<Product[]> {
  try {
    const res = await fetch('/api/products');
    const data = await res.json();
    return data?.ok ? data.products : [];
  } catch {
    return [];
  }
}

/** Admin uchun barcha mahsulotlar (pending/approved/rejected). */
export async function fetchAllProductsAdmin(): Promise<any[]> {
  try {
    const res = await fetch('/api/products?scope=all', {
      headers: { 'X-Telegram-Init-Data': initData() },
    });
    const data = await res.json();
    return data?.ok ? data.products : [];
  } catch {
    return [];
  }
}

/** Yangi mahsulot yuborish (status: pending). */
export async function submitProduct(product: any): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product }),
    });
    return await res.json();
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/** Sotuvchining o'z mahsulotlari (har qanday holatda — status bilan). */
export async function fetchMyProducts(store: string): Promise<any[]> {
  try {
    const res = await fetch(`/api/products?scope=mine&store=${encodeURIComponent(store)}`);
    const data = await res.json();
    return data?.ok ? data.products : [];
  } catch {
    return [];
  }
}

/** Admin: mahsulotni tasdiqlash / rad etish / o'chirish. */
export async function reviewProduct(
  id: number,
  action: 'approve' | 'reject' | 'delete'
): Promise<{ ok: boolean; products?: any[]; error?: string }> {
  try {
    const res = await fetch('/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Telegram-Init-Data': initData() },
      body: JSON.stringify({ id, action }),
    });
    return await res.json();
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

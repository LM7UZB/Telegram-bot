// Backend (Vercel serverless) bilan ishlash uchun klient yordamchilari.
import { Product } from '../types';

function initData(): string {
  return (window as any).Telegram?.WebApp?.initData || '';
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

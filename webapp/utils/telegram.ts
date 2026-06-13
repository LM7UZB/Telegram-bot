// Telegram Mini App yordamchi funksiyalari (admin, mijoz, adminga yuborish).

// Admin Telegram ID lari. 147775103 = @LM7_UZB (asosiy admin).
// Yangi admin qo'shish uchun shu ro'yxatga ID qo'shing.
export const ADMIN_IDS: number[] = [147775103];

export interface TgUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

/** Telegram'dan joriy foydalanuvchini oladi (ilova Telegram ichida ochilgan bo'lsa). */
export function getTelegramUser(): TgUser | null {
  return (window as any).Telegram?.WebApp?.initDataUnsafe?.user ?? null;
}

/** Joriy foydalanuvchi admin (147775103) ekanligini tekshiradi. */
export function isAdminUser(): boolean {
  const u = getTelegramUser();
  return !!u && ADMIN_IDS.includes(u.id);
}

/** Adminga yuboriladigan xabar uchun mijoz ma'lumotini matn ko'rinishida qaytaradi. */
export function customerInfoText(): string {
  const u = getTelegramUser();
  if (!u) return '👤 Mijoz: (Telegram tashqarisida ochilgan)';
  const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || '—';
  const uname = u.username ? '@' + u.username : '—';
  return `👤 Mijoz: ${name}\n🔗 Username: ${uname}\n🆔 Telegram ID: ${u.id}`;
}

/**
 * Adminga xabar yuboradi (Vercel serverless /api/notify orqali).
 * Hech qanday server kerak emas; funksiya Bot API orqali adminga jo'natadi.
 */
export async function notifyAdmin(text: string): Promise<boolean> {
  try {
    const res = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return res.ok;
  } catch (e) {
    console.error('notifyAdmin xatosi:', e);
    return false;
  }
}

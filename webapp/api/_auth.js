// Telegram Mini App initData ni server tomonda tekshirish (xavfsiz admin aniqlash).
// https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app

import crypto from 'node:crypto';

// Admin Telegram ID lari. 147775103 = @LM7_UZB
export const ADMIN_IDS = [147775103];

export function validateInitData(initData, botToken) {
  if (!initData || !botToken) return null;
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return null;
    params.delete('hash');

    const pairs = [];
    for (const [k, v] of params.entries()) pairs.push(`${k}=${v}`);
    pairs.sort();
    const dataCheckString = pairs.join('\n');

    const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const computed = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');

    if (computed !== hash) return null;

    const userRaw = params.get('user');
    return userRaw ? JSON.parse(userRaw) : null;
  } catch {
    return null;
  }
}

export function isAdminUser(user) {
  return !!user && ADMIN_IDS.includes(Number(user.id));
}

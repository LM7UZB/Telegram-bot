import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// --- Telegram Mini App init ---
// Telegram WebApp ob'ekti telegram-web-app.js orqali yuklanadi (index.html).
// Ilova ochilganda Telegram'ga "tayyorman" signalini berib, oynani to'liq ochamiz.
const tg = (window as any).Telegram?.WebApp;
if (tg) {
  try {
    tg.ready();
    tg.expand();
    // Yopilishdan oldin tasdiqlash (tasodifan yopib qo'ymaslik uchun)
    tg.enableClosingConfirmation?.();
    // Header va fon ranglarini ilova mavzusiga moslaymiz
    tg.setHeaderColor?.('#050505');
    tg.setBackgroundColor?.('#050505');
  } catch (e) {
    console.warn('Telegram WebApp init warning:', e);
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

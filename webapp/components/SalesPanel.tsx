import React, { useEffect, useState } from 'react';
import { Language } from '../types';
import { fetchMyProducts } from '../utils/api';

interface SalesPanelProps {
  onClose: () => void;
  storeName: string;
  theme: 'dark' | 'light';
  lang: Language;
  onSellClick?: () => void;
}

type StatusKey = 'pending' | 'approved' | 'rejected' | 'sold';

const T: Record<Language, any> = {
  uz: {
    title: 'Sotuv paneli',
    subtitle: 'Mahsulotlaringiz holati',
    addProduct: '+ Mahsulot qoʻshish',
    empty: "Bu boʻlimda mahsulot yoʻq",
    soldFor: 'Sotildi',
    soldOn: 'sotilgan sana',
    totalSold: 'Jami sotuvdan',
    tabs: { pending: 'Kutilmoqda', approved: 'Tasdiqlandi', rejected: 'Rad etildi', sold: 'Sotilgan' },
  },
  ru: {
    title: 'Панель продаж',
    subtitle: 'Статус ваших товаров',
    addProduct: '+ Добавить товар',
    empty: 'В этом разделе нет товаров',
    soldFor: 'Продано',
    soldOn: 'дата продажи',
    totalSold: 'Итого с продаж',
    tabs: { pending: 'Ожидание', approved: 'Подтверждено', rejected: 'Отклонено', sold: 'Продано' },
  },
  en: {
    title: 'Sales Panel',
    subtitle: 'Status of your products',
    addProduct: '+ Add product',
    empty: 'No products in this section',
    soldFor: 'Sold',
    soldOn: 'sold date',
    totalSold: 'Total from sales',
    tabs: { pending: 'Pending', approved: 'Approved', rejected: 'Rejected', sold: 'Sold' },
  },
};

const STATUS_ICON: Record<StatusKey, string> = {
  pending: '🟡',
  approved: '🟢',
  rejected: '🔴',
  sold: '✅',
};

export const SalesPanel: React.FC<SalesPanelProps> = ({ onClose, storeName, theme, lang, onSellClick }) => {
  const t = T[lang] || T.uz;
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<StatusKey>('approved');

  const bg = theme === 'light' ? 'bg-white text-gray-900' : 'bg-[#15171e] text-white';
  const cardBg = theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-white/[0.03] border-white/10';

  useEffect(() => {
    setLoading(true);
    fetchMyProducts(storeName)
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [storeName]);

  const statusOf = (p: any): StatusKey => (p.status || 'pending') as StatusKey;
  const counts: Record<StatusKey, number> = {
    pending: items.filter((p) => statusOf(p) === 'pending').length,
    approved: items.filter((p) => statusOf(p) === 'approved').length,
    rejected: items.filter((p) => statusOf(p) === 'rejected').length,
    sold: items.filter((p) => statusOf(p) === 'sold').length,
  };
  const filtered = items.filter((p) => statusOf(p) === tab);
  const soldTotal = items
    .filter((p) => statusOf(p) === 'sold')
    .reduce((s, p) => s + (Number(p.price) || 0), 0);

  const tabKeys: StatusKey[] = ['pending', 'approved', 'rejected', 'sold'];

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xl z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className={`w-full sm:max-w-lg ${bg} rounded-t-[32px] sm:rounded-[32px] border border-[#d4af37]/30 shadow-2xl max-h-[92vh] overflow-y-auto`}>
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-white/10 backdrop-blur-xl bg-inherit">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center">
              <i className="fas fa-store"></i>
            </div>
            <div>
              <h2 className="text-base font-black text-[#d4af37] uppercase tracking-tight">{t.title}</h2>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{storeName} · {t.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-white/5 rounded-full text-gray-400 active:scale-75 transition-transform">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Add product */}
        {onSellClick && (
          <div className="px-4 pt-4">
            <button
              onClick={onSellClick}
              className="w-full py-3 rounded-2xl bg-[#d4af37] text-black text-xs font-black uppercase tracking-wider active:scale-95 transition-transform"
            >
              {t.addProduct}
            </button>
          </div>
        )}

        {/* Sotilgan summasi */}
        <div className="px-4 pt-4">
          <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-2xl p-4 flex items-center justify-between">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.totalSold}</p>
            <p className="text-2xl font-black text-[#d4af37]">${soldTotal}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-4 gap-2 p-4">
          {tabKeys.map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-wider border transition-all ${
                tab === k ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#d4af37]' : 'border-white/10 text-gray-500'
              }`}
            >
              {STATUS_ICON[k]} {t.tabs[k]} ({counts[k]})
            </button>
          ))}
        </div>

        {/* List */}
        <div className="p-4 pt-0 space-y-3">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <i className="fas fa-circle-notch fa-spin text-2xl text-[#d4af37]"></i>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-xs font-bold uppercase tracking-widest">{t.empty}</div>
          ) : (
            filtered.map((p) => (
              <div key={p.id} className={`${cardBg} border rounded-2xl p-3 flex gap-3`}>
                <img src={p.img} referrerPolicy="no-referrer" alt="" className="w-20 h-20 rounded-xl object-cover flex-none bg-black/20" />
                <div className="flex-1 min-w-0">
                  <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider bg-[#d4af37]/15 text-[#d4af37]">
                    {STATUS_ICON[statusOf(p)]} {t.tabs[statusOf(p)]}
                  </span>
                  <h4 className="text-xs font-black truncate mt-1">{p.title?.uz || p.title}</h4>
                  <p className="text-[10px] text-gray-400 font-bold">{p.price}$ · {p.gram} · {p.proba}</p>
                  {statusOf(p) === 'sold' && (
                    <p className="text-[9px] font-black text-blue-400 mt-1">
                      {t.soldFor}: ${p.price}
                      {p.soldAt ? ` · ${new Date(p.soldAt).toLocaleDateString('ru-RU')}` : ''}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

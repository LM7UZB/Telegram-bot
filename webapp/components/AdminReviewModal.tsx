import React, { useEffect, useState } from 'react';
import { Language } from '../types';
import { fetchAllProductsAdmin, reviewProduct, updateProduct, fetchOrders, fetchSellers, resetSales } from '../utils/api';

interface AdminReviewModalProps {
  onClose: () => void;
  onChanged: () => void; // tasdiqlash o'zgargach, asosiy ro'yxatni yangilash uchun
  theme: 'dark' | 'light';
  lang: Language;
}

const STATUS_META: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: 'Kutilmoqda', color: 'text-yellow-500 bg-yellow-500/15', icon: '🟡' },
  approved: { label: 'Tasdiqlangan', color: 'text-green-500 bg-green-500/15', icon: '🟢' },
  rejected: { label: 'Rad etilgan', color: 'text-red-500 bg-red-500/15', icon: '🔴' },
  sold: { label: 'Sotilgan', color: 'text-blue-400 bg-blue-400/15', icon: '✅' },
};

export const AdminReviewModal: React.FC<AdminReviewModalProps> = ({ onClose, onChanged, theme, lang }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [section, setSection] = useState<'review' | 'sales' | 'sellers'>('review');
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [sellers, setSellers] = useState<any[]>([]);
  const [sellersLoaded, setSellersLoaded] = useState(false);
  const todayStr = new Date().toISOString().slice(0, 10);
  const [dateFrom, setDateFrom] = useState(todayStr);
  const [dateTo, setDateTo] = useState(todayStr);

  const editInput = `w-full px-3 py-2 text-xs rounded-lg border font-bold focus:outline-none focus:border-[#d4af37] ${
    theme === 'dark' ? 'bg-black/40 border-white/10 text-white placeholder-gray-600' : 'bg-white border-gray-300 text-black placeholder-gray-400'
  }`;

  const openEdit = (p: any) => {
    setEditId(p.id);
    setEditForm({
      title: p.title?.uz || p.title || '',
      price: p.price ?? '',
      gram: (p.gram || '').toString().replace(/g$/i, ''),
      proba: p.proba || '',
      location: p.location || '',
      store: p.store || '',
      desc: p.desc?.uz || '',
    });
  };

  const saveEdit = async (id: number) => {
    setBusyId(id);
    const res = await updateProduct(id, editForm);
    setBusyId(null);
    if (res.ok && res.products) {
      setItems(res.products);
      setEditId(null);
      onChanged();
    } else {
      alert(res.error || 'Saqlashda xatolik');
    }
  };

  const bg = theme === 'light' ? 'bg-white text-gray-900' : 'bg-[#15171e] text-white';
  const cardBg = theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-white/[0.03] border-white/10';

  const load = async () => {
    setLoading(true);
    const data = await fetchAllProductsAdmin();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleResetSales = async () => {
    if (!confirm("Barcha sotuv va buyurtma ma'lumotlari 0 ga tushiriladi (test ma'lumoti tozalanadi). Davom etamizmi?")) return;
    const res = await resetSales();
    if (res.ok) {
      setOrders([]);
      setOrdersLoaded(false);
      await load();
      onChanged();
      alert("Tozalandi — barcha sotuvlar 0 ga tushdi.");
    } else {
      alert(res.error || 'Xatolik');
    }
  };

  const act = async (id: number, action: 'approve' | 'reject' | 'delete') => {
    setBusyId(id);
    const res = await reviewProduct(id, action);
    setBusyId(null);
    if (res.ok && res.products) {
      setItems(res.products);
      onChanged();
      if ((window as any).Telegram?.WebApp?.HapticFeedback) {
        (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
    } else {
      alert(res.error || 'Xatolik (faqat admin bajara oladi, ilovani Telegram ichida oching)');
    }
  };

  const filtered = items.filter((p) => (p.status || 'pending') === tab);
  const counts = {
    pending: items.filter((p) => (p.status || 'pending') === 'pending').length,
    approved: items.filter((p) => p.status === 'approved').length,
    rejected: items.filter((p) => p.status === 'rejected').length,
  };

  // Sotuvlar (statistika) bo'limi uchun
  useEffect(() => {
    if (section === 'sales' && !ordersLoaded) {
      fetchOrders().then((o) => { setOrders(Array.isArray(o) ? o : []); setOrdersLoaded(true); });
    }
  }, [section, ordersLoaded]);

  // Sotuvchilar bo'limi uchun
  useEffect(() => {
    if (section === 'sellers' && !sellersLoaded) {
      fetchSellers().then((s) => { setSellers(Array.isArray(s) ? s : []); setSellersLoaded(true); });
    }
  }, [section, sellersLoaded]);

  // Do'kon (sotuvchi) bo'yicha statistika: nechta mahsulot, holatlar, qachon qo'shilgan
  const storeNames = Array.from(new Set([
    ...sellers.map((s) => s.storeName),
    ...items.map((p) => p.store),
  ].filter(Boolean)));
  const storeRows = storeNames.map((name) => {
    const reg = sellers.find((s) => s.storeName === name);
    const prods = items.filter((p) => p.store === name);
    return {
      name,
      username: reg?.username || '',
      firstSeenAt: reg?.firstSeenAt || null,
      total: prods.length,
      approved: prods.filter((p) => p.status === 'approved').length,
      pending: prods.filter((p) => (p.status || 'pending') === 'pending').length,
      rejected: prods.filter((p) => p.status === 'rejected').length,
      sold: prods.filter((p) => p.status === 'sold').length,
    };
  }).sort((a, b) => b.total - a.total);

  const fromTs = new Date(dateFrom + 'T00:00:00').getTime();
  const toTs = new Date(dateTo + 'T23:59:59').getTime();
  const salesInRange = orders.filter((o) => {
    const t = new Date(o.date).getTime();
    return t >= fromTs && t <= toTs;
  });
  const turnover = salesInRange.reduce((s, o) => s + (Number(o.total) || 0), 0);
  const soldItems = salesInRange.flatMap((o) => (o.items || []).map((it: any) => ({ ...it, date: o.date })));

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xl z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className={`w-full sm:max-w-lg ${bg} rounded-t-[32px] sm:rounded-[32px] border border-[#d4af37]/30 shadow-2xl max-h-[92vh] overflow-y-auto`}>
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-white/10 backdrop-blur-xl bg-inherit">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center">
              <i className="fas fa-shield-halved"></i>
            </div>
            <div>
              <h2 className="text-base font-black text-[#d4af37] uppercase tracking-tight">Admin panel</h2>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Mahsulotlarni tasdiqlash</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-white/5 rounded-full text-gray-400 active:scale-75 transition-transform">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Bo'lim almashtirgich */}
        <div className="flex gap-2 px-4 pt-4">
          <button onClick={() => setSection('review')} className={`flex-1 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider border ${section === 'review' ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#d4af37]' : 'border-white/10 text-gray-500'}`}>📦 Tasdiqlash</button>
          <button onClick={() => setSection('sales')} className={`flex-1 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider border ${section === 'sales' ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#d4af37]' : 'border-white/10 text-gray-500'}`}>📊 Sotuvlar</button>
          <button onClick={() => setSection('sellers')} className={`flex-1 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider border ${section === 'sellers' ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#d4af37]' : 'border-white/10 text-gray-500'}`}>🏪 Sotuvchilar</button>
        </div>

        {section === 'review' && (
          <>
        {/* Tabs */}
        <div className="flex gap-2 p-4 sticky top-[72px] z-10 bg-inherit">
          {(['pending', 'approved', 'rejected'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                tab === t ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#d4af37]' : 'border-white/10 text-gray-500'
              }`}
            >
              {STATUS_META[t].icon} {STATUS_META[t].label} ({counts[t]})
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
            <div className="text-center py-12 text-gray-500 text-xs font-bold uppercase tracking-widest">
              Bu bo'limda mahsulot yo'q
            </div>
          ) : (
            filtered.map((p) => {
              const meta = STATUS_META[p.status || 'pending'] || STATUS_META.pending;
              const isEditing = editId === p.id;
              return (
                <div key={p.id} className={`${cardBg} border rounded-2xl p-3`}>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-wider">✏️ Tahrirlash</span>
                        <button onClick={() => setEditId(null)} className="text-gray-400 text-xs"><i className="fas fa-times"></i></button>
                      </div>
                      {(p.images && p.images.length ? p.images : [p.img]).filter(Boolean).length > 0 && (
                        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                          {(p.images && p.images.length ? p.images : [p.img]).filter(Boolean).map((im: string, idx: number) => (
                            <img key={idx} src={im} referrerPolicy="no-referrer" alt="" className="w-24 h-24 rounded-xl object-cover flex-none border border-white/10" />
                          ))}
                        </div>
                      )}
                      <input value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="Nomi" className={editInput} />
                      <div className="grid grid-cols-2 gap-2">
                        <input type="number" value={editForm.price ?? ''} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} placeholder="Narx $" className={editInput} />
                        <input value={editForm.gram ?? ''} onChange={(e) => setEditForm({ ...editForm, gram: e.target.value })} placeholder="Gramm" className={editInput} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input value={editForm.proba || ''} onChange={(e) => setEditForm({ ...editForm, proba: e.target.value })} placeholder="Proba" className={editInput} />
                        <input value={editForm.store || ''} onChange={(e) => setEditForm({ ...editForm, store: e.target.value })} placeholder="Do'kon" className={editInput} />
                      </div>
                      <input value={editForm.location || ''} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} placeholder="Hudud" className={editInput} />
                      <textarea value={editForm.desc || ''} onChange={(e) => setEditForm({ ...editForm, desc: e.target.value })} placeholder="Tavsif" rows={2} className={`${editInput} resize-none`} />
                      <div className="flex gap-2">
                        <button disabled={busyId === p.id} onClick={() => saveEdit(p.id)} className="flex-1 py-2 rounded-xl bg-[#d4af37] text-black text-[10px] font-black uppercase tracking-wider active:scale-95 disabled:opacity-50">💾 Saqlash</button>
                        <button onClick={() => setEditId(null)} className="px-3 py-2 rounded-xl bg-white/10 text-gray-400 text-[10px] font-black uppercase">Bekor</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <img src={p.img} referrerPolicy="no-referrer" alt="" className="w-20 h-20 rounded-xl object-cover flex-none bg-black/20" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${meta.color}`}>
                            {meta.icon} {meta.label}
                          </span>
                        </div>
                        <p className="text-[9px] font-black text-[#d4af37] uppercase tracking-widest truncate">{p.store}</p>
                        <h4 className="text-xs font-black truncate">{p.title?.uz || p.title}</h4>
                        <p className="text-[10px] text-gray-400 font-bold">{p.price}$ · {p.gram} · {p.proba}</p>

                        <div className="flex flex-wrap gap-2 mt-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="flex-1 py-2 rounded-xl bg-blue-500/90 text-white text-[9px] font-black uppercase tracking-wider active:scale-95"
                          >
                            ✏️ Tahrirlash
                          </button>
                          {p.status !== 'approved' && (
                            <button disabled={busyId === p.id} onClick={() => act(p.id, 'approve')} className="flex-1 py-2 rounded-xl bg-green-500/90 text-white text-[9px] font-black uppercase tracking-wider active:scale-95 disabled:opacity-50">
                              🟢 Tasdiq
                            </button>
                          )}
                          {p.status !== 'rejected' && (
                            <button disabled={busyId === p.id} onClick={() => act(p.id, 'reject')} className="flex-1 py-2 rounded-xl bg-red-500/90 text-white text-[9px] font-black uppercase tracking-wider active:scale-95 disabled:opacity-50">
                              🔴 Rad
                            </button>
                          )}
                          <button disabled={busyId === p.id} onClick={() => act(p.id, 'delete')} className="px-3 py-2 rounded-xl bg-white/10 text-gray-400 text-[9px] active:scale-95 disabled:opacity-50" title="O'chirish">
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
          </>
        )}

        {/* Sotuvlar / Statistika */}
        {section === 'sales' && (
          <div className="p-4 space-y-4">
            <button
              onClick={handleResetSales}
              className="w-full py-3 rounded-2xl border border-red-500/40 bg-red-500/10 text-red-400 text-[11px] font-black uppercase tracking-wider active:scale-95 transition-transform"
            >
              <i className="fas fa-trash-alt mr-1.5"></i> Sotuvlarni 0 ga tushirish (test ma'lumotini tozalash)
            </button>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-1">Sanadan</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={editInput} />
              </div>
              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-1">Sanagacha</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={editInput} />
              </div>
            </div>

            <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Umumiy savdo (aylanma)</p>
                <p className="text-2xl font-black text-[#d4af37]">${turnover}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sotuvlar</p>
                <p className="text-2xl font-black">{salesInRange.length}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Sotilgan mahsulotlar</p>
              {soldItems.length === 0 ? (
                <p className="text-center py-8 text-gray-500 text-xs font-bold uppercase tracking-widest">Bu davrda sotuv yo'q</p>
              ) : (
                <div className="space-y-2">
                  {soldItems.map((it, i) => (
                    <div key={i} className={`${cardBg} border rounded-xl p-2.5 flex items-center justify-between`}>
                      <div className="min-w-0">
                        <p className="text-xs font-black truncate">{it.title}</p>
                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">{it.store} · {new Date(it.date).toLocaleDateString('ru-RU')}</p>
                      </div>
                      <span className="text-sm font-black text-[#d4af37] flex-none ml-2">${it.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {/* Sotuvchilar (do'kon egalari) */}
        {section === 'sellers' && (
          <div className="p-4 space-y-2">
            {!sellersLoaded ? (
              <div className="text-center py-12 text-gray-500"><i className="fas fa-circle-notch fa-spin text-2xl text-[#d4af37]"></i></div>
            ) : storeRows.length === 0 ? (
              <p className="text-center py-12 text-gray-500 text-xs font-bold uppercase tracking-widest">Sotuvchilar yo'q</p>
            ) : (
              storeRows.map((s) => (
                <div key={s.name} className={`${cardBg} border rounded-2xl p-3`}>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-[#d4af37] truncate">🏪 {s.name}</h4>
                      <p className="text-[9px] text-gray-500 font-bold truncate">
                        {s.username || '—'}
                        {s.firstSeenAt ? ` · qo'shilgan: ${new Date(s.firstSeenAt).toLocaleDateString('ru-RU')}` : ''}
                      </p>
                    </div>
                    <div className="text-right flex-none ml-2">
                      <p className="text-2xl font-black">{s.total}</p>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">mahsulot</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[8px] font-black px-2 py-1 rounded-full bg-green-500/15 text-green-500 uppercase tracking-wider">🟢 Tasdiq: {s.approved}</span>
                    <span className="text-[8px] font-black px-2 py-1 rounded-full bg-yellow-500/15 text-yellow-500 uppercase tracking-wider">🟡 Kutilmoqda: {s.pending}</span>
                    <span className="text-[8px] font-black px-2 py-1 rounded-full bg-red-500/15 text-red-500 uppercase tracking-wider">🔴 Rad: {s.rejected}</span>
                    <span className="text-[8px] font-black px-2 py-1 rounded-full bg-blue-400/15 text-blue-400 uppercase tracking-wider">✅ Sotilgan: {s.sold}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
};

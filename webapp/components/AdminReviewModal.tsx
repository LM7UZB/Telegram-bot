import React, { useEffect, useState } from 'react';
import { Language } from '../types';
import { fetchAllProductsAdmin, reviewProduct, updateProduct } from '../utils/api';

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
};

export const AdminReviewModal: React.FC<AdminReviewModalProps> = ({ onClose, onChanged, theme, lang }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});

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
              const meta = STATUS_META[p.status || 'pending'];
              const isEditing = editId === p.id;
              return (
                <div key={p.id} className={`${cardBg} border rounded-2xl p-3`}>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-wider">✏️ Tahrirlash</span>
                        <button onClick={() => setEditId(null)} className="text-gray-400 text-xs"><i className="fas fa-times"></i></button>
                      </div>
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
      </div>
    </div>
  );
};

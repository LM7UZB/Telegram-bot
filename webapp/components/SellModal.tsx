
import React, { useState } from 'react';
import { UIStrings, Language, UserAccount } from '../types';
import { REGIONS } from '../constants';
import { submitProduct, uploadImage } from '../utils/api';

// Mahsulot turlari — bosh menudagi kategoriyalar bilan bir xil (uzuk, soat va h.k.)
const PRODUCT_TYPES = [
  { id: 'uzuk', label: { uz: 'Uzuk', ru: 'Кольцо', en: 'Ring' } },
  { id: 'zirak', label: { uz: "Zirak / Sirg'a", ru: 'Серьги', en: 'Earrings' } },
  { id: 'sepochka', label: { uz: 'Sepochka / Zanjir', ru: 'Цепочка', en: 'Chain' } },
  { id: 'braslet', label: { uz: 'Braslet', ru: 'Браслет', en: 'Bracelet' } },
  { id: 'kulon', label: { uz: 'Kulon', ru: 'Кулон', en: 'Pendant' } },
  { id: 'komplekt', label: { uz: "To'plam", ru: 'Комплект', en: 'Set' } },
  { id: 'soat', label: { uz: 'Soat', ru: 'Часы', en: 'Watch' } },
] as const;

interface SellModalProps {
  onClose: () => void;
  strings: UIStrings;
  theme: 'dark' | 'light';
  account: UserAccount;
  lang: Language;
}

export const SellModal: React.FC<SellModalProps> = ({ onClose, strings, theme, account, lang }) => {
  const [form, setForm] = useState({ 
    cat: 'gold',
    type: 'uzuk',
    title: '', 
    price: '', 
    gram: '', 
    proba: '585', 
    desc: '', 
    location: REGIONS[0], 
    store: account.storeName || '',
    images: [] as string[],
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const bgColor = theme === 'light' ? 'bg-white' : 'bg-[#141414]';
  const inputBg = theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-white/5 border-white/10';
  const textColor = theme === 'light' ? 'text-black' : 'text-white';
  const labelColor = 'text-[9px] font-black text-gray-500 uppercase tracking-widest ml-3 mb-1';

  const probas = form.cat === 'gold' 
    ? ['583', '585', '750', '875', '916', '999'] 
    : ['925'];

  const getKarat = (proba: string) => {
    switch(proba) {
      case '583': case '585': return '14K';
      case '750': return '18K';
      case '875': return '21K';
      case '916': return '22K';
      case '999': return '24K';
      case '925': return 'Silver';
      default: return '';
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (form.images.length >= 5) {
      alert(lang === 'uz' ? "Ko'pi bilan 5 ta rasm yuklash mumkin" : lang === 'ru' ? "Максимум 5 фото" : "Maximum 5 photos allowed");
      e.target.value = '';
      return;
    }
    setIsUploading(true);
    const result = await uploadImage(file);
    setIsUploading(false);
    e.target.value = '';
    if (result.ok && result.url) {
      setForm(prev => ({ ...prev, images: [...prev.images, result.url as string] }));
      if ((window as any).Telegram?.WebApp?.HapticFeedback) {
        (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
    } else {
      alert((lang === 'uz' ? "Rasm yuklanmadi: " : lang === 'ru' ? "Изображение не загружено: " : "Upload failed: ") + (result.error || ''));
    }
  };

  const removeImage = (i: number) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));
  };

  const handleSubmit = () => {
    if (!form.title || !form.price || form.images.length === 0 || !form.gram) {
      if ((window as any).Telegram?.WebApp?.HapticFeedback) {
        (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
      return alert(lang === 'uz' ? "Iltimos, barcha majburiy maydonlarni to'ldiring (kamida 1 ta rasm)!" : lang === 'ru' ? "Пожалуйста, заполните все обязательные поля!" : "Please fill in all required fields!");
    }

    const karat = getKarat(form.proba);

    // Mahsulotni bazaga "kutilmoqda" holatida yuboramiz. Admin tasdiqlagach saytda ko'rinadi.
    submitProduct({
      cat: form.cat,
      type: form.type,
      title: form.title,
      price: form.price,
      gram: form.gram,
      proba: form.proba,
      karat,
      desc: form.desc,
      location: form.location,
      img: form.images[0],
      images: form.images,
      store: form.store || account.storeName || 'Rich Emirates',
    }).then((res) => {
      if (!res.ok) {
        alert((lang === 'uz' ? 'Yuborishda xatolik: ' : lang === 'ru' ? 'Ошибка отправки: ' : 'Submit error: ') + (res.error || ''));
      }
    });

    setIsSent(true);
    if ((window as any).Telegram?.WebApp?.HapticFeedback) {
      (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
    setTimeout(onClose, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[150] flex items-center justify-center p-4 animate-fade-in">
      <div className={`w-full max-w-md ${bgColor} border border-[#d4af37]/30 rounded-[40px] p-6 shadow-2xl overflow-y-auto max-h-[92vh] transition-colors relative`}>
        {isSent ? (
          <div className="text-center py-12 space-y-4 animate-slide-up">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
              <i className="fas fa-check-circle text-5xl"></i>
            </div>
            <h3 className={`text-2xl font-black ${textColor} uppercase tracking-tighter`}>{strings.sentToAdmin}</h3>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">{strings.close}...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6 px-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#d4af37]/10 rounded-xl flex items-center justify-center text-[#d4af37]">
                  <i className="fas fa-store"></i>
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#d4af37] uppercase tracking-tighter italic">{strings.sellTitle}</h2>
                  <p className="text-[7px] font-black text-[#d4af37]/60 uppercase tracking-widest">{account.storeName}</p>
                </div>
              </div>
              <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-white/5 rounded-full text-gray-400 active:scale-75 transition-transform"><i className="fas fa-times"></i></button>
            </div>

            <div className="space-y-5 pb-4">
              {/* Category Selection */}
              <div>
                <label className={labelColor}>{strings.selectCat}</label>
                <div className="flex gap-2">
                  {['gold', 'silver'].map(c => (
                    <button 
                      key={c}
                      onClick={() => setForm({...form, cat: c, proba: c === 'gold' ? '585' : '925'})}
                      className={`flex-1 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${form.cat === c ? 'bg-[#d4af37] text-black border-[#d4af37]' : `${inputBg} text-gray-500`}`}
                    >
                      {c === 'gold' ? strings.gold : strings.silver}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mahsulot turi va Do'kon nomi */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={labelColor}>{lang === 'uz' ? 'Mahsulot turi' : lang === 'ru' ? 'Тип товара' : 'Type'}</label>
                  <select
                    className={`w-full ${inputBg} rounded-xl p-4 text-sm ${textColor} font-bold outline-none border border-transparent focus:border-[#d4af37]/50 appearance-none`}
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                  >
                    {PRODUCT_TYPES.map(t => <option key={t.id} value={t.id}>{(t.label as any)[lang] || t.label.uz}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelColor}>{lang === 'uz' ? "Do'kon nomi" : lang === 'ru' ? 'Магазин' : 'Store'}</label>
                  <input
                    type="text"
                    placeholder={lang === 'uz' ? "Do'kon nomi" : 'Магазин'}
                    className={`w-full ${inputBg} rounded-xl p-4 text-sm ${textColor} font-bold outline-none border border-transparent focus:border-[#d4af37]/50`}
                    value={form.store}
                    onChange={e => setForm({ ...form, store: e.target.value })}
                  />
                </div>
              </div>

              {/* Rasmlar (5 tagacha) — mijozlar mahsulotni har tomondan ko'radi */}
              <div>
                <label className={labelColor}>{strings.uploadImg} ({form.images.length}/5)</label>
                <div className="grid grid-cols-3 gap-2">
                  {form.images.map((url, i) => (
                    <div key={i} className="relative w-full aspect-square rounded-2xl overflow-hidden border border-[#d4af37]/30">
                      <img src={url} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center text-[10px] active:scale-90"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 bg-[#d4af37] text-black text-[6px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {lang === 'uz' ? 'Asosiy' : lang === 'ru' ? 'Главное' : 'Main'}
                        </span>
                      )}
                    </div>
                  ))}
                  {form.images.length < 5 && (
                    <label className="w-full aspect-square border-2 border-dashed border-[#d4af37]/30 hover:bg-[#d4af37]/5 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all">
                      {isUploading ? (
                        <i className="fas fa-circle-notch fa-spin text-xl text-[#d4af37]"></i>
                      ) : (
                        <>
                          <i className="fas fa-plus text-[#d4af37] text-lg"></i>
                          <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mt-1">{lang === 'uz' ? 'Rasm' : 'Фото'}</span>
                        </>
                      )}
                      <input type="file" hidden accept="image/*" onChange={handleUpload} />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className={labelColor}>{strings.productTitle}</label>
                  <input type="text" placeholder={lang === 'uz' ? "Mahsulot nomi..." : lang === 'ru' ? "Название товара..." : "Product name..."} className={`w-full ${inputBg} rounded-xl p-4 text-sm ${textColor} font-bold outline-none border border-transparent focus:border-[#d4af37]/50 transition-all`} value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={labelColor}>{strings.productPrice}</label>
                    <input type="number" placeholder="0.00 $" className={`w-full ${inputBg} rounded-xl p-4 text-sm ${textColor} font-bold outline-none border border-transparent focus:border-[#d4af37]/50 transition-all`} value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelColor}>{strings.productWeight}</label>
                    <input type="text" placeholder={lang === 'uz' ? "Gramm" : lang === 'ru' ? "Грамм" : "Grams"} className={`w-full ${inputBg} rounded-xl p-4 text-sm ${textColor} font-bold outline-none border border-transparent focus:border-[#d4af37]/50 transition-all`} value={form.gram} onChange={e => setForm({...form, gram: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={labelColor}>{strings.productPurity}</label>
                    <select 
                      className={`w-full ${inputBg} rounded-xl p-4 text-sm ${textColor} font-bold outline-none border border-transparent focus:border-[#d4af37]/50 appearance-none`}
                      value={form.proba}
                      onChange={e => setForm({...form, proba: e.target.value})}
                    >
                      {probas.map(p => <option key={p} value={p}>{p} ({getKarat(p)})</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={labelColor}>{strings.selectReg}</label>
                    <select 
                      className={`w-full ${inputBg} rounded-xl p-4 text-sm ${textColor} font-bold outline-none border border-transparent focus:border-[#d4af37]/50 appearance-none`}
                      value={form.location}
                      onChange={e => setForm({...form, location: e.target.value})}
                    >
                      {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={labelColor}>{strings.productDesc}</label>
                  <textarea 
                    rows={3}
                    placeholder={lang === 'uz' ? "Batafsil ma'lumot..." : lang === 'ru' ? "Подробное описание..." : "Detailed description..."} 
                    className={`w-full ${inputBg} rounded-xl p-4 text-sm ${textColor} font-bold outline-none border border-transparent focus:border-[#d4af37]/50 transition-all resize-none`} 
                    value={form.desc} 
                    onChange={e => setForm({...form, desc: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2 pb-6">
                <button onClick={onClose} className={`flex-1 py-4 ${theme === 'light' ? 'bg-gray-200 text-black' : 'bg-white/5 text-gray-400'} font-black rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-all`}>{strings.cancel}</button>
                <button 
                  onClick={handleSubmit} 
                  className="flex-[2] py-4 bg-[#d4af37] text-black font-black rounded-2xl shadow-[0_10px_30px_rgba(212,175,55,0.3)] active:scale-95 transition-all text-xs uppercase tracking-widest"
                >
                  {strings.send}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

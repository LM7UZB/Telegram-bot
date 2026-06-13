
import React, { useState } from 'react';
import { UIStrings, Language, UserAccount } from '../types';
import { IMG_API_KEY, REGIONS } from '../constants';
import { notifyAdmin, customerInfoText } from '../utils/telegram';

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
    title: '', 
    price: '', 
    gram: '', 
    proba: '585', 
    desc: '', 
    location: REGIONS[0], 
    img: '' 
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
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMG_API_KEY}`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setForm(prev => ({ ...prev, img: data.data.url }));
        if ((window as any).Telegram?.WebApp?.HapticFeedback) {
          (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
      }
    } catch (err) {
      alert(lang === 'uz' ? "Rasm yuklashda xatolik yuz berdi" : lang === 'ru' ? "Ошибка при загрузке изображения" : "Error uploading image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!form.title || !form.price || !form.img || !form.gram) {
      if ((window as any).Telegram?.WebApp?.HapticFeedback) {
        (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
      return alert(lang === 'uz' ? "Iltimos, barcha majburiy maydonlarni to'ldiring!" : lang === 'ru' ? "Пожалуйста, заполните все обязательные поля!" : "Please fill in all required fields!");
    }

    const karat = getKarat(form.proba);
    // Magazin nomi endi accountdan olinadi!
    const msg = `💎 YANGI MAHSULOT (do'konga qo'shish)\n${customerInfoText()}\n————————————\n🏢 Do'kon: ${account.storeName || 'Rich Emirates'}\n📂 Kategoriya: ${form.cat.toUpperCase()}\n🏷 Nomi: ${form.title}\n💵 Narxi: ${form.price} $\n⚖️ Vazni: ${form.gram} gr\n🔬 Proba: ${form.proba} (${karat})\n📍 Hudud: ${form.location}\n📝 Tavsif: ${form.desc}\n🖼 Rasm: ${form.img}`;

    // Adminga yuboramiz (Vercel /api/notify orqali, server kerak emas).
    // sendData() ishlatmaymiz, chunki u ilovani darrov yopib yuboradi.
    notifyAdmin(msg);

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

              {/* Image Upload */}
              <div>
                <label className={labelColor}>{strings.uploadImg}</label>
                <label className={`block w-full h-40 border-2 border-dashed ${form.img ? 'border-green-500/50 bg-green-500/5' : 'border-[#d4af37]/30 hover:bg-[#d4af37]/5'} rounded-[30px] flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group`}>
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <i className="fas fa-circle-notch fa-spin text-2xl text-[#d4af37]"></i>
                    </div>
                  ) : form.img ? (
                    <img src={form.img} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <i className="fas fa-cloud-upload-alt text-[#d4af37] text-xl mb-2"></i>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">{strings.uploadImg}</span>
                    </div>
                  )}
                  <input type="file" hidden accept="image/*" onChange={handleUpload} />
                </label>
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

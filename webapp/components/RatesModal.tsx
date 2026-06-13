import React, { useState, useEffect } from 'react';
import { REGIONS, IMG_API_KEY } from '../constants';
import { notifyAdmin, customerInfoText } from '../utils/telegram';

interface MetalRate {
  id: string;
  metal: 'gold' | 'silver';
  proba: string;
  sellPrice: number; // in USD
  buyPrice: number; // in USD
}

interface RatesModalProps {
  onClose: () => void;
  theme: 'dark' | 'light';
  lang: 'uz' | 'ru' | 'en';
  isAdmin?: boolean;
}

const DEFAULT_RATES: MetalRate[] = [
  { id: 'g585', metal: 'gold', proba: '583 / 585', sellPrice: 55, buyPrice: 48 },
  { id: 'g750', metal: 'gold', proba: '750 (18K)', sellPrice: 72, buyPrice: 63 },
  { id: 'g916', metal: 'gold', proba: '916 (22K)', sellPrice: 88, buyPrice: 78 },
  { id: 'g999', metal: 'gold', proba: '999 (Bugʻdoy)', sellPrice: 96, buyPrice: 87 },
  { id: 's925', metal: 'silver', proba: '925 (Kumush)', sellPrice: 1.3, buyPrice: 0.9 },
  { id: 's999', metal: 'silver', proba: '999 (Chorva)', sellPrice: 1.8, buyPrice: 1.3 },
];

export const RatesModal: React.FC<RatesModalProps> = ({ onClose, theme, lang, isAdmin = false }) => {
  const [rates, setRates] = useState<MetalRate[]>(() => {
    const saved = localStorage.getItem('tilla_bazar_metal_rates');
    return saved ? JSON.parse(saved) : DEFAULT_RATES;
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [calcWeight, setCalcWeight] = useState<string>('');
  const [calcSelected, setCalcSelected] = useState<string>(rates[0]?.id || 'g585');

  const [isUserSellOpen, setIsUserSellOpen] = useState(false);
  const [userSellForm, setUserSellForm] = useState({
    metalType: 'gold',
    proba: '585',
    weight: '',
    phone: '+998 ',
    location: 'Toshkent sh.',
    desc: '',
    img: ''
  });
  const [isUserUploading, setIsUserUploading] = useState(false);
  const [isUserSubmitted, setIsUserSubmitted] = useState(false);

  const handleUserPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUserUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMG_API_KEY}`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setUserSellForm(prev => ({ ...prev, img: data.data.url }));
        if ((window as any).Telegram?.WebApp?.HapticFeedback) {
          (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
      }
    } catch (err) {
      alert(lang === 'uz' ? "Rasm yuklashda xatolik yuz berdi" : "Ошибка загрузки изображения");
    } finally {
      setIsUserUploading(false);
    }
  };

  const handleUserSellSubmit = () => {
    if (!userSellForm.weight || !userSellForm.phone || !userSellForm.img) {
      if ((window as any).Telegram?.WebApp?.HapticFeedback) {
        (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
      alert(lang === 'uz' ? "Iltimos, vaznini, telefon raqamingizni va tilla rasmini kiriting!" : "Пожалуйста, введите вес, номер телефона и фото изделия!");
      return;
    }

    const typeLabel = userSellForm.metalType === 'gold' ? (lang === 'uz' ? 'Oltin' : 'Золото') : (lang === 'uz' ? 'Kumush' : 'Серебро');
    const msg = `🔔 BIZGA SOTISH ARIZASI (BUYBACK)\n${customerInfoText()}\n————————————\n📞 Telefon: ${userSellForm.phone}\n📍 Hudud: ${userSellForm.location}\n⚖️ Buyum og'irligi: ${userSellForm.weight} gr\n💎 Metall: ${typeLabel} (${userSellForm.proba})\n📝 Ma'lumot: ${userSellForm.desc || "Kiritilmagan"}\n🖼 Mahsulot rasmi: ${userSellForm.img}`;

    // Adminga yuboramiz (Vercel /api/notify orqali, server kerak emas).
    notifyAdmin(msg);

    setIsUserSubmitted(true);
    if ((window as any).Telegram?.WebApp?.HapticFeedback) {
      (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }

    setTimeout(() => {
      setIsUserSubmitted(false);
      setIsUserSellOpen(false);
      setUserSellForm({
        metalType: 'gold',
        proba: '585',
        weight: '',
        phone: '+998 ',
        location: 'Toshkent sh.',
        desc: '',
        img: ''
      });
    }, 4500);
  };

  useEffect(() => {
    localStorage.setItem('tilla_bazar_metal_rates', JSON.stringify(rates));
  }, [rates]);

  const handlePriceChange = (id: string, field: 'sellPrice' | 'buyPrice', val: string) => {
    const parsed = parseFloat(val) || 0;
    setRates(prev => prev.map(r => r.id === id ? { ...r, [field]: parsed } : r));
  };

  const getSelectedRate = rates.find(r => r.id === calcSelected);
  const calculatedTotal = getSelectedRate && calcWeight
    ? (parseFloat(calcWeight) * getSelectedRate.sellPrice).toFixed(2)
    : '0.00';

  const t = {
    uz: {
      title: "Tilla va Kumush narxlari",
      subtitle: "1 gram uchun sotish va sotib olish narxlari",
      edit: "Narxlarni tahrirlash",
      save: "Saqlash",
      metal: "Metall / Proba",
      sell: "Sotish (1 gr)",
      buy: "Sotib olish (1 gr)",
      calculatorTitle: "Oltin & Kumush Kalkulyatori",
      weightPlaceholder: "0.00 gr",
      weightLabel: "Buyum vazni (grammda):",
      chooseLabel: "Metall va probani tanlang:",
      calcResult: "Jami taxminiy qiymat (Sotish bo'yicha):",
      anyChangesSaved: "Narxlar muvaffaqiyatli saqlandi va yangilandi!",
      reset: "Dastlabki narxlar",
      gold: "Oltin",
      silver: "Kumush",
      sellSectionTitle: "Zargarlik buyumlaringizni bizga soting",
      sellSectionSubtitle: "Eng yaxshi narxlarda sotib olamiz! Buyum suratini yuboring, bog'lanamiz",
      sellBtn: "✨ Bizga tilla/kumush soting (Xarid)",
      sellLabelMetal: "Metall va Proba:",
      sellLabelPhone: "Telefon raqamingiz (Bog'lanish uchun):",
      sellLabelWeight: "Taxminiy og'irligi (gram):",
      sellLabelLocation: "Qayerdanligingiz (Hudud):",
      sellLabelDesc: "Qo'shimcha ma'lumotlar / Holati:",
      sellLabelPhoto: "Zargarlik buyumi rasmini yuklang:",
      sellSubmitting: "Rasm yuklanmoqda...",
      sellSuccess: "Arizangiz qabul qilindi! Tez orada operatorlarimiz telefon orqali bog'lanishadi.",
      sellSendBtn: "Arizani jo'natish (Adminga yuborish)",
    },
    ru: {
      title: "Цены на золото и серебро",
      subtitle: "Цены продажи и покупки за 1 грамм",
      edit: "Редактировать цены",
      save: "Сохранить",
      metal: "Металл / Проба",
      sell: "Продажа (1 гр)",
      buy: "Покупка (1 гр)",
      calculatorTitle: "Калькулятор Золота и Серебра",
      weightPlaceholder: "0.00 гр",
      weightLabel: "Вес изделия (в граммах):",
      chooseLabel: "Выберите металл и пробу:",
      calcResult: "Общая расчетная стоимость (Продажа):",
      anyChangesSaved: "Цены успешно сохранены и обновлены!",
      reset: "Сбросить цены",
      gold: "Золото",
      silver: "Серебро",
      sellSectionTitle: "Продайте нам ваше изделие",
      sellSectionSubtitle: "Отправьте фото изделия, мы позвоним и выкупим его",
      sellBtn: "✨ Продать нам золото/серебро",
      sellLabelMetal: "Металл и Проба:",
      sellLabelPhone: "Ваш номер телефона для связи:",
      sellLabelWeight: "Вес изделия (граммы):",
      sellLabelLocation: "Где вы находитесь (Регион):",
      sellLabelDesc: "Описание / Состояние изделия:",
      sellLabelPhoto: "Загрузите фото ювелирного изделия:",
      sellSubmitting: "Загрузка изображения...",
      sellSuccess: "Ваша заявка принята! Наши операторы свяжутся с вами в ближайшее время.",
      sellSendBtn: "Отправить заявку администратору",
    },
    en: {
      title: "Gold & Silver Rates",
      subtitle: "Selling and buying prices per 1 gram",
      edit: "Edit Prices",
      save: "Save",
      metal: "Metal / Purity",
      sell: "Sell Rate (1g)",
      buy: "Buy Rate (1g)",
      calculatorTitle: "Gold & Silver Calculator",
      weightPlaceholder: "0.00g",
      weightLabel: "Item Weight (in grams):",
      chooseLabel: "Select Metal & Purity:",
      calcResult: "Total Estimated Value (Selling):",
      anyChangesSaved: "Rates successfully saved and updated!",
      reset: "Reset to Default",
      gold: "Gold",
      silver: "Silver",
      sellSectionTitle: "Sell Your Jewelry to Us",
      sellSectionSubtitle: "Send photos and weight, we'll call you to purchase it",
      sellBtn: "✨ Sell Gold/Silver to Us (Buyback)",
      sellLabelMetal: "Metal & Purity:",
      sellLabelPhone: "Your Phone Number (For contact):",
      sellLabelWeight: "Estimated Weight (Grams):",
      sellLabelLocation: "Your Location (Region):",
      sellLabelDesc: "Condition & Additional Details:",
      sellLabelPhoto: "Upload Jewelry Photo:",
      sellSubmitting: "Uploading Photo...",
      sellSuccess: "Your application is submitted! Our operators will call you shortly.",
      sellSendBtn: "Submit Sell Application",
    },
  }[lang] || {
    uz: {
      title: "Tilla va Kumush narxlari",
      subtitle: "1 gram uchun sotish va sotib olish narxlari",
      edit: "Narxlarni tahrirlash",
      save: "Saqlash",
      metal: "Metall / Proba",
      sell: "Sotish (1 gr)",
      buy: "Sotib olish (1 gr)",
      calculatorTitle: "Oltin & Kumush Kalkulyatori",
      weightPlaceholder: "0.00 gr",
      weightLabel: "Buyum vazni (grammda):",
      chooseLabel: "Metall va probani tanlang:",
      calcResult: "Jami taxminiy qiymat (Sotish bo'yicha):",
      anyChangesSaved: "Narxlar muvaffaqiyatli saqlandi va yangilandi!",
      reset: "Dastlabki narxlar",
      gold: "Oltin",
      silver: "Kumush",
      sellSectionTitle: "Zargarlik buyumlaringizni bizga soting",
      sellSectionSubtitle: "Eng yaxshi narxlarda sotib olamiz! Buyum suratini yuboring, bog'lanamiz",
      sellBtn: "✨ Bizga tilla/kumush soting (Xarid)",
      sellLabelMetal: "Metall va Proba:",
      sellLabelPhone: "Telefon raqamingiz (Bog'lanish uchun):",
      sellLabelWeight: "Taxminiy og'irligi (gram):",
      sellLabelLocation: "Qayerdanligingiz (Hudud):",
      sellLabelDesc: "Qo'shimcha ma'lumotlar / Holati:",
      sellLabelPhoto: "Zargarlik buyumi rasmini yuklang:",
      sellSubmitting: "Rasm yuklanmoqda...",
      sellSuccess: "Arizangiz qabul qilindi! Operatorlarimiz tez orada siz bilan bog'lanishadi.",
      sellSendBtn: "Arizani jo'natish (Adminga yuborish)",
    }
  }.uz;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 backdrop-blur-xl bg-black/70 overflow-y-auto scrollbar-none"
    >
      <div 
        className={`w-full max-w-lg rounded-3xl border border-[#d4af37]/45 p-5 sm:p-6 shadow-[0_25px_60px_rgba(212,175,55,0.25)] overflow-hidden relative transition-all duration-300 my-4 sm:my-auto ${
          theme === 'dark' ? 'bg-[#15171e] text-white' : 'bg-white text-gray-900'
        }`}
        id="rates_modal_pane"
      >
        {/* Glow circles in backing */}
        <div className="absolute top-[-30px] right-[-30px] w-32 h-32 bg-[#d4af37]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-30px] left-[-30px] w-32 h-32 bg-[#ffeed0]/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex justify-between items-start mb-5 relative z-10">
          <div className="pr-4">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-[#d4af37] via-[#fff2af] to-[#d4af37] bg-clip-text text-transparent drop-shadow-sm flex items-center gap-2">
              <i className="fas fa-coins text-gold-500 text-lg sm:text-xl animate-pulse"></i>
              {t.title}
            </h3>
            <p className={`text-[11px] sm:text-xs mt-1 leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t.subtitle}</p>
          </div>
          <button 
            onClick={onClose}
            className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 relative z-20 active:scale-90 ${
              theme === 'dark' 
                ? 'border-white/20 hover:border-[#d4af37]/50 bg-white/5 hover:bg-[#d4af37]/10 text-white' 
                : 'border-gray-300 hover:border-[#d4af37]/50 bg-gray-50 hover:bg-[#d4af37]/5 text-gray-800'
            }`}
            title={lang === 'uz' ? "Yopish" : lang === 'ru' ? "Закрыть" : "Close"}
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>

        {/* Metal Prices Grid / Table */}
        <div className="space-y-3 mb-6 relative z-10">
          <div className={`grid grid-cols-3 text-[10px] font-black uppercase tracking-wider pb-1.5 border-b ${
            theme === 'dark' ? 'text-gray-400 border-white/10' : 'text-gray-500 border-gray-100'
          }`}>
            <span>{t.metal}</span>
            <span className="text-center">{t.sell}</span>
            <span className="text-center">{t.buy}</span>
          </div>

          <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
            {rates.map((rate) => (
              <div 
                key={rate.id}
                className={`grid grid-cols-3 items-center px-3.5 py-3 rounded-2xl border transition-all duration-300 ${
                  theme === 'dark' 
                    ? 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]' 
                    : 'bg-gray-50/50 border-gray-100 hover:bg-gray-50'
                }`}
              >
                {/* Metal Badge & Proba */}
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${rate.metal === 'gold' ? 'bg-[#d4af37]' : 'bg-gray-400'}`}></span>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-tight">
                      {rate.metal === 'gold' ? t.gold : t.silver}
                    </div>
                    <div className={`text-[10px] font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {rate.proba}
                    </div>
                  </div>
                </div>

                {/* Selling price */}
                <div className="flex justify-center px-1">
                  {isEditing ? (
                    <div className="relative flex items-center">
                      <span className="absolute left-2 text-xs text-[#d4af37] font-semibold">$</span>
                      <input 
                        type="number" 
                        step="0.01"
                        value={rate.sellPrice} 
                        onChange={(e) => handlePriceChange(rate.id, 'sellPrice', e.target.value)}
                        className={`w-20 pl-5 pr-2 py-1 text-center font-mono text-xs rounded-lg border focus:outline-none focus:border-[#d4af37] ${
                          theme === 'dark' ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-black'
                        }`}
                      />
                    </div>
                  ) : (
                    <span className="text-sm font-black font-mono text-[#d4af37]">${rate.sellPrice} / g</span>
                  )}
                </div>

                {/* Buying price */}
                <div className="flex justify-center px-1">
                  {isEditing ? (
                    <div className="relative flex items-center">
                      <span className="absolute left-2 text-xs text-green-500 font-semibold">$</span>
                      <input 
                        type="number" 
                        step="0.01"
                        value={rate.buyPrice} 
                        onChange={(e) => handlePriceChange(rate.id, 'buyPrice', e.target.value)}
                        className={`w-20 pl-5 pr-2 py-1 text-center font-mono text-xs rounded-lg border focus:outline-none focus:border-green-500 ${
                          theme === 'dark' ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-gray-300 text-black'
                        }`}
                      />
                    </div>
                  ) : (
                    <span className={`text-sm font-bold font-mono ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      ${rate.buyPrice} / g
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Premium Calculator widget - Enlarged, with distinct headers and transparent glass-morphic theme */}
        <div className={`p-5 rounded-2xl mb-6 border relative z-10 transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-gradient-to-b from-white/[0.04] to-white/[0.01] border-white/10 shadow-[inner_0_1px_1px_rgba(255,255,255,0.05)]' 
            : 'bg-gradient-to-b from-gray-50 to-white border-gray-200/80 shadow-md'
        }`}>
          <div className="flex items-center gap-2 mb-3.5 pb-1 border-b border-[#d4af37]/10">
            <div className="w-6 h-6 rounded-lg bg-[#d4af37]/10 flex items-center justify-center">
              <i className="fas fa-calculator text-xs text-[#d4af37] animate-pulse"></i>
            </div>
            <h4 className="text-xs font-black uppercase tracking-widest text-[#d4af37]">
              {t.calculatorTitle}
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {/* Metal Select Dropdown */}
            <div className="space-y-1">
              <label className={`block text-[10px] font-black uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t.chooseLabel}
              </label>
              <select 
                value={calcSelected}
                onChange={(e) => setCalcSelected(e.target.value)}
                className={`w-full px-3.5 py-3 text-xs rounded-xl border focus:outline-none focus:border-[#d4af37] font-black transition-all ${
                  theme === 'dark' 
                    ? 'bg-black/60 border-white/15 text-white active:bg-black' 
                    : 'bg-white border-gray-300 text-black shadow-sm'
                }`}
              >
                {rates.map(r => (
                  <option key={r.id} value={r.id} className={theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}>
                    {r.metal === 'gold' ? `🟡 ${t.gold}` : `⚪ ${t.silver}`} - {r.proba} (${r.sellPrice}/g)
                  </option>
                ))}
              </select>
            </div>

            {/* Weight Input */}
            <div className="space-y-1">
              <label className={`block text-[10px] font-black uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t.weightLabel}
              </label>
              <div className="relative flex items-center">
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  placeholder={t.weightPlaceholder}
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(e.target.value)}
                  className={`w-full pl-3.5 pr-12 py-2.5 text-sm font-black font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all ${
                    theme === 'dark' 
                      ? 'bg-black/60 border-white/15 text-white placeholder-gray-600' 
                      : 'bg-white border-gray-300 text-black placeholder-gray-400 shadow-sm'
                  }`}
                />
                <span className="absolute right-3.5 text-[11px] font-black uppercase tracking-wider text-[#d4af37] pointer-events-none select-none">
                  Gr.
                </span>
              </div>
            </div>
          </div>

          {/* Elegant display showing current math & final calculated sum in premium format */}
          <div className={`mt-3 pt-3 border-t transition-all duration-300 ${
            theme === 'dark' ? 'border-white/5' : 'border-gray-100'
          }`}>
            <div className="flex justify-between items-center bg-black/20 dark:bg-black/40 rounded-xl p-3.5 border border-white/[0.03]">
              <div className="space-y-0.5">
                <span className={`block text-[10px] font-black uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t.calcResult}
                </span>
                <span className={`block text-[10px] font-mono opacity-80 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  {calcWeight || '0'} gr × ${getSelectedRate?.sellPrice || 0}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl sm:text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#fff2af] to-[#d4af37] drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">
                  ${calculatedTotal}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer item buyback / sell back form - Integrated directly under calculator */}
        <div className={`p-4 rounded-2xl mb-6 border relative z-10 transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-gradient-to-b from-[#181a20]/95 to-[#1c1e26]/95 border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)]' 
            : 'bg-gradient-to-b from-gray-50 to-white border-gray-200 shadow-md'
        }`}>
          <button 
            type="button"
            onClick={() => {
              setIsUserSellOpen(!isUserSellOpen);
              if ((window as any).Telegram?.WebApp?.HapticFeedback) {
                (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light');
              }
            }}
            className="w-full flex items-center justify-between focus:outline-none text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-green-500/15 flex items-center justify-center">
                <i className="fas fa-hand-holding-usd text-sm text-green-500 animate-bounce"></i>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-green-500">
                  {t.sellSectionTitle}
                </h4>
                <p className={`text-[9px] sm:text-[10px] font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t.sellSectionSubtitle}
                </p>
              </div>
            </div>
            <i className={`fas fa-chevron-down text-gray-400 text-xs transition-transform duration-300 ${isUserSellOpen ? 'rotate-180 text-green-500' : ''}`}></i>
          </button>

          {isUserSellOpen && (
            <div className="mt-4 pt-4 border-t border-dashed border-[#d4af37]/25 animate-fade-in">
              {isUserSubmitted ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-14 h-14 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(34,197,94,0.3)] animate-pulse">
                    <i className="fas fa-check-circle text-4xl"></i>
                  </div>
                  <h5 className="text-sm font-black uppercase tracking-tight text-green-500">
                    {lang === 'uz' ? 'Ariza joʻnatildi!' : lang === 'ru' ? 'Заявка отправлена!' : 'App Submitted!'}
                  </h5>
                  <p className={`text-xs px-2 font-bold leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {t.sellSuccess}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Metal Type Selection */}
                  <div>
                    <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t.sellLabelMetal}
                    </label>
                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => setUserSellForm(prev => ({ ...prev, metalType: 'gold', proba: '585' }))}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                          userSellForm.metalType === 'gold' 
                            ? 'bg-[#d4af37] text-black shadow-md shadow-[#d4af37]/15' 
                            : theme === 'dark' 
                              ? 'bg-black/50 hover:bg-black/8 w-full text-gray-500 border border-white/5' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border border-transparent'
                        }`}
                      >
                        🟡 {t.gold}
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserSellForm(prev => ({ ...prev, metalType: 'silver', proba: '925' }))}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                          userSellForm.metalType === 'silver' 
                            ? 'bg-gray-400 text-black shadow-md shadow-gray-400/10' 
                            : theme === 'dark' 
                              ? 'bg-black/50 hover:bg-black/8 w-full text-gray-500 border border-white/5' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border border-transparent'
                        }`}
                      >
                        ⚪ {t.silver}
                      </button>
                    </div>
                  </div>

                  {/* Purity & Gram in Grid */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className={`block text-[10px] font-black uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {lang === 'uz' ? 'Proba / Simvol:' : lang === 'ru' ? 'Проба / Символ:' : 'Purity / Symbol:'}
                      </label>
                      <select
                        value={userSellForm.proba}
                        onChange={(e) => setUserSellForm(prev => ({ ...prev, proba: e.target.value }))}
                        className={`w-full px-3 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-[#d4af37] font-black transition-all ${
                          theme === 'dark' ? 'bg-black/60 border-white/10 text-white' : 'bg-white border-gray-300 text-black'
                        }`}
                      >
                        {userSellForm.metalType === 'gold' ? (
                          <>
                            <option value="583">583 (14K)</option>
                            <option value="585">585 (14K)</option>
                            <option value="750">750 (18K)</option>
                            <option value="875">875 (21K)</option>
                            <option value="916">916 (22K)</option>
                            <option value="999">999 (24K - Bug'doy)</option>
                          </>
                        ) : (
                          <>
                            <option value="925">925 (Kumush)</option>
                            <option value="999">999 (Chorva)</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-[10px] font-black uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t.sellLabelWeight}
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00 gr"
                          value={userSellForm.weight}
                          onChange={(e) => setUserSellForm(prev => ({ ...prev, weight: e.target.value }))}
                          className={`w-full pl-3 pr-10 py-2.5 text-xs font-black font-mono rounded-xl border focus:outline-none focus:border-[#d4af37] ${
                            theme === 'dark' ? 'bg-black/60 border-white/10 text-white placeholder-gray-600' : 'bg-white border-gray-300 text-black placeholder-gray-400'
                          }`}
                        />
                        <span className="absolute right-3 text-[10px] font-black text-[#d4af37] pointer-events-none uppercase">gr</span>
                      </div>
                    </div>
                  </div>

                  {/* Phone & Region Dropdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className={`block text-[10px] font-black uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t.sellLabelPhone}
                      </label>
                      <input
                        type="text"
                        placeholder="+998 90 123 45 67"
                        value={userSellForm.phone}
                        onChange={(e) => setUserSellForm(prev => ({ ...prev, phone: e.target.value }))}
                        className={`w-full px-3 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-[#d4af37] font-black font-mono ${
                          theme === 'dark' ? 'bg-black/60 border-white/10 text-white placeholder-gray-600' : 'bg-white border-gray-300 text-black placeholder-gray-400'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-[10px] font-black uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t.sellLabelLocation}
                      </label>
                      <select
                        value={userSellForm.location}
                        onChange={(e) => setUserSellForm(prev => ({ ...prev, location: e.target.value }))}
                        className={`w-full px-3 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-[#d4af37] font-black ${
                          theme === 'dark' ? 'bg-black/60 border-white/10 text-white' : 'bg-white border-gray-300 text-black'
                        }`}
                      >
                        {REGIONS.map(reg => (
                          <option key={reg} value={reg}>{reg}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Drag-&-drop / Camera gold photo upload via ImgBB */}
                  <div>
                    <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t.sellLabelPhoto}
                    </label>
                    <label className={`block w-full h-28 border-2 border-dashed ${
                      userSellForm.img ? 'border-green-500/50 bg-green-500/5' : 'border-[#d4af37]/35 hover:border-[#d4af37] hover:bg-white/[0.02]'
                    } rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group`}>
                      {isUserUploading ? (
                        <div className="flex flex-col items-center gap-1.5">
                          <i className="fas fa-circle-notch fa-spin text-lg text-[#d4af37]"></i>
                          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{t.sellSubmitting}</span>
                        </div>
                      ) : userSellForm.img ? (
                        <div className="relative w-full h-full">
                          <img src={userSellForm.img} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="Buyback user upload preview" />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[9px] font-black text-white uppercase tracking-wider">{lang === 'uz' ? 'Rasmni oʻzgartirish' : 'Изменить фото'}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-3">
                          <i className="fas fa-camera text-[#d4af37] text-lg mb-1 animate-pulse"></i>
                          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">{lang === 'uz' ? 'Zargarlik buyumi rasmini yuklash' : 'Загрузить фото изделия'}</span>
                        </div>
                      )}
                      <input type="file" hidden accept="image/*" onChange={handleUserPhotoUpload} />
                    </label>
                  </div>

                  {/* Conditions & details */}
                  <div>
                    <label className={`block text-[10px] font-black uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t.sellLabelDesc}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={lang === 'uz' ? "Buyum qanaqa holatda ekanligi (shikastlanmagan, yangi, uzuk, zirak va hokazo...)" : "Состояние и описание изделия..."}
                      value={userSellForm.desc}
                      onChange={(e) => setUserSellForm(prev => ({ ...prev, desc: e.target.value }))}
                      className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-[#d4af37] font-bold resize-none ${
                        theme === 'dark' ? 'bg-black/60 border-white/10 text-white placeholder-gray-600' : 'bg-white border-gray-300 text-black placeholder-gray-400'
                      }`}
                    />
                  </div>

                  {/* Submit to admin */}
                  <button
                    type="button"
                    onClick={handleUserSellSubmit}
                    className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-md active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-paper-plane text-xs"></i>
                    {t.sellSendBtn}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons — faqat admin narxlarni tahrirlay oladi */}
        {isAdmin && (
        <div className="flex gap-2 relative z-10">
          {isEditing ? (
            <>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  if ((window as any).Telegram?.WebApp?.HapticFeedback) {
                    (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                  }
                }}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-[#d4af37] to-[#e7ca70] text-black rounded-xl font-black text-xs uppercase tracking-wider active:scale-95 transition-all duration-300 shadow-md shadow-[#d4af37]/20"
              >
                <i className="fas fa-check mr-1.5"></i>
                {t.save}
              </button>
              <button 
                onClick={() => {
                  setRates(DEFAULT_RATES);
                  setIsEditing(false);
                }}
                className={`py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider active:scale-95 transition-all duration-300 ${
                  theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
                title={t.reset}
              >
                <i className="fas fa-undo"></i>
              </button>
            </>
          ) : (
            <button 
              onClick={() => {
                setIsEditing(true);
                if ((window as any).Telegram?.WebApp?.HapticFeedback) {
                  (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                }
              }}
              className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider active:scale-95 transition-all duration-300 flex items-center justify-center gap-1.5 border border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/10`}
            >
              <i className="fas fa-edit"></i>
              {t.edit}
            </button>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

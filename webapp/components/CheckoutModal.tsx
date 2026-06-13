import React, { useState, useEffect } from 'react';
import { UIStrings, Language } from '../types';

interface CheckoutModalProps {
  onClose: () => void;
  onCash: () => void;
  onInstallment: () => void;
  strings: UIStrings;
  theme: 'dark' | 'light';
  totalPrice: number;
  lang: Language;
  onConfirm?: (info: { paymentType: 'cash' | 'card' | 'installment'; details: string }) => void;
}

type CheckoutStep = 'select' | 'cash-details' | 'card-details' | 'installment-details' | 'success';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ 
  onClose, onCash, onInstallment, strings, theme, totalPrice, lang, onConfirm 
}) => {
  const [step, setStep] = useState<CheckoutStep>('select');
  const [selectedOption, setSelectedOption] = useState<'cash' | 'card' | 'installment' | null>(null);
  
  // Confirmed States
  const [promoCode, setPromoCode] = useState('');
  const [isPromoValid, setIsPromoValid] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Cash form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [address, setAddress] = useState('');

  // Card form fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Installment fields
  const [selectedMonths, setSelectedMonths] = useState<3 | 6 | 12 | 24>(12);

  const VALID_PROMO = "GOLD2025"; 

  const bgColor = theme === 'light' ? 'bg-[#f4f5f8]' : 'bg-[#121214]';
  const cardBg = theme === 'light' ? 'bg-white shadow-md border border-gray-100' : 'bg-[#1c1c1e] border-white/5';
  const textColor = theme === 'light' ? 'text-black' : 'text-white';
  const itemBg = theme === 'light' ? 'bg-white border-gray-100' : 'bg-[#18181b] border-white/5';
  const inputBg = theme === 'light' ? 'bg-[#eaebec]/60 border-transparent' : 'bg-white/5 border-transparent';

  useEffect(() => {
    if (promoCode.toUpperCase() === VALID_PROMO) {
      setIsPromoValid(true);
      setShowCelebration(true);
      if ((window as any).Telegram?.WebApp?.HapticFeedback) {
        (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
      setTimeout(() => setShowCelebration(false), 3000);
    } else {
      setIsPromoValid(false);
    }
  }, [promoCode]);

  // Handle phone entry auto formatter
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '');
    if (raw.startsWith('998')) raw = raw.substring(3);
    let formatted = '+998 ';
    if (raw.length > 0) formatted += raw.substring(0, 2);
    if (raw.length > 2) formatted += ' ' + raw.substring(2, 5);
    if (raw.length > 5) formatted += ' ' + raw.substring(5, 7);
    if (raw.length > 7) formatted += ' ' + raw.substring(7, 9);
    setPhone(formatted.trimEnd());
  };

  // Format Card Number entry (groups of 4)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').substring(0, 16);
    let formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  // Format Card Expiry (MM/YY)
  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').substring(0, 4);
    let formatted = raw;
    if (raw.length > 2) {
      formatted = raw.substring(0, 2) + '/' + raw.substring(2);
    }
    setCardExpiry(formatted);
  };

  const calculateInstallment = () => {
    let interest = 0;
    if (selectedMonths === 6) interest = 0.05;
    if (selectedMonths === 12) interest = 0.10;
    if (selectedMonths === 24) interest = 0.18;

    const totalWithInterest = totalPrice * (1 + interest);
    const monthlyPayment = Math.round(totalWithInterest / selectedMonths);
    const totalInterestAdded = Math.round(totalPrice * interest);

    return {
      monthly: monthlyPayment,
      total: Math.round(totalWithInterest),
      interest: totalInterestAdded
    };
  };

  const installmentDetails = calculateInstallment();

  const handleNextStep = () => {
    if (selectedOption === 'cash') setStep('cash-details');
    if (selectedOption === 'card') setStep('card-details');
    if (selectedOption === 'installment') setStep('installment-details');
    if ((window as any).Telegram?.WebApp?.HapticFeedback) {
      (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
  };

  const handleConfirmOrder = () => {
    setStep('success');
    if (selectedOption === 'cash') onCash();
    if (selectedOption === 'installment') onInstallment();

    // Adminga yuboriladigan buyurtma tafsilotini tayyorlaymiz (barcha to'lov turlari uchun, karta ham)
    let details = '';
    if (selectedOption === 'cash') {
      details = `To'lov: Naqd (yetkazib berishda)\n🧾 Ism: ${fullName}\n📞 Tel: ${phone}\n📍 Manzil: ${address}`;
    } else if (selectedOption === 'card') {
      details = `To'lov: Karta orqali (online)\n💳 Karta egasi: ${cardHolder || '—'}`;
    } else if (selectedOption === 'installment') {
      details = `To'lov: Muddatli (${selectedMonths} oy)\n📆 Oylik: $${installmentDetails.monthly}\n💵 Jami (foiz bilan): $${installmentDetails.total}`;
    }
    if (selectedOption && onConfirm) {
      onConfirm({ paymentType: selectedOption, details });
    }

    setShowCelebration(true);
    if ((window as any).Telegram?.WebApp?.HapticFeedback) {
      (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
    setTimeout(() => setShowCelebration(false), 5000);
  };

  // Localized words for payment
  const t = {
    title: lang === 'uz' ? "TO'LOV USULINI TANLANG" : lang === 'ru' ? "ВЫБЕРИТЕ СПОСОБ ОПЛАТЫ" : "CHOOSE PAYMENT METHOD",
    cashTitle: lang === 'uz' ? "NAQD PULDA" : lang === 'ru' ? "НАЛИЧНЫМИ" : "CASH ON DELIVERY",
    cashDesc: lang === 'uz' ? "Yetkazib berilganda to'lanadi" : lang === 'ru' ? "Оплачивается при доставке" : "Paid on delivery",
    cardTitle: lang === 'uz' ? "KARTA ORQALI" : lang === 'ru' ? "КАРТОЙ ОНЛАЙН" : "BY DEBIT CARD",
    cardDesc: lang === 'uz' ? "Visa / Mastercard / Humo / Uzcard" : lang === 'ru' ? "Visa / Mastercard / Humo / Uzcard" : "Visa / Mastercard / Humo / Uzcard",
    instTitle: lang === 'uz' ? "MUDDATLI BO'LIB TO'LASH" : lang === 'ru' ? "РАССРОЧКА" : "INSTALLMENT PAYMENTS",
    instDesc: lang === 'uz' ? "3, 6, 12 yoki 24 oyga bo'lib to'lash" : lang === 'ru' ? "3, 6, 12 или 24 месяца" : "Split in 3, 6, 12 or 24 months",
    confirmBtn: lang === 'uz' ? "BUYURTMANI TASDIQLASH" : lang === 'ru' ? "ПОДТВЕРДИТЬ ЗАКАЗ" : "CONFIRM ORDER",
    cancelBtn: lang === 'uz' ? "BEKOR QILISH" : lang === 'ru' ? "ОТМЕНА" : "CANCEL",
    summaryTitle: lang === 'uz' ? "BUYURTMA XULOSASI" : lang === 'ru' ? "СВОДКА ЗАКАЗА" : "ORDER SUMMARY",
    totalLabel: lang === 'uz' ? "Jami" : lang === 'ru' ? "Итого" : "Total",
    enterPromo: lang === 'uz' ? "Promokodni kiriting" : lang === 'ru' ? "Введите промокод" : "Enter coupon code",
    promoTip: lang === 'uz' ? "Promokod faqat naqd pulda amal qiladi." : lang === 'ru' ? "Промокод действует только при оплате наличными." : "Promocode only valid for cash payments.",
    deliveryTitle: lang === 'uz' ? "YETKAZIB BERISH" : lang === 'ru' ? "ДОСТАВКА" : "DELIVERY INFORMATION",
    nameLabel: lang === 'uz' ? "To'liq ismingiz" : lang === 'ru' ? "Ваше полное имя" : "Full Name",
    phoneLabel: lang === 'uz' ? "Telefon raqamingiz" : lang === 'ru' ? "Номер телефона" : "Phone Number",
    addressLabel: lang === 'uz' ? "Yetkazib berish manzili" : lang === 'ru' ? "Адрес доставки" : "Delivery address",
    cardHolderPlaceholder: lang === 'uz' ? "KARTA EGASI" : lang === 'ru' ? "ВЛАДЕЛЕЦ КАРТЫ" : "CARD HOLDER",
    cardNumberPlaceholder: lang === 'uz' ? "Karta raqami" : lang === 'ru' ? "Номер карты" : "Card Number",
    cardExpiryPlaceholder: lang === 'uz' ? "Amal qilish muddati" : lang === 'ru' ? "Срок действия" : "Expiry Month/Year",
    cardFlipTip: lang === 'uz' ? "↑ Kartani burish uchun bosing" : lang === 'ru' ? "↑ Нажмите на карту, чтобы перевернуть" : "↑ Tap card to flip",
    payNow: lang === 'uz' ? "HOZIR TO'LASH" : lang === 'ru' ? "ОПЛАТИТЬ СЕЙЧАС" : "PAY NOW",
    monthsTitle: lang === 'uz' ? "MUDDAT TANLANG" : lang === 'ru' ? "ВЫБЕРИТЕ СРОК" : "CHOOSE TERM",
    monthLabel: lang === 'uz' ? "OY" : lang === 'ru' ? "МЕС" : "MO",
    monthlyLabel: lang === 'uz' ? "OYLIK TO'LOV" : lang === 'ru' ? "ЕЖЕМЕСЯЧНЫЙ ПЛАТЕЖ" : "MONTHLY PAYMENT",
    totalWithInterest: lang === 'uz' ? "Jami (foiz bilan)" : lang === 'ru' ? "Итого (с процентами)" : "Total with interest",
    interestLabel: lang === 'uz' ? "To'lov foizi" : lang === 'ru' ? "Процент наценки" : "Markup fee",
    installmentAlert: lang === 'uz' ? "ESLATMA: Menejerimiz siz bilan bog'lanib, kerakli hujjatlarni rasmiylashtiradi." : lang === 'ru' ? "ПРИМЕЧАНИЕ: Наш менеджер свяжется с вами для оформления документов." : "NOTE: Our representative will call you to finalize paperwork.",
    completeInstallment: lang === 'uz' ? "MUDDATLI TO'LOVNI RASMIYLASHTIRISH" : lang === 'ru' ? "ОФОРМИТЬ В РАССРОЧКУ" : "ORDER IN INSTALLMENTS",
    successSub: lang === 'uz' ? "Buyurtmangiz muvaffaqiyatli rasmiylashtirildi!" : lang === 'ru' ? "Ваш заказ успешно принят!" : "Your order has been registered!",
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in overflow-y-auto">
      {/* Dynamic Confetti Celebration */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-[300] flex items-center justify-center overflow-hidden">
          {['🥳', '🎉', '🌟', '💎', '🔥', '👏', '👑', '🥇', '⚡'].map((emoji, i) => (
            <div 
              key={i} 
              className="absolute text-5xl animate-bounce"
              style={{ 
                left: `${Math.random() * 80 + 10}%`, 
                top: `${Math.random() * 60 + 10}%`,
                animationDelay: `${i * 0.1}s`,
                opacity: 0.9,
                transform: `rotate(${Math.sin(i) * 30}deg)`
              }}
            >
              {emoji}
            </div>
          ))}
        </div>
      )}

      {/* Main Drawer container */}
      <div className={`w-full sm:max-w-md ${bgColor} rounded-t-[40px] sm:rounded-[40px] border-t sm:border border-[#d4af37]/30 shadow-2xl p-6 sm:p-8 space-y-6 relative max-sm:pb-12 animate-slide-up`}>
        
        {/* Step: Selection Mode */}
        {step === 'select' && (
          <>
            {/* Soft drag indicator on mobile */}
            <div className="w-12 h-1 bg-gray-300 dark:bg-zinc-700 rounded-full mx-auto sm:hidden mb-2"></div>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-[#d4af37]/10 rounded-3xl flex items-center justify-center mx-auto text-[#d4af37] text-2xl shadow-inner border border-[#d4af37]/20">
                <i className="fas fa-wallet"></i>
              </div>
              <h2 className={`text-xl font-black ${textColor} uppercase tracking-tight`}>{t.title}</h2>
              <p className="text-sm font-black text-[#d4af37] tracking-wider uppercase">
                {t.totalLabel}: <span className="text-xl ml-1 font-bold">{totalPrice} $</span>
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {/* Cash option */}
              <button 
                onClick={() => setSelectedOption('cash')}
                className={`w-full p-4 rounded-[26px] border flex items-center justify-between transition-all duration-300 ${selectedOption === 'cash' ? 'border-[#d4af37] bg-[#d4af37]/5 shadow-sm' : `${itemBg} border-transparent`}`}
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 shadow-inner">
                    <i className="fas fa-money-bill-wave text-xl"></i>
                  </div>
                  <div>
                    <h4 className={`font-black text-sm uppercase ${textColor}`}>{t.cashTitle}</h4>
                    <p className="text-[10px] text-gray-500 font-bold">{t.cashDesc}</p>
                  </div>
                </div>
                {/* Custom radio button */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedOption === 'cash' ? 'border-[#d4af37] bg-[#d4af37]' : 'border-gray-300 dark:border-zinc-700'}`}>
                  {selectedOption === 'cash' && <i className="fas fa-check text-black text-[10px] font-black"></i>}
                </div>
              </button>

              {/* Card option */}
              <button 
                onClick={() => setSelectedOption('card')}
                className={`w-full p-4 rounded-[26px] border flex items-center justify-between transition-all duration-300 ${selectedOption === 'card' ? 'border-[#d4af37] bg-[#d4af37]/5 shadow-sm' : `${itemBg} border-transparent`}`}
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner">
                    <i className="fas fa-credit-card text-xl"></i>
                  </div>
                  <div>
                    <h4 className={`font-black text-sm uppercase ${textColor}`}>{t.cardTitle}</h4>
                    <p className="text-[10px] text-gray-500 font-bold">{t.cardDesc}</p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedOption === 'card' ? 'border-[#d4af37] bg-[#d4af37]' : 'border-gray-300 dark:border-zinc-700'}`}>
                  {selectedOption === 'card' && <i className="fas fa-check text-black text-[10px] font-black"></i>}
                </div>
              </button>

              {/* Installments option */}
              <button 
                onClick={() => setSelectedOption('installment')}
                className={`w-full p-4 rounded-[26px] border flex items-center justify-between transition-all duration-300 ${selectedOption === 'installment' ? 'border-[#d4af37] bg-[#d4af37]/5 shadow-sm' : `${itemBg} border-transparent`}`}
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 shadow-inner">
                    <i className="fas fa-calendar-alt text-xl"></i>
                  </div>
                  <div>
                    <h4 className={`font-black text-sm uppercase ${textColor}`}>{t.instTitle}</h4>
                    <p className="text-[10px] text-gray-500 font-bold">{t.instDesc}</p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedOption === 'installment' ? 'border-[#d4af37] bg-[#d4af37]' : 'border-gray-300 dark:border-zinc-700'}`}>
                  {selectedOption === 'installment' && <i className="fas fa-check text-black text-[10px] font-black"></i>}
                </div>
              </button>
            </div>

            {/* Confirm button */}
            <div className="space-y-3 pt-3">
              {selectedOption ? (
                <button 
                  onClick={handleNextStep}
                  className="w-full py-4 bg-gradient-to-r from-[#d4af37] to-[#e4bf47] hover:opacity-90 text-black font-black rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/20 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
                >
                  <span>{t.confirmBtn}</span>
                  <i className="fas fa-arrow-right"></i>
                </button>
              ) : (
                <button 
                  disabled
                  className="w-full py-4 bg-gray-300/40 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600 font-black rounded-2xl text-xs uppercase tracking-widest cursor-not-allowed text-center"
                >
                  {t.confirmBtn} →
                </button>
              )}

              <button 
                onClick={onClose}
                className="w-full py-2 hover:opacity-80 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] active:scale-95 transition-transform"
              >
                {t.cancelBtn}
              </button>
            </div>
          </>
        )}

        {/* Step: Cash details (Naqd Pulda Form) */}
        {step === 'cash-details' && (
          <>
            <div className="flex items-center justify-between pb-2">
              <button 
                onClick={() => setStep('select')}
                className="w-9 h-9 rounded-full bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-gray-500 dark:text-gray-300 hover:scale-105 active:scale-95 transition-all"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <div className="text-right">
                <h3 className={`text-base font-black ${textColor} uppercase tracking-tight`}>{t.cashTitle}</h3>
                <p className="text-[9px] text-gray-500 font-extrabold uppercase">{t.cashDesc}</p>
              </div>
            </div>

            {/* Order summary row */}
            <div className={`${cardBg} rounded-[24px] p-4 flex items-center justify-between font-sans shadow-sm border`}>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{t.summaryTitle}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-semibold text-gray-400 uppercase">{t.totalLabel}:</span>
                <span className="text-lg font-black text-[#d4af37]">{totalPrice} $</span>
              </div>
            </div>

            {/* Promocode field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">{strings.promocode.toUpperCase()}</label>
              <div className="relative group">
                <input 
                  type="text" 
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder={t.enterPromo}
                  className={`w-full p-4 pr-12 rounded-2xl text-sm font-black outline-none transition-all duration-300 border ${isPromoValid ? 'border-green-500 bg-green-500/10 text-green-500' : `${inputBg} focus:border-[#d4af37]/30 ${textColor}`}`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <i className={`fas ${isPromoValid ? 'fa-check-circle text-green-500' : 'fa-ticket-alt text-gray-400 opacity-60'} text-lg transition-all`}></i>
                </div>
              </div>
              <p className="text-[9px] text-[#ff6b6b] ml-1 font-bold">{t.promoTip}</p>
              {isPromoValid && <p className="text-[10px] text-green-500 ml-1 font-black animate-pulse">{strings.promoApplied}</p>}
            </div>

            {/* Delivery Details */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">{t.deliveryTitle}</label>
              
              <div className={`relative flex items-center ${inputBg} rounded-2xl p-3 border border-transparent focus-within:border-[#d4af37]/20`}>
                <i className="fas fa-user text-gray-400 w-8 text-center text-sm"></i>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.nameLabel}
                  className="w-full text-sm font-bold bg-transparent outline-none border-none text-white focus:ring-0 placeholder:text-gray-500"
                />
              </div>

              <div className={`relative flex items-center ${inputBg} rounded-2xl p-3 border border-transparent focus-within:border-[#d4af37]/20`}>
                <i className="fas fa-phone text-gray-400 w-8 text-center text-sm"></i>
                <input 
                  type="text" 
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="+998 XX XXX XX XX"
                  className="w-full text-sm font-bold bg-transparent outline-none border-none text-white focus:ring-0 placeholder:text-gray-500"
                />
              </div>

              <div className={`relative flex items-center ${inputBg} rounded-2xl p-3 border border-transparent focus-within:border-[#d4af37]/20`}>
                <i className="fas fa-map-marker-alt text-gray-400 w-8 text-center text-sm"></i>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t.addressLabel}
                  className="w-full text-sm font-bold bg-transparent outline-none border-none text-white focus:ring-0 placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* Submit button */}
            <button 
              onClick={handleConfirmOrder}
              disabled={!fullName || phone.length < 15 || !address}
              className={`w-full py-4 text-white font-black rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all duration-300 ${(!fullName || phone.length < 15 || !address) ? 'bg-zinc-700/50 text-zinc-500 cursor-not-allowed shadow-none' : 'bg-[#2ecc71] hover:bg-[#27ae60] shadow-green-500/10 active:scale-95 cursor-pointer'}`}
            >
              <i className="fas fa-check-circle"></i>
              <span>{t.confirmBtn}</span>
            </button>
          </>
        )}

        {/* Step: Card Details screen */}
        {step === 'card-details' && (
          <>
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setStep('select')}
                className="w-9 h-9 rounded-full bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-gray-500 dark:text-gray-300 hover:scale-105 active:scale-95 transition-all"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <div className="text-right">
                <h3 className={`text-base font-black ${textColor} uppercase tracking-tight`}>{t.cardTitle}</h3>
                <p className="text-[9px] text-gray-500 font-extrabold uppercase">{t.cardDesc}</p>
              </div>
            </div>

            {/* 3D Flippable Credit Card Design */}
            <div className="perspective-[1000px] w-full h-[180px] my-4 group" style={{ perspective: '1000px' }}>
              <div 
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                style={{ 
                  transformStyle: 'preserve-3d', 
                  transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  transform: isCardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
                className="relative w-full h-full cursor-pointer shadow-2xl rounded-2xl"
              >
                {/* CARD FRONT SIDE */}
                <div 
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                  className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#111115] via-[#1a1c22] to-[#252a36] text-white p-5 rounded-2xl flex flex-col justify-between border border-white/10 z-10"
                >
                  <div className="flex justify-between items-center">
                    <span className="italic font-black text-[#d4af37] text-lg tracking-wider font-sans">TillaBazar</span>
                    {/* Mastercard symbol */}
                    <div className="flex">
                      <div className="w-8 h-8 rounded-full bg-[#eb001b]/90 -mr-3"></div>
                      <div className="w-8 h-8 rounded-full bg-[#f79e1b]/80"></div>
                    </div>
                  </div>

                  <div className="font-mono text-xl text-center font-bold tracking-[0.2em] py-2">
                    {cardNumber || "•••• •••• •••• ••••"}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-left font-sans">
                      <p className="text-[8px] text-gray-500 uppercase tracking-widest">{lang === 'uz' ? 'Karta Egasi' : lang === 'ru' ? 'Владелец карты' : 'Card Holder'}</p>
                      <p className="text-xs font-bold tracking-wider uppercase truncate max-w-[150px]">{cardHolder.toUpperCase() || (lang === 'uz' ? 'ISMINGIZ' : lang === 'ru' ? 'ВАШЕ ИМЯ' : 'YOUR NAME')}</p>
                    </div>
                    <div className="text-right font-sans">
                      <p className="text-[8px] text-gray-500 uppercase tracking-widest">{lang === 'uz' ? 'Amal qiladi' : lang === 'ru' ? 'Срок действия' : 'Expires'}</p>
                      <p className="text-xs font-bold tracking-wider">{cardExpiry || "MM/YY"}</p>
                    </div>
                  </div>
                </div>

                {/* CARD BACK SIDE WITH CVV */}
                <div 
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#111115] via-[#1a1c22] to-[#252a36] text-white p-5 rounded-2xl flex flex-col justify-between border border-white/10"
                >
                  <div className="w-full h-10 bg-black -mx-5 mt-2"></div>
                  
                  <div className="space-y-1">
                    <p className="text-[8px] text-gray-500 uppercase text-right tracking-widest">CVV / CVC Code</p>
                    <div className="w-full bg-white h-9 rounded flex items-center justify-end px-3 font-mono text-black font-extrabold text-base tracking-wider">
                      {cardCvv || "•••"}
                    </div>
                  </div>

                  <p className="text-[8px] text-gray-400 italic font-sans text-center">TillaBazar secure payment network. Tap to flip.</p>
                </div>
              </div>
            </div>

            <p className="text-center text-[10px] text-gray-500 font-bold italic py-1">{t.cardFlipTip}</p>

            {/* Inputs Form */}
            <div className="space-y-3">
              <div className={`relative flex items-center ${inputBg} rounded-2xl p-3 border border-transparent focus-within:border-[#d4af37]/20`}>
                <i className="fas fa-credit-card text-gray-400 w-8 text-center text-sm"></i>
                <input 
                  type="text" 
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  maxLength={19}
                  placeholder={t.cardNumberPlaceholder}
                  className="w-full text-sm font-bold bg-transparent outline-none border-none text-white focus:ring-0 placeholder:text-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`relative flex items-center ${inputBg} rounded-2xl p-3 border border-transparent focus-within:border-[#d4af37]/20`}>
                  <i className="fas fa-calendar-alt text-gray-400 w-8 text-center text-sm"></i>
                  <input 
                    type="text" 
                    value={cardExpiry}
                    onChange={handleCardExpiryChange}
                    maxLength={5}
                    placeholder="MM/YY"
                    className="w-full text-sm font-bold bg-transparent outline-none border-none text-white focus:ring-0 placeholder:text-gray-500"
                  />
                </div>

                <div className={`relative flex items-center ${inputBg} rounded-2xl p-3 border border-transparent focus-within:border-[#d4af37]/20`}>
                  <i className="fas fa-lock text-gray-400 w-8 text-center text-sm"></i>
                  <input 
                    type="password" 
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                    maxLength={3}
                    placeholder="CVV"
                    onFocus={() => setIsCardFlipped(true)}
                    onBlur={() => setIsCardFlipped(false)}
                    className="w-full text-sm font-bold bg-transparent outline-none border-none text-white focus:ring-0 placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div className={`relative flex items-center ${inputBg} rounded-2xl p-3 border border-transparent focus-within:border-[#d4af37]/20`}>
                <i className="fas fa-user text-gray-400 w-8 text-center text-sm"></i>
                <input 
                  type="text" 
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  placeholder={t.cardHolderPlaceholder}
                  className="w-full text-sm font-bold bg-transparent outline-none border-none text-white focus:ring-0 placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* Price display and Submit */}
            <div className="flex items-center justify-between font-sans pt-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{t.totalLabel}</span>
              <span className="text-xl font-black text-blue-500">{totalPrice} $</span>
            </div>

            <button 
              onClick={handleConfirmOrder}
              disabled={cardNumber.length < 19 || cardExpiry.length < 5 || cardCvv.length < 3 || !cardHolder}
              className={`w-full py-4 text-white font-black rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all duration-300 ${cardNumber.length < 19 || cardExpiry.length < 5 || cardCvv.length < 3 || !cardHolder ? 'bg-zinc-700/50 text-zinc-500 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 active:scale-95 cursor-pointer shadow-blue-500/10'}`}
            >
              <i className="fas fa-lock"></i>
              <span>{t.payNow} — {totalPrice} $</span>
            </button>
          </>
        )}

        {/* Step: Installment calculator screen */}
        {step === 'installment-details' && (
          <>
            <div className="flex items-center justify-between pb-1">
              <button 
                onClick={() => setStep('select')}
                className="w-9 h-9 rounded-full bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-gray-500 dark:text-gray-300 hover:scale-105 active:scale-95 transition-all"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <div className="text-right">
                <h3 className={`text-base font-black ${textColor} uppercase tracking-tight`}>{t.instTitle}</h3>
                <p className="text-[9px] text-gray-500 font-extrabold uppercase">{t.instDesc}</p>
              </div>
            </div>

            {/* Price reference */}
            <div className={`${cardBg} rounded-[24px] p-4 flex items-center justify-between font-sans shadow-sm border`}>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{t.summaryTitle}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-semibold text-gray-400 uppercase">{t.totalLabel}:</span>
                <span className="text-lg font-black text-[#d4af37]">{totalPrice} $</span>
              </div>
            </div>

            {/* SELECT DURATION TABS */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.12em] ml-1">{t.monthsTitle}</label>
              <div className="grid grid-cols-4 gap-2">
                {([
                  { val: 3, label: '3', flag: '0%' },
                  { val: 6, label: '6', flag: '+5%' },
                  { val: 12, label: '12', flag: '+10%' },
                  { val: 24, label: '24', flag: '+18%' }
                ] as const).map(tab => (
                  <button 
                    key={tab.val}
                    onClick={() => {
                      setSelectedMonths(tab.val);
                      if ((window as any).Telegram?.WebApp?.HapticFeedback) {
                        (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light');
                      }
                    }}
                    className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-0.5 border transition-all ${selectedMonths === tab.val ? 'bg-purple-600/15 border-purple-500 text-purple-400 ring-2 ring-purple-500/20' : `${itemBg} border-transparent hover:border-gray-300 dark:hover:border-zinc-700`}`}
                  >
                    <span className="text-lg font-black leading-tight">{tab.label}</span>
                    <span className="text-[7px] font-bold uppercase tracking-wider">{t.monthLabel}</span>
                    <span className="text-[9px] font-extrabold text-[#2ecc71]">{tab.flag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* INSTALLMENT FORMULA CALCULATIONS */}
            <div className={`${cardBg} rounded-[30px] p-5 border shadow-sm space-y-4`}>
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{t.monthlyLabel}</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-4xl font-extrabold text-purple-500 font-sans tracking-tight">{installmentDetails.monthly} $</span>
                  <span className="text-sm font-semibold text-gray-400">/ {t.monthLabel.toLowerCase()}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-white/5 pt-3 space-y-2.5 font-sans">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 uppercase font-semibold">{t.totalWithInterest}</span>
                  <span className="text-sm font-extrabold text-white">{installmentDetails.total} $</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 uppercase font-semibold">{t.interestLabel}</span>
                  <span className="text-sm font-extrabold text-purple-400">+{installmentDetails.interest} $</span>
                </div>
              </div>
            </div>

            {/* ESLATMA NOTE */}
            <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl flex gap-3 text-left">
              <i className="fas fa-info-circle text-purple-400 text-base mt-0.5 flex-shrink-0"></i>
              <p className="text-[10px] text-purple-300 font-bold leading-normal">{t.installmentAlert}</p>
            </div>

            {/* Confirmation Button */}
            <button 
              onClick={handleConfirmOrder}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-purple-600/10 transition-transform cursor-pointer"
            >
              <i className="fas fa-file-signature text-sm"></i>
              <span>{t.completeInstallment} — {installmentDetails.monthly} $ × {selectedMonths}</span>
            </button>
          </>
        )}

        {/* Step: Order Accepted/Success screen */}
        {step === 'success' && (
          <div className="text-center py-6 sm:py-9 space-y-6 animate-slide-up">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500 text-4xl shadow-[0_0_40px_rgba(46,204,113,0.4)] animate-bounce border border-green-500/30">
              <i className="fas fa-check-circle"></i>
            </div>
            
            <div className="space-y-4 px-2">
              <h2 className={`text-2xl font-black ${textColor} uppercase tracking-tighter`}>
                {strings.orderAccepted}
              </h2>
              <p className={`text-sm font-bold leading-relaxed px-1 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                {selectedOption === 'cash' 
                  ? t.successSub + " " + strings.cashSuccess 
                  : t.successSub + " " + t.installmentAlert
                }
              </p>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-4 bg-gradient-to-r from-[#d4af37] to-[#e4bf47] text-black font-black rounded-2xl active:scale-95 transition-transform uppercase text-xs tracking-widest shadow-lg shadow-[#d4af37]/20"
            >
              {strings.close}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { UIStrings, UserAccount, Language } from '../types';
import { STORE_ACCOUNTS, ADMIN_TELEGRAM } from '../constants';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (acc: UserAccount) => void;
  strings: UIStrings;
  theme: 'dark' | 'light';
  lang: Language;
}

const translations = {
  uz: {
    title: "SOTUVCHI KIRISHI",
    subtitle: "FAQAT TASDIQLANGAN SOTUVCHILAR UCHUN",
    loginLabel: "LOGIN",
    passLabel: "PAROL",
    loginPlaceholder: "Login...",
    passPlaceholder: "Parol...",
    loginButton: "KIRISH",
    or: "YOKI",
    contactAdmin: "ADMIN BILAN BOG'LANING",
    helpText: "Login va parol olish uchun admin bilan bog'laning.",
    cancel: "BEKOR QILISH",
    wrongCreds: "XATO LOGIN YOKI PAROL"
  },
  ru: {
    title: "ВХОД ДЛЯ ПРОДАВЦОВ",
    subtitle: "ТОЛЬКО ДЛЯ ПОДТВЕРЖДЕННЫХ ПРОДАВЦОВ",
    loginLabel: "ЛОГИН",
    passLabel: "ПАРОЛЬ",
    loginPlaceholder: "Логин...",
    passPlaceholder: "Пароль...",
    loginButton: "ВОЙТИ",
    or: "ИЛИ",
    contactAdmin: "СВЯЗАТЬСЯ С АДМИНИСТРАТОРОМ",
    helpText: "Для получения логина и пароля свяжитесь с админом.",
    cancel: "ОТМЕНА",
    wrongCreds: "НЕВЕРНЫЙ ЛОГИН ИЛИ ПАРОЛЬ"
  },
  en: {
    title: "SELLER LOGIN",
    subtitle: "FOR APPROVED SELLERS ONLY",
    loginLabel: "LOGIN",
    passLabel: "PASSWORD",
    loginPlaceholder: "Login...",
    passPlaceholder: "Password...",
    loginButton: "LOGIN",
    or: "OR",
    contactAdmin: "CONTACT ADMIN",
    helpText: "To get login and password, contact the admin.",
    cancel: "CANCEL",
    wrongCreds: "WRONG USERNAME OR PASSWORD"
  }
};

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin, strings, theme, lang }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(false);

  const t = translations[lang] || translations.uz;

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-[#15171e]' : 'bg-white';
  const inputBg = isDark ? 'bg-[#1a1d26]' : 'bg-[#f4f5f8]';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const labelColor = isDark ? 'text-gray-450' : 'text-gray-500';

  const handleLogin = () => {
    const found = STORE_ACCOUNTS.find(a => a.user === user && a.pass === pass);
    if (found) {
      onLogin({
        name: found.store,
        username: `@${found.user}`,
        phone: "+998 9X XXX XX XX",
        isOwner: true,
        storeName: found.store
      });
      onClose();
    } else {
      setError(true);
      if ((window as any).Telegram?.WebApp?.HapticFeedback) {
        (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[300] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in">
      {/* Outside click handler */}
      <div className="absolute inset-0 z-0" onClick={onClose} />
      
      <div className={`w-full sm:max-w-md ${bgColor} rounded-t-[36px] sm:rounded-[36px] p-6 sm:p-8 shadow-2xl relative z-10 animate-slide-up border-t border-white/10`}>
        {/* Drag handle line on top for simulated bottom drawer look on mobile */}
        <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700/50 rounded-full mx-auto mb-6 sm:hidden pointer-events-none" />

        <div className="text-center mb-6">
          {/* Main Gold Circle Store Logo */}
          <div className="w-16 h-16 bg-[#fffbeb] dark:bg-[#1a1711] rounded-[24px] border border-[#fef3c7] dark:border-[#d4af37]/20 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <i className="fas fa-store text-[#d4af37] text-2xl"></i>
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">{t.title}</h2>
          <p className="text-[9px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mt-2.5">{t.subtitle}</p>
        </div>

        <div className="space-y-4">
          {/* User input box */}
          <div className="space-y-1.5">
            <label className={`text-[9px] font-black tracking-widest pl-2 uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.loginLabel}</label>
            <input 
              type="text" 
              placeholder={t.loginPlaceholder}
              className={`w-full h-14 ${inputBg} border ${error ? 'border-red-500' : 'border-transparent'} rounded-2xl px-4 text-sm ${textColor} focus:border-[#d4af37]/50 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600`} 
              value={user} 
              onChange={e => {setUser(e.target.value); setError(false);}} 
            />
          </div>

          {/* Password input box with eye icon toggle */}
          <div className="space-y-1.5">
            <label className={`text-[9px] font-black tracking-widest pl-2 uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.passLabel}</label>
            <div className="relative">
              <input 
                type={showPass ? "text" : "password"} 
                placeholder={t.passPlaceholder}
                className={`w-full h-14 ${inputBg} border ${error ? 'border-red-500' : 'border-transparent'} rounded-2xl pl-4 pr-12 text-sm ${textColor} focus:border-[#d4af37]/50 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600`} 
                value={pass} 
                onChange={e => {setPass(e.target.value); setError(false);}} 
              />
              <button 
                type="button" 
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              >
                <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'} text-md`}></i>
              </button>
            </div>
          </div>
          
          {error && <p className="text-red-500 text-[10px] font-black tracking-widest text-center uppercase">{t.wrongCreds}</p>}
        </div>

        {/* Login trigger button */}
        <div className="pt-4 space-y-4">
          <button 
            onClick={handleLogin}
            className="w-full h-14 bg-[#d4af37] hover:bg-[#c29d2f] text-black font-extrabold rounded-2xl shadow-sm active:scale-[0.98] transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2"
          >
            <i className="fas fa-sign-in-alt text-xs"></i> {t.loginButton}
          </button>

          {/* YOKI / OR separator line */}
          <div className="flex items-center">
            <div className="flex-1 border-t border-gray-200 dark:border-gray-800" />
            <span className="px-3 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t.or}</span>
            <div className="flex-1 border-t border-gray-200 dark:border-gray-800" />
          </div>

          {/* Contact Admin via Telegram */}
          <div className="text-center space-y-3">
            <a 
              href={ADMIN_TELEGRAM}
              target="_blank" 
              rel="noreferrer"
              onClick={() => {
                if ((window as any).Telegram?.WebApp?.HapticFeedback) {
                  (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light');
                }
              }}
              className="w-full h-14 flex items-center justify-center gap-2.5 border-2 border-dashed border-[#0284c7]/20 hover:border-[#0284c7]/40 bg-[#f0f9ff] dark:bg-[#0c4a6e]/10 text-[#0284c7] dark:text-[#38bdf8] font-black text-xs rounded-2xl tracking-widest transition-all uppercase"
            >
              <i className="fab fa-telegram-plane text-sm"></i> {t.contactAdmin}
            </a>
            
            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed font-semibold">
              {t.helpText}
            </p>
          </div>
        </div>

        {/* Cancel button */}
        <div className="pt-4 text-center">
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-white font-black uppercase text-[11px] tracking-[0.2em] transition-colors py-2"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};

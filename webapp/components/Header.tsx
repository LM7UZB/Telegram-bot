
import React from 'react';
import { ADMIN_TELEGRAM } from '../constants';

interface HeaderProps {
  onMenuClick: () => void;
  onRatesClick: () => void;
  theme: 'dark' | 'light';
  lang: 'uz' | 'ru' | 'en';
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, onRatesClick, theme, lang }) => {
  const isDark = theme === 'dark';
  
  const buttonBg = isDark
    ? 'bg-[#181a21]/80 border-white/[0.08] text-[#d4af37] hover:bg-[#1f222b]'
    : 'bg-white/90 border-gray-200 text-[#d4af37] hover:bg-gray-50 shadow-sm';

  const capsuleBg = isDark
    ? 'bg-[#1c1d24]/90 border-white/[0.15] shadow-[0_0_20px_rgba(212,175,55,0.25),0_4px_25px_rgba(0,0,0,0.5)]'
    : 'bg-[#ffffff]/98 border-[#d4af37]/35 shadow-[0_2px_15px_rgba(212,175,55,0.1)]';

  return (
    <div className="sticky top-0 z-40 px-4 py-4 flex items-center justify-between transition-all backdrop-blur-3xl border-b border-transparent">
      
      {/* Left circular menu trigger button */}
      <button 
        onClick={onMenuClick}
        className={`w-11 h-11 flex items-center justify-center rounded-full border ${buttonBg} active:scale-90 transition-all duration-300 shadow-md`}
      >
        <i className="fas fa-bars-staggered text-base"></i>
      </button>

      {/* Center Capsule Layout - Sleek, glowing liquid Glassmorphism with larger premium font */}
      <div className={`flex-1 mx-3 max-w-[230px] flex items-center justify-center px-7 py-2 rounded-full border ${capsuleBg} transition-all duration-300 relative overflow-hidden group`}>
        {/* Floating Golden Dust Particles (microscopic glowing specs) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <span className="absolute top-1.5 left-4 w-1 h-1 bg-white rounded-full animate-ping opacity-60"></span>
          <span className="absolute bottom-2 right-6 w-1 h-1 bg-[#d4af37] rounded-full animate-pulse opacity-80" style={{ animationDelay: '0.4s' }}></span>
          <span className="absolute top-1 right-12 w-0.5 h-0.5 bg-[#f5e5a3] rounded-full animate-ping opacity-50" style={{ animationDelay: '0.8s' }}></span>
          <span className="absolute bottom-1.5 left-10 w-0.5 h-0.5 bg-white rounded-full animate-pulse opacity-75" style={{ animationDelay: '1.2s' }}></span>
          <span className="absolute top-2 right-4 w-0.5 h-0.5 bg-[#d4af37] rounded-full animate-ping opacity-60" style={{ animationDelay: '1.6s' }}></span>
        </div>

        {/* Injecting a dedicated style block for the high-end Golden Dust sparkling animation */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes gold-dust {
            0% {
              background-position: 0% 50%;
              filter: drop-shadow(0 0 6px rgba(212, 175, 55, 0.5));
              text-shadow: 
                0px 0px 1px rgba(255, 255, 255, 0.4),
                0.5px -0.5px 1.5px rgba(212, 175, 55, 0.8),
                -1px 1px 1.5px rgba(245, 229, 163, 0.6);
            }
            33% {
              filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.75));
              text-shadow: 
                -0.5px 0.5px 1.5px rgba(255, 255, 255, 0.5),
                1px 1px 2px rgba(212, 175, 55, 0.9),
                -0.5px -1px 1px rgba(245, 229, 163, 0.7);
            }
            66% {
              background-position: 100% 50%;
              filter: drop-shadow(0 0 5px rgba(212, 175, 55, 0.45));
              text-shadow: 
                1px -0.5px 1px rgba(255, 255, 255, 0.3),
                -1px -1px 2px rgba(212, 175, 55, 0.8),
                0.5px 1px 1.5px rgba(245, 229, 163, 0.5);
            }
            100% {
              background-position: 0% 50%;
              filter: drop-shadow(0 0 6px rgba(212, 175, 55, 0.5));
              text-shadow: 
                0px 0px 1px rgba(255, 255, 255, 0.4),
                0.5px -0.5px 1.5px rgba(212, 175, 55, 0.8),
                -1px 1px 1.5px rgba(245, 229, 163, 0.6);
            }
          }
          .premium-gold-dust {
            background: linear-gradient(
              135deg, 
              #b9935a 0%, 
              #e7c996 25%, 
              #f9e4b7 50%, 
              #ffffff 62%, 
              #f9e4b7 75%, 
              #e7c996 90%, 
              #b9935a 100%
            );
            background-size: 300% 300%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: gold-dust 5s ease-in-out infinite;
          }
        `}} />
        <span className="text-[20px] font-black italic tracking-widest text-center premium-gold-dust select-none">
          TillaBazar
        </span>
      </div>

      {/* Right circular Action button (Gold/Silver Gram Rates view & edit) */}
      <button 
        onClick={onRatesClick}
        className={`w-11 h-11 flex items-center justify-center rounded-full border ${buttonBg} relative active:scale-90 transition-all duration-300 shadow-md group`}
        title={lang === 'uz' ? "Tilla va Kumush narxlari" : lang === 'ru' ? "Цены на золото и серебро" : "Gold & Silver Rates"}
      >
        <i className="fas fa-coins text-base group-hover:rotate-12 transition-transform duration-300"></i>
        {/* Glowing Live status badge */}
        <span className="absolute top-0 right-0 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#d4af37]"></span>
        </span>
      </button>

    </div>
  );
};



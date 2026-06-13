
import React, { useState, useEffect, useRef } from 'react';
import { Category, UIStrings } from '../types';

interface NavigationProps {
  currentPage: Category;
  onPageChange: (page: Category) => void;
  cartCount: number;
  strings: UIStrings;
  theme: 'dark' | 'light';
}

interface NavItem {
  id: Category;
  icon: string;
  label: string;
  activeColor: string;
  glowClass: string;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange, cartCount, strings, theme }) => {
  const isDark = theme === 'dark';
  const [shouldAnimateCart, setShouldAnimateCart] = useState(false);
  const prevCountRef = useRef(cartCount);

  useEffect(() => {
    // Check if the cart count has actually increased
    if (cartCount > prevCountRef.current) {
      setShouldAnimateCart(true);
      const timer = setTimeout(() => {
        setShouldAnimateCart(false);
      }, 600); // 0.6s animation duration
      
      // Try to trigger Telegram WebApp vibe for confirmation
      if ((window as any).Telegram?.WebApp?.HapticFeedback) {
        (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
    }
    prevCountRef.current = cartCount;
  }, [cartCount]);

  const items: NavItem[] = [
    { 
      id: 'home', 
      icon: 'fa-home', 
      label: strings.home, 
      activeColor: 'text-blue-500', 
      glowClass: 'bg-blue-500/10 border-blue-500/50 shadow-[0_8px_25px_rgba(59,130,246,0.4)]' 
    },
    { 
      id: 'gold', 
      icon: 'fa-gem', 
      label: strings.gold, 
      activeColor: 'text-[#d4af37]', 
      glowClass: 'bg-[#d4af37]/20 border-[#d4af37]/60 shadow-[0_8px_25px_rgba(212,175,55,0.5)]' 
    },
    { 
      id: 'silver', 
      icon: 'fa-ring', 
      label: strings.silver, 
      activeColor: theme === 'light' ? 'text-gray-900' : 'text-white', 
      glowClass: theme === 'light' 
        ? 'bg-gray-100 border-gray-400 shadow-[0_8px_25px_rgba(0,0,0,0.2)]' 
        : 'bg-white/20 border-white/60 shadow-[0_8px_25px_rgba(255,255,255,0.25)]' 
    },
    { 
      id: 'cart', 
      icon: 'fa-shopping-cart', 
      label: strings.cart, 
      activeColor: 'text-red-500', 
      glowClass: 'bg-red-500/10 border-red-500/50 shadow-[0_8px_25px_rgba(239,68,68,0.4)]' 
    },
  ];

  // Frosted Glass - O'ta hira va aniq shisha effekti
  const bubbleBase = theme === 'light' 
    ? 'bg-white/50 backdrop-blur-2xl border-gray-200 shadow-[0_8px_20px_rgba(0,0,0,0.12)]' 
    : 'bg-white/10 backdrop-blur-3xl border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.5)]';

  const inactiveIconColor = theme === 'light' ? 'text-gray-500' : 'text-gray-400';

  const getNeonColor = (id: Category) => {
    switch (id) {
      case 'home': return '#3b82f6';
      case 'gold': return '#d4af37';
      case 'silver': return theme === 'light' ? '#6b7280' : '#ffffff';
      case 'cart': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  const getNeonShadow = (id: Category) => {
    switch (id) {
      case 'home': return 'shadow-[0_0_20px_rgba(59,130,246,0.65)]';
      case 'gold': return 'shadow-[0_0_20px_rgba(212,175,55,0.7)]';
      case 'silver': return theme === 'light' ? 'shadow-[0_0_15px_rgba(107,114,128,0.4)]' : 'shadow-[0_0_20px_rgba(255,255,255,0.6)]';
      case 'cart': return 'shadow-[0_0_20px_rgba(239,68,68,0.65)]';
      default: return '';
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[350px] px-4 z-50">
      <nav className="flex items-center justify-between gap-3">
        {items.map((item) => {
          const isActive = currentPage === item.id;
          const neonColor = getNeonColor(item.id);
          const neonShadow = getNeonShadow(item.id);
          
          return (
            <button
              key={item.id}
              onClick={() => {
                onPageChange(item.id);
                if ((window as any).Telegram?.WebApp?.HapticFeedback) {
                  (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                }
              }}
              className={`relative flex flex-col items-center justify-center transition-all duration-500 ${
                isActive ? 'scale-110 -translate-y-3' : 'scale-100 opacity-95'
              } ${item.id === 'cart' && shouldAnimateCart ? 'animate-cart-pop z-50' : ''}`}
              style={{ flex: '1 1 0px' }}
            >
              <div className={`
                w-[58px] h-[58px] rounded-full flex items-center justify-center transition-all duration-500 relative overflow-hidden
                ${isActive ? `${item.glowClass} ${neonShadow} backdrop-blur-3xl border-transparent` : `${bubbleBase} border-2`}
              `}>
                {/* 3D Moving/Running Neon Border Effect */}
                {isActive && (
                  <>
                    <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                      <div 
                        className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] rounded-full animate-[spin_2s_linear_infinite]"
                        style={{
                          background: `conic-gradient(from 0deg, transparent 35%, ${neonColor} 50%, transparent 85%, ${neonColor} 100%)`
                        }}
                      />
                    </div>
                    {/* Inner mask to keep border sharp (2px wide) while retaining content transparency / aesthetics */}
                    <div className={`absolute inset-[2.5px] rounded-full pointer-events-none z-10 ${
                      theme === 'light' ? 'bg-[#f4f5f8]/95' : 'bg-[#0f1115]/95'
                    } backdrop-blur-3xl`} />
                  </>
                )}

                <i className={`fas ${item.icon} ${isActive ? 'text-xl animate-pulse' : 'text-lg'} ${isActive ? item.activeColor : inactiveIconColor} relative z-20`}></i>

                {item.id === 'cart' && cartCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 bg-red-600 text-white text-[8px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full shadow-[0_2px_8px_rgba(239,68,68,0.5)] border border-white/30 z-30 transition-transform duration-300">
                    {cartCount}
                  </span>
                )}
              </div>
              
              <span className={`
                mt-2 text-[7px] font-black uppercase tracking-[0.2em] transition-all duration-500
                ${isActive ? `${item.activeColor} opacity-100` : 'opacity-0'}
              `}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

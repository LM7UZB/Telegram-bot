
import React, { useState } from 'react';
import { Product, UIStrings, Language } from '../types';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (p: Product, e?: any) => void;
  onWishlistToggle: (id: number) => void;
  onStoreClick: (storeName: string) => void;
  isWishlisted: boolean;
  strings: UIStrings;
  theme: 'dark' | 'light';
  lang: Language;
}

export const ProductModal: React.FC<ProductModalProps> = ({ 
  product, onClose, onAddToCart, onWishlistToggle, onStoreClick, isWishlisted, strings, theme, lang 
}) => {
  const modalBg = theme === 'light' ? 'bg-white' : 'bg-[#141414]';
  const textColor = theme === 'light' ? 'text-black' : 'text-white';
  const subBg = theme === 'light' ? 'bg-gray-50' : 'bg-white/5';
  const borderColor = theme === 'light' ? 'border-gray-200' : 'border-white/10';
  const descColor = theme === 'light' ? 'text-gray-800' : 'text-gray-200';

  // Yurakcha tugmasi uchun universal va yorqin glassmorphism
  const wishlistBtnClass = theme === 'light' 
    ? 'bg-white/60 backdrop-blur-2xl border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border-2' 
    : 'bg-black/30 backdrop-blur-2xl border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] border';
    
  const heartIconClass = isWishlisted 
    ? 'fas fa-heart text-red-500 scale-110' 
    : (theme === 'light' ? 'far fa-heart text-gray-800' : 'far fa-heart text-white');

  const images = product.images && product.images.length ? product.images : [product.img];
  const [activeImg, setActiveImg] = useState(0);

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[60] flex items-end justify-center animate-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`w-full max-h-[96vh] ${modalBg} rounded-t-[45px] border-t-2 border-[#d4af37] overflow-y-auto p-7 shadow-2xl animate-slide-up transition-colors`}>
        <div className="w-14 h-1.5 bg-gray-500/30 rounded-full mx-auto mb-8"></div>
        
        <div className="relative mb-4">
          <img src={images[activeImg] || images[0]} alt={product.title[lang]} className="w-full h-[400px] object-cover rounded-[35px] shadow-2xl border border-white/5" />
          
          <button 
            onClick={(e) => { e.stopPropagation(); onWishlistToggle(product.id); }}
            className={`absolute top-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-2xl active:scale-75 transition-all duration-300 ${wishlistBtnClass}`}
          >
            <i className={heartIconClass}></i>
          </button>

          <div className="absolute bottom-5 left-5 px-5 py-2 bg-[#d4af37] text-black text-xs font-black rounded-2xl shadow-xl border border-white/20 uppercase tracking-widest">
            {product.proba} / {product.karat}
          </div>
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-none pb-1">
            {images.map((im, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`flex-none w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all active:scale-90 ${i === activeImg ? 'border-[#d4af37]' : 'border-transparent opacity-60'}`}
              >
                <img src={im} referrerPolicy="no-referrer" alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="space-y-6 mb-8">
          <h2 className={`text-2xl font-black ${textColor} leading-tight uppercase italic tracking-tighter`}>
            {product.title[lang]}
          </h2>
          
          <div className="bg-[#d4af37] p-6 rounded-[30px] flex justify-between items-center shadow-[0_20px_40px_rgba(212,175,55,0.25)] border border-white/20">
            <div className="flex flex-col">
              <span className="text-black font-black text-[10px] uppercase tracking-[0.3em] opacity-60">{lang === 'uz' ? 'Narxi:' : lang === 'ru' ? 'Цена:' : 'Price:'}</span>
              <div className="text-black text-3xl font-black drop-shadow-md">
                {product.price} $
              </div>
            </div>
            <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center text-black">
              <i className="fas fa-tag"></i>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-8 px-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
            <button 
              onClick={() => { onStoreClick(product.store); onClose(); }}
              className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.2em] hover:underline"
            >
              {product.store} {strings.inStore}
            </button>
          </div>
          <div className="flex items-center gap-2 opacity-60">
             <i className="fas fa-location-dot text-[10px] text-gray-500"></i>
             <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">{product.location}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className={`${subBg} border ${borderColor} rounded-[25px] p-5 flex flex-col items-center gap-1 shadow-inner`}>
              <i className="fas fa-weight-hanging text-blue-500 text-sm mb-1 opacity-50"></i>
              <span className="text-gray-500 font-black text-[8px] uppercase tracking-widest">{strings.weight}</span>
              <span className="text-blue-500 font-black text-xl">{product.gram}</span>
           </div>
           <div className={`${subBg} border ${borderColor} rounded-[25px] p-5 flex flex-col items-center gap-1 shadow-inner`}>
              <i className="fas fa-microscope text-amber-500 text-sm mb-1 opacity-50"></i>
              <span className="text-gray-500 font-black text-[8px] uppercase tracking-widest">{strings.purity}</span>
              <span className="text-amber-500 font-black text-xl">{product.proba} ({product.karat})</span>
           </div>
        </div>

        <div className={`${subBg} border ${borderColor} rounded-[35px] p-6 mb-8`}>
          <div className="flex items-center gap-2 mb-4">
             <i className="fas fa-info-circle text-[#d4af37] text-sm"></i>
             <strong className="text-[10px] text-[#d4af37] font-black uppercase tracking-[0.3em]">{strings.aboutProduct}:</strong>
          </div>
          <p className={`${descColor} text-base font-medium leading-relaxed italic opacity-90`}>
            {product.desc[lang]}
          </p>
        </div>

        <div className="flex gap-4 pb-12">
          <button 
            onClick={onClose} 
            className={`flex-1 py-5 ${theme === 'light' ? 'bg-gray-200 text-black' : 'bg-white/5 text-white'} font-black rounded-3xl active:scale-95 transition-transform uppercase text-xs tracking-widest`}
          >
            {strings.cancel}
          </button>
          <button 
            onClick={(e) => { onAddToCart(product, e); onClose(); }}
            className="flex-[2] py-5 bg-white text-black text-lg font-black rounded-3xl shadow-[0_15px_40px_rgba(255,255,255,0.1)] active:scale-95 transition-transform flex items-center justify-center gap-4"
          >
            <i className="fas fa-shopping-cart"></i>
            {strings.addToCart}
          </button>
        </div>
      </div>
    </div>
  );
};

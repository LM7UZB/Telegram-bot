
import React from 'react';
import { Product, Language } from '../types';

interface ProductGridProps {
  products: Product[];
  onProductClick: (p: Product) => void;
  onWishlistToggle: (id: number) => void;
  wishlist: number[];
  onAddToCart: (p: Product, e?: any) => void;
  onStoreClick: (storeName: string) => void;
  theme: 'dark' | 'light';
  lang: Language;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, onProductClick, onWishlistToggle, wishlist, onAddToCart, onStoreClick, theme, lang }) => {
  const cardBg = theme === 'light' ? 'bg-white shadow-xl border-gray-100' : 'glass-card border-white/10';
  const textColor = theme === 'light' ? 'text-black' : 'text-white/90';

  return (
    <div className="grid grid-cols-2 gap-4 p-4 pb-12">
      {products.map((p) => {
        const isLiked = wishlist.includes(p.id);
        
        // Universal glass style for the grid as well
        const wishlistBtnClass = theme === 'light' 
          ? 'bg-white/70 backdrop-blur-lg border-white shadow-md border-2' 
          : 'bg-black/30 backdrop-blur-lg border-white/10 shadow-lg border';
          
        const heartIconClass = isLiked 
          ? 'fas fa-heart text-red-500' 
          : (theme === 'light' ? 'far fa-heart text-gray-800' : 'far fa-heart text-white');

        return (
          <div 
            key={p.id}
            onClick={() => onProductClick(p)}
            className={`${cardBg} rounded-[28px] overflow-hidden active:scale-95 transition-all animate-slide-up group border`}
          >
            <div className="relative aspect-square">
              <img 
                src={p.img} 
                alt={p.title[lang]} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              {p.oldPrice && p.oldPrice > p.price && (
                <div className="absolute top-3 left-3 z-20 bg-gradient-to-r from-red-600 to-rose-500 text-white text-[9px] font-black px-2.5 py-1 rounded-lg shadow-[0_4px_12px_rgba(239,68,68,0.5)] uppercase tracking-wider animate-pulse flex items-center gap-1">
                  <i className="fas fa-bolt text-[8px]"></i>
                  -{Math.round((1 - p.price / p.oldPrice) * 100)}%
                </div>
              )}
              <button 
                onClick={(e) => { e.stopPropagation(); onWishlistToggle(p.id); }}
                className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center active:scale-75 transition-all ${wishlistBtnClass}`}
              >
                <i className={`${heartIconClass} text-sm`}></i>
              </button>
              <div className="absolute bottom-3 left-3 px-3 py-1 bg-[#d4af37] text-black text-[9px] font-black rounded-lg shadow-lg">
                {p.proba} <span className="opacity-60 ml-0.5">({p.karat})</span>
              </div>
            </div>
            
            <div className="p-4 space-y-1">
              <button 
                onClick={(e) => { e.stopPropagation(); onStoreClick(p.store); }}
                className="text-[9px] text-[#d4af37] font-black uppercase tracking-widest truncate hover:underline text-left block w-full"
              >
                {p.store}
              </button>
              <h3 className={`text-xs font-black truncate ${textColor}`}>{p.title[lang]}</h3>
              <div className="flex justify-between items-center mt-3">
                <div className="flex flex-col leading-none">
                  {p.oldPrice && p.oldPrice > p.price && (
                    <span className="text-[10px] text-gray-400 line-through font-bold">{p.oldPrice} $</span>
                  )}
                  <span className="text-[#d4af37] font-black text-base">{p.price} $</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onAddToCart(p, e); }}
                  className="w-10 h-10 rounded-2xl bg-[#d4af37] text-black flex items-center justify-center active:scale-75 transition-all shadow-[0_8px_20px_rgba(212,175,55,0.4)]"
                >
                  <i className="fas fa-shopping-cart text-[14px]"></i>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

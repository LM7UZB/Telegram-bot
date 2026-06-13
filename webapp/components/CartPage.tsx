
import React from 'react';
import { CartItem, UIStrings, Language, Product } from '../types';

interface CartPageProps {
  cart: CartItem[];
  onRemove: (i: number) => void;
  onCheckout: () => void;
  onProductClick: (p: Product) => void;
  strings: UIStrings;
  theme: 'dark' | 'light';
  lang: Language;
}

export const CartPage: React.FC<CartPageProps> = ({ cart, onRemove, onCheckout, onProductClick, strings, theme, lang }) => {
  const pendingItems = cart.filter(item => item.status === 'pending');
  const orderedItems = cart.filter(item => item.status === 'ordered');
  const total = pendingItems.reduce((sum, item) => sum + item.product.price, 0);

  const textColor = theme === 'light' ? 'text-black' : 'text-white';
  const subTextColor = theme === 'light' ? 'text-gray-600' : 'text-gray-400';
  const cardBg = theme === 'light' ? 'bg-white shadow-md border border-gray-100' : 'glass-effect border-white/5';
  const totalSectionBg = theme === 'light' ? 'bg-gray-100' : 'bg-black/20';

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500 opacity-30">
        <i className="fas fa-shopping-cart text-8xl mb-4"></i>
        <p className="text-xl font-medium">{strings.emptyCart}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className={`text-xl font-bold flex items-center gap-2 ${textColor}`}>
        <span className="w-1 h-6 bg-[#ff4757] rounded-full"></span>
        {strings.cart}
      </h2>
      
      {pendingItems.length > 0 && (
        <div className="space-y-3">
          {pendingItems.map((item, i) => {
            const originalIndex = cart.findIndex(c => c === item);
            return (
              <div 
                key={`${item.product.id}-${i}`} 
                onClick={() => onProductClick(item.product)}
                className={`${cardBg} p-4 rounded-2xl flex justify-between items-center animate-fade-in cursor-pointer active:scale-[0.98] transition-all`}
              >
                <div className="flex items-center gap-4">
                  <img src={item.product.img} className="w-12 h-12 rounded-lg object-cover shadow-sm" alt={item.product.title[lang]} />
                  <div>
                    <h4 className={`font-bold text-sm leading-tight ${textColor}`}>{item.product.title[lang]}</h4>
                    <p className="text-[#d4af37] font-bold mt-1">{item.product.price} $</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onRemove(originalIndex); }}
                  className="w-10 h-10 flex items-center justify-center text-red-500 bg-red-500/10 rounded-full active:scale-75 transition-transform"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            );
          })}
          <div className={`p-6 text-center ${totalSectionBg} rounded-[25px] border ${theme === 'light' ? 'border-gray-200' : 'border-white/5'} space-y-4`}>
            <h3 className={`text-xl font-bold ${textColor}`}>{strings.total}: <span className="text-[#d4af37]">{total} $</span></h3>
            <button 
              onClick={onCheckout}
              className="w-full py-4 bg-[#d4af37] text-black text-lg font-bold rounded-2xl shadow-[0_5px_25px_rgba(212,175,55,0.3)] active:scale-95 transition-transform"
            >
              {strings.checkout}
            </button>
          </div>
        </div>
      )}

      {orderedItems.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-black/10 dark:border-white/5">
          <h3 className={`text-sm font-bold ${subTextColor} uppercase tracking-widest`}>{strings.statusOrdered}</h3>
          {orderedItems.map((item, i) => {
             const originalIndex = cart.findIndex(c => c === item);
             return (
              <div 
                key={`ordered-${item.product.id}-${i}`} 
                onClick={() => onProductClick(item.product)}
                className={`${cardBg} p-4 rounded-2xl flex justify-between items-center opacity-70 cursor-pointer active:scale-[0.98] transition-all`}
              >
                <div className="flex items-center gap-4">
                  <img src={item.product.img} className="w-12 h-12 rounded-lg object-cover grayscale" alt={item.product.title[lang]} />
                  <div>
                    <h4 className={`font-bold text-sm line-through ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>{item.product.title[lang]}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full font-bold">
                        {strings.statusOrdered}
                      </span>
                      <span className="text-[10px] text-gray-500">{item.orderDate}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onRemove(originalIndex); }}
                  className={`w-8 h-8 flex items-center justify-center ${theme === 'light' ? 'text-gray-400 bg-gray-100' : 'text-gray-500 bg-white/5'} rounded-full active:scale-75 transition-transform`}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


import React from 'react';
import { Product, UIStrings, Language } from '../types';
import { ProductGrid } from './ProductGrid';

interface WishlistPageProps {
  wishlist: number[];
  allProducts: Product[];
  onProductClick: (p: Product) => void;
  onWishlistToggle: (id: number) => void;
  onAddToCart: (p: Product, e?: any) => void;
  strings: UIStrings;
  theme: 'dark' | 'light';
  lang: Language;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ wishlist, allProducts, onProductClick, onWishlistToggle, onAddToCart, strings, theme, lang }) => {
  const favoriteProducts = allProducts.filter(p => wishlist.includes(p.id));
  const textColor = theme === 'light' ? 'text-black' : 'text-white';

  if (favoriteProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500 opacity-30">
        <i className="fas fa-heart text-8xl mb-4"></i>
        <p className="text-xl font-medium">{strings.emptyWishlist}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className={`text-xl font-bold flex items-center gap-2 ${textColor}`}>
        <span className="w-1 h-6 bg-red-500 rounded-full"></span>
        {strings.favorites}
      </h2>
      <ProductGrid 
        products={favoriteProducts} 
        onProductClick={onProductClick} 
        onWishlistToggle={onWishlistToggle}
        wishlist={wishlist}
        onAddToCart={onAddToCart}
        onStoreClick={() => {}}
        theme={theme}
        lang={lang}
      />
    </div>
  );
};


import React from 'react';
import { UIStrings, SortOption, Language } from '../types';
import { REGIONS } from '../constants';

interface FilterState {
  proba: string;
  gramRange: string;
  location: string;
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  sort: SortOption;
  setSort: (s: SortOption) => void;
  strings: UIStrings;
  theme: 'dark' | 'light';
  cat: 'gold' | 'silver';
  lang: Language;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({ 
  isOpen, onClose, filters, setFilters, sort, setSort, strings, theme, cat, lang 
}) => {
  // Proba va Karat birgalikda - Endi 24K (999) ham bor!
  const probas = cat === 'gold' 
    ? [
        { p: '583', k: '14K' },
        { p: '585', k: '14K' },
        { p: '750', k: '18K' },
        { p: '875', k: '21K' },
        { p: '999', k: '24K' }
      ] 
    : [
        { p: '925', k: 'S' }
      ];

  const gramRanges = [
    { label: '1 - 5 gr', value: '1-5' },
    { label: '5 - 10 gr', value: '5-10' },
    { label: '10 - 15 gr', value: '10-15' },
    { label: '15 - 30 gr', value: '15-30' },
    { label: '30 - 50 gr', value: '30-50' },
    { label: '50+ gr', value: '50+' },
  ];

  const bgColor = theme === 'light' ? 'bg-white' : 'bg-[#141414]';
  const textColor = theme === 'light' ? 'text-black' : 'text-white';
  const labelColor = theme === 'light' ? 'text-gray-600' : 'text-gray-400';
  const itemBg = theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-white/5 border-white/10';

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed bottom-0 left-0 right-0 ${bgColor} rounded-t-[35px] border-t border-[#d4af37]/30 z-[111] transition-transform duration-500 max-h-[85vh] overflow-y-auto p-6 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="w-12 h-1.5 bg-gray-500/30 rounded-full mx-auto mb-6"></div>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${textColor}`}>{strings.filter}</h2>
          <button onClick={() => { 
            setFilters({ proba: '', gramRange: '', location: '' });
            setSort('none');
          }} className="text-[#d4af37] text-sm font-bold">{lang === 'uz' ? 'Tozalash' : lang === 'ru' ? 'Очистить' : 'Clear'}</button>
        </div>

        {/* Sort section */}
        <div className="mb-6">
          <h3 className={`text-[10px] uppercase tracking-widest mb-3 font-bold ${labelColor}`}>{strings.sortBy}</h3>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setSort('price-asc')}
              className={`p-4 rounded-xl border text-sm text-left transition-all font-bold ${sort === 'price-asc' ? 'bg-[#d4af37] text-black border-[#d4af37]' : `${itemBg} ${textColor}`}`}
            >
              <i className="fas fa-sort-amount-down-alt mr-2 text-[#d4af37]"></i> {strings.priceLow}
            </button>
            <button 
              onClick={() => setSort('price-desc')}
              className={`p-4 rounded-xl border text-sm text-left transition-all font-bold ${sort === 'price-desc' ? 'bg-[#d4af37] text-black border-[#d4af37]' : `${itemBg} ${textColor}`}`}
            >
              <i className="fas fa-sort-amount-up mr-2 text-[#d4af37]"></i> {strings.priceHigh}
            </button>
          </div>
        </div>

        {/* Proba & Karat Filter */}
        <div className="mb-6">
          <h3 className={`text-[10px] uppercase tracking-widest mb-3 font-bold ${labelColor}`}>{strings.purity} / Karat</h3>
          <div className="flex flex-wrap gap-2">
            {probas.map(item => (
              <button 
                key={item.p}
                onClick={() => setFilters({ ...filters, proba: filters.proba === item.p ? '' : item.p })}
                className={`px-5 py-2.5 rounded-full border text-sm font-bold transition-all ${filters.proba === item.p ? 'bg-[#d4af37] text-black border-[#d4af37]' : `${itemBg} ${textColor}`}`}
              >
                {item.p} <span className="opacity-50 ml-1 text-[10px]">({item.k})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Gram Filter */}
        <div className="mb-6">
          <h3 className={`text-[10px] uppercase tracking-widest mb-3 font-bold ${labelColor}`}>{strings.weight}</h3>
          <div className="flex flex-wrap gap-2">
            {gramRanges.map(g => (
              <button 
                key={g.value}
                onClick={() => setFilters({ ...filters, gramRange: filters.gramRange === g.value ? '' : g.value })}
                className={`px-5 py-2.5 rounded-full border text-sm font-bold transition-all ${filters.gramRange === g.value ? 'bg-[#d4af37] text-black border-[#d4af37]' : `${itemBg} ${textColor}`}`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Location Filter */}
        <div className="mb-8">
          <h3 className={`text-[10px] uppercase tracking-widest mb-3 font-bold ${labelColor}`}>{strings.location}</h3>
          <div className="grid grid-cols-2 gap-2">
            {REGIONS.map(r => (
              <button 
                key={r}
                onClick={() => setFilters({ ...filters, location: filters.location === r ? '' : r })}
                className={`p-3 rounded-xl border text-xs text-left font-bold transition-all ${filters.location === r ? 'bg-[#d4af37] text-black border-[#d4af37]' : `${itemBg} ${textColor}`}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-5 bg-[#d4af37] text-black font-black rounded-2xl shadow-xl active:scale-95 transition-transform uppercase tracking-widest"
        >
          {lang === 'uz' ? 'Tayyor' : lang === 'ru' ? 'Готово' : 'Done'}
        </button>
      </div>
    </>
  );
};

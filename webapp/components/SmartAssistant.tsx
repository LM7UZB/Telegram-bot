
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { Language } from '../types';

interface SmartAssistantProps {
  lang: Language;
  theme: 'dark' | 'light';
}

export const SmartAssistant: React.FC<SmartAssistantProps> = ({ lang, theme }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResponse('');
    const res = await geminiService.getJewelryAdvice(query);
    setResponse(res);
    setLoading(false);
  };

  const title = lang === 'uz' ? 'AI Ekspert' : lang === 'ru' ? 'AI Эксперт' : 'AI Expert';
  const placeholder = lang === 'uz' ? 'Tilla haqida so\'rang...' : lang === 'ru' ? 'Спросите о золоте...' : 'Ask about gold...';
  const askBtn = lang === 'uz' ? 'So\'rash' : lang === 'ru' ? 'Спросить' : 'Ask';
  const inputBg = theme === 'light' ? 'bg-gray-100' : 'bg-white/5';
  const textColor = theme === 'light' ? 'text-black' : 'text-white';

  return (
    <div className="glass-effect p-5 rounded-[25px] border-[#d4af37]/20 border mt-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white">
          <i className="fas fa-robot"></i>
        </div>
        <div>
          <h4 className="font-bold text-[#d4af37]">{title}</h4>
          <p className="text-[10px] text-gray-400">Powered by Gemini AI</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className={`flex-1 ${inputBg} border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37]/50 ${textColor}`}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          />
          <button 
            onClick={handleAsk}
            disabled={loading}
            className="px-4 py-3 bg-[#d4af37] text-black font-bold rounded-xl active:scale-95 transition-transform disabled:opacity-50"
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : askBtn}
          </button>
        </div>

        {response && (
          <div className={`${theme === 'light' ? 'bg-black/5' : 'bg-white/5'} border border-black/5 dark:border-white/5 rounded-xl p-4 text-sm leading-relaxed animate-fade-in`}>
            <p className={`${theme === 'light' ? 'text-gray-800' : 'text-gray-200'} whitespace-pre-wrap`}>{response}</p>
          </div>
        )}
      </div>
    </div>
  );
};
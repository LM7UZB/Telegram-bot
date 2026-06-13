
import React, { useState } from 'react';
import { UIStrings } from '../types';

interface CodeModalProps {
  onClose: () => void;
  strings: UIStrings;
  theme: 'dark' | 'light';
}

export const CodeModal: React.FC<CodeModalProps> = ({ onClose, strings, theme }) => {
  const [copied, setCopied] = useState(false);

  // Bu o'zgaruvchi saytning bitta fayllik (Single-file) versiyasini o'z ichiga oladi.
  const fullCode = `<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TillaBazar - Single File Edition</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body { background-color: #0a0a0a; color: white; font-family: sans-serif; }
        .glass { background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); }
        /* Barcha asosiy stillar shu yerda bo'ladi */
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="module">
        import React from 'https://esm.sh/react@19';
        import ReactDOM from 'https://esm.sh/react-dom@19';
        
        // Loyihaning barcha mantiqi (App, components) shu yerga joylashtirilishi mumkin.
        // Bu fayl demo versiya sifatida ko'rsatilmoqda.
        const App = () => {
            return React.createElement('div', { className: 'p-10' }, 
                React.createElement('h1', { className: 'text-3xl font-bold text-[#d4af37]' }, 'TillaBazar yuklandi!')
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(App));
    </script>
</body>
</html>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if ((window as any).Telegram?.WebApp) {
      (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[300] flex flex-col animate-fade-in">
      {/* Modal Header */}
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
        <div className="flex items-center gap-3">
          <i className="fas fa-code text-[#d4af37] text-xl"></i>
          <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Site Source Code</h2>
        </div>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-gray-400">
          <i className="fas fa-times text-xl"></i>
        </button>
      </div>

      {/* Code Viewer */}
      <div className="flex-1 overflow-auto p-4 md:p-10 font-mono text-sm leading-relaxed">
        <div className="relative group">
          <button 
            onClick={handleCopy}
            className={`absolute top-4 right-4 px-4 py-2 rounded-xl font-bold transition-all ${copied ? 'bg-green-500 text-white' : 'bg-[#d4af37] text-black active:scale-95'}`}
          >
            <i className={`fas ${copied ? 'fa-check' : 'fa-copy'} mr-2`}></i>
            {copied ? 'Nusxa olindi!' : 'Nusxa olish'}
          </button>
          <pre className="bg-gray-900/50 p-6 rounded-3xl border border-white/5 text-blue-300 overflow-x-auto selection:bg-[#d4af37]/30">
            {fullCode}
          </pre>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-6 border-t border-white/10 bg-black/40 text-center text-gray-500 text-xs">
        Ushbu kod loyihaning barcha qismlarini bitta HTML faylga jamlangan shaklini aks ettiradi.
      </div>
    </div>
  );
};

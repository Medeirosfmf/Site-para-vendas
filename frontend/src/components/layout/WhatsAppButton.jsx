import React, { useState, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import { getWhatsAppLink } from '../../utils/formatters';

export default function WhatsAppButton({
  message = 'Olá! Vim pelo site da Imports GR e gostaria de mais informações.',
  productName = null,
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const finalMessage = productName
    ? `Olá, tenho interesse neste produto: *${productName}*`
    : message;

  // Auto-show tooltip after 4s (only once per session)
  useEffect(() => {
    if (sessionStorage.getItem('wa_tooltip_shown')) return;
    const timer = setTimeout(() => {
      setShowTooltip(true);
      sessionStorage.setItem('wa_tooltip_shown', '1');
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-hide tooltip after 8s
  useEffect(() => {
    if (!showTooltip) return;
    const timer = setTimeout(() => setShowTooltip(false), 8000);
    return () => clearTimeout(timer);
  }, [showTooltip]);

  const handleClick = () => {
    window.open(getWhatsAppLink(finalMessage), '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Tooltip card */}
      {showTooltip && !dismissed && (
        <div
          className="glass border border-[#25D366]/30 rounded-2xl p-4 shadow-2xl shadow-[#25D366]/10 max-w-[220px] slide-up"
          style={{ animation: 'slideUp 0.4s cubic-bezier(0.25,0.46,0.45,0.94)' }}
        >
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 text-text-muted hover:text-white transition-colors"
          >
            <FiX className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center text-white text-xs">
              GR
            </div>
            <div>
              <p className="text-white text-xs font-bold">Imports GR</p>
              <p className="text-[#25D366] text-[10px]">● online agora</p>
            </div>
          </div>
          <p className="text-text-secondary text-xs leading-relaxed">
            Olá! Precisa de ajuda para escolher um perfume? Fale com a gente!
          </p>
          <button
            onClick={handleClick}
            className="mt-3 w-full py-2 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#20bd5a] transition-colors"
          >
            Falar agora
          </button>
        </div>
      )}

      {/* Main button */}
      <button
        onClick={handleClick}
        className="relative w-16 h-16 bg-[#25D366] text-white rounded-2xl shadow-xl shadow-[#25D366]/30 hover:bg-[#20bd5a] hover:shadow-[#25D366]/50 transition-all hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[#25D366]/30 animate-bounce-subtle neon-glow-green group"
        aria-label="Falar no WhatsApp"
      >
        {/* Ping ring */}
        <div className="absolute inset-0 rounded-2xl border-2 border-[#25D366] animate-ping opacity-40 pointer-events-none" />

        <FaWhatsapp className="w-8 h-8 relative z-10 mx-auto" />

        {/* Hover tooltip */}
        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-dark-800/95 backdrop-blur-md text-white text-xs font-semibold py-2 px-3 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 pointer-events-none border border-dark-600 shadow-xl">
          Fale Conosco
          <div className="absolute right-[-5px] top-1/2 -mt-1 border-t-4 border-b-4 border-l-4 border-transparent border-l-dark-800" />
        </div>
      </button>
    </div>
  );
}

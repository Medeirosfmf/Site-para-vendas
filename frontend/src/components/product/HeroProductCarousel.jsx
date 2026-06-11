import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiChevronLeft, FiChevronRight, FiShoppingCart, FiGrid } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { formatCurrency, calculateDiscount, getWhatsAppLink, getProductWhatsAppMessage } from '../../utils/formatters';
import { useCart } from '../../contexts/CartContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Category-specific visual accents for the slides
const CATEGORY_ACCENTS = {
  perfumes:      { glow: 'bg-amber-500/20',    border: 'border-amber-500/30',    badge: 'bg-amber-500 text-dark-900',  text: 'text-amber-400' },
  'body-splash':  { glow: 'bg-pink-500/20',     border: 'border-pink-500/30',     badge: 'bg-pink-500 text-white',      text: 'text-pink-400' },
  cremes:        { glow: 'bg-green-500/20',    border: 'border-green-500/30',    badge: 'bg-green-500 text-dark-900',  text: 'text-green-400' },
  kits:          { glow: 'bg-violet-500/20',   border: 'border-violet-500/30',   badge: 'bg-violet-500 text-white',    text: 'text-violet-400' },
  smartphones:  { glow: 'bg-sky-500/20',      border: 'border-sky-500/30',      badge: 'bg-sky-500 text-dark-900',    text: 'text-sky-400' },
  default:      { glow: 'bg-primary/20',      border: 'border-primary/30',      badge: 'bg-primary text-white',       text: 'text-primary' },
};

export default function HeroProductCarousel({ products = [] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const { addToCart } = useCart();

  const total = products.length;

  const next = useCallback(() => {
    setActive(i => (i + 1) % total);
  }, [total]);

  const prev = () => setActive(i => (i - 1 + total) % total);

  // Auto-advance every 4.5s unless paused
  useEffect(() => {
    if (total <= 1 || paused) return;
    const t = setInterval(next, 4500);
    return () => clearInterval(t);
  }, [next, total, paused]);

  if (!products.length) return null;

  const current = products[active];
  const catSlug = current.category?.slug || 'default';
  const accent = CATEGORY_ACCENTS[catSlug] || CATEGORY_ACCENTS.default;
  const imageUrl = current.mainImage
    ? `${API_BASE}${current.mainImage}`
    : 'https://placehold.co/600x600/1A1A2E/6C5CE7?text=Produto';
  const hasPromo = !!current.promoPrice;
  const discount = hasPromo ? calculateDiscount(current.salePrice, current.promoPrice) : 0;
  const price = current.promoPrice || current.salePrice;

  return (
    <section
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slide background */}
      <div className="relative min-h-[520px] md:min-h-[480px] flex items-center bg-dark-800 transition-all duration-700">

        {/* Ambient glow blobs */}
        <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none transition-all duration-700 ${accent.glow}`} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-dark-900/60 rounded-full blur-[80px] pointer-events-none" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />

        <div className="container mx-auto px-6 md:px-10 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center py-12">

            {/* LEFT — Text & CTAs */}
            <div key={`text-${active}`} className="fade-in order-2 md:order-1">

              {/* Top labels */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                {current.category?.name && (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${accent.border} ${accent.text} bg-dark-900/40`}>
                    {current.category.name}
                  </span>
                )}
                {current.brand?.name && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold border border-dark-500 text-text-muted bg-dark-900/40">
                    {current.brand.name}
                  </span>
                )}
                {hasPromo && (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-danger text-white shadow-lg shadow-danger/30">
                    -{discount}% OFF
                  </span>
                )}
                {current.stock > 0 && current.stock <= 5 && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-warning/15 text-warning border border-warning/30 animate-pulse">
                    Últimas {current.stock} unidades!
                  </span>
                )}
              </div>

              {/* Product name */}
              <h2 className="text-3xl md:text-4xl xl:text-5xl font-black text-white leading-tight mb-4 tracking-tight">
                {current.name}
              </h2>

              {/* Short description */}
              {current.description && (
                <p className="text-text-secondary text-sm md:text-base leading-relaxed mb-6 max-w-md line-clamp-2">
                  {current.description}
                </p>
              )}

              {/* Price */}
              <div className="flex items-end gap-3 mb-8">
                {hasPromo && (
                  <span className="text-text-muted line-through text-sm">{formatCurrency(current.salePrice)}</span>
                )}
                <span className={`text-4xl font-black ${accent.text}`}>
                  {formatCurrency(price)}
                </span>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to={`/produto/${current.slug}`}
                  className="btn-primary px-7 py-3.5 rounded-2xl text-base font-bold shadow-xl"
                >
                  Ver Produto <FiArrowRight className="ml-2" />
                </Link>
                <button
                  onClick={() => addToCart(current.id, 1)}
                  disabled={current.stock === 0}
                  className={`flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-base font-bold border transition-all ${
                    current.stock === 0
                      ? 'border-dark-600 text-text-muted cursor-not-allowed'
                      : 'border-white/20 text-white hover:bg-white/10'
                  }`}
                >
                  <FiShoppingCart className="w-5 h-5" />
                  {current.stock === 0 ? 'Esgotado' : 'Adicionar'}
                </button>
              </div>
            </div>

            {/* RIGHT — Product Image */}
            <div key={`img-${active}`} className="relative flex items-center justify-center order-1 md:order-2 fade-in">
              {/* Image glow */}
              <div className={`absolute w-72 h-72 rounded-full blur-[70px] pointer-events-none ${accent.glow} opacity-60`} />

              {/* Image card */}
              <div className={`relative w-72 h-72 md:w-96 md:h-96 rounded-3xl bg-dark-900/50 border ${accent.border} flex items-center justify-center shadow-2xl overflow-hidden`}>
                <img
                  src={imageUrl}
                  alt={current.name}
                  loading="eager"
                  decoding="async"
                  className="object-contain w-4/5 h-4/5 drop-shadow-2xl transition-transform duration-700 hover:scale-105"
                />
                {/* Featured badge */}
                {current.featured && (
                  <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-xl text-white text-xs font-black ${accent.badge} shadow-lg`}>
                    Destaque
                  </div>
                )}
              </div>

              {/* Slide counter */}
              <div className="absolute bottom-0 right-0 px-3 py-1.5 rounded-xl glass border border-dark-600 text-xs font-bold text-text-muted">
                {String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="relative bg-dark-900/90 backdrop-blur-md border-t border-dark-700/60 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between gap-4">

          {/* Dot indicators + product thumbnails */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {products.map((p, idx) => {
              const thumb = p.mainImage ? `${API_BASE}${p.mainImage}` : null;
              const pCatSlug = p.category?.slug || 'default';
              const pAccent = CATEGORY_ACCENTS[pCatSlug] || CATEGORY_ACCENTS.default;
              const activeBorderClass = pAccent.text.replace('text-', 'border-');
              const activeShadowClass = pAccent.text.replace('text-', 'shadow-');
              return (
                <button
                  key={p.id}
                  onClick={() => setActive(idx)}
                  className={`flex-shrink-0 transition-all duration-300 rounded-xl overflow-hidden border-2 ${
                    idx === active
                      ? `${activeBorderClass} scale-110 shadow-lg ${activeShadowClass}/30`
                      : 'border-dark-600 opacity-50 hover:opacity-80 hover:border-dark-500'
                  }`}
                  style={{ width: 48, height: 48 }}
                  title={p.name}
                >
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={p.name}
                      loading="lazy"
                      decoding="async"
                      className="object-contain w-full h-full bg-dark-800 p-1"
                    />
                  ) : (
                    <div className="w-full h-full bg-dark-800 flex items-center justify-center text-sm text-text-muted">
                      <FiGrid className="w-4 h-4" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Arrow navigation */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={prev}
              className="w-9 h-9 rounded-xl bg-dark-800 border border-dark-600 flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary/40 transition-all"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>

            {/* Progress bar */}
            <div className="w-24 h-1.5 bg-dark-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${accent.text.replace('text-', 'bg-')}`}
                style={{ width: `${((active + 1) / total) * 100}%` }}
              />
            </div>

            <button
              onClick={next}
              className="w-9 h-9 rounded-xl bg-dark-800 border border-dark-600 flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary/40 transition-all"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

import React, { useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProductCard from './ProductCard';

export default function ProductCarousel({ products = [], title, subtitle }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      const scrollTo = direction === 'left' 
        ? scrollLeft - scrollAmount 
        : scrollLeft + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  if (!products.length) return null;

  return (
    <div className="relative py-12 select-none">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Title section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          {subtitle && (
            <p className="text-primary text-xs font-bold tracking-widest uppercase mb-2">
              {subtitle}
            </p>
          )}
          {title && (
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {title}
            </h2>
          )}
        </div>

        {/* Arrow Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-10 h-10 rounded-xl bg-dark-800/80 border border-dark-600 flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary/40 transition-all shadow-md active:scale-95"
            aria-label="Voltar"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-10 h-10 rounded-xl bg-dark-800/80 border border-dark-600 flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary/40 transition-all shadow-md active:scale-95"
            aria-label="Avançar"
          >
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Carousel Container */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scroll-smooth pb-6 hide-scrollbar snap-x snap-mandatory px-1"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}

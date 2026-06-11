import React, { useState, useEffect } from 'react';
import { FiX, FiShoppingCart, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency } from '../../utils/formatters';
import api from '../../api/axios';

export default function QuickViewModal({ product: initialProduct, onClose }) {
  const { addToCart } = useCart();
  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Fetch full details in the background (images, reviews, specifications)
  useEffect(() => {
    let active = true;
    const fetchFullDetails = async () => {
      try {
        const { data } = await api.get(`/products/${initialProduct.id}`);
        if (data.success && active) {
          setProduct(prev => ({ ...prev, ...data.data }));
        }
      } catch (err) {
        console.error('Erro ao buscar detalhes adicionais para espiada rápida', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchFullDetails();
    return () => {
      active = false;
    };
  }, [initialProduct.id]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const price = product.promoPrice || product.salePrice;
  const hasPromo = !!product.promoPrice;
  const isOutOfStock = product.stock === 0;

  // Build images array
  const allImages = [];
  if (product.mainImage) {
    allImages.push(`${baseUrl}${product.mainImage}`);
  }
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach(img => {
      const fullUrl = `${baseUrl}${img.url}`;
      if (!allImages.includes(fullUrl)) {
        allImages.push(fullUrl);
      }
    });
  }
  if (allImages.length === 0) {
    allImages.push('https://placehold.co/600x600/1A1A2E/6C5CE7?text=Sem+Imagem');
  }

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product.id, quantity);
    onClose();
  };

  const nextImage = () => {
    setActiveImageIndex(prev => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setActiveImageIndex(prev => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#111118]/95 border border-white/[0.08] backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row z-10 animate-scale-in max-h-[90vh]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-text-muted hover:text-white hover:bg-white/[0.06] rounded-xl transition-all"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Left: Gallery */}
        <div className="md:w-1/2 bg-gradient-to-br from-dark-800 to-dark-900 flex flex-col justify-between p-6 relative border-r border-white/[0.04] min-h-[300px]">
          {/* Main Image Slider */}
          <div className="flex-grow flex items-center justify-center relative min-h-[200px] h-[300px]">
            <img 
              src={allImages[activeImageIndex]} 
              alt={product.name} 
              className="max-w-full max-h-full object-contain p-4 transition-all duration-300 drop-shadow-xl"
            />
            {allImages.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-0 w-8 h-8 rounded-full bg-black/40 border border-white/[0.06] flex items-center justify-center text-white hover:bg-primary hover:text-dark-900 transition-all shadow-md"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-0 w-8 h-8 rounded-full bg-black/40 border border-white/[0.06] flex items-center justify-center text-white hover:bg-primary hover:text-dark-900 transition-all shadow-md"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Gallery Indicator / Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex justify-center gap-2 mt-4 overflow-x-auto py-1 hide-scrollbar">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-12 h-12 bg-white/[0.02] border rounded-lg overflow-hidden p-1 transition-all flex-shrink-0 flex items-center justify-center ${
                    idx === activeImageIndex 
                      ? 'border-primary shadow-lg shadow-primary/20 scale-105' 
                      : 'border-white/[0.06] opacity-65 hover:opacity-100 hover:border-white/[0.15]'
                  }`}
                >
                  <img src={img} alt="Miniatura" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto max-h-[90vh] md:max-h-[600px] text-text-primary">
          <div className="space-y-4">
            {/* Category & Brand */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 border border-primary/20 bg-primary/10 text-primary rounded-full uppercase tracking-wider">
                {product.category?.name}
              </span>
              <span className="text-xs font-medium px-2.5 py-0.5 bg-white/[0.04] text-text-secondary border border-white/[0.06] rounded-full">
                {product.brand?.name}
              </span>
            </div>

            {/* Name */}
            <h2 className="text-xl md:text-2xl font-black text-white leading-tight">
              {product.name}
            </h2>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              {hasPromo ? (
                <>
                  <span className="text-2xl font-black gradient-text">
                    {formatCurrency(product.promoPrice)}
                  </span>
                  <span className="text-sm text-text-muted line-through">
                    {formatCurrency(product.salePrice)}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-black gradient-text">
                  {formatCurrency(product.salePrice)}
                </span>
              )}
            </div>

            <div className="h-px bg-white/[0.06]" />

            {/* Description */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-black tracking-widest text-text-muted">Descrição</span>
              <p className="text-xs md:text-sm text-text-secondary font-light leading-relaxed">
                {product.description || 'Sem descrição cadastrada para este produto.'}
              </p>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-text-muted">Especificações</span>
                <div className="grid grid-cols-2 gap-2 bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="text-xs">
                      <span className="font-bold text-text-secondary block capitalize">{key.replace('_', ' ')}</span>
                      <span className="text-text-muted mt-0.5 block">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 mt-6">
            {/* Action Bar */}
            <div className="flex items-center gap-4">
              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="flex items-center bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden h-12">
                  <button 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="px-3 text-text-secondary hover:bg-white/[0.04] transition-colors h-full"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 font-bold text-sm text-white select-none">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                    className="px-3 text-text-secondary hover:bg-white/[0.04] transition-colors h-full"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              )}

              {/* Purchase Button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-grow h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                  isOutOfStock
                    ? 'bg-white/[0.03] text-text-muted cursor-not-allowed border border-white/[0.06]'
                    : 'bg-primary hover:bg-primary-light text-dark-900 hover:shadow-lg hover:shadow-primary/20 active:scale-98'
                }`}
              >
                <FiShoppingCart className="w-4 h-4" />
                {isOutOfStock ? 'Sem Estoque' : 'Adicionar ao carrinho'}
              </button>
            </div>

            {/* Stock status */}
            {!isOutOfStock && product.stock <= 3 && (
              <p className="text-xs text-warning text-center font-bold">
                Apenas {product.stock} unidades restantes em estoque!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Embedded CSS Animations */}
      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

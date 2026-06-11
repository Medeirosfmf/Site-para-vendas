import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiEye, FiArrowRight } from 'react-icons/fi';
import { formatCurrency, calculateDiscount } from '../../utils/formatters';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useQuickView } from '../../contexts/QuickViewContext';

const CATEGORY_STYLES = {
  perfumes: {
    gradient: 'from-amber-950/35 to-dark-900',
    borderHover: 'hover:border-amber-500/40 hover:shadow-amber-500/10',
    accentText: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    primaryBtn: 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500 hover:text-dark-900 hover:border-amber-500 hover:shadow-amber-500/30',
    glowHover: 'group-hover:bg-amber-500/5',
  },
  'body-splash': {
    gradient: 'from-pink-950/35 to-dark-900',
    borderHover: 'hover:border-pink-500/40 hover:shadow-pink-500/10',
    accentText: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    primaryBtn: 'bg-pink-500/10 text-pink-400 border-pink-500/30 hover:bg-pink-500 hover:text-white hover:border-pink-500 hover:shadow-pink-500/30',
    glowHover: 'group-hover:bg-pink-500/5',
  },
  cremes: {
    gradient: 'from-green-950/35 to-dark-900',
    borderHover: 'hover:border-green-500/40 hover:shadow-green-500/10',
    accentText: 'text-green-400 bg-green-500/10 border-green-500/20',
    primaryBtn: 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500 hover:text-dark-900 hover:border-green-500 hover:shadow-green-500/30',
    glowHover: 'group-hover:bg-green-500/5',
  },
  kits: {
    gradient: 'from-violet-950/35 to-dark-900',
    borderHover: 'hover:border-violet-500/40 hover:shadow-violet-500/10',
    accentText: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    primaryBtn: 'bg-violet-500/10 text-violet-400 border-violet-500/30 hover:bg-violet-500 hover:text-white hover:border-violet-500 hover:shadow-violet-500/30',
    glowHover: 'group-hover:bg-violet-500/5',
  },
  smartphones: {
    gradient: 'from-sky-950/35 to-dark-900',
    borderHover: 'hover:border-sky-500/40 hover:shadow-sky-500/10',
    accentText: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    primaryBtn: 'bg-sky-500/10 text-sky-400 border-sky-500/30 hover:bg-sky-500 hover:text-dark-900 hover:border-sky-500 hover:shadow-sky-500/30',
    glowHover: 'group-hover:bg-sky-500/5',
  },
  default: {
    gradient: 'from-dark-700 to-dark-900',
    borderHover: 'hover:border-primary/40 hover:shadow-primary/15',
    accentText: 'text-secondary bg-secondary/10 border-secondary/20',
    primaryBtn: 'bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/30',
    glowHover: 'group-hover:bg-primary/5',
  }
};

export default function ProductCard({ product, onFavoriteToggle, isFavorited = false }) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { openQuickView } = useQuickView();
  const isOutOfStock = product.stock === 0;
  const hasPromo = !!product.promoPrice;
  const discount = hasPromo ? calculateDiscount(product.salePrice, product.promoPrice) : 0;

  // Check if product is "new" (created in the last 15 days)
  const isNew = product.createdAt
    ? (Date.now() - new Date(product.createdAt).getTime()) < 15 * 24 * 60 * 60 * 1000
    : false;

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Faça login para salvar favoritos');
      return;
    }
    if (onFavoriteToggle) {
      onFavoriteToggle(product.id, isFavorited);
    } else {
      try {
        if (isFavorited) {
          await api.delete(`/favorites/${product.id}`);
          toast.success('Removido dos favoritos');
        } else {
          await api.post('/favorites', { productId: product.id });
          toast.success('Adicionado aos favoritos!');
        }
      } catch (err) {
        toast.error('Erro ao atualizar favorito');
      }
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product.id, 1);
  };

  const handleQuickViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product);
  };

  const imageUrl = product.mainImage
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${product.mainImage}`
    : 'https://placehold.co/400x400/1A1A2E/6C5CE7?text=Sem+Imagem';

  const catSlug = product.category?.slug || 'default';
  const style = CATEGORY_STYLES[catSlug] || CATEGORY_STYLES.default;

  return (
    <Link to={`/produto/${product.slug}`} className="block group h-full">
      <div className={`relative h-full flex flex-col overflow-hidden rounded-2xl bg-dark-800/60 border border-dark-600/60 transition-all duration-500 hover:-translate-y-3 ${style.borderHover} hover:shadow-2xl card-shine`}>

        {/* Top badges row */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {hasPromo && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-danger text-white text-xs font-black shadow-lg shadow-danger/30">
              -{discount}%
            </span>
          )}
          {product.featured && !hasPromo && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-warning/20 text-warning text-xs font-bold border border-warning/30">
              Destaque
            </span>
          )}
          {isNew && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-secondary/20 text-secondary text-xs font-bold border border-secondary/30">
              Novo
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 z-10 p-2.5 rounded-xl backdrop-blur-md border transition-all duration-300 shadow-lg ${
            isFavorited
              ? 'bg-accent/20 border-accent/40 text-accent'
              : 'bg-dark-900/60 border-dark-600 text-text-muted hover:text-accent hover:border-accent/40 hover:bg-accent/10'
          }`}
        >
          <FiHeart className={`w-4 h-4 transition-transform group-hover:scale-110 ${isFavorited ? 'fill-accent' : ''}`} />
        </button>

        {/* Image */}
        <div className={`relative bg-gradient-to-br ${style.gradient} overflow-hidden`} style={{ aspectRatio: '1/1' }}>
          {isOutOfStock && (
            <div className="absolute inset-0 bg-dark-900/75 z-10 flex items-center justify-center backdrop-blur-sm">
              <span className="px-4 py-2 rounded-xl bg-danger/20 border border-danger text-danger font-black text-sm tracking-wider transform -rotate-6 shadow-xl">
                ESGOTADO
              </span>
            </div>
          )}

          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="object-contain w-full h-full p-6 transition-all duration-700 group-hover:scale-110 group-hover:drop-shadow-xl"
          />

          {/* Hover overlay with split buttons */}
          <div className="absolute inset-0 bg-dark-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-10">
            <button
              onClick={handleQuickViewClick}
              className="p-3 bg-white/10 hover:bg-primary/20 backdrop-blur-md rounded-xl text-white border border-white/20 hover:border-primary/45 transition-all hover:scale-105 shadow-lg active:scale-95 cursor-pointer"
              title="Espiada Rápida"
            >
              <FiEye className="w-5 h-5" />
            </button>
            <span 
              className="p-3 bg-white/10 hover:bg-secondary/20 backdrop-blur-md rounded-xl text-white border border-white/20 hover:border-secondary/45 transition-all hover:scale-105 shadow-lg active:scale-95 flex items-center justify-center"
              title="Ver Detalhes"
            >
              <FiArrowRight className="w-5 h-5" />
            </span>
          </div>

          {/* Colored glow on hover */}
          <div className={`absolute inset-0 bg-primary/0 ${style.glowHover} transition-colors duration-500 pointer-events-none`} />
        </div>

        {/* Separator gradient */}
        <div className="h-px bg-gradient-to-r from-transparent via-dark-600 to-transparent group-hover:via-primary/30 transition-all duration-500" />

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          {/* Category & Brand */}
          <div className="flex justify-between items-center mb-3">
            <span className={`text-xs font-bold px-2 py-0.5 border rounded-full ${style.accentText}`}>
              {product.category?.name || 'Categoria'}
            </span>
            <span className="text-xs text-text-muted bg-dark-700/80 px-2 py-0.5 rounded-full">
              {product.brand?.name || 'Marca'}
            </span>
          </div>

          {/* Name */}
          <h3 className="text-sm md:text-base font-bold text-text-primary mb-4 line-clamp-2 group-hover:text-primary transition-colors duration-300 flex-grow leading-snug">
            {product.name}
          </h3>

          {/* Price & Button */}
          <div className="mt-auto">
            <div className="flex items-end justify-between mb-4">
              <div className="flex flex-col">
                {hasPromo ? (
                  <>
                    <span className="text-xs text-text-muted line-through">
                      {formatCurrency(product.salePrice)}
                    </span>
                    <span className="text-2xl font-black gradient-text leading-none mt-0.5">
                      {formatCurrency(product.promoPrice)}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-black gradient-text leading-none">
                    {formatCurrency(product.salePrice)}
                  </span>
                )}
              </div>
              {product.stock > 0 && product.stock <= 3 && (
                <span className="text-xs text-warning font-semibold">
                  Restam {product.stock}!
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                isOutOfStock
                  ? 'bg-dark-700 text-text-muted cursor-not-allowed border border-dark-600'
                  : `border ${style.primaryBtn} hover:-translate-y-0.5`
              }`}
            >
              <FiShoppingCart className="w-4 h-4" />
              {isOutOfStock ? 'Sem Estoque' : 'Adicionar ao carrinho'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

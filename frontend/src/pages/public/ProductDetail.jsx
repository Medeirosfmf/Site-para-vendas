import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
  FiHeart, FiShoppingCart, FiArrowLeft, FiCheckCircle, FiXCircle,
  FiShield, FiTruck, FiLock, FiAlertCircle, FiStar,
  FiFeather, FiLayers, FiSmartphone, FiGift, FiGrid, FiX
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import {
  formatCurrency, calculateDiscount, getWhatsAppLink, getProductWhatsAppMessage,
} from '../../utils/formatters';
import ProductGallery from '../../components/product/ProductGallery';
import Spinner from '../../components/ui/Spinner';
import ProductCard from '../../components/product/ProductCard';

// Category-specific visual identity
const CATEGORY_THEMES = {
  perfumes:    { icon: FiFeather, label: 'Perfumaria de Nicho', color: 'text-amber-400',  bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  'body-splash': { icon: FiLayers, label: 'Body Splash', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  cremes:      { icon: FiLayers, label: 'Cremes', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  kits:        { icon: FiGift, label: 'Kits', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  smartphones: { icon: FiSmartphone, label: 'Tech Premium', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
  default:     { icon: FiGrid, label: 'Produto', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
};

// Urgency stock threshold
const URGENCY_THRESHOLD = 5;

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Review states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Cleanup preview URLs on unmount/re-render
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!formComment.trim()) {
      toast.error('O comentário é obrigatório');
      return;
    }
    setSubmitLoading(true);
    try {
      const formData = new FormData();
      formData.append('rating', formRating);
      if (formTitle.trim()) {
        formData.append('title', formTitle.trim());
      }
      formData.append('comment', formComment.trim());
      
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      const { data } = await api.post(`/products/${product.id}/reviews`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (data.success) {
        toast.success('Avaliação enviada com sucesso!');
        setProduct(prev => {
          const existingReviews = prev.reviews || [];
          const existsIdx = existingReviews.findIndex(r => r.userId === data.data.userId);
          let newReviews = [...existingReviews];
          if (existsIdx > -1) {
            newReviews[existsIdx] = data.data;
          } else {
            newReviews = [data.data, ...newReviews];
          }
          return {
            ...prev,
            reviews: newReviews
          };
        });
        setFormRating(5);
        setFormTitle('');
        setFormComment('');
        setSelectedFiles([]);
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        setPreviewUrls([]);
        setShowReviewForm(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao enviar avaliação');
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    async function fetchProductData() {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${slug}`);
        if (data.success) {
          setProduct(data.data);
          setQuantity(1);
          setAddedToCart(false);

          if (data.data.categoryId) {
            const relResponse = await api.get(`/products?categoryId=${data.data.categoryId}&limit=5`);
            if (relResponse.data.success) {
              const filtered = relResponse.data.data.products.filter(p => p.id !== data.data.id);
              setRelatedProducts(filtered.slice(0, 4));
            }
          }

          if (isAuthenticated) {
            const favResponse = await api.get('/favorites');
            if (favResponse.data.success) {
              const exists = favResponse.data.data.some(fav => fav.productId === data.data.id);
              setIsFavorited(exists);
            }
          }
        }
      } catch (err) {
        toast.error('Erro ao carregar detalhes do produto');
        navigate('/produtos');
      } finally {
        setLoading(false);
      }
    }
    fetchProductData();
  }, [slug, isAuthenticated, navigate]);

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Faça login para favoritar produtos');
      navigate('/login');
      return;
    }
    setFavoriteLoading(true);
    try {
      if (isFavorited) {
        await api.delete(`/favorites/${product.id}`);
        setIsFavorited(false);
        toast.success('Removido dos favoritos');
      } else {
        await api.post('/favorites', { productId: product.id });
        setIsFavorited(true);
        toast.success('Adicionado aos favoritos!');
      }
    } catch {
      toast.error('Erro ao gerenciar favoritos');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.error('Produto sem estoque disponível');
      return;
    }
    addToCart(product.id, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleBuyWhatsApp = () => {
    const message = getProductWhatsAppMessage(product);
    window.open(getWhatsAppLink(message), '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-white mb-4">Produto não encontrado</h2>
        <Link to="/produtos" className="btn-primary">Voltar para a loja</Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const hasLowStock = product.stock > 0 && product.stock <= URGENCY_THRESHOLD;
  const currentPrice = product.promoPrice || product.salePrice;
  const discountPercent = product.promoPrice ? calculateDiscount(product.salePrice, product.promoPrice) : 0;
  const specs = typeof product.specifications === 'string'
    ? JSON.parse(product.specifications)
    : product.specifications;
  const catSlug = product.category?.slug || 'default';
  const theme = CATEGORY_THEMES[catSlug] || CATEGORY_THEMES.default;

  // Review calculations
  const reviews = product.reviews || [];
  const reviewsCount = reviews.length;
  const avgRating = reviewsCount > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount).toFixed(1)
    : 0;

  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    if (starCounts[r.rating] !== undefined) {
      starCounts[r.rating]++;
    }
  });
  const getStarPercentage = (star) => {
    if (reviewsCount === 0) return 0;
    return Math.round((starCounts[star] / reviewsCount) * 100);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-text-primary">
      <Helmet>
        <title>{product.metaTitle || `${product.name} - Imports GR`}</title>
        <meta name="description" content={product.metaDescription || product.description} />
      </Helmet>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-8">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <Link to="/produtos" className="hover:text-primary transition-colors">Produtos</Link>
        <span>/</span>
        <span className={`font-medium ${theme.color}`}>{product.category?.name}</span>
        <span>/</span>
        <span className="text-text-secondary truncate max-w-[180px]">{product.name}</span>
      </nav>

      {/* Back link on mobile */}
      <Link to="/produtos" className="inline-flex items-center gap-2 text-sm text-secondary hover:underline mb-6 sm:hidden">
        <FiArrowLeft /> Voltar
      </Link>

      {/* ========================
          MAIN PRODUCT GRID
          ======================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

        {/* LEFT: Gallery */}
        <div className="lg:col-span-6">
          <ProductGallery mainImage={product.mainImage} images={product.images} />
        </div>

        {/* RIGHT: Info & Actions */}
        <div className="lg:col-span-6 flex flex-col gap-6">

          {/* Category + Brand chips */}
          <div className="flex flex-wrap gap-2">
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${theme.bg} ${theme.color} border ${theme.border}`}>
              {React.createElement(theme.icon, { className: 'w-3.5 h-3.5' })} {product.category?.name}
            </span>
            {product.brand?.name && (
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                {product.brand.name}
              </span>
            )}
            {product.featured && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-warning/10 text-warning border border-warning/20 flex items-center gap-1">
                <FiStar className="w-3 h-3 fill-warning" /> Destaque
              </span>
            )}
          </div>

          {/* Product Name */}
          <div>
            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-black tracking-tight text-text-primary leading-tight mb-3">
              {product.name}
            </h1>

            {/* Rating — social proof */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => {
                  const starVal = i + 1;
                  const isFilled = starVal <= Math.round(avgRating);
                  return (
                    <FiStar
                      key={i}
                      className={`w-4 h-4 ${
                        isFilled ? 'text-warning fill-warning' : 'text-text-muted'
                      }`}
                    />
                  );
                })}
              </div>
              <span className="text-sm text-text-secondary">
                {reviewsCount > 0 ? (
                  <>
                    {avgRating} <span className="text-text-muted">({reviewsCount} {reviewsCount === 1 ? 'avaliação' : 'avaliações'})</span>
                  </>
                ) : (
                  <span className="text-text-muted">Nenhuma avaliação</span>
                )}
              </span>
              <span className="text-text-muted text-xs">·</span>
              <span className="text-xs text-text-muted">+500 vendidos</span>
            </div>
          </div>

          {/* PRICE BOX */}
          <div className="relative rounded-2xl border border-dark-600/80 bg-dark-800/60 p-6 overflow-hidden">
            {/* Glow decoration */}
            <div className={`absolute right-0 top-0 w-32 h-32 rounded-full blur-2xl opacity-30 pointer-events-none ${
              catSlug === 'smartphones' ? 'bg-sky-500' : 'bg-primary'
            }`} />

            {product.promoPrice ? (
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm line-through text-text-muted">{formatCurrency(product.salePrice)}</span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-danger text-white text-xs font-black shadow-lg shadow-danger/30">
                    -{discountPercent}% OFF
                  </span>
                </div>
                <p className="text-4xl font-black gradient-text mb-2">{formatCurrency(product.promoPrice)}</p>
              </div>
            ) : (
              <p className="text-4xl font-black gradient-text mb-2">{formatCurrency(product.salePrice)}</p>
            )}
            <p className="text-xs text-text-muted">Parcelado em até 12x no cartão · Desconto exclusivo no PIX</p>
          </div>

          {/* STOCK STATUS — Urgency Trigger */}
          <div>
            {isOutOfStock ? (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-danger/10 border border-danger/20">
                <FiXCircle className="w-5 h-5 text-danger flex-shrink-0" />
                <span className="text-sm text-danger font-semibold">Produto temporariamente indisponível</span>
              </div>
            ) : hasLowStock ? (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-warning/10 border border-warning/20">
                <FiAlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
                <div>
                  <p className="text-sm text-warning font-bold">Últimas {product.stock} unidades em estoque!</p>
                  <p className="text-xs text-text-muted">Garanta o seu antes que esgote.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-success/10 border border-success/20">
                <FiCheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                <span className="text-sm text-success font-semibold">Em estoque · Pronta entrega</span>
              </div>
            )}
          </div>

          {/* QUANTITY + CTAs */}
          <div className="space-y-3">
            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-text-secondary">Quantidade:</span>
                <div className="flex items-center bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-text-secondary hover:bg-dark-700 hover:text-text-primary transition-all text-lg font-bold"
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-black text-text-primary text-base">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="w-10 h-10 flex items-center justify-center text-text-secondary hover:bg-dark-700 hover:text-text-primary transition-all text-lg font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Primary CTA */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-3.5 rounded-lg font-bold text-base flex items-center justify-center gap-3 transition-all duration-300 shadow-md ${
                isOutOfStock
                  ? 'bg-dark-700 text-text-muted cursor-not-allowed border border-dark-600'
                  : addedToCart
                  ? 'bg-success text-white'
                  : 'btn-primary hover:scale-[1.01]'
              }`}
            >
              {addedToCart ? (
                <><FiCheckCircle className="w-5 h-5" /> Adicionado!</>
              ) : (
                <><FiShoppingCart className="w-5 h-5" /> {isOutOfStock ? 'Produto esgotado' : 'Adicionar ao carrinho'}</>
              )}
            </button>

            {/* Secondary CTA: WhatsApp */}
            <button
              onClick={handleBuyWhatsApp}
              className="w-full py-3 rounded-lg font-bold text-base flex items-center justify-center gap-3 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366] hover:text-white transition-all duration-300"
            >
              <FaWhatsapp className="w-5 h-5" /> Comprar via WhatsApp
            </button>

            {/* Tertiary: Favorite */}
            <button
              onClick={handleFavoriteToggle}
              disabled={favoriteLoading}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all border ${
                isFavorited
                  ? 'border-accent/30 bg-accent/10 text-accent hover:bg-accent/20'
                  : 'border-dark-600 text-text-muted hover:border-dark-500 hover:text-text-secondary'
              }`}
            >
              <FiHeart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              {isFavorited ? 'Salvo nos Favoritos' : 'Salvar nos Favoritos'}
            </button>
          </div>

          {/* Trust icons — unified below CTAs */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { icon: FiShield, label: '100% Original', sub: 'Garantia' },
              { icon: FiTruck, label: 'Envio Rápido', sub: 'Rastreio' },
              { icon: FiLock, label: 'Compra Segura', sub: 'Dados seguros' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="glass-card p-3 flex flex-col items-center text-center gap-1 border-dark-600/60">
                <Icon className="w-5 h-5 text-success" />
                <p className="text-xs font-bold text-text-primary">{label}</p>
                <p className="text-[10px] text-text-muted">{sub}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-2 pt-2 border-t border-dark-700/50">
              <h3 className="text-base font-bold text-text-primary">Descrição</h3>
              <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Specifications */}
          {specs && Object.keys(specs).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-text-primary">Especificações Técnicas</h3>
              <div className="glass-card overflow-hidden border border-dark-600/60 rounded-xl">
                <table className="min-w-full divide-y divide-dark-700/50">
                  <tbody className="divide-y divide-dark-700/50">
                    {Object.entries(specs).map(([key, value]) => (
                      <tr key={key} className="hover:bg-dark-700/30 transition-colors">
                        <td className="px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-wide w-2/5 bg-dark-800/60">
                          {key}
                        </td>
                        <td className="px-4 py-3 text-sm text-text-secondary">
                          {String(value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================
          REVIEWS & FEEDBACK SECTION
          ======================== */}
      <div className="mt-20 border-t border-dark-700/50 pt-16">
        <h2 className="text-2xl font-black text-text-primary mb-10">
          Avaliações de <span className="gradient-text">clientes</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Star Ratings Breakdown (col-span-4) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <span className="text-5xl font-black text-text-primary leading-none">
                {avgRating}
              </span>
              <div className="flex flex-col">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => {
                    const starVal = i + 1;
                    const isFilled = starVal <= Math.round(avgRating);
                    return (
                      <FiStar
                        key={i}
                        className={`w-5 h-5 ${
                          isFilled ? 'text-warning fill-warning' : 'text-text-muted'
                        }`}
                      />
                    );
                  })}
                </div>
                <span className="text-sm text-text-muted mt-1">
                  Média de {avgRating} de 5 estrelas
                </span>
              </div>
            </div>

            <p className="text-sm text-text-muted">
              {reviewsCount} {reviewsCount === 1 ? 'avaliação global' : 'avaliações globais'}
            </p>

            {/* Stars Breakdown progress bars */}
            <div className="space-y-3 mt-2">
              {[5, 4, 3, 2, 1].map(stars => {
                const percentage = getStarPercentage(stars);
                return (
                  <div key={stars} className="flex items-center text-sm gap-4">
                    <span className="text-text-secondary w-16 whitespace-nowrap">
                      {stars} {stars === 1 ? 'estrela' : 'estrelas'}
                    </span>
                    <div className="flex-grow h-3 bg-dark-800 rounded-full overflow-hidden border border-dark-600">
                      <div
                        className="h-full bg-warning transition-all duration-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-text-muted w-10 text-right">
                      {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Write a review prompt */}
            <div className="border-t border-dark-700/50 pt-6 mt-4">
              <h3 className="text-lg font-bold text-text-primary mb-2">Avalie este produto</h3>
              <p className="text-sm text-text-secondary mb-4">
                Compartilhe seus pensamentos com outros clientes
              </p>
              {isAuthenticated ? (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="btn-secondary w-full py-2.5"
                >
                  {showReviewForm ? 'Cancelar Avaliação' : 'Escrever uma avaliação'}
                </button>
              ) : (
                <div className="rounded-xl border border-dark-600 bg-dark-800/40 p-4 text-center">
                  <p className="text-sm text-text-muted mb-3">Você precisa estar logado para avaliar.</p>
                  <Link to="/login" className="btn-primary inline-block text-xs py-2 px-4">
                    Entrar na minha conta
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right: Reviews List & Write Review Form (col-span-8) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Review form */}
            {showReviewForm && isAuthenticated && (
              <form onSubmit={handleReviewSubmit} className="glass-card p-6 border-primary/20 flex flex-col gap-4 animate-fade-in">
                <h3 className="text-lg font-black text-text-primary">
                  Sua <span className="text-primary">avaliação</span> do produto
                </h3>

                {/* Stars selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-text-secondary">Classificação geral</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map(stars => {
                      const isHovered = stars <= hoverRating;
                      const isSelected = stars <= formRating;
                      return (
                        <button
                          key={stars}
                          type="button"
                          onClick={() => setFormRating(stars)}
                          onMouseEnter={() => setHoverRating(stars)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="text-2xl transition-colors duration-200"
                        >
                          <FiStar
                            className={`${
                              isHovered || (!hoverRating && isSelected)
                                ? 'text-warning fill-warning'
                                : 'text-text-muted'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="review-title" className="text-sm font-bold text-text-secondary">
                    Adicione um título (opcional)
                  </label>
                  <input
                    id="review-title"
                    type="text"
                    placeholder="Qual é o mais importante para destacar?"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                {/* Comment */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="review-comment" className="text-sm font-bold text-text-secondary">
                    Escreva sua avaliação
                  </label>
                  <textarea
                    id="review-comment"
                    rows={4}
                    placeholder="O que você achou do produto? Fale sobre a entrega, qualidade, etc."
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    required
                    className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                {/* Images Upload (up to 3 files) */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-text-secondary">Fotos do produto (máximo 3 fotos)</label>
                  <div className="flex flex-col gap-3">
                    
                    {/* Select Files Area */}
                    <div className="relative group/upload border border-dashed border-dark-600 hover:border-primary/50 bg-dark-800/40 rounded-2xl p-6 text-center transition-all cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          // Max 3 images
                          const validFiles = [...selectedFiles, ...files].slice(0, 3);
                          setSelectedFiles(validFiles);

                          // Revoke old object URLs to avoid memory leaks
                          previewUrls.forEach(url => URL.revokeObjectURL(url));
                          
                          // Generate new previews
                          const newPreviews = validFiles.map(file => URL.createObjectURL(file));
                          setPreviewUrls(newPreviews);
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        disabled={selectedFiles.length >= 3}
                      />
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <span className="text-primary text-xs font-black">Selecionar fotos do seu dispositivo</span>
                        <span className="text-[10px] text-text-muted">JPEG, PNG, WebP ou GIF (máx. 3 arquivos)</span>
                      </div>
                    </div>

                    {/* Previews List */}
                    {previewUrls.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-1">
                        {previewUrls.map((url, idx) => (
                          <div key={idx} className="relative w-20 h-20 bg-dark-900 border border-dark-600 rounded-xl overflow-hidden p-1 flex items-center justify-center group/preview">
                            <img src={url} alt={`Prévia ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={() => {
                                const newFiles = selectedFiles.filter((_, i) => i !== idx);
                                setSelectedFiles(newFiles);

                                previewUrls.forEach(url => URL.revokeObjectURL(url));
                                const newPreviews = newFiles.map(file => URL.createObjectURL(file));
                                setPreviewUrls(newPreviews);
                              }}
                              className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-danger text-white rounded-md transition-all shadow-md cursor-pointer opacity-0 group-hover/preview:opacity-100"
                              title="Remover foto"
                            >
                              <FiX className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="btn-primary py-3 font-bold text-sm tracking-wide self-start px-6"
                >
                  {submitLoading ? 'Enviando...' : 'Enviar Avaliação'}
                </button>
              </form>
            )}

            {/* List of reviews */}
            <div className="flex flex-col gap-6">
              <h3 className="text-lg font-black text-text-primary border-b border-dark-700/50 pb-3">
                Mais recentes no Brasil
              </h3>

              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-dark-800/20 border border-dashed border-dark-600 rounded-2xl">
                  <p className="text-text-muted text-sm">Este produto ainda não possui avaliações.</p>
                  <p className="text-text-muted text-xs mt-1">Seja o primeiro a avaliar!</p>
                </div>
              ) : (
                <div className="divide-y divide-dark-700/50 space-y-6">
                  {reviews.map((rev, idx) => (
                    <div key={rev.id} className={`pt-6 ${idx === 0 ? 'pt-0' : ''} flex flex-col gap-3`}>
                      {/* User Profile */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center text-xs font-bold text-text-primary">
                          {rev.user?.name ? rev.user.name[0].toUpperCase() : 'U'}
                        </div>
                        <span className="text-sm font-bold text-text-primary">
                          {rev.user?.name || 'Cliente'}
                        </span>
                        {rev.user?.role === 'ADMIN' && (
                          <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded font-black">
                            ADMIN
                          </span>
                        )}
                      </div>

                      {/* Stars & Title */}
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? 'text-warning fill-warning' : 'text-text-muted'
                              }`}
                            />
                          ))}
                        </div>
                        {rev.title && (
                          <span className="text-sm font-black text-text-primary">
                            {rev.title}
                          </span>
                        )}
                      </div>

                      {/* Review date */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="text-xs text-text-muted">
                          Avaliado no Brasil em {new Date(rev.createdAt).toLocaleDateString('pt-BR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                        {rev.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#25D366] font-bold">
                            <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#25D366]/10 text-[9px]">✓</span>
                            Compra Confirmada
                          </span>
                        )}
                      </div>

                      {/* Comment text */}
                      <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
                        {rev.comment}
                      </p>

                      {/* Review images gallery */}
                      {rev.images && rev.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {rev.images.map((imgUrl, imgIdx) => {
                            const fullUrl = imgUrl.startsWith('http') ? imgUrl : `${baseUrl}${imgUrl}`;
                            return (
                              <button
                                key={imgIdx}
                                type="button"
                                onClick={() => setLightboxImage(fullUrl)}
                                className="w-16 h-16 bg-dark-900 border border-dark-600 hover:border-primary rounded-xl overflow-hidden p-1 transition-all cursor-zoom-in flex-shrink-0 flex items-center justify-center"
                              >
                                <img src={fullUrl} alt="Foto de avaliação" className="w-full h-full object-cover rounded-lg" />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sm text-text-muted uppercase tracking-widest font-bold mb-2">Da mesma categoria</p>
              <h2 className="text-2xl font-black text-text-primary">
                Você também pode <span className="gradient-text">gostar</span>
              </h2>
            </div>
            <Link to="/produtos" className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/10 transition-all">
              Ver mais →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(relProduct => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </div>
      )}
      {/* Review Image Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setLightboxImage(null)} />
          <div className="relative max-w-4xl max-h-[85vh] z-10 bg-[#111118] border border-white/[0.08] p-4 rounded-3xl scale-in">
            <button 
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 z-20 p-2 text-text-muted hover:text-white hover:bg-white/[0.06] rounded-xl transition-all"
            >
              <FiX className="w-5 h-5" />
            </button>
            <img src={lightboxImage} alt="Visualização" className="max-w-full max-h-[75vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}

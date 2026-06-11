import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { FiHeart, FiShare2 } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import ProductCard from '../../components/product/ProductCard';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function Favorites() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Faça login para ver seus favoritos');
      navigate('/login');
      return;
    }

    async function fetchFavorites() {
      try {
        const { data } = await api.get('/favorites');
        if (data.success) {
          setFavorites(data.data);
        }
      } catch (err) {
        toast.error('Erro ao carregar lista de favoritos');
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, [isAuthenticated, navigate]);

  const handleFavoriteToggle = async (productId) => {
    try {
      await api.delete(`/favorites/${productId}`);
      setFavorites(prev => prev.filter(item => item.productId !== productId));
      toast.success('Removido dos favoritos!');
    } catch (err) {
      toast.error('Erro ao remover dos favoritos');
    }
  };

  const handleShareList = () => {
    if (favorites.length === 0) return;
    
    // Copy link of the site
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link da página de favoritos copiado!');
  };

  const handleShareWhatsApp = () => {
    if (favorites.length === 0) return;

    let message = 'Confira meus produtos favoritos na *Imports GR*:\n\n';
    favorites.forEach((fav) => {
      const price = fav.product.promoPrice || fav.product.salePrice;
      message += `• *${fav.product.name}* - ${formatCurrency(price)}\n🔗 ${window.location.origin}/produto/${fav.product.slug}\n\n`;
    });

    const phone = '5541997246465';
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-text-primary">
        <Helmet>
          <title>Favoritos - Imports GR</title>
        </Helmet>
        <EmptyState
          icon={FiHeart}
          title="Nenhum favorito salvo"
          message="Navegue pelo nosso catálogo e salve os seus produtos preferidos para vê-los aqui."
          action={
            <Link to="/produtos" className="btn-primary px-6 py-2.5 rounded-lg inline-block">
              Ver Produtos
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-text-primary">
      <Helmet>
        <title>Meus Favoritos - Imports GR</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Meus Favoritos</h1>
          <p className="text-text-secondary text-sm mt-1">
            Você tem {favorites.length} {favorites.length === 1 ? 'produto salvo' : 'produtos salvos'}.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleShareList}
            className="btn-secondary flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg border border-dark-600 hover:border-text-muted transition-all"
          >
            <FiShare2 className="w-4 h-4" /> Copiar Link da Lista
          </button>
          
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-colors border-none"
          >
            <FaWhatsapp className="w-4 h-4" /> Compartilhar via WhatsApp
          </button>
        </div>
      </div>

      {/* Grid of favorited products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favorites.map((fav) => (
          <ProductCard
            key={fav.id}
            product={fav.product}
            isFavorited={true}
            onFavoriteToggle={() => handleFavoriteToggle(fav.productId)}
          />
        ))}
      </div>
    </div>
  );
}

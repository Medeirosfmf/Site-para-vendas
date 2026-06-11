import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { FiTrash2, FiShoppingBag, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency } from '../../utils/formatters';
import api from '../../api/axios';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

export default function Cart() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items, loading, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();

  const [notes, setNotes] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Faça login para finalizar o pedido');
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      toast.error('Seu carrinho está vazio');
      return;
    }

    setCheckoutLoading(true);
    try {
      const { data } = await api.post('/orders', { notes });
      if (data.success) {
        setPlacedOrder(data.data);
        toast.success('Pedido finalizado com sucesso!');
        await clearCart();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao finalizar o pedido. Verifique o estoque.');
    } finally {
      setCheckoutLoading(true);
      // Wait a moment then set checkout loading to false
      setTimeout(() => setCheckoutLoading(false), 500);
    }
  };

  const handleWhatsAppPayment = () => {
    if (!placedOrder) return;
    const phone = '5541997246465';
    const message = `Olá! Acabei de fazer o pedido #${placedOrder.id} no site da Imports GR.\n\n` +
      `*Detalhes do Pedido:*\n` +
      `Total: ${formatCurrency(placedOrder.total)}\n\n` +
      `Gostaria de confirmar os dados de pagamento (Pix/Cartão) e entrega. Obrigado!`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  };

  if (loading && items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Order placed screen
  if (placedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-text-primary">
        <Helmet>
          <title>Pedido Realizado - Imports GR</title>
        </Helmet>
        <div className="w-24 h-24 rounded-full bg-success/20 border border-success/30 flex items-center justify-center mx-auto mb-8 animate-bounce">
          <FiCheckCircle className="w-12 h-12 text-success" />
        </div>
        <h1 className="text-3xl font-extrabold mb-2">Pedido Realizado com Sucesso!</h1>
        <p className="text-text-secondary mb-8">
          Obrigado pela sua compra. Seu pedido <span className="text-secondary font-semibold">#{placedOrder.id}</span> foi recebido e está sendo analisado.
        </p>

        <div className="glass-card p-6 border border-dark-600 rounded-2xl text-left mb-8 max-w-xl mx-auto space-y-4">
          <h3 className="text-lg font-bold border-b border-dark-600 pb-2">Resumo do Pedido</h3>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Status:</span>
            <span className="font-semibold text-warning">Recebido / Em Análise</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Valor Total:</span>
            <span className="font-extrabold text-primary text-base">
              {formatCurrency(placedOrder.total)}
            </span>
          </div>
          {placedOrder.notes && (
            <div className="text-xs text-text-secondary bg-dark-800 p-3 rounded-lg border border-dark-600">
              <span className="font-semibold block mb-1">Observações:</span>
              {placedOrder.notes}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleWhatsAppPayment}
            className="btn-success flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold px-6 py-3 rounded-lg transition-colors border-none"
          >
            <FaWhatsapp className="w-5 h-5" /> Enviar Pedido via WhatsApp
          </button>
          <Link to="/produtos" className="btn-secondary px-6 py-3 rounded-lg">
            Continuar Comprando
          </Link>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Helmet>
          <title>Carrinho - Imports GR</title>
        </Helmet>
        <EmptyState
          icon={FiShoppingBag}
          title="Você não está logado"
          message="Faça login em sua conta para ver seus itens salvos ou adicionar novos produtos."
          action={
            <Link to="/login" className="btn-primary px-6 py-2.5 rounded-lg inline-block">
              Entrar na Conta
            </Link>
          }
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Helmet>
          <title>Carrinho - Imports GR</title>
        </Helmet>
        <EmptyState
          icon={FiShoppingBag}
          title="Seu carrinho está vazio"
          message="Dê uma olhada em nossa seleção de produtos e encontre as melhores ofertas de importados."
          action={
            <Link to="/produtos" className="btn-primary px-6 py-2.5 rounded-lg inline-block">
              Ver Produtos
            </Link>
          }
        />
      </div>
    );
  }

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-text-primary">
      <Helmet>
        <title>Meu Carrinho - Imports GR</title>
      </Helmet>

      <h1 className="text-3xl font-extrabold mb-8 tracking-tight">Meu Carrinho</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;
            const price = product.promoPrice || product.salePrice;
            const subtotal = price * item.quantity;
            const imageUrl = product.mainImage ? `${baseUrl}${product.mainImage}` : '';

            return (
              <div 
                key={item.id} 
                className="glass-card p-4 sm:p-6 border border-dark-600 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-dark-500 transition-colors"
              >
                {/* Product details info */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-20 h-20 bg-dark-800 rounded-xl overflow-hidden border border-dark-600 flex-shrink-0 flex items-center justify-center p-2">
                    {imageUrl ? (
                      <img src={imageUrl} alt={product.name} className="w-full h-full object-contain" />
                    ) : (
                      <FiShoppingBag className="w-8 h-8 text-text-muted opacity-40" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-secondary block uppercase tracking-wider mb-0.5">
                      {product.brand?.name}
                    </span>
                    <Link 
                      to={`/produto/${product.slug}`} 
                      className="text-base font-bold text-text-primary hover:text-primary transition-colors line-clamp-2"
                    >
                      {product.name}
                    </Link>
                    <span className="text-xs text-text-muted mt-1 block sm:hidden">
                      {formatCurrency(price)} cada
                    </span>
                  </div>
                </div>

                {/* Pricing controls and totals */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                  {/* Quantity selector */}
                  <div className="flex items-center bg-dark-800 border border-dark-600 rounded-lg overflow-hidden">
                    <button 
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                      className="px-2.5 py-1 text-text-secondary hover:bg-dark-700 transition-colors disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="px-3 font-semibold text-sm text-text-primary select-none">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, Math.min(product.stock, item.quantity + 1))}
                      disabled={item.quantity >= product.stock}
                      className="px-2.5 py-1 text-text-secondary hover:bg-dark-700 transition-colors disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal & Delete */}
                  <div className="text-right min-w-[100px]">
                    <span className="text-base font-bold text-text-primary block">
                      {formatCurrency(subtotal)}
                    </span>
                    <span className="text-xs text-text-muted hidden sm:block">
                      {formatCurrency(price)} cada
                    </span>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 bg-dark-700 border border-dark-600 hover:border-danger/30 hover:bg-danger/10 hover:text-danger rounded-lg transition-all text-text-muted"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 border border-dark-600 rounded-2xl space-y-6 sticky top-28">
            <h3 className="text-lg font-bold border-b border-dark-600 pb-3">Resumo da Compra</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Subtotal ({items.reduce((sum, i) => sum + i.quantity, 0)} itens)</span>
                <span className="font-semibold text-text-primary">{formatCurrency(getCartTotal())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Envio / Entrega</span>
                <span className="text-success font-semibold">A combinar</span>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-2">
              <label htmlFor="notes" className="text-xs font-semibold text-text-secondary block">
                Observações do Pedido (opcional)
              </label>
              <textarea
                id="notes"
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Insira detalhes de entrega, modelo, cores ou qualquer observação necessária..."
                className="w-full bg-dark-800 border border-dark-600 rounded-lg p-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary transition-all resize-none"
              />
            </div>

            <div className="border-t border-dark-600 pt-4 flex justify-between items-end">
              <span className="text-sm text-text-secondary font-bold">Total Estimado</span>
              <span className="text-2xl font-black text-primary">
                {formatCurrency(getCartTotal())}
              </span>
            </div>

            <Button 
              variant="primary" 
              fullWidth 
              onClick={handleCheckout}
              isLoading={checkoutLoading}
              className="py-3 flex items-center justify-center gap-2"
            >
              Finalizar Pedido <FiArrowRight className="w-4 h-4" />
            </Button>

            <p className="text-[10px] text-text-muted text-center leading-normal">
              Ao clicar em Finalizar, seu pedido será gerado em nosso sistema. O pagamento e detalhes de frete serão acordados diretamente via WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

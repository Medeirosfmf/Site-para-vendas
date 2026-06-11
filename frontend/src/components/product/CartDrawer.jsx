import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiX, FiTrash2, FiShoppingBag, FiArrowRight, FiPlus, FiMinus } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency } from '../../utils/formatters';

export default function CartDrawer() {
  const { 
    items, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    getCartTotal, 
    getCartCount 
  } = useCart();
  
  const navigate = useNavigate();
  const drawerRef = useRef(null);

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsCartOpen(false);
    };
    if (isCartOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent main page scrolling
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/carrinho');
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer Panel */}
      <div 
        ref={drawerRef}
        className="relative w-full max-w-md h-full bg-[#111118]/95 border-l border-white/[0.08] backdrop-blur-xl shadow-2xl flex flex-col z-10 animate-slide-in"
      >
        {styleOverlay()}

        {/* Header */}
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FiShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-black text-white">Seu Carrinho</h2>
            <span className="bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 text-xs font-bold rounded-full">
              {getCartCount()}
            </span>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-text-muted hover:text-white hover:bg-white/[0.06] rounded-xl transition-all"
            aria-label="Fechar"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content / Items List */}
        <div className="flex-grow overflow-y-auto p-5 space-y-4 hide-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-text-muted mb-4">
                <FiShoppingBag className="w-7 h-7 opacity-40" />
              </div>
              <p className="text-base font-bold text-white mb-1">O carrinho está vazio</p>
              <p className="text-xs text-text-secondary max-w-[240px] leading-relaxed mb-6">
                Explore a loja e encontre os melhores perfumes e eletrônicos importados!
              </p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="btn-primary text-xs px-5 py-2.5 rounded-lg font-bold"
              >
                Voltar a Comprar
              </button>
            </div>
          ) : (
            items.map((item) => {
              const product = item.product;
              if (!product) return null;
              const price = product.promoPrice || product.salePrice;
              const imageUrl = product.mainImage ? `${baseUrl}${product.mainImage}` : '';

              return (
                <div 
                  key={item.id}
                  className="flex gap-4 p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:border-white/[0.08] transition-all"
                >
                  {/* Thumb image */}
                  <div className="w-16 h-16 bg-white/[0.03] border border-white/[0.06] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-1.5">
                    {imageUrl ? (
                      <img src={imageUrl} alt={product.name} className="w-full h-full object-contain" />
                    ) : (
                      <FiShoppingBag className="w-6 h-6 text-text-muted opacity-30" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-grow min-w-0">
                    <span className="text-[9px] font-bold text-secondary uppercase tracking-wider block mb-0.5">
                      {product.brand?.name}
                    </span>
                    <h4 className="text-sm font-bold text-white line-clamp-1 hover:text-primary transition-colors mb-2">
                      <Link to={`/produto/${product.slug}`} onClick={() => setIsCartOpen(false)}>
                        {product.name}
                      </Link>
                    </h4>

                    {/* Quantity Selector & Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-dark-900 border border-white/[0.06] rounded-md overflow-hidden">
                        <button 
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="px-1.5 py-0.5 text-text-secondary hover:bg-white/[0.04] transition-colors disabled:opacity-30"
                          disabled={item.quantity <= 1}
                        >
                          <FiMinus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 font-bold text-xs text-white select-none">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, Math.min(product.stock, item.quantity + 1))}
                          className="px-1.5 py-0.5 text-text-secondary hover:bg-white/[0.04] transition-colors disabled:opacity-30"
                          disabled={item.quantity >= product.stock}
                        >
                          <FiPlus className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-sm font-black text-primary">
                          {formatCurrency(price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="self-start p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20 rounded-lg transition-all"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div className="p-5 border-t border-white/[0.06] bg-[#0c0c12]/80 space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-xs text-text-secondary font-bold">Total Estimado</span>
              <span className="text-xl font-black text-primary">
                {formatCurrency(getCartTotal())}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setIsCartOpen(false)}
                className="w-full py-3 border border-white/[0.08] hover:bg-white/[0.04] rounded-lg text-xs font-bold text-white transition-all text-center"
              >
                Voltar
              </button>
              <button 
                onClick={handleCheckoutClick}
                className="w-full py-3 bg-primary hover:bg-primary-light hover:shadow-lg hover:shadow-primary/20 text-[#0d0d12] rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5"
              >
                Ver Carrinho <FiArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <p className="text-[9px] text-text-muted text-center leading-normal">
              Frete e detalhes de pagamento a combinar via WhatsApp.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function styleOverlay() {
  return (
    <style>{`
      @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
      .animate-slide-in {
        animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
    `}</style>
  );
}

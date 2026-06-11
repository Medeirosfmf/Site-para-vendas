import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/cart');
      if (data.success) {
        setItems(data.data);
      }
    } catch {
      console.error('Erro ao carregar carrinho');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Faça login para adicionar ao carrinho');
      return;
    }
    try {
      const { data } = await api.post('/cart', { productId, quantity });
      if (data.success) {
        await fetchCart();
        toast.success('Produto adicionado ao carrinho!');
        setIsCartOpen(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao adicionar ao carrinho');
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      const { data } = await api.put(`/cart/${cartItemId}`, { quantity });
      if (data.success) {
        setItems(prev => prev.map(item =>
          item.id === cartItemId ? { ...item, quantity } : item
        ));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao atualizar quantidade');
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await api.delete(`/cart/${cartItemId}`);
      setItems(prev => prev.filter(item => item.id !== cartItemId));
      toast.success('Item removido do carrinho');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao remover item');
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear');
      setItems([]);
      toast.success('Carrinho limpo');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao limpar carrinho');
    }
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => {
      const price = parseFloat(item.product?.promoPrice || item.product?.salePrice || 0);
      return total + price * item.quantity;
    }, 0);
  };

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    items,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
    fetchCart,
    isCartOpen,
    setIsCartOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de CartProvider');
  }
  return context;
}

export default CartContext;

import { createContext, useContext, useState } from 'react';
import QuickViewModal from '../components/product/QuickViewModal';

const QuickViewContext = createContext(null);

export function QuickViewProvider({ children }) {
  const [product, setProduct] = useState(null);

  const openQuickView = (prod) => setProduct(prod);
  const closeQuickView = () => setProduct(null);

  return (
    <QuickViewContext.Provider value={{ product, openQuickView, closeQuickView }}>
      {children}
      {product && <QuickViewModal product={product} onClose={closeQuickView} />}
    </QuickViewContext.Provider>
  );
}

export function useQuickView() {
  const context = useContext(QuickViewContext);
  if (!context) {
    throw new Error('useQuickView deve ser usado dentro de QuickViewProvider');
  }
  return context;
}

export default QuickViewContext;

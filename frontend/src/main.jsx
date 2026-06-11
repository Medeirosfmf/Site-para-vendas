import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { QuickViewProvider } from './contexts/QuickViewContext';
import { ThemeProvider } from './contexts/ThemeContext';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <QuickViewProvider>
            <ThemeProvider>
              <App />
            </ThemeProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#12121A',
                  color: '#ffffff',
                  border: '1px solid #2D2D44',
                  borderRadius: '12px',
                  fontSize: '14px',
                },
                success: {
                  iconTheme: {
                    primary: '#00B894',
                    secondary: '#12121A',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#FF6B6B',
                    secondary: '#12121A',
                  },
                },
              }}
            />
          </QuickViewProvider>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  </StrictMode>
);

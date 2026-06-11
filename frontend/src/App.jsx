import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Spinner from './components/ui/Spinner';

// Layouts (Static imports to prevent layout flickering)
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/admin/AdminLayout';

// Public Pages (Lazy Loaded)
const Home = lazy(() => import('./pages/public/Home'));
const Products = lazy(() => import('./pages/public/Products'));
const ProductDetail = lazy(() => import('./pages/public/ProductDetail'));
const Cart = lazy(() => import('./pages/public/Cart'));
const Favorites = lazy(() => import('./pages/public/Favorites'));
const Login = lazy(() => import('./pages/public/Login'));
const Register = lazy(() => import('./pages/public/Register'));
const NotFound = lazy(() => import('./pages/public/NotFound'));

// Admin Pages (Lazy Loaded)
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ProductsList = lazy(() => import('./pages/admin/ProductsList'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));
const Categories = lazy(() => import('./pages/admin/Categories'));
const Brands = lazy(() => import('./pages/admin/Brands'));
const Orders = lazy(() => import('./pages/admin/Orders'));
const OrderDetail = lazy(() => import('./pages/admin/OrderDetail'));
const Customers = lazy(() => import('./pages/admin/Customers'));
const Stock = lazy(() => import('./pages/admin/Stock'));
const Reports = lazy(() => import('./pages/admin/Reports'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense 
        fallback={
          <div className="min-h-screen bg-dark-900 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        }
      >
        <Routes>
          {/* Public Store Layout */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="produtos" element={<Products />} />
            <Route path="produto/:slug" element={<ProductDetail />} />
            <Route path="carrinho" element={<Cart />} />
            <Route path="favoritos" element={<Favorites />} />
            <Route path="login" element={<Login />} />
            <Route path="registro" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Protected Administrative Panel Layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="produtos" element={<ProductsList />} />
            <Route path="produtos/novo" element={<ProductForm />} />
            <Route path="produtos/editar/:id" element={<ProductForm />} />
            <Route path="categorias" element={<Categories />} />
            <Route path="marcas" element={<Brands />} />
            <Route path="pedidos" element={<Orders />} />
            <Route path="pedidos/:id" element={<OrderDetail />} />
            <Route path="clientes" element={<Customers />} />
            <Route path="estoque" element={<Stock />} />
            <Route path="relatorios" element={<Reports />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import CartDrawer from '../product/CartDrawer';

export default function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-dark-900">
      <Header />
      <main className="flex-grow pt-20 md:pt-32">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <CartDrawer />
    </div>
  );
}

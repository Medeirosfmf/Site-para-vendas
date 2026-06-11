import React from 'react';
import ProductCard from './ProductCard';
import EmptyState from '../ui/EmptyState';
import { FiPackage } from 'react-icons/fi';

export default function ProductGrid({ products, loading, emptyMessage = "Nenhum produto encontrado.", favorites = [] }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="glass-card h-full flex flex-col overflow-hidden">
            <div className="aspect-square shimmer"></div>
            <div className="p-5 flex flex-col flex-grow">
              <div className="h-3 w-1/3 shimmer rounded mb-3"></div>
              <div className="h-5 w-full shimmer rounded mb-2"></div>
              <div className="h-5 w-2/3 shimmer rounded mb-4"></div>
              <div className="mt-auto">
                <div className="h-8 w-1/2 shimmer rounded mb-4"></div>
                <div className="h-10 w-full shimmer rounded-xl"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState 
        icon={FiPackage}
        title="Nenhum Produto"
        message={emptyMessage}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          isFavorited={favorites.includes(product.id)} 
        />
      ))}
    </div>
  );
}

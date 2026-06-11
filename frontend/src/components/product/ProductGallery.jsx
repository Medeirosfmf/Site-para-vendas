import React, { useState, useEffect } from 'react';
import { FiImage } from 'react-icons/fi';

export default function ProductGallery({ mainImage, images = [] }) {
  const [activeImage, setActiveImage] = useState('');

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    setActiveImage(mainImage ? `${baseUrl}${mainImage}` : '');
  }, [mainImage, baseUrl]);

  const allImages = [];
  if (mainImage) allImages.push(`${baseUrl}${mainImage}`);
  if (images && images.length > 0) {
    images.forEach(img => {
      const url = `${baseUrl}${img.url}`;
      if (!allImages.includes(url)) allImages.push(url);
    });
  }

  if (allImages.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-dark-800 border border-dark-600 flex flex-col items-center justify-center text-text-muted p-8">
        <FiImage className="w-16 h-16 mb-4 opacity-50" />
        <span className="text-sm">Nenhuma imagem disponível</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square rounded-2xl bg-dark-800 border border-dark-600 overflow-hidden relative group">
        <img 
          src={activeImage || allImages[0]} 
          alt="Produto" 
          fetchpriority="high"
          decoding="async"
          className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-125 origin-center"
        />
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {allImages.map((url, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(url)}
              className={`aspect-square rounded-lg bg-dark-800 border overflow-hidden transition-all ${
                activeImage === url 
                  ? 'border-primary shadow-[0_0_10px_rgba(108,92,231,0.5)] scale-105' 
                  : 'border-dark-600 hover:border-text-muted hover:scale-105'
              }`}
            >
              <img 
                src={url} 
                alt={`Thumbnail ${idx + 1}`} 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

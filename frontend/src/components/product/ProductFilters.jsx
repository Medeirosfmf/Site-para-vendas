import React, { useState } from 'react';
import { FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Button from '../ui/Button';

export default function ProductFilters({ categories, brands, filters, onFilterChange }) {
  const [openSection, setOpenSection] = useState({
    categories: true,
    brands: true,
    price: true,
  });

  const toggleSection = (section) => {
    setOpenSection(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCategoryChange = (categoryId) => {
    onFilterChange({ ...filters, categoryId: categoryId === filters.categoryId ? '' : categoryId });
  };

  const handleBrandChange = (brandId) => {
    onFilterChange({ ...filters, brandId: brandId === filters.brandId ? '' : brandId });
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    onFilterChange({ ...filters, [name]: checked });
  };

  const clearFilters = () => {
    onFilterChange({
      categoryId: '',
      brandId: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      featured: false,
    });
  };

  return (
    <div className="glass-card p-6 h-fit sticky top-24">
      <div className="flex items-center gap-2 mb-6 border-b border-dark-600 pb-4">
        <FiFilter className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-text-primary">Filtros</h3>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <button 
          onClick={() => toggleSection('categories')}
          className="flex items-center justify-between w-full mb-3 text-sm font-semibold text-text-primary hover:text-primary transition-colors"
        >
          <span>Categorias</span>
          {openSection.categories ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        
        {openSection.categories && (
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
            {categories.map(cat => (
              <label key={cat.id} className="flex items-center space-x-3 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={filters.categoryId == cat.id}
                  onChange={() => handleCategoryChange(cat.id)}
                  className="w-4 h-4 rounded border-dark-500 text-primary focus:ring-primary focus:ring-offset-dark-900 bg-dark-800"
                />
                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                  {cat.name} <span className="text-text-muted text-xs ml-1">({cat._count?.products || 0})</span>
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Brands */}
      <div className="mb-6">
        <button 
          onClick={() => toggleSection('brands')}
          className="flex items-center justify-between w-full mb-3 text-sm font-semibold text-text-primary hover:text-primary transition-colors"
        >
          <span>Marcas</span>
          {openSection.brands ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        
        {openSection.brands && (
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
            {brands.map(brand => (
              <label key={brand.id} className="flex items-center space-x-3 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={filters.brandId == brand.id}
                  onChange={() => handleBrandChange(brand.id)}
                  className="w-4 h-4 rounded border-dark-500 text-primary focus:ring-primary focus:ring-offset-dark-900 bg-dark-800"
                />
                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                  {brand.name} <span className="text-text-muted text-xs ml-1">({brand._count?.products || 0})</span>
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="mb-6">
        <button 
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full mb-3 text-sm font-semibold text-text-primary hover:text-primary transition-colors"
        >
          <span>Preço (R$)</span>
          {openSection.price ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        
        {openSection.price && (
          <div className="flex items-center space-x-2">
            <input 
              type="number"
              name="minPrice"
              value={filters.minPrice || ''}
              onChange={handlePriceChange}
              placeholder="Mín"
              className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-3 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
            <span className="text-text-muted">-</span>
            <input 
              type="number"
              name="maxPrice"
              value={filters.maxPrice || ''}
              onChange={handlePriceChange}
              placeholder="Máx"
              className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-3 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        )}
      </div>

      {/* Toggles */}
      <div className="space-y-4 mb-6 pt-4 border-t border-dark-600">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Em Estoque</span>
          <div className="relative">
            <input type="checkbox" name="inStock" checked={filters.inStock || false} onChange={handleToggleChange} className="sr-only" />
            <div className={`block w-10 h-6 rounded-full transition-colors ${filters.inStock ? 'bg-primary' : 'bg-dark-600'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${filters.inStock ? 'transform translate-x-4' : ''}`}></div>
          </div>
        </label>
        
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Apenas Destaques</span>
          <div className="relative">
            <input type="checkbox" name="featured" checked={filters.featured || false} onChange={handleToggleChange} className="sr-only" />
            <div className={`block w-10 h-6 rounded-full transition-colors ${filters.featured ? 'bg-primary' : 'bg-dark-600'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${filters.featured ? 'transform translate-x-4' : ''}`}></div>
          </div>
        </label>
      </div>

      <Button variant="secondary" fullWidth onClick={clearFilters} className="text-xs">
        Limpar Filtros
      </Button>
    </div>
  );
}

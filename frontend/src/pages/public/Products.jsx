import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiFilter, FiX, FiGrid, FiList, FiFeather, FiLayers, FiSmartphone, FiGift } from 'react-icons/fi';
import api from '../../api/axios';
import ProductGrid from '../../components/product/ProductGrid';
import ProductFilters from '../../components/product/ProductFilters';
import Pagination from '../../components/ui/Pagination';
import SearchBar from '../../components/ui/SearchBar';

// Category chips with visual identity
const CATEGORY_CHIPS = [
  { id: '', label: 'Todos', icon: FiGrid, color: 'text-primary border-primary/30 bg-primary/10' },
  { id: 'perfumes', label: 'Perfumes', icon: FiFeather, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  { id: 'body-splash', label: 'Body Splash', icon: FiLayers, color: 'text-pink-400 border-pink-500/30 bg-pink-500/10' },
  { id: 'cremes', label: 'Cremes', icon: FiLayers, color: 'text-green-400 border-green-500/30 bg-green-500/10' },
  { id: 'kits', label: 'Kits', icon: FiGift, color: 'text-violet-400 border-violet-500/30 bg-violet-500/10' },
  { id: 'smartphones', label: 'Tech', icon: FiSmartphone, color: 'text-sky-400 border-sky-500/30 bg-sky-500/10' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeChip, setActiveChip] = useState('');

  // Parse filters from URL
  const filters = {
    categoryId: searchParams.get('categoryId') || '',
    brandId: searchParams.get('brandId') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    inStock: searchParams.get('inStock') === 'true',
    featured: searchParams.get('featured') === 'true',
    search: searchParams.get('busca') || '',
    sort: searchParams.get('sort') || 'newest',
  };

  const page = parseInt(searchParams.get('page') || '1');

  // Memoize categories and brands to avoid re-renders
  const memoizedCategories = useMemo(() => categories, [categories]);
  const memoizedBrands = useMemo(() => brands, [brands]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get('/categories'),
          api.get('/brands'),
        ]);
        if (catRes.data.success) setCategories(catRes.data.data);
        if (brandRes.data.success) setBrands(brandRes.data.data);

        const token = localStorage.getItem('token');
        if (token) {
          const favRes = await api.get('/favorites');
          if (favRes.data.success) {
            setFavorites(favRes.data.data.map(f => f.productId));
          }
        }
      } catch (err) {
        console.error('Erro ao carregar opções');
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', '12');

        if (filters.categoryId) params.append('categoryId', filters.categoryId);
        if (filters.brandId) params.append('brandId', filters.brandId);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.inStock) params.append('inStock', 'true');
        if (filters.featured) params.append('featured', 'true');
        if (filters.search) params.append('search', filters.search);
        if (filters.sort) params.append('sort', filters.sort);

        const { data } = await api.get(`/products?${params.toString()}`);
        if (data.success) {
          setProducts(data.data.products);
          setPagination({ page: data.data.page, totalPages: data.data.totalPages, total: data.data.total });
        }
      } catch (err) {
        console.error('Erro ao buscar produtos');
      } finally {
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    fetchProducts();
  }, [searchParams]);

  const handleChipClick = (chip) => {
    setActiveChip(chip.id);
    const params = new URLSearchParams(searchParams);
    params.delete('categoryId');
    params.delete('page');

    if (chip.id) {
      // Find category by slug
      const cat = memoizedCategories.find(c => c.slug === chip.id);
      if (cat) params.set('categoryId', cat.id);
    }
    setSearchParams(params);
  };

  const handleFilterChange = (newFilters) => {
    setActiveChip(''); // Clear chip selection when using sidebar filters
    const params = new URLSearchParams();
    if (newFilters.categoryId) params.set('categoryId', newFilters.categoryId);
    if (newFilters.brandId) params.set('brandId', newFilters.brandId);
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice);
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice);
    if (newFilters.inStock) params.set('inStock', 'true');
    if (newFilters.featured) params.set('featured', 'true');
    if (filters.search) params.set('busca', filters.search);
    if (filters.sort) params.set('sort', filters.sort);
    setSearchParams(params);
  };

  const handleSortChange = (e) => {
    const sort = e.target.value;
    const params = new URLSearchParams(searchParams);
    if (sort) params.set('sort', sort);
    else params.delete('sort');
    setSearchParams(params);
  };

  const handleSearch = (query) => {
    const params = new URLSearchParams(searchParams);
    if (query) params.set('busca', query);
    else params.delete('busca');
    params.delete('page');
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  // Active filter count for mobile badge
  const activeFilterCount = [
    filters.categoryId, filters.brandId, filters.minPrice,
    filters.maxPrice, filters.inStock, filters.featured,
  ].filter(Boolean).length;

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <Helmet>
        <title>Catálogo de Produtos - Imports GR</title>
        <meta name="description" content="Explore nosso catálogo completo de perfumes importados, smartphones Apple e produtos premium." />
      </Helmet>

      {/* Page Header */}
      <div className="mb-8">
        <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-2">Catálogo completo</p>
        <h1 className="text-3xl md:text-4xl font-black text-text-primary mb-2">
          Nossos <span className="gradient-text">Produtos</span>
        </h1>
        <p className="text-text-secondary text-sm">
          Perfumaria de nicho, smartphones Apple e importados premium com os melhores preços.
        </p>
      </div>

      {/* ========================
          CATEGORY CHIPS
          ======================== */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORY_CHIPS.map((chip) => {
          const isActive = activeChip === chip.id || (chip.id === '' && !activeChip && !filters.categoryId);
          return (
            <button
              key={chip.id}
              onClick={() => handleChipClick(chip)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap border transition-all duration-200 flex-shrink-0 ${
                isActive
                  ? chip.color || 'text-dark-900 border-primary bg-primary'
                  : 'text-text-secondary border-dark-600 bg-dark-800/60 hover:border-dark-500 hover:text-text-primary'
              }`}
            >
              {React.createElement(chip.icon, { className: 'w-4 h-4' })}
              {chip.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Mobile Filters Toggle */}
        <div className="lg:hidden mb-2">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="w-full btn-secondary flex items-center justify-center gap-2 py-3 relative"
          >
            <FiFilter />
            Filtrar Produtos
            {activeFilterCount > 0 && (
              <span className="absolute top-1 right-3 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filters Sidebar */}
        <div className={`
          fixed inset-0 z-50 bg-dark-900/98 backdrop-blur-xl p-4 overflow-y-auto transition-transform duration-300
          lg:static lg:block lg:w-1/4 lg:bg-transparent lg:p-0 lg:z-auto lg:transform-none lg:overflow-visible
          ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex justify-between items-center lg:hidden mb-6 mt-4">
            <h2 className="text-xl font-bold">Filtros</h2>
            <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-dark-800 rounded-full text-text-muted hover:text-white">
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <ProductFilters
            categories={memoizedCategories}
            brands={memoizedBrands}
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          <div className="mt-6 lg:hidden">
            <button onClick={() => setShowMobileFilters(false)} className="btn-primary w-full">
              Ver {!loading && pagination.total} Resultados
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">

          {/* Top Bar */}
          <div className="glass-card p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-dark-600/60">
            <div className="text-sm text-text-secondary">
              <span className="text-white font-black">{loading ? '...' : pagination.total}</span>
              {' '}produtos encontrados
              {filters.search && <span className="text-primary ml-1">para "{filters.search}"</span>}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-56">
                <SearchBar placeholder="Buscar no catálogo..." onSearch={handleSearch} />
              </div>

              <select
                value={filters.sort}
                onChange={handleSortChange}
                className="input-field py-2 px-4 text-sm min-w-[160px] appearance-none cursor-pointer"
              >
                <option value="newest">Mais Recentes</option>
                <option value="price_asc">Menor Preço</option>
                <option value="price_desc">Maior Preço</option>
                <option value="name">Nome A-Z</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <ProductGrid
            products={products}
            loading={loading}
            favorites={favorites}
            emptyMessage={
              filters.search
                ? `Nenhum produto para "${filters.search}". Tente outros termos.`
                : 'Nenhum produto encontrado com os filtros selecionados.'
            }
          />

          {/* Pagination */}
          {!loading && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}

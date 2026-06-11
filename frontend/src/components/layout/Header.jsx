import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut, FiSettings, FiMapPin, FiSun, FiMoon, FiGrid, FiFeather, FiLayers, FiSmartphone, FiGift, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import SearchBar from '../ui/SearchBar';
import api from '../../api/axios';

const getCategoryIcon = (slug) => {
  switch (slug) {
    case 'perfumes':
      return <FiFeather className="w-4 h-4" />;
    case 'body-splash':
    case 'cremes':
      return <FiLayers className="w-4 h-4" />;
    case 'kits':
      return <FiGift className="w-4 h-4" />;
    case 'smartphones':
      return <FiSmartphone className="w-4 h-4" />;
    default:
      return <FiGrid className="w-4 h-4" />;
  }
};

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState([]);
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { getCartCount, setIsCartOpen } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await api.get('/categories');
        if (data.success) setCategories(data.data || []);
      } catch (err) {
        console.error('Error fetching categories in Header', err);
      }
    };
    fetchCats();
  }, []);

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/produtos?busca=${encodeURIComponent(query)}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'shadow-lg shadow-black/30' 
          : ''
      }`}>
        
        {/* ── Upper Row ── */}
        <div className="bg-[#0d0d12] border-b border-white/[0.06]">
          <div className="container mx-auto px-4">
            <div className={`flex items-center justify-between gap-4 transition-all duration-300 ${scrolled ? 'h-14' : 'h-16'}`}>
              
              {/* Mobile Menu Button */}
              <button 
                className="md:hidden p-2 text-text-primary hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>

              {/* Logo + Brand */}
              <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
                <img 
                  src="/logo_gr.jpg" 
                  alt="Logo Imports GR" 
                  className="h-10 md:h-11 w-auto aspect-square object-cover rounded-full ring-2 ring-primary/30 transition-all duration-300 group-hover:ring-primary/60 group-hover:scale-105"
                />
                <div className="hidden sm:flex flex-col leading-none">
                  <span className="text-base font-black tracking-tight text-white">IMPORTS <span className="text-primary">GR</span></span>
                  <span className="text-[9px] font-medium text-text-muted tracking-wider uppercase mt-0.5">Importados Premium</span>
                </div>
              </Link>

              {/* Search Bar (Desktop) */}
              <div className="hidden md:block flex-grow max-w-xl mx-6">
                <SearchBar onSearch={handleSearch} />
              </div>

              {/* Icons & Actions */}
              <div className="flex items-center gap-1 md:gap-1.5">
                
                {/* Account Dropdown */}
                <div className="relative group">
                  <button className="flex items-center gap-2 text-text-secondary hover:text-primary transition-all p-2 rounded-xl hover:bg-white/[0.04]">
                    <FiUser className="w-5 h-5" />
                    <div className="hidden lg:flex flex-col text-left text-xs leading-none">
                      <span className="text-[9px] font-semibold text-text-muted">Bem-vindo</span>
                      <span className="font-bold text-text-primary mt-0.5">
                        {isAuthenticated ? user?.name?.split(' ')[0] : 'Conta'}
                      </span>
                    </div>
                  </button>
                  
                  <div className="absolute right-0 mt-1 w-52 py-2 bg-[#16161e] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 z-[60]">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-3 border-b border-white/[0.06] mb-1">
                          <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                          <p className="text-xs text-text-muted truncate mt-0.5">{user.email}</p>
                        </div>
                        {isAdmin && (
                          <Link to="/admin" className="flex items-center px-4 py-2.5 text-sm text-text-secondary hover:text-primary hover:bg-white/[0.04] transition-all">
                            <FiSettings className="mr-2.5 w-4 h-4" /> Painel Admin
                          </Link>
                        )}
                        <button onClick={logout} className="w-full text-left flex items-center px-4 py-2.5 text-sm text-danger hover:bg-white/[0.04] transition-all">
                          <FiLogOut className="mr-2.5 w-4 h-4" /> Sair
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" className="block px-4 py-2.5 text-sm text-text-secondary hover:text-primary hover:bg-white/[0.04] transition-all font-semibold">Entrar</Link>
                        <Link to="/registro" className="block px-4 py-2.5 text-sm text-text-secondary hover:text-primary hover:bg-white/[0.04] transition-all font-semibold">Criar Conta</Link>
                      </>
                    )}
                  </div>
                </div>

                {/* Favorites */}
                <Link to="/favoritos" className="flex items-center gap-2 text-text-secondary hover:text-primary transition-all p-2 rounded-xl hover:bg-white/[0.04] relative group">
                  <FiHeart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="hidden lg:block text-xs font-bold text-text-primary">Favoritos</span>
                </Link>
                
                {/* Shopping Cart */}
                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="flex items-center gap-2 text-text-secondary hover:text-primary transition-all p-2 rounded-xl hover:bg-white/[0.04] relative group cursor-pointer"
                >
                  <div className="relative">
                    <FiShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    {getCartCount() > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold text-dark-900 bg-primary rounded-full shadow-lg shadow-primary/40">
                        {getCartCount()}
                      </span>
                    )}
                  </div>
                  <span className="hidden lg:block text-xs font-bold text-text-primary">Carrinho</span>
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl text-text-muted hover:text-primary hover:bg-white/[0.04] transition-all cursor-pointer"
                  title={theme === 'dark' ? 'Ativar Tema Claro' : 'Ativar Tema Escuro'}
                >
                  {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                </button>

              </div>
            </div>
          </div>
        </div>

        {/* ── Lower Row: Categories Bar ── */}
        {!scrolled && (
          <div className="bg-[#111118] border-b border-white/[0.04] hidden md:block">
            <div className="container mx-auto px-4 flex items-center justify-between h-10">
              
              <div className="flex items-center gap-5">
                {/* Department Dropdown */}
                <div className="relative group/dept">
                  <button className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-primary hover:text-primary-light transition-colors py-1 cursor-pointer">
                    <FiMenu className="w-3.5 h-3.5" /> Departamentos <FiChevronDown className="w-3 h-3 opacity-60" />
                  </button>
                  <div className="absolute left-0 top-full mt-1 w-56 py-2 bg-[#16161e] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 opacity-0 invisible group-hover/dept:opacity-100 group-hover/dept:visible transition-all duration-200 z-[60]">
                    <Link to="/produtos" className="block px-4 py-2.5 text-sm text-white hover:text-primary hover:bg-white/[0.04] transition-all font-bold border-b border-white/[0.06]">
                      Ver Todos os Produtos
                    </Link>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/produtos?categoryId=${cat.id}`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-primary hover:bg-white/[0.04] transition-all"
                      >
                        <span className="text-text-muted">{getCategoryIcon(cat.slug)}</span> {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Separator */}
                <span className="w-px h-4 bg-white/[0.08]" />

                {/* Direct quick links */}
                <div className="flex items-center gap-1">
                  <Link to="/produtos" className="text-[11px] font-bold text-text-secondary hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/[0.04] transition-all">
                    Lançamentos
                  </Link>
                  {categories.slice(0, 4).map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/produtos?categoryId=${cat.id}`}
                      className="text-[11px] font-bold text-text-secondary hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/[0.04] transition-all flex items-center gap-1.5"
                    >
                      <span className="text-text-muted opacity-60">{getCategoryIcon(cat.slug)}</span>
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* WhatsApp link */}
              <a
                href="https://wa.me/5541997246465"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-[11px] text-success hover:text-success font-extrabold uppercase tracking-wider"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                </span>
                Suporte WhatsApp
              </a>

            </div>
          </div>
        )}

        {/* ── Mobile Menu ── */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#111118] border-t border-white/[0.06] p-4 space-y-4 shadow-xl">
            <SearchBar onSearch={handleSearch} />
            <nav className="flex flex-col space-y-1">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-text-primary hover:text-primary p-3 rounded-xl hover:bg-white/[0.04] transition-all font-semibold">Home</Link>
              <Link to="/produtos" onClick={() => setMobileMenuOpen(false)} className="text-text-primary hover:text-primary p-3 rounded-xl hover:bg-white/[0.04] transition-all font-semibold">Produtos</Link>
              <Link to="/favoritos" onClick={() => setMobileMenuOpen(false)} className="text-text-primary hover:text-primary p-3 rounded-xl hover:bg-white/[0.04] transition-all font-semibold">Favoritos</Link>
              <Link to="/carrinho" onClick={() => setMobileMenuOpen(false)} className="text-text-primary hover:text-primary p-3 rounded-xl hover:bg-white/[0.04] transition-all font-semibold">Carrinho</Link>
              
              {/* Mobile Categories */}
              <div className="border-t border-white/[0.06] pt-3 mt-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted px-3 pb-2">Categorias</p>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/produtos?categoryId=${cat.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 text-text-secondary hover:text-primary p-3 rounded-xl hover:bg-white/[0.04] transition-all font-medium text-sm"
                  >
                    <span className="text-text-muted">{getCategoryIcon(cat.slug)}</span> {cat.name}
                  </Link>
                ))}
              </div>

              {isAuthenticated ? (
                <>
                  {isAdmin && <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-primary font-semibold p-3 rounded-xl hover:bg-white/[0.04] transition-all">Painel Admin</Link>}
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-left text-danger p-3 rounded-xl hover:bg-white/[0.04] transition-all font-semibold">Sair da Conta</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-text-primary hover:text-primary p-3 rounded-xl hover:bg-white/[0.04] transition-all font-semibold">Entrar</Link>
                  <Link to="/registro" onClick={() => setMobileMenuOpen(false)} className="text-text-primary hover:text-primary p-3 rounded-xl hover:bg-white/[0.04] transition-all font-semibold">Criar Conta</Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

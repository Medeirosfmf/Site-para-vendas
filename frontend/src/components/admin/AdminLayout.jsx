import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiGrid, 
  FiPackage, 
  FiTag, 
  FiAward, 
  FiShoppingBag, 
  FiUsers, 
  FiDatabase, 
  FiBarChart2, 
  FiLogOut, 
  FiMenu, 
  FiX, 
  FiBell, 
  FiUser 
} from 'react-icons/fi';
import Spinner from '../ui/Spinner';

export default function AdminLayout() {
  const { user, isEmployee, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isEmployee) {
      navigate('/login', { state: { from: location } });
    }
  }, [isEmployee, loading, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isEmployee) {
    return null;
  }

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: FiGrid },
    { label: 'Produtos', path: '/admin/produtos', icon: FiPackage },
    { label: 'Categorias', path: '/admin/categorias', icon: FiTag },
    { label: 'Marcas', path: '/admin/marcas', icon: FiAward },
    { label: 'Pedidos', path: '/admin/pedidos', icon: FiShoppingBag },
    { label: 'Clientes', path: '/admin/clientes', icon: FiUsers },
    { label: 'Estoque', path: '/admin/estoque', icon: FiDatabase },
    { label: 'Relatórios', path: '/admin/relatorios', icon: FiBarChart2 },
  ];

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    return paths.map((path, index) => {
      const isLast = index === paths.length - 1;
      const label = path === 'admin' ? 'Painel' : path.charAt(0).toUpperCase() + path.slice(1);
      return (
        <span key={path} className="flex items-center text-xs sm:text-sm">
          {index > 0 && <span className="mx-2 text-text-muted">/</span>}
          <span className={isLast ? 'text-white font-medium' : 'text-text-muted'}>
            {label}
          </span>
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-dark-800 border-r border-dark-600 fixed top-0 bottom-0 z-20">
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-dark-600">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight gradient-text">
              IMPORTS GR
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/25 border border-primary/45 text-primary">
              {user?.role === 'ADMIN' ? 'Admin' : 'Func'}
            </span>
          </NavLink>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-primary/10 text-primary border-l-4 border-primary shadow-[0_0_15px_rgba(108,92,231,0.1)]' 
                      : 'text-text-secondary hover:text-white hover:bg-dark-700'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Area */}
        <div className="p-4 border-t border-dark-600">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 hover:text-white transition-all"
          >
            <FiLogOut className="w-5 h-5" />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile Drawer */}
      <div className={`lg:hidden fixed inset-0 z-30 transition-opacity duration-300 ${
        mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}>
        {/* Overlay */}
        <div 
          onClick={() => setMobileOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        />

        <aside className={`absolute top-0 bottom-0 left-0 w-64 bg-dark-800 border-r border-dark-600 flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Logo Section */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-dark-600">
            <NavLink to="/" className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight gradient-text">
                IMPORTS GR
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/25 border border-primary/45 text-primary">
                Admin
              </span>
            </NavLink>
            <button onClick={() => setMobileOpen(false)} className="text-text-secondary hover:text-white">
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-primary/10 text-primary border-l-4 border-primary' 
                        : 'text-text-secondary hover:text-white hover:bg-dark-700'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer Area */}
          <div className="p-4 border-t border-dark-600">
            <button 
              onClick={() => {
                setMobileOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 hover:text-white transition-all"
            >
              <FiLogOut className="w-5 h-5" />
              Sair do Painel
            </button>
          </div>
        </aside>
      </div>

      {/* Main Content Side */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-dark-800/80 backdrop-blur-md border-b border-dark-600 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-text-secondary hover:text-white p-2 rounded-lg hover:bg-dark-700"
            >
              <FiMenu className="w-6 h-6" />
            </button>

            {/* Breadcrumbs */}
            <div className="hidden sm:flex items-center">
              {getBreadcrumbs()}
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="text-text-secondary hover:text-white p-2 rounded-lg hover:bg-dark-700 relative">
              <FiBell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-dark-600">
              <div className="w-9 h-9 rounded-full bg-dark-700 flex items-center justify-center text-primary font-bold border border-dark-600">
                {user?.name?.charAt(0).toUpperCase() || <FiUser className="w-4 h-4" />}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-semibold leading-tight">{user?.name}</div>
                <div className="text-xs text-text-muted">
                  {user?.role === 'ADMIN' ? 'Administrador' : 'Funcionário'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

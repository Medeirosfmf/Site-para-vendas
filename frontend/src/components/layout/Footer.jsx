import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { FiShield, FiLock, FiCheckCircle, FiTruck } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-dark-900 border-t border-dark-700/60 relative overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px gradient-bg-animated opacity-60" />

      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 py-8 border-b border-dark-700/50">
          {[
            { icon: FiShield, label: '100% Originais' },
            { icon: FiLock, label: 'Compra Segura' },
            { icon: FiCheckCircle, label: 'Garantia de Entrega' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-text-muted text-sm">
              <Icon className="w-4 h-4 text-success" />
              <span>{label}</span>
            </div>
          ))}
          {/* Payment icons */}
          <div className="flex items-center gap-3">
            <span className="text-text-muted text-xs uppercase tracking-wider font-bold">Pagamento:</span>
            {['Pix', 'Cartão', 'Boleto'].map(p => (
              <span key={p} className="px-2.5 py-1 rounded-lg bg-dark-800 border border-dark-600 text-text-muted text-xs font-semibold">
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-14">

          {/* Brand Col */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <img 
                src="/logo_gr.jpg" 
                alt="Logo Imports GR" 
                className="h-10 w-auto aspect-square object-cover rounded-full"
              />
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              Sua loja especializada em perfumes e produtos importados.
              Marcas originais, melhores preços e entrega para todo o Brasil.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://www.instagram.com/imports.gr_/"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center text-text-secondary hover:bg-gradient-to-br hover:from-[#833ab4] hover:via-[#fd1d1d] hover:to-[#fcb045] hover:text-white transition-all transform hover:scale-110 shadow-sm"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/5541997246465"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center text-text-secondary hover:bg-[#25D366] hover:text-white transition-all transform hover:scale-110 shadow-sm"
              >
                <FaWhatsapp className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links Col */}
          <div>
            <h4 className="text-base font-bold text-text-primary mb-6 flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-primary inline-block"></span>
              Links Rápidos
            </h4>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/produtos', label: 'Todos os Produtos' },
                { to: '/carrinho', label: 'Meu Carrinho' },
                { to: '/favoritos', label: 'Favoritos' },
                { to: '/login', label: 'Entrar na Conta' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-text-secondary hover:text-primary text-sm transition-colors link-hover-underline inline-block">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories Col */}
          <div>
            <h4 className="text-base font-bold text-text-primary mb-6 flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-secondary inline-block"></span>
              Categorias
            </h4>
            <ul className="space-y-3">
              {[
                { slug: 'perfumes', label: 'Perfumes' },
                { slug: 'body-splash', label: 'Body Splash' },
                { slug: 'cremes', label: 'Cremes' },
                { slug: 'kits', label: 'Kits' },
                { slug: 'smartphones', label: 'Smartphones' },
              ].map(({ slug, label }) => (
                <li key={slug}>
                  <Link to={`/produtos?categoria=${slug}`} className="text-text-secondary hover:text-secondary text-sm transition-colors link-hover-underline inline-block">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h4 className="text-base font-bold text-text-primary mb-6 flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-accent inline-block"></span>
              Contato
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="https://wa.me/5541997246465"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors">
                    <FaWhatsapp className="w-4 h-4 text-[#25D366]" />
                  </div>
                  <div>
                    <p className="text-text-primary text-sm font-semibold group-hover:text-[#25D366] transition-colors">(41) 99724-6465</p>
                    <p className="text-text-muted text-xs">Seg–Sáb, 9h–20h</p>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/imports.gr_/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                    <FaInstagram className="w-4 h-4 text-pink-400" />
                  </div>
                  <div>
                    <p className="text-text-primary text-sm font-semibold group-hover:text-pink-400 transition-colors">@imports.gr_</p>
                    <p className="text-text-muted text-xs">Siga-nos no Instagram</p>
                  </div>
                </a>
              </li>
              <li className="flex items-start gap-2 mt-2">
                <FiTruck className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                <p className="text-text-muted text-sm">Enviamos para todo o Brasil com rastreamento.</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-dark-700/50 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-muted text-sm">
            © {new Date().getFullYear()} <span className="text-text-secondary font-medium">Imports GR</span>. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-2 text-text-muted text-xs">
            <FiLock className="w-3 h-3 text-success" />
            <span>Site seguro — seus dados estão protegidos</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

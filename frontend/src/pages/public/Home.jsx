import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiArrowRight, FiShield, FiTruck, FiCreditCard, FiStar, FiFeather, FiLayers, FiSmartphone, FiGift, FiGrid, FiInstagram } from 'react-icons/fi';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import api from '../../api/axios';
import ProductCard from '../../components/product/ProductCard';
import ProductCarousel from '../../components/product/ProductCarousel';

const getCategoryIcon = (slug) => {
  switch (slug) {
    case 'perfumes':
      return <FiFeather className="w-6 h-6" />;
    case 'body-splash':
    case 'cremes':
      return <FiLayers className="w-6 h-6" />;
    case 'kits':
      return <FiGift className="w-6 h-6" />;
    case 'smartphones':
      return <FiSmartphone className="w-6 h-6" />;
    default:
      return <FiGrid className="w-6 h-6" />;
  }
};

// Animated counter hook
function useCountUp(target, duration = 1500, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

const testimonials = [
  { name: 'Ana Carolina', city: 'Curitiba – PR', text: 'Recebi meu perfume Yara Rose super rápido e o aroma é incrível! Muito melhor do que eu esperava.', rating: 5, initials: 'AC' },
  { name: 'Roberto Alves', city: 'São Paulo – SP', text: 'Comprei o Kit Asad Lattafa e fiquei impressionado com a qualidade. Definitivamente vou comprar mais!', rating: 5, initials: 'RA' },
  { name: 'Fernanda Lima', city: 'Belo Horizonte – MG', text: 'O Body Splash da Victoria\'s Secret chegou original e com preço muito melhor que nas lojas daqui!', rating: 5, initials: 'FL' },
  { name: 'Marcos Souza', city: 'Porto Alegre – RS', text: 'Atendimento pelo WhatsApp foi excelente, me ajudaram a escolher o perfume ideal. Super indico!', rating: 5, initials: 'MS' },
  { name: 'Juliana Costa', city: 'Florianópolis – SC', text: '9PM Afnan é simplesmente maravilhoso! Já é o terceiro que compro, nunca decepciona.', rating: 5, initials: 'JC' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  // Hero carousel images from featured products
  const heroImages = featured.slice(0, 5);

  const customers = useCountUp(500, 1800, statsVisible);
  const products = useCountUp(1000, 2000, statsVisible);
  const brands2 = useCountUp(15, 1200, statsVisible);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [featRes, promoRes, catRes, brandRes] = await Promise.all([
          api.get('/products/featured'),
          api.get('/products/promotions'),
          api.get('/categories'),
          api.get('/brands'),
        ]);
        if (featRes.data.success) setFeatured(featRes.data.data || []);
        if (promoRes.data.success) setPromotions(promoRes.data.data || []);
        if (catRes.data.success) setCategories(catRes.data.data || []);
        if (brandRes.data.success) setBrands(brandRes.data.data || []);
      } catch (err) {
        console.error('Erro ao carregar dados da home', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  // Auto-advance hero carousel
  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(() => setCarouselIndex(i => (i + 1) % heroImages.length), 3500);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  // Auto-advance testimonials
  useEffect(() => {
    const timer = setInterval(() => setTestimonialIndex(i => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, []);

  // Intersection observer for stats counter
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.5 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const prevCarousel = () => setCarouselIndex(i => (i - 1 + heroImages.length) % heroImages.length);
  const nextCarousel = () => setCarouselIndex(i => (i + 1) % heroImages.length);


  return (
    <>
      <Helmet>
        <title>Imports GR - Perfumes e Produtos Importados</title>
        <meta name="description" content="A melhor loja de perfumes, cosméticos e tecnologia importados. Lattafa, Victoria's Secret, Afnan e mais com o melhor preço." />
      </Helmet>


      {/* ========================
          HERO SECTION
          ======================== */}
      <section className="relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 bg-dark-900">
          <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[120px] pointer-events-none animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none animate-float-delayed" />
          <div className="absolute top-2/3 left-2/3 w-[300px] h-[300px] bg-accent/8 rounded-full blur-[80px] pointer-events-none animate-float-slow" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(108,92,231,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(108,92,231,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh] py-16">

            {/* Left – Text */}
            <div className="fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-8">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Os mais vendidos importados
              </div>

              <h1 className="text-5xl md:text-6xl xl:text-7xl font-black tracking-tight mb-6 leading-[1.05]">
                Produtos<br />
                <span className="gradient-text-animated">Importados</span>
              </h1>

              <p className="text-lg md:text-xl text-text-secondary mb-4 font-light leading-relaxed max-w-lg">
                Perfumes, cosméticos e tecnologia com{' '}
                <span className="text-text-primary font-semibold">garantie de originalidade</span>,
                segurança e{' '}
                <span className="text-text-primary font-semibold">preços imbatíveis</span> no Brasil.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                {['Lattafa', "Victoria's Secret", 'Afnan', 'Apple'].map(brand => (
                  <span key={brand} className="px-3 py-1 rounded-full bg-dark-700/80 border border-dark-600 text-text-muted text-xs font-medium">
                    {brand}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-4 mb-14">
                <Link to="/produtos" className="btn-primary text-base px-8 py-4 rounded-lg shadow-xl">
                  Ver Produtos <FiArrowRight className="ml-2" />
                </Link>
                <a
                  href="https://wa.me/5541997246465"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 px-8 py-4 rounded-lg bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] font-semibold text-base hover:bg-[#25D366]/20 transition-all"
                >
                  <FaWhatsapp className="w-5 h-5" /> Falar no WhatsApp
                </a>
              </div>

                {/* Stats */}
              <div ref={statsRef} className="grid grid-cols-3 gap-6 pt-6 border-t border-dark-700/60">
                <div>
                  <p className="text-3xl font-black gradient-text">+{customers}</p>
                  <p className="text-xs text-text-muted mt-1">Clientes satisfeitos</p>
                </div>
                <div>
                  <p className="text-3xl font-black gradient-text">+{products}</p>
                  <p className="text-xs text-text-muted mt-1">Produtos vendidos</p>
                </div>
                <div>
                  <p className="text-3xl font-black gradient-text">{brands2}+</p>
                  <p className="text-xs text-text-muted mt-1">Marcas importadas</p>
                </div>
              </div>
            </div>

            {/* Right – trust badges */}
            <div className="hidden lg:flex flex-col items-center justify-center gap-6">
              <div className="glass-card border border-dark-600/60 rounded-xl px-8 py-5 shadow-xl text-center">
                <FiShield className="w-8 h-8 text-success mx-auto mb-2" />
                <p className="text-sm font-bold text-success">100% Originais</p>
                <p className="text-xs text-text-muted mt-1">Garantia certificada</p>
              </div>
              <div className="glass-card border border-dark-600/60 rounded-xl px-8 py-5 shadow-xl text-center">
                <FiTruck className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-bold text-primary">Entrega Rápida</p>
                <p className="text-xs text-text-muted mt-1">Todo o Brasil</p>
              </div>
              <div className="glass-card border border-dark-600/60 rounded-xl px-8 py-5 shadow-xl text-center">
                <FiCreditCard className="w-8 h-8 text-secondary mx-auto mb-2" />
                <p className="text-sm font-bold text-secondary">Compra Segura</p>
                <p className="text-xs text-text-muted mt-1">Dados protegidos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================
          FEATURES BAR
          ======================== */}
      <section className="py-10 border-y border-dark-600/30 relative z-20 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: FiShield, color: 'primary', title: '100% Originais', desc: 'Produtos importados com nota fiscal e garantia de autenticidade.' },
              { icon: FiTruck, color: 'secondary', title: 'Envio Rápido', desc: 'Entregamos para todo o Brasil com código de rastreio em tempo real.' },
              { icon: FiCreditCard, color: 'accent', title: 'Melhor Preço', desc: 'Produtos importados direto para você — sem intermediários, com o menor preço.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="flex items-start gap-5 p-5 glass-card hover:border-primary/20 transition-all">
                <div className={`w-14 h-14 rounded-2xl bg-${color}/15 flex items-center justify-center text-${color} flex-shrink-0 shadow-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">{title}</h3>
                  <p className="text-text-muted text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================
          CAROUSEL OF FEATURED PRODUCTS
          ======================== */}
      {!loading && featured.length > 0 && (
        <section className="py-12 bg-transparent relative z-20">
          <div className="container mx-auto px-4">
            <ProductCarousel 
              products={featured} 
              title={<>Produtos em <span className="gradient-text">Destaque</span></>}
              subtitle="Os queridinhos"
            />
          </div>
        </section>
      )}

      {/* ========================
          CATEGORIAS
          ======================== */}
      <section id="categorias" className="py-24 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">Navegue por categoria</p>
            <h2 className="text-4xl font-black text-white mb-4">
              O que você está <span className="gradient-text">procurando?</span>
            </h2>
            <div className="section-divider mx-auto" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {loading
              ? [...Array(5)].map((_, i) => <div key={i} className="h-40 rounded-lg shimmer" />)
              : categories.map((cat, i) => (
                  <Link
                    key={cat.id}
                    to={`/produtos?categoryId=${cat.id}`}
                    className="glass-card flex flex-col items-center justify-center p-8 group hover:border-primary/45 hover:shadow-md transition-all duration-300"
                  >
                    <div className="text-primary text-3xl mb-3 p-3.5 rounded-xl bg-primary/10 border border-primary/20 group-hover:scale-105 transition-transform duration-300">
                      {getCategoryIcon(cat.slug)}
                    </div>
                    <span className="text-sm font-semibold text-text-primary text-center group-hover:text-primary transition-colors">
                      {cat.name}
                    </span>
                  </Link>
                ))}
          </div>
        </div>
      </section>



      {/* ========================
          PROMOÇÕES
          ======================== */}
      {promotions.length > 0 && (
        <section className="py-24 bg-transparent relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 gradient-bg-animated opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-danger/5 via-transparent to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-14 gap-4">
              <div>
                <p className="text-danger text-sm font-semibold tracking-widest uppercase mb-3">Por tempo limitado</p>
                <h2 className="text-4xl font-black text-white mb-2">
                  Ofertas <span className="text-danger">Especiais</span>
                </h2>
                <div className="w-16 h-1 bg-danger rounded-full" />
              </div>
              <Link to="/produtos?promotions=true" className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl border border-danger/30 text-danger text-sm font-semibold hover:bg-danger/10 transition-all">
                Ver ofertas <FiArrowRight />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {promotions.slice(0, 4).map((product, i) => (
                <div key={product.id} className="stagger-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================
          DEPOIMENTOS
          ======================== */}
      <section className="py-24 bg-transparent relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-14">
            <p className="text-secondary text-sm font-semibold tracking-widest uppercase mb-3">O que dizem nossos clientes</p>
            <h2 className="text-4xl font-black text-white mb-4">
              <span className="gradient-text">Avaliações</span> reais
            </h2>
            <div className="section-divider mx-auto" />
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {testimonials.map((t, idx) => (
                <div
                  key={idx}
                  className={`transition-all duration-500 ${idx === testimonialIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute inset-0'}`}
                >
                  <div className="glass-card p-8 md:p-10 text-center shadow-2xl">
                    <div className="flex justify-center mb-4 gap-1">
                      {[...Array(t.rating)].map((_, s) => (
                        <FiStar key={s} className="w-5 h-5 text-warning fill-warning" />
                      ))}
                    </div>
                    <blockquote className="text-lg md:text-xl text-text-primary font-light leading-relaxed mb-8 italic">
                      "{t.text}"
                    </blockquote>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-dark-800 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm shadow-md">
                        {t.initials}
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-text-primary">{t.name}</p>
                        <p className="text-text-muted text-sm">{t.city}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonial dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setTestimonialIndex(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    idx === testimonialIndex ? 'w-8 h-2.5 bg-secondary' : 'w-2.5 h-2.5 bg-dark-600 hover:bg-dark-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================
          MARCAS
          ======================== */}
      <section className="py-16 bg-transparent border-t border-dark-600/30">
        <div className="container mx-auto px-4">
          <p className="text-center text-text-muted text-xs uppercase tracking-widest font-bold mb-10">
            Marcas que trabalhamos
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {loading
              ? [...Array(6)].map((_, i) => <div key={i} className="w-28 h-12 shimmer rounded-xl" />)
              : brands.map(brand => (
                  <div
                    key={brand.id}
                    className="px-6 py-3.5 bg-dark-800/60 border border-dark-600/60 rounded-xl font-bold text-sm text-text-muted hover:text-white hover:border-primary/40 hover:bg-primary/5 transition-all cursor-default shadow-sm"
                  >
                    {brand.name}
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* ========================
          CTA WHATSAPP
          ======================== */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg-animated opacity-10" />
        <div className="absolute inset-0 bg-dark-900/80" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

        {/* Floating background decorative icons */}
        <div className="absolute top-10 left-10 text-primary opacity-[0.08] pointer-events-none">
          <FiFeather className="w-16 h-16" />
        </div>
        <div className="absolute top-20 right-20 text-primary opacity-[0.08] pointer-events-none">
          <FiSmartphone className="w-12 h-12" />
        </div>
        <div className="absolute bottom-10 left-20 text-primary opacity-[0.08] pointer-events-none">
          <FiGift className="w-12 h-12" />
        </div>
        <div className="absolute bottom-20 right-10 text-primary opacity-[0.08] pointer-events-none">
          <FiShield className="w-16 h-16" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-sm font-semibold mb-8">
            <FaWhatsapp className="w-4 h-4" /> Atendimento personalizado
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-text-primary mb-6 leading-tight">
            Ficou com dúvida?<br />
            <span className="gradient-text">Fale conosco agora!</span>
          </h2>
          <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
            Nossa equipe está pronta para ajudar você a encontrar o produto perfeito
            e responder todas as suas dúvidas.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/5541997246465"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#25D366] text-white rounded-lg font-bold text-base hover:bg-[#20bd5a] transition-all hover:-translate-y-0.5"
            >
              <FaWhatsapp className="w-6 h-6 mr-2" /> Falar com Especialista
            </a>
            <a
              href="https://www.instagram.com/imports.gr_/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-text-primary rounded-lg font-bold text-base border border-dark-600 hover:bg-dark-800/50 transition-all hover:-translate-y-0.5"
            >
              <FiInstagram className="w-5 h-5 mr-2 text-primary" /> @imports.gr_
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

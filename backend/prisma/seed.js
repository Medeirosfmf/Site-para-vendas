const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // ========================
  // Admin User
  // ========================
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@importsgr.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@importsgr.com',
      password: hashedPassword,
      phone: '41997246465',
      city: 'Curitiba',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin criado:', admin.email);

  // ========================
  // Categories
  // ========================
  const categoriesData = [
    { name: 'Perfumes', slug: 'perfumes', icon: '🧴' },
    { name: 'Body Splash', slug: 'body-splash', icon: '✨' },
    { name: 'Cremes', slug: 'cremes', icon: '🧴' },
    { name: 'Kits', slug: 'kits', icon: '🎁' },
    { name: 'Smartphones', slug: 'smartphones', icon: '📱' },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories[cat.slug] = created;
  }
  console.log('✅ Categorias criadas:', Object.keys(categories).length);

  // ========================
  // Brands
  // ========================
  const brandsData = [
    { name: 'Lattafa', slug: 'lattafa' },
    { name: 'Afnan', slug: 'afnan' },
    { name: 'Wataniah', slug: 'wataniah' },
    { name: 'Mis Rose', slug: 'mis-rose' },
    { name: "Victoria's Secret", slug: 'victorias-secret' },
    { name: 'Apple', slug: 'apple' },
  ];

  const brands = {};
  for (const brand of brandsData) {
    const created = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: brand,
    });
    brands[brand.slug] = created;
  }
  console.log('✅ Marcas criadas:', Object.keys(brands).length);

  // ========================
  // Products (dados reais IMPORTS GR)
  // ========================
  const productsData = [
    // --- CREMES ---
    {
      name: "Creme Coconut Victoria's Secret",
      slug: 'creme-coconut-victorias-secret',
      description: "Creme hidratante corporal Coconut Passion da Victoria's Secret. Fragrância envolvente de coco tropical, perfeita para o dia a dia. Deixa a pele macia e perfumada por horas.",
      specifications: { fragrancia: 'Coconut', tipo: 'Creme Corporal', volume: '236ml' },
      categoryId: categories['cremes'].id,
      brandId: brands['victorias-secret'].id,
      purchasePrice: 116.48,
      salePrice: 145.60,
      commissionValue: 29.12,
      stock: 2,
      mainImage: '/uploads/creme-coconut-victorias-secret.png',
      featured: true,
      active: true,
      metaTitle: "Creme Coconut Victoria's Secret - Imports GR",
      metaDescription: "Creme hidratante Coconut Victoria's Secret importado. Compre com o melhor preço na Imports GR.",
    },

    // --- KITS ---
    {
      name: 'Kit Yara Lattafa',
      slug: 'kit-yara-lattafa',
      description: 'Kit completo Yara da Lattafa, incluindo perfume e body mist. Fragrância oriental floral sofisticada com notas de orquídea, frutas tropicais e baunilha. Um dos mais vendidos do mundo árabe.',
      specifications: { fragrancia: 'Yara', tipo: 'Kit Perfume + Body Mist', origem: 'Emirados Árabes' },
      categoryId: categories['kits'].id,
      brandId: brands['lattafa'].id,
      purchasePrice: 191.36,
      salePrice: 239.20,
      commissionValue: 47.84,
      stock: 1,
      mainImage: '/uploads/kit-yara-lattafa.png',
      featured: true,
      active: true,
      metaTitle: 'Kit Yara Lattafa - Imports GR',
      metaDescription: 'Kit completo Yara Lattafa importado. Perfume oriental floral com o melhor preço.',
    },
    {
      name: 'Kit Asad Lattafa',
      slug: 'kit-asad-lattafa',
      description: 'Kit completo Asad da Lattafa, fragrância masculina intensa e marcante. Notas amadeiradas, tabaco e baunilha. Inspiração no luxo dos perfumes árabes. Ideal para ocasiões especiais.',
      specifications: { fragrancia: 'Asad', tipo: 'Kit Perfume + Body Mist', origem: 'Emirados Árabes' },
      categoryId: categories['kits'].id,
      brandId: brands['lattafa'].id,
      purchasePrice: 266.24,
      salePrice: 332.80,
      commissionValue: 66.56,
      stock: 1,
      mainImage: '/uploads/kit-asad-lattafa.png',
      featured: true,
      active: true,
      metaTitle: 'Kit Asad Lattafa - Imports GR',
      metaDescription: 'Kit Asad Lattafa importado. Fragrância masculina intensa com ótimo preço.',
    },

    // --- PERFUMES ---
    {
      name: 'Perfume 9PM Afnan',
      slug: 'perfume-9pm-afnan',
      description: 'O 9PM da Afnan é um perfume masculino amadeirado especiado que se tornou viral. Notas de canela, lavanda, baunilha e âmbar criam uma fragrância irresistível para a noite. Excelente fixação e projeção.',
      specifications: { fragrancia: '9PM', tipo: 'Eau de Parfum', volume: '100ml', genero: 'Masculino', fixacao: '8-10 horas' },
      categoryId: categories['perfumes'].id,
      brandId: brands['afnan'].id,
      purchasePrice: 191.36,
      salePrice: 239.20,
      commissionValue: 47.84,
      stock: 4,
      mainImage: '/uploads/perfume-9pm-afnan.png',
      featured: true,
      active: true,
      metaTitle: 'Perfume 9PM Afnan - Imports GR',
      metaDescription: 'Perfume 9PM Afnan importado. Fragrância viral masculina com o melhor preço do Brasil.',
    },
    {
      name: 'Perfume Sabah Al Ward Wataniah',
      slug: 'perfume-sabah-al-ward-wataniah',
      description: 'Sabah Al Ward da Wataniah é um perfume feminino floral oriental. Combina rosas frescas com notas amadeiradas e almiscaradas. Fragrância elegante e sofisticada para todas as ocasiões.',
      specifications: { fragrancia: 'Sabah Al Ward', tipo: 'Eau de Parfum', volume: '100ml', genero: 'Feminino', fixacao: '6-8 horas' },
      categoryId: categories['perfumes'].id,
      brandId: brands['wataniah'].id,
      purchasePrice: 191.36,
      salePrice: 239.20,
      commissionValue: 47.84,
      stock: 5,
      mainImage: '/uploads/perfume-sabah-al-ward-wataniah.png',
      featured: false,
      active: true,
      metaTitle: 'Perfume Sabah Al Ward Wataniah - Imports GR',
      metaDescription: 'Perfume Sabah Al Ward Wataniah importado. Fragrância feminina floral oriental.',
    },
    {
      name: 'Perfume Eclaire Lattafa',
      slug: 'perfume-eclaire-lattafa',
      description: 'Eclaire da Lattafa é uma fragrância unissex que combina frescor cítrico com fundo amadeirado e almiscarado. Perfeito para o dia a dia, transmite elegância e modernidade.',
      specifications: { fragrancia: 'Eclaire', tipo: 'Eau de Parfum', volume: '100ml', genero: 'Unissex', fixacao: '6-8 horas' },
      categoryId: categories['perfumes'].id,
      brandId: brands['lattafa'].id,
      purchasePrice: 208.00,
      salePrice: 260.00,
      commissionValue: 52.00,
      stock: 4,
      mainImage: '/uploads/perfume-eclaire-lattafa.png',
      featured: false,
      active: true,
      metaTitle: 'Perfume Eclaire Lattafa - Imports GR',
      metaDescription: 'Perfume Eclaire Lattafa importado. Fragrância unissex sofisticada.',
    },
    {
      name: 'Perfume Fakhar Branco Lattafa',
      slug: 'perfume-fakhar-branco-lattafa',
      description: 'Fakhar (Branco) da Lattafa é um perfume masculino luxuoso. Notas cítricas frescas no topo, coração floral e fundo amadeirado com almíscar. Fragrância versátil e elegante.',
      specifications: { fragrancia: 'Fakhar Branco', tipo: 'Eau de Parfum', volume: '100ml', genero: 'Masculino', fixacao: '8-10 horas' },
      categoryId: categories['perfumes'].id,
      brandId: brands['lattafa'].id,
      purchasePrice: 249.60,
      salePrice: 312.00,
      commissionValue: 62.40,
      stock: 5,
      mainImage: '/uploads/perfume-fakhar-branco-lattafa.png',
      featured: true,
      active: true,
      metaTitle: 'Perfume Fakhar Branco Lattafa - Imports GR',
      metaDescription: 'Perfume Fakhar Branco Lattafa importado. Fragrância masculina premium.',
    },
    {
      name: 'Perfume Fakhar Preto Lattafa',
      slug: 'perfume-fakhar-preto-lattafa',
      description: 'Fakhar (Preto) da Lattafa é a versão mais intensa e misteriosa. Notas de especiarias, oud e âmbar formam uma fragrância poderosa e marcante. Ideal para noites e eventos.',
      specifications: { fragrancia: 'Fakhar Preto', tipo: 'Eau de Parfum', volume: '100ml', genero: 'Masculino', fixacao: '8-12 horas' },
      categoryId: categories['perfumes'].id,
      brandId: brands['lattafa'].id,
      purchasePrice: 208.00,
      salePrice: 260.00,
      commissionValue: 52.00,
      stock: 2,
      mainImage: '/uploads/perfume-fakhar-preto-lattafa.png',
      featured: false,
      active: true,
      metaTitle: 'Perfume Fakhar Preto Lattafa - Imports GR',
      metaDescription: 'Perfume Fakhar Preto Lattafa importado. Fragrância masculina intensa e marcante.',
    },
    {
      name: 'Perfume Yara Rose Lattafa',
      slug: 'perfume-yara-rose-lattafa',
      description: 'Yara Rose da Lattafa é uma versão rosé do icônico Yara. Fragrância feminina romântica com notas de rosa, frutas vermelhas e baunilha. Doce, envolvente e perfeita para o dia a dia.',
      specifications: { fragrancia: 'Yara Rose', tipo: 'Eau de Parfum', volume: '100ml', genero: 'Feminino', fixacao: '6-8 horas' },
      categoryId: categories['perfumes'].id,
      brandId: brands['lattafa'].id,
      purchasePrice: 124.80,
      salePrice: 156.00,
      commissionValue: 31.20,
      stock: 6,
      mainImage: '/uploads/perfume-yara-rose-lattafa.png',
      featured: true,
      active: true,
      metaTitle: 'Perfume Yara Rose Lattafa - Imports GR',
      metaDescription: 'Perfume Yara Rose Lattafa importado. Fragrância feminina romântica com ótimo preço.',
    },
    {
      name: 'Perfume Khamrah Preto Mis Rose',
      slug: 'perfume-khamrah-preto-mis-rose',
      description: 'Khamrah Preto da Mis Rose é um perfume masculino intenso com notas amadeiradas escuras, especiarias e âmbar. Longa fixação e projeção moderada. Versátil para trabalho e lazer.',
      specifications: { fragrancia: 'Khamrah Preto', tipo: 'Eau de Parfum', volume: '100ml', genero: 'Masculino', fixacao: '8-10 horas' },
      categoryId: categories['perfumes'].id,
      brandId: brands['mis-rose'].id,
      purchasePrice: 141.44,
      salePrice: 176.80,
      commissionValue: 35.36,
      stock: 3,
      mainImage: '/uploads/perfume-khamrah-preto-mis-rose.png',
      featured: false,
      active: true,
      metaTitle: 'Perfume Khamrah Preto Mis Rose - Imports GR',
      metaDescription: 'Perfume Khamrah Preto Mis Rose importado. Fragrância masculina intensa.',
    },
    {
      name: 'Perfume Khamrah Qahwa Marom Mis Rose',
      slug: 'perfume-khamrah-qahwa-marom-mis-rose',
      description: 'Khamrah Qahwa Marom da Mis Rose traz uma fragrância quente e sofisticada com notas de café, baunilha e especiarias. Perfeito para quem busca algo único e envolvente.',
      specifications: { fragrancia: 'Khamrah Qahwa Marom', tipo: 'Eau de Parfum', volume: '100ml', genero: 'Unissex', fixacao: '8-10 horas' },
      categoryId: categories['perfumes'].id,
      brandId: brands['mis-rose'].id,
      purchasePrice: 149.76,
      salePrice: 187.20,
      commissionValue: 37.44,
      stock: 3,
      mainImage: '/uploads/perfume-khamrah-qahwa-marom-mis-rose.png',
      featured: false,
      active: true,
      metaTitle: 'Perfume Khamrah Qahwa Marom Mis Rose - Imports GR',
      metaDescription: 'Perfume Khamrah Qahwa Marom Mis Rose importado. Fragrância única de café e baunilha.',
    },

    // --- BODY SPLASHES ---
    {
      name: "Body Splash Amber Romance Victoria's Secret",
      slug: 'body-splash-amber-romance-victorias-secret',
      description: "Amber Romance da Victoria's Secret é um body splash feminino clássico. Combina notas de âmbar, creme de chantilly e sândalo. Fragrância sensual e envolvente, perfeita para o dia a dia.",
      specifications: { fragrancia: 'Amber Romance', tipo: 'Body Splash / Fragrance Mist', volume: '250ml' },
      categoryId: categories['body-splash'].id,
      brandId: brands['victorias-secret'].id,
      purchasePrice: 95.68,
      salePrice: 119.60,
      commissionValue: 23.92,
      stock: 6,
      mainImage: '/uploads/body-splash-amber-romance-victorias-secret.png',
      featured: true,
      active: true,
      metaTitle: "Body Splash Amber Romance Victoria's Secret - Imports GR",
      metaDescription: "Body Splash Amber Romance Victoria's Secret importado. Fragrância clássica e sensual.",
    },
    {
      name: "Body Splash Bare Vanilla Victoria's Secret",
      slug: 'body-splash-bare-vanilla-victorias-secret',
      description: "Bare Vanilla da Victoria's Secret é um body splash best-seller. Notas de baunilha cremosa com toque de cashemere criam uma fragrância acolhedora e irresistível.",
      specifications: { fragrancia: 'Bare Vanilla', tipo: 'Body Splash / Fragrance Mist', volume: '250ml' },
      categoryId: categories['body-splash'].id,
      brandId: brands['victorias-secret'].id,
      purchasePrice: 95.68,
      salePrice: 119.60,
      commissionValue: 23.92,
      stock: 6,
      mainImage: '/uploads/body-splash-bare-vanilla-victorias-secret.png',
      featured: false,
      active: true,
      metaTitle: "Body Splash Bare Vanilla Victoria's Secret - Imports GR",
      metaDescription: "Body Splash Bare Vanilla Victoria's Secret importado. Fragrância de baunilha cremosa.",
    },
    {
      name: "Body Splash Midnight Bloom Victoria's Secret",
      slug: 'body-splash-midnight-bloom-victorias-secret',
      description: "Midnight Bloom da Victoria's Secret é um body splash misterioso and floral. Notas de peônia, íris e musk criam uma fragrância sofisticada para noites especiais.",
      specifications: { fragrancia: 'Midnight Bloom', tipo: 'Body Splash / Fragrance Mist', volume: '250ml' },
      categoryId: categories['body-splash'].id,
      brandId: brands['victorias-secret'].id,
      purchasePrice: 95.68,
      salePrice: 119.60,
      commissionValue: 23.92,
      stock: 3,
      mainImage: '/uploads/body-splash-midnight-bloom-victorias-secret.png',
      featured: false,
      active: true,
      metaTitle: "Body Splash Midnight Bloom Victoria's Secret - Imports GR",
      metaDescription: "Body Splash Midnight Bloom Victoria's Secret importado. Fragrância floral noturna.",
    },

    // --- SMARTPHONES ---
    {
      name: 'iPhone 17 Pro 256GB',
      slug: 'iphone-17-pro-256gb',
      description: 'O iPhone 17 Pro com chip A19 Pro, câmera de 48MP com zoom óptico 5x, tela Super Retina XDR ProMotion de 6.3 polegadas e design em titânio. O smartphone mais avançado da Apple.',
      specifications: { tela: '6.3" OLED ProMotion', chip: 'A19 Pro', camera: '48MP + 48MP + 12MP', armazenamento: '256GB', bateria: 'Até 23h reprodução de vídeo', cor: 'Titânio Natural' },
      categoryId: categories['smartphones'].id,
      brandId: brands['apple'].id,
      purchasePrice: 7692.28,
      salePrice: 8097.14,
      commissionValue: 404.86,
      stock: 1,
      mainImage: '/uploads/iphone-17-pro-256gb.png',
      featured: true,
      active: true,
      metaTitle: 'iPhone 17 Pro 256GB - Imports GR',
      metaDescription: 'iPhone 17 Pro 256GB importado. O melhor preço do Brasil na Imports GR.',
    },
  ];

  for (const product of productsData) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        specifications: product.specifications,
        categoryId: product.categoryId,
        brandId: product.brandId,
        purchasePrice: product.purchasePrice,
        salePrice: product.salePrice,
        promoPrice: product.promoPrice || null,
        commissionValue: product.commissionValue || null,
        stock: product.stock,
        mainImage: product.mainImage || null,
        featured: product.featured,
        active: product.active,
        metaTitle: product.metaTitle || null,
        metaDescription: product.metaDescription || null,
      },
      create: product,
    });
  }
  console.log('✅ Produtos criados:', productsData.length);

  console.log('');
  console.log('🎉 Seed concluído com sucesso!');
  console.log('');
  console.log('📦 Resumo:');
  console.log(`   • ${Object.keys(categories).length} categorias`);
  console.log(`   • ${Object.keys(brands).length} marcas`);
  console.log(`   • ${productsData.length} produtos`);
  console.log(`   • Admin: admin@importsgr.com / admin123`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const prisma = require('../config/prisma');

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
};

const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      inStock,
      featured,
      search,
      sort,
      all // admin flag to include inactive products
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    // Only filter active products for public requests (default behavior)
    // Admin passes ?all=true to see everything
    if (all !== 'true') {
      where.active = true;
    }

    if (categoryId) where.categoryId = parseInt(categoryId);
    if (brandId) where.brandId = parseInt(brandId);
    if (minPrice || maxPrice) {
      where.salePrice = {};
      if (minPrice) where.salePrice.gte = parseFloat(minPrice);
      if (maxPrice) where.salePrice.lte = parseFloat(maxPrice);
    }
    if (inStock === 'true') where.stock = { gt: 0 };
    if (inStock === 'false') where.stock = { lte: 0 };
    if (featured === 'true') where.featured = true;
    if (featured === 'false') where.featured = false;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
        { brand: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    let orderBy = { createdAt: 'desc' };
    switch (sort) {
      case 'price_asc':
        orderBy = { salePrice: 'asc' };
        break;
      case 'price_desc':
        orderBy = { salePrice: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          brand: true,
          images: true
        },
        skip,
        take: limitNum,
        orderBy
      }),
      prisma.product.count({ where })
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      success: true,
      data: { products, total, page: pageNum, totalPages },
      message: 'Produtos obtidos com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao buscar produtos'
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { order: 'asc' } }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Produto não encontrado'
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
      message: 'Produto obtido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar produto por ID:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao buscar produto'
    });
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { featured: true, active: true },
      include: {
        category: true,
        brand: true
      },
      take: 8,
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      success: true,
      data: products,
      message: 'Produtos em destaque obtidos com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar produtos em destaque:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao buscar produtos em destaque'
    });
  }
};

const getPromotions = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        promoPrice: { not: null },
        active: true
      },
      include: {
        category: true,
        brand: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      success: true,
      data: products,
      message: 'Promoções obtidas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar promoções:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao buscar promoções'
    });
  }
};

const searchProducts = async (req, res) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Termo de busca é obrigatório'
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      active: true,
      name: { contains: q, mode: 'insensitive' }
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          brand: true
        },
        skip,
        take: limitNum,
        orderBy: { name: 'asc' }
      }),
      prisma.product.count({ where })
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      success: true,
      data: { products, total, page: pageNum, totalPages },
      message: 'Busca realizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao buscar produtos'
    });
  }
};

const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { order: 'asc' } },
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Produto não encontrado'
      });
    }

    // Check verified purchases for reviews
    const userIds = product.reviews.map(r => r.userId);
    const userOrders = await prisma.order.findMany({
      where: {
        userId: { in: userIds },
        status: { not: 'CANCELLED' },
        items: {
          some: {
            productId: product.id
          }
        }
      },
      select: {
        userId: true
      }
    });

    const buyerUserIds = new Set(userOrders.map(o => o.userId));

    const reviewsWithVerification = product.reviews.map(r => ({
      ...r,
      verifiedPurchase: buyerUserIds.has(r.userId)
    }));

    const productWithVerifiedReviews = {
      ...product,
      reviews: reviewsWithVerification
    };

    // Register product view
    await prisma.productView.create({
      data: {
        productId: product.id,
        userId: req.user?.id || null,
        ip: req.ip || null
      }
    });

    return res.status(200).json({
      success: true,
      data: productWithVerifiedReviews,
      message: 'Produto obtido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao buscar produto'
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      specifications,
      categoryId,
      brandId,
      purchasePrice,
      salePrice,
      promoPrice,
      commissionValue,
      stock,
      featured,
      active,
      metaTitle,
      metaDescription
    } = req.body;

    if (!name || !categoryId || !brandId || !purchasePrice || !salePrice) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Nome, categoria, marca, preço de compra e preço de venda são obrigatórios'
      });
    }

    const slug = generateSlug(name);

    const data = {
      name,
      slug,
      description: description || null,
      specifications: specifications || null,
      categoryId: parseInt(categoryId),
      brandId: parseInt(brandId),
      purchasePrice: parseFloat(purchasePrice),
      salePrice: parseFloat(salePrice),
      promoPrice: promoPrice ? parseFloat(promoPrice) : null,
      commissionValue: commissionValue ? parseFloat(commissionValue) : null,
      stock: stock ? parseInt(stock) : 0,
      featured: featured === true || featured === 'true',
      active: active !== undefined ? (active === true || active === 'true') : true,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null
    };

    if (req.file) {
      data.mainImage = '/uploads/' + req.file.filename;
    }

    const product = await prisma.product.create({
      data,
      include: {
        category: true,
        brand: true
      }
    });

    return res.status(201).json({
      success: true,
      data: product,
      message: 'Produto criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'Já existe um produto com este slug'
      });
    }
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao criar produto'
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      specifications,
      categoryId,
      brandId,
      purchasePrice,
      salePrice,
      promoPrice,
      commissionValue,
      stock,
      featured,
      active,
      metaTitle,
      metaDescription
    } = req.body;

    const existing = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Produto não encontrado'
      });
    }

    const updateData = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = generateSlug(name);
    }
    if (description !== undefined) updateData.description = description;
    if (specifications !== undefined) updateData.specifications = specifications;
    if (categoryId !== undefined) updateData.categoryId = parseInt(categoryId);
    if (brandId !== undefined) updateData.brandId = parseInt(brandId);
    if (purchasePrice !== undefined) updateData.purchasePrice = parseFloat(purchasePrice);
    if (salePrice !== undefined) updateData.salePrice = parseFloat(salePrice);
    if (promoPrice !== undefined) updateData.promoPrice = promoPrice ? parseFloat(promoPrice) : null;
    if (commissionValue !== undefined) updateData.commissionValue = commissionValue ? parseFloat(commissionValue) : null;
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (featured !== undefined) updateData.featured = featured === true || featured === 'true';
    if (active !== undefined) updateData.active = active === true || active === 'true';
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;

    if (req.file) {
      updateData.mainImage = '/uploads/' + req.file.filename;
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        category: true,
        brand: true,
        images: true
      }
    });

    return res.status(200).json({
      success: true,
      data: product,
      message: 'Produto atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'Já existe um produto com este slug'
      });
    }
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao atualizar produto'
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Produto não encontrado'
      });
    }

    await prisma.product.delete({
      where: { id: parseInt(id) }
    });

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Produto excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao excluir produto'
    });
  }
};

const duplicateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const original = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!original) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Produto não encontrado'
      });
    }

    const newName = original.name + ' (Cópia)';
    const newSlug = generateSlug(newName) + '-' + Date.now();

    const product = await prisma.product.create({
      data: {
        name: newName,
        slug: newSlug,
        description: original.description,
        specifications: original.specifications,
        categoryId: original.categoryId,
        brandId: original.brandId,
        purchasePrice: original.purchasePrice,
        salePrice: original.salePrice,
        promoPrice: original.promoPrice,
        commissionValue: original.commissionValue,
        stock: 0,
        mainImage: original.mainImage,
        featured: false,
        active: false,
        metaTitle: original.metaTitle,
        metaDescription: original.metaDescription
      },
      include: {
        category: true,
        brand: true
      }
    });

    return res.status(201).json({
      success: true,
      data: product,
      message: 'Produto duplicado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao duplicar produto:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao duplicar produto'
    });
  }
};

const toggleProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Produto não encontrado'
      });
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { active: !existing.active }
    });

    return res.status(200).json({
      success: true,
      data: product,
      message: product.active ? 'Produto ativado com sucesso' : 'Produto desativado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao alternar status do produto:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao alternar status do produto'
    });
  }
};

const uploadImages = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Produto não encontrado'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Nenhuma imagem enviada'
      });
    }

    const imageRecords = req.files.map((file, index) => ({
      productId: parseInt(id),
      url: '/uploads/' + file.filename,
      order: index
    }));

    const images = await prisma.productImage.createMany({
      data: imageRecords
    });

    const allImages = await prisma.productImage.findMany({
      where: { productId: parseInt(id) },
      orderBy: { order: 'asc' }
    });

    return res.status(201).json({
      success: true,
      data: allImages,
      message: 'Imagens enviadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao enviar imagens:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao enviar imagens'
    });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    const image = await prisma.productImage.findFirst({
      where: {
        id: parseInt(imageId),
        productId: parseInt(id)
      }
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Imagem não encontrada'
      });
    }

    await prisma.productImage.delete({
      where: { id: parseInt(imageId) }
    });

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Imagem excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir imagem:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao excluir imagem'
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getPromotions,
  searchProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  duplicateProduct,
  toggleProduct,
  uploadImages,
  deleteImage
};

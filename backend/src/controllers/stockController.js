const prisma = require('../config/prisma');

const addEntry = async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body;

    if (!productId || !quantity || parseInt(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'ID do produto e quantidade válida são obrigatórios'
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Produto não encontrado'
      });
    }

    const [movement, updatedProduct] = await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          productId: parseInt(productId),
          type: 'ENTRY',
          quantity: parseInt(quantity),
          reason: reason || null
        }
      }),
      prisma.product.update({
        where: { id: parseInt(productId) },
        data: {
          stock: { increment: parseInt(quantity) }
        }
      })
    ]);

    return res.status(201).json({
      success: true,
      data: { movement, newStock: updatedProduct.stock },
      message: 'Entrada de estoque registrada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao registrar entrada:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao registrar entrada de estoque'
    });
  }
};

const addExit = async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body;

    if (!productId || !quantity || parseInt(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'ID do produto e quantidade válida são obrigatórios'
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Produto não encontrado'
      });
    }

    if (product.stock < parseInt(quantity)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: `Estoque insuficiente. Disponível: ${product.stock}`
      });
    }

    const [movement, updatedProduct] = await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          productId: parseInt(productId),
          type: 'EXIT',
          quantity: parseInt(quantity),
          reason: reason || null
        }
      }),
      prisma.product.update({
        where: { id: parseInt(productId) },
        data: {
          stock: { decrement: parseInt(quantity) }
        }
      })
    ]);

    return res.status(201).json({
      success: true,
      data: { movement, newStock: updatedProduct.stock },
      message: 'Saída de estoque registrada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao registrar saída:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao registrar saída de estoque'
    });
  }
};

const addAdjustment = async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body;

    if (!productId || quantity === undefined || parseInt(quantity) < 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'ID do produto e nova quantidade são obrigatórios'
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Produto não encontrado'
      });
    }

    const [movement, updatedProduct] = await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          productId: parseInt(productId),
          type: 'ADJUSTMENT',
          quantity: parseInt(quantity),
          reason: reason || `Ajuste de ${product.stock} para ${parseInt(quantity)}`
        }
      }),
      prisma.product.update({
        where: { id: parseInt(productId) },
        data: {
          stock: parseInt(quantity)
        }
      })
    ]);

    return res.status(201).json({
      success: true,
      data: { movement, newStock: updatedProduct.stock },
      message: 'Ajuste de estoque registrado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao registrar ajuste:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao registrar ajuste de estoque'
    });
  }
};

const getMovements = async (req, res) => {
  try {
    const { page = 1, limit = 20, productId, type } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (productId) where.productId = parseInt(productId);
    if (type) where.type = type;

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              mainImage: true,
              stock: true
            }
          }
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.stockMovement.count({ where })
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      success: true,
      data: { movements, total, page: pageNum, totalPages },
      message: 'Movimentações obtidas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao buscar movimentações'
    });
  }
};

const getLowStock = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        stock: { lt: 5 },
        active: true
      },
      include: {
        category: true,
        brand: true
      },
      orderBy: { stock: 'asc' }
    });

    return res.status(200).json({
      success: true,
      data: products,
      message: 'Produtos com estoque baixo obtidos com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar estoque baixo:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao buscar produtos com estoque baixo'
    });
  }
};

module.exports = {
  addEntry,
  addExit,
  addAdjustment,
  getMovements,
  getLowStock
};

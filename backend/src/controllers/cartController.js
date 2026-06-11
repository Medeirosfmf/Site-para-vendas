const prisma = require('../config/prisma');

const getCart = async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            mainImage: true,
            salePrice: true,
            promoPrice: true,
            stock: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      success: true,
      data: cartItems,
      message: 'Carrinho obtido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar carrinho:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao buscar carrinho'
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'ID do produto é obrigatório'
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product || !product.active) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Produto não encontrado ou inativo'
      });
    }

    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId: parseInt(productId)
        }
      },
      update: {
        quantity: { increment: parseInt(quantity) }
      },
      create: {
        userId: req.user.id,
        productId: parseInt(productId),
        quantity: parseInt(quantity)
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            mainImage: true,
            salePrice: true,
            promoPrice: true,
            stock: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: cartItem,
      message: 'Produto adicionado ao carrinho'
    });
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao adicionar ao carrinho'
    });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || parseInt(quantity) < 1) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Quantidade deve ser pelo menos 1'
      });
    }

    const existing = await prisma.cartItem.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Item do carrinho não encontrado'
      });
    }

    if (existing.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Acesso negado'
      });
    }

    const cartItem = await prisma.cartItem.update({
      where: { id: parseInt(id) },
      data: { quantity: parseInt(quantity) },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            mainImage: true,
            salePrice: true,
            promoPrice: true,
            stock: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: cartItem,
      message: 'Quantidade atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar item do carrinho:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao atualizar item do carrinho'
    });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.cartItem.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Item do carrinho não encontrado'
      });
    }

    if (existing.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Acesso negado'
      });
    }

    await prisma.cartItem.delete({
      where: { id: parseInt(id) }
    });

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Item removido do carrinho'
    });
  } catch (error) {
    console.error('Erro ao remover item do carrinho:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao remover item do carrinho'
    });
  }
};

const clearCart = async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id }
    });

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Carrinho limpo com sucesso'
    });
  } catch (error) {
    console.error('Erro ao limpar carrinho:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao limpar carrinho'
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};

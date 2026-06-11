const prisma = require('../config/prisma');

const getFavorites = async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            category: true,
            brand: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      success: true,
      data: favorites,
      message: 'Favoritos obtidos com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao buscar favoritos'
    });
  }
};

const addFavorite = async (req, res) => {
  try {
    const { productId } = req.body;

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

    if (!product) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Produto não encontrado'
      });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: req.user.id,
        productId: parseInt(productId)
      },
      include: {
        product: true
      }
    });

    return res.status(201).json({
      success: true,
      data: favorite,
      message: 'Produto adicionado aos favoritos'
    });
  } catch (error) {
    console.error('Erro ao adicionar favorito:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'Produto já está nos favoritos'
      });
    }
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao adicionar favorito'
    });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const { productId } = req.params;

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId: parseInt(productId)
        }
      }
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Favorito não encontrado'
      });
    }

    await prisma.favorite.delete({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId: parseInt(productId)
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Produto removido dos favoritos'
    });
  } catch (error) {
    console.error('Erro ao remover favorito:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao remover favorito'
    });
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite
};

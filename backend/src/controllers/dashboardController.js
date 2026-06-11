const prisma = require('../config/prisma');

const getStats = async (req, res) => {
  try {
    const [
      totalProducts,
      inStockProducts,
      outOfStockProducts,
      totalCustomers,
      totalOrders,
      recentOrders
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { stock: { gt: 0 } } }),
      prisma.product.count({ where: { stock: { lte: 0 }, active: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: { items: true }
          }
        }
      })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalProducts,
        inStockProducts,
        outOfStockProducts,
        totalCustomers,
        totalOrders,
        recentOrders
      },
      message: 'Estatísticas obtidas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao buscar estatísticas'
    });
  }
};

const getRecentOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: { items: true }
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: orders,
      message: 'Pedidos recentes obtidos com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar pedidos recentes:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao buscar pedidos recentes'
    });
  }
};

const getTopProducts = async (req, res) => {
  try {
    const topViewed = await prisma.productView.groupBy({
      by: ['productId'],
      _count: {
        productId: true
      },
      orderBy: {
        _count: {
          productId: 'desc'
        }
      },
      take: 10
    });

    const productIds = topViewed.map((v) => v.productId);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        category: true,
        brand: true
      }
    });

    const result = topViewed.map((view) => {
      const product = products.find((p) => p.id === view.productId);
      return {
        product,
        viewCount: view._count.productId
      };
    });

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Produtos mais visualizados obtidos com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar produtos mais visualizados:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao buscar produtos mais visualizados'
    });
  }
};

module.exports = {
  getStats,
  getRecentOrders,
  getTopProducts
};

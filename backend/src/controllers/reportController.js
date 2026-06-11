const prisma = require('../config/prisma');

const getMostViewed = async (req, res) => {
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
      take: 20
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

const getMostSold = async (req, res) => {
  try {
    const topSold = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 20
    });

    const productIds = topSold.map((s) => s.productId);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        category: true,
        brand: true
      }
    });

    const result = topSold.map((sold) => {
      const product = products.find((p) => p.id === sold.productId);
      return {
        product,
        totalSold: sold._sum.quantity
      };
    });

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Produtos mais vendidos obtidos com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar produtos mais vendidos:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao buscar produtos mais vendidos'
    });
  }
};

const getCategoryStats = async (req, res) => {
  try {
    const stats = await prisma.product.groupBy({
      by: ['categoryId'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    const categoryIds = stats.map((s) => s.categoryId);

    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } }
    });

    const result = stats.map((stat) => {
      const category = categories.find((c) => c.id === stat.categoryId);
      return {
        category,
        productCount: stat._count.id
      };
    });

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Estatísticas por categoria obtidas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas por categoria:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao buscar estatísticas por categoria'
    });
  }
};

const getLowStockReport = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        stock: { lt: 10 }
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
      message: 'Relatório de estoque baixo obtido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar relatório de estoque baixo:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao buscar relatório de estoque baixo'
    });
  }
};

const getProfitReport = async (req, res) => {
  try {
    // Get all order items from non-cancelled orders with product info
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          status: { not: 'CANCELLED' }
        }
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            purchasePrice: true
          }
        },
        order: {
          select: {
            createdAt: true
          }
        }
      }
    });

    // Calculate total profit
    let totalRevenue = 0;
    let totalCost = 0;
    const monthlyData = {};

    for (const item of orderItems) {
      const revenue = parseFloat(item.unitPrice) * item.quantity;
      const cost = parseFloat(item.product.purchasePrice) * item.quantity;
      const profit = revenue - cost;

      totalRevenue += revenue;
      totalCost += cost;

      // Group by month
      const date = new Date(item.order.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          revenue: 0,
          cost: 0,
          profit: 0,
          itemsSold: 0
        };
      }

      monthlyData[monthKey].revenue += revenue;
      monthlyData[monthKey].cost += cost;
      monthlyData[monthKey].profit += profit;
      monthlyData[monthKey].itemsSold += item.quantity;
    }

    const totalProfit = totalRevenue - totalCost;
    const monthly = Object.values(monthlyData).sort((a, b) => b.month.localeCompare(a.month));

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        totalProfit: Math.round(totalProfit * 100) / 100,
        monthly
      },
      message: 'Relatório de lucro obtido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar relatório de lucro:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao buscar relatório de lucro'
    });
  }
};

module.exports = {
  getMostViewed,
  getMostSold,
  getCategoryStats,
  getLowStockReport,
  getProfitReport
};

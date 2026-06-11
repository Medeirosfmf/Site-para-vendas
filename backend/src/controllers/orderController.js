const prisma = require('../config/prisma');

const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (req.user.role !== 'ADMIN' && req.user.role !== 'EMPLOYEE') {
      where.userId = req.user.id;
    }

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              city: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  mainImage: true
                }
              }
            }
          }
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      success: true,
      data: { orders, total, page: pageNum, totalPages },
      message: 'Pedidos obtidos com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao buscar pedidos'
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                mainImage: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Pedido não encontrado'
      });
    }

    if (req.user.role !== 'ADMIN' && req.user.role !== 'EMPLOYEE' && order.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Acesso negado'
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
      message: 'Pedido obtido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao buscar pedido'
    });
  }
};

const createOrder = async (req, res) => {
  try {
    const { notes } = req.body;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: true
      }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Carrinho está vazio'
      });
    }

    // Check stock availability
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          data: null,
          message: `Estoque insuficiente para o produto "${item.product.name}". Disponível: ${item.product.stock}`
        });
      }
    }

    // Calculate total
    let total = 0;
    const orderItems = cartItems.map((item) => {
      const unitPrice = item.product.promoPrice
        ? parseFloat(item.product.promoPrice)
        : parseFloat(item.product.salePrice);
      total += unitPrice * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice
      };
    });

    // Use transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          total,
          notes: notes || null,
          items: {
            create: orderItems
          }
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  mainImage: true
                }
              }
            }
          }
        }
      });

      // Decrease stock for each product
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity }
          }
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { userId: req.user.id }
      });

      return newOrder;
    });

    return res.status(201).json({
      success: true,
      data: order,
      message: 'Pedido criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao criar pedido'
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['RECEIVED', 'ANALYZING', 'PAID', 'SEPARATING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Status inválido. Valores permitidos: ' + validStatuses.join(', ')
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Pedido não encontrado'
      });
    }

    // Validate status transition
    const statusOrder = {
      RECEIVED: 0,
      ANALYZING: 1,
      PAID: 2,
      SEPARATING: 3,
      SHIPPED: 4,
      DELIVERED: 5,
      CANCELLED: 6
    };

    if (order.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Pedido cancelado não pode ter status alterado'
      });
    }

    if (order.status === 'DELIVERED') {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Pedido entregue não pode ter status alterado'
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: updatedOrder,
      message: 'Status do pedido atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao atualizar status do pedido'
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Pedido não encontrado'
      });
    }

    // Check permissions
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'EMPLOYEE';
    const isOwner = order.userId === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Acesso negado'
      });
    }

    // Customer can only cancel RECEIVED or ANALYZING
    if (!isAdmin && !['RECEIVED', 'ANALYZING'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Só é possível cancelar pedidos com status "Recebido" ou "Em Análise"'
      });
    }

    if (order.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Pedido já está cancelado'
      });
    }

    // Cancel with stock restoration using transaction
    const cancelledOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: parseInt(id) },
        data: { status: 'CANCELLED' }
      });

      // Restore stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity }
          }
        });
      }

      return updated;
    });

    return res.status(200).json({
      success: true,
      data: cancelledOrder,
      message: 'Pedido cancelado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao cancelar pedido:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao cancelar pedido'
    });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder
};

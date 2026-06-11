const prisma = require('../config/prisma');

const getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = { role: 'CUSTOMER' };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          city: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
              favorites: true
            }
          }
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      success: true,
      data: { customers, total, page: pageNum, totalPages },
      message: 'Clientes obtidos com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao buscar clientes'
    });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        role: true,
        createdAt: true,
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    mainImage: true
                  }
                }
              }
            }
          }
        },
        favorites: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                mainImage: true,
                salePrice: true,
                promoPrice: true
              }
            }
          }
        },
        productViews: {
          take: 20,
          orderBy: { createdAt: 'desc' },
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

    if (!customer) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Cliente não encontrado'
      });
    }

    return res.status(200).json({
      success: true,
      data: customer,
      message: 'Cliente obtido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao buscar cliente'
    });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Cliente não encontrado'
      });
    }

    if (customer.role !== 'CUSTOMER') {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Apenas clientes podem ser excluídos por esta rota'
      });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Cliente excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao excluir cliente'
    });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  deleteCustomer
};

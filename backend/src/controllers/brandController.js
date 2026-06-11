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

const getBrands = async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      where: { active: true },
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return res.status(200).json({
      success: true,
      data: brands,
      message: 'Marcas obtidas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar marcas:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao buscar marcas'
    });
  }
};

const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await prisma.brand.findUnique({
      where: { id: parseInt(id) }
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Marca não encontrada'
      });
    }

    return res.status(200).json({
      success: true,
      data: brand,
      message: 'Marca obtida com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar marca:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao buscar marca'
    });
  }
};

const createBrand = async (req, res) => {
  try {
    const { name, logo, active } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Nome da marca é obrigatório'
      });
    }

    const slug = generateSlug(name);

    const brand = await prisma.brand.create({
      data: {
        name,
        slug,
        logo: logo || null,
        active: active !== undefined ? active : true
      }
    });

    return res.status(201).json({
      success: true,
      data: brand,
      message: 'Marca criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar marca:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'Já existe uma marca com este nome ou slug'
      });
    }
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao criar marca'
    });
  }
};

const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, logo, active } = req.body;

    const existing = await prisma.brand.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Marca não encontrada'
      });
    }

    const updateData = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = generateSlug(name);
    }
    if (logo !== undefined) updateData.logo = logo;
    if (active !== undefined) updateData.active = active;

    const brand = await prisma.brand.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      data: brand,
      message: 'Marca atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar marca:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'Já existe uma marca com este nome ou slug'
      });
    }
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao atualizar marca'
    });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await prisma.brand.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Marca não encontrada'
      });
    }

    if (brand._count.products > 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Não é possível excluir marca com produtos vinculados'
      });
    }

    await prisma.brand.delete({
      where: { id: parseInt(id) }
    });

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Marca excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir marca:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao excluir marca'
    });
  }
};

module.exports = {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand
};

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

const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
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
      data: categories,
      message: 'Categorias obtidas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao buscar categorias'
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Categoria não encontrada'
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
      message: 'Categoria obtida com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao buscar categoria'
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, icon, active } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Nome da categoria é obrigatório'
      });
    }

    const slug = generateSlug(name);

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        icon: icon || null,
        active: active !== undefined ? active : true
      }
    });

    return res.status(201).json({
      success: true,
      data: category,
      message: 'Categoria criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'Já existe uma categoria com este nome ou slug'
      });
    }
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao criar categoria'
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, active } = req.body;

    const existing = await prisma.category.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Categoria não encontrada'
      });
    }

    const updateData = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = generateSlug(name);
    }
    if (icon !== undefined) updateData.icon = icon;
    if (active !== undefined) updateData.active = active;

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      data: category,
      message: 'Categoria atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'Já existe uma categoria com este nome ou slug'
      });
    }
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao atualizar categoria'
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Categoria não encontrada'
      });
    }

    if (category._count.products > 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Não é possível excluir categoria com produtos vinculados'
      });
    }

    await prisma.category.delete({
      where: { id: parseInt(id) }
    });

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Categoria excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao excluir categoria'
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};

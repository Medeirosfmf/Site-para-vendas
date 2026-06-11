const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * POST /api/auth/register
 * Creates user with emailVerified=true and returns auto-login JWT token.
 */
const register = async (req, res) => {
  try {
    const { name, email, password, phone, city } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Nome, email e senha são obrigatórios'
      });
    }

    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'Este email já está cadastrado'
      });
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        city: city || null,
        role: 'CUSTOMER',
        emailVerified: true,
      }
    });

    // Auto-login: generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutSensitive } = user;

    return res.status(201).json({
      success: true,
      data: { user: userWithoutSensitive, token },
      message: 'Conta criada com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao registrar usuário'
    });
  }
};

/**
 * POST /api/auth/login
 * Authenticates user directly.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Email e senha são obrigatórios'
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Credenciais inválidas'
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Credenciais inválidas'
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutSensitive } = user;

    return res.status(200).json({
      success: true,
      data: { user: userWithoutSensitive, token },
      message: 'Login realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao fazer login'
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Usuário não encontrado'
      });
    }

    const { password: _, ...userWithoutSensitive } = user;

    return res.status(200).json({
      success: true,
      data: userWithoutSensitive,
      message: 'Perfil obtido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao obter perfil'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, city, password } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (city !== undefined) updateData.city = city;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData
    });

    const { password: _, ...userWithoutSensitive } = user;

    return res.status(200).json({
      success: true,
      data: userWithoutSensitive,
      message: 'Perfil atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao atualizar perfil'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};

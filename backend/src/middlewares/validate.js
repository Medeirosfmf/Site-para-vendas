const { body, validationResult } = require('express-validator');

/**
 * Validação de registro de usuário
 */
const validateRegister = [
  body('name')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('E-mail inválido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter no mínimo 6 caracteres'),
];

/**
 * Validação de login
 */
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('E-mail inválido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória'),
];

/**
 * Validação de produto
 */
const validateProduct = [
  body('name')
    .notEmpty()
    .withMessage('Nome do produto é obrigatório')
    .trim(),
  body('categoryId')
    .isInt()
    .withMessage('ID da categoria deve ser um número inteiro'),
  body('brandId')
    .isInt()
    .withMessage('ID da marca deve ser um número inteiro'),
  body('salePrice')
    .isFloat({ min: 0 })
    .withMessage('Preço de venda deve ser um número válido'),
  body('purchasePrice')
    .isFloat({ min: 0 })
    .withMessage('Preço de compra deve ser um número válido'),
];

/**
 * Middleware para processar resultados da validação
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'Erros de validação',
      errors: errors.array(),
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateProduct,
  handleValidation,
};

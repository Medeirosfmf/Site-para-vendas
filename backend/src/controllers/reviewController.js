const prisma = require('../config/prisma');

const createReview = async (req, res) => {
  try {
    const { rating, title, comment, images } = req.body;
    const productId = parseInt(req.params.id);
    const userId = req.user.id; // From authMiddleware

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Nota (rating) e comentário são obrigatórios'
      });
    }

    let imagesToSave = [];
    if (req.files && req.files.length > 0) {
      imagesToSave = req.files.map(file => `/uploads/${file.filename}`);
    } else if (images) {
      if (Array.isArray(images)) {
        imagesToSave = images;
      } else if (typeof images === 'string') {
        try {
          imagesToSave = JSON.parse(images);
        } catch {
          imagesToSave = [images];
        }
      }
    }

    const ratingVal = parseInt(rating);
    if (ratingVal < 1 || ratingVal > 5) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'A nota deve ser entre 1 e 5 estrelas'
      });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Produto não encontrado'
      });
    }

    // Create or update review (upsert)
    const review = await prisma.review.upsert({
      where: {
        userId_productId: {
          userId,
          productId
        }
      },
      update: {
        rating: ratingVal,
        title: title || null,
        comment,
        images: imagesToSave,
      },
      create: {
        userId,
        productId,
        rating: ratingVal,
        title: title || null,
        comment,
        images: imagesToSave,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: review,
      message: 'Avaliação salva com sucesso'
    });
  } catch (error) {
    console.error('Erro ao salvar avaliação:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao salvar avaliação'
    });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Check verified purchase for each review
    const userIds = reviews.map(r => r.userId);
    const userOrders = await prisma.order.findMany({
      where: {
        userId: { in: userIds },
        status: { not: 'CANCELLED' },
        items: {
          some: {
            productId
          }
        }
      },
      select: {
        userId: true
      }
    });

    const buyerUserIds = new Set(userOrders.map(o => o.userId));

    const reviewsWithVerification = reviews.map(r => ({
      ...r,
      verifiedPurchase: buyerUserIds.has(r.userId)
    }));

    return res.status(200).json({
      success: true,
      data: reviewsWithVerification,
      message: 'Avaliações obtidas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Erro interno ao buscar avaliações'
    });
  }
};

module.exports = {
  createReview,
  getProductReviews
};

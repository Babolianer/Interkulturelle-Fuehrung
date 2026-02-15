const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/', auth, async (req, res, next) => {
  try {
    const questions = await prisma.question.findMany({
      orderBy: [{ dimensionName: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, dimensionName: true, text: true, criterion: true, weakExpression: true, strongExpression: true, referenceValue: true, createdAt: true },
    });
    res.json(questions);
  } catch (e) {
    next(e);
  }
});

module.exports = router;

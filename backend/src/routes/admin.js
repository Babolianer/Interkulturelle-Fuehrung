const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole } = require('../middleware/auth');
const {
  getAdminGlobalDimensionAverages,
  getAveragesByCourseNumber,
} = require('../services/surveyStats');

const prisma = new PrismaClient();

router.use(auth);
router.use(requireRole(['ADMIN']));

router.get('/users', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        age: true,
        courseNumber: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { surveys: true } },
      },
    });
    res.json(users);
  } catch (e) {
    next(e);
  }
});

router.get('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        age: true,
        courseNumber: true,
        email: true,
        role: true,
        createdAt: true,
        surveys: {
          orderBy: { createdAt: 'desc' },
          select: { id: true, createdAt: true },
        },
      },
    });
    if (!user) return res.status(404).json({ message: 'Nutzer nicht gefunden' });
    res.json(user);
  } catch (e) {
    next(e);
  }
});

router.patch('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (role !== undefined && !['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Rolle muss USER oder ADMIN sein' });
    }
    const user = await prisma.user.update({
      where: { id },
      data: role !== undefined ? { role } : {},
      select: { id: true, email: true, role: true },
    });
    res.json(user);
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    next(e);
  }
});

router.delete('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({ message: 'Sie können sich nicht selbst löschen' });
    }
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    next(e);
  }
});

router.get('/surveys', async (req, res, next) => {
  try {
    const surveys = await prisma.survey.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, courseNumber: true },
        },
        _count: { select: { answers: true } },
      },
    });
    res.json(surveys);
  } catch (e) {
    next(e);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const [totalSurveys, globalAverages, byCourse] = await Promise.all([
      prisma.survey.count(),
      getAdminGlobalDimensionAverages(),
      getAveragesByCourseNumber(),
    ]);
    const totalUsers = await prisma.user.count();
    res.json({
      totalSurveys,
      totalUsers,
      globalAveragesByDimension: globalAverages,
      averagesByCourseNumber: byCourse,
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;

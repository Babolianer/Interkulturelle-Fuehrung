const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole } = require('../middleware/auth');
const {
  getSurveyAveragesByDimension,
  getSurveyStats,
} = require('../services/surveyStats');

const prisma = new PrismaClient();

router.use(auth);
router.use(requireRole(['USER', 'ADMIN']));

const createSurveyValidation = [
  body('answers').isArray().withMessage('answers muss ein Array sein'),
  body('answers.*.questionId').isUUID().withMessage('Ungültige questionId'),
  body('answers.*.value').isInt({ min: 0, max: 100 }).withMessage('value (ICH) zwischen 0 und 100'),
  body('answers.*.valueDurchschnitt').optional().isInt({ min: 0, max: 100 }).withMessage('valueDurchschnitt zwischen 0 und 100'),
];

router.post('/', createSurveyValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validierungsfehler', errors: errors.array() });
    }
    const { answers } = req.body;
    const questionIds = await prisma.question.findMany({ select: { id: true } }).then((q) => q.map((x) => x.id));
    for (const a of answers) {
      if (!questionIds.includes(a.questionId)) {
        return res.status(400).json({ message: `Unbekannte questionId: ${a.questionId}` });
      }
    }
    const survey = await prisma.survey.create({
      data: {
        userId: req.user.id,
        answers: {
          create: answers.map((a) => ({
            questionId: a.questionId,
            value: a.value,
            valueDurchschnitt: a.valueDurchschnitt != null ? Number(a.valueDurchschnitt) : undefined,
          })),
        },
      },
      include: { answers: true },
    });
    res.status(201).json(survey);
  } catch (e) {
    next(e);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const surveys = await prisma.survey.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, createdAt: true },
    });
    res.json(surveys);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'ADMIN';
    const survey = await prisma.survey.findFirst({
      where: isAdmin ? { id: req.params.id } : { id: req.params.id, userId: req.user.id },
      include: { answers: { include: { question: true } } },
    });
    if (!survey) return res.status(404).json({ message: 'Umfrage nicht gefunden' });
    const ownAverages = await getSurveyAveragesByDimension(survey.id);
    res.json({ survey, ownAverages });
  } catch (e) {
    next(e);
  }
});

router.get('/:id/stats', async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'ADMIN';
    const survey = await prisma.survey.findFirst({
      where: isAdmin ? { id: req.params.id } : { id: req.params.id, userId: req.user.id },
    });
    if (!survey) return res.status(404).json({ message: 'Umfrage nicht gefunden' });
    const stats = await getSurveyStats(survey.id, req.user.id);
    res.json(stats);
  } catch (e) {
    next(e);
  }
});

module.exports = router;

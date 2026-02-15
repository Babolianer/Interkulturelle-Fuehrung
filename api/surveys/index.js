const { prisma } = require('../lib/prisma');
const { getAuthUser, requireAuth, requireRole } = require('../lib/auth');
const { handleCors, corsHeaders } = require('../lib/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  const cors = corsHeaders();

  const user = await getAuthUser(req);
  let err = requireAuth(user);
  if (err) {
    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(err.status).json(err.json);
  }
  err = requireRole(user, ['USER', 'ADMIN']);
  if (err) {
    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(err.status).json(err.json);
  }

  if (req.method === 'GET') {
    try {
      const surveys = await prisma.survey.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        select: { id: true, createdAt: true },
      });
      Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(200).json(surveys);
    } catch (e) {
      console.error(e);
      Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(500).json({ message: e.message || 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { answers } = req.body || {};
      if (!Array.isArray(answers)) {
        Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
        return res.status(400).json({ message: 'answers muss ein Array sein' });
      }
      const questionIds = await prisma.question.findMany({ select: { id: true } }).then((q) => q.map((x) => x.id));
      for (const a of answers) {
        if (!a.questionId || !questionIds.includes(a.questionId)) {
          Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
          return res.status(400).json({ message: `Unbekannte questionId: ${a.questionId}` });
        }
        const v = Number(a.value);
        if (Number.isNaN(v) || v < 0 || v > 100) {
          Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
          return res.status(400).json({ message: 'value (ICH) zwischen 0 und 100' });
        }
      }
      const survey = await prisma.survey.create({
        data: {
          userId: user.id,
          answers: {
            create: answers.map((a) => ({
              questionId: a.questionId,
              value: Number(a.value),
              valueDurchschnitt: a.valueDurchschnitt != null ? Number(a.valueDurchschnitt) : undefined,
            })),
          },
        },
        include: { answers: true },
      });
      Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(201).json(survey);
    } catch (e) {
      console.error(e);
      Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(500).json({ message: e.message || 'Internal server error' });
    }
  }

  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
  res.status(405).json({ message: 'Method not allowed' });
};

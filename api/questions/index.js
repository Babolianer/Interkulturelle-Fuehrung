const { prisma } = require('../lib/prisma');
const { getAuthUser, requireAuth } = require('../lib/auth');
const { handleCors, corsHeaders } = require('../lib/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  const cors = corsHeaders();
  if (req.method !== 'GET') {
    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const user = await getAuthUser(req);
  const err = requireAuth(user);
  if (err) {
    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(err.status).json(err.json);
  }
  try {
    const questions = await prisma.question.findMany({
      orderBy: [{ dimensionName: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        dimensionName: true,
        text: true,
        criterion: true,
        weakExpression: true,
        strongExpression: true,
        referenceValue: true,
        createdAt: true,
      },
    });
    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
    res.status(200).json(questions);
  } catch (e) {
    console.error(e);
    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
    res.status(500).json({ message: e.message || 'Internal server error' });
  }
};

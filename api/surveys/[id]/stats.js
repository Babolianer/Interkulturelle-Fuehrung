const { prisma } = require('../lib/prisma');
const { getAuthUser, requireAuth, requireRole } = require('../lib/auth');
const { getSurveyStats } = require('../lib/surveyStats');
const { handleCors, corsHeaders } = require('../lib/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  const cors = corsHeaders();
  if (req.method !== 'GET') {
    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(405).json({ message: 'Method not allowed' });
  }
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
  const surveyId = req.query.id;
  if (!surveyId) {
    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(400).json({ message: 'Survey ID fehlt' });
  }
  try {
    const isAdmin = user.role === 'ADMIN';
    const survey = await prisma.survey.findFirst({
      where: isAdmin ? { id: surveyId } : { id: surveyId, userId: user.id },
    });
    if (!survey) {
      Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(404).json({ message: 'Umfrage nicht gefunden' });
    }
    const stats = await getSurveyStats(survey.id, user.id);
    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
    res.status(200).json(stats);
  } catch (e) {
    console.error(e);
    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
    res.status(500).json({ message: e.message || 'Internal server error' });
  }
};

const { prisma } = require('../lib/prisma');
const { getAuthUser, requireAuth, requireRole } = require('../lib/auth');
const {
  getAdminGlobalDimensionAverages,
  getAveragesByCourseNumber,
} = require('../lib/surveyStats');
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
  err = requireRole(user, ['ADMIN']);
  if (err) {
    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(err.status).json(err.json);
  }
  try {
    const [totalSurveys, globalAverages, byCourse] = await Promise.all([
      prisma.survey.count(),
      getAdminGlobalDimensionAverages(),
      getAveragesByCourseNumber(),
    ]);
    const totalUsers = await prisma.user.count();
    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
    res.status(200).json({
      totalSurveys,
      totalUsers,
      globalAveragesByDimension: globalAverages,
      averagesByCourseNumber: byCourse,
    });
  } catch (e) {
    console.error(e);
    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
    res.status(500).json({ message: e.message || 'Internal server error' });
  }
};

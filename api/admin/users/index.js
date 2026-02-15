const { prisma } = require('../../lib/prisma');
const { getAuthUser, requireAuth, requireRole } = require('../../lib/auth');
const { handleCors, corsHeaders } = require('../../lib/cors');

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
    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
    res.status(200).json(users);
  } catch (e) {
    console.error(e);
    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
    res.status(500).json({ message: e.message || 'Internal server error' });
  }
};

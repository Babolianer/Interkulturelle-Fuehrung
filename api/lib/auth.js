const jwt = require('jsonwebtoken');
const { prisma } = require('./prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

async function getAuthUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });
    return user;
  } catch {
    return null;
  }
}

function requireAuth(user) {
  if (!user) return { status: 401, json: { message: 'Nicht authentifiziert' } };
  return null;
}

function requireRole(user, roles) {
  if (!user) return { status: 401, json: { message: 'Nicht authentifiziert' } };
  if (!roles.includes(user.role)) return { status: 403, json: { message: 'Keine Berechtigung' } };
  return null;
}

module.exports = { getAuthUser, requireAuth, requireRole, JWT_SECRET };

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Nicht authentifiziert' });
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });
    if (!user) return res.status(401).json({ message: 'Benutzer nicht gefunden' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Ungültiger oder abgelaufener Token' });
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Nicht authentifiziert' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Keine Berechtigung' });
    }
    next();
  };
}

module.exports = { auth, requireRole };

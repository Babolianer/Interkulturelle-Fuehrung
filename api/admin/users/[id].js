const { prisma } = require('../../lib/prisma');
const { getAuthUser, requireAuth, requireRole } = require('../../lib/auth');
const { handleCors, corsHeaders } = require('../../lib/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  const cors = corsHeaders();
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
  const id = req.query.id;
  if (!id) {
    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(400).json({ message: 'User ID fehlt' });
  }

  if (req.method === 'GET') {
    try {
      const target = await prisma.user.findUnique({
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
      if (!target) {
        Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
        return res.status(404).json({ message: 'Nutzer nicht gefunden' });
      }
      Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(200).json(target);
    } catch (e) {
      console.error(e);
      Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(500).json({ message: e.message || 'Internal server error' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { role } = req.body || {};
      if (role !== undefined && !['USER', 'ADMIN'].includes(role)) {
        Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
        return res.status(400).json({ message: 'Rolle muss USER oder ADMIN sein' });
      }
      const updated = await prisma.user.update({
        where: { id },
        data: role !== undefined ? { role } : {},
        select: { id: true, email: true, role: true },
      });
      Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(200).json(updated);
    } catch (e) {
      if (e.code === 'P2025') {
        Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
        return res.status(404).json({ message: 'Benutzer nicht gefunden' });
      }
      console.error(e);
      Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(500).json({ message: e.message || 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      if (id === user.id) {
        Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
        return res.status(400).json({ message: 'Sie können sich nicht selbst löschen' });
      }
      await prisma.user.delete({ where: { id } });
      Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(204).end();
    } catch (e) {
      if (e.code === 'P2025') {
        Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
        return res.status(404).json({ message: 'Benutzer nicht gefunden' });
      }
      console.error(e);
      Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(500).json({ message: e.message || 'Internal server error' });
    }
  }

  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
  res.status(405).json({ message: 'Method not allowed' });
};

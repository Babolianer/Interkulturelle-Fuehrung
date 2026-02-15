const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { prisma } = require('../lib/prisma');
const { handleCors, corsHeaders } = require('../lib/cors');
const { JWT_SECRET } = require('../lib/auth');

const JWT_EXPIRES = process.env.JWT_EXPIRES || '24h';

function sendToken(user, res, cors) {
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
  const safeUser = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
  res.status(200).json({ token, user: safeUser });
}

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  const cors = corsHeaders();
  if (req.method !== 'POST') {
    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(405).json({ message: 'Method not allowed' });
  }
  try {
    const { email, password } = req.body || {};
    if (!email?.trim() || !password) {
      Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(400).json({ message: 'E-Mail und Passwort erforderlich' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(401).json({ message: 'Ungültige Anmeldedaten' });
    }
    sendToken(user, res, cors);
  } catch (e) {
    console.error(e);
    Object.entries(corsHeaders()).forEach(([k, v]) => res.setHeader(k, v));
    res.status(500).json({ message: e.message || 'Internal server error' });
  }
};

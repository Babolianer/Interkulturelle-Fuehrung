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
    const { firstName, lastName, age, courseNumber, email, password } = req.body || {};
    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password) {
      Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(400).json({ message: 'Vorname, Nachname, E-Mail und Passwort erforderlich' });
    }
    const ageNum = parseInt(age, 10);
    if (Number.isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(400).json({ message: 'Alter zwischen 1 und 120' });
    }
    if (password.length < 6) {
      Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(400).json({ message: 'Passwort mindestens 6 Zeichen' });
    }
    if (!courseNumber?.trim()) {
      Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(400).json({ message: 'Kursnummer erforderlich' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(400).json({ message: 'E-Mail bereits registriert' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        age: ageNum,
        courseNumber: courseNumber.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: 'USER',
      },
    });
    sendToken(user, res, cors);
  } catch (e) {
    console.error(e);
    Object.entries(corsHeaders()).forEach(([k, v]) => res.setHeader(k, v));
    res.status(500).json({ message: e.message || 'Internal server error' });
  }
};

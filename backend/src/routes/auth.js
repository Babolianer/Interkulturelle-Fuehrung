const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '24h';

const registerValidation = [
  body('firstName').trim().notEmpty().withMessage('Vorname erforderlich'),
  body('lastName').trim().notEmpty().withMessage('Nachname erforderlich'),
  body('age').isInt({ min: 1, max: 120 }).withMessage('Alter zwischen 1 und 120'),
  body('courseNumber').trim().notEmpty().withMessage('Kursnummer erforderlich'),
  body('email').isEmail().normalizeEmail().withMessage('Gültige E-Mail erforderlich'),
  body('password').isLength({ min: 6 }).withMessage('Passwort mindestens 6 Zeichen'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

function sendToken(user, res) {
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
  res.json({ token, user: safeUser });
}

router.post('/register', registerValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validierungsfehler', errors: errors.array() });
    }
    const { firstName, lastName, age, courseNumber, email, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'E-Mail bereits registriert' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        age: parseInt(age, 10),
        courseNumber,
        email,
        password: hashedPassword,
        role: 'USER',
      },
    });
    sendToken(user, res);
  } catch (e) {
    next(e);
  }
});

router.post('/login', loginValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'E-Mail und Passwort erforderlich' });
    }
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Ungültige Anmeldedaten' });
    }
    sendToken(user, res);
  } catch (e) {
    next(e);
  }
});

router.get('/me', auth, (req, res) => {
  res.json(req.user);
});

module.exports = router;

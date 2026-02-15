const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const HOFSTEDE_QUESTIONS = [
  // Power Distance Index (PDI)
  { dimensionName: 'Power Distance', text: 'In meiner Organisation ist es wichtig, dass Machtunterschiede zwischen Menschen akzeptiert werden.' },
  { dimensionName: 'Power Distance', text: 'Untergebene sollten die Anweisungen ihrer Vorgesetzten ohne Widerspruch befolgen.' },
  { dimensionName: 'Power Distance', text: 'Menschen in Führungspositionen verdienen besondere Privilegien.' },
  // Individualism vs Collectivism (IDV)
  { dimensionName: 'Individualism', text: 'Persönliche Ziele sind mir wichtiger als die Ziele der Gruppe.' },
  { dimensionName: 'Individualism', text: 'Ich bevorzuge es, alleine zu arbeiten und eigenverantwortlich zu entscheiden.' },
  { dimensionName: 'Individualism', text: 'Erfolg wird an der eigenen Leistung gemessen, nicht an der des Teams.' },
  // Masculinity vs Femininity (MAS)
  { dimensionName: 'Masculinity', text: 'Wettbewerb und Durchsetzungsfähigkeit sind wichtige Werte in der Arbeitswelt.' },
  { dimensionName: 'Masculinity', text: 'Es ist wichtiger, im Beruf erfolgreich zu sein als Work-Life-Balance zu haben.' },
  { dimensionName: 'Masculinity', text: 'Entscheidungen sollten sachlich und zielorientiert getroffen werden.' },
  // Uncertainty Avoidance (UAI)
  { dimensionName: 'Uncertainty Avoidance', text: 'Klare Regeln und Strukturen geben mir Sicherheit bei der Arbeit.' },
  { dimensionName: 'Uncertainty Avoidance', text: 'Unvorhersehbare Situationen bereiten mir Unbehagen.' },
  { dimensionName: 'Uncertainty Avoidance', text: 'Es ist wichtig, dass Prozesse und Abläufe schriftlich festgelegt sind.' },
  // Long Term Orientation (LTO)
  { dimensionName: 'Long Term Orientation', text: 'Langfristige Planung ist wichtiger als kurzfristige Erfolge.' },
  { dimensionName: 'Long Term Orientation', text: 'Traditionen und bewährte Praktiken haben einen hohen Stellenwert.' },
  { dimensionName: 'Long Term Orientation', text: 'Investitionen in die Zukunft lohnen sich auch bei unsicheren Ergebnissen.' },
  // Indulgence vs Restraint (IVR)
  { dimensionName: 'Indulgence', text: 'Freizeit und Genuss sind wichtige Bestandteile eines erfüllten Lebens.' },
  { dimensionName: 'Indulgence', text: 'Positive Emotionen und Optimismus sollten im Arbeitsalltag Raum haben.' },
  { dimensionName: 'Indulgence', text: 'Flexibilität und Spontanität sind wertvoller als strikte Disziplin.' },
];

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@interkulturelle-fuehrung.de';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        firstName: 'Admin',
        lastName: 'System',
        age: 30,
        courseNumber: 'ADMIN',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log('Admin user created:', adminEmail);
  } else {
    console.log('Admin user already exists:', adminEmail);
  }

  const count = await prisma.question.count();
  if (count === 0) {
    await prisma.question.createMany({ data: HOFSTEDE_QUESTIONS });
    console.log('Created', HOFSTEDE_QUESTIONS.length, 'Hofstede questions.');
  } else {
    console.log('Questions already seeded, skipping.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

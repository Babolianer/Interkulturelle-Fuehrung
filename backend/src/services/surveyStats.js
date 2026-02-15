const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Durchschnitt pro Dimension für eine Umfrage (eigene Werte).
 * Returns { dimensionName: average } (0-100).
 */
async function getSurveyAveragesByDimension(surveyId) {
  const answers = await prisma.surveyAnswer.findMany({
    where: { surveyId },
    include: { question: true },
  });
  const byDimension = {};
  for (const a of answers) {
    if (!a.question) continue;
    const dim = a.question.dimensionName;
    if (!byDimension[dim]) byDimension[dim] = { sum: 0, count: 0 };
    byDimension[dim].sum += a.value;
    byDimension[dim].count += 1;
  }
  const result = {};
  for (const [dim, { sum, count }] of Object.entries(byDimension)) {
    result[dim] = Math.round((sum / count) * 10) / 10;
  }
  return result;
}

/**
 * Globaler Durchschnitt pro Dimension (alle SurveyAnswers).
 */
async function getGlobalAveragesByDimension() {
  const answers = await prisma.surveyAnswer.findMany({
    include: { question: true },
  });
  const byDimension = {};
  for (const a of answers) {
    if (!a.question) continue;
    const dim = a.question.dimensionName;
    if (!byDimension[dim]) byDimension[dim] = { sum: 0, count: 0 };
    byDimension[dim].sum += a.value;
    byDimension[dim].count += 1;
  }
  const result = {};
  for (const [dim, { sum, count }] of Object.entries(byDimension)) {
    result[dim] = count ? Math.round((sum / count) * 10) / 10 : 0;
  }
  return result;
}

/**
 * Verlauf: für einen User alle Surveys zeitlich geordnet mit Durchschnitt pro Dimension.
 * Returns array of { surveyId, createdAt, averagesByDimension }.
 */
async function getUserSurveyHistory(userId) {
  const surveys = await prisma.survey.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    include: { answers: { include: { question: true } } },
  });
  return surveys.map((s) => {
    const byDimension = {};
    for (const a of s.answers) {
      if (!a.question) continue;
      const dim = a.question.dimensionName;
      if (!byDimension[dim]) byDimension[dim] = { sum: 0, count: 0 };
      byDimension[dim].sum += a.value;
      byDimension[dim].count += 1;
    }
    const averagesByDimension = {};
    for (const [dim, { sum, count }] of Object.entries(byDimension)) {
      averagesByDimension[dim] = count ? Math.round((sum / count) * 10) / 10 : 0;
    }
    return {
      surveyId: s.id,
      createdAt: s.createdAt,
      averagesByDimension,
    };
  });
}

/**
 * Durchschnitt valueDurchschnitt (Nutzer-Einschätzung „Durchschnitts-Deutscher“) pro Dimension für eine Umfrage.
 */
async function getSurveyDurchschnittAveragesByDimension(surveyId) {
  const answers = await prisma.surveyAnswer.findMany({
    where: { surveyId },
    include: { question: true },
  });
  const byDimension = {};
  for (const a of answers) {
    if (!a.question || a.valueDurchschnitt == null) continue;
    const dim = a.question.dimensionName;
    if (!byDimension[dim]) byDimension[dim] = { sum: 0, count: 0 };
    byDimension[dim].sum += a.valueDurchschnitt;
    byDimension[dim].count += 1;
  }
  const result = {};
  for (const [dim, { sum, count }] of Object.entries(byDimension)) {
    result[dim] = count ? Math.round((sum / count) * 10) / 10 : 0;
  }
  return result;
}

/**
 * Stats für eine Umfrage: eigene Dimension-Durchschnitte, eingeschätzter DURCHSCHNITT, globaler Durchschnitt, Verlauf des Users.
 */
async function getSurveyStats(surveyId, userId) {
  const [ownAverages, ownDurchschnittAverages, globalAverages, history] = await Promise.all([
    getSurveyAveragesByDimension(surveyId),
    getSurveyDurchschnittAveragesByDimension(surveyId),
    getGlobalAveragesByDimension(),
    getUserSurveyHistory(userId),
  ]);
  return { ownAverages, ownDurchschnittAverages, globalAverages, history };
}

/**
 * Admin: Durchschnitt pro Dimension global.
 */
async function getAdminGlobalDimensionAverages() {
  return getGlobalAveragesByDimension();
}

/**
 * Admin: Durchschnitt pro Kursnummer (courseNumber) pro Dimension.
 * Returns { courseNumber: { dimensionName: average } }.
 */
async function getAveragesByCourseNumber() {
  const surveys = await prisma.survey.findMany({
    include: {
      user: true,
      answers: { include: { question: true } },
    },
  });
  const byCourse = {};
  for (const s of surveys) {
    const course = s.user.courseNumber;
    if (!byCourse[course]) byCourse[course] = {};
    for (const a of s.answers) {
      if (!a.question) continue;
      const dim = a.question.dimensionName;
      if (!byCourse[course][dim]) byCourse[course][dim] = { sum: 0, count: 0 };
      byCourse[course][dim].sum += a.value;
      byCourse[course][dim].count += 1;
    }
  }
  const result = {};
  for (const [course, dims] of Object.entries(byCourse)) {
    result[course] = {};
    for (const [dim, { sum, count }] of Object.entries(dims)) {
      result[course][dim] = count ? Math.round((sum / count) * 10) / 10 : 0;
    }
  }
  return result;
}

module.exports = {
  getSurveyAveragesByDimension,
  getGlobalAveragesByDimension,
  getUserSurveyHistory,
  getSurveyStats,
  getAdminGlobalDimensionAverages,
  getAveragesByCourseNumber,
};

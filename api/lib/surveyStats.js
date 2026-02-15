const { prisma } = require('./prisma');

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

async function getSurveyStats(surveyId, userId) {
  const [ownAverages, ownDurchschnittAverages, globalAverages, history] = await Promise.all([
    getSurveyAveragesByDimension(surveyId),
    getSurveyDurchschnittAveragesByDimension(surveyId),
    getGlobalAveragesByDimension(),
    getUserSurveyHistory(userId),
  ]);
  return { ownAverages, ownDurchschnittAverages, globalAverages, history };
}

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
  getAdminGlobalDimensionAverages: getGlobalAveragesByDimension,
  getAveragesByCourseNumber,
};

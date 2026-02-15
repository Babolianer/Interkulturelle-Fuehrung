import api from './axios';

export const surveyService = {
  getQuestions() {
    return api.get('/api/questions').then((res) => res.data);
  },
  createSurvey(answers) {
    return api.post('/api/surveys', { answers }).then((res) => res.data);
  },
  getMySurveys() {
    return api.get('/api/surveys').then((res) => res.data);
  },
  getSurvey(id) {
    return api.get(`/api/surveys/${id}`).then((res) => res.data);
  },
  getSurveyStats(id) {
    return api.get(`/api/surveys/${id}/stats`).then((res) => res.data);
  },
};

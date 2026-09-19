import api from './api';

export const assessmentApi = {
  // Submit evaluation request to explainable rule engine
  evaluateAssessment: async (payload) => {
    const response = await api.post('/assessment/evaluate', payload);
    return response.data;
  },

  // Fetch normal ROM benchmark values
  getNormalROM: async (joint) => {
    const response = await api.get(`/assessment/normal-rom/${joint}`);
    return response.data;
  },

  // Fetch questionnaire schema for specific joint
  getQuestionnaire: async (joint) => {
    const response = await api.get(`/questionnaire/${joint}`);
    return response.data;
  },

  // Fetch past assessment sessions
  listSessions: async () => {
    const response = await api.get('/assessment/sessions');
    return response.data;
  },

  // Delete an individual assessment session
  deleteSession: async (sessionUuid) => {
    const response = await api.delete(`/assessment/sessions/${sessionUuid}`);
    return response.data;
  },

  // Get PDF Report Download URL
  getReportDownloadUrl: (sessionUuid) => {
    return `/api/v1/reports/download/${sessionUuid}`;
  },

  // Get Questionnaires PDF Download URL
  getQuestionnairesPdfDownloadUrl: () => {
    return `/api/v1/reports/download-questionnaires-pdf`;
  }
};

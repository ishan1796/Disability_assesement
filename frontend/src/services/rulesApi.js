import api from './api';

export const rulesApi = {
  listRules: async () => {
    const response = await api.get('/rules');
    return response.data;
  },
  getJointRules: async (joint) => {
    const response = await api.get(`/rules/${joint}`);
    return response.data;
  }
};

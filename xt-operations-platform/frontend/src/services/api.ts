import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.error || err.message || 'Request failed';
    return Promise.reject(new Error(msg));
  }
);

// Crowd Packs
export const crowdPacksApi = {
  list: (params?: any) => api.get('/crowd-packs', { params }),
  get: (id: string) => api.get(`/crowd-packs/${id}`),
  create: (data: any) => api.post('/crowd-packs', data),
  update: (id: string, data: any) => api.put(`/crowd-packs/${id}`, data),
  delete: (id: string) => api.delete(`/crowd-packs/${id}`),
  previewCount: (id: string) => api.get(`/crowd-packs/${id}/preview-count`),
};

// Materials
export const materialsApi = {
  list: (params?: any) => api.get('/materials', { params }),
  get: (id: string) => api.get(`/materials/${id}`),
  create: (data: any) => api.post('/materials', data),
  update: (id: string, data: any) => api.put(`/materials/${id}`, data),
  delete: (id: string) => api.delete(`/materials/${id}`),
  duplicate: (id: string) => api.post(`/materials/${id}/duplicate`),
  batchStatus: (ids: string[], status: string) => api.post('/materials/batch/status', { ids, status }),
  usageStats: () => api.get('/materials/stats/usage'),
  // Categories
  categories: () => api.get('/materials/categories/all'),
  createCategory: (data: any) => api.post('/materials/categories', data),
  updateCategory: (id: string, data: any) => api.put(`/materials/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/materials/categories/${id}`),
};

// Resource Positions
export const positionsApi = {
  list: (params?: any) => api.get('/resource-positions', { params }),
  get: (id: string) => api.get(`/resource-positions/${id}`),
  create: (data: any) => api.post('/resource-positions', data),
  update: (id: string, data: any) => api.put(`/resource-positions/${id}`, data),
  analytics: (id: string) => api.get(`/resource-positions/${id}/analytics`),
};

// Position Configs (核心人货场绑定)
export const configsApi = {
  list: (params?: any) => api.get('/configs', { params }),
  get: (id: string) => api.get(`/configs/${id}`),
  create: (data: any) => api.post('/configs', data),
  update: (id: string, data: any) => api.put(`/configs/${id}`, data),
  toggle: (id: string) => api.post(`/configs/${id}/toggle`),
  duplicate: (id: string) => api.post(`/configs/${id}/duplicate`),
  preview: (id: string, user: any) => api.post(`/configs/${id}/preview`, user),
};

// Rules
export const rulesApi = {
  getByConfig: (configId: string) => api.get(`/rules/config/${configId}`),
  update: (id: string, data: any) => api.put(`/rules/${id}`, data),
  template: () => api.get('/rules/template/default'),
  reset: (configId: string) => api.post(`/rules/config/${configId}/reset`),
};

// Delivery
export const deliveryApi = {
  getPositions: () => api.get('/delivery/positions'),
  match: (user: any) => api.post('/delivery/match', user),
};

// Analytics
export const analyticsApi = {
  overview: (timeRange?: string) => api.get('/analytics/overview', { params: { timeRange } }),
  position: (id: string, timeRange?: string) => api.get(`/analytics/positions/${id}`, { params: { timeRange } }),
  config: (id: string) => api.get(`/analytics/configs/${id}`),
  recordEvent: (data: any) => api.post('/analytics/events', data),
  recordEvents: (events: any[]) => api.post('/analytics/events/batch', { events }),
};

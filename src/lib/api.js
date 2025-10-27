import api from './axios'

// Subject APIs
export const subjectAPI = {
  getAll: (params = {}) => api.get('/subjects', { params }),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
  restore: (id) => api.patch(`/subjects/${id}/restore`),
  getDeleted: (params = {}) => api.get('/subjects/deleted', { params }),
}

// Chapter APIs
export const chapterAPI = {
  getAll: (params = {}) => api.get('/chapters', { params }),
  getById: (id) => api.get(`/chapters/${id}`),
  create: (data) => api.post('/chapters', data),
  update: (id, data) => api.put(`/chapters/${id}`, data),
  delete: (id) => api.delete(`/chapters/${id}`),
  restore: (id) => api.patch(`/chapters/${id}/restore`),
  getDeleted: (params = {}) => api.get('/chapters/deleted', { params }),
  getBySubject: (subjectId, params = {}) => api.get(`/chapters/subject/${subjectId}`, { params }),
}

// Question APIs
export const questionAPI = {
  getAll: (params = {}) => api.get('/questions', { params }),
  getById: (id) => api.get(`/questions/${id}`),
  create: (data) => api.post('/questions', data),
  update: (id, data) => api.put(`/questions/${id}`, data),
  delete: (id) => api.delete(`/questions/${id}`),
  restore: (id) => api.patch(`/questions/${id}/restore`),
  getDeleted: (params = {}) => api.get('/questions/deleted', { params }),
  getByChapter: (chapterId, params = {}) => api.get(`/questions/chapter/${chapterId}`, { params }),
  getBySubject: (subjectId, params = {}) => api.get(`/questions/subject/${subjectId}`, { params }),
  getStats: (params = {}) => api.get('/questions/stats', { params }),
}

// Option APIs
export const optionAPI = {
  getByQuestion: (questionId) => api.get(`/options/question/${questionId}`),
  createForQuestion: (questionId, data) => api.post(`/options/question/${questionId}`, data),
  update: (id, data) => api.put(`/options/${id}`, data),
  delete: (id) => api.delete(`/options/${id}`),
  restore: (id) => api.patch(`/options/${id}/restore`),
  getDeleted: (params = {}) => api.get('/options/deleted', { params }),
  reorder: (questionId, data) => api.put(`/options/question/${questionId}/reorder`, data),
}

export default api

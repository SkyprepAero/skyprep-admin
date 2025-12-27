import api from './axios'

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  verifyPasscode: (data) => api.post('/auth/login/passcode', data),
  getMe: () => api.get('/auth/me'),
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}

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

// Course APIs
export const courseAPI = {
  getAll: (params = {}) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  restore: (id) => api.patch(`/courses/${id}/restore`),
  getDeleted: (params = {}) => api.get('/courses/deleted', { params }),
}

// Focus One APIs
export const focusOneAPI = {
  getAll: (params = {}) => api.get('/focus-ones', { params }),
  getById: (id) => api.get(`/focus-ones/${id}`),
  create: (data) => api.post('/focus-ones', data),
  update: (id, data) => api.put(`/focus-ones/${id}`, data),
  delete: (id) => api.delete(`/focus-ones/${id}`),
  restore: (id) => api.patch(`/focus-ones/${id}/restore`),
  getDeleted: (params = {}) => api.get('/focus-ones/deleted', { params }),
  pause: (id, data = {}) => api.post(`/focus-ones/${id}/pause`, data),
  resume: (id) => api.post(`/focus-ones/${id}/resume`),
}

// Enrollment APIs
export const enrollmentAPI = {
  enroll: (data) => api.post('/admin/focus-one/enroll', data),
  getAll: (params = {}) => api.get('/admin/focus-one/enrollments', { params }),
  getByFocusOne: (focusOneId, params = {}) => api.get(`/admin/focus-one/${focusOneId}/enrollments`, { params }),
  getById: (userId) => api.get(`/admin/focus-one/enrollments/${userId}`),
  update: (userId, data) => api.put(`/admin/focus-one/enrollments/${userId}`, data),
  cancel: (userId) => api.delete(`/admin/focus-one/enrollments/${userId}`),
}

// Role APIs (for getting teachers)
export const roleAPI = {
  getUsersByRole: (role, params = {}) => api.get(`/roles/${role}/users`, { params }),
}
export const teacherAPI = {
  getAll: (params = {}) => roleAPI.getUsersByRole('teacher', params),
  register: (data) => api.post('/admin/teachers/register', data),
}
export default api

const API_BASE = (import.meta.env.VITE_API_URL || 'https://layer-erp.onrender.com/api').replace(/\/+$/, '');

/**
 * Generic Fetch wrapper with JSON handling and fallback
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `API error (${res.status})`);
    }
    return data;
  } catch (error) {
    console.warn(`[Layer API] Error on ${options.method || 'GET'} ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Health
  checkHealth: () => request('/health'),

  // Auth
  login: (username, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  getMe: () => request('/auth/me'),
  updateProfile: (profileData) =>
    request('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    }),
  changePassword: (currentPassword, newPassword) =>
    request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  // Juniors
  getJuniors: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/juniors${qs ? `?${qs}` : ''}`);
  },
  getJuniorById: (id) => request(`/juniors/${id}`),
  createJunior: (juniorData) =>
    request('/juniors', {
      method: 'POST',
      body: JSON.stringify(juniorData),
    }),
  updateJunior: (id, updatedData) =>
    request(`/juniors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedData),
    }),
  toggleJuniorStatus: (id) =>
    request(`/juniors/${id}/status`, {
      method: 'PATCH',
    }),
  deleteJunior: (id) =>
    request(`/juniors/${id}`, {
      method: 'DELETE',
    }),

  // Cases
  getCases: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/cases${qs ? `?${qs}` : ''}`);
  },
  getCaseById: (id) => request(`/cases/${id}`),
  createCase: (caseData) =>
    request('/cases', {
      method: 'POST',
      body: JSON.stringify(caseData),
    }),
  updateCase: (id, updatedData) =>
    request(`/cases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedData),
    }),
  deleteCase: (id) =>
    request(`/cases/${id}`, {
      method: 'DELETE',
    }),
  addCaseNote: (caseId, noteData) =>
    request(`/cases/${caseId}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    }),
  addCaseDocument: (caseId, docData) =>
    request(`/cases/${caseId}/documents`, {
      method: 'POST',
      body: JSON.stringify(docData),
    }),
  deleteCaseDocument: (caseId, docId) =>
    request(`/cases/${caseId}/documents/${docId}`, {
      method: 'DELETE',
    }),

  // Amounts
  getAmounts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/amounts${qs ? `?${qs}` : ''}`);
  },
  createAmount: (amountData) =>
    request('/amounts', {
      method: 'POST',
      body: JSON.stringify(amountData),
    }),
  updateAmount: (id, updatedData) =>
    request(`/amounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedData),
    }),
  deleteAmount: (id) =>
    request(`/amounts/${id}`, {
      method: 'DELETE',
    }),

  // Hearings
  getHearings: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/hearings${qs ? `?${qs}` : ''}`);
  },
  createHearing: (hearingData) =>
    request('/hearings', {
      method: 'POST',
      body: JSON.stringify(hearingData),
    }),
  updateHearing: (id, updatedData) =>
    request(`/hearings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedData),
    }),
  deleteHearing: (id) =>
    request(`/hearings/${id}`, {
      method: 'DELETE',
    }),
  sendWhatsAppReminder: (id) =>
    request(`/hearings/${id}/whatsapp-reminder`, {
      method: 'POST',
    }),

  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (settingsData) =>
    request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    }),

  // Dashboard & Reset
  getDashboardStats: () => request('/dashboard/stats'),
  resetData: () =>
    request('/dashboard/reset', {
      method: 'POST',
    }),
};

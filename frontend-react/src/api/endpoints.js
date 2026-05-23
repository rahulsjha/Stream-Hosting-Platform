import apiClient from './client';

export const authAPI = {
  register: (username, email, password) =>
    apiClient.post('/users/register', { username, email, password }),

  login: (username, password) =>
    apiClient.post('/users/login', { username, password }),

  getProfile: () =>
    apiClient.get('/users/me'),

  getUser: (username) =>
    apiClient.get(`/users/${username}`),
};

export const userAPI = {
  getProfile: () =>
    apiClient.get('/users/me'),

  updateDestinations: (yt_url, tw_url, kk_url, yt_on, tw_on, kk_on) =>
    apiClient.put('/users/destinations', { yt_url, tw_url, kk_url, yt_on, tw_on, kk_on }),

  regenerateStreamKey: () =>
    apiClient.post('/users/regenerate-key'),

  getSessions: (username) =>
    apiClient.get(`/users/${username}/sessions`),
};

export const mediaAPI = {
};

export const adminAPI = {
  getStats: () =>
    apiClient.get('/admin/stats'),

  getStreams: () =>
    apiClient.get('/admin/streams'),

  getUsers: () =>
    apiClient.get('/admin/users'),

  updateUser: (username, updates) =>
    apiClient.patch(`/admin/users/${username}`, updates),
};

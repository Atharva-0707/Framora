import api from './api';

export const userService = {
  async getUserProfile(idOrUsername) {
    const response = await api.get(`/users/${idOrUsername}`);
    return response.data;
  },

  async updateProfile(formData) {
    const response = await api.put('/users/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async toggleFollow(userId) {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },

  async getBookmarks() {
    const response = await api.get('/users/bookmarks');
    return response.data;
  },

  async searchUsers(query) {
    const response = await api.get('/users/search', {
      params: { query },
    });
    return response.data;
  },
};

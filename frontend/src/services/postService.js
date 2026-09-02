import api from './api';

export const postService = {
  async getPosts(params = {}) {
    const response = await api.get('/posts', { params });
    return response.data;
  },

  async getPostById(id) {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  async createPost(formData) {
    const response = await api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updatePost(id, formData) {
    const response = await api.put(`/posts/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deletePost(id) {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },

  async toggleLike(id) {
    const response = await api.post(`/posts/${id}/like`);
    return response.data;
  },

  async toggleBookmark(id) {
    const response = await api.post(`/posts/${id}/bookmark`);
    return response.data;
  },

  async addComment(postId, content) {
    const response = await api.post(`/posts/${postId}/comments`, { content });
    return response.data;
  },

  async getComments(postId) {
    const response = await api.get(`/posts/${postId}/comments`);
    return response.data;
  },

  async deleteComment(commentId) {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },
};

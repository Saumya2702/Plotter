import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

export const getStoriesInBbox = async (bbox) => {
  const response = await api.get('/stories', { params: { bbox } });
  return response.data;
};

export const getStoryDetails = async (id) => {
  const response = await api.get(`/stories/${id}`);
  return response.data;
};

export const createStory = async (storyData) => {
  // storyData: { title, content, lat, lng, imageUrl? }
  const response = await api.post('/stories', storyData);
  return response.data;
};

export const addReply = async (storyId, content) => {
  const response = await api.post(`/stories/${storyId}/reply`, { content });
  return response.data;
};

// Search / Explore
export const searchStories = async (q) => {
  const response = await api.get(`/explore`, { params: { q } });
  return response.data;
};

// User Profile
export const getUserProfile = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const updateUserProfile = async (id, data, token) => {
  const response = await api.put(`/users/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Reactions
export const postReaction = async (storyId, type, token) => {
  const response = await api.post(`/reactions/${storyId}`, { type }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Comments
export const postComment = async (storyId, content, token) => {
  const response = await api.post(`/stories/${storyId}/comments`, { content }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};




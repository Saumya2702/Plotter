import { useState, useCallback } from 'react';
import * as api from '../services/api';

export function useStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStoriesInBbox = useCallback(async (bboxStr) => {
    if (!bboxStr) return;

    setLoading(true);
    setError(null);
    try {
      const data = await api.getStoriesInBbox(bboxStr);
      setStories(data.stories);
    } catch (err) {
      console.error('Failed to fetch stories:', err);
      setError(err.message || 'Failed to load stories');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stories,
    loading,
    error,
    fetchStoriesInBbox,
    setStories,
  };
}

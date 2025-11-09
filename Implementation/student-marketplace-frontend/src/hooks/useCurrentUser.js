import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const useCurrentUser = () => {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const userId = await authAPI.getCurrentUserId();
        setCurrentUserId(userId);
      } catch (error) {
        console.error('Error getting current user:', error);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  return { currentUserId, loading };
};
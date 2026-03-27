import { useState } from 'react';
import { BASE_URL } from '../utils/api';

const API_BASE = `${BASE_URL}/api`;

export const useCaseTracking = (token) => {
  const [loadingActions, setLoadingActions] = useState(false);
  const [actionsError, setActionsError] = useState(null);

  const registerAction = async (actionData) => {
    setLoadingActions(true);
    setActionsError(null);
    try {
      const response = await fetch(`${API_BASE}/alerts/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(actionData)
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data;
    } catch (error) {
      setActionsError(error.message);
      console.error('Error registering action:', error);
      return { success: false, message: error.message };
    } finally {
      setLoadingActions(false);
    }
  };

  const fetchActions = async (alertId) => {
    if (!alertId) return [];
    setLoadingActions(true);
    setActionsError(null);
    try {
      const response = await fetch(`${API_BASE}/alerts/${alertId}/actions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) return data.actions;
      throw new Error(data.message);
    } catch (error) {
      setActionsError(error.message);
      console.error('Error fetching actions:', error);
      return [];
    } finally {
      setLoadingActions(false);
    }
  };

  return {
    registerAction,
    fetchActions,
    loadingActions,
    actionsError
  };
};

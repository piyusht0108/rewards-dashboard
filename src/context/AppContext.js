import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

// Create context
const AppContext = createContext();

// Initial state
const initialState = {
  users: [],
  activities: [],
  rewards: [],
  redemptions: [],
  loading: false,
  error: null,
  currentUser: null
};

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case 'FETCH_DATA_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_DATA_SUCCESS':
      return { 
        ...state, 
        [action.dataType]: action.payload,
        loading: false 
      };
    case 'FETCH_DATA_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'ADD_ACTIVITY':
      return { 
        ...state, 
        activities: [...state.activities, action.payload],
        users: state.users.map(user => 
          user.id === action.payload.userId 
            ? { ...user, points: user.points + action.payload.points } 
            : user
        )
      };
    case 'REDEEM_REWARD':
      const newRedemption = action.payload;
      const reward = state.rewards.find(r => r.id === newRedemption.rewardId);
      const pointCost = reward ? reward.pointCost : 0;
      
      return {
        ...state,
        redemptions: [...state.redemptions, newRedemption],
        users: state.users.map(user =>
          user.id === newRedemption.userId
            ? { ...user, points: user.points - pointCost }
            : user
        )
      };
    default:
      return state;
  }
}

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const API_URL = 'https://my-json-server.typicode.com/piyusht0108/rewards-dashboard';

  // Actions
  const fetchData = async (dataType) => {
    dispatch({ type: 'FETCH_DATA_START' });
    try {
      const response = await axios.get(`${API_URL}/${dataType}`);
      dispatch({ 
        type: 'FETCH_DATA_SUCCESS', 
        dataType, 
        payload: response.data 
      });
    } catch (error) {
      dispatch({ 
        type: 'FETCH_DATA_ERROR', 
        payload: error.message 
      });
    }
  };

  const setCurrentUser = (userId) => {
    const user = state.users.find(u => u.id === userId);
    dispatch({ type: 'SET_CURRENT_USER', payload: user });
  };

  const addActivity = async (activity) => {
    try {
      const response = await axios.post(`${API_URL}/activities`, activity);
      dispatch({ type: 'ADD_ACTIVITY', payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ type: 'FETCH_DATA_ERROR', payload: error.message });
      throw error;
    }
  };

  const redeemReward = async (redemption) => {
    try {
      const response = await axios.post(`${API_URL}/redemptions`, redemption);
      dispatch({ type: 'REDEEM_REWARD', payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ type: 'FETCH_DATA_ERROR', payload: error.message });
      throw error;
    }
  };

  // Load initial data
  useEffect(() => {
    fetchData('users');
    fetchData('activities');
    fetchData('rewards');
    fetchData('redemptions');
  }, []);

  // Set a default current user for testing
  useEffect(() => {
    if (state.users.length > 0 && !state.currentUser) {
      state.currentUser = state.users[0];
      dispatch({ type: 'SET_CURRENT_USER', payload: state.users[0] });
    }
  }, [state.users]);

  const contextValue = {
    ...state,
    fetchData,
    setCurrentUser,
    addActivity,
    redeemReward,
    currentUser: state.currentUser,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
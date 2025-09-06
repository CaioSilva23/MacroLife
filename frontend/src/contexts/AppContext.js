import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Estados iniciais
const initialState = {
  refeicoes: [],
  alimentos: [],
  currentDate: null, // Armazena a data atualmente sendo visualizada
  loading: {
    refeicoes: false,
    alimentos: false,
    deletando: null,
    criando: false,
  },
  cache: {
    refeicoes: {},
    alimentos: [],
    lastFetch: {
      refeicoes: null,
      alimentos: null,
    }
  },
  errors: {},
};

// Actions
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_REFEICOES: 'SET_REFEICOES',
  SET_ALIMENTOS: 'SET_ALIMENTOS',
  ADD_REFEICAO: 'ADD_REFEICAO',
  REMOVE_REFEICAO: 'REMOVE_REFEICAO',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_CACHE: 'UPDATE_CACHE',
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.key]: action.value,
        },
      };

    case ACTIONS.SET_REFEICOES:
      return {
        ...state,
        refeicoes: action.payload,
        currentDate: action.date, // Armazenar a data atual
        cache: {
          ...state.cache,
          refeicoes: {
            ...state.cache.refeicoes,
            [action.date]: action.payload,
          },
          lastFetch: {
            ...state.cache.lastFetch,
            refeicoes: new Date().getTime(),
          }
        },
      };

    case ACTIONS.SET_ALIMENTOS:
      return {
        ...state,
        alimentos: action.payload,
        cache: {
          ...state.cache,
          alimentos: action.payload,
          lastFetch: {
            ...state.cache.lastFetch,
            alimentos: new Date().getTime(),
          }
        },
      };

    case ACTIONS.ADD_REFEICAO:
      // Obter refeições existentes para a data
      const existingRefeicoes = state.cache.refeicoes[action.date] || [];
      const updatedRefeicoes = [...existingRefeicoes, action.payload];
      
      // Atualizar lista atual apenas se for a data que está sendo visualizada
      const newCurrentRefeicoes = state.currentDate === action.date 
        ? updatedRefeicoes 
        : state.refeicoes;
      
      return {
        ...state,
        refeicoes: newCurrentRefeicoes,
        cache: {
          ...state.cache,
          refeicoes: {
            ...state.cache.refeicoes,
            [action.date]: updatedRefeicoes,
          }
        },
      };

    case ACTIONS.REMOVE_REFEICAO:
      // Atualizar lista atual
      const filteredRefeicoes = state.refeicoes.filter(r => r.id !== action.id);
      
      // Atualizar cache para todas as datas
      const updatedCache = Object.keys(state.cache.refeicoes).reduce((acc, date) => {
        acc[date] = state.cache.refeicoes[date].filter(r => r.id !== action.id);
        return acc;
      }, {});
      
      return {
        ...state,
        refeicoes: filteredRefeicoes,
        cache: {
          ...state.cache,
          refeicoes: updatedCache,
        },
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.key]: action.error,
        },
      };

    case ACTIONS.CLEAR_ERROR:
      const { [action.key]: removed, ...remainingErrors } = state.errors;
      return {
        ...state,
        errors: remainingErrors,
      };

    default:
      return state;
  }
};

// Context
const AppContext = createContext();

// Provider
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Helper functions
  const setLoading = useCallback((key, value) => {
    dispatch({ type: ACTIONS.SET_LOADING, key, value });
  }, []);

  const setRefeicoes = useCallback((refeicoes, date) => {
    dispatch({ type: ACTIONS.SET_REFEICOES, payload: refeicoes, date });
  }, []);

  const setAlimentos = useCallback((alimentos) => {
    dispatch({ type: ACTIONS.SET_ALIMENTOS, payload: alimentos });
  }, []);

  const addRefeicao = useCallback((refeicao, date) => {
    dispatch({ type: ACTIONS.ADD_REFEICAO, payload: refeicao, date });
  }, []);

  const removeRefeicao = useCallback((id) => {
    dispatch({ type: ACTIONS.REMOVE_REFEICAO, id });
  }, []);

  const setError = useCallback((key, error) => {
    dispatch({ type: ACTIONS.SET_ERROR, key, error });
  }, []);

  const clearError = useCallback((key) => {
    dispatch({ type: ACTIONS.CLEAR_ERROR, key });
  }, []);

  // Cache helpers
  const isCacheValid = useCallback((key, maxAge = 5 * 60 * 1000) => { // 5 minutos
    const lastFetch = state.cache.lastFetch[key];
    if (!lastFetch) return false;
    return (new Date().getTime() - lastFetch) < maxAge;
  }, [state.cache.lastFetch]);

  const getCachedRefeicoes = useCallback((date) => {
    return state.cache.refeicoes[date] || null;
  }, [state.cache.refeicoes]);

  const getCachedAlimentos = useCallback(() => {
    return state.cache.alimentos;
  }, [state.cache.alimentos]);

  const value = {
    state,
    actions: {
      setLoading,
      setRefeicoes,
      setAlimentos,
      addRefeicao,
      removeRefeicao,
      setError,
      clearError,
    },
    cache: {
      isCacheValid,
      getCachedRefeicoes,
      getCachedAlimentos,
    },
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de AppProvider');
  }
  return context;
};

export default AppContext;

import axios from "axios";

// Configuração base da API
const API_BASE_URL = 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
});

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);




// Função helper para fazer requisições
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
};

// Serviços para Alimentos
export const alimentosService = {
  listar: (search = '') => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return api.get(`/alimentos/${params}`);
  },
};

// Serviços para Refeições
export const refeicoesService = {
  // Listar todas as refeições
  listar: (data) => {
    return api.get(`/refeicoes/?data=${data}`);
  },

  // Criar nova refeição
  criar: (data) => {
    return api.post('/refeicoes/', data);
  },

  // Deletar refeição
  deletar: (id) => {
    return api.delete(`/refeicoes/${id}/`);
  },
};

// Serviços para Usuários/Autenticação
export const userService = {
  // Registro de usuário
  register: (userData) => {
    return api.post('/auth/register/', userData);
  },

  // Login de usuário
  login: (credentials) => {
    return api.post('/auth/login/', credentials);
  },

  // Obter perfil do usuário
  profile: () => {
    return api.get('/auth/profile/');
  },

  // Alterar senha
  changePassword: (passwordData) => {
    return api.put('/auth/change-password/', passwordData);
  },

  // Reset de senha via email
  resetPassword: (email) => {
    return api.post('/auth/reset-password/', { email });
  },
};

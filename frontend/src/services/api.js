import axios from "axios";

// Configuração base da API
const API_BASE_URL = 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});




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
  listar: () => {
    return api.get('/refeicoes/');
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

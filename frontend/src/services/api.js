// Configuração base da API
const API_BASE_URL = 'http://localhost:8000/api';

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
  // Listar alimentos com busca opcional
  listar: (search = '') => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiRequest(`/alimentos/${params}`);
  },
};

// Serviços para Refeições
export const refeicoesService = {
  // Listar todas as refeições
  listar: () => {
    return apiRequest('/refeicoes/');
  },

  // Criar nova refeição
  criar: (dados) => {
    return apiRequest('/refeicoes/', {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  },

  // Deletar refeição
  deletar: (refeicaoId) => {
    return apiRequest('/refeicoes/', {
      method: 'DELETE',
      body: JSON.stringify({ refeicao_id: refeicaoId }),
    });
  },
};

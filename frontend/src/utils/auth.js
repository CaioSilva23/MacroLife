// Utilitários para autenticação
export const authUtils = {
  // Verificar se o usuário está logado
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Obter token do localStorage
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Salvar token no localStorage
  setToken: (token) => {
    localStorage.setItem('token', token);
  },

  // Remover token do localStorage
  removeToken: () => {
    localStorage.removeItem('token');
  },

  // Fazer logout
  logout: () => {
    localStorage.removeItem('token');
    // Redirecionar para login
    window.location.href = '/login';
  },

  // Obter dados do usuário do token (se usando JWT)
  getUserFromToken: () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      // Decodificar JWT (apenas para visualização, não para validação)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return null;
    }
  },

  // Obter dados do usuário atual (alias para getUserFromToken)
  getCurrentUser: () => {
    return authUtils.getUserFromToken();
  },

  // Verificar se o token está expirado
  isTokenExpired: () => {
    const user = authUtils.getUserFromToken();
    if (!user) return true;

    const currentTime = Date.now() / 1000;
    return user.exp < currentTime;
  }
};

export default authUtils;

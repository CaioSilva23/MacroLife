import React, { Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Box, CircularProgress, Fade } from '@mui/material';
import { AppProvider } from './contexts/AppContext';
import ListaRefeicoes from './components/Refeicoes/ListaRefeicoes';
import CadastroRefeicao from './components/Refeicoes/CadastroRefeicao';
import Login from './components/User/Login';
import Cadastro from './components/User/Cadastro';
import VerificacaoPerfil from './components/User/VerificacaoPerfil';
import ChatbotComponent from './components/Chatbot/ChatbotComponent';
import authUtils from './utils/auth';
import './App.css';

// Criar tema do Material-UI
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
    },
    secondary: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#F57C00',
    },
    warning: {
      main: '#FFC107',
      light: '#FFD54F',
      dark: '#FFA000',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#333333',
      secondary: 'rgba(51, 51, 51, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Componente de Loading mais suave
const PageLoader = () => (
  <Fade in timeout={300}>
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="60vh"
      flexDirection="column"
      gap={2}
    >
      <CircularProgress size={40} thickness={4} />
      <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
        Carregando...
      </Box>
    </Box>
  </Fade>
);

// Componente para proteger rotas que precisam de autenticação
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authUtils.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Componente para rotas públicas (redireciona se já estiver logado)
const PublicRoute = ({ children }) => {
  const isAuthenticated = authUtils.isAuthenticated();
  
  if (isAuthenticated) {
    return <Navigate to="/verificar-perfil" replace />;
  }
  
  return children;
};

function App() {
  const [chatbotOpen, setChatbotOpen] = useState(false);

  const handleChatbotOpen = () => {
    setChatbotOpen(true);
  };

  const handleChatbotClose = () => {
    setChatbotOpen(false);
  };
  return (
    <AppProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Rota raiz redireciona baseado na autenticação */}
              <Route 
                path="/" 
                element={
                  authUtils.isAuthenticated() 
                    ? <Navigate to="/verificar-perfil" replace />
                    : <Navigate to="/login" replace />
                } 
              />
              
              {/* Rotas públicas (apenas para usuários não logados) */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Fade in timeout={400}>
                      <Box>
                        <Login />
                      </Box>
                    </Fade>
                  </PublicRoute>
                } 
              />
              
              <Route 
                path="/cadastro" 
                element={
                  <PublicRoute>
                    <Fade in timeout={400}>
                      <Box>
                        <Cadastro />
                      </Box>
                    </Fade>
                  </PublicRoute>
                } 
              />
              
              {/* Rota de verificação de perfil */}
              <Route 
                path="/verificar-perfil" 
                element={
                  <ProtectedRoute>
                    <Fade in timeout={400}>
                      <Box>
                        <VerificacaoPerfil />
                      </Box>
                    </Fade>
                  </ProtectedRoute>
                } 
              />
              
              {/* Rotas protegidas (apenas para usuários logados) */}
              <Route 
                path="/refeicoes" 
                element={
                  <ProtectedRoute>
                    <Container maxWidth="lg" sx={{ py: 2 }}>
                      <Fade in timeout={400}>
                        <Box>
                          <ListaRefeicoes onChatbotOpen={handleChatbotOpen} />
                        </Box>
                      </Fade>
                    </Container>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/refeicoes/novo" 
                element={
                  <ProtectedRoute>
                    <Fade in timeout={400}>
                      <Box>
                        <CadastroRefeicao onChatbotOpen={handleChatbotOpen} />
                      </Box>
                    </Fade>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/refeicoes/editar/:id" 
                element={
                  <ProtectedRoute>
                    <Fade in timeout={400}>
                      <Box>
                        <CadastroRefeicao />
                      </Box>
                    </Fade>
                  </ProtectedRoute>
                } 
              />
              
              {/* Rota 404 - redireciona baseado na autenticação */}
              <Route 
                path="*" 
                element={
                  authUtils.isAuthenticated() 
                    ? <Navigate to="/verificar-perfil" replace />
                    : <Navigate to="/login" replace />
                } 
              />
            </Routes>
            
            {/* Chatbot disponível em todas as páginas para usuários logados */}
            {authUtils.isAuthenticated() && (
              <ChatbotComponent 
                open={chatbotOpen} 
                onClose={handleChatbotClose} 
              />
            )}
          </Suspense>
        </Router>
      </ThemeProvider>
    </AppProvider>
  );
}

export default App;

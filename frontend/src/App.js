import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Box, CircularProgress, Fade } from '@mui/material';
import { AppProvider } from './contexts/AppContext';
import ListaRefeicoes from './components/Refeicoes/ListaRefeicoes';
import CadastroRefeicao from './components/Refeicoes/CadastroRefeicao';
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

function App() {
  return (
    <AppProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Container maxWidth="lg" sx={{ py: 2 }}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Rota raiz redireciona para refeições */}
                <Route path="/" element={<Navigate to="/refeicoes" replace />} />
                
                {/* Rota para lista de refeições */}
                <Route 
                  path="/refeicoes" 
                  element={
                    <Fade in timeout={400}>
                      <Box>
                        <ListaRefeicoes />
                      </Box>
                    </Fade>
                  } 
                />
                
                {/* Rota para cadastro de refeição */}
                <Route 
                  path="/refeicoes/novo" 
                  element={
                    <Fade in timeout={400}>
                      <Box>
                        <CadastroRefeicao />
                      </Box>
                    </Fade>
                  } 
                />
                
                {/* Rota para edição de refeição (para futura implementação) */}
                <Route 
                  path="/refeicoes/editar/:id" 
                  element={
                    <Fade in timeout={400}>
                      <Box>
                        <CadastroRefeicao />
                      </Box>
                    </Fade>
                  } 
                />
                
                {/* Rota 404 - redireciona para refeições */}
                <Route path="*" element={<Navigate to="/refeicoes" replace />} />
              </Routes>
            </Suspense>
          </Container>
        </Router>
      </ThemeProvider>
    </AppProvider>
  );
}

export default App;

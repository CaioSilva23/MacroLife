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
    mode: 'dark',
    primary: {
      main: '#80EF80',
      dark: '#66CC66',
      light: '#99FF99',
    },
    secondary: {
      main: '#80EF80',
      dark: '#66CC66',
      light: '#99FF99',
    },
    background: {
      default: '#010409',
      paper: '#0D1117',
    },
    text: {
      primary: '#ffffff',
      secondary: '#80EF80',
    },
  },
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
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

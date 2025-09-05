import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  Typography,
  Container,
  Alert,
  Fade,
} from '@mui/material';
import { userService } from '../../services/api';
import PreenchimentoPerfil from './PreenchimentoPerfil';
import authUtils from '../../utils/auth';

const VerificacaoPerfil = () => {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(true);
  const [perfilCompleto, setPerfilCompleto] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    verificarStatusPerfil();
  }, []);

  const verificarStatusPerfil = async () => {
    try {
      // Verificar se usuário está autenticado
      if (!authUtils.isAuthenticated()) {
        navigate('/login');
        return;
      }

      // Buscar dados do perfil do usuário
      const response = await userService.profile();
      const perfil = response.data;

      // Verificar se o perfil está completo (status = true)
      if (perfil.status === true) {
        setPerfilCompleto(true);
        // Redirecionar para a tela principal
        navigate('/refeicoes');
      } else {
        // Perfil não está completo, mostrar tela de preenchimento
        setPerfilCompleto(false);
      }
      
    } catch (err) {
      console.error('Erro ao verificar perfil:', err);
      
      // Se erro 404 ou perfil não existe, mostrar preenchimento
      if (err.response?.status === 404) {
        setPerfilCompleto(false);
      } else {
        setErro(
          err.response?.data?.error || 
          err.response?.data?.detail || 
          'Erro ao carregar dados do perfil'
        );
      }
    } finally {
      setCarregando(false);
    }
  };

  // Tela de carregamento
  if (carregando) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Fade in timeout={300}>
          <Box 
            display="flex" 
            flexDirection="column"
            justifyContent="center" 
            alignItems="center" 
            minHeight="60vh"
            gap={3}
          >
            <CircularProgress size={60} thickness={4} sx={{ color: '#4CAF50' }} />
            <Typography variant="h6" color="text.secondary" textAlign="center">
              Verificando seu perfil...
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Aguarde enquanto carregamos suas informações
            </Typography>
          </Box>
        </Fade>
      </Container>
    );
  }

  // Tela de erro
  if (erro) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Fade in timeout={300}>
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 3,
              '& .MuiAlert-message': {
                width: '100%',
                textAlign: 'center'
              }
            }}
          >
            <Typography variant="h6" gutterBottom>
              Ops! Algo deu errado
            </Typography>
            <Typography variant="body2">
              {erro}
            </Typography>
          </Alert>
        </Fade>
      </Container>
    );
  }

  // Se perfil não está completo, mostrar componente de preenchimento
  if (!perfilCompleto) {
    return <PreenchimentoPerfil />;
  }

  // Se chegou aqui, o perfil está completo e já foi redirecionado
  return null;
};

export default VerificacaoPerfil;

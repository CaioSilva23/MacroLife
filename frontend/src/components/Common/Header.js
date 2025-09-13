import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Avatar,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Restaurant,
  Add,
  AccountCircle,
  Logout,
  Settings,
  SmartToy as ChatIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import authUtils from '../../utils/auth';
import Swal from 'sweetalert2';
import { userService } from '../../services/api';


export default function Header({ onNovaRefeicao, onChatbotOpen }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState({});

  // Obter usuário atual com fallback
  // const currentUser = await userService.profile();
  console.log('Usuário atual:', currentUser);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const user = await userService.profile();
      console.log('Usuário atual:', user);
      setCurrentUser(user.data);
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Sair do sistema?',
      text: 'Você será redirecionado para a tela de login',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, sair',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f44336',
    });

    if (result.isConfirmed) {
      authUtils.logout();
    }
    handleMenuClose();
  };

  return (
    <>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2, 
          background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)', 
          border: '1px solid #E0E0E0', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {/* Logo e Título */}
          <Box 
            display="flex" 
            alignItems="center" 
            gap={2} 
            sx={{ cursor: 'pointer' }} 
            onClick={() => navigate('/refeicoes')}
          >
            <Avatar sx={{ bgcolor: '#FFFFFF', color: '#4CAF50', width: 56, height: 56 }}>
              <Restaurant fontSize="large" />
            </Avatar>
            <Box>
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  color: '#FFFFFF', 
                  fontWeight: 'bold', 
                  letterSpacing: '-0.5px',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                NutriApp
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: '300' }}>
                Sua jornada nutricional personalizada
              </Typography>
            </Box>
          </Box>

          {/* Ações do Header */}
          <Box display="flex" alignItems="center" gap={2}>
            {/* Botão do Chatbot - DESTAQUE PRINCIPAL */}
            <Tooltip title="🤖 Assistente Nutricional IA - Tire suas dúvidas sobre nutrição!" placement="bottom">
              <IconButton
                onClick={() => {
                  console.log('Botão chatbot clicado!', typeof onChatbotOpen);
                  if (onChatbotOpen) {
                    onChatbotOpen();
                  } else {
                    console.error('onChatbotOpen não está definido!');
                  }
                }}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  width: 56,
                  height: 56,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                    transform: 'scale(1.1)',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)'
                  },
                  transition: 'all 0.3s ease',
                  animation: 'chatPulse 3s infinite',
                  position: 'relative'
                }}
              >
                <ChatIcon sx={{ fontSize: 28 }} />
                {/* Badge indicativo */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    width: 16,
                    height: 16,
                    bgcolor: '#FF4081',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: 'white',
                    animation: 'bounce 2s infinite'
                  }}
                >
                  AI
                </Box>
              </IconButton>
            </Tooltip>

            {/* Nova Refeição */}
            {/* <Button 
              variant="contained"
              onClick={onNovaRefeicao || (() => navigate('/refeicoes/novo'))}
              startIcon={<Add />}
              sx={{ 
                bgcolor: '#FFFFFF', 
                color: '#4CAF50',
                borderRadius: 2,
                fontWeight: 'bold',
                px: 3,
                py: 1,
                '&:hover': {
                  bgcolor: '#F5F5F5',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(255, 255, 255, 0.3)'
                },
                transition: 'all 0.3s ease',
                minWidth: '160px'
              }}
            >
              Nova Refeição
            </Button> */}

            {/* Notificações */}
            <Tooltip title="Notificações" placement="bottom">
              <IconButton sx={{ color: 'white' }}>
                <Badge badgeContent={0} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Menu do Usuário */}
            <IconButton
              onClick={handleMenuClick}
              sx={{ 
                color: 'white',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
            >
              <Avatar 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.3)',
                  width: 40,
                  height: 40
                }}
              >
                <AccountCircle />
              </Avatar>
            </IconButton>

            {/* Menu Dropdown */}
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  borderRadius: '12px',
                  minWidth: 200,
                  mt: 1,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                  overflow: 'hidden'
                }
              }}
            >
              <MenuItem disabled sx={{ bgcolor: '#f5f5f5' }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {currentUser.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {currentUser.email}
                  </Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                <ListItemText>Meu Perfil</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                <ListItemText>Configurações</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: '#f44336' }}>
                <ListItemIcon>
                  <Logout fontSize="small" sx={{ color: '#f44336' }} />
                </ListItemIcon>
                <ListItemText>Sair</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Paper>

      {/* Animações CSS */}
      <style>
        {`
          @keyframes chatPulse {
            0% {
              box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
            }
            50% {
              box-shadow: 0 0 0 15px rgba(255, 255, 255, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
            }
          }

          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-4px);
            }
            60% {
              transform: translateY(-2px);
            }
          }
        `}
      </style>
    </>
  );
}
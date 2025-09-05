
import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Restaurant,
  Add,
  AccountCircle,
  Logout,
  Settings,
} from '@mui/icons-material';
import authUtils from '../../utils/auth';
import Swal from 'sweetalert2';


export default function Header({ onNovaRefeicao }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

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
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)', border: '1px solid #E0E0E0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2} sx={{ cursor: 'pointer' }} onClick={() => navigate('/refeicoes')}>
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
          <Box display="flex" alignItems="center" gap={2}>
            <Button 
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
                transition: 'all 0.3s ease'
              }}
            >
              Nova Refeição
            </Button>
            
            {/* Menu do usuário */}
            <IconButton
              onClick={handleMenuClick}
              sx={{ 
                color: '#FFFFFF',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                }
              }}
            >
              <AccountCircle sx={{ fontSize: '1.8rem' }} />
            </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              <ListItemText>Meu Perfil</ListItemText>
            </MenuItem>
            <MenuItem>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText>Configurações</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <Logout fontSize="small" sx={{ color: 'error.main' }} />
              </ListItemIcon>
              <ListItemText>Sair</ListItemText>
            </MenuItem>
          </Menu>
          </Box>
        </Box>
      </Paper>
    </>
  );
}
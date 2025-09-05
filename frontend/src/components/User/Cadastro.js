import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Container,
  InputAdornment,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  Email,
  Lock,
  Person,
  Visibility,
  VisibilityOff,
  PersonAdd,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { api } from '../../services/api';
import Swal from 'sweetalert2';

const Cadastro = () => {
  const navigate = useNavigate();
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Manipular mudanças nos campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar erro quando o usuário começar a digitar
    if (error) setError('');
  };

  // Alternar visibilidade das senhas
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const togglePassword2Visibility = () => {
    setShowPassword2(!showPassword2);
  };

  // Validação da força da senha
  const validatePasswordStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    return { checks, score };
  };

  // Validar formulário
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    if (formData.name.trim().length < 2) {
      setError('Nome deve ter pelo menos 2 caracteres');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Digite um email válido');
      return false;
    }
    if (!formData.password.trim()) {
      setError('Senha é obrigatória');
      return false;
    }
    if (formData.password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return false;
    }
    if (!formData.password2.trim()) {
      setError('Confirmação de senha é obrigatória');
      return false;
    }
    if (formData.password !== formData.password2) {
      setError('As senhas não coincidem');
      return false;
    }
    return true;
  };

  // Submeter formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/register/', formData);
      
      if (response.data.token) {
        // Armazenar token no localStorage
        localStorage.setItem('token', response.data.token.access);
        
        // Configurar header de autorização para próximas requisições
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token.access}`;
        
        // Mostrar sucesso
        await Swal.fire({
          title: 'Sucesso!',
          text: 'Conta criada com sucesso! Bem-vindo(a)!',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });

        // Redirecionar para a página principal
        navigate('/');
      }
    } catch (err) {
      console.error('Erro no cadastro:', err);
      
      // Tratar diferentes tipos de erro
      if (err.response?.data?.email) {
        setError('Este email já está em uso');
      } else if (err.response?.data?.password) {
        setError('Senha não atende aos critérios de segurança');
      } else {
        setError(
          err.response?.data?.error || 
          err.response?.data?.detail || 
          'Erro ao criar conta. Tente novamente.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = validatePasswordStrength(formData.password);
  const passwordsMatch = formData.password2 && formData.password === formData.password2;

  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 4 }}>
      <Card elevation={6}>
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <PersonAdd color="primary" />
              <Typography variant="h4" component="h1" color="primary">
                Cadastro
              </Typography>
            </Box>
          }
          subheader="Crie sua conta para acessar o sistema de nutrição"
          sx={{ textAlign: 'center', pb: 1 }}
        />
        
        <CardContent sx={{ pt: 0 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              margin="normal"
              name="name"
              label="Nome Completo"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="name"
              autoFocus
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              margin="normal"
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              margin="normal"
              name="password"
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Indicador de força da senha */}
            {formData.password && (
              <Box sx={{ mt: 1, mb: 2 }}>
                <Typography variant="caption" gutterBottom>
                  Força da senha:
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(passwordStrength.score / 5) * 100}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: 'grey.300',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 
                        passwordStrength.score <= 2 ? 'error.main' :
                        passwordStrength.score <= 3 ? 'warning.main' :
                        passwordStrength.score <= 4 ? 'info.main' : 'success.main'
                    }
                  }}
                />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {Object.entries({
                    length: 'Min. 8 caracteres',
                    uppercase: 'Letra maiúscula',
                    lowercase: 'Letra minúscula',
                    number: 'Número',
                    special: 'Caracter especial'
                  }).map(([key, label]) => (
                    <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {passwordStrength.checks[key] ? (
                        <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                      ) : (
                        <Cancel sx={{ fontSize: 16, color: 'grey.400' }} />
                      )}
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: passwordStrength.checks[key] ? 'success.main' : 'grey.600' 
                        }}
                      >
                        {label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            <TextField
              fullWidth
              margin="normal"
              name="password2"
              label="Confirmar Senha"
              type={showPassword2 ? 'text' : 'password'}
              value={formData.password2}
              onChange={handleChange}
              required
              autoComplete="new-password"
              disabled={loading}
              error={formData.password2 && !passwordsMatch}
              helperText={
                formData.password2 && !passwordsMatch ? 'As senhas não coincidem' : ''
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePassword2Visibility}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword2 ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || !passwordsMatch || passwordStrength.score < 3}
              startIcon={loading ? <CircularProgress size={20} /> : <PersonAdd />}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </Button>

            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Já tem uma conta?{' '}
                <Link 
                  to="/login" 
                  style={{ 
                    color: 'inherit', 
                    textDecoration: 'none',
                    fontWeight: 'bold' 
                  }}
                >
                  Faça login aqui
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Cadastro;

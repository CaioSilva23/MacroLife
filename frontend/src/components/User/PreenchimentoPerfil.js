import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  Container,
  Fade,
  Grow,
  Slide,
  IconButton,
  Avatar,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  Person,
  Height,
  MonitorWeight,
  Cake,
  FitnessCenter,
  TrackChanges,
  CheckCircle,
  Wc,
} from '@mui/icons-material';
import { userService } from '../../services/api';
import Swal from 'sweetalert2';

const PreenchimentoPerfil = () => {
  const navigate = useNavigate();
  
  // Estado do formulário
  const [etapaAtual, setEtapaAtual] = useState(0);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [animacao, setAnimacao] = useState('entrada');
  
  const [dadosPerfil, setDadosPerfil] = useState({
    idade: '',
    peso: '',
    altura: '',
    sexo: '',
    nivel_atividade: '',
    objetivo: '',
  });

  // Configuração das etapas
  const etapas = [
    {
      titulo: 'Idade',
      subtitulo: 'Quantos anos você tem?',
      icone: <Cake />,
      campo: 'idade',
      tipo: 'number',
      placeholder: 'Ex: 25',
      sufixo: 'anos',
      validacao: (valor) => {
        const idade = parseInt(valor);
        if (!valor || isNaN(idade)) return 'Idade é obrigatória';
        if (idade < 13 || idade > 120) return 'Idade deve estar entre 13 e 120 anos';
        return null;
      }
    },
    {
      titulo: 'Peso',
      subtitulo: 'Qual é o seu peso atual?',
      icone: <MonitorWeight />,
      campo: 'peso',
      tipo: 'number',
      placeholder: 'Ex: 70.5',
      sufixo: 'kg',
      step: 0.1,
      validacao: (valor) => {
        const peso = parseFloat(valor);
        if (!valor || isNaN(peso)) return 'Peso é obrigatório';
        if (peso < 20 || peso > 300) return 'Peso deve estar entre 20 e 300 kg';
        return null;
      }
    },
    {
      titulo: 'Altura',
      subtitulo: 'Qual é a sua altura?',
      icone: <Height />,
      campo: 'altura',
      tipo: 'number',
      placeholder: 'Ex: 175',
      sufixo: 'cm',
      validacao: (valor) => {
        const altura = parseFloat(valor);
        if (!valor || isNaN(altura)) return 'Altura é obrigatória';
        if (altura < 100 || altura > 250) return 'Altura deve estar entre 100 e 250 cm';
        return null;
      }
    },
    {
      titulo: 'Sexo',
      subtitulo: 'Qual é o seu sexo?',
      icone: <Wc />,
      campo: 'sexo',
      tipo: 'radio',
      opcoes: [
        { valor: 'M', label: 'Masculino' },
        { valor: 'F', label: 'Feminino' },
      ],
      validacao: (valor) => {
        if (!valor) return 'Sexo é obrigatório';
        return null;
      }
    },
    {
      titulo: 'Nível de Atividade',
      subtitulo: 'Com que frequência você se exercita?',
      icone: <FitnessCenter />,
      campo: 'nivel_atividade',
      tipo: 'select',
      opcoes: [
        { valor: 'sedentario', label: 'Sedentário (pouco ou nenhum exercício)' },
        { valor: 'leve', label: 'Levemente ativo (1-3x por semana)' },
        { valor: 'moderado', label: 'Moderadamente ativo (3-5x por semana)' },
        { valor: 'alto', label: 'Muito ativo (6-7x por semana)' },
        { valor: 'extremo', label: 'Extremamente ativo (atleta profissional)' },
      ],
      validacao: (valor) => {
        if (!valor) return 'Nível de atividade é obrigatório';
        return null;
      }
    },
    {
      titulo: 'Objetivo',
      subtitulo: 'Qual é o seu objetivo principal?',
      icone: <TrackChanges />,
      campo: 'objetivo',
      tipo: 'radio',
      opcoes: [
        { valor: 'emagrecer', label: 'Emagrecer' },
        { valor: 'manter', label: 'Manter peso atual' },
        { valor: 'ganhar', label: 'Ganhar peso/massa muscular' },
      ],
      validacao: (valor) => {
        if (!valor) return 'Objetivo é obrigatório';
        return null;
      }
    },
  ];

  const etapaAtualConfig = etapas[etapaAtual];
  const progresso = ((etapaAtual + 1) / etapas.length) * 100;

  // Função para validar etapa atual
  const validarEtapaAtual = () => {
    const etapa = etapas[etapaAtual];
    const valor = dadosPerfil[etapa.campo];
    return etapa.validacao(valor);
  };

  // Função para avançar etapa
  const proximaEtapa = () => {
    const erro = validarEtapaAtual();
    if (erro) {
      setErro(erro);
      return;
    }

    setErro('');
    setAnimacao('saida');
    
    setTimeout(() => {
      setEtapaAtual(prev => prev + 1);
      setAnimacao('entrada');
    }, 200);
  };

  // Função para voltar etapa
  const etapaAnterior = () => {
    setErro('');
    setAnimacao('saida');
    
    setTimeout(() => {
      setEtapaAtual(prev => prev - 1);
      setAnimacao('entrada');
    }, 200);
  };

  // Função para atualizar dados
  const atualizarDados = (campo, valor) => {
    setDadosPerfil(prev => ({
      ...prev,
      [campo]: valor
    }));
    setErro('');
  };

  // Função para finalizar configuração
  const finalizarConfiguracao = async () => {
    const erro = validarEtapaAtual();
    if (erro) {
      setErro(erro);
      return;
    }

    setLoading(true);
    try {
      // Converter dados para o formato correto
      const dadosFormatados = {
        idade: parseInt(dadosPerfil.idade),
        peso: parseFloat(dadosPerfil.peso),
        altura: parseFloat(dadosPerfil.altura),
        sexo: dadosPerfil.sexo,
        nivel_atividade: dadosPerfil.nivel_atividade,
        objetivo: dadosPerfil.objetivo,
      };

      await userService.updateProfile(dadosFormatados);
      
      // Mostrar sucesso
      await Swal.fire({
        title: 'Perfil Configurado!',
        text: 'Seus dados foram salvos e seus macros nutricionais foram calculados.',
        icon: 'success',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#4CAF50',
      });

      // Redirecionar para a tela principal
      navigate('/refeicoes');
      
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
      setErro(
        err.response?.data?.error || 
        err.response?.data?.detail || 
        'Erro ao salvar perfil. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Renderizar campo da etapa atual
  const renderizarCampo = () => {
    const etapa = etapaAtualConfig;
    const valor = dadosPerfil[etapa.campo];

    switch (etapa.tipo) {
      case 'number':
        return (
          <TextField
            fullWidth
            type="number"
            value={valor}
            onChange={(e) => atualizarDados(etapa.campo, e.target.value)}
            placeholder={etapa.placeholder}
            variant="outlined"
            size="large"
            inputProps={{
              step: etapa.step || 1,
              min: 0,
            }}
            InputProps={{
              endAdornment: etapa.sufixo && (
                <Typography variant="body1" color="text.secondary" sx={{ ml: 1 }}>
                  {etapa.sufixo}
                </Typography>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                fontSize: '1.2rem',
                '& fieldset': {
                  borderColor: '#E0E0E0',
                  borderWidth: 2,
                },
                '&:hover fieldset': {
                  borderColor: '#4CAF50',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#4CAF50',
                },
              },
              '& .MuiOutlinedInput-input': {
                textAlign: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#4CAF50',
              }
            }}
          />
        );

      case 'radio':
        return (
          <FormControl component="fieldset">
            <RadioGroup
              value={valor}
              onChange={(e) => atualizarDados(etapa.campo, e.target.value)}
              sx={{ gap: 2 }}
            >
              {etapa.opcoes.map((opcao) => (
                <Paper
                  key={opcao.valor}
                  elevation={valor === opcao.valor ? 4 : 1}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: valor === opcao.valor ? '2px solid #4CAF50' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      elevation: 3,
                      borderColor: '#4CAF50',
                    }
                  }}
                  onClick={() => atualizarDados(etapa.campo, opcao.valor)}
                >
                  <FormControlLabel
                    value={opcao.valor}
                    control={
                      <Radio
                        sx={{
                          color: '#4CAF50',
                          '&.Mui-checked': {
                            color: '#4CAF50',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body1" fontWeight={valor === opcao.valor ? 'bold' : 'normal'}>
                        {opcao.label}
                      </Typography>
                    }
                    sx={{ margin: 0, width: '100%' }}
                  />
                </Paper>
              ))}
            </RadioGroup>
          </FormControl>
        );

      case 'select':
        return (
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#4CAF50' }}>Selecione uma opção</InputLabel>
            <Select
              value={valor}
              onChange={(e) => atualizarDados(etapa.campo, e.target.value)}
              label="Selecione uma opção"
              sx={{
                borderRadius: 3,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#E0E0E0',
                  borderWidth: 2,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#4CAF50',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#4CAF50',
                },
              }}
            >
              {etapa.opcoes.map((opcao) => (
                <MenuItem key={opcao.valor} value={opcao.valor}>
                  {opcao.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      {/* Header com Progresso */}
      <Card elevation={0} sx={{ mb: 4, bgcolor: 'transparent' }}>
        <CardContent sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
            Complete seu Perfil
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Vamos personalizar sua experiência nutricional
          </Typography>
          
          {/* Barra de Progresso */}
          <Box sx={{ mb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Etapa {etapaAtual + 1} de {etapas.length}
              </Typography>
              <Typography variant="body2" color="primary" fontWeight="bold">
                {Math.round(progresso)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progresso}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#4CAF50',
                  borderRadius: 4,
                },
              }}
            />
          </Box>

          {/* Mini Stepper */}
          <Box display="flex" justifyContent="center" gap={1} mt={2}>
            {etapas.map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: index <= etapaAtual ? '#4CAF50' : '#E0E0E0',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Card Principal da Etapa */}
      <Slide
        direction={animacao === 'entrada' ? 'left' : 'right'}
        in={animacao === 'entrada'}
        timeout={300}
      >
        <Card elevation={8} sx={{ borderRadius: 4, overflow: 'visible' }}>
          <CardContent sx={{ p: 4 }}>
            {/* Ícone e Título da Etapa */}
            <Box textAlign="center" mb={4}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 2,
                  backgroundColor: '#4CAF50',
                  color: 'white',
                }}
              >
                {React.cloneElement(etapaAtualConfig.icone, { sx: { fontSize: 40 } })}
              </Avatar>
              
              <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
                {etapaAtualConfig.titulo}
              </Typography>
              
              <Typography variant="body1" color="text.secondary">
                {etapaAtualConfig.subtitulo}
              </Typography>
            </Box>

            {/* Campo da Etapa */}
            <Box mb={3}>
              {renderizarCampo()}
            </Box>

            {/* Mensagem de Erro */}
            {erro && (
              <Fade in>
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {erro}
                </Alert>
              </Fade>
            )}

            {/* Botões de Navegação */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={etapaAnterior}
                disabled={etapaAtual === 0 || loading}
                sx={{
                  borderRadius: 3,
                  px: 3,
                  borderColor: '#4CAF50',
                  color: '#4CAF50',
                  '&:hover': {
                    borderColor: '#388E3C',
                    backgroundColor: 'rgba(76, 175, 80, 0.04)',
                  },
                }}
              >
                Voltar
              </Button>

              {etapaAtual < etapas.length - 1 ? (
                <Button
                  variant="contained"
                  endIcon={<ArrowForward />}
                  onClick={proximaEtapa}
                  disabled={loading}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    backgroundColor: '#4CAF50',
                    '&:hover': {
                      backgroundColor: '#388E3C',
                    },
                  }}
                >
                  Próximo
                </Button>
              ) : (
                <Button
                  variant="contained"
                  endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                  onClick={finalizarConfiguracao}
                  disabled={loading}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    backgroundColor: '#4CAF50',
                    '&:hover': {
                      backgroundColor: '#388E3C',
                    },
                  }}
                >
                  {loading ? 'Salvando...' : 'Finalizar'}
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Slide>
    </Container>
  );
};

export default PreenchimentoPerfil;

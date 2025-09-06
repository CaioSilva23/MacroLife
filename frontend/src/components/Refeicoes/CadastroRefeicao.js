import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { CadastroSkeleton } from '../Common/Skeletons';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  Grid,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Stack,
  Avatar,
  InputAdornment,
  Container,
  IconButton,
  Tooltip,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Restaurant,
  Add,
  Delete,
  Save,
  ArrowBack,
  LocalDining,
  Scale,
  Search,
  Kitchen,
} from '@mui/icons-material';
import { alimentosService, refeicoesService } from '../../services/api';
import Swal from "sweetalert2";

const CadastroRefeicao = ({ onChatbotOpen }) => {
  const navigate = useNavigate();
  const { state, actions, cache } = useApp();
  
  // Estados locais do formulário
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [alimentoSelecionado, setAlimentoSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState('');
  const [itensRefeicao, setItensRefeicao] = useState([]);
  const [busca, setBusca] = useState('');

  // Estados do contexto
  const { alimentos } = state;
  const { loading, errors } = state;
  const loadingAlimentos = loading.alimentos;
  const loadingCriando = loading.criando;
  const error = errors.cadastro;

  // Carregar alimentos ao montar o componente
  useEffect(() => {
    carregarAlimentos();
  }, []);

  // Buscar alimentos quando a busca mudar
  useEffect(() => {
    if (busca.length >= 2) {
      carregarAlimentos(busca);
    } else if (busca.length === 0) {
      carregarAlimentos();
    }
  }, [busca]);

  const carregarAlimentos = useCallback(async (termoBusca = '') => {
    // Verificar cache para busca vazia
    if (!termoBusca) {
      const cached = cache.getCachedAlimentos();
      if (cached.length > 0 && cache.isCacheValid('alimentos')) {
        actions.setAlimentos(cached);
        return;
      }
    }

    try {
      actions.setLoading('alimentos', true);
      const dados = await alimentosService.listar(termoBusca);
      actions.setAlimentos(dados.data);
    } catch (err) {
      console.error('Erro ao carregar alimentos:', err);
      actions.setError('cadastro', 'Erro ao carregar alimentos: ' + err.message);
    } finally {
      actions.setLoading('alimentos', false);
    }
  }, [actions, cache]);

  const adicionarItem = () => {
    if (!alimentoSelecionado || !quantidade || quantidade <= 0) {
      actions.setError('cadastro', 'Selecione um alimento e informe uma quantidade válida');
      return;
    }

    // Verificar se o alimento já foi adicionado
    const jaAdicionado = itensRefeicao.find(item => item.alimento.id === alimentoSelecionado.id);
    if (jaAdicionado) {
      actions.setError('cadastro', 'Este alimento já foi adicionado à refeição');
      return;
    }

    const novoItem = {
      alimento: alimentoSelecionado,
      quantidade_g: parseFloat(quantidade),
      kcal_total: (alimentoSelecionado.energia_kcal / 100) * parseFloat(quantidade),
      carbo_total: (alimentoSelecionado.carboidratos_g / 100) * parseFloat(quantidade),
      proteina_total: (alimentoSelecionado.proteinas_g / 100) * parseFloat(quantidade),
      gordura_total: (alimentoSelecionado.lipideos_g / 100) * parseFloat(quantidade),
    };

    setItensRefeicao([...itensRefeicao, novoItem]);
    setAlimentoSelecionado(null);
    setQuantidade('');
    actions.clearError('cadastro');
  };

  const removerItem = (index) => {
    const novosItens = itensRefeicao.filter((_, i) => i !== index);
    setItensRefeicao(novosItens);
  };

  const calcularTotais = () => {
    return itensRefeicao.reduce((totais, item) => ({
      kcal: totais.kcal + item.kcal_total,
      carbo: totais.carbo + item.carbo_total,
      proteina: totais.proteina + item.proteina_total,
      gordura: totais.gordura + item.gordura_total,
    }), { kcal: 0, carbo: 0, proteina: 0, gordura: 0 });
  };

  const salvarRefeicao = useCallback(async () => {
    if (!nome.trim()) {
      actions.setError('cadastro', 'Nome da refeição é obrigatório');
      return;
    }

    if (itensRefeicao.length === 0) {
      actions.setError('cadastro', 'Adicione pelo menos um alimento à refeição');
      return;
    }

    try {
      actions.setLoading('criando', true);
      actions.clearError('cadastro');

      const dadosRefeicao = {
        nome: nome.trim(),
        descricao: descricao.trim(),
        itens: itensRefeicao.map(item => ({
          alimento_id: item.alimento.id,
          quantidade_g: item.quantidade_g,
        })),
      };

      const response = await refeicoesService.criar(dadosRefeicao);
      
      // Adicionar a nova refeição ao cache
      const hoje = new Date().toISOString().split('T')[0];
      actions.addRefeicao(response.data, hoje);
      
      Swal.fire("Sucesso", "A refeição foi criada com sucesso!", "success");

      setTimeout(() => {
        navigate('/refeicoes');
      }, 1500);
      
    } catch (err) {
      Swal.fire("Erro!", "Erro ao tentar criar a refeição, tente novamente.", "error");
      actions.setError('cadastro', 'Erro ao criar refeição: ' + err.message);
    } finally {
      actions.setLoading('criando', false);
    }
  }, [nome, descricao, itensRefeicao, actions, navigate]);

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)', border: '1px solid #E0E0E0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" >
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: '#FFFFFF', color: '#4CAF50', width: 64, height: 64 }}>
              <Restaurant fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" sx={{ color: '#FFFFFF', fontWeight: 'bold', mb: 1 }}>
                Nova Refeição
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2 }}>
                Monte sua refeição personalizada
              </Typography>
              {/* Indicador de progresso */}
              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                <Chip 
                  size="small" 
                  label={nome ? '✓ Nome definido' : '1. Nome da refeição'} 
                  sx={{ 
                    bgcolor: nome ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255,255,255,0.2)', 
                    color: '#FFC107',
                    border: '1px solid #FFC107',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}
                />
                <Chip 
                  size="small" 
                  label={itensRefeicao.length > 0 ? `✓ ${itensRefeicao.length} alimentos` : '2. Adicionar alimentos'} 
                  sx={{ 
                    bgcolor: itensRefeicao.length > 0 ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255,255,255,0.2)', 
                    color: '#FFC107',
                    border: '1px solid #FFC107',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}
                />
              </Stack>
            </Box>
          </Box>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/refeicoes')}
            startIcon={<ArrowBack />}
            size="large"
            sx={{ 
              color: '#FFFFFF', 
              borderColor: '#FFFFFF',
              borderRadius: 2,
              fontWeight: '500',
              '&:hover': {
                borderColor: '#FFC107',
                backgroundColor: 'rgba(255, 193, 7, 0.1)'
              }
            }}
          >
            Voltar
          </Button>
        </Box>
      </Paper>

      {/* Alertas */}
      {error && (
        <Fade in>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }} onClose={() => actions.clearError('cadastro')}>
            {error}
          </Alert>
        </Fade>
      )}

      <Grid container spacing={4}>
        {/* Formulário Unificado - Informações da Refeição e Adicionar Alimentos */}
        <Grid item xs={12}>
          <Card elevation={2} sx={{ borderRadius: 2, border: '1px solid #E0E0E0', overflow: 'hidden', bgcolor: '#FFFFFF', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: '#4CAF50', color: '#FFFFFF', width: 48, height: 48 }}>
                  <Restaurant />
                </Avatar>
              }
              title="Configurar Refeição"
              subheader="Defina as informações básicas e adicione alimentos à sua refeição"
              titleTypographyProps={{ variant: 'h5', fontWeight: '700', color: '#333333' }}
              subheaderTypographyProps={{ variant: 'body2', color: 'rgba(51,51,51,0.7)', mt: 0.5 }}
              sx={{ pb: 2, background: 'linear-gradient(135deg, #F5F5F5 0%, #E8F5E8 100%)', borderBottom: '1px solid #E0E0E0' }}
            />
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={4}>
                {/* Seção: Informações Básicas */}
                <Grid item xs={12}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ color: '#333333', fontWeight: '600', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalDining fontSize="small" />
                      Informações da Refeição
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Nome da Refeição *"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          required
                          variant="outlined"
                          size="medium"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Kitchen color="action" fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                          placeholder="Ex: Café da manhã, Almoço..."
                          helperText="Nome obrigatório para a refeição"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #E0E0E0',
                              color: '#333333',
                              height: 56,
                              '&:hover': {
                                backgroundColor: '#FFFFFF',
                                borderColor: '#4CAF50',
                              },
                              '&.Mui-focused': {
                                backgroundColor: '#FFFFFF',
                                borderColor: '#4CAF50',
                              }
                            },
                            '& .MuiInputLabel-root': {
                              color: '#4CAF50',
                            },
                            '& .MuiFormHelperText-root': {
                              color: 'rgba(51,51,51,0.7)',
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Descrição (opcional)"
                          value={descricao}
                          onChange={(e) => setDescricao(e.target.value)}
                          variant="outlined"
                          size="medium"
                          placeholder="Adicione detalhes sobre a refeição..."
                          helperText="Adicione detalhes sobre a refeição"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #E0E0E0',
                              color: '#333333',
                              height: 56,
                              '&:hover': {
                                backgroundColor: '#FFFFFF',
                                borderColor: '#4CAF50',
                              },
                              '&.Mui-focused': {
                                backgroundColor: '#FFFFFF',
                                borderColor: '#4CAF50',
                              }
                            },
                            '& .MuiInputLabel-root': {
                              color: '#4CAF50',
                            },
                            '& .MuiFormHelperText-root': {
                              color: 'rgba(51,51,51,0.7)',
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>

                {/* Divisor Visual */}
                {/* <Grid item xs={12}>
                  <Divider sx={{ my: 2, borderColor: '#e0e0e0' }}>
                    <Chip 
                      icon={<Add />} 
                      label="Adicionar Alimentos" 
                      size="medium" 
                      sx={{ 
                        bgcolor: '#ff9800', 
                        color: 'white', 
                        fontWeight: '600',
                        '& .MuiChip-icon': {
                          color: 'white'
                        }
                      }} 
                    />
                  </Divider>
                </Grid> */}

                {/* Seção: Adicionar Alimentos */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: '#333333', fontWeight: '600', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Add fontSize="small" />
                    Adicionar Alimentos
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} lg={8}>
                      <Autocomplete
                        value={alimentoSelecionado}
                        onChange={(event, newValue) => setAlimentoSelecionado(newValue)}
                        onInputChange={(event, newInputValue) => setBusca(newInputValue)}
                        options={alimentos}
                        getOptionLabel={(option) => option.nome || ''}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        loading={loadingAlimentos}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Buscar Alimento"
                            fullWidth
                            variant="outlined"
                            size="medium"
                            placeholder="Digite pelo menos 2 caracteres para buscar..."
                            helperText="Digite pelo menos 2 caracteres para buscar"
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Search color="action" />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <>
                                  {loadingAlimentos && <CircularProgress color="inherit" size={20} />}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #E0E0E0',
                                color: '#333333',
                                height: 56,
                                '&:hover': {
                                  backgroundColor: '#FFFFFF',
                                  borderColor: '#4CAF50',
                                },
                                '&.Mui-focused': {
                                  backgroundColor: '#FFFFFF',
                                  borderColor: '#4CAF50',
                                }
                              },
                              '& .MuiInputLabel-root': {
                                color: '#4CAF50',
                              },
                              '& .MuiFormHelperText-root': {
                                color: 'rgba(51,51,51,0.7)',
                              }
                            }}
                          />
                        )}
                        renderOption={(props, option) => (
                          <Box component="li" {...props} sx={{ bgcolor: '#FFFFFF', color: '#333333' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', py: 1 }}>
                              <Avatar sx={{ width: 40, height: 40, bgcolor: '#4CAF50', color: '#FFFFFF' }}>
                                <Kitchen fontSize="small" />
                              </Avatar>
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body1" fontWeight="medium" color="#333333">
                                  {option.nome}
                                </Typography>
                                <Typography variant="caption" color="rgba(51,51,51,0.7)">
                                  {option.energia_kcal} kcal • {option.proteinas_g}g prot • {option.carboidratos_g}g carbo
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        )}
                        ListboxProps={{
                          style: {
                            maxHeight: '300px',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E0E0E0',
                          }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} lg={4}>
                      <TextField
                        fullWidth
                        label="Quantidade"
                        type="number"
                        value={quantidade}
                        onChange={(e) => setQuantidade(e.target.value)}
                        inputProps={{ min: 0, step: 1 }}
                        variant="outlined"
                        size="medium"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Scale sx={{ color: '#4CAF50' }} fontSize="small" />
                            </InputAdornment>
                          ),
                          endAdornment: <InputAdornment position="end" sx={{ color: 'rgba(51,51,51,0.7)' }}>gramas</InputAdornment>,
                        }}
                        placeholder="Ex: 100"
                        helperText="Quantidade em gramas"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E0E0E0',
                            color: '#333333',
                            height: 56,
                            '&:hover': {
                              backgroundColor: '#FFFFFF',
                              borderColor: '#4CAF50',
                            },
                            '&.Mui-focused': {
                              backgroundColor: '#FFFFFF',
                              borderColor: '#4CAF50',
                            }
                          },
                          '& .MuiInputLabel-root': {
                            color: '#4CAF50',
                          },
                          '& .MuiFormHelperText-root': {
                            color: 'rgba(51,51,51,0.7)',
                          }
                        }}
                      />
                    </Grid>
                    
                    {/* Botão Adicionar em linha separada, alinhado à direita */}
                    <Grid item xs={12}>
                      <Box display="flex" justifyContent="flex-end" mt={2}>
                        <Button
                          variant="contained"
                          onClick={adicionarItem}
                          disabled={!alimentoSelecionado || !quantidade || quantidade <= 0}
                          startIcon={<Add />}
                          size="large"
                          sx={{ 
                            height: 56,
                            borderRadius: 2,
                            minWidth: 200,
                            background: !alimentoSelecionado || !quantidade || quantidade <= 0
                              ? 'rgba(76, 175, 80, 0.3)'
                              : '#4CAF50',
                            boxShadow: !alimentoSelecionado || !quantidade || quantidade <= 0
                              ? 'none'
                              : '0 4px 12px 2px rgba(76, 175, 80, .3)',
                            color: !alimentoSelecionado || !quantidade || quantidade <= 0
                              ? '#999999'
                              : '#FFFFFF',
                            fontWeight: '600',
                            '&:hover': {
                              background: !alimentoSelecionado || !quantidade || quantidade <= 0
                                ? 'rgba(76, 175, 80, 0.3)'
                                : '#388E3C',
                              boxShadow: !alimentoSelecionado || !quantidade || quantidade <= 0
                                ? 'none'
                                : '0 6px 16px 2px rgba(56, 142, 60, .4)',
                            },
                            '&:disabled': {
                              background: 'rgba(76, 175, 80, 0.3)',
                              color: '#999999',
                              boxShadow: 'none',
                            }
                          }}
                        >
                          ADICIONAR
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Lista de Alimentos Adicionados */}
        <Grid item xs={12}>
          <Card elevation={1} sx={{ borderRadius: 2, border: '1px solid #E0E0E0', bgcolor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: '#4CAF50', color: '#FFFFFF', width: 48, height: 48 }}>
                  <Restaurant />
                </Avatar>
              }
              title={`Alimentos da Refeição (${itensRefeicao.length})`}
              subheader={
                itensRefeicao.length > 0 ? (
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                    <Chip 
                      label={`${calcularTotais().kcal.toFixed(0)} kcal`} 
                      size="small" 
                      sx={{ bgcolor: 'rgba(76, 175, 80, 0.2)', color: '#4CAF50', border: '1px solid #4CAF50' }}
                    />
                    <Chip 
                      label={`${calcularTotais().carbo.toFixed(1)}g carbo`} 
                      size="small" 
                      sx={{ bgcolor: 'rgba(255, 152, 0, 0.1)', color: '#FF9800', border: '1px solid rgba(255, 152, 0, 0.5)' }}
                    />
                    <Chip 
                      label={`${calcularTotais().proteina.toFixed(1)}g prot`} 
                      size="small" 
                      sx={{ bgcolor: 'rgba(255, 193, 7, 0.1)', color: '#FFC107', border: '1px solid rgba(255, 193, 7, 0.5)' }}
                    />
                    <Chip 
                      label={`${calcularTotais().gordura.toFixed(1)}g gord`} 
                      size="small" 
                      sx={{ bgcolor: 'rgba(255, 152, 0, 0.1)', color: '#FF9800', border: '1px solid rgba(255, 152, 0, 0.5)' }}
                    />
                  </Box>
                ) : 'Adicione alimentos para ver o resumo nutricional'
              }
              titleTypographyProps={{ variant: 'h6', fontWeight: '600', color: '#333333' }}
              subheaderTypographyProps={{ color: 'rgba(51,51,51,0.7)' }}
              sx={{ pb: 1 }}
            />
            <CardContent sx={{ pt: 0, px: 3, pb: 3 }}>
              {itensRefeicao.length === 0 ? (
                <Box textAlign="center" py={6}>
                  <Avatar sx={{ 
                    width: 80, 
                    height: 80, 
                    mx: 'auto', 
                    mb: 3, 
                    bgcolor: '#FFC107',
                    color: '#333333'
                  }}>
                    <Restaurant fontSize="large" />
                  </Avatar>
                  <Typography variant="h6" color="#FFC107" gutterBottom fontWeight="500">
                    Nenhum alimento adicionado
                  </Typography>
                  <Typography variant="body2" color="#666666" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                    Use o formulário acima para adicionar alimentos à sua refeição
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <Chip icon={<Search />} label="Busque alimentos" variant="outlined" size="medium" 
                          sx={{ color: '#FFC107', borderColor: '#FFC107' }} />
                    <Chip icon={<Scale />} label="Defina quantidades" variant="outlined" size="medium" 
                          sx={{ color: '#FFC107', borderColor: '#FFC107' }} />
                    <Chip icon={<Add />} label="Adicione à refeição" variant="outlined" size="medium" 
                          sx={{ color: '#FFC107', borderColor: '#FFC107' }} />
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                  {/* Layout Mobile - Cards */}
                  <Grid container spacing={2}>
                    {itensRefeicao.map((item, index) => (
                      <Grid item xs={12} key={index}>
                        <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: '#FFFFFF', border: '1px solid #FFC107' }}>
                          <CardContent sx={{ p: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                              <Box display="flex" alignItems="center" gap={1.5} flex={1}>
                                <Avatar sx={{ width: 40, height: 40, bgcolor: '#FFC107', color: '#333333' }}>
                                  <Kitchen fontSize="small" />
                                </Avatar>
                                <Box flex={1}>
                                  <Typography variant="body1" fontWeight="600" noWrap color="#333333">
                                    {item.alimento.nome}
                                  </Typography>
                                  <Typography variant="caption" color="#666666">
                                    {item.quantidade_g}g
                                  </Typography>
                                </Box>
                              </Box>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removerItem(index)}
                                sx={{ ml: 1 }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Box>
                            <Grid container spacing={1}>
                              <Grid item xs={3}>
                                <Box textAlign="center">
                                  <Typography variant="h6" color="#FFC107" fontWeight="bold">
                                    {item.kcal_total.toFixed(0)}
                                  </Typography>
                                  <Typography variant="caption" color="#666666">
                                    kcal
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={3}>
                                <Box textAlign="center">
                                  <Typography variant="h6" color="#FFC107" fontWeight="bold">
                                    {item.carbo_total.toFixed(1)}
                                  </Typography>
                                  <Typography variant="caption" color="#666666">
                                    carbo
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={3}>
                                <Box textAlign="center">
                                  <Typography variant="h6" color="#FFC107" fontWeight="bold">
                                    {item.proteina_total.toFixed(1)}
                                  </Typography>
                                  <Typography variant="caption" color="#666666">
                                    prot
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={3}>
                                <Box textAlign="center">
                                  <Typography variant="h6" color="#FFC107" fontWeight="bold">
                                    {item.gordura_total.toFixed(1)}
                                  </Typography>
                                  <Typography variant="caption" color="#666666">
                                    gord
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Layout Desktop - Tabela */}
              {itensRefeicao.length > 0 && (
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, border: '1px solid #FFC107', boxShadow: 'none', bgcolor: '#FFFFFF' }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#F5F5F5' }}>
                          <TableCell sx={{ fontWeight: '600', color: '#FFC107', fontSize: '0.875rem', py: 2, borderBottom: '1px solid #FFC107' }}>Alimento</TableCell>
                          <TableCell align="center" sx={{ fontWeight: '600', color: '#FFC107', fontSize: '0.875rem', py: 2, borderBottom: '1px solid #FFC107' }}>Quantidade</TableCell>
                          <TableCell align="center" sx={{ fontWeight: '600', color: '#FFC107', fontSize: '0.875rem', py: 2, borderBottom: '1px solid #FFC107' }}>Calorias</TableCell>
                          <TableCell align="center" sx={{ fontWeight: '600', color: '#FFC107', fontSize: '0.875rem', py: 2, borderBottom: '1px solid #FFC107' }}>Carbo</TableCell>
                          <TableCell align="center" sx={{ fontWeight: '600', color: '#FFC107', fontSize: '0.875rem', py: 2, borderBottom: '1px solid #FFC107' }}>Proteína</TableCell>
                          <TableCell align="center" sx={{ fontWeight: '600', color: '#FFC107', fontSize: '0.875rem', py: 2, borderBottom: '1px solid #FFC107' }}>Gordura</TableCell>
                          <TableCell align="center" sx={{ fontWeight: '600', color: '#FFC107', fontSize: '0.875rem', py: 2, borderBottom: '1px solid #FFC107' }}>Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {itensRefeicao.map((item, index) => (
                          <TableRow key={index} hover sx={{ '&:hover': { bgcolor: '#F5F5F5' } }}>
                            <TableCell sx={{ py: 2, borderBottom: '1px solid rgba(255, 193, 7, 0.2)' }}>
                              <Box display="flex" alignItems="center" gap={2}>
                                <Avatar sx={{ width: 36, height: 36, bgcolor: '#FFC107', color: '#333333' }}>
                                  <Kitchen fontSize="small" />
                                </Avatar>
                                <Typography variant="body2" fontWeight="500" color="#333333">
                                  {item.alimento.nome}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2, borderBottom: '1px solid rgba(255, 193, 7, 0.2)' }}>
                              <Chip 
                                label={`${item.quantidade_g}g`} 
                                size="small" 
                                variant="outlined"
                                sx={{ color: '#FFC107', borderColor: '#FFC107' }}
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2, borderBottom: '1px solid rgba(255, 193, 7, 0.2)' }}>
                              <Chip 
                                label={`${item.kcal_total.toFixed(1)}`} 
                                size="small" 
                                sx={{ bgcolor: 'rgba(255, 193, 7, 0.2)', color: '#FFC107' }}
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2, borderBottom: '1px solid rgba(255, 193, 7, 0.2)' }}>
                              <Chip 
                                label={`${item.carbo_total.toFixed(1)}g`} 
                                size="small" 
                                sx={{ bgcolor: 'rgba(255, 193, 7, 0.1)', color: '#FFC107', border: '1px solid #FFC107' }}
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2, borderBottom: '1px solid rgba(255, 193, 7, 0.2)' }}>
                              <Chip 
                                label={`${item.proteina_total.toFixed(1)}g`} 
                                size="small" 
                                sx={{ bgcolor: 'rgba(255, 193, 7, 0.1)', color: '#FFC107', border: '1px solid #FFC107' }}
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2, borderBottom: '1px solid rgba(255, 193, 7, 0.2)' }}>
                              <Chip 
                                label={`${item.gordura_total.toFixed(1)}g`} 
                                size="small" 
                                sx={{ bgcolor: 'rgba(255, 193, 7, 0.1)', color: '#FFC107', border: '1px solid #FFC107' }}
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2, borderBottom: '1px solid rgba(255, 193, 7, 0.2)' }}>
                              <Tooltip title="Remover alimento">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => removerItem(index)}
                                  sx={{ 
                                    color: '#d32f2f',
                                    '&:hover': { 
                                      bgcolor: 'rgba(211, 47, 47, 0.04)' 
                                    }
                                  }}
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Botões de Ação */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 4, borderRadius: 3, bgcolor: '#FFFFFF', border: '1px solid #E0E0E0' }}>
            <Grid container spacing={3} alignItems="center">
              {/* Botão Cancelar */}
              <Grid item xs={12} sm={6} lg={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/refeicoes')}
                  startIcon={<ArrowBack />}
                  size="large"
                  sx={{ 
                    borderRadius: 2,
                    height: 56,
                    borderColor: '#FF9800',
                    color: '#FF9800',
                    fontWeight: '500',
                    '&:hover': {
                      borderColor: '#FF9800',
                      backgroundColor: 'rgba(255, 152, 0, 0.04)'
                    }
                  }}
                >
                  CANCELAR
                </Button>
              </Grid>
              
              {/* Informações Centrais */}
              <Grid item xs={12} sm={12} lg={6}>
                <Box textAlign="center">
                  <Typography variant="h6" color="#FFC107" gutterBottom fontWeight="600">
                    {nome ? `${nome}` : 'Digite um nome para a refeição'}
                  </Typography>
                  <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap>
                    <Chip 
                      icon={<Restaurant />}
                      label={`${itensRefeicao.length} ${itensRefeicao.length === 1 ? 'alimento' : 'alimentos'}`}
                      size="medium"
                      sx={{ 
                        bgcolor: itensRefeicao.length > 0 ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 193, 7, 0.1)',
                        color: '#FFC107',
                        border: '1px solid #FFC107'
                      }}
                    />
                    {itensRefeicao.length > 0 && (
                      <Chip 
                        icon={<LocalDining />}
                        label={`${calcularTotais().kcal.toFixed(0)} kcal`}
                        size="medium"
                        sx={{ 
                          bgcolor: 'rgba(255, 193, 7, 0.2)',
                          color: '#FFC107',
                          border: '1px solid #FFC107'
                        }}
                      />
                    )}
                  </Stack>
                </Box>
              </Grid>
              
              {/* Botão Salvar */}
              <Grid item xs={12} sm={6} lg={3}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={salvarRefeicao}
                  disabled={loadingCriando || !nome.trim() || itensRefeicao.length === 0}
                  startIcon={loadingCriando ? <CircularProgress size={20} color="inherit" /> : <Save />}
                  size="large"
                  sx={{ 
                    borderRadius: 2,
                    height: 56,
                    fontWeight: '600',
                    background: loadingCriando || !nome.trim() || itensRefeicao.length === 0
                      ? 'rgba(76, 175, 80, 0.3)' 
                      : '#4CAF50',
                    color: loadingCriando || !nome.trim() || itensRefeicao.length === 0
                      ? '#999999' 
                      : '#FFFFFF',
                    boxShadow: loadingCriando || !nome.trim() || itensRefeicao.length === 0
                      ? 'none' 
                      : '0 4px 12px 2px rgba(76, 175, 80, .3)',
                    color: loadingCriando || !nome.trim() || itensRefeicao.length === 0
                      ? '#999'
                      : 'white',
                    '&:hover': {
                      background: loading || !nome.trim() || itensRefeicao.length === 0
                        ? '#e0e0e0'
                        : 'linear-gradient(45deg, #388e3c 30%, #4caf50 90%)',
                      boxShadow: loading || !nome.trim() || itensRefeicao.length === 0
                        ? 'none'
                        : '0 6px 16px 2px rgba(56, 142, 60, .4)',
                    },
                    '&:disabled': {
                      background: '#e0e0e0',
                      color: '#999',
                      boxShadow: 'none',
                    }
                  }}
                >
                  {loading ? 'SALVANDO...' : 'SALVAR REFEIÇÃO'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CadastroRefeicao;

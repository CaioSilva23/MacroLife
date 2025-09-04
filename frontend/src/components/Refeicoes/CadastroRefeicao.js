import React, { useState, useEffect } from 'react';
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

const CadastroRefeicao = ({ onVoltar, onRefeicaoCriada }) => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [alimentos, setAlimentos] = useState([]);
  const [alimentoSelecionado, setAlimentoSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState('');
  const [itensRefeicao, setItensRefeicao] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAlimentos, setLoadingAlimentos] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busca, setBusca] = useState('');

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

  const carregarAlimentos = async (termoBusca = '') => {
    try {
      setLoadingAlimentos(true);
      const dados = await alimentosService.listar(termoBusca);
      setAlimentos(dados.results || dados);
    } catch (err) {
      console.error('Erro ao carregar alimentos:', err);
    } finally {
      setLoadingAlimentos(false);
    }
  };

  const adicionarItem = () => {
    if (!alimentoSelecionado || !quantidade || quantidade <= 0) {
      setError('Selecione um alimento e informe uma quantidade válida');
      setSuccess('');
      return;
    }

    // Verificar se o alimento já foi adicionado
    const jaAdicionado = itensRefeicao.find(item => item.alimento.id === alimentoSelecionado.id);
    if (jaAdicionado) {
      setError('Este alimento já foi adicionado à refeição');
      setSuccess('');
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
    setError('');
    setSuccess('Alimento adicionado com sucesso!');
    
    // Limpar mensagem de sucesso após 3 segundos
    setTimeout(() => setSuccess(''), 3000);
  };

  const removerItem = (index) => {
    const novosItens = itensRefeicao.filter((_, i) => i !== index);
    setItensRefeicao(novosItens);
    setSuccess('Alimento removido da refeição');
    setTimeout(() => setSuccess(''), 2000);
  };

  const calcularTotais = () => {
    return itensRefeicao.reduce((totais, item) => ({
      kcal: totais.kcal + item.kcal_total,
      carbo: totais.carbo + item.carbo_total,
      proteina: totais.proteina + item.proteina_total,
      gordura: totais.gordura + item.gordura_total,
    }), { kcal: 0, carbo: 0, proteina: 0, gordura: 0 });
  };

  const salvarRefeicao = async () => {
    if (!nome.trim()) {
      setError('Nome da refeição é obrigatório');
      setSuccess('');
      return;
    }

    if (itensRefeicao.length === 0) {
      setError('Adicione pelo menos um alimento à refeição');
      setSuccess('');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const dadosRefeicao = {
        nome: nome.trim(),
        descricao: descricao.trim(),
        itens: itensRefeicao.map(item => ({
          alimento_id: item.alimento.id,
          quantidade_g: item.quantidade_g,
        })),
      };

      await refeicoesService.criar(dadosRefeicao);
      
      setSuccess('Refeição criada com sucesso!');
      
      setTimeout(() => {
        if (onRefeicaoCriada) {
          onRefeicaoCriada();
        }
        
        if (onVoltar) {
          onVoltar();
        }
      }, 1500);
      
    } catch (err) {
      setError('Erro ao salvar refeição: ' + err.message);
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'white', color: '#667eea', width: 56, height: 56 }}>
              <Restaurant fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" sx={{ color: 'white', fontWeight: 'bold' }}>
                Nova Refeição
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Monte sua refeição personalizada
              </Typography>
              {/* Indicador de progresso */}
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip 
                  size="small" 
                  label={nome ? '✓ Nome definido' : '1. Nome da refeição'} 
                  sx={{ 
                    bgcolor: nome ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    fontSize: '0.75rem'
                  }}
                />
                <Chip 
                  size="small" 
                  label={itensRefeicao.length > 0 ? `✓ ${itensRefeicao.length} alimentos` : '2. Adicionar alimentos'} 
                  sx={{ 
                    bgcolor: itensRefeicao.length > 0 ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    fontSize: '0.75rem'
                  }}
                />
              </Box>
            </Box>
          </Box>
          <Button 
            variant="outlined" 
            onClick={onVoltar}
            startIcon={<ArrowBack />}
            sx={{ 
              color: 'white', 
              borderColor: 'white',
              borderRadius: 2,
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Voltar
          </Button>
        </Box>
      </Paper>

      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Informações da Refeição */}
        <Grid item xs={12}>
          <Card elevation={1} sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: '#2196f3', width: 40, height: 40 }}>
                  <LocalDining />
                </Avatar>
              }
              title="Informações da Refeição"
              titleTypographyProps={{ variant: 'h6', fontWeight: '600', color: '#333' }}
              sx={{ pb: 1 }}
            />
            <CardContent sx={{ pt: 0, px: 3, pb: 3 }}>
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
                        backgroundColor: '#fafafa',
                        '&:hover': {
                          backgroundColor: '#f5f5f5',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                        }
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
                    multiline
                    rows={2}
                    variant="outlined"
                    size="medium"
                    placeholder="Adicione detalhes sobre a refeição..."
                    helperText="Adicione detalhes sobre a refeição"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#fafafa',
                        '&:hover': {
                          backgroundColor: '#f5f5f5',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                        }
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Adicionar Alimentos */}
        <Grid item xs={12}>
          <Card elevation={1} sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: '#ff9800', width: 40, height: 40 }}>
                  <Add />
                </Avatar>
              }
              title="Adicionar Alimentos"
              titleTypographyProps={{ variant: 'h6', fontWeight: '600', color: '#333' }}
              sx={{ pb: 1 }}
            />
            <CardContent sx={{ pt: 0, px: 3, pb: 3 }}>
              <Grid container spacing={3} alignItems="flex-end">
                <Grid item xs={12} md={5}>
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
                            backgroundColor: '#fafafa',
                            '&:hover': {
                              backgroundColor: '#f5f5f5',
                            },
                            '&.Mui-focused': {
                              backgroundColor: 'white',
                            }
                          }
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', py: 1 }}>
                          <Avatar sx={{ width: 40, height: 40, bgcolor: '#e3f2fd' }}>
                            <Kitchen fontSize="small" color="primary" />
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body1" fontWeight="medium">
                              {option.nome}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.energia_kcal} kcal • {option.proteinas_g}g prot • {option.carboidratos_g}g carbo
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                    ListboxProps={{
                      style: {
                        maxHeight: '300px',
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={3}>
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
                          <Scale color="action" fontSize="small" />
                        </InputAdornment>
                      ),
                      endAdornment: <InputAdornment position="end">gramas</InputAdornment>,
                    }}
                    placeholder="Ex: 100"
                    helperText="Quantidade em gramas"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#fafafa',
                        '&:hover': {
                          backgroundColor: '#f5f5f5',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                        }
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={adicionarItem}
                    disabled={!alimentoSelecionado || !quantidade || quantidade <= 0}
                    startIcon={<Add />}
                    size="large"
                    sx={{ 
                      height: 56,
                      borderRadius: 2,
                      background: !alimentoSelecionado || !quantidade || quantidade <= 0
                        ? '#e0e0e0'
                        : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      boxShadow: !alimentoSelecionado || !quantidade || quantidade <= 0
                        ? 'none'
                        : '0 3px 8px 2px rgba(33, 150, 243, .3)',
                      color: !alimentoSelecionado || !quantidade || quantidade <= 0
                        ? '#999'
                        : 'white',
                      fontWeight: '600',
                      '&:hover': {
                        background: !alimentoSelecionado || !quantidade || quantidade <= 0
                          ? '#e0e0e0'
                          : 'linear-gradient(45deg, #1976D2 30%, #1976D2 90%)',
                        boxShadow: !alimentoSelecionado || !quantidade || quantidade <= 0
                          ? 'none'
                          : '0 4px 12px 2px rgba(25, 118, 210, .4)',
                      },
                      '&:disabled': {
                        background: '#e0e0e0',
                        color: '#999',
                        boxShadow: 'none',
                      }
                    }}
                  >
                    + ADICIONAR
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Lista de Alimentos Adicionados */}
        <Grid item xs={12}>
          <Card elevation={1} sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: '#9c27b0', width: 40, height: 40 }}>
                  <Restaurant />
                </Avatar>
              }
              title={`Alimentos da Refeição (${itensRefeicao.length})`}
              titleTypographyProps={{ variant: 'h6', fontWeight: '600', color: '#333' }}
              sx={{ pb: 1 }}
            />
            <CardContent sx={{ pt: 0, px: 3, pb: 3 }}>
              {itensRefeicao.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Avatar sx={{ 
                    width: 64, 
                    height: 64, 
                    mx: 'auto', 
                    mb: 2, 
                    bgcolor: '#f3e5f5',
                    color: '#9c27b0'
                  }}>
                    <Restaurant fontSize="large" />
                  </Avatar>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Nenhum alimento adicionado
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Use o formulário acima para adicionar alimentos à sua refeição
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Chip icon={<Search />} label="Busque alimentos" variant="outlined" size="small" />
                    <Chip icon={<Scale />} label="Defina quantidades" variant="outlined" size="small" />
                    <Chip icon={<Add />} label="Adicione à refeição" variant="outlined" size="small" />
                  </Box>
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#fafafa' }}>
                        <TableCell sx={{ fontWeight: '600', color: '#333', fontSize: '0.875rem' }}>Alimento</TableCell>
                        <TableCell align="right" sx={{ fontWeight: '600', color: '#333', fontSize: '0.875rem' }}>Quantidade</TableCell>
                        <TableCell align="right" sx={{ fontWeight: '600', color: '#333', fontSize: '0.875rem' }}>Calorias</TableCell>
                        <TableCell align="right" sx={{ fontWeight: '600', color: '#333', fontSize: '0.875rem' }}>Carbo</TableCell>
                        <TableCell align="right" sx={{ fontWeight: '600', color: '#333', fontSize: '0.875rem' }}>Proteína</TableCell>
                        <TableCell align="right" sx={{ fontWeight: '600', color: '#333', fontSize: '0.875rem' }}>Gordura</TableCell>
                        <TableCell align="center" sx={{ fontWeight: '600', color: '#333', fontSize: '0.875rem' }}>Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {itensRefeicao.map((item, index) => (
                        <TableRow key={index} hover sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: '#e3f2fd' }}>
                                <Kitchen fontSize="small" />
                              </Avatar>
                              <Typography variant="body2" fontWeight="500">
                                {item.alimento.nome}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={`${item.quantidade_g}g`} 
                              size="small" 
                              color="default"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={`${item.kcal_total.toFixed(1)}`} 
                              size="small" 
                              color="primary"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={`${item.carbo_total.toFixed(1)}g`} 
                              size="small" 
                              color="info"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={`${item.proteina_total.toFixed(1)}g`} 
                              size="small" 
                              color="success"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={`${item.gordura_total.toFixed(1)}g`} 
                              size="small" 
                              color="warning"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Remover alimento">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removerItem(index)}
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
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Botões de Ação */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, mt: 2, bgcolor: '#fafafa', border: '1px solid #e0e0e0' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Button
                variant="outlined"
                onClick={onVoltar}
                startIcon={<ArrowBack />}
                size="large"
                sx={{ 
                  borderRadius: 2,
                  minWidth: 140,
                  borderColor: '#999',
                  color: '#666',
                  fontWeight: '500',
                  '&:hover': {
                    borderColor: '#666',
                    backgroundColor: 'rgba(0,0,0,0.04)'
                  }
                }}
              >
                CANCELAR
              </Button>
              
              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary" gutterBottom fontWeight="500">
                  {nome ? `Refeição: ${nome}` : 'Digite um nome para a refeição'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {itensRefeicao.length > 0 
                    ? `${itensRefeicao.length} ${itensRefeicao.length === 1 ? 'alimento adicionado' : 'alimentos adicionados'}`
                    : 'Adicione alimentos para continuar'
                  }
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                onClick={salvarRefeicao}
                disabled={loading || !nome.trim() || itensRefeicao.length === 0}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                size="large"
                sx={{ 
                  borderRadius: 2,
                  minWidth: 200,
                  fontWeight: '600',
                  background: loading || !nome.trim() || itensRefeicao.length === 0
                    ? '#e0e0e0' 
                    : 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                  boxShadow: loading || !nome.trim() || itensRefeicao.length === 0
                    ? 'none' 
                    : '0 4px 12px 2px rgba(76, 175, 80, .3)',
                  color: loading || !nome.trim() || itensRefeicao.length === 0
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
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CadastroRefeicao;

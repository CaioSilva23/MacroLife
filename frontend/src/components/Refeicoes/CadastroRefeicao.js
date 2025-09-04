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
import Swal from "sweetalert2";

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
      setAlimentos(dados.data);
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
      Swal.fire("Sucesso", "A refeição foi criada com sucesso!", "success");

      setTimeout(() => {
        if (onRefeicaoCriada) {
          onRefeicaoCriada();
        }
        
        if (onVoltar) {
          onVoltar();
        }
      }, 1500);
      
    } catch (err) {
      Swal.fire("Erro!", "Erro ao tentar criar a refeição, tente novamente.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" >
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'white', color: '#667eea', width: 64, height: 64 }}>
              <Restaurant fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
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
                    bgcolor: nome ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}
                />
                <Chip 
                  size="small" 
                  label={itensRefeicao.length > 0 ? `✓ ${itensRefeicao.length} alimentos` : '2. Adicionar alimentos'} 
                  sx={{ 
                    bgcolor: itensRefeicao.length > 0 ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}
                />
              </Stack>
            </Box>
          </Box>
          <Button 
            variant="outlined" 
            onClick={onVoltar}
            startIcon={<ArrowBack />}
            size="large"
            sx={{ 
              color: 'white', 
              borderColor: 'white',
              borderRadius: 2,
              fontWeight: '500',
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
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Formulário Unificado - Informações da Refeição e Adicionar Alimentos */}
        <Grid item xs={12}>
          <Card elevation={2} sx={{ borderRadius: 2, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'linear-gradient(45deg, #2196f3 30%, #ff9800 90%)', width: 48, height: 48 }}>
                  <Restaurant />
                </Avatar>
              }
              title="Configurar Refeição"
              subheader="Defina as informações básicas e adicione alimentos à sua refeição"
              titleTypographyProps={{ variant: 'h5', fontWeight: '700', color: '#333' }}
              subheaderTypographyProps={{ variant: 'body2', color: 'text.secondary', mt: 0.5 }}
              sx={{ pb: 2, background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}
            />
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={4}>
                {/* Seção: Informações Básicas */}
                <Grid item xs={12}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ color: '#2196f3', fontWeight: '600', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
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
                              backgroundColor: '#fafafa',
                              height: 56,
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
                          variant="outlined"
                          size="medium"
                          placeholder="Adicione detalhes sobre a refeição..."
                          helperText="Adicione detalhes sobre a refeição"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: '#fafafa',
                              height: 56,
                              width: 700,
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
                  <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: '600', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
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
                                backgroundColor: '#fafafa',
                                height: 56,
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
                            height: 56,
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
                              ? '#e0e0e0'
                              : 'linear-gradient(45deg, #ff9800 30%, #ffb74d 90%)',
                            boxShadow: !alimentoSelecionado || !quantidade || quantidade <= 0
                              ? 'none'
                              : '0 4px 12px 2px rgba(255, 152, 0, .3)',
                            color: !alimentoSelecionado || !quantidade || quantidade <= 0
                              ? '#999'
                              : 'white',
                            fontWeight: '600',
                            '&:hover': {
                              background: !alimentoSelecionado || !quantidade || quantidade <= 0
                                ? '#e0e0e0'
                                : 'linear-gradient(45deg, #f57c00 30%, #ff9800 90%)',
                              boxShadow: !alimentoSelecionado || !quantidade || quantidade <= 0
                                ? 'none'
                                : '0 6px 16px 2px rgba(245, 124, 0, .4)',
                            },
                            '&:disabled': {
                              background: '#e0e0e0',
                              color: '#999',
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

        {/* Resumo Nutricional - Aparece apenas quando há alimentos */}
        {itensRefeicao.length > 0 && (
          <Grid item xs={12}>
            <Card elevation={1} sx={{ borderRadius: 3, border: '1px solid #e0e0e0', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: '#28a745', fontWeight: '600', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Scale />
                  Resumo Nutricional
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)' }}>
                      <Typography variant="h4" fontWeight="bold" color="#ff8f00">
                        {calcularTotais().kcal.toFixed(0)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight="500">
                        CALORIAS
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(33, 150, 243, 0.1)', border: '1px solid rgba(33, 150, 243, 0.3)' }}>
                      <Typography variant="h4" fontWeight="bold" color="#1976d2">
                        {calcularTotais().carbo.toFixed(1)}g
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight="500">
                        CARBOIDRATOS
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', border: '1px solid rgba(76, 175, 80, 0.3)' }}>
                      <Typography variant="h4" fontWeight="bold" color="#388e3c">
                        {calcularTotais().proteina.toFixed(1)}g
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight="500">
                        PROTEÍNAS
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255, 152, 0, 0.1)', border: '1px solid rgba(255, 152, 0, 0.3)' }}>
                      <Typography variant="h4" fontWeight="bold" color="#f57c00">
                        {calcularTotais().gordura.toFixed(1)}g
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight="500">
                        GORDURAS
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Lista de Alimentos Adicionados */}
        <Grid item xs={12}>
          <Card elevation={1} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: '#9c27b0', width: 48, height: 48 }}>
                  <Restaurant />
                </Avatar>
              }
              title={`Alimentos da Refeição (${itensRefeicao.length})`}
              titleTypographyProps={{ variant: 'h6', fontWeight: '600', color: '#333' }}
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
                    bgcolor: '#f3e5f5',
                    color: '#9c27b0'
                  }}>
                    <Restaurant fontSize="large" />
                  </Avatar>
                  <Typography variant="h6" color="text.secondary" gutterBottom fontWeight="500">
                    Nenhum alimento adicionado
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                    Use o formulário acima para adicionar alimentos à sua refeição
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <Chip icon={<Search />} label="Busque alimentos" variant="outlined" size="medium" />
                    <Chip icon={<Scale />} label="Defina quantidades" variant="outlined" size="medium" />
                    <Chip icon={<Add />} label="Adicione à refeição" variant="outlined" size="medium" />
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                  {/* Layout Mobile - Cards */}
                  <Grid container spacing={2}>
                    {itensRefeicao.map((item, index) => (
                      <Grid item xs={12} key={index}>
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                          <CardContent sx={{ p: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                              <Box display="flex" alignItems="center" gap={1.5} flex={1}>
                                <Avatar sx={{ width: 40, height: 40, bgcolor: '#e3f2fd' }}>
                                  <Kitchen fontSize="small" />
                                </Avatar>
                                <Box flex={1}>
                                  <Typography variant="body1" fontWeight="600" noWrap>
                                    {item.alimento.nome}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
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
                                  <Typography variant="h6" color="primary" fontWeight="bold">
                                    {item.kcal_total.toFixed(0)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    kcal
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={3}>
                                <Box textAlign="center">
                                  <Typography variant="h6" color="info.main" fontWeight="bold">
                                    {item.carbo_total.toFixed(1)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    carbo
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={3}>
                                <Box textAlign="center">
                                  <Typography variant="h6" color="success.main" fontWeight="bold">
                                    {item.proteina_total.toFixed(1)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    prot
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={3}>
                                <Box textAlign="center">
                                  <Typography variant="h6" color="warning.main" fontWeight="bold">
                                    {item.gordura_total.toFixed(1)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
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
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#fafafa' }}>
                          <TableCell sx={{ fontWeight: '600', color: '#333', fontSize: '0.875rem', py: 2 }}>Alimento</TableCell>
                          <TableCell align="center" sx={{ fontWeight: '600', color: '#333', fontSize: '0.875rem', py: 2 }}>Quantidade</TableCell>
                          <TableCell align="center" sx={{ fontWeight: '600', color: '#333', fontSize: '0.875rem', py: 2 }}>Calorias</TableCell>
                          <TableCell align="center" sx={{ fontWeight: '600', color: '#333', fontSize: '0.875rem', py: 2 }}>Carbo</TableCell>
                          <TableCell align="center" sx={{ fontWeight: '600', color: '#333', fontSize: '0.875rem', py: 2 }}>Proteína</TableCell>
                          <TableCell align="center" sx={{ fontWeight: '600', color: '#333', fontSize: '0.875rem', py: 2 }}>Gordura</TableCell>
                          <TableCell align="center" sx={{ fontWeight: '600', color: '#333', fontSize: '0.875rem', py: 2 }}>Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {itensRefeicao.map((item, index) => (
                          <TableRow key={index} hover sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
                            <TableCell sx={{ py: 2 }}>
                              <Box display="flex" alignItems="center" gap={2}>
                                <Avatar sx={{ width: 36, height: 36, bgcolor: '#e3f2fd' }}>
                                  <Kitchen fontSize="small" />
                                </Avatar>
                                <Typography variant="body2" fontWeight="500">
                                  {item.alimento.nome}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2 }}>
                              <Chip 
                                label={`${item.quantidade_g}g`} 
                                size="small" 
                                color="default"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2 }}>
                              <Chip 
                                label={`${item.kcal_total.toFixed(1)}`} 
                                size="small" 
                                color="primary"
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2 }}>
                              <Chip 
                                label={`${item.carbo_total.toFixed(1)}g`} 
                                size="small" 
                                color="info"
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2 }}>
                              <Chip 
                                label={`${item.proteina_total.toFixed(1)}g`} 
                                size="small" 
                                color="success"
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2 }}>
                              <Chip 
                                label={`${item.gordura_total.toFixed(1)}g`} 
                                size="small" 
                                color="warning"
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2 }}>
                              <Tooltip title="Remover alimento">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => removerItem(index)}
                                  sx={{ 
                                    '&:hover': { 
                                      bgcolor: 'rgba(244, 67, 54, 0.04)' 
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
          <Paper elevation={1} sx={{ p: 4, borderRadius: 3, bgcolor: '#fafafa', border: '1px solid #e0e0e0' }}>
            <Grid container spacing={3} alignItems="center">
              {/* Botão Cancelar */}
              <Grid item xs={12} sm={6} lg={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={onVoltar}
                  startIcon={<ArrowBack />}
                  size="large"
                  sx={{ 
                    borderRadius: 2,
                    height: 56,
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
              </Grid>
              
              {/* Informações Centrais */}
              <Grid item xs={12} sm={12} lg={6}>
                <Box textAlign="center">
                  <Typography variant="h6" color="text.primary" gutterBottom fontWeight="600">
                    {nome ? `${nome}` : 'Digite um nome para a refeição'}
                  </Typography>
                  <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap>
                    <Chip 
                      icon={<Restaurant />}
                      label={`${itensRefeicao.length} ${itensRefeicao.length === 1 ? 'alimento' : 'alimentos'}`}
                      size="medium"
                      color={itensRefeicao.length > 0 ? "success" : "default"}
                      variant={itensRefeicao.length > 0 ? "filled" : "outlined"}
                    />
                    {itensRefeicao.length > 0 && (
                      <Chip 
                        icon={<LocalDining />}
                        label={`${calcularTotais().kcal.toFixed(0)} kcal`}
                        size="medium"
                        color="primary"
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
                  color="primary"
                  onClick={salvarRefeicao}
                  disabled={loading || !nome.trim() || itensRefeicao.length === 0}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                  size="large"
                  sx={{ 
                    borderRadius: 2,
                    height: 56,
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
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CadastroRefeicao;

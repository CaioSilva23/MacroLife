import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Avatar,
  Container,
  Paper,
  IconButton,
  Tooltip,
  LinearProgress,
  Stack,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Fab,
  useMediaQuery,
  useTheme,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Restaurant,
  Add,
  Delete,
  LocalDining,
  CalendarToday,
  FastfoodOutlined,
  Kitchen,
  FitnessCenter,
  ExpandMore,
  Scale,
  Close,
} from '@mui/icons-material';
import { refeicoesService } from '../../services/api';
import Swal from "sweetalert2";

const ListaRefeicoes = ({ onCriarRefeicao }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [refeicoes, setRefeicoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedRefeicao, setExpandedRefeicao] = useState(false);
  const [deletandoId, setDeletandoId] = useState(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [refeicaoSelecionada, setRefeicaoSelecionada] = useState(null);

  // Carregar refeições ao montar o componente
  useEffect(() => {
    carregarRefeicoes();
  }, []);

  const carregarRefeicoes = async () => {
    try {
      setLoading(true);
      setError('');
      const dados = await refeicoesService.listar();
      setRefeicoes(dados.data);
    } catch (err) {
      setError('Erro ao carregar refeições: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const AlertDeletarRefeicao = (id) => {
    Swal.fire({
      title: "Tem certeza ?",
      text: "Você não poderá reverter isso!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sim, deletar!",
    }).then((result) => {
      if (result.value) {
        deletarRefeicao(id);
      }
    });
  };

  const deletarRefeicao = async (id) => {
    try {
      setDeletandoId(id);
      await refeicoesService.deletar(id);
      await carregarRefeicoes(); // Recarregar lista
      Swal.fire("Sucesso", "A refeição foi deletada com sucesso!", "success");
    } catch (err) {
      Swal.fire("Erro!", "Erro ao tentar deletar a refeição, tente novamente.", "error");
    } finally {
      setDeletandoId(null);
    }
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedRefeicao(isExpanded ? panel : false);
  };

  const fecharDetalhes = () => {
    setDialogAberto(false);
    setRefeicaoSelecionada(null);
  };

  const abrirDetalhes = (refeicao) => {
    setRefeicaoSelecionada(refeicao);
    setDialogAberto(true);
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  // Calcular totais gerais de todas as refeições
  const calcularTotaisGerais = () => {
    return refeicoes.reduce((totais, refeicao) => ({
      kcal: totais.kcal + parseFloat(refeicao.total_kcal || 0),
      carbo: totais.carbo + parseFloat(refeicao.total_carbo || 0),
      proteina: totais.proteina + parseFloat(refeicao.total_proteina || 0),
      gordura: totais.gordura + parseFloat(refeicao.total_gordura || 0),
    }), { kcal: 0, carbo: 0, proteina: 0, gordura: 0 });
  };

  const totaisGerais = calcularTotaisGerais();
  const progressoNutricional = {
    kcal: Math.min((totaisGerais.kcal / 2000) * 100, 100),
    carbo: Math.min((totaisGerais.carbo / 250) * 100, 100),
    proteina: Math.min((totaisGerais.proteina / 150) * 100, 100),
    gordura: Math.min((totaisGerais.gordura / 65) * 100, 100),
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'white', color: '#667eea',  width: 64, height: 64  }}>
              <Restaurant fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" sx={{ color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LocalDining />
                Minhas Refeições
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Gerencie suas refeições personalizadas
              </Typography>
              {/* Estatísticas rápidas */}
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip 
                  size="small" 
                  label={`${refeicoes.length} ${refeicoes.length === 1 ? 'refeição' : 'refeições'}`}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    fontSize: '0.75rem'
                  }}
                />
                {refeicoes.length > 0 && (
                  <Chip 
                    size="small" 
                    label={`${refeicoes.reduce((acc, r) => acc + r.total_kcal, 0).toFixed(0)} kcal total`}
                    sx={{ 
                      bgcolor: 'rgba(76, 175, 80, 0.2)', 
                      color: 'white',
                      fontSize: '0.75rem'
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>
          <Button 
            variant="contained"
            onClick={onCriarRefeicao}
            startIcon={<Add />}
            sx={{ 
              bgcolor: 'white', 
              color: '#667eea',
              borderRadius: 2,
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.9)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Nova Refeição
          </Button>
        </Box>
      </Paper>

      {/* Floating Action Button para Mobile */}
      <Fab
        color="primary"
        onClick={onCriarRefeicao}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', sm: 'none' },
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #1976D2 30%, #1976D2 90%)',
          }
        }}
      >
        <Add />
      </Fab>

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

      {/* Resumo Nutricional Geral */}
      {refeicoes.length > 0 && (
        <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: '#4caf50' }}>
                <FitnessCenter />
              </Avatar>
            }
            title="Resumo Nutricional Geral"
            titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
            subheader={`Totais de ${refeicoes.length} ${refeicoes.length === 1 ? 'refeição' : 'refeições'}`}
          />
          <CardContent sx={{ pt: 0 }}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center" sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {totaisGerais.kcal.toFixed(0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Calorias
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={progressoNutricional.kcal} 
                    sx={{ height: 6, borderRadius: 3, mb: 0.5 }}
                    color="primary"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {progressoNutricional.kcal.toFixed(0)}% da meta diária
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box textAlign="center" sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                  <Typography variant="h4" color="info.main" fontWeight="bold">
                    {totaisGerais.carbo.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Carboidratos (g)
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={progressoNutricional.carbo} 
                    sx={{ height: 6, borderRadius: 3, mb: 0.5 }}
                    color="info"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {progressoNutricional.carbo.toFixed(0)}% da meta diária
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box textAlign="center" sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {totaisGerais.proteina.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Proteínas (g)
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={progressoNutricional.proteina} 
                    sx={{ height: 6, borderRadius: 3, mb: 0.5 }}
                    color="success"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {progressoNutricional.proteina.toFixed(0)}% da meta diária
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box textAlign="center" sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                  <Typography variant="h4" color="warning.main" fontWeight="bold">
                    {totaisGerais.gordura.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Gorduras (g)
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={progressoNutricional.gordura} 
                    sx={{ height: 6, borderRadius: 3, mb: 0.5 }}
                    color="warning"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {progressoNutricional.gordura.toFixed(0)}% da meta diária
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress size={60} />
        </Box>
      ) : refeicoes.length === 0 ? (
        <Paper elevation={2} sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
          <Avatar sx={{ 
            width: 100, 
            height: 100, 
            mx: 'auto', 
            mb: 3, 
            bgcolor: '#f3e5f5',
            color: '#9c27b0'
          }}>
            <FastfoodOutlined sx={{ fontSize: 60 }} />
          </Avatar>
          <Typography variant="h5" gutterBottom color="text.secondary">
            Nenhuma refeição cadastrada
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Comece criando sua primeira refeição personalizada
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onCriarRefeicao}
            size="large"
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
            }}
          >
            Criar Primeira Refeição
          </Button>
        </Paper>
      ) : (
        <Box>
          {refeicoes.map((refeicao) => (
            <Accordion
              key={refeicao.id}
              expanded={expandedRefeicao === `panel-${refeicao.id}`}
              onChange={handleAccordionChange(`panel-${refeicao.id}`)}
              sx={{
                mb: 2,
                borderRadius: '12px !important',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '&:before': { display: 'none' },
                '&.Mui-expanded': {
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  borderRadius: '12px',
                  minHeight: 70,
                  backgroundColor: '#fafafa',
                  border: '1px solid #e0e0e0',
                  '&.Mui-expanded': {
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                    backgroundColor: 'white',
                  },
                  '& .MuiAccordionSummary-content': {
                    alignItems: 'center',
                    margin: '12px 0',
                  },
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  }
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" sx={{ pr: 2 }}>
                  {/* Nome da refeição e alimentos */}
                  <Box sx={{ minWidth: 0, flex: 1, mr: 2 }}>
                    <Typography variant="h6" fontWeight="600" sx={{ fontSize: '1.1rem', mb: 0.5 }}>
                      {refeicao.nome}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      fontSize: '0.8rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: { xs: '200px', sm: '300px', md: '400px' }
                    }}>
                      {refeicao.itens.map(item => item.alimento.nome).join(', ')}
                    </Typography>
                  </Box>
                  
                  {/* Informações nutricionais */}
                  <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }} sx={{ flex: '0 0 auto', flexWrap: 'wrap' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      whiteSpace: 'nowrap',
                      display: { xs: 'none', sm: 'block' }
                    }}>
                      {refeicao.itens.length} {refeicao.itens.length === 1 ? 'alimento' : 'alimentos'}
                    </Typography>
                    
                    <Typography variant="body2" color="info.main" sx={{ 
                      whiteSpace: 'nowrap', 
                      fontWeight: '500',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}>
                      {parseFloat(refeicao.total_carbo).toFixed(1)}g carbo
                    </Typography>
                    
                    <Typography variant="body2" color="warning.main" sx={{ 
                      whiteSpace: 'nowrap', 
                      fontWeight: '500',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}>
                      {parseFloat(refeicao.total_gordura).toFixed(1)}g gord
                    </Typography>
                    
                    <Typography variant="body2" color="success.main" sx={{ 
                      whiteSpace: 'nowrap', 
                      fontWeight: '500',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}>
                      {parseFloat(refeicao.total_proteina).toFixed(1)}g prot
                    </Typography>
                    
                    <Typography variant="h6" color="primary.main" sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap',
                      fontSize: { xs: '1rem', sm: '1.25rem' }
                    }}>
                      {parseFloat(refeicao.total_kcal).toFixed(0)} kcal
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              
              <AccordionDetails sx={{ pt: 0, pb: 2 }}>
                <Box sx={{ backgroundColor: '#fafafa', p: 3, borderRadius: 2 }}>
                  {/* Descrição da Refeição */}
                  {refeicao.descricao && (
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        "{refeicao.descricao}"
                      </Typography>
                    </Box>
                  )}

                  {/* Título da seção */}
                  <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: '600', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Restaurant fontSize="small" />
                    Detalhes dos Alimentos ({refeicao.itens.length})
                  </Typography>
                  
                  {/* Versão Desktop - Tabela */}
                  <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Alimento</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Quantidade</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Calorias</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Carbo</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Proteína</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Gordura</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {refeicao.itens.map((item, index) => (
                            <TableRow key={index} hover>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1.5}>
                                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#e3f2fd' }}>
                                    <Kitchen fontSize="small" />
                                  </Avatar>
                                  <Typography variant="body2" fontWeight="500">
                                    {item.alimento_nome}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={`${item.quantidade_g}g`} 
                                  size="small" 
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2" fontWeight="500" color="primary">
                                  {item.kcal_total.toFixed(1)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2" color="info.main">
                                  {item.carbo_total.toFixed(1)}g
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2" color="success.main">
                                  {item.proteina_total.toFixed(1)}g
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2" color="warning.main">
                                  {item.gordura_total.toFixed(1)}g
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>

                  {/* Versão Mobile - Cards */}
                  <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                    <Grid container spacing={2}>
                      {refeicao.itens.map((item, index) => (
                        <Grid item xs={12} key={index}>
                          <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ p: 2 }}>
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                <Box display="flex" alignItems="center" gap={1.5} flex={1}>
                                  <Avatar sx={{ width: 36, height: 36, bgcolor: '#e3f2fd' }}>
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

                  {/* Ações */}
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} pt={2} sx={{ borderTop: '1px solid #e0e0e0' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday fontSize="small" />
                      Criado em {formatarData(refeicao.data_criacao)}
                    </Typography>
                    
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={deletandoId === refeicao.id ? <CircularProgress size={16} /> : <Delete />}
                      onClick={(e) => {
                        e.stopPropagation();
                        AlertDeletarRefeicao(refeicao.id);
                      }}
                      disabled={deletandoId === refeicao.id}
                      size="small"
                      sx={{ borderRadius: 2 }}
                    >
                      {deletandoId === refeicao.id ? 'Excluindo...' : 'Excluir Refeição'}
                    </Button>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Dialog de Detalhes */}
      <Dialog
        open={dialogAberto}
        onClose={fecharDetalhes}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: { borderRadius: { xs: 0, sm: 2 }, minHeight: '50vh' }
        }}
      >
        {refeicaoSelecionada && (
          <>
            <DialogTitle sx={{ p: 0 }}>
              {/* Header com gradiente */}
              <Paper elevation={0} sx={{ 
                p: 3, 
                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                borderRadius: 0
              }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'white', color: '#4CAF50', width: 56, height: 56 }}>
                      <LocalDining fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" component="h2" sx={{ color: 'white', fontWeight: 'bold' }}>
                        {refeicaoSelecionada.nome}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                        <CalendarToday fontSize="small" sx={{ color: 'rgba(255,255,255,0.8)' }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          Criada em {formatarData(refeicaoSelecionada.data_criacao)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <IconButton
                    onClick={fecharDetalhes}
                    sx={{ 
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                    }}
                  >
                    <Close />
                  </IconButton>
                </Box>
              </Paper>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
              <Box sx={{ p: 3 }}>
                {/* Descrição */}
                {refeicaoSelecionada.descricao && (
                  <Paper 
                    elevation={1} 
                    sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: '#f8f9fa' }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      {refeicaoSelecionada.descricao}
                    </Typography>
                  </Paper>
                )}

                {/* Resumo Nutricional */}
                <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
                  Informações Nutricionais
                </Typography>

                <Grid container spacing={2} sx={{ mb: 4 }}>
                  <Grid item xs={6} sm={3}>
                    <Card elevation={1} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                      <Typography variant="h4" color="primary" fontWeight="bold">
                        {refeicaoSelecionada.total_kcal}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Calorias
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card elevation={1} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                      <Typography variant="h4" color="success.main" fontWeight="bold">
                        {refeicaoSelecionada.total_proteina}g
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Proteínas
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card elevation={1} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                      <Typography variant="h4" color="info.main" fontWeight="bold">
                        {refeicaoSelecionada.total_carbo}g
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Carboidratos
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card elevation={1} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                      <Typography variant="h4" color="warning.main" fontWeight="bold">
                        {refeicaoSelecionada.total_gordura}g
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Gorduras
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>

                {/* Lista de Alimentos */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Alimentos ({refeicaoSelecionada.itens.length})
                  </Typography>
                  <Chip 
                    label={`Total: ${refeicaoSelecionada.total_kcal} kcal`}
                    color="primary"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>

                {refeicaoSelecionada.itens.map((item, index) => (
                  <Card key={index} elevation={1} sx={{ mb: 2, borderRadius: 2 }}>
                    <CardContent sx={{ p: 2 }}>
                      <Grid container alignItems="center" spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ width: 40, height: 40, bgcolor: '#2196f3' }}>
                              <Kitchen />
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight="bold">
                                {item.alimento_nome}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {item.quantidade_g}g
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box display="flex" flexWrap="wrap" gap={1} justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
                            <Chip
                              label={`${item.kcal_total} kcal`}
                              color="primary"
                              size="small"
                              sx={{ fontWeight: 'bold' }}
                            />
                            <Chip
                              label={`${item.proteina_total}g prot`}
                              color="success"
                              size="small"
                            />
                            <Chip
                              label={`${item.carbo_total}g carb`}
                              color="info"
                              size="small"
                            />
                            <Chip
                              label={`${item.gordura_total}g gord`}
                              color="warning"
                              size="small"
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
              <Button
                onClick={fecharDetalhes}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                Fechar
              </Button>
              <Button
                onClick={() => AlertDeletarRefeicao(refeicaoSelecionada.id)}
                variant="contained"
                color="error"
                startIcon={deletandoId === refeicaoSelecionada.id ? <CircularProgress size={16} color="inherit" /> : <Delete />}
                disabled={deletandoId === refeicaoSelecionada.id}
                sx={{ borderRadius: 2 }}
              >
                {deletandoId === refeicaoSelecionada.id ? 'Excluindo...' : 'Excluir Refeição'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default ListaRefeicoes;

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { RefeicoesSkeleton } from '../Common/Skeletons';
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
  TextField,
  Fade,
  Grow,
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
  FilterList,
  Today,
} from '@mui/icons-material';
import { refeicoesService } from '../../services/api';
import Swal from "sweetalert2";

const ListaRefeicoes = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { state, actions, cache } = useApp();
  
  // Estados locais
  const [expandedRefeicao, setExpandedRefeicao] = useState(false);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [refeicaoSelecionada, setRefeicaoSelecionada] = useState(null);
  const [dataFiltro, setDataFiltro] = useState(() => {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0]; // formato YYYY-MM-DD
  });

  // Estados do contexto
  const { refeicoes } = state;
  const { loading, errors } = state;
  const loadingRefeicoes = loading.refeicoes;
  const deletandoId = loading.deletando;
  const error = errors.refeicoes;

  // Carregar refeições ao montar o componente e quando a data do filtro mudar
  useEffect(() => {
    carregarRefeicoes();
  }, [dataFiltro]);

  const carregarRefeicoes = useCallback(async () => {
    // Verificar cache primeiro
    const cached = cache.getCachedRefeicoes(dataFiltro);
    if (cached && cache.isCacheValid('refeicoes')) {
      actions.setRefeicoes(cached, dataFiltro);
      return;
    }

    try {
      actions.setLoading('refeicoes', true);
      actions.clearError('refeicoes');
      console.log('Carregando refeições para a data:', dataFiltro);
      const dados = await refeicoesService.listar(dataFiltro);
      actions.setRefeicoes(dados.data, dataFiltro);
    } catch (err) {
      actions.setError('refeicoes', 'Erro ao carregar refeições: ' + err.message);
    } finally {
      actions.setLoading('refeicoes', false);
    }
  }, [dataFiltro, actions, cache]);

  const AlertDeletarRefeicao = (id) => {
    Swal.fire({
      title: "Tem certeza ?",
      text: "Você não poderá reverter isso!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#80EF80",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sim, deletar!",
    }).then((result) => {
      if (result.value) {
        deletarRefeicao(id);
      }
    });
  };

  const deletarRefeicao = useCallback(async (id) => {
    try {
      actions.setLoading('deletando', id);
      await refeicoesService.deletar(id);
      actions.removeRefeicao(id);
      Swal.fire("Sucesso", "A refeição foi deletada com sucesso!", "success");
    } catch (err) {
      Swal.fire("Erro!", "Erro ao tentar deletar a refeição, tente novamente.", "error");
    } finally {
      actions.setLoading('deletando', null);
    }
  }, [actions]);

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
    // Se já é uma string no formato YYYY-MM-DD, criar Date corretamente
    const data = typeof dataString === 'string' && dataString.includes('-') 
      ? new Date(dataString + 'T00:00:00') 
      : new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  // Função para formatar data para filtros (YYYY-MM-DD)
  const formatarDataParaFiltro = (data = new Date()) => {
    return data.toISOString().split('T')[0];
  };

  // Função para obter data atual formatada
  const obterDataAtual = () => {
    const hoje = new Date();
    return {
      formatada: formatarData(hoje),
      paraFiltro: formatarDataParaFiltro(hoje),
      timestamp: hoje.getTime()
    };
  };

  // Funções para navegação de data
  const irParaHoje = () => {
    const hoje = new Date();
    setDataFiltro(hoje.toISOString().split('T')[0]);
  };

  const irParaDataAnterior = () => {
    const dataAtual = new Date(dataFiltro);
    dataAtual.setDate(dataAtual.getDate() - 1);
    setDataFiltro(dataAtual.toISOString().split('T')[0]);
  };

  const irParaProximaData = () => {
    const dataAtual = new Date(dataFiltro);
    dataAtual.setDate(dataAtual.getDate() + 1);
    setDataFiltro(dataAtual.toISOString().split('T')[0]);
  };

  const handleDataChange = (event) => {
    setDataFiltro(event.target.value);
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

  if (loadingRefeicoes && refeicoes.length === 0) {
    return <RefeicoesSkeleton />;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #0D1117 0%, #010409 100%)', border: '1px solid #80EF80' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: '#80EF80', color: '#010409',  width: 64, height: 64  }}>
              <Restaurant fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" sx={{ color: '#80EF80', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
                    bgcolor: 'rgba(128, 239, 128, 0.2)', 
                    color: '#80EF80',
                    border: '1px solid #80EF80',
                    fontSize: '0.75rem'
                  }}
                />
                {refeicoes.length > 0 && (
                  <Chip 
                    size="small" 
                    label={`${refeicoes.reduce((acc, r) => acc + r.total_kcal, 0).toFixed(0)} kcal total`}
                    sx={{ 
                      bgcolor: 'rgba(128, 239, 128, 0.1)', 
                      color: '#80EF80',
                      border: '1px solid #80EF80',
                      fontSize: '0.75rem'
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>
          <Button 
            variant="contained"
            onClick={() => navigate('/refeicoes/novo')}
            startIcon={<Add />}
            sx={{ 
              bgcolor: '#80EF80', 
              color: '#010409',
              borderRadius: 2,
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: '#66CC66',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(128, 239, 128, 0.3)'
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
        onClick={() => navigate('/refeicoes/novo')}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', sm: 'none' },
          background: 'linear-gradient(45deg, #80EF80 30%, #66CC66 90%)',
          color: '#010409',
          '&:hover': {
            background: 'linear-gradient(45deg, #66CC66 30%, #4CAF50 90%)',
          }
        }}
      >
        <Add />
      </Fab>

      {/* Filtro de Data */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: '#0D1117', border: '1px solid #80EF80' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: '#80EF80', color: '#010409' }}>
              <FilterList />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="600" color="#80EF80">
                Filtrar por Data
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)">
                Visualize refeições de uma data específica
              </Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            {/* Navegação de datas */}
            <Button
              variant="outlined"
              size="small"
              onClick={irParaDataAnterior}
              sx={{ 
                minWidth: 'auto', 
                px: 1,
                color: '#80EF80',
                borderColor: '#80EF80',
                '&:hover': {
                  borderColor: '#80EF80',
                  backgroundColor: 'rgba(128, 239, 128, 0.04)'
                }
              }}
            >
              ‹
            </Button>

            <TextField
              type="date"
              value={dataFiltro}
              onChange={handleDataChange}
              size="small"
              sx={{ 
                minWidth: '150px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#0D1117',
                  border: '1px solid #80EF80',
                  color: '#ffffff',
                  '&:hover': {
                    borderColor: '#80EF80',
                  },
                  '&.Mui-focused': {
                    borderColor: '#80EF80',
                  }
                },
                '& .MuiInputLabel-root': {
                  color: '#80EF80',
                },
                '& input': {
                  color: '#ffffff',
                }
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />

            <Button
              variant="outlined"
              size="small"
              onClick={irParaProximaData}
              sx={{ 
                minWidth: 'auto', 
                px: 1,
                color: '#80EF80',
                borderColor: '#80EF80',
                '&:hover': {
                  borderColor: '#80EF80',
                  backgroundColor: 'rgba(128, 239, 128, 0.04)'
                }
              }}
            >
              ›
            </Button>

            <Button
              variant="contained"
              size="small"
              startIcon={<Today />}
              onClick={irParaHoje}
              sx={{ 
                borderRadius: 2,
                ml: 1,
                textTransform: 'none',
                backgroundColor: '#80EF80',
                color: '#010409',
                '&:hover': {
                  backgroundColor: '#66CC66',
                }
              }}
            >
              Hoje
            </Button>
          </Box>

          {/* Informação da data selecionada */}
          <Box sx={{ width: '100%', mt: 1 }}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Exibindo refeições de <strong>{formatarData(dataFiltro)}</strong>
              {dataFiltro === new Date().toISOString().split('T')[0] && (
                <Chip 
                  label="Hoje" 
                  size="small" 
                  color="primary" 
                  sx={{ ml: 1, fontSize: '0.7rem' }}
                />
              )}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Alertas */}
      {error && (
        <Fade in>
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => actions.clearError('refeicoes')}>
            {error}
          </Alert>
        </Fade>
      )}

      {/* Resumo Nutricional Geral */}
      {refeicoes.length > 0 && (
        <Card elevation={2} sx={{ mb: 3, borderRadius: 2, bgcolor: '#0D1117', border: '1px solid #80EF80' }}>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: '#80EF80', color: '#010409' }}>
                <FitnessCenter />
              </Avatar>
            }
            title="Resumo Nutricional Geral"
            titleTypographyProps={{ variant: 'h6', fontWeight: 'bold', color: '#80EF80' }}
            subheader={`Totais de ${refeicoes.length} ${refeicoes.length === 1 ? 'refeição' : 'refeições'}`}
            subheaderTypographyProps={{ color: 'rgba(255,255,255,0.7)' }}
          />
          <CardContent sx={{ pt: 0 }}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center" sx={{ p: 2, bgcolor: '#0D1117', borderRadius: 2, border: '1px solid #80EF80' }}>
                  <Typography variant="h4" color="#80EF80" fontWeight="bold">
                    {totaisGerais.kcal.toFixed(0)}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)" gutterBottom>
                    Calorias
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={progressoNutricional.kcal} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3, 
                      mb: 0.5,
                      bgcolor: 'rgba(128, 239, 128, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#80EF80',
                      }
                    }}
                  />
                  <Typography variant="caption" color="rgba(255,255,255,0.7)">
                    {progressoNutricional.kcal.toFixed(0)}% da meta diária
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box textAlign="center" sx={{ p: 2, bgcolor: '#0D1117', borderRadius: 2, border: '1px solid #80EF80' }}>
                  <Typography variant="h4" color="#80EF80" fontWeight="bold">
                    {totaisGerais.carbo.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)" gutterBottom>
                    Carboidratos (g)
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={progressoNutricional.carbo} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3, 
                      mb: 0.5,
                      bgcolor: 'rgba(128, 239, 128, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#80EF80',
                      }
                    }}
                  />
                  <Typography variant="caption" color="rgba(255,255,255,0.7)">
                    {progressoNutricional.carbo.toFixed(0)}% da meta diária
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box textAlign="center" sx={{ p: 2, bgcolor: '#0D1117', borderRadius: 2, border: '1px solid #80EF80' }}>
                  <Typography variant="h4" color="#80EF80" fontWeight="bold">
                    {totaisGerais.proteina.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)" gutterBottom>
                    Proteínas (g)
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={progressoNutricional.proteina} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3, 
                      mb: 0.5,
                      bgcolor: 'rgba(128, 239, 128, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#80EF80',
                      }
                    }}
                  />
                  <Typography variant="caption" color="rgba(255,255,255,0.7)">
                    {progressoNutricional.proteina.toFixed(0)}% da meta diária
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box textAlign="center" sx={{ p: 2, bgcolor: '#0D1117', borderRadius: 2, border: '1px solid #80EF80' }}>
                  <Typography variant="h4" color="#80EF80" fontWeight="bold">
                    {totaisGerais.gordura.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)" gutterBottom>
                    Gorduras (g)
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={progressoNutricional.gordura} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3, 
                      mb: 0.5,
                      bgcolor: 'rgba(128, 239, 128, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#80EF80',
                      }
                    }}
                  />
                  <Typography variant="caption" color="rgba(255,255,255,0.7)">
                    {progressoNutricional.gordura.toFixed(0)}% da meta diária
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
{/* 
      loading  === 'a'? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress size={60} />
        </Box>
      ) :  */}

      {refeicoes.length === 0 ? (
        <Paper elevation={2} sx={{ p: 6, textAlign: 'center', borderRadius: 2, bgcolor: '#0D1117', border: '1px solid #80EF80' }}>
          <Avatar sx={{ 
            width: 100, 
            height: 100, 
            mx: 'auto', 
            mb: 3, 
            bgcolor: '#80EF80',
            color: '#010409'
          }}>
            <FastfoodOutlined sx={{ fontSize: 60 }} />
          </Avatar>
          <Typography variant="h5" gutterBottom color="#80EF80">
            Nenhuma refeição cadastrada
          </Typography>
          <Typography variant="body1" color="rgba(255,255,255,0.7)" sx={{ mb: 3 }}>
            Comece criando sua primeira refeição personalizada
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/refeicoes/novo')}
            size="large"
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(45deg, #80EF80 30%, #66CC66 90%)',
              color: '#010409',
              boxShadow: '0 3px 5px 2px rgba(128, 239, 128, .3)',
            }}
          >
            Criar Primeira Refeição
          </Button>
        </Paper>
      ) : (
        <Box>
          {refeicoes.map((refeicao, index) => (
            <Grow
              key={refeicao.id}
              in={true}
              timeout={300 + (index * 100)}
            >
              <Accordion
                expanded={expandedRefeicao === `panel-${refeicao.id}`}
                onChange={handleAccordionChange(`panel-${refeicao.id}`)}
                sx={{
                  mb: 2,
                  borderRadius: '12px !important',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': {
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
              <AccordionSummary
                expandIcon={<ExpandMore sx={{ color: '#80EF80' }} />}
                sx={{
                  borderRadius: '12px',
                  minHeight: 70,
                  backgroundColor: '#0D1117',
                  border: '1px solid #80EF80',
                  '&.Mui-expanded': {
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                    backgroundColor: '#0D1117',
                    borderColor: '#80EF80',
                  },
                  '& .MuiAccordionSummary-content': {
                    alignItems: 'center',
                    margin: '12px 0',
                  },
                  '&:hover': {
                    backgroundColor: '#010409',
                  }
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" sx={{ pr: 2 }}>
                  {/* Nome da refeição e alimentos */}
                  <Box sx={{ minWidth: 0, flex: 1, mr: 2 }}>
                    <Typography variant="h6" fontWeight="600" sx={{ fontSize: '1.1rem', mb: 0.5, color: '#80EF80' }}>
                      {refeicao.nome}
                    </Typography>
                    {/* <Typography variant="body2" color="text.secondary" sx={{ 
                      fontSize: '0.8rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: { xs: '200px', sm: '300px', md: '400px' }
                    }}>
                      {refeicao.itens.map(item => item.alimento.nome).join(', ')}
                    </Typography> */}
                  </Box>
                  
                  {/* Informações nutricionais */}
                  <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }} sx={{ flex: '0 0 auto', flexWrap: 'wrap' }}>
                    <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ 
                      whiteSpace: 'nowrap',
                      display: { xs: 'none', sm: 'block' }
                    }}>
                      {refeicao.itens.length} {refeicao.itens.length === 1 ? 'alimento' : 'alimentos'}
                    </Typography>
                    
                    <Typography variant="body2" color="#80EF80" sx={{ 
                      whiteSpace: 'nowrap', 
                      fontWeight: '500',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}>
                      {parseFloat(refeicao.total_carbo).toFixed(1)}g carbo
                    </Typography>
                    
                    <Typography variant="body2" color="#80EF80" sx={{ 
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
                <Box sx={{ backgroundColor: '#0D1117', p: 3, borderRadius: 2, border: '1px solid #80EF80' }}>
                  {/* Descrição da Refeição */}
                  {refeicao.descricao && (
                    <Box sx={{ mb: 3, p: 2, bgcolor: '#010409', borderRadius: 2, border: '1px solid #80EF80' }}>
                      <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ fontStyle: 'italic' }}>
                        "{refeicao.descricao}"
                      </Typography>
                    </Box>
                  )}

                  {/* Título da seção */}
                  <Typography variant="h6" sx={{ mb: 2, color: '#80EF80', fontWeight: '600', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Restaurant fontSize="small" />
                    Detalhes dos Alimentos ({refeicao.itens.length})
                  </Typography>
                  
                  {/* Versão Desktop - Tabela */}
                  <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: 3, bgcolor: '#0D1117', border: '1px solid #80EF80' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#010409' }}>
                            <TableCell sx={{ fontWeight: 'bold', color: '#80EF80', borderBottom: '1px solid #80EF80' }}>Alimento</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', color: '#80EF80', borderBottom: '1px solid #80EF80' }}>Quantidade</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', color: '#80EF80', borderBottom: '1px solid #80EF80' }}>Calorias</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', color: '#80EF80', borderBottom: '1px solid #80EF80' }}>Carbo</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', color: '#80EF80', borderBottom: '1px solid #80EF80' }}>Proteína</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', color: '#80EF80', borderBottom: '1px solid #80EF80' }}>Gordura</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {refeicao.itens.map((item, index) => (
                            <TableRow key={index} hover sx={{ '&:hover': { bgcolor: '#010409' } }}>
                              <TableCell sx={{ borderBottom: '1px solid rgba(128, 239, 128, 0.2)' }}>
                                <Box display="flex" alignItems="center" gap={1.5}>
                                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#80EF80', color: '#010409' }}>
                                    <Kitchen fontSize="small" />
                                  </Avatar>
                                  <Typography variant="body2" fontWeight="500" color="#ffffff">
                                    {item.alimento_nome}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="center" sx={{ borderBottom: '1px solid rgba(128, 239, 128, 0.2)' }}>
                                <Chip 
                                  label={`${item.quantidade_g}g`} 
                                  size="small" 
                                  variant="outlined"
                                  sx={{ color: '#80EF80', borderColor: '#80EF80' }}
                                />
                              </TableCell>
                              <TableCell align="center" sx={{ borderBottom: '1px solid rgba(128, 239, 128, 0.2)' }}>
                                <Typography variant="body2" fontWeight="500" color="#80EF80">
                                  {item.kcal_total.toFixed(1)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center" sx={{ borderBottom: '1px solid rgba(128, 239, 128, 0.2)' }}>
                                <Typography variant="body2" color="#80EF80">
                                  {item.carbo_total.toFixed(1)}g
                                </Typography>
                              </TableCell>
                              <TableCell align="center" sx={{ borderBottom: '1px solid rgba(128, 239, 128, 0.2)' }}>
                                <Typography variant="body2" color="#80EF80">
                                  {item.proteina_total.toFixed(1)}g
                                </Typography>
                              </TableCell>
                              <TableCell align="center" sx={{ borderBottom: '1px solid rgba(128, 239, 128, 0.2)' }}>
                                <Typography variant="body2" color="#80EF80">
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
                          <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: '#0D1117', border: '1px solid #80EF80' }}>
                            <CardContent sx={{ p: 2 }}>
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                <Box display="flex" alignItems="center" gap={1.5} flex={1}>
                                  <Avatar sx={{ width: 36, height: 36, bgcolor: '#80EF80', color: '#010409' }}>
                                    <Kitchen fontSize="small" />
                                  </Avatar>
                                  <Box flex={1}>
                                    <Typography variant="body1" fontWeight="600" noWrap color="#ffffff">
                                      {item.alimento.nome}
                                    </Typography>
                                    <Typography variant="caption" color="rgba(255,255,255,0.7)">
                                      {item.quantidade_g}g
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                              <Grid container spacing={1}>
                                <Grid item xs={3}>
                                  <Box textAlign="center">
                                    <Typography variant="h6" color="#80EF80" fontWeight="bold">
                                      {item.kcal_total.toFixed(0)}
                                    </Typography>
                                    <Typography variant="caption" color="rgba(255,255,255,0.7)">
                                      kcal
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={3}>
                                  <Box textAlign="center">
                                    <Typography variant="h6" color="#80EF80" fontWeight="bold">
                                      {item.carbo_total.toFixed(1)}
                                    </Typography>
                                    <Typography variant="caption" color="rgba(255,255,255,0.7)">
                                      carbo
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={3}>
                                  <Box textAlign="center">
                                    <Typography variant="h6" color="#80EF80" fontWeight="bold">
                                      {item.proteina_total.toFixed(1)}
                                    </Typography>
                                    <Typography variant="caption" color="rgba(255,255,255,0.7)">
                                      prot
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={3}>
                                  <Box textAlign="center">
                                    <Typography variant="h6" color="#80EF80" fontWeight="bold">
                                      {item.gordura_total.toFixed(1)}
                                    </Typography>
                                    <Typography variant="caption" color="rgba(255,255,255,0.7)">
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
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} pt={2} sx={{ borderTop: '1px solid #80EF80' }}>
                    <Typography variant="caption" color="rgba(255,255,255,0.7)" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                      sx={{ 
                        borderRadius: 2,
                        borderColor: '#d32f2f',
                        color: '#d32f2f',
                        '&:hover': {
                          borderColor: '#d32f2f',
                          backgroundColor: 'rgba(211, 47, 47, 0.04)'
                        }
                      }}
                    >
                      {deletandoId === refeicao.id ? 'Excluindo...' : 'Excluir Refeição'}
                    </Button>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
            </Grow>
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

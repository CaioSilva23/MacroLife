import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Container,
  Paper,
  IconButton,
  Tooltip,
  LinearProgress,
  Divider,
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
} from '@mui/material';
import {
  Restaurant,
  Add,
  Visibility,
  Delete,
  LocalDining,
  CalendarToday,
  FastfoodOutlined,
  Kitchen,
  Close,
  FitnessCenter,
} from '@mui/icons-material';
import { refeicoesService } from '../../services/api';

const ListaRefeicoes = ({ onCriarRefeicao }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [refeicoes, setRefeicoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refeicaoSelecionada, setRefeicaoSelecionada] = useState(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [deletandoId, setDeletandoId] = useState(null);

  // Carregar refeições ao montar o componente
  useEffect(() => {
    carregarRefeicoes();
  }, []);

  const carregarRefeicoes = async () => {
    try {
      setLoading(true);
      setError('');
      const dados = await refeicoesService.listar();
      setRefeicoes(dados);
    } catch (err) {
      setError('Erro ao carregar refeições: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deletarRefeicao = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar esta refeição?')) {
      try {
        setDeletandoId(id);
        await refeicoesService.deletar(id);
        await carregarRefeicoes(); // Recarregar lista
        setDialogAberto(false);
        setSuccess('Refeição deletada com sucesso!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Erro ao deletar refeição: ' + err.message);
        setTimeout(() => setError(''), 5000);
      } finally {
        setDeletandoId(null);
      }
    }
  };

  const abrirDetalhes = (refeicao) => {
    setRefeicaoSelecionada(refeicao);
    setDialogAberto(true);
  };

  const fecharDetalhes = () => {
    setDialogAberto(false);
    setRefeicaoSelecionada(null);
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
            <Avatar sx={{ bgcolor: 'white', color: '#667eea', width: 56, height: 56 }}>
              <Restaurant fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" sx={{ color: 'white', fontWeight: 'bold' }}>
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
        <Grid container spacing={3}>
          {refeicoes.map((refeicao) => (
            <Grid item xs={12} sm={6} lg={4} key={refeicao.id}>
              <Card 
                elevation={2} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  }
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: '#2196f3' }}>
                      <LocalDining />
                    </Avatar>
                  }
                  title={
                    <Typography variant="h6" fontWeight="bold" noWrap>
                      {refeicao.nome}
                    </Typography>
                  }
                  subheader={
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {formatarData(refeicao.data_criacao)}
                      </Typography>
                    </Box>
                  }
                />
                
                <CardContent sx={{ flexGrow: 1, pt: 0 }}>
                  {refeicao.descricao && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      paragraph
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {refeicao.descricao}
                    </Typography>
                  )}

                  {/* Resumo Nutricional */}
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Box textAlign="center" sx={{ p: 1, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          {refeicao.total_kcal}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          kcal
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box textAlign="center" sx={{ p: 1, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                        <Typography variant="h6" color="success.main" fontWeight="bold">
                          {refeicao.total_proteina}g
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          proteína
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                    <Chip
                      label={`${refeicao.total_carbo}g carbo`}
                      color="info"
                      size="small"
                    />
                    <Chip
                      label={`${refeicao.total_gordura}g gord`}
                      color="warning"
                      size="small"
                    />
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <Kitchen fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {refeicao.itens.length} {refeicao.itens.length === 1 ? 'alimento' : 'alimentos'}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={() => abrirDetalhes(refeicao)}
                    sx={{ borderRadius: 2 }}
                  >
                    Ver Detalhes
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
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
                onClick={() => deletarRefeicao(refeicaoSelecionada.id)}
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

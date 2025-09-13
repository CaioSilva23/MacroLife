import React, { useState, useEffect, useCallback } from 'react';
import { data, useNavigate } from 'react-router-dom';
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
  LinearProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Fab,
  useMediaQuery,
  useTheme,
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
  ListItemIcon,
  ListItemText,
  Menu,
  Divider,
  MenuItem,
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
  Close,
  FilterList,
  Today,
  AccountCircle,
  Logout,
  Settings,
} from '@mui/icons-material';
import { refeicoesService, userService } from '../../services/api';
import Swal from "sweetalert2";
import Header from '../Common/Header';
import authUtils from '../../utils/auth';
import ModalCadastroRefeicao from './ModalCadastroRefeicao';
// import ModalAdicionarAlimentos from './ModalAdicionarAlimentos';


export default function ListaRefeicoes({ onChatbotOpen }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { state, actions, cache } = useApp();
  
  // Estados locais
  const [expandedRefeicao, setExpandedRefeicao] = useState(false);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [refeicaoSelecionada, setRefeicaoSelecionada] = useState(null);
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false);
  const [refeicaoUpdate, setRefeicaoUpdate] = useState(null);

  const [dataFiltro, setDataFiltro] = useState(() => {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0]; // formato YYYY-MM-DD
  });
  const [macrosUsuario, setMacrosUsuario] = useState({
    calorias_diarias: 2000,
    carboidratos_diarios: 250,
    proteinas_diarias: 150,
    gorduras_diarias: 65,
  });
  
  const [perfilUsuario, setPerfilUsuario] = useState({
    objetivo: null,
    nome: ''
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
    carregarMacrosUsuario();
  }, [dataFiltro]);

  const carregarMacrosUsuario = useCallback(async () => {
    try {
      const response = await userService.profile();
      const perfil = response.data;
      
      if (perfil.macros) {
        setMacrosUsuario(perfil.macros);
      }
      
      // Carregar dados do perfil do usuário
      setPerfilUsuario({
        objetivo: perfil.objetivo,
        nome: perfil.name || ''
      });
    } catch (err) {
      console.error('Erro ao carregar macros do usuário:', err);
      // Manter valores padrão se houver erro
    }
  }, []);

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
      confirmButtonColor: "#4CAF50",
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

  const abrirModalCadastro = () => {
    setModalCadastroAberto(true);
  };

  const abrirModalCadastroComRefeicao = (refeicao) => {
    setRefeicaoUpdate(refeicao);
    setModalCadastroAberto(true)
  }

  const fecharModalCadastro = () => {
    setModalCadastroAberto(false);
  };


  const handleRefeicaoCriada = (novaRefeicao) => {
    // A refeição já foi adicionada ao contexto no modal, não precisamos fazer nada aqui
    console.log('Refeição criada com sucesso:', novaRefeicao);
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
    kcal: Math.min((totaisGerais.kcal / macrosUsuario.calorias_diarias) * 100, 100),
    carbo: Math.min((totaisGerais.carbo / macrosUsuario.carboidratos_diarios) * 100, 100),
    proteina: Math.min((totaisGerais.proteina / macrosUsuario.proteinas_diarias) * 100, 100),
    gordura: Math.min((totaisGerais.gordura / macrosUsuario.gorduras_diarias) * 100, 100),
  };

  // Calcular o que falta para atingir as metas
  const diferenciasRestantes = {
    kcal: Math.max(macrosUsuario.calorias_diarias - totaisGerais.kcal, 0),
    carbo: Math.max(macrosUsuario.carboidratos_diarios - totaisGerais.carbo, 0),
    proteina: Math.max(macrosUsuario.proteinas_diarias - totaisGerais.proteina, 0),
    gordura: Math.max(macrosUsuario.gorduras_diarias - totaisGerais.gordura, 0),
  };

  // Função para obter o texto do objetivo
  const getObjetivoTexto = (objetivo) => {
    const objetivos = {
      'emagrecer': 'Emagrecer',
      'manter': 'Manter peso',
      'ganhar': 'Ganhar peso'
    };
    return objetivos[objetivo] || 'Objetivo não definido';
  };

  // Componente de gráfico circular personalizado
  const CircularProgressChart = ({ value, color, size = 120, strokeWidth = 8, children }) => {
    const normalizedValue = Math.min(value, 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${(normalizedValue / 100) * circumference} ${circumference}`;
    
    return (
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <svg width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`${color}20`}
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={circumference / 4}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{
              transition: 'stroke-dasharray 0.6s ease-in-out',
            }}
          />
        </svg>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          {children}
        </Box>
      </Box>
    );
  };

  // Componente de mini card de macronutriente
  const MacroCard = ({ title, value, unit, color, progress, remaining }) => (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      p: 2,
      borderRadius: 2,
      bgcolor: `${color}08`,
      border: `1px solid ${color}20`,
      mb: 1.5
    }}>
      <CircularProgressChart value={progress} color={color} size={60} strokeWidth={4}>
        <Typography variant="caption" sx={{ fontWeight: 600, color: color, fontSize: '0.7rem' }}>
          {progress.toFixed(0)}%
        </Typography>
      </CircularProgressChart>
      
      <Box sx={{ ml: 2, flex: 1 }}>
        <Typography variant="h6" sx={{ color: color, fontWeight: 700, mb: 0.5 }}>
          {value} {unit}
        </Typography>
        <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 500 }}>
          {title}
        </Typography>
        {remaining > 0 && (
          <Typography variant="caption" sx={{ 
            display: 'block',
            color: '#FF6B00',
            fontWeight: 600,
            fontSize: '0.65rem',
            mt: 0.25
          }}>
            Faltam {remaining.toFixed(unit === 'kcal' ? 0 : 1)}{unit === 'kcal' ? '' : 'g'}
          </Typography>
        )}
      </Box>
    </Box>
  );

  if (loadingRefeicoes && refeicoes.length === 0) {
    return <RefeicoesSkeleton />;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Header */}

      <Header 
        onNovaRefeicao={abrirModalCadastro} 
        onChatbotOpen={onChatbotOpen} 
        refeicaoParaEditar={refeicaoUpdate}
      />

      {/* Floating Action Button para Mobile */}
      <Fab
        color="primary"
        onClick={abrirModalCadastro}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', sm: 'none' },
          background: 'linear-gradient(45deg, #4CAF50 30%, #388E3C 90%)',
          color: '#FFFFFF',
          '&:hover': {
            background: 'linear-gradient(45deg, #388E3C 30%, #2E7D32 90%)',
          }
        }}
      >
        <Add />
      </Fab>

      {/* Filtro de Data */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: '#FFFFFF', border: '1px solid #E0E0E0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Box display="flex" justifyContent="center" alignItems="center">
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            {/* Navegação de datas */}
            <Button
              variant="outlined"
              size="small"
              onClick={irParaDataAnterior}
              sx={{ 
                minWidth: 'auto', 
                px: 1,
                color: '#4CAF50',
                borderColor: '#4CAF50',
                '&:hover': {
                  borderColor: '#388E3C',
                  backgroundColor: 'rgba(76, 175, 80, 0.04)'
                }
              }}
            >
              ‹
            </Button>
{/* 
            <TextField
              type="date"
              value={dataFiltro}
              onChange={handleDataChange}
              size="small"
              sx={{ 
                minWidth: '150px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E0E0E0',
                  color: '#333333',
                  '&:hover': {
                    borderColor: '#4CAF50',
                  },
                  '&.Mui-focused': {
                    borderColor: '#4CAF50',
                  }
                },
                '& .MuiInputLabel-root': {
                  color: '#4CAF50',
                },
                '& input': {
                  color: '#333333',
                }
              }}
              InputLabelProps={{
                shrink: true,
              }}
            /> */}
            <Button
              variant="contained"
              size="small"
              startIcon={<Today />}
              onClick={irParaHoje}
              sx={{ 
                borderRadius: 2,
                ml: 1,
                textTransform: 'none',
                backgroundColor: '#4CAF50',
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: '#388E3C',
                }
              }}
            >
              {dataFiltro === formatarDataParaFiltro(new Date()) ? 'Hoje' : formatarData(dataFiltro)}
            </Button>
            <Button
              variant="outlined"
              size="small"
              disabled={dataFiltro === formatarDataParaFiltro(new Date())}
              onClick={irParaProximaData}
              sx={{ 
                minWidth: 'auto', 
                px: 1,
                color: '#4CAF50',
                borderColor: '#4CAF50',
                '&:hover': {
                  borderColor: '#388E3C',
                  backgroundColor: 'rgba(76, 175, 80, 0.04)'
                }
              }}
            >
              ›
            </Button>


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

      {/* Resumo Nutricional com Gráficos */}
      <Card elevation={1} sx={{ 
        mb: 3, 
        borderRadius: 3, 
        bgcolor: 'rgba(255, 255, 255, 0.98)', 
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(76, 175, 80, 0.1)', 
        boxShadow: '0 4px 20px rgba(76, 175, 80, 0.1)' 
      }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3
          }}>
            <Box>
              <Typography variant="h5" sx={{ 
                fontWeight: 700, 
                color: '#2E7D32',
                mb: 0.5,
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}>
                Dashboard Nutricional
              </Typography>
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexWrap: 'wrap'
              }}>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(46, 125, 50, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontSize: '0.9rem'
                }}>
                  <Box component="span" sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: '#4CAF50' 
                  }} />
                  {getObjetivoTexto(perfilUsuario.objetivo)}
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: 'rgba(51,51,51,0.6)',
                  fontSize: '0.8rem'
                }}>
                  • {refeicoes.length} {refeicoes.length === 1 ? 'refeição' : 'refeições'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" sx={{ 
                color: '#2E7D32',
                fontWeight: 600,
                mb: 0.5
              }}>
                {totaisGerais.kcal.toFixed(0)} kcal
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'rgba(51,51,51,0.5)',
                fontSize: '0.75rem'
              }}>
                {new Date(dataFiltro).toLocaleDateString('pt-BR')}
              </Typography>
            </Box>
          </Box>

          {/* Layout Principal com Gráfico Central e Cards Laterais */}
          <Grid container spacing={3} alignItems="stretch" justifyContent="center">

            {/* Coluna Esquerda - Cards dos Macros */}
            <Grid item xs={12} md={4}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <MacroCard
                  title="Calorias"
                  value={totaisGerais.kcal.toFixed(0)}
                  unit="kcal"
                  color="#4CAF50"
                  progress={progressoNutricional.kcal}
                  remaining={diferenciasRestantes.kcal}
                />
                <MacroCard
                  title="Carboidratos"
                  value={totaisGerais.carbo.toFixed(1)}
                  unit="g"
                  color="#FF9800"
                  progress={progressoNutricional.carbo}
                  remaining={diferenciasRestantes.carbo}
                />
              </Box>
            </Grid>

            {/* Coluna Central - Gráfico Principal */}
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                height: '100%',
                justifyContent: 'center',
                py: 2
              }}>
                {/* Gráfico Circular Principal para Calorias */}
                <CircularProgressChart 
                  value={progressoNutricional.kcal} 
                  color="#4CAF50" 
                  size={180} 
                  strokeWidth={12}
                >
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    color: '#4CAF50',
                    fontSize: { xs: '2rem', sm: '2.5rem' }
                  }}>
                    {progressoNutricional.kcal.toFixed(0)}%
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: '#666',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    fontWeight: 600,
                    mt: -0.5
                  }}>
                    Meta Diária
                  </Typography>
                </CircularProgressChart>

                {/* Indicadores de Status */}
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  {progressoNutricional.kcal >= 100 ? (
                    <Chip 
                      label="Meta Atingida! 🎯" 
                      color="success" 
                      variant="filled"
                      sx={{ fontWeight: 600 }}
                    />
                  ) : diferenciasRestantes.kcal <= 300 ? (
                    <Chip 
                      label="Quase lá! 💪" 
                      color="warning" 
                      variant="filled"
                      sx={{ fontWeight: 600 }}
                    />
                  ) : (
                    <Chip 
                      label={`Faltam ${diferenciasRestantes.kcal.toFixed(0)} kcal`}
                      color="primary" 
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                </Box>
              </Box>
            </Grid>

            {/* Coluna Direita - Cards dos Macros */}
            <Grid item xs={12} md={4}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <MacroCard
                  title="Proteínas"
                  value={totaisGerais.proteina.toFixed(1)}
                  unit="g"
                  color="#2196F3"
                  progress={progressoNutricional.proteina}
                  remaining={diferenciasRestantes.proteina}
                />
                <MacroCard
                  title="Gorduras"
                  value={totaisGerais.gordura.toFixed(1)}
                  unit="g"
                  color="#9C27B0"
                  progress={progressoNutricional.gordura}
                  remaining={diferenciasRestantes.gordura}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Footer com Metas */}
          <Box sx={{ 
            mt: 3, 
            pt: 2, 
            borderTop: '1px solid rgba(76, 175, 80, 0.1)',
            bgcolor: 'rgba(76, 175, 80, 0.02)',
            borderRadius: 2,
            p: 2
          }}>
            <Typography variant="body2" sx={{ 
              color: '#2E7D32',
              textAlign: 'center',
              fontWeight: 600,
              mb: 1
            }}>
              Metas Diárias Estabelecidas
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 700 }}>
                    {macrosUsuario.calorias_diarias}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>kcal</Typography>
                </Box>
              </Grid>
              <Grid item>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 700 }}>
                    {macrosUsuario.carboidratos_diarios}g
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>carb</Typography>
                </Box>
              </Grid>
              <Grid item>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#2196F3', fontWeight: 700 }}>
                    {macrosUsuario.proteinas_diarias}g
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>prot</Typography>
                </Box>
              </Grid>
              <Grid item>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#9C27B0', fontWeight: 700 }}>
                    {macrosUsuario.gorduras_diarias}g
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>gord</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
      
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
              expandIcon={<ExpandMore sx={{ color: '#4CAF50' }} />}
              sx={{
                borderRadius: '12px',
                minHeight: 70,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E0E0E0',
                '&.Mui-expanded': {
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                  backgroundColor: '#FFFFFF',
                  borderColor: '#4CAF50',
                },
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                  margin: '12px 0',
                },
                '&:hover': {
                  backgroundColor: '#F5F5F5',
                }
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" sx={{ pr: 2 }}>
                {/* Nome da refeição e alimentos */}
                <Box sx={{ minWidth: 0, flex: 1, mr: 2 }}>
                  <Typography variant="h6" fontWeight="600" sx={{ fontSize: '1.1rem', mb: 0.5, color: '#333333' }}>
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
                  <Typography variant="body2" color="rgba(51,51,51,0.7)" sx={{ 
                    whiteSpace: 'nowrap',
                    display: { xs: 'none', sm: 'block' }
                  }}>
                    {refeicao.itens.length} {refeicao.itens.length === 1 ? 'alimento' : 'alimentos'}
                  </Typography>
                  
                  <Typography variant="body2" color="#FF9800" sx={{ 
                    whiteSpace: 'nowrap', 
                    fontWeight: '500',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}>
                    {parseFloat(refeicao.total_carbo).toFixed(1)}g carbo
                  </Typography>
                  
                  <Typography variant="body2" color="#9C27B0" sx={{ 
                    whiteSpace: 'nowrap', 
                    fontWeight: '500',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}>
                    {parseFloat(refeicao.total_gordura).toFixed(1)}g gord
                  </Typography>
                  
                  <Typography variant="body2" color="#FFC107" sx={{ 
                    whiteSpace: 'nowrap', 
                    fontWeight: '500',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}>
                    {parseFloat(refeicao.total_proteina).toFixed(1)}g prot
                  </Typography>
                  
                  <Typography variant="h6" color="#4CAF50" sx={{ 
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
              <Box sx={{ backgroundColor: '#FFFFFF', p: 3, borderRadius: 2, border: '1px solid #E0E0E0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                {/* Descrição da Refeição */}
                {refeicao.descricao && (
                  <Box sx={{ mb: 3, p: 2, bgcolor: '#F5F5F5', borderRadius: 2, border: '1px solid #E0E0E0' }}>
                    <Typography variant="body2" color="rgba(51,51,51,0.7)" sx={{ fontStyle: 'italic' }}>
                      "{refeicao.descricao}"
                    </Typography>
                  </Box>
                )}
              {refeicao.itens.length === 0 ? (
                <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }} sx={{ flex: '0 0 auto', flexWrap: 'wrap' }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhum alimento adicionado a esta refeição.
                </Typography>
                  <Button
                    variant="outlined"
                    color="success"
                    startIcon={<Add />}
                    onClick={() => abrirModalCadastroComRefeicao(refeicao)}
                    size="small"
                    sx={{ 
                      borderRadius: 2,
                      borderColor: '#4CAF50',
                      color: '#4CAF50',
                      '&:hover': {
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(211, 47, 47, 0.04)'
                      }
                    }}
                  >
                      Adicionar Alimentos
                  </Button>
                </Box>
              ) : (
                <>
                {/* Título da seção */}
                <Typography variant="h6" sx={{ mb: 2,color: '#333333', fontWeight: '600', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Restaurant fontSize="small" />
                  Detalhes dos Alimentos ({refeicao.itens.length})
                </Typography>
                
                {/* Versão Desktop - Tabela */}
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: 3, bgcolor: '#FFFFFF', border: '1px solid #E0E0E0' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#F5F5F5' }}>
                          <TableCell sx={{ fontWeight: 'bold', color: '#333333', borderBottom: '1px solid #E0E0E0' }}>Alimento</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', color: '#333333', borderBottom: '1px solid #E0E0E0' }}>Quantidade</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', color: '#333333', borderBottom: '1px solid #E0E0E0' }}>Calorias</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', color: '#333333', borderBottom: '1px solid #E0E0E0' }}>Carbo</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', color: '#333333', borderBottom: '1px solid #E0E0E0' }}>Proteína</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', color: '#333333', borderBottom: '1px solid #E0E0E0' }}>Gordura</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {refeicao.itens.map((item, index) => (
                          <TableRow key={index} hover sx={{ '&:hover': { bgcolor: '#F5F5F5' } }}>
                            <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 0.5)' }}>
                              <Box display="flex" alignItems="center" gap={1.5}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: '#4CAF50', color: '#FFFFFF' }}>
                                  <Kitchen fontSize="small" />
                                </Avatar>
                                <Typography variant="body2" fontWeight="500" color="#333333">
                                  {item.alimento_nome}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center" sx={{ borderBottom: '1px solid rgba(224, 224, 224, 0.5)' }}>
                              <Chip 
                                label={`${item.quantidade_g}g`} 
                                size="small" 
                                variant="outlined"
                                sx={{ color: '#4CAF50', borderColor: '#4CAF50' }}
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ borderBottom: '1px solid rgba(224, 224, 224, 0.5)' }}>
                              <Typography variant="body2" fontWeight="500" color="#4CAF50">
                                {item.kcal_total.toFixed(1)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center" sx={{ borderBottom: '1px solid rgba(224, 224, 224, 0.5)' }}>
                              <Typography variant="body2" color="#FF9800">
                                {item.carbo_total.toFixed(1)}g
                              </Typography>
                            </TableCell>
                            <TableCell align="center" sx={{ borderBottom: '1px solid rgba(224, 224, 224, 0.5)' }}>
                              <Typography variant="body2" color="#FFC107">
                                {item.proteina_total.toFixed(1)}g
                              </Typography>
                            </TableCell>
                            <TableCell align="center" sx={{ borderBottom: '1px solid rgba(224, 224, 224, 0.5)' }}>
                              <Typography variant="body2" color="#FF9800">
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
                        <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: '#FFFFFF', border: '1px solid #E0E0E0' }}>
                          <CardContent sx={{ p: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                              <Box display="flex" alignItems="center" gap={1.5} flex={1}>
                                <Avatar sx={{ width: 36, height: 36, bgcolor: '#4CAF50', color: '#FFFFFF' }}>
                                  <Kitchen fontSize="small" />
                                </Avatar>
                                <Box flex={1}>
                                  <Typography variant="body1" fontWeight="600" noWrap color="#333333">
                                    {item.alimento.nome}
                                  </Typography>
                                  <Typography variant="caption" color="rgba(51,51,51,0.7)">
                                    {item.quantidade_g}g
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                            <Grid container spacing={1}>
                              <Grid item xs={3}>
                                <Box textAlign="center">
                                  <Typography variant="h6" color="#4CAF50" fontWeight="bold">
                                    {item.kcal_total.toFixed(0)}
                                  </Typography>
                                  <Typography variant="caption" color="rgba(51,51,51,0.7)">
                                    kcal
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={3}>
                                <Box textAlign="center">
                                  <Typography variant="h6" color="#FF9800" fontWeight="bold">
                                    {item.carbo_total.toFixed(1)}
                                  </Typography>
                                  <Typography variant="caption" color="rgba(51,51,51,0.7)">
                                    carbo
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={3}>
                                <Box textAlign="center">
                                  <Typography variant="h6" color="#FFC107" fontWeight="bold">
                                    {item.proteina_total.toFixed(1)}
                                  </Typography>
                                  <Typography variant="caption" color="rgba(51,51,51,0.7)">
                                    prot
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={3}>
                                <Box textAlign="center">
                                  <Typography variant="h6" color="#FF9800" fontWeight="bold">
                                    {item.gordura_total.toFixed(1)}
                                  </Typography>
                                  <Typography variant="caption" color="rgba(51,51,51,0.7)">
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
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} pt={2} sx={{ borderTop: '1px solid #E0E0E0' }}>
                  <Typography variant="caption" color="rgba(51,51,51,0.7)" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday fontSize="small" />
                    Criado em {formatarData(refeicao.data_criacao)}
                  </Typography>
                {refeicao.essencial !== true && (
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
                )}


                  <Button
                    variant="outlined"
                    color="success"
                    startIcon={<Add />}
                    onClick={() => abrirModalCadastroComRefeicao(refeicao)}
                    size="small"
                    sx={{ 
                      borderRadius: 2,
                      borderColor: '#4CAF50',
                      color: '#4CAF50',
                      '&:hover': {
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(211, 47, 47, 0.04)'
                      }
                    }}
                  >
                    Editar Refeição
                  </Button>
                </Box>
                </>
              )}

              </Box>
            </AccordionDetails>
          </Accordion>
          </Grow>
        ))}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => abrirModalCadastro()}
            size="large"
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(45deg, #4CAF50 30%, #388E3C 90%)',
              color: '#FFFFFF',
              boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
            }}
          >
            Nova Refeição
          </Button>

      </Box>
        {/* <Paper elevation={2} sx={{ p: 6, textAlign: 'center', borderRadius: 2, bgcolor: '#FFFFFF', border: '1px solid #E0E0E0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}> */}
          {/* <Avatar sx={{ 
            width: 100, 
            height: 100, 
            mx: 'auto', 
            mb: 3, 
            bgcolor: '#4CAF50',
            color: '#FFFFFF'
          }}>
            <FastfoodOutlined sx={{ fontSize: 60 }} />
          </Avatar>
          <Typography variant="h5" gutterBottom color="#333333">
            Nenhuma refeição cadastrada
          </Typography>
          <Typography variant="body1" color="rgba(51,51,51,0.7)" sx={{ mb: 3 }}>
            Comece criando sua primeira refeição personalizada
          </Typography> */}

        {/* </Paper> */}

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

      {/* Modal de Cadastro de Refeição */}
      <ModalCadastroRefeicao
        open={modalCadastroAberto}
        onClose={fecharModalCadastro}
        refeicaoParaEditar={refeicaoUpdate}
        onRefeicaoCriada={handleRefeicaoCriada}
        dataRefeicao={dataFiltro}
      />
    </Container>
  );
};

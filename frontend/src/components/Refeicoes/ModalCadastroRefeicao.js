import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  Grid,
  Autocomplete,
  Alert,
  CircularProgress,
  Chip,
  Avatar,
  InputAdornment,
  IconButton,
  Divider,
  Paper,
  Stack,
  useMediaQuery,
  useTheme,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Restaurant,
  Add,
  Delete,
  Save,
  Close,
  Scale,
  Search,
  Kitchen,
  LocalDining,
} from '@mui/icons-material';
import { alimentosService, refeicoesService } from '../../services/api';
import Swal from "sweetalert2";

const ModalCadastroRefeicao = ({ open, onClose, refeicaoParaEditar, onRefeicaoCriada, dataRefeicao }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { state, actions, cache } = useApp();
  
  // Estados locais do formulário
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [alimentoSelecionado, setAlimentoSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState('');
  const [itensRefeicao, setItensRefeicao] = useState([]);

  // Efeito para carregar dados da refeição a ser editada
  useEffect(() => {
    if (refeicaoParaEditar) {
      setNome(refeicaoParaEditar.nome);
      setDescricao(refeicaoParaEditar.descricao);
      setItensRefeicao(refeicaoParaEditar.itens);
    }

    console.log('Refeição para editar:', refeicaoParaEditar);
  }, [refeicaoParaEditar]);

  const [busca, setBusca] = useState('');
  const [mostrarLista, setMostrarLista] = useState(false);

  // Estados do contexto
  const { alimentos } = state;
  const { loading, errors } = state;
  const loadingAlimentos = loading.alimentos;
  const loadingCriando = loading.criando;
  const error = errors.cadastro;

  // Carregar alimentos ao abrir o modal
  useEffect(() => {
    if (open) {
      carregarAlimentos();
    }
  }, [open]);

  // Buscar alimentos quando a busca mudar
  useEffect(() => {
    if (open && busca.length >= 2) {
      carregarAlimentos(busca);
    } else if (open && busca.length === 0) {
      carregarAlimentos();
    }
  }, [busca, open]);

  // Resetar formulário quando fechar
  useEffect(() => {
    if (!open) {
      resetarFormulario();
    }
  }, [open]);

  const resetarFormulario = () => {
    setNome('');
    setDescricao('');
    setAlimentoSelecionado(null);
    setQuantidade('');
    setItensRefeicao([]);
    setBusca('');
    setMostrarLista(false);
    actions.clearError('cadastro');
  };

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

    console.log('Alimento selecionado:', alimentoSelecionado);
    console.log('Quantidade:', quantidade);
    const novoItem = {
      alimento_id: alimentoSelecionado.id,
      nome: alimentoSelecionado.nome,
      quantidade_g: parseFloat(quantidade),
      kcal_total: (alimentoSelecionado.energia_kcal / 100) * parseFloat(quantidade),
      carbo_total: (alimentoSelecionado.carboidratos_g / 100) * parseFloat(quantidade),
      proteina_total: (alimentoSelecionado.proteinas_g / 100) * parseFloat(quantidade),
      gordura_total: (alimentoSelecionado.lipideos_g / 100) * parseFloat(quantidade),
    };

    console.log('Adicionando item:', novoItem);

    setItensRefeicao([...itensRefeicao, novoItem]);
    setAlimentoSelecionado(null);
    setQuantidade('');
    setMostrarLista(true);
    setBusca(''); // Limpar busca para recarregar lista padrão
    carregarAlimentos(); // Recarregar lista padrão
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

  const editarRefeicao = useCallback(async () => {
    if (!nome.trim()) {
      actions.setError('cadastro', 'Nome da refeição é obrigatório');
      return;
    }

    if (itensRefeicao.length === 0) {
      actions.setError('cadastro', 'Adicione pelo menos um alimento à refeição');
      return;
    }

    try {
      actions.setLoading('editando', true);
      actions.clearError('cadastro');

      console.log('Refeição para editar:', itensRefeicao);

      const dadosRefeicao = {
        id: refeicaoParaEditar.id,
        nome: nome,
        descricao: descricao,
        itens: itensRefeicao.map(item => ({
          alimento_id: item.alimento || item.alimento_id,
          quantidade_g: item.quantidade_g,
        })),
      };

      console.log('Dados para atualizar refeição:', dadosRefeicao);

      const response = await refeicoesService.atualizar(refeicaoParaEditar.id, dadosRefeicao);
      actions.updateRefeicao(response.data);
      Swal.fire("Sucesso", "A refeição foi editada com sucesso!", "success");

      if (onRefeicaoCriada) {
        onRefeicaoCriada(response.data);
      }

      onClose();

    } catch (err) {
      Swal.fire("Erro!", "Erro ao tentar editar a refeição, tente novamente.", "error");
      actions.setError('cadastro', 'Erro ao editar refeição: ' + err.message);
    } finally {
      actions.setLoading('editando', false);
    }
  }, [nome, descricao, itensRefeicao, actions, onClose, onRefeicaoCriada, refeicaoParaEditar]);

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
          alimento_id: item.alimento || item.alimento_id,
          quantidade_g: item.quantidade_g,
        })),
      };

      const response = await refeicoesService.criar(dadosRefeicao);
      
      // Usar a data da refeição passada como prop ou a data atual como fallback
      const dataParaCache = dataRefeicao || new Date().toISOString().split('T')[0];
      actions.addRefeicao(response.data, dataParaCache);
      
      Swal.fire("Sucesso", "A refeição foi criada com sucesso!", "success");

      if (onRefeicaoCriada) {
        onRefeicaoCriada(response.data);
      }

      onClose();
      
    } catch (err) {
      Swal.fire("Erro!", "Erro ao tentar criar a refeição, tente novamente.", "error");
      actions.setError('cadastro', 'Erro ao criar refeição: ' + err.message);
    } finally {
      actions.setLoading('criando', false);
    }
  }, [nome, descricao, itensRefeicao, actions, onClose, onRefeicaoCriada, dataRefeicao]);

  const totais = calcularTotais();

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth 
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          maxHeight: '95vh',
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ 
        p: 3,
        background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
        color: '#FFFFFF'
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#FFFFFF', width: 56, height: 56 }}>
              <Restaurant fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Nova Refeição
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Preencha os dados e adicione alimentos
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{ 
              color: '#FFFFFF',
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, mt: 2 }}>
        {/* Alertas */}
        <Collapse in={Boolean(error)}>
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }} 
            onClose={() => actions.clearError('cadastro')}
          >
            {error}
          </Alert>
        </Collapse>

        {/* Formulário Principal */}
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          
          {/* Nome da Refeição */}
          <TextField
            fullWidth
            label="Nome da Refeição *"
            disabled={refeicaoParaEditar}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            variant="outlined"
            placeholder="Ex: Café da manhã, Almoço, Jantar..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocalDining color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />

          {/* Descrição */}
          <TextField
            fullWidth
            label="Descrição (opcional)"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            variant="outlined"
            placeholder="Adicione detalhes sobre a refeição..."
            multiline
            rows={2}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />

          <Divider sx={{ my: 0.2 }}>
            <Typography variant="body2" color="text.secondary">
              Adicionar Alimentos
            </Typography>
          </Divider>

          {/* Buscar Alimento */}
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
                placeholder="Digite o nome do alimento..."
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
                  }
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Avatar sx={{ bgcolor: '#4CAF50', width: 40, height: 40 }}>
                    <Kitchen fontSize="small" />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" fontWeight="medium">
                      {option.nome}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.energia_kcal} kcal • {option.proteinas_g}g proteína • {option.carboidratos_g}g carboidrato
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
            noOptionsText={
              <Box textAlign="center" py={2}>
                <Typography variant="body2" color="text.secondary">
                  {busca.length < 2 ? 'Digite pelo menos 2 caracteres para buscar' : 'Nenhum alimento encontrado'}
                </Typography>
              </Box>
            }
          />

          {/* Quantidade e Botão Adicionar */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <TextField
              label="Quantidade (gramas)"
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              inputProps={{ min: 0, step: 1 }}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Scale color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder="Ex: 100"
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
            <Button
              variant="contained"
              onClick={adicionarItem}
              disabled={!alimentoSelecionado || !quantidade || quantidade <= 0}
              startIcon={<Add />}
              size="large"
              sx={{ 
                borderRadius: 2,
                bgcolor: '#4CAF50',
                px: 3,
                height: 56,
                '&:hover': { bgcolor: '#388E3C' }
              }}
            >
              Adicionar
            </Button>
          </Box>

          {/* Resumo dos Totais */}
          {itensRefeicao.length > 0 && (
            <Paper sx={{ p: 2, bgcolor: '#F5F5F5', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.primary" gutterBottom fontWeight="bold">
                Resumo Nutricional
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                <Chip 
                  label={`${totais.kcal.toFixed(0)} kcal`} 
                  size="small" 
                  sx={{ bgcolor: '#4CAF50', color: 'white', fontWeight: 'bold' }}
                />
                <Chip 
                  label={`${totais.carbo.toFixed(1)}g carbo`} 
                  size="small" 
                  sx={{ bgcolor: '#FF9800', color: 'white', fontWeight: 'bold' }}
                />
                <Chip 
                  label={`${totais.proteina.toFixed(1)}g prot`} 
                  size="small" 
                  sx={{ bgcolor: '#2196F3', color: 'white', fontWeight: 'bold' }}
                />
                <Chip 
                  label={`${totais.gordura.toFixed(1)}g gord`} 
                  size="small" 
                  sx={{ bgcolor: '#9C27B0', color: 'white', fontWeight: 'bold' }}
                />
              </Stack>
            </Paper>
          )}

          {/* Lista de Alimentos */}
          {itensRefeicao.length > 0 && (
            <Box>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Alimentos Adicionados ({itensRefeicao.length})
                </Typography>
                <Button
                  size="small"
                  onClick={() => setMostrarLista(!mostrarLista)}
                  variant="outlined"
                >
                  {mostrarLista ? 'Ocultar' : 'Mostrar'} Lista
                </Button>
              </Box>

              <Collapse in={mostrarLista}>
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, maxHeight: 300 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F5F5F5' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Alimento</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Qtd (g)</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Kcal</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Carbo (g)</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Prot (g)</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Gord (g)</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {itensRefeicao.map((item, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {item.nome||item.alimento_nome}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">
                              {item.quantidade_g}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight="medium" color="#4CAF50">
                              {item.kcal_total.toFixed(0)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" color="#FF9800">
                              {item.carbo_total.toFixed(1)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" color="#2196F3">
                              {item.proteina_total.toFixed(1)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" color="#9C27B0">
                              {item.gordura_total.toFixed(1)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              color="error"
                              onClick={() => removerItem(index)}
                              size="small"
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Collapse>
            </Box>
          )}

          {/* Estado Vazio */}
          {itensRefeicao.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#FAFAFA', border: '2px dashed #E0E0E0', borderRadius: 2 }}>
              <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: '#E0E0E0' }}>
                <Restaurant fontSize="large" />
              </Avatar>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Nenhum alimento adicionado
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use os campos acima para buscar e adicionar alimentos à sua refeição
              </Typography>
            </Paper>
          )}
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
          sx={{ borderRadius: 2, px: 2 }}
        >
          Cancelar
        </Button>
        <Button
          onClick={refeicaoParaEditar ? editarRefeicao : salvarRefeicao}
          disabled={loadingCriando || !nome.trim() || itensRefeicao.length === 0}
          variant="contained"
          size="large"
          startIcon={loadingCriando ? <CircularProgress size={20} color="inherit" /> : <Save />}
          sx={{ 
            borderRadius: 2,
            bgcolor: '#4CAF50',
            px: 2,
            '&:hover': { bgcolor: '#388E3C' },
            '&:disabled': {
              bgcolor: '#E0E0E0',
              color: '#9E9E9E'
            }
          }}
        >
          {loadingCriando ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalCadastroRefeicao;

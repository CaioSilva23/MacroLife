import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Dialog,
  DialogContent,
  Slide,
  Fade,
  useTheme,
  alpha,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Send as SendIcon,
  Psychology as BotIcon,
  Person as UserIcon,
  Close as CloseIcon,
  DeleteOutline as ClearIcon
} from '@mui/icons-material';
import { api } from '../../services/api';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ChatbotComponent = ({ open, onClose }) => {
  const theme = useTheme();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typeIntervalRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Separar o efeito de scroll para typingText para evitar conflitos
  useEffect(() => {
    if (isTyping && typingText) {
      scrollToBottom();
    }
  }, [typingText, isTyping, scrollToBottom]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Cleanup do interval quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (typeIntervalRef.current) {
        clearInterval(typeIntervalRef.current);
      }
    };
  }, []);

  // Efeito de digitação para simular streaming - otimizado
  const typeMessage = useCallback((text, callback) => {
    setIsTyping(true);
    setTypingText('');
    
    let index = 0;
    const typeSpeed = 50; // velocidade de digitação em ms - aumentei para reduzir atualizações
    
    // Limpa interval anterior se existir
    if (typeIntervalRef.current) {
      clearInterval(typeIntervalRef.current);
    }
    
    typeIntervalRef.current = setInterval(() => {
      if (index < text.length) {
        // Atualiza em chunks maiores para reduzir re-renderizações
        const nextIndex = Math.min(index + 2, text.length);
        setTypingText(text.slice(0, nextIndex));
        index = nextIndex;
      } else {
        clearInterval(typeIntervalRef.current);
        typeIntervalRef.current = null;
        setIsTyping(false);
        setTypingText('');
        if (callback) callback();
      }
    }, typeSpeed);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading || isTyping) return;

    const userMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    // Adiciona mensagem do usuário imediatamente
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      const requestData = {
        message: currentInput,
        create_new_session: !currentSessionId
      };
      
      if (currentSessionId) {
        requestData.session_id = currentSessionId;
      }

      const response = await api.post('/chatbot/sessions/send_message/', requestData);

      // Verifica se a resposta tem a estrutura esperada de sucesso
      if (response.data?.assistant_message) {
        const botMessage = {
          role: 'assistant',
          content: response.data.assistant_message.content,
          timestamp: response.data.assistant_message.timestamp,
          tokens_used: response.data.tokens_used,
          response_time: response.data.response_time
        };

        setCurrentSessionId(response.data.session_id);
        setIsLoading(false);
        
        // Simula efeito de digitação
        typeMessage(response.data.assistant_message.content, () => {
          setMessages(prev => [...prev, botMessage]);
        });

      } else {
        throw new Error(response.data?.error || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('Erro no chatbot:', error);
      setIsLoading(false);
      
      const errorMessage = {
        role: 'assistant',
        content: error.response?.data?.error || 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes.',
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  }, [inputMessage, isLoading, isTyping, currentSessionId, typeMessage]);

  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Limpar conversa
  const clearConversation = useCallback(() => {
    setMessages([]);
    setCurrentSessionId(null);
    setTypingText('');
    setIsTyping(false);
    if (typeIntervalRef.current) {
      clearInterval(typeIntervalRef.current);
      typeIntervalRef.current = null;
    }
  }, []);

  // Fechar dialog
  const handleClose = useCallback(() => {
    if (typeIntervalRef.current) {
      clearInterval(typeIntervalRef.current);
      typeIntervalRef.current = null;
    }
    setIsTyping(false);
    setTypingText('');
    onClose();
  }, [onClose]);

  const handleSuggestionClick = useCallback((suggestion) => {
    const text = suggestion.split(' ').slice(1).join(' ');
    setInputMessage(text);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const MessageBubble = React.memo(({ message }) => {
    const isUser = message.role === 'user';
    const isError = message.isError;
    
    return (
      <Box
        sx={{
            display: 'flex',
            justifyContent: isUser ? 'flex-end' : 'flex-start',
            mb: 2,
            alignItems: 'flex-end'
          }}
          role="group"
          aria-label={`Mensagem ${isUser ? 'do usuário' : 'do assistente'}`}
        >
          {!isUser && (
            <Avatar
              sx={{
                bgcolor: isError ? theme.palette.error.main : theme.palette.primary.main,
                width: 32,
                height: 32,
                mr: 1,
                mb: 0.5
              }}
              aria-label="Avatar do assistente"
            >
              <BotIcon sx={{ fontSize: 18 }} />
            </Avatar>
          )}
          
          <Paper
            elevation={1}
            sx={{
              p: 1.5,
              maxWidth: '75%',
              bgcolor: isUser 
                ? theme.palette.primary.main 
                : isError
                ? alpha(theme.palette.error.main, 0.1)
                : alpha(theme.palette.grey[100], 0.8),
              color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
              borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              border: isError ? `1px solid ${theme.palette.error.main}` : 'none'
            }}
            role="article"
            aria-label={`Mensagem: ${message.content}`}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                lineHeight: 1.4,
                whiteSpace: 'pre-wrap',
                fontSize: '0.9rem'
              }}
            >
              {message.content}
            </Typography>
            
            {message.tokens_used && (
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block',
                  mt: 0.5,
                  opacity: 0.7,
                  fontSize: '0.7rem'
                }}
                aria-label={`Informações técnicas: ${message.tokens_used} tokens usados, tempo de resposta ${message.response_time?.toFixed(2)} segundos`}
              >
                {message.tokens_used} tokens • {message.response_time?.toFixed(2)}s
              </Typography>
            )}
          </Paper>
          
          {isUser && (
            <Avatar
              sx={{
                bgcolor: theme.palette.secondary.main,
                width: 32,
                height: 32,
                ml: 1,
                mb: 0.5
              }}
              aria-label="Avatar do usuário"
            >
              <UserIcon sx={{ fontSize: 18 }} />
            </Avatar>
          )}
        </Box>
    );
  });

  const TypingIndicator = React.memo(() => {
    if (!isTyping) return null;
    
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          mb: 2,
          alignItems: 'flex-end'
        }}
        role="status"
        aria-label="Assistente está digitando"
      >
        <Avatar
          sx={{
            bgcolor: theme.palette.primary.main,
            width: 32,
            height: 32,
            mr: 1,
            mb: 0.5
          }}
        >
          <BotIcon sx={{ fontSize: 18 }} />
        </Avatar>
        
        <Paper
          elevation={1}
          sx={{
            p: 1.5,
            maxWidth: '75%',
            bgcolor: alpha(theme.palette.grey[100], 0.8),
            borderRadius: '18px 18px 18px 4px'
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              lineHeight: 1.4,
              whiteSpace: 'pre-wrap',
              fontSize: '0.9rem',
              minHeight: '1.2em'
            }}
          >
            {typingText}
            {isTyping && (
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  width: '2px',
                  height: '1em',
                  bgcolor: theme.palette.primary.main,
                  ml: 0.5,
                  opacity: 0.7
                }}
              />
            )}
          </Typography>
        </Paper>
      </Box>
    );
  });

  const WelcomeMessage = React.memo(() => (
    <Box sx={{ textAlign: 'center', py: 3 }}>
        <Avatar
          sx={{
            bgcolor: theme.palette.primary.main,
            width: 60,
            height: 60,
            mx: 'auto',
            mb: 2
          }}
        >
          <BotIcon sx={{ fontSize: 30 }} />
        </Avatar>
        <Typography variant="h6" gutterBottom color="primary">
          Assistente Nutricional
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Olá! Sou seu assistente nutricional inteligente. 
          Como posso ajudar você hoje?
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
          {[
            '🥗 Dicas de alimentação',
            '🔄 Substituições saudáveis',
            '📊 Informações nutricionais',
            '🎯 Objetivos de peso'
          ].map((suggestion, index) => (
            <Box
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              sx={{
                cursor: 'pointer',
                p: 1,
                borderRadius: '20px',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.2)
                },
                transition: 'background-color 0.2s ease'
              }}
              role="button"
              tabIndex={0}
              aria-label={`Sugestão: ${suggestion}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSuggestionClick(suggestion);
                }
              }}
            >
              <Typography variant="caption" color="primary">
                {suggestion}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
  ));

  return (
    <Dialog
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            height: '80vh',
            maxHeight: '600px',
            borderRadius: '16px',
            overflow: 'hidden'
          }
        }}
        aria-labelledby="chatbot-dialog-title"
        aria-describedby="chatbot-dialog-description"
      >
        {/* Header */}
        <Box
          sx={{
            bgcolor: theme.palette.primary.main,

            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.contrastText,
                color: theme.palette.primary.main,
                width: 40,
                height: 40,
                mr: 2
              }}
            >
              <BotIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">
                Assistente Nutricional
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Powered by Groq AI
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {messages.length > 0 && (
              <IconButton 
                onClick={clearConversation} 
                sx={{ color: 'inherit' }}
                aria-label="Limpar conversa"
                title="Limpar conversa"
              >
                <ClearIcon />
              </IconButton>
            )}
            <IconButton 
              onClick={handleClose} 
              sx={{ color: 'inherit' }}
              aria-label="Fechar chatbot"
              title="Fechar"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Messages Area */}
        <DialogContent
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            p: 0,
            bgcolor: '#fafafa'
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              '&::-webkit-scrollbar': {
                width: '6px'
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: alpha(theme.palette.grey[300], 0.1)
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: alpha(theme.palette.grey[500], 0.3),
                borderRadius: '3px'
              }
            }}
          >
            {messages.length === 0 ? (
              <WelcomeMessage />
            ) : (
              <>
                {messages.map((message, index) => (
                  <MessageBubble key={index} message={message} />
                ))}
                {isTyping && <TypingIndicator />}
              </>
            )}
            <div ref={messagesEndRef} />
          </Box>

          <Divider />

          {/* Input Area */}
          <Box sx={{ p: 2, bgcolor: 'white' }}>
            {(isLoading || isTyping) && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="caption" color="text.secondary">
                  {isLoading ? 'Enviando mensagem...' : 'Assistente está digitando...'}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
              <TextField
                ref={inputRef}
                fullWidth
                multiline
                maxRows={3}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua pergunta sobre nutrição..."
                disabled={isLoading || isTyping}
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    bgcolor: alpha(theme.palette.grey[100], 0.5),
                    '&.Mui-disabled': {
                      bgcolor: alpha(theme.palette.grey[200], 0.5)
                    }
                  }
                }}
                aria-label="Campo de mensagem"
              />
              <IconButton
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading || isTyping}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark
                  },
                  '&:disabled': {
                    bgcolor: theme.palette.grey[300]
                  }
                }}
                aria-label="Enviar mensagem"
              >
                {isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SendIcon />
                )}
              </IconButton>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
  );
};

export default ChatbotComponent;

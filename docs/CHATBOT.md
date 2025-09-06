# 🤖 Chatbot Nutricional - NutriApp

## Visão Geral

O Chatbot Nutricional é um assistente de IA integrado ao NutriApp que oferece suporte 24/7 aos usuários com dúvidas sobre nutrição, sugestões de alimentos e orientações personalizadas.

## 🎯 Funcionalidades

### Principais Capacidades
- **Resposta a dúvidas nutricionais**: Informações baseadas em evidências científicas
- **Sugestões de substituições**: Alternativas alimentares baseadas no perfil do usuário
- **Orientações personalizadas**: Recomendações considerando objetivos individuais
- **Explicações nutricionais**: Detalhamento de valores nutricionais e benefícios
- **Histórico de conversas**: Sessões salvas para continuidade

### Personalização
- Consideração do perfil do usuário (idade, peso, altura, objetivos)
- Análise do plano alimentar atual
- Histórico de alimentos consumidos recentemente
- Adaptação às metas nutricionais definidas

## 🛠️ Implementação Técnica

### Backend (Django)

#### Modelos Principais
```python
# Sessão de chat do usuário
ChatSession
- user: ForeignKey(User)
- title: CharField
- created_at: DateTimeField
- is_active: BooleanField

# Mensagens individuais
ChatMessage
- session: ForeignKey(ChatSession)
- role: CharField (user/assistant/system)
- content: TextField
- timestamp: DateTimeField
- tokens_used: IntegerField
- response_time: FloatField

# Configurações do chatbot
ChatbotConfig
- model_name: CharField (gpt-3.5-turbo)
- max_tokens: IntegerField (500)
- temperature: FloatField (0.7)
- system_prompt: TextField
- is_active: BooleanField
```

#### Endpoints da API
```
GET    /api/chatbot/sessions/           # Lista sessões do usuário
POST   /api/chatbot/sessions/           # Cria nova sessão
GET    /api/chatbot/sessions/{id}/      # Detalhes da sessão
PATCH  /api/chatbot/sessions/{id}/      # Atualiza sessão
DELETE /api/chatbot/sessions/{id}/      # Remove sessão

POST   /api/chatbot/sessions/send_message/  # Envia mensagem
PATCH  /api/chatbot/sessions/{id}/update_title/  # Atualiza título
POST   /api/chatbot/sessions/{id}/toggle_active/  # Ativa/desativa

GET    /api/chatbot/sessions/food_suggestions/?q=termo  # Busca alimentos
```

#### Serviço Principal
```python
ChatbotService
- _build_context_prompt(): Constrói contexto do usuário
- _get_recent_food_context(): Obtém alimentos recentes
- send_message(): Processa mensagem via OpenAI
- create_session(): Cria nova sessão
- get_food_suggestions(): Busca alimentos na base
```

### Frontend (React)

#### Componentes
```javascript
ChatbotComponent    # Interface principal do chat
ChatbotFab          # Botão flutuante para abrir
```

#### Funcionalidades da Interface
- Interface de chat responsiva
- Histórico de mensagens com scroll automático
- Indicadores de carregamento
- Formatação de timestamps
- Avatares diferenciados (usuário/bot)
- Suporte a mensagens multilinhas

## 🔧 Configuração

### Variáveis de Ambiente
```bash
# .env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### Instalação
```bash
# Backend
cd backend
pip install openai
python manage.py makemigrations chatbot
python manage.py migrate
python manage.py setup_chatbot
```

### Configuração Inicial
```bash
# Cria configuração padrão do chatbot
python manage.py setup_chatbot
```

## 📊 Monitoramento

### Métricas Disponíveis
- **Tokens utilizados**: Controle de custos da API
- **Tempo de resposta**: Performance do serviço
- **Número de sessões**: Engajamento dos usuários
- **Mensagens por sessão**: Qualidade das interações

### Logs
- Arquivo: `backend/chatbot.log`
- Nível: INFO
- Inclui: Erros da API, tempos de resposta, estatísticas de uso

## 🎨 Personalização

### Prompt do Sistema
O prompt pode ser customizado no Django Admin ou via código:

```python
system_prompt = """
Você é um assistente nutricional especializado e amigável do NutriApp.
Suas principais funções são:
1. Responder dúvidas sobre nutrição de forma clara e educativa
2. Sugerir substituições de alimentos baseadas no perfil do usuário
3. Explicar valores nutricionais e benefícios dos alimentos
4. Dar orientações personalizadas considerando objetivos
5. Sempre orientar a procurar um nutricionista para casos específicos

Mantenha suas respostas:
- Claras e objetivas
- Baseadas em evidências científicas
- Personalizadas quando possível
- Sempre incentivando hábitos saudáveis
- Nunca substitua consulta médica ou nutricional profissional
"""
```

### Configurações do Modelo
- **model_name**: Modelo OpenAI (gpt-3.5-turbo, gpt-4)
- **max_tokens**: Limite de tokens por resposta (500)
- **temperature**: Criatividade das respostas (0.7)

## 🔒 Segurança

### Medidas Implementadas
- **Autenticação obrigatória**: Apenas usuários logados
- **Isolamento de dados**: Cada usuário vê apenas suas sessões
- **Rate limiting**: Controle de uso da API
- **Sanitização de entrada**: Validação de mensagens
- **Logs de auditoria**: Rastreamento de uso

### Limitações de Responsabilidade
- Disclaimer sobre não substituir consulta profissional
- Orientações baseadas em informações gerais
- Recomendação de buscar nutricionista para casos específicos

## 🚀 Próximas Funcionalidades

### Curto Prazo
- [ ] Histórico de sessões na interface
- [ ] Exportação de conversas
- [ ] Sugestões rápidas (botões)
- [ ] Busca em conversas antigas

### Médio Prazo
- [ ] Integração com planos alimentares
- [ ] Geração de receitas personalizadas
- [ ] Análise de padrões alimentares
- [ ] Notificações inteligentes

### Longo Prazo
- [ ] Reconhecimento de voz
- [ ] Análise de fotos de alimentos
- [ ] Integração com wearables
- [ ] Coaching proativo

## 🐛 Troubleshooting

### Problemas Comuns

#### "OPENAI_API_KEY não configurada"
```bash
# Adicione a chave no arquivo .env
echo "OPENAI_API_KEY=sk-your-key" >> .env
```

#### "Erro ao processar mensagem"
1. Verifique a conectividade com a API OpenAI
2. Confirme se há créditos na conta OpenAI
3. Verifique os logs em `chatbot.log`

#### Interface não carrega
1. Verifique se o backend está rodando
2. Confirme as URLs da API no frontend
3. Verifique o console do navegador para erros

### Logs de Debug
```bash
# Visualizar logs em tempo real
tail -f backend/chatbot.log
```

## 💡 Dicas de Uso

### Para Usuários
- **Seja específico**: "Como substituir arroz branco por uma opção integral?"
- **Forneça contexto**: "Sou vegetariano e quero ganhar massa muscular"
- **Use perguntas diretas**: "Quantas calorias tem 100g de frango?"

### Para Desenvolvedores
- **Monitore tokens**: Acompanhe o uso para controlar custos
- **Personalize prompts**: Adapte para necessidades específicas
- **Analise métricas**: Use dados para melhorar a experiência

## 📈 Métricas de Sucesso

### KPIs Principais
- **Taxa de engajamento**: % usuários que usam o chatbot
- **Sessões por usuário**: Frequência de uso
- **Satisfação**: Feedback dos usuários
- **Tempo de resposta médio**: Performance técnica
- **Custo por conversa**: Eficiência econômica

---

**Desenvolvido para o NutriApp** 🥗
*Assistente Nutricional Inteligente com IA*

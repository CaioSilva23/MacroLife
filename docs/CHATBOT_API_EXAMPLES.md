# Exemplos de uso da API do Chatbot Nutricional

## 1. Enviar mensagem ao chatbot (cria nova sessão)

```bash
curl -X POST http://localhost:8000/api/chatbot/sessions/send_message/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "Quais são os benefícios da proteína whey?",
    "create_new_session": true
  }'
```

**Resposta:**
```json
{
  "session_id": 1,
  "user_message": {
    "id": 1,
    "role": "user",
    "content": "Quais são os benefícios da proteína whey?",
    "timestamp": "2025-09-06T10:30:00Z"
  },
  "assistant_message": {
    "id": 2,
    "role": "assistant",
    "content": "A proteína whey é uma excelente opção para suplementação proteica...",
    "timestamp": "2025-09-06T10:30:05Z"
  },
  "tokens_used": 150,
  "response_time": 2.3
}
```

## 2. Continuar conversa em sessão existente

```bash
curl -X POST http://localhost:8000/api/chatbot/sessions/send_message/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "E qual a melhor forma de consumir?",
    "session_id": 1
  }'
```

## 3. Listar sessões do usuário

```bash
curl -X GET http://localhost:8000/api/chatbot/sessions/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Resposta:**
```json
{
  "count": 2,
  "results": [
    {
      "id": 1,
      "title": "Conversa 1",
      "created_at": "2025-09-06T10:30:00Z",
      "updated_at": "2025-09-06T10:35:00Z",
      "is_active": true,
      "message_count": 4,
      "last_message": {
        "content": "Quais são os benefícios da proteína whey?",
        "timestamp": "2025-09-06T10:30:00Z"
      }
    }
  ]
}
```

## 4. Obter detalhes de uma sessão específica

```bash
curl -X GET http://localhost:8000/api/chatbot/sessions/1/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Resposta:**
```json
{
  "id": 1,
  "title": "Conversa 1",
  "created_at": "2025-09-06T10:30:00Z",
  "updated_at": "2025-09-06T10:35:00Z",
  "is_active": true,
  "messages": [
    {
      "id": 1,
      "role": "user",
      "content": "Quais são os benefícios da proteína whey?",
      "timestamp": "2025-09-06T10:30:00Z",
      "tokens_used": null,
      "response_time": null
    },
    {
      "id": 2,
      "role": "assistant",
      "content": "A proteína whey é uma excelente opção...",
      "timestamp": "2025-09-06T10:30:05Z",
      "tokens_used": 150,
      "response_time": 2.3
    }
  ],
  "message_count": 2
}
```

## 5. Atualizar título da sessão

```bash
curl -X PATCH http://localhost:8000/api/chatbot/sessions/1/update_title/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Dúvidas sobre Proteína Whey"
  }'
```

## 6. Buscar sugestões de alimentos

```bash
curl -X GET "http://localhost:8000/api/chatbot/sessions/food_suggestions/?q=frango" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Resposta:**
```json
{
  "suggestions": [
    {
      "id": 123,
      "nome": "Frango, peito, sem pele, cozido",
      "energia_kcal": 165,
      "carboidratos_g": 0,
      "proteinas_g": 31,
      "lipideos_g": 3.6
    },
    {
      "id": 124,
      "nome": "Frango, coxa, com pele, assado",
      "energia_kcal": 216,
      "carboidratos_g": 0,
      "proteinas_g": 27,
      "lipideos_g": 11
    }
  ]
}
```

## 7. Desativar uma sessão

```bash
curl -X POST http://localhost:8000/api/chatbot/sessions/1/toggle_active/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Exemplos de Perguntas para Testar

### Nutrição Básica
- "Quantas calorias devo consumir por dia?"
- "Qual a diferença entre carboidratos simples e complexos?"
- "Como calcular meu gasto energético basal?"

### Substituições
- "Por que posso substituir o arroz branco?"
- "Tenho intolerância à lactose, que fontes de cálcio posso usar?"
- "Sou vegetariano, como posso aumentar a proteína?"

### Objetivos Específicos
- "Quero ganhar massa muscular, como ajustar minha dieta?"
- "Estou tentando emagrecer, que alimentos evitar?"
- "Como manter o peso após uma dieta?"

### Alimentos Específicos
- "Quais são os benefícios da aveia?"
- "A banana é rica em quê?"
- "Posso comer ovos todos os dias?"

## Códigos de Status HTTP

- **200 OK**: Requisição bem-sucedida
- **400 Bad Request**: Dados inválidos na requisição
- **401 Unauthorized**: Token de autenticação inválido ou ausente
- **404 Not Found**: Sessão não encontrada
- **500 Internal Server Error**: Erro no servidor (problemas com API OpenAI)

## Tratamento de Erros

### Erro de API OpenAI
```json
{
  "session_id": 1,
  "error": "Rate limit exceeded",
  "error_message": {
    "id": 3,
    "role": "assistant",
    "content": "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente em alguns instantes.",
    "timestamp": "2025-09-06T10:40:00Z"
  }
}
```

### Erro de Validação
```json
{
  "message": ["A mensagem não pode estar vazia."]
}
```

### Erro de Autenticação
```json
{
  "detail": "Given token not valid for any token type",
  "code": "token_not_valid",
  "messages": [
    {
      "token_class": "AccessToken",
      "token_type": "access",
      "message": "Token is invalid or expired"
    }
  ]
}
```

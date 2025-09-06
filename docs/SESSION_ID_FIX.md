# 🔧 Correção do Erro session_id - Chatbot

## ❌ Problema Identificado

**Erro**: `"session_id": ["Este campo não pode ser nulo."]`

**Causa**: O frontend estava enviando `session_id: null` para novas sessões, mas o backend não estava configurado para aceitar valores nulos.

## ✅ Correções Implementadas

### 1. **Frontend - URL Corrigida**

Atualizada a URL do endpoint para corresponder à configuração das rotas:

```javascript
// ANTES
const response = await api.post('/chatbot/sessions/send_message/', {

// DEPOIS  
const response = await api.post('/api/chatbot/sessions/send_message/', {
```

### 2. **Frontend - Lógica de session_id**

Alterada a lógica para não enviar `session_id` quando for `null`:

```javascript
// ANTES (problemático)
const response = await api.post('/api/chatbot/sessions/send_message/', {
  message: inputMessage,
  session_id: currentSessionId,  // ← Podia ser null
  create_new_session: !currentSessionId
});

// DEPOIS (corrigido)
const requestData = {
  message: inputMessage,
  create_new_session: !currentSessionId
};

if (currentSessionId) {
  requestData.session_id = currentSessionId;
}

const response = await api.post('/api/chatbot/sessions/send_message/', requestData);
```

### 3. **Backend - Serializer Atualizado**

Adicionado `allow_null=True` no campo `session_id`:

```python
# ANTES
session_id = serializers.IntegerField(required=False)

# DEPOIS
session_id = serializers.IntegerField(required=False, allow_null=True)
```

## 🎯 Como Funciona Agora

### **Para Nova Conversa:**
```json
{
  "message": "Olá, como posso melhorar minha dieta?",
  "create_new_session": true
}
```
- `session_id` não é enviado
- Backend cria nova sessão automaticamente

### **Para Conversa Existente:**
```json
{
  "message": "E quanto de proteína devo consumir?", 
  "session_id": 123,
  "create_new_session": false
}
```
- `session_id` é enviado com valor válido
- Backend usa a sessão existente

## 🧪 Teste das Correções

### 1. **Verificar Backend**
```bash
cd backend
source venv/bin/activate
python manage.py check
python manage.py runserver
```

### 2. **Testar Nova Conversa**
```bash
curl -X POST http://localhost:8000/api/chatbot/sessions/send_message/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "Teste nova conversa",
    "create_new_session": true
  }'
```

### 3. **Testar Conversa Existente**
```bash
curl -X POST http://localhost:8000/api/chatbot/sessions/send_message/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "Teste conversa existente",
    "session_id": 1,
    "create_new_session": false
  }'
```

## 📋 Fluxo Completo Corrigido

### 1. **Usuário abre chatbot**
- `currentSessionId` = `null`
- Primeira mensagem não inclui `session_id`

### 2. **Primeira mensagem enviada**
- Request: `{ message: "Olá", create_new_session: true }`
- Backend cria nova sessão
- Response inclui `session_id`

### 3. **Frontend atualiza estado**
- `setCurrentSessionId(response.data.session_id)`
- Próximas mensagens incluirão o `session_id`

### 4. **Mensagens seguintes**
- Request: `{ message: "...", session_id: 123, create_new_session: false }`
- Backend usa sessão existente

## 🚨 Validações Implementadas

### **Backend (Serializer)**
- ✅ `session_id`: Opcional (`required=False`)
- ✅ `session_id`: Aceita nulo (`allow_null=True`)
- ✅ `message`: Obrigatório e não vazio
- ✅ `create_new_session`: Padrão `False`

### **Frontend (Componente)**
- ✅ Não envia `session_id` se for `null`
- ✅ Atualiza `currentSessionId` após primeira resposta
- ✅ Inclui `session_id` em mensagens subsequentes

## ✅ Status das Correções

- ✅ **URL do endpoint corrigida**
- ✅ **Lógica de session_id no frontend corrigida**
- ✅ **Serializer backend aceita null**
- ✅ **Backend verificado sem erros**
- ✅ **Pronto para teste**

**O erro de session_id não deve mais aparecer!** 🎉

## 🎯 Próximos Passos

1. **Teste o chatbot**: Abra o frontend e teste enviar mensagens
2. **Verifique logs**: Monitor `chatbot.log` para qualquer erro
3. **Teste múltiplas sessões**: Crie várias conversas para validar

**O chatbot agora deve funcionar perfeitamente!** ✅

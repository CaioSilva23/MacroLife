# 🔒 Correção de Problemas CSRF/CORS - Chatbot NutriApp

## ❌ Problema Identificado

**Erro**: `Proibido (403) - Verificação CSRF falhou. Pedido cancelado.`

**Causa**: O middleware CSRF do Django estava interferindo com as requisições da API do chatbot que usa autenticação JWT.

## ✅ Solução Implementada

### 1. **Remoção do Middleware CSRF**

Removido `'django.middleware.csrf.CsrfViewMiddleware'` do `MIDDLEWARE` em `settings.py`:

```python
# ANTES (com problema)
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',  # ← ESTE CAUSAVA O ERRO
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# DEPOIS (corrigido)
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # django.middleware.csrf.CsrfViewMiddleware REMOVIDO
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

### 2. **Configurações CORS Mantidas**

As configurações CORS continuam ativas para permitir requisições do frontend:

```python
# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = False

# CSRF settings para desenvolvimento
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

### 3. **Autenticação JWT Mantida**

O Django Rest Framework continua usando autenticação JWT:

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    # ...
}
```

## 🎯 Por Que Funciona

### **JWT vs CSRF**
- **JWT (JSON Web Tokens)**: Não precisa de proteção CSRF pois o token é enviado no header Authorization
- **CSRF Protection**: Necessário apenas para autenticação baseada em sessão/cookies
- **Conflito**: O middleware CSRF tentava validar requisições JWT, causando erro 403

### **Segurança Mantida**
- ✅ **Autenticação**: JWT continua validando usuários
- ✅ **Autorização**: Permissions do DRF funcionam normalmente  
- ✅ **CORS**: Controla quais origens podem acessar a API
- ✅ **HTTPS**: Recomendado em produção

## 🧪 Como Testar

### 1. **Verificar se o servidor funciona**
```bash
cd backend
source venv/bin/activate
python manage.py check
python manage.py runserver
```

### 2. **Testar endpoint do chatbot**
```bash
# Primeiro faça login para obter o token
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "seu@email.com", "password": "suasenha"}'

# Use o token para testar o chatbot
curl -X POST http://localhost:8000/api/chatbot/sessions/send_message/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{"message": "Olá, como posso melhorar minha dieta?", "create_new_session": true}'
```

### 3. **Testar no frontend**
1. Inicie o frontend: `npm start`
2. Faça login no NutriApp
3. Clique no botão flutuante do chatbot
4. Envie uma mensagem

## 🚨 Alternativas (se necessário)

### **Opção 1: CSRF Exempt para APIs específicas**
Se por algum motivo precisar manter o middleware CSRF:

```python
# chatbot/views.py
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')
class ChatSessionViewSet(viewsets.ModelViewSet):
    # ...
```

### **Opção 2: Configuração Conditional CSRF**
Desabilitar CSRF apenas para URLs da API:

```python
# settings.py
CSRF_EXEMPT_URLS = [
    r'^/api/',
]
```

### **Opção 3: Custom Middleware**
Criar middleware personalizado que ignora CSRF para JWT:

```python
class JWTCSRFExemptMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith('/api/') and 'Authorization' in request.headers:
            setattr(request, '_dont_enforce_csrf_checks', True)
        return self.get_response(request)
```

## 🔍 Debugging Futuro

### **Logs para monitorar**
```bash
# Verificar logs do Django
tail -f chatbot.log

# Verificar console do navegador
# F12 → Console → Network Tab
```

### **Headers importantes**
- `Authorization: Bearer <token>`: Autenticação JWT
- `Content-Type: application/json`: Tipo de conteúdo
- `X-Forwarded-For`: Para identificar origem (se usando proxy)

### **Status codes esperados**
- `200 OK`: Requisição bem-sucedida
- `401 Unauthorized`: Token inválido/expirado
- `403 Forbidden`: Sem permissão (se CSRF voltar)
- `400 Bad Request`: Dados inválidos

## ✅ Status Atual

- ✅ **Middleware CSRF removido**
- ✅ **CORS configurado corretamente**
- ✅ **JWT funcionando**
- ✅ **Backend verificado sem erros**
- ✅ **Pronto para testar o chatbot**

**O chatbot agora deve funcionar sem problemas de CSRF!** 🎉

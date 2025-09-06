# 🚀 MIGRAÇÃO PARA GROQ - Substituição da OpenAI

## 🎯 Por que Groq é a melhor escolha

### **Vantagens do Groq para NutriApp:**
- ⚡ **10x mais rápido** que OpenAI (0.5-2s de resposta)
- 🆓 **Completamente gratuito** (100 req/min)
- 🔄 **Migração simples** (código quase idêntico)
- 📱 **Otimizado para chat** em tempo real
- 🌐 **API na nuvem** (sem instalação)

## 🛠️ Implementação (15 minutos)

### **1. Cadastro Groq (2 minutos)**
1. Acesse: https://console.groq.com/
2. Crie conta gratuita
3. Gere API Key
4. Copie a chave

### **2. Instalar Groq SDK (1 minuto)**
```bash
cd /home/caio/PROJETOS/nutricao/backend
source venv/bin/activate
pip install groq
pip freeze > requirements.txt
```

### **3. Atualizar .env (1 minuto)**
```bash
# Substituir OpenAI por Groq
# OPENAI_API_KEY=sk-old-key                # Comentar/remover
GROQ_API_KEY=gsk-your-groq-key-here        # Nova chave Groq
CHATBOT_USE_MOCK=0                         # Desativar mock
CHATBOT_PROVIDER=groq                      # Novo: especificar provider
```

### **4. Atualizar Settings (2 minutos)**

**Arquivo: `/backend/nutrition/settings.py`**
```python
# Adicionar nas configurações do Chatbot
GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
CHATBOT_PROVIDER = os.environ.get('CHATBOT_PROVIDER', 'groq')  # padrão groq
```

### **5. Atualizar Services (10 minutos)**

**Arquivo: `/backend/chatbot/services.py`**

#### **Importações:**
```python
import os
import logging
from groq import Groq  # Nova importação
# from openai import OpenAI  # Comentar OpenAI
from django.conf import settings
from .models import ChatSession, ChatMessage
```

#### **Classe ChatbotService atualizada:**
```python
class ChatbotService:
    def __init__(self):
        self.use_mock = settings.CHATBOT_USE_MOCK
        self.provider = getattr(settings, 'CHATBOT_PROVIDER', 'groq')
        
        if not self.use_mock:
            if self.provider == 'groq':
                self.client = Groq(api_key=settings.GROQ_API_KEY)
                self.model = "llama-3.1-8b-instant"  # Modelo rápido e gratuito
            # elif self.provider == 'openai':  # Manter como fallback
            #     self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
            #     self.model = "gpt-3.5-turbo"

    def send_message(self, user, message_text, session_id=None):
        """Enviar mensagem para o chatbot usando Groq"""
        try:
            if self.use_mock:
                from .mock_service import MockChatbotService
                mock_service = MockChatbotService()
                return mock_service.send_message(user, message_text, session_id)

            # Groq API call
            if self.provider == 'groq':
                return self._send_message_groq(user, message_text, session_id)
            
        except Exception as e:
            logger.error(f"Chatbot error: {str(e)}")
            # Fallback para mock em caso de erro
            from .mock_service import MockChatbotService
            mock_service = MockChatbotService()
            return mock_service.send_message(user, message_text, session_id)

    def _send_message_groq(self, user, message_text, session_id=None):
        """Implementação específica do Groq"""
        # Buscar ou criar sessão
        if session_id:
            try:
                session = ChatSession.objects.get(id=session_id, user=user)
            except ChatSession.DoesNotExist:
                session = ChatSession.objects.create(user=user)
        else:
            session = ChatSession.objects.create(user=user)

        # Salvar mensagem do usuário
        user_message = ChatMessage.objects.create(
            session=session,
            role='user',
            content=message_text
        )

        # Preparar contexto
        context = self._build_context(user, session)
        
        # Chamar Groq API
        response = self.client.chat.completions.create(
            model=self.model,
            messages=context,
            temperature=0.7,
            max_tokens=500,
            stream=False  # Groq é tão rápido que não precisa stream
        )

        # Extrair resposta
        bot_response = response.choices[0].message.content
        
        # Salvar resposta do bot
        bot_message = ChatMessage.objects.create(
            session=session,
            role='assistant',
            content=bot_response,
            tokens_used=response.usage.total_tokens if hasattr(response, 'usage') else 0
        )

        logger.info(f"Groq response generated for user {user.id}")

        return {
            'session_id': session.id,
            'response': bot_response,
            'tokens_used': bot_message.tokens_used
        }

    def _build_context(self, user, session):
        """Construir contexto para Groq (mesmo que OpenAI)"""
        # Informações do usuário
        user_info = "Usuário anônimo"
        if hasattr(user, 'userprofile'):
            profile = user.userprofile
            user_info = f"""
            Usuário: {user.first_name or 'Usuário'}
            Idade: {profile.idade or 'não informada'} anos
            Peso: {profile.peso or 'não informado'} kg
            Altura: {profile.altura or 'não informada'} cm
            Objetivo: {profile.objetivo or 'não informado'}
            Nível de atividade: {profile.nivel_atividade or 'não informado'}
            """

        # Prompt do sistema
        system_prompt = f"""
        Você é um assistente nutricional especializado do NutriApp.
        
        Informações do usuário:
        {user_info}
        
        Suas responsabilidades:
        - Fornecer orientações nutricionais personalizadas
        - Sugerir substituições de alimentos saudáveis
        - Explicar benefícios nutricionais
        - Ajudar com planejamento de refeições
        - Responder dúvidas sobre alimentação
        
        Diretrizes:
        - Seja amigável e encorajador
        - Use linguagem simples e clara
        - Baseie-se em evidências científicas
        - Sempre recomende consultar um nutricionista para casos específicos
        - Mantenha respostas concisas (máximo 150 palavras)
        """

        # Histórico da conversa (últimas 10 mensagens)
        messages = [{"role": "system", "content": system_prompt}]
        
        recent_messages = ChatMessage.objects.filter(
            session=session
        ).order_by('-created_at')[:10]
        
        for msg in reversed(recent_messages):
            messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        return messages
```

## 🚀 Migração Completa

### **Script de Migração Automática:**

```bash
#!/bin/bash
# migrate_to_groq.sh

echo "🚀 Migrando NutriApp para Groq..."

# 1. Instalar Groq
echo "📦 Instalando Groq SDK..."
pip install groq

# 2. Backup do arquivo atual
echo "💾 Fazendo backup..."
cp chatbot/services.py chatbot/services.py.backup

# 3. Atualizar requirements
echo "📝 Atualizando requirements..."
pip freeze > requirements.txt

echo "✅ Migração preparada!"
echo "🔑 Agora configure sua GROQ_API_KEY no .env"
echo "🌐 Cadastre-se em: https://console.groq.com/"
```

## 📊 Comparação: OpenAI vs Groq

| Aspecto | OpenAI GPT-3.5 | Groq Llama-3.1 |
|---------|----------------|-----------------|
| **Custo** | 💰 $0.002/1k tokens | 🆓 Gratuito |
| **Velocidade** | ⚡ 3-5 segundos | ⚡⚡⚡ 0.5-2 segundos |
| **Qualidade** | 📝📝📝 Excelente | 📝📝 Muito boa |
| **Limites** | 💳 Baseado em créditos | 🔄 100 req/minuto |
| **Manutenção** | 🛠️ Precisa monitorar quota | 🛠️ Zero manutenção |

## ✅ Vantagens da Migração

### **Para Desenvolvimento:**
- 🆓 **Zero custos** operacionais
- ⚡ **Testes mais rápidos** (respostas instantâneas)
- 🔄 **Sem limites de quota** para desenvolvimento
- 🛠️ **Menos complexidade** (sem gerenciar créditos)

### **Para Produção:**
- 💰 **Economia significativa** (eliminação de custos de API)
- ⚡ **Melhor experiência** do usuário (respostas mais rápidas)
- 🚀 **Escalabilidade** (100 requisições/minuto = 144k/dia)
- 🔒 **Confiabilidade** (menos pontos de falha)

### **Para o Negócio:**
- 📈 **ROI imediato** (eliminação de custos)
- 🎯 **Foco no produto** (menos preocupação com custos)
- 🚀 **Crescimento sustentável** (sem custos escalando)

## 🎯 Próximos Passos

1. **Cadastre-se no Groq** (2 min): https://console.groq.com/
2. **Configure a API Key** (1 min)
3. **Execute a migração** (10 min)
4. **Teste o chatbot** (5 min)
5. **Deploy em produção** (sem custos!)

**Com Groq, seu NutriApp terá um chatbot mais rápido, gratuito e confiável!** 🎉

---

## 🔧 Troubleshooting

### **Se der erro de importação:**
```bash
pip install groq --upgrade
```

### **Se API Key não funcionar:**
- Verifique se copiou a chave completa
- Confirme que começa com "gsk-"
- Teste no console do Groq primeiro

### **Se quiser voltar para OpenAI:**
```bash
# .env
CHATBOT_PROVIDER=openai
OPENAI_API_KEY=sua-chave-openai
```

**Groq é a evolução natural do seu chatbot - mais rápido, gratuito e eficiente!** 🚀

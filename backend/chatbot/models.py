from django.db import models
from user.models import User


class ChatSession(models.Model):
    """
    Sessão de chat do usuário com o chatbot nutricional
    """
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='chat_sessions'
    )
    title = models.CharField(max_length=200, default="Nova Conversa")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"Chat {self.title} - {self.user.name}"


class ChatMessage(models.Model):
    """
    Mensagens individuais dentro de uma sessão de chat
    """
    ROLE_CHOICES = [
        ('user', 'Usuário'),
        ('assistant', 'Assistente'),
        ('system', 'Sistema'),
    ]

    session = models.ForeignKey(
        ChatSession, on_delete=models.CASCADE, related_name='messages'
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    # Metadados para tracking
    tokens_used = models.IntegerField(null=True, blank=True)
    response_time = models.FloatField(
        null=True, blank=True, help_text="Tempo de resposta em segundos"
    )

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.role}: {self.content[:50]}..."


class ChatbotConfig(models.Model):
    """
    Configurações globais do chatbot
    """
    model_name = models.CharField(max_length=50, default="llama-3.1-8b-instant")
    max_tokens = models.IntegerField(default=500)
    temperature = models.FloatField(default=0.7)
    system_prompt = models.TextField(default="""
        Você é um assistente nutricional especializado e amigável do NutriApp.
        Suas principais funções são:
        1. Responder dúvidas sobre nutrição de forma clara e educativa
        2. Sugerir substituições de alimentos baseadas no perfil do usuário
        3. Explicar valores nutricionais e benefícios dos alimentos
        4. Dar orientações personalizadas considerando objetivos
        (emagrecer, ganhar peso, manter)
        5. Sempre orientar a procurar um nutricionista para casos específicos

        Mantenha suas respostas:
        - Claras e objetivas
        - Baseadas em evidências científicas
        - Personalizadas quando possível
        - Sempre incentivando hábitos saudáveis
        - Nunca substitua consulta médica ou nutricional profissional
            """)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Configuração do Chatbot"
        verbose_name_plural = "Configurações do Chatbot"

    def __str__(self):
        status = 'Ativo' if self.is_active else 'Inativo'
        return f"Config {self.model_name} - {status}"

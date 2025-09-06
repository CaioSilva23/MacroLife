from groq import Groq
import time
from django.conf import settings
from django.core.exceptions import ValidationError
from .models import ChatSession, ChatMessage, ChatbotConfig
from user.models import UserProfile
from api.models import Alimento
import logging

logger = logging.getLogger(__name__)


class ChatbotService:
    """
    Serviço principal do chatbot nutricional com Groq
    """

    def __init__(self):
        self.config = self._get_active_config()
        
        if not hasattr(settings, 'GROQ_API_KEY') or not settings.GROQ_API_KEY:
            raise ValidationError(
                "GROQ_API_KEY não configurada nas settings"
            )
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = "llama-3.1-8b-instant"
        logger.info("Using Groq API for chatbot")

    def _get_active_config(self):
        """Obtém a configuração ativa do chatbot"""
        try:
            return ChatbotConfig.objects.filter(is_active=True).first()
        except ChatbotConfig.DoesNotExist:
            return ChatbotConfig.objects.create()

    def _build_context_prompt(self, user):
        """Constrói o prompt de contexto baseado no perfil do usuário"""
        context = ""

        try:
            # Busca o perfil do usuário
            if hasattr(user, 'userprofile'):
                profile = user.userprofile
                
                context += f"""
                PERFIL DO USUÁRIO:
                - Nome: {user.name or 'Usuário'}
                - Idade: {profile.idade or 'não informada'} anos
                - Peso: {profile.peso or 'não informado'} kg
                - Altura: {profile.altura or 'não informada'} cm
                - Objetivo: {profile.objetivo or 'não informado'}
                - Nível de Atividade: {profile.nivel_atividade or 'não informado'}
                """

                print('aqui', context)
                
                # Calcula IMC se possível
                if profile.peso and profile.altura:
                    altura_m = profile.altura / 100
                    imc = profile.peso / (altura_m ** 2)
                    context += f"- IMC: {imc:.1f}"
                    
                    # Classificação do IMC
                    if imc < 18.5:
                        context += " (Abaixo do peso)"
                    elif imc < 25:
                        context += " (Peso normal)"
                    elif imc < 30:
                        context += " (Sobrepeso)"
                    else:
                        context += " (Obesidade)"
                
            else:
                context = "PERFIL DO USUÁRIO: Não disponível"

        except Exception as e:
            logger.error(f"Erro ao construir contexto: {str(e)}")
            context = "PERFIL DO USUÁRIO: Erro ao carregar informações"

        return context

    def _prepare_messages(self, session, user_message):
        """Prepara as mensagens para envio à API"""
        messages = []
        
        # System prompt personalizado
        user_context = self._build_context_prompt(session.user)
        
        system_prompt = f"""
        Você é um assistente nutricional especializado do NutriApp, focado em:
        
        🎯 MISSÃO: Fornecer orientações nutricionais personalizadas, seguras e baseadas em evidências científicas.
        
        📊 {user_context}
        
        🔍 SUAS ESPECIALIDADES:
        - Análise nutricional de alimentos
        - Sugestões de substituições saudáveis
        - Planejamento de refeições balanceadas
        - Orientações para objetivos específicos (perda/ganho de peso)
        - Esclarecimentos sobre macronutrientes e micronutrientes
        
        📋 DIRETRIZES:
        - Seja amigável, encorajador e empático
        - Use linguagem clara e acessível
        - Mantenha respostas concisas (máximo 300 palavras)
        - Sempre recomende consultar um nutricionista para casos específicos
        - Nunca prescreva dietas restritivas sem supervisão profissional
        - Foque em educação nutricional e mudanças graduais
        
        ⚠️ IMPORTANTE: Você oferece informações educativas, não substitui consulta médica ou nutricional profissional.
        """
        
        messages.append({"role": "system", "content": system_prompt})
        
        # Adiciona histórico das últimas 8 mensagens da sessão
        recent_messages = ChatMessage.objects.filter(
            session=session
        ).order_by('-timestamp')[:8]
        
        for msg in reversed(recent_messages):
            messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Adiciona a mensagem atual do usuário
        messages.append({"role": "user", "content": user_message})
        
        return messages

    def send_message(self, session, user_message):
        """
        Envia mensagem para o chatbot e retorna a resposta
        """
        start_time = time.time()

        try:
            # Salva a mensagem do usuário
            user_msg = ChatMessage.objects.create(
                session=session,
                role='user',
                content=user_message
            )

            # Prepara as mensagens para a API
            messages = self._prepare_messages(session, user_message)

            try:
                # Groq API call
                logger.info(f"Calling Groq API with model: {self.model}")
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    max_tokens=self.config.max_tokens,
                    temperature=self.config.temperature,
                )
                
                # Extrai a resposta do Groq
                assistant_content = response.choices[0].message.content
                tokens_used = (response.usage.total_tokens
                               if hasattr(response, 'usage') else 0)
                logger.info(f"Groq response received, tokens: {tokens_used}")
                        
            except Exception as api_error:
                logger.error(f"Groq API error: {api_error}")
                raise api_error

            response_time = time.time() - start_time

            # Salva a resposta do assistente
            assistant_msg = ChatMessage.objects.create(
                session=session,
                role='assistant',
                content=assistant_content,
                tokens_used=tokens_used,
                response_time=response_time
            )

            # Atualiza o timestamp da sessão
            session.save()

            return {
                'success': True,
                'user_message': user_msg,
                'assistant_message': assistant_msg,
                'tokens_used': tokens_used,
                'response_time': response_time
            }

        except Exception as e:
            logger.error(f"Erro no chatbot: {str(e)}")
            
            # Salva mensagem de erro
            error_msg = ChatMessage.objects.create(
                session=session,
                role='assistant',
                content="Desculpe, ocorreu um erro ao processar sua "
                        "mensagem. Tente novamente em alguns instantes.",
                response_time=time.time() - start_time
            )

            return {
                'success': False,
                'error': str(e),
                'assistant_message': error_msg,
                'response_time': time.time() - start_time
            }

    def create_session(self, user, title=None):
        """Cria uma nova sessão de chat"""
        if not title:
            session_count = ChatSession.objects.filter(user=user).count()
            title = f"Conversa {session_count + 1}"

        session = ChatSession.objects.create(
            user=user,
            title=title
        )

        return session

    def get_food_suggestions(self, food_name):
        """
        Busca sugestões de alimentos na base de dados
        """
        try:
            foods = Alimento.objects.filter(
                nome__icontains=food_name
            )[:5]

            suggestions = []
            for food in foods:
                suggestions.append({
                    'id': food.id,
                    'nome': food.nome,
                    'energia_kcal': food.energia_kcal,
                    'carboidratos_g': food.carboidratos_g,
                    'proteinas_g': food.proteinas_g,
                    'lipideos_g': food.lipideos_g
                })

            return suggestions

        except Exception as e:
            logger.error(f"Erro ao buscar alimentos: {str(e)}")
            return []

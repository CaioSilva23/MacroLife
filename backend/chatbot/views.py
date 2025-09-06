from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import ChatSession, ChatMessage, ChatbotConfig
from .serializers import (
    ChatSessionSerializer,
    ChatSessionListSerializer,
    ChatMessageSerializer,
    SendMessageSerializer,
    ChatbotConfigSerializer
)
from .services import ChatbotService
import logging

logger = logging.getLogger(__name__)


class ChatSessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar sessões de chat
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return ChatSessionListSerializer
        return ChatSessionSerializer

    def get_queryset(self):
        return ChatSession.objects.filter(
            user=self.request.user
        ).prefetch_related('messages')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def send_message(self, request):
        """
        Endpoint para enviar mensagens ao chatbot
        """
        serializer = SendMessageSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        data = serializer.validated_data
        message = data['message']
        session_id = data.get('session_id')
        create_new = data.get('create_new_session', False)

        try:
            chatbot_service = ChatbotService()

            # Determina a sessão a usar
            if create_new or not session_id:
                session = chatbot_service.create_session(request.user)
            else:
                session = get_object_or_404(
                    ChatSession,
                    id=session_id,
                    user=request.user
                )

            # Envia a mensagem
            result = chatbot_service.send_message(session, message)

            if result['success']:
                return Response({
                    'session_id': session.id,
                    'user_message': ChatMessageSerializer(
                        result['user_message']
                    ).data,
                    'assistant_message': ChatMessageSerializer(
                        result['assistant_message']
                    ).data,
                    'tokens_used': result['tokens_used'],
                    'response_time': result['response_time']
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'session_id': session.id,
                    'error': result['error'],
                    'error_message': ChatMessageSerializer(
                        result['error_message']
                    ).data
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            logger.error(f"Erro no endpoint send_message: {str(e)}")
            return Response(
                {'error': 'Erro interno do servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['patch'])
    def update_title(self, request, pk=None):
        """
        Atualiza o título de uma sessão
        """
        session = self.get_object()
        title = request.data.get('title', '').strip()

        if not title:
            return Response(
                {'error': 'Título não pode estar vazio'},
                status=status.HTTP_400_BAD_REQUEST
            )

        session.title = title
        session.save()

        return Response(
            ChatSessionSerializer(session).data,
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """
        Ativa/desativa uma sessão
        """
        session = self.get_object()
        session.is_active = not session.is_active
        session.save()

        return Response(
            ChatSessionSerializer(session).data,
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'])
    def food_suggestions(self, request):
        """
        Busca sugestões de alimentos
        """
        query = request.query_params.get('q', '').strip()

        if not query:
            return Response(
                {'error': 'Parâmetro q é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            chatbot_service = ChatbotService()
            suggestions = chatbot_service.get_food_suggestions(query)

            return Response(
                {'suggestions': suggestions},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            logger.error(f"Erro ao buscar alimentos: {str(e)}")
            return Response(
                {'error': 'Erro ao buscar sugestões'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChatMessageViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet somente leitura para mensagens de chat
    """
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ChatMessage.objects.filter(
            session__user=self.request.user
        ).select_related('session')


class ChatbotConfigViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para visualizar configurações do chatbot (admin only)
    """
    queryset = ChatbotConfig.objects.all()
    serializer_class = ChatbotConfigSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Apenas staff pode ver as configurações
        if self.request.user.is_staff:
            return ChatbotConfig.objects.all()
        return ChatbotConfig.objects.none()

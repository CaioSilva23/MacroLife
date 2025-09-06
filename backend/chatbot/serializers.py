from rest_framework import serializers
from .models import ChatSession, ChatMessage, ChatbotConfig


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'role', 'content', 'timestamp',
            'tokens_used', 'response_time'
        ]
        read_only_fields = ['id', 'timestamp', 'tokens_used', 'response_time']


class ChatSessionSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)
    message_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatSession
        fields = [
            'id', 'title', 'created_at', 'updated_at',
            'is_active', 'messages', 'message_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_message_count(self, obj):
        return obj.messages.count()


class ChatSessionListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listagem de sessões"""
    message_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = ChatSession
        fields = [
            'id', 'title', 'created_at', 'updated_at',
            'is_active', 'message_count', 'last_message'
        ]

    def get_message_count(self, obj):
        return obj.messages.count()

    def get_last_message(self, obj):
        last_msg = obj.messages.filter(role='user').last()
        if last_msg:
            return {
                'content': last_msg.content[:100] + '...'
                if len(last_msg.content) > 100 else last_msg.content,
                'timestamp': last_msg.timestamp
            }
        return None


class SendMessageSerializer(serializers.Serializer):
    """Serializer para envio de mensagens"""
    session_id = serializers.IntegerField(required=False, allow_null=True)
    message = serializers.CharField(max_length=5000)
    create_new_session = serializers.BooleanField(default=False)

    def validate_message(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "A mensagem não pode estar vazia."
            )
        return value.strip()


class ChatbotConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatbotConfig
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

from django.contrib import admin
from .models import ChatSession, ChatMessage, ChatbotConfig


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'user', 'title', 'is_active', 'created_at', 'message_count'
    ]
    list_filter = ['is_active', 'created_at', 'updated_at']
    search_fields = ['user__name', 'user__email', 'title']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    def message_count(self, obj):
        return obj.messages.count()
    message_count.short_description = 'Mensagens'


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'session', 'role', 'content_preview', 'timestamp',
        'tokens_used', 'response_time'
    ]
    list_filter = ['role', 'timestamp', 'session__user']
    search_fields = ['content', 'session__title', 'session__user__name']
    readonly_fields = [
        'timestamp', 'tokens_used', 'response_time', 'session', 'role'
    ]
    date_hierarchy = 'timestamp'
    
    def content_preview(self, obj):
        if len(obj.content) > 100:
            return obj.content[:100] + '...'
        return obj.content
    content_preview.short_description = 'Conteúdo'


@admin.register(ChatbotConfig)
class ChatbotConfigAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'model_name', 'max_tokens', 'temperature',
        'is_active', 'created_at'
    ]
    list_filter = ['is_active', 'model_name', 'created_at']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Configurações do Modelo', {
            'fields': ('model_name', 'max_tokens', 'temperature')
        }),
        ('Prompt do Sistema', {
            'fields': ('system_prompt',),
            'classes': ('wide',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Metadados', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

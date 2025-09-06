from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ChatSessionViewSet,
    ChatMessageViewSet,
    ChatbotConfigViewSet
)

router = DefaultRouter()
router.register(r'sessions', ChatSessionViewSet, basename='chatsession')
router.register(r'messages', ChatMessageViewSet, basename='chatmessage')
router.register(r'config', ChatbotConfigViewSet, basename='chatbotconfig')

urlpatterns = [
    path('', include(router.urls)),
]

from django.urls import path, include
from api.views import AlimentoAPIView, RefeicaoCreateView, RefeicaoDetailView
from rest_framework.routers import DefaultRouter


# router = DefaultRouter()
# router.register(r'refeicao', RefeicaoAPIView, basename='refeicao')

urlpatterns = [
    path('alimentos/', AlimentoAPIView.as_view(), name='alimento-list'),
    path("refeicoes/", RefeicaoCreateView.as_view(), name="refeicao-create"),
    path("refeicoes/<int:refeicao_id>/", RefeicaoDetailView.as_view(), name="refeicao-detail"),
]

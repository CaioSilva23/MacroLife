from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, CreateAPIView, GenericAPIView
from rest_framework import status
from api.serializers import AlimentoSerializer, RefeicaoAlimentoSerializer, RefeicaoSerializer
from api.models import Alimento, Refeicao, RefeicaoAlimento
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
# from .renderers import UserRenderer


class AlimentoAPIView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AlimentoSerializer
    queryset = Alimento.objects.all()
    ordering_fields = ['nome']
    """
    API view for Alimento-related operations.
    """

    def get_queryset(self):
        qs = super().get_queryset()

        search = self.request.query_params.get('search', None)

        if search:
            qs = qs.filter(nome__icontains=search)

        return qs[:10]


class RefeicaoCreateView(GenericAPIView):
    """
    Cadastrar uma refeição com alimentos.
    """
    permission_classes = [IsAuthenticated]
    # serializer_class = RefeicaoSerializer
    def post(self, request, *args, **kwargs):
        nome = request.data.get("nome")
        descricao = request.data.get("descricao", "")
        itens = request.data.get("itens", [])

        if not nome or not itens:
            return Response({"error": "Nome e itens são obrigatórios"}, status=status.HTTP_400_BAD_REQUEST)

        # Criar refeição
        refeicao = Refeicao.objects.create(nome=nome, descricao=descricao, user=request.user)

        # Adicionar alimentos
        for item in itens:
            alimento_id = item.get("alimento_id")
            quantidade = item.get("quantidade_g")

            try:
                alimento = Alimento.objects.get(id=alimento_id)
            except Alimento.DoesNotExist:
                return Response({"error": f"Alimento {alimento_id} não encontrado"}, status=status.HTTP_400_BAD_REQUEST)

            RefeicaoAlimento.objects.create(
                refeicao=refeicao,
                alimento=alimento,
                quantidade_g=quantidade
            )

        # Serializar a refeição criada com seus itens
        refeicao_serializer = RefeicaoSerializer(refeicao)

        # Retornar refeição com totais
        return Response(refeicao_serializer.data, status=status.HTTP_201_CREATED)

    def get(self, request, *args, **kwargs):
        """
        Listar todas as refeições com totais nutricionais.
        """

        data = request.query_params.get('data', None)
        if data:
            refeicoes = Refeicao.objects.filter(data_criacao__date=data)
        else:
            refeicoes = Refeicao.objects.all()

        refeicoes = RefeicaoSerializer(refeicoes, many=True)
        return Response(refeicoes.data, status=status.HTTP_200_OK)


class RefeicaoDetailView(APIView):
    """
    Detalhes de uma refeição específica.
    """
    def get(self, request, refeicao_id, *args, **kwargs):
        try:
            refeicao = Refeicao.objects.get(id=refeicao_id)
            serializer = RefeicaoSerializer(refeicao)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Refeicao.DoesNotExist:
            return Response({"error": "Refeição não encontrada"}, status=status.HTTP_404_NOT_FOUND)
        
    def delete(self, request, refeicao_id, *args, **kwargs):
        try:
            refeicao = Refeicao.objects.get(id=refeicao_id)
            refeicao.delete()
            return Response({"message": "Refeição deletada com sucesso"}, status=status.HTTP_200_OK)
        except Refeicao.DoesNotExist:
            return Response({"error": "Refeição não encontrada"}, status=status.HTTP_404_NOT_FOUND)
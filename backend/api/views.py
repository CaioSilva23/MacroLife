from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework import status
from api.serializers import AlimentoSerializer, RefeicaoAlimentoSerializer, RefeicaoSerializer
from api.models import Alimento, Refeicao, RefeicaoAlimento
from rest_framework.viewsets import ModelViewSet


class AlimentoAPIView(ListAPIView):
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

        return qs


class RefeicaoCreateView(APIView):
    """
    Cadastrar uma refeição com alimentos.
    """
    def post(self, request, *args, **kwargs):
        nome = request.data.get("nome")
        descricao = request.data.get("descricao", "")
        itens = request.data.get("itens", [])

        if not nome or not itens:
            return Response({"error": "Nome e itens são obrigatórios"}, status=status.HTTP_400_BAD_REQUEST)

        # Criar refeição
        refeicao = Refeicao.objects.create(nome=nome, descricao=descricao)

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

        refeicoes = RefeicaoSerializer(Refeicao.objects.all(), many=True)
        return Response(refeicoes.data, status=status.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        """
        Deletar uma refeição pelo ID.
        """
        refeicao_id = request.data.get("refeicao_id")
        try:
            refeicao = Refeicao.objects.get(id=refeicao_id)
            refeicao.delete()
            return Response({"message": "Refeição deletada com sucesso"}, status=status.HTTP_200_OK)
        except Refeicao.DoesNotExist:
            return Response({"error": "Refeição não encontrada"}, status=status.HTTP_404_NOT_FOUND)
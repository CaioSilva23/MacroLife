from rest_framework import serializers
from .models import Alimento, Refeicao, RefeicaoAlimento


class AlimentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alimento
        fields = '__all__'


class RefeicaoAlimentoSerializer(serializers.ModelSerializer):
    alimento_nome = serializers.CharField(source="alimento.nome", read_only=True)
    kcal_total = serializers.SerializerMethodField()
    carbo_total = serializers.SerializerMethodField()
    proteina_total = serializers.SerializerMethodField()
    gordura_total = serializers.SerializerMethodField()

    class Meta:
        model = RefeicaoAlimento
        fields = [
            "id",
            "alimento",
            "alimento_nome",
            "quantidade_g",
            "kcal_total",
            "carbo_total",
            "proteina_total",
            "gordura_total",
        ]

    def get_kcal_total(self, obj):
        return round(obj.kcal_total, 2)

    def get_carbo_total(self, obj):
        return round(obj.carbo_total, 2)

    def get_proteina_total(self, obj):
        return round(obj.proteina_total, 2)

    def get_gordura_total(self, obj):
        return round(obj.gordura_total, 2)


class RefeicaoSerializer(serializers.ModelSerializer):
    itens = RefeicaoAlimentoSerializer(many=True, read_only=True)
    total_kcal = serializers.SerializerMethodField()
    total_carbo = serializers.SerializerMethodField()
    total_proteina = serializers.SerializerMethodField()
    total_gordura = serializers.SerializerMethodField()

    class Meta:
        model = Refeicao
        fields = [
            "id",
            "nome",
            "essencial",
            "descricao",
            "data_criacao",
            "itens",
            "total_kcal",
            "total_carbo",
            "total_proteina",
            "total_gordura",
        ]

    def get_total_kcal(self, obj):
        return round(obj.total_kcal, 2)

    def get_total_carbo(self, obj):
        return round(obj.total_carbo, 2)

    def get_total_proteina(self, obj):
        return round(obj.total_proteina, 2)

    def get_total_gordura(self, obj):
        return round(obj.total_gordura, 2)


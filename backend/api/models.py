from django.db import models
from user.models import User


class Alimento(models.Model):
    """
    Base de alimentos (ex: TACO).
    Valores nutricionais referem-se a 100g do alimento.
    """
    nome = models.CharField(max_length=200, unique=True)
    energia_kcal = models.FloatField(help_text="Calorias por 100g")
    carboidratos_g = models.FloatField(help_text="Carboidratos (g) por 100g")
    proteinas_g = models.FloatField(help_text="Proteínas (g) por 100g")
    lipideos_g = models.FloatField(help_text="Lipídios (g) por 100g")
    fibra_g = models.FloatField(help_text="Fibras (g) por 100g", blank=True, null=True)
    sodio_mg = models.FloatField(help_text="Sódio (mg) por 100g", blank=True, null=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nome


class Refeicao(models.Model):
    """
    Agrupamento de alimentos, como 'Café da manhã', 'Almoço', etc.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    nome = models.CharField(max_length=200)
    descricao = models.TextField(blank=True, null=True)
    essencial = models.BooleanField(default=False)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nome

    @property
    def total_kcal(self):
        if not self.itens.exists():
            return 0
        return sum(item.kcal_total for item in self.itens.all())

    @property
    def total_carbo(self):
        if not self.itens.exists():
            return 0
        return sum(item.carbo_total for item in self.itens.all())

    @property
    def total_proteina(self):
        if not self.itens.exists():
            return 0
        return sum(item.proteina_total for item in self.itens.all())

    @property
    def total_gordura(self):
        if not self.itens.exists():
            return 0
        return sum(item.gordura_total for item in self.itens.all())


class RefeicaoAlimento(models.Model):
    """
    Relação entre alimento e refeição, armazenando a quantidade usada.
    """
    refeicao = models.ForeignKey(Refeicao, on_delete=models.CASCADE, related_name="itens")
    alimento = models.ForeignKey(Alimento, on_delete=models.CASCADE)
    quantidade_g = models.FloatField(help_text="Quantidade em gramas")

    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    @property
    def kcal_total(self):
        return (self.alimento.energia_kcal / 100) * self.quantidade_g

    @property
    def carbo_total(self):
        return (self.alimento.carboidratos_g / 100) * self.quantidade_g

    @property
    def proteina_total(self):
        return (self.alimento.proteinas_g / 100) * self.quantidade_g

    @property
    def gordura_total(self):
        return (self.alimento.lipideos_g / 100) * self.quantidade_g

    def __str__(self):
        return f"{self.quantidade_g}g de {self.alimento.nome} em {self.refeicao.nome}"

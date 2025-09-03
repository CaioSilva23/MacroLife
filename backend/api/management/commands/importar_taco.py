from django.core.management.base import BaseCommand
from api.models import Alimento
import pandas as pd
from django.conf import settings
import os


def parse_valor(valor):
    try:
        if pd.isna(valor) or str(valor).strip() in ['Tr', '', '-', 'NA', 'nan']:
            return 0.0
        return float(valor)
    except Exception:
        return 0.0


class Command(BaseCommand):
    help = 'Importa os dados do TACO (CSV) para o banco'

    def handle(self, *args, **kwargs):
        csv_path = os.path.join(settings.BASE_DIR, 'data', 'tabela_taco.xlsx')
        if not os.path.exists(csv_path):
            self.stdout.write(self.style.ERROR(f"Arquivo não encontrado: {csv_path}"))
            return

        df = pd.read_excel(csv_path)
        df.dropna(axis=0)
        tamanho = len(df)
        for i in range(tamanho):
            Alimento.objects.create(
                nome=df.loc[i, 'Nome'],
                energia_kcal=parse_valor(df.loc[i, 'Energia (kcal)']),
                proteinas_g=parse_valor(df.loc[i, 'Proteína']),
                lipideos_g=parse_valor(df.loc[i, 'Lipídeos']),
                carboidratos_g=parse_valor(df.loc[i, 'Carboidrato']),
                fibra_g=parse_valor(df.loc[i, 'Fibra Alimentar']),
                sodio_mg=parse_valor(df.loc[i, 'Sódio']),
            )
        self.stdout.write(self.style.SUCCESS('Importação concluída!'))
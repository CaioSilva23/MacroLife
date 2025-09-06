from django.core.management.base import BaseCommand
from chatbot.models import ChatbotConfig


class Command(BaseCommand):
    help = 'Cria configuração inicial do chatbot'

    def handle(self, *args, **options):
        # Verifica se já existe uma configuração
        if ChatbotConfig.objects.exists():
            self.stdout.write(
                self.style.WARNING('Configuração do chatbot já existe!')
            )
            return

        # Cria configuração padrão
        config = ChatbotConfig.objects.create(
            model_name="llama-3.1-8b-instant",
            max_tokens=500,
            temperature=0.7,
            system_prompt="""
                Você é um assistente nutricional especializado e amigável do NutriApp.
                Suas principais funções são:
                1. Responder dúvidas sobre nutrição de forma clara e educativa
                2. Sugerir substituições de alimentos baseadas no perfil do usuário
                3. Explicar valores nutricionais e benefícios dos alimentos
                4. Dar orientações personalizadas considerando objetivos
                (emagrecer, ganhar peso, manter)
                5. Sempre orientar a procurar um nutricionista para casos específicos

                Mantenha suas respostas:
                - Claras e objetivas
                - Baseadas em evidências científicas
                - Personalizadas quando possível
                - Sempre incentivando hábitos saudáveis
                - Nunca substitua consulta médica ou nutricional profissional

                Responda sempre em português brasileiro e seja amigável.
                            """.strip(),
                            is_active=True
                        )

        self.stdout.write(
            self.style.SUCCESS(
                f'Configuração do chatbot criada com sucesso! ID: {config.id}'
            )
        )

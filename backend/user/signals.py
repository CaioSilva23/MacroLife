from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import UserProfile, User
from api.models import Refeicao


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
        Refeicao.objects.create(user=instance, nome="Café da Manhã", essencial=True)
        Refeicao.objects.create(user=instance, nome="Almoço", essencial=True)
        Refeicao.objects.create(user=instance, nome="Lanche", essencial=True)
        Refeicao.objects.create(user=instance, nome="Jantar", essencial=True)

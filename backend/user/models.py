"""
Database models.
"""
from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)


class UserManager(BaseUserManager):
    """Manager for users."""

    def create_user(self, email, password=None, **extra_fields):
        """Create, save and return a new user."""
        if not email:
            raise ValueError('User must have an email address.')
        user = self.model(email=self.normalize_email(email), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, email, password):
        """Create and return a new superuser"""
        user = self.create_user(email, password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)

        return user

class User(AbstractBaseUser, PermissionsMixin):
    """User in the system"""
    email = models.EmailField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"


class UserProfile(models.Model):
    OBJETIVO_CHOICES = [
        ('emagrecer', 'Emagrecer'),
        ('manter', 'Manter peso'),
        ('ganhar', 'Ganhar peso'),
    ]

    SEXO_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Feminino'),
    ]

    NIVEL_ATIVIDADE_CHOICES = [
        ('sedentario', 'Sedentário'),
        ('leve', 'Levemente ativo (1-3x/semana)'),
        ('moderado', 'Moderadamente ativo (3-5x/semana)'),
        ('alto', 'Muito ativo (6-7x/semana)'),
        ('extremo', 'Extremamente ativo (atleta)'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    idade = models.IntegerField(null=True, blank=True)
    peso = models.FloatField(help_text="Peso em kg", null=True, blank=True)
    altura = models.FloatField(help_text="Altura em cm", null=True, blank=True)
    sexo = models.CharField(max_length=1, choices=SEXO_CHOICES, null=True, blank=True)
    nivel_atividade = models.CharField(max_length=20, choices=NIVEL_ATIVIDADE_CHOICES, null=True, blank=True)
    objetivo = models.CharField(max_length=20, choices=OBJETIVO_CHOICES, null=True, blank=True)

    status = models.BooleanField(default=False)

    def __str__(self):
        return self.user.name


class PlanoAlimentar(models.Model):
    profile = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='plano_alimentar')
    calorias_diarias = models.IntegerField()
    proteinas_diarias = models.FloatField(help_text="Proteínas em gramas")
    carboidratos_diarios = models.FloatField(help_text="Carboidratos em gramas")
    gorduras_diarias = models.FloatField(help_text="Gorduras em gramas")

    def __str__(self):
        return f"Plano Alimentar de {self.profile.user.name}"
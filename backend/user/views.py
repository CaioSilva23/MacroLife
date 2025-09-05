from rest_framework.response import Response
from rest_framework import status
from .serializers import UserRegistrationSerializer,\
                                UserLoginSerializer, \
                                UserProfileSerializer, \
                                UserChangePasswordSerializer, \
                                SendPasswordResetEmailSerializer
from django.contrib.auth import authenticate
from .renderers import UserRenderer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import CreateAPIView, GenericAPIView
from .models import User, UserProfile, PlanoAlimentar


# Generate token manually
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)

    return {
        'access': str(refresh.access_token),
    }


def calcular_macros(profile):

    def calcular_tmb(profile):
        if profile.sexo == 'M':
            return (10 * profile.peso) + (6.25 * profile.altura) - (5 * profile.idade) + 5
        return (10 * profile.peso) + (6.25 * profile.altura) - (5 * profile.idade) - 161

    def fator_atividade(profile):
        fatores = {
            'sedentario': 1.2,
            'leve': 1.375,
            'moderado': 1.55,
            'alto': 1.725,
            'extremo': 1.9,
        }
        return fatores.get(profile.nivel_atividade, 1.2)

    def calcular_get(profile):
        return calcular_tmb(profile) * fator_atividade(profile)

    def calorias_ajustadas(profile):
        get = calcular_get(profile)

        if profile.objetivo == 'emagrecer':
            get -= 500
        elif profile.objetivo == 'ganhar':
            get += 300

        # 🔹 Aplica ajuste manual do usuário
        return get


    calorias = calorias_ajustadas(profile)

    # Proteína: 2g/kg
    proteina_g = round(profile.peso * 2, 1)
    proteina_kcal = proteina_g * 4

    # Gordura: 25% das kcal
    gordura_kcal = calorias * 0.25
    gordura_g = round(gordura_kcal / 9, 1)

    # Carboidrato: restante
    carbo_kcal = calorias - (proteina_kcal + gordura_kcal)
    carbo_g = round(carbo_kcal / 4, 1)

    return {
        "calorias_diarias": round(calorias),
        "proteinas_diarias": proteina_g,
        "gorduras_diarias": gordura_g,
        "carboidratos_diarios": carbo_g,
    }

class UserRegistrationAPI(CreateAPIView):
    """
    An endpoint for register user.
    """
    renderer_classes = [UserRenderer]
    serializer_class = UserRegistrationSerializer
    queryset = User.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token = get_tokens_for_user(user=user)
        return Response(
                data={'token': token, 'mgs': 'Registration Success'},
                status=status.HTTP_201_CREATED)
    

class UserLoginAPI(GenericAPIView):
    """
    An endpoint for login user.
    """
    renderer_classes = [UserRenderer]
    serializer_class = UserLoginSerializer

    def post(self, request, format=None):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.data.get('email', "")
        password = serializer.data.get('password', "")

        user = authenticate(email=email, password=password)
        if user is not None:
            token = get_tokens_for_user(user=user)
            return Response({'token': token, 'success': 'Login success'}, status=status.HTTP_200_OK)
        else:
            return Response(
                data={'error': 'Email or Password is not valid'},
                status=status.HTTP_404_NOT_FOUND)


class UserProfileAPI(GenericAPIView):
    """
    An endpoint for profile user.
    """
    renderer_classes = [UserRenderer]
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get(self, request, format=None):
        try:
            profile = request.user.profile
            serializer = self.get_serializer(instance=profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'Perfil não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def put(self, request, format=None):
        serializer = self.get_serializer(instance=request.user.profile, data=request.data)
        serializer.is_valid(raise_exception=True)
        profile = serializer.save()

        # Se o preenchimento do perfil for a primeira vez
        if profile.status is False:
            macros = calcular_macros(profile)
            # Atualiza o status para True após o primeiro preenchimento
            profile.status = True
            profile.save()
        # Se o usuario quer alterar os macros manualmente
        else:
            macros = request.data.get('macros', {})

        # Corrige o uso do update_or_create
        PlanoAlimentar.objects.update_or_create(
            profile=profile,
            defaults=macros
        )

        return Response(serializer.data, status=status.HTTP_200_OK)


class UserChangePasswordView(GenericAPIView):
    """
    An endpoint for change password.
    """
    renderer_classes = [UserRenderer]
    permission_classes = [IsAuthenticated]
    serializer_class = UserChangePasswordSerializer

    def put(self, request, format=None):
        serializer = self.get_serializer(data=request.data, context={'user': request.user})  # noqa: E501
        serializer.is_valid(raise_exception=True)
        return Response(
                data={'msg': 'Password Changed Successfully'},
                status=status.HTTP_200_OK)


class PasswordResetEmailView(GenericAPIView):
    """
     An endpoint to change the password via email.
    """
    renderer_classes = [UserRenderer]
    serializer_class = SendPasswordResetEmailSerializer

    def post(self, request, format=None):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(
                data={'success': 'New password has been sent to your email'},
                status=status.HTTP_200_OK)

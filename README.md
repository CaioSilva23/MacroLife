# 🥗 MacroLife - Sistema de Gestão Nutricional

<div align="center">

![MacroLife](https://img.shields.io/badge/MacroLife-Nutrition%20Management-green?style=for-the-badge)
![Django](https://img.shields.io/badge/Django-5.2.6-092E20?style=for-the-badge&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Material-UI](https://img.shields.io/badge/Material--UI-7.3.2-007FFF?style=for-the-badge&logo=mui&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=for-the-badge&logo=python&logoColor=white)

**Sistema completo para gestão e monitoramento nutricional com interface moderna e intuitiva**

[Funcionalidades](#-funcionalidades) • [Instalação](#-instalação) • [Uso](#-como-usar) • [API](#-api) • [Contribuição](#-contribuição)

</div>

---

## 📋 Sobre o Projeto

O **MacroLife** é uma aplicação web completa para gestão nutricional que permite aos usuários criar, gerenciar e acompanhar suas refeições personalizadas. Com uma base de dados nutricional baseada na Tabela TACO, o sistema oferece cálculos precisos de macronutrientes e uma interface moderna desenvolvida com React e Material-UI.

### 🎯 Objetivos

- **Gestão Nutricional**: Controle completo de refeições e alimentos
- **Cálculos Precisos**: Valores nutricionais baseados na Tabela TACO
- **Interface Moderna**: Design responsivo e intuitivo
- **API RESTful**: Backend robusto com Django Rest Framework

---

## ✨ Funcionalidades

### 🍽️ **Gestão de Refeições**
- ✅ Criação de refeições personalizadas
- ✅ Adição de múltiplos alimentos por refeição
- ✅ Cálculo automático de valores nutricionais
- ✅ Visualização detalhada de macronutrientes
- ✅ Exclusão e edição de refeições

### 🥕 **Base de Alimentos**
- ✅ Base de dados nutricional TACO integrada
- ✅ Busca inteligente de alimentos
- ✅ Informações nutricionais detalhadas (kcal, carboidratos, proteínas, gorduras)
- ✅ Cálculos proporcionais por quantidade

### 📊 **Resumo Nutricional**
- ✅ Dashboard com totais nutricionais
- ✅ Indicadores de progresso diário
- ✅ Visualização de metas nutricionais
- ✅ Estatísticas por refeição

### 🎨 **Interface do Usuário**
- ✅ Design moderno com Material-UI
- ✅ Totalmente responsivo (mobile-first)
- ✅ Gradientes e animações suaves
- ✅ Feedback visual em tempo real

---

## 🚀 Tecnologias Utilizadas

### **Backend**
- **Django 5.2.6** - Framework web robusto
- **Django REST Framework 3.16.1** - API RESTful
- **django-cors-headers** - Configuração CORS
- **pandas** - Manipulação de dados
- **openpyxl** - Processamento de planilhas
- **SQLite** - Banco de dados

### **Frontend**
- **React 19.1.1** - Biblioteca para interface
- **Material-UI 7.3.2** - Componentes de design
- **Axios** - Cliente HTTP
- **Emotion** - CSS-in-JS

### **Dados**
- **Tabela TACO** - Base de dados nutricional oficial

---

## 📦 Instalação

### **Pré-requisitos**
- Python 3.8+
- Node.js 16+
- npm ou yarn

### **1. Clone o Repositório**
```bash
git clone https://github.com/CaioSilva23/MacroLife.git
cd MacroLife
```

### **2. Configuração do Backend**

```bash
# Navegue para o diretório backend
cd backend

# Crie um ambiente virtual
python -m venv venv

# Ative o ambiente virtual
# No Windows:
venv\Scripts\activate
# No Linux/Mac:
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt

# Execute as migrações
python manage.py migrate

# Importe os dados da Tabela TACO
python manage.py importar_taco

# Inicie o servidor de desenvolvimento
python manage.py runserver
```

### **3. Configuração do Frontend**

```bash
# Em outro terminal, navegue para o frontend
cd frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm start
```

### **4. Acesse a Aplicação**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Django**: http://localhost:8000/admin

---

## 💡 Como Usar

### **1. Criando uma Refeição**
1. Acesse a página inicial
2. Clique em "Nova Refeição"
3. Preencha o nome e descrição
4. Busque e adicione alimentos
5. Defina as quantidades
6. Salve a refeição

### **2. Gerenciando Alimentos**
1. Use a busca inteligente para encontrar alimentos
2. Visualize informações nutricionais em tempo real
3. Ajuste quantidades conforme necessário
4. Remova itens desnecessários

### **3. Acompanhando Progresso**
1. Visualize o resumo nutricional geral
2. Acompanhe suas metas diárias
3. Analise distribuição de macronutrientes
4. Monitore calorias por refeição

---

## 🔌 API

### **Endpoints Principais**

```http
# Listar alimentos
GET /api/alimentos/?search=arroz

# Listar refeições
GET /api/refeicoes/

# Criar refeição
POST /api/refeicoes/
Content-Type: application/json

{
  "nome": "Café da Manhã",
  "descricao": "Refeição matinal",
  "itens": [
    {
      "alimento_id": 1,
      "quantidade_g": 100
    }
  ]
}

# Deletar refeição
DELETE /api/refeicoes/
Content-Type: application/json

{
  "refeicao_id": 1
}
```

### **Exemplo de Resposta**

```json
{
  "id": 1,
  "nome": "Café da Manhã",
  "descricao": "Refeição matinal",
  "total_kcal": "250.5",
  "total_carbo": "45.2",
  "total_proteina": "12.8",
  "total_gordura": "5.3",
  "data_criacao": "2025-01-15T08:30:00Z",
  "itens": [
    {
      "alimento_nome": "Pão francês",
      "quantidade_g": 50,
      "kcal_total": 135.0,
      "carbo_total": 28.1,
      "proteina_total": 4.5,
      "gordura_total": 1.2
    }
  ]
}
```

---

## 📱 Screenshots

### Dashboard Principal
![Dashboard](docs/dashboard.png)

### Criação de Refeição
![Criar Refeição](docs/criar-refeicao.png)

### Lista de Refeições
![Lista Refeições](docs/lista-refeicoes.png)

---

## 📊 Estrutura do Projeto

```
MacroLife/
├── backend/                 # Django Backend
│   ├── api/                # API aplicação
│   │   ├── models.py       # Modelos de dados
│   │   ├── views.py        # Views da API
│   │   ├── serializers.py  # Serializers DRF
│   │   └── management/     # Comandos customizados
│   ├── data/               # Dados da Tabela TACO
│   ├── nutrition/          # Configurações Django
│   └── requirements.txt    # Dependências Python
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── services/       # Serviços API
│   │   └── App.js         # Componente principal
│   └── package.json       # Dependências Node.js
└── README.md              # Este arquivo
```

---

## 🧪 Testes

### **Backend**
```bash
cd backend
python manage.py test
```

### **Frontend**
```bash
cd frontend
npm test
```

---

## 🛠️ Desenvolvimento

### **Comandos Úteis**

```bash
# Backend - Criar superusuário
python manage.py createsuperuser

# Backend - Fazer migrações
python manage.py makemigrations
python manage.py migrate

# Frontend - Build para produção
npm run build

# Frontend - Análise do bundle
npm run analyze
```

### **Variáveis de Ambiente**

Crie um arquivo `.env` no backend:

```env
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

---

## 📈 Roadmap

### **Próximas Funcionalidades**
- [ ] Autenticação de usuários
- [ ] Perfis nutricionais personalizados
- [ ] Relatórios de progresso
- [ ] Integração com wearables
- [ ] App móvel nativo
- [ ] Receitas personalizadas
- [ ] Compartilhamento social

### **Melhorias Técnicas**
- [ ] Cache Redis
- [ ] Testes automatizados
- [ ] CI/CD Pipeline
- [ ] Docker containers
- [ ] Monitoring e logs

---

## 🤝 Contribuição

Contribuições são sempre bem-vindas! Para contribuir:

1. **Fork** o projeto
2. Crie uma **branch** para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. Abra um **Pull Request**

### **Padrões de Código**
- Python: PEP 8
- JavaScript: ESLint + Prettier
- Commits: Conventional Commits

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 👨‍💻 Autor

**Caio Silva**
- GitHub: [@CaioSilva23](https://github.com/CaioSilva23)
- LinkedIn: [Caio Silva](https://linkedin.com/in/caio-silva)

---

## 🙏 Agradecimentos

- **IBGE** - Pela disponibilização da Tabela TACO
- **Django** & **React** - Pelas excelentes ferramentas
- **Material-UI** - Pelos componentes lindos
- **Comunidade Open Source** - Por todo o suporte

---

<div align="center">

**⭐ Se este projeto te ajudou, considere dar uma estrela!**

![MacroLife](https://img.shields.io/github/stars/CaioSilva23/MacroLife?style=social)

</div>

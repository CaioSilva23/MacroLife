# 👀 Interface Visual do Chatbot - Experiência do Usuário

## 🎨 Como o Usuário Vê e Usa o Chatbot

### 1. **Botão Flutuante (sempre visível)**
```
┌─────────────────────────────────────────┐
│                                         │
│        Página do NutriApp               │
│                                         │
│    (Lista de Refeições, Perfil, etc)   │
│                                         │
│                                         │
│                                    [🤖] │ ← Botão Chatbot
│                                         │
└─────────────────────────────────────────┘
```

### 2. **Modal do Chat (quando clicado)**
```
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │ 🤖 Assistente Nutricional      [X] │ │ ← Cabeçalho
│ │─────────────────────────────────────│ │
│ │                                     │ │
│ │ 🤖 Olá! Sou seu assistente         │ │ ← Mensagem Bot
│ │    nutricional                      │ │
│ │                                     │ │
│ │                   Oi, quais os 👤 │ │ ← Mensagem Usuário
│ │                   benefícios da     │ │
│ │                   aveia?            │ │
│ │                                     │ │
│ │ 🤖 A aveia é rica em fibras...      │ │ ← Resposta Bot
│ │                                     │ │
│ │─────────────────────────────────────│ │
│ │ Digite sua pergunta...        [📤] │ │ ← Input + Botão
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## 🎯 **Fluxo de Interação do Usuário**

### Passo 1: Acesso
1. Usuário está navegando no NutriApp (logado)
2. Vê o botão flutuante 🤖 no canto inferior direito
3. Passa o mouse → aparece tooltip "Assistente Nutricional"

### Passo 2: Abertura
4. Clica no botão 🤖
5. Modal do chat abre imediatamente
6. Vê mensagem de boas-vindas do assistente

### Passo 3: Conversa
7. Digite pergunta no campo de texto
8. Pressiona Enter ou clica no botão 📤
9. Vê sua mensagem na área de chat
10. Aguarda resposta do assistente (com loading)
11. Recebe resposta personalizada

### Passo 4: Continuação
12. Pode continuar a conversa na mesma sessão
13. Histórico fica visível na área de mensagens
14. Scroll automático para mensagens mais recentes

### Passo 5: Encerramento
15. Clica no "X" para fechar
16. Ou clica fora do modal
17. Conversa fica salva para próxima vez

## 📱 **Responsividade**

### Desktop (1200px+)
- Modal ocupa ~70% da tela
- Chat centralizado
- Botão FAB: 56px

### Tablet (768px - 1199px)
- Modal ocupa ~85% da tela
- Layout adaptado
- Botão FAB: 48px

### Mobile (até 767px)
- Modal ocupa ~95% da tela
- Texto otimizado
- Botão FAB: 40px

## 💡 **Exemplos de Uso Real**

### Usuário na Lista de Refeições
```
📍 Localização: /refeicoes
🎬 Cenário: Usuário vê suas refeições e tem dúvida

1. Vê refeição "Frango com batata doce"
2. Clica no botão do chatbot 🤖
3. Pergunta: "Posso substituir a batata doce por mandioca?"
4. Recebe resposta personalizada considerando seu perfil
```

### Usuário Cadastrando Refeição
```
📍 Localização: /refeicoes/novo
🎬 Cenário: Dúvida durante cadastro

1. Está adicionando alimentos
2. Não sabe qual quantidade usar
3. Clica no chatbot 🤖
4. Pergunta: "Quantos gramas de arroz devo comer?"
5. Recebe orientação baseada em seus objetivos
```

### Usuário na Verificação de Perfil
```
📍 Localização: /verificar-perfil
🎬 Cenário: Configurando objetivos

1. Preenchendo dados do perfil
2. Dúvida sobre nível de atividade
3. Clica no chatbot 🤖
4. Pergunta: "Como sei se sou moderadamente ativo?"
5. Recebe explicação detalhada
```

## 🎨 **Elementos Visuais**

### Cores do Chatbot
- **Botão FAB**: Cor secundária (#FF9800 - laranja)
- **Mensagens do usuário**: Azul primário (#4CAF50)
- **Mensagens do bot**: Cinza claro (#F5F5F5)
- **Texto**: Preto (#333333)

### Ícones
- **Botão Principal**: 🤖 SmartToy
- **Usuário**: 👤 Person
- **Assistente**: 🧠 Psychology
- **Enviar**: 📤 Send
- **Fechar**: ❌ Close

### Animações
- **Fade in/out** para abrir/fechar modal
- **Scroll suave** para novas mensagens
- **Hover effect** no botão FAB (aumenta 10%)
- **Loading dots** enquanto aguarda resposta

## 📊 **Estados da Interface**

### Estado Inicial
- Botão FAB visível
- Chat fechado
- Tooltip disponível

### Estado Carregando
- Modal aberto
- Loading spinner na mensagem
- Input desabilitado temporariamente

### Estado Ativo
- Modal aberto
- Mensagens visíveis
- Input ativo para digitação

### Estado Erro
- Mensagem de erro do assistente
- Input permanece ativo
- Usuário pode tentar novamente

---

**O usuário sempre terá acesso fácil e intuitivo ao chatbot em qualquer página do NutriApp após fazer login!** 🚀

# Frontend ERP + CRM - React + TypeScript + Vite

Sistema frontend para o ERP + CRM genérico, desenvolvido com tecnologias modernas para uma experiência de usuário fluida e responsiva.

## 🚀 Tecnologias Utilizadas

- **React 18** - Biblioteca para interfaces de usuário
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Vite** - Build tool moderna e rápida
- **React Router Dom** - Roteamento client-side
- **Axios** - Cliente HTTP para comunicação com a API
- **React Query** - Gerenciamento de estado servidor e cache
- **Lucide React** - Biblioteca de ícones moderna
- **CSS Modules/Styled Components** - Estilização de componentes

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Backend do ERP + CRM rodando (Java + Spring Boot)

## 🛠️ Instalação e Configuração

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/frontend-erp-crm.git
cd frontend-erp-crm
```

### 2. Instale as dependências
```bash
npm install
# ou
yarn install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=ERP + CRM System
```

### 4. Execute o projeto
```bash
npm run dev
# ou
yarn dev
```

O aplicativo estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
src/
├── components/              # Componentes reutilizáveis
│   ├── ui/                 # Componentes de interface básicos
│   ├── layout/             # Componentes de layout (Header, Sidebar, etc.)
│   └── common/             # Componentes comuns
├── features/               # Funcionalidades por módulo
│   ├── entidade/           # Módulo de Entidades
│   │   ├── components/     # Componentes específicos do módulo
│   │   ├── hooks/          # Hooks customizados
│   │   ├── services/       # Serviços e APIs
│   │   └── types/          # Tipos TypeScript
│   ├── grupo/              # Módulo de Grupos
│   ├── diagnostico/        # Módulo de Diagnósticos
│   ├── planoacao/          # Módulo de Planos de Ação
│   ├── mensagem/           # Módulo de Mensagens
│   └── auth/               # Módulo de Autenticação
├── hooks/                  # Hooks globais
├── services/               # Serviços compartilhados
├── types/                  # Tipos TypeScript globais
├── utils/                  # Utilitários e helpers
├── styles/                 # Estilos globais
├── routes/                 # Configuração de rotas
├── App.tsx                 # Componente principal
└── main.tsx               # Ponto de entrada
```

## 🏗️ Arquitetura do Frontend

### Organização por Features
Cada módulo do sistema (entidade, grupo, diagnóstico, etc.) possui sua própria pasta com:
- **Components**: Componentes React específicos do módulo
- **Hooks**: Hooks customizados para lógica de negócio
- **Services**: Comunicação com APIs
- **Types**: Definições TypeScript

### Gerenciamento de Estado
- **React Query**: Para estado servidor (cache, sincronização)
- **Context API**: Para estado global da aplicação
- **useState/useReducer**: Para estado local dos componentes

### Comunicação com Backend
```typescript
// Exemplo de serviço de API
export const entidadeService = {
  getAll: () => api.get<Entidade[]>('/entidades'),
  getById: (id: number) => api.get<Entidade>(`/entidades/${id}`),
  create: (data: CreateEntidadeDTO) => api.post<Entidade>('/entidades', data),
  update: (id: number, data: UpdateEntidadeDTO) => 
    api.put<Entidade>(`/entidades/${id}`, data),
  delete: (id: number) => api.delete(`/entidades/${id}`)
};
```

## 🔐 Autenticação e Autorização

### Sistema de Login
- Autenticação via JWT
- Redirecionamento automático para login
- Persistência de sessão no localStorage

### Controle de Acesso por Perfis
```typescript
enum UserRole {
  ADMIN = 'ADMIN',
  COORDENADOR = 'COORDENADOR', 
  AGENTE = 'AGENTE',
  CONSULTA = 'CONSULTA'
}
```

### Rotas Protegidas
```typescript
<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.COORDENADOR]}>
  <EntidadeManagement />
</ProtectedRoute>
```

## 📊 Principais Funcionalidades

### 👥 Gestão de Entidades
- **Cadastro**: Formulário completo para pessoas físicas/jurídicas
- **Listagem**: Tabela com filtros, ordenação e paginação
- **Edição**: Formulário de edição com validações
- **Visualização**: Perfil detalhado da entidade
- **Upload de Foto**: Sistema de upload e preview de imagens

### 🏘️ Gestão de Grupos
- **Criação de Grupos**: Formulário para novos grupos
- **Gerenciamento de Membros**: Adicionar/remover entidades
- **Tipos de Grupo**: Categorização flexível

### 📋 Diagnósticos e Planos de Ação
- **Diagnósticos**: Registro e acompanhamento
- **Planos de Ação**: Criação e monitoramento de metas
- **Status Tracking**: Acompanhamento de progresso

### 💬 Sistema de Mensagens
- **Envio Individual**: Mensagens para entidades específicas
- **Envio em Grupo**: Mensagens para grupos inteiros
- **Histórico**: Rastreamento de mensagens enviadas

## 🎨 Interface de Usuário

### Design System
- **Componentes Reutilizáveis**: Botões, inputs, modais padronizados
- **Tema Responsivo**: Adaptação para mobile, tablet e desktop
- **Acessibilidade**: Seguindo padrões WCAG

### Componentes Principais
```typescript
// Exemplo de componente de entidade
const EntidadeCard = ({ entidade }: { entidade: Entidade }) => (
  <div className="entidade-card">
    <img src={entidade.foto} alt={entidade.nome} />
    <h3>{entidade.nome}</h3>
    <p>{entidade.identificador}</p>
    <span className={`status ${entidade.status.toLowerCase()}`}>
      {entidade.status}
    </span>
  </div>
);
```

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview da build de produção
npm run lint         # Executa ESLint
npm run type-check   # Verificação de tipos TypeScript
npm run test         # Executa testes
```

## 📱 Responsividade

O sistema é totalmente responsivo, adaptando-se a:
- **Desktop**: Layout completo com sidebar
- **Tablet**: Layout adaptado com navegação compacta
- **Mobile**: Interface otimizada para touch

## 🚀 Deploy

### Build de Produção
```bash
npm run build
```

### Deploy na Vercel
```bash
npm install -g vercel
vercel --prod
```

### Deploy no Netlify
```bash
npm run build
# Fazer upload da pasta dist/
```

## 🔄 Integração com Backend

### Configuração de Proxy (desenvolvimento)
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
```

### Interceptadores HTTP
```typescript
// Interceptador para adicionar token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

**Desenvolvido com ❤️ usando React + TypeScript + Vite**
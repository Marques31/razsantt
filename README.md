# 📄 Currículo SPA — Infraestrutura & Scaffolding

Infraestrutura e scaffolding modernos, modulares e de alta performance para um **Currículo em formato Single Page Application (SPA)**, desenvolvido com **Vite**, **Vue 3**, **TypeScript** e **Vanilla CSS**.

---

## 🚀 Tecnologias & Ferramentas

- **Vite 6**: Bundler e servidor de desenvolvimento ultra-rápido.
- **Vue 3 (Composition API / `<script setup>`)**: Framework reativo leve e componentizado.
- **TypeScript**: Tipagem estática rigorosa para garantir integridade estrutural e fácil manutenção.
- **Lucide Icons (`lucide-vue-next`)**: Conjunto de ícones vetoriais modernos e otimizados.
- **Vanilla CSS (Tokens & Design System)**: Sem frameworks CSS pesados, variáveis nativas para temas Claro/Escuro e folha de estilo para impressão (`print.css`).
- **IntersectionObserver (Scroll Spy)**: Destaque automático no menu de navegação e rolagem suave.

---

## 📁 Estrutura do Projeto

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages CI/CD automatizado
├── public/
│   ├── favicon.svg             # Favicon vetorial da aplicação
│   ├── robots.txt              # Regras de indexação para SEO
│   └── _redirects              # Roteamento SPA para Netlify e Cloudflare Pages
├── src/
│   ├── assets/
│   │   └── styles/
│   │       ├── base.css        # Tokens CSS, temas Dark/Light e reset global
│   │       ├── layout.css      # Sistema de grid, cards, botões e badges
│   │       └── print.css       # Estilização para impressão e exportação em PDF (@media print)
│   ├── components/
│   │   ├── common/
│   │   │   ├── AppHeader.vue   # Header fixo glassmorphism com scroll spy
│   │   │   ├── AppFooter.vue   # Rodapé com botão de voltar ao topo
│   │   │   ├── ThemeToggle.vue # Alternador de tema Claro / Escuro
│   │   │   ├── SectionHeading.vue # Título padronizado com badge e subtítulo
│   │   │   ├── ActionButtons.vue  # Botões rápidos (Projetos, Contato, Imprimir PDF)
│   │   │   └── TagBadge.vue    # Tags e pills de tecnologias
│   │   └── sections/
│   │       ├── HeroSection.vue       # Apresentação, cargo, disponibilidade e links
│   │       ├── AboutSection.vue      # Resumo profissional e métricas
│   │       ├── ExperienceSection.vue # Timeline de carreira e realizações
│   │       ├── ProjectsSection.vue   # Vitrine de projetos e repositórios
│   │       ├── SkillsSection.vue     # Competências categorizadas
│   │       ├── EducationSection.vue  # Formação acadêmica e certificações
│   │       └── ContactSection.vue    # Canais de contato direto e cópia de e-mail
│   ├── composables/
│   │   ├── useTheme.ts         # Gerenciamento do tema Dark/Light
│   │   ├── useScrollSpy.ts     # Detecção da seção visível na tela
│   │   └── usePrint.ts         # Acionamento de diálogo de impressão PDF
│   ├── data/
│   │   └── resume.ts           # 🌟 ARQUIVO PRINCIPAL DE DADOS (Edite seus dados aqui)
│   ├── types/
│   │   └── resume.ts           # Tipagens TypeScript para os dados
│   ├── App.vue                 # Componente raiz da SPA
│   └── main.ts                 # Ponto de entrada da aplicação
├── index.html                  # HTML5 semântico com meta tags e fontes
├── package.json                # Scripts e dependências do projeto
├── tsconfig.json               # Configurações do TypeScript e alias `@/*`
├── vite.config.ts              # Configuração do Vite e otimizações de build
├── vercel.json                 # Roteamento e cache para Vercel
└── README.md                   # Documentação do projeto
```

---

## 🛠️ Como Executar Localmente

### 1. Pré-requisitos
- **Node.js**: versão 18 ou superior.
- **npm** ou **pnpm** ou **yarn**.

### 2. Instalação das dependências
```bash
npm install
```

### 3. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000` no seu navegador.

### 4. Validar tipagens TypeScript
```bash
npm run type-check
```

### 5. Gerar build estático para produção
```bash
npm run build
```
Os arquivos estáticos otimizados (HTML, CSS e JS) serão gerados no diretório `dist/`.

### 6. Testar build localmente
```bash
npm run preview
```

---

## ✏️ Como Personalizar Seus Dados

Todo o conteúdo do currículo é **orientado a dados (Data-Driven)**. Você não precisa alterar o código dos componentes HTML/Vue para atualizar seu histórico.

Basta editar o arquivo [`src/data/resume.ts`](file:///src/data/resume.ts):
- **`profile`**: Seu nome, cargo, resumo, localização, disponibilidade e links sociais.
- **`experiences`**: Suas experiências profissionais com descrição, realizações e tecnologias.
- **`projects`**: Seus projetos com links para demonstração ao vivo e repositório no GitHub.
- **`skillCategories`**: Suas competências divididas por áreas (Frontend, Backend, DevOps, etc.).
- **`education` & `certifications`**: Sua formação acadêmica e cursos certificados.

---

## 🌐 Deploy em Hospedagens Estáticas

Como este projeto é compilado em arquivos estáticos (HTML/CSS/JS puros), **não é necessário um servidor Node.js em produção**.

### 🔹 Vercel
1. Conecte seu repositório no dashboard da [Vercel](https://vercel.com).
2. O arquivo [`vercel.json`](file:///vercel.json) já está configurado. O build ocorrerá automaticamente com `npm run build` e diretório de saída `dist`.

### 🔹 Netlify / Cloudflare Pages
1. Conecte o repositório no dashboard do [Netlify](https://netlify.com) ou [Cloudflare Pages](https://pages.cloudflare.com).
2. Defina o comando de build como `npm run build` e o diretório de publicação como `dist`.
3. O arquivo [`public/_redirects`](file:///public/_redirects) garante o roteamento SPA automático.

### 🔹 GitHub Pages
- O repositório já inclui o arquivo [`.github/workflows/deploy.yml`](file:///.github/workflows/deploy.yml). Ao realizar um push para a branch `main`, o GitHub Actions efetuará o build e o deploy automaticamente.

---

## 🖨️ Exportação em PDF & Impressão

A aplicação conta com um arquivo de estilo dedicado [`src/assets/styles/print.css`](file:///src/assets/styles/print.css).
- Ao clicar no botão **"Imprimir / PDF"** ou usar o atalho `Ctrl + P` (ou `Cmd + P`), o navegador aciona a folha de estilo de impressão que remove menus flutuantes, oculta botões, ajusta margens e gera um documento limpo e profissional pronto para salvar em PDF.

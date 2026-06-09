# Setup Inicial do App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Inicializar o projeto React com Vite, configurar o Tailwind CSS (Dark Mode Premium) e implementar a abstração de dados via LocalStorage.

**Architecture:** App React Single Page Application (SPA), estilizado com Tailwind, focado em persistência local com abstração de repositório.

**Tech Stack:** React 18, Vite, Tailwind CSS, LocalStorage.

---

### Task 1: Inicializar Vite React Project

**Files:**
- Create: estrutura base do Vite no diretório atual

- [ ] **Step 1: Scaffold do projeto via terminal**

```bash
npm create vite@latest . -- --template react
npm install
```
Expected: Pastas e arquivos do React gerados sem erro.

- [ ] **Step 2: Commit inicial do React**

```bash
git add .
git commit -m "chore: inicializa react app via vite"
```

### Task 2: Configurar Tailwind CSS para Premium Dark Mode

**Files:**
- Create: `tailwind.config.js`, `postcss.config.js`
- Modify: `src/index.css`

- [ ] **Step 1: Instalar dependências**

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```
Expected: Arquivos de configuração gerados.

- [ ] **Step 2: Escrever tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0b0f19', // Fundo principal super escuro
          800: '#111827', // Fundo de cards
          700: '#1f2937', // Bordas
        },
        brand: {
          500: '#3b82f6', // Azul elegante ou #ff6600 se formos pro Neo-brutalist
        }
      }
    },
  },
  plugins: [],
}
```

- [ ] **Step 3: Atualizar src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-dark-900 text-gray-100 antialiased;
}

/* Utilitário para glassmorphism (Premium Dark Mode) */
.glass-panel {
  @apply bg-dark-800/80 backdrop-blur-md border border-dark-700 rounded-xl shadow-lg;
}
```

- [ ] **Step 4: Commit das configurações**

```bash
git add .
git commit -m "chore: configura tailwind css com tema dark"
```

### Task 3: Criar Abstração de Dados (DataLayer)

**Files:**
- Create: `src/lib/data.js`

- [ ] **Step 1: Implementar o wrapper do LocalStorage**

```javascript
// src/lib/data.js
// Esta camada abstrata garante que a UI não dependa de *onde* os dados estão.
export const DataLayer = {
  get: (key) => JSON.parse(localStorage.getItem(key) || '[]'),
  set: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
  
  getTransactions: () => DataLayer.get('transactions'),
  addTransaction: (tx) => {
    const txs = DataLayer.getTransactions();
    tx.id = Date.now().toString();
    tx.date = new Date().toISOString();
    txs.push(tx);
    DataLayer.set('transactions', txs);
    return tx;
  },

  getCategories: () => DataLayer.get('categories'),
  saveCategories: (cats) => DataLayer.set('categories', cats)
};
```

- [ ] **Step 2: Commit do DataLayer**

```bash
git add src/lib/data.js
git commit -m "feat: cria camada de dados local-first"
```

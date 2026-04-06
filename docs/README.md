# ⬛ Raven-Os: O Framework do Futuro

Bem-vindo à documentação oficial do **Raven-Os**, o framework de execução e build projetado para unificar o desenvolvimento Web e Mobile com uma experiência de desenvolvedor (DX) inspirada em Flutter, mas potencializada pelo ecossistema JavaScript/TypeScript.

## 🚀 Visão Geral

O Raven-Os não é apenas uma biblioteca de UI. É um **Motor de Execução Multidpositivo** que permite criar aplicações reais, sincronizadas e seguras com uma única base de código.

### Pilares do Raven-Os:
1. **Multiplayer-First**: Colaboração em tempo real via **Raven Nexus**.
2. **Segurança Privada**: Criptografia de ponta-a-ponta (E2EE) nativa.
3. **Local-First**: Persistência inteligente com **NexusDB**.
4. **Build Inteligente**: Bundler customizado baseado em `esbuild` com cache persistente.

---

## 🛠️ Começando (Quick Start)

Para iniciar seu ambiente de desenvolvimento Raven:

### 1. Clonar e Instalar
```bash
npm install
```

### 2. Rodar o Ambiente Dev (Modo Local)
```bash
# Inicia Web e Mobile em paralelo
npm run dev
```

### 3. Rodar o Modo "Live App Network" (Múltiplos Dispositivos)
Se quiser conectar seu celular físico e outros computadores na mesma rede:
```bash
npm run dev -- --network
```
> O terminal gerará um **QR Code** para descoberta instantânea.

---

## 📂 Navegue pela Documentação

- [**Arquitetura do ecossistema**](./ARCHITECTURE.md): Entenda como o Monorepo e os pacotes Cli, Core e Ui se conectam.
- [**Estilização & Design System**](./STYLING.md): Guia sobre Tailwind CSS, NativeWind e o sistema de cores HSL.
- [**Raven Nexus (Sincronização)**](./NEXUS.md): Como usar o motor de colaboração, E2EE e o banco de dados NexusDB.
- [**Build & Deploy**](./DEPLOY.md): Detalhes sobre o pipeline de build e o sistema de cache inteligente.

# 🏛️ Arquitetura do Raven-Os

O Raven-Os é estruturado como um **Monorepo Moderno**, garantindo que o código de negócio seja compartilhado entre Web e Mobile, enquanto as implementações de plataforma permanecem cirúrgicas.

## 📂 Estrutura de Diretórios

```text
c:/Projetos/Raven-Os/
├── apps/
│   ├── web/        # Aplicação Next.js/React puro
│   └── mobile/     # Aplicação React Native/Expo
├── packages/
│   ├── cli/        # O Bundler, DevServer e Coração do Framework
│   ├── core/       # Estado Global (Zustand), Temas, Storage e Nexus
│   ├── ui/         # Componentes Primitivos e DevTools
│   └── runtime/    # Bootstraps e Pontes de Execução
└── docs/           # Documentação do Framework
```

---

## 📦 Pacotes em Detalhe

### 1. `@raven-os/cli` (O Bundler Inteligente)
Diferente de frameworks tradicionais, o Raven-Os usa um bundler customizado baseado em **esbuild**.
- **Dev Hub V3**: Um servidor WebSocket central que coordena a sincronização entre todos os dispositivos conectados.
- **Incremental Cache**: Armazena hashes de arquivos para pular builds de arquivos não alterados (Pipeline Hashing).
- **Discovery QR Code**: Gera um código de descoberta para conexão instantânea de dispositivos móveis.

### 2. `@raven-os/core` (O Cérebro)
- **Zustand Store**: Gerenciamento de estado global unificado para Web e Mobile.
- **RavenTheme**: Sistema de temas baseado em **HSL**, permitindo mudanças de cor dinâmicas e harmônicas.
- **RavenStorage**: Abstração de persistência que escolhe automaticamente entre `localStorage` (Web) e `AsyncStorage` (Mobile).

### 3. `@raven-os/ui` (O Corpo)
Contém os componentes primitivos que os desenvolvedores usam para construir interfaces.
- **Primitivos (Web/Native)**: `RavenText`, `RavenButton`, `RavenView`.
- **Raven Nexus UI**: Componentes colaborativos como `CollaborativeInput` e `NexusLeaderboard`.
- **DevTools**: Um overlay de depuração que oferece **Time Travel** e **Module Graph visualization**.

---

## 🔄 Sistema de Override por Plataforma

O Raven-Os usa uma técnica de resolução de extensão para garantir que o código seja otimizado para cada ambiente:

1. `component.web.tsx` -> Resolvido pelo Raven CLI para o navegador.
2. `component.native.tsx` -> Resolvido pelo Metro para o aplicativo móvel.
3. `component.tsx` -> Fallback cross-platform (usando apenas primitivos Raven).

Isso permite que você escreva lógica de negócio 100% compartilhada, mas tenha visuais ou comportamentos específicos quando necessário.

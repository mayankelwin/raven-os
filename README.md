# Raven-Os Framework ⬛🚀

**Raven-Os** is a professional-grade, cross-platform framework designed to unify Web and Mobile development. Built on top of **React**, **React Native**, and **Vite**, it allows you to write your business logic and UI once and deploy it everywhere with premium aesthetics.

---

## 🏗️ Architecture Overview

Raven-Os uses a monorepo structure managed by **TurboRepo**:

-   **`apps/web`**: A high-performance Web application powered by **Vite**.
-   **`apps/mobile`**: A native mobile application powered by **Expo**.
-   **`packages/core`**: The framework's "engine" providing unified state management (Zustand) and shared business logic.
-   **`packages/ui`**: A premium UI SDK with **Glassmorphism** and high-end design components sharing code between Web and Mobile.
-   **`packages/cli`**: The command-line tool to bootstrap and manage Raven-Os projects.

---

## 🚀 Getting Started

### 1. Installation

Clone the repository and install dependencies at the root:

```bash
npm install
```

### 2. Running the Development Environment

Raven-Os provides unified scripts to manage your development workflow directly from the root directory:

#### Run Everything (Web + Mobile)
Starts both the Vite dev server and the Expo development environment.
```bash
npm run dev
```

#### Run Web Only
```bash
npm run web
```

#### Run Mobile Only
```bash
npm run mobile
```

---

## 🎨 UI Component Usage

Raven-Os components are designed to be "Premium" out of the box. They automatically adapt between Web and Mobile.

### Example: Creating a Shared Card

```tsx
import { RavenView, RavenText, RavenCard, RavenButton, RavenStack } from '@raven-os/ui';

const MyComponent = () => {
  return (
    <RavenView>
      <RavenStack gap={20}>
        <RavenText variant="h1">Dashboard</RavenText>
        
        <RavenCard style={{ padding: 30 }}>
          <RavenText variant="h2">Universal Connectivity</RavenText>
          <RavenText variant="body">
            This card uses glassmorphism on the web and native elevation on mobile.
          </RavenText>
          <RavenButton 
            title="Action" 
            onPress={() => console.log('Pressed!')} 
            style={{ marginTop: 20 }}
          />
        </RavenCard>
      </RavenStack>
    </RavenView>
  );
};
```

---

## 🧠 State Management

Raven-Os includes a built-in unified store powered by **Zustand**. Use it to keep your Web and Mobile apps in sync.

```tsx
import { useRaven } from '@raven-os/core';

const ProfileComponent = () => {
  const { user, setTheme } = useRaven(); // Access global framework state
  
  return (
    <RavenButton 
      title="Toggle Dark Mode" 
      onPress={() => setTheme('dark')} 
    />
  );
};
```

---

## 🛠️ CLI Tools

You can use the built-in CLI to initialize new projects or manage existing ones:

```bash
npx raven-os init [project-name]
```

---

## 💎 Design Philosophy: Premium aesthetics

-   **Glassmorphism**: Built-in support for `backdropFilter` on web components.
-   **Unified Spacing**: Uses the `RavenStack` system for consistent gaps.
-   **Dark Mode Ready**: Every component is built with a deep-space dark theme by default.

---

## 📄 License

Raven-Os is MIT licensed. Created for high-performance, beautiful engineering.

---

## 🦾 Platform Override System (Flutter-style)

Raven-Os implements a **surgical isolation model** for platform-specific code. You write once, and only override what needs to differ per platform. No coupling, no `if` statements, zero complexity.

### How it works

The bundlers resolve files in priority order:

| Bundler | File checked first | Fallback |
|---|---|---|
| Vite (Web) | `Component.web.tsx` | `Component.tsx` |
| Metro (Mobile) | `Component.native.tsx` | `Component.tsx` |

### Bug fix only on mobile — the workflow

```
1. Bug reported: "RavenInput crashes on Android"

2. Create a mobile-only fix:
   packages/ui/src/components/
   ├── RavenInput.tsx          ← shared (web still uses this, untouched)
   └── RavenInput.native.tsx   ← mobile fix lives here

3. Web build never loads RavenInput.native.tsx.
   Mobile build never loads .web.tsx overrides.

4. Done. Zero coupling. Zero risk to the other platform.
```

### Bug fix only on web — same pattern

```
packages/ui/src/components/
├── RavenHeader.tsx          ← shared
└── RavenHeader.web.tsx      ← web-only fix (sticky header, scroll events, etc.)
```

### Usage in your code

Imports are always the same — the bundler resolves the right file:

```tsx
// Always import from the shared name — the bundler does the rest
import { RavenCard } from '@raven-os/ui';
// On web  → loads RavenCard.web.tsx (if it exists) or RavenCard.tsx
// On mobile → loads RavenCard.native.tsx (if it exists) or RavenCard.tsx
```

### Runtime platform checks (minor adjustments)

For value-level differences (padding, colors), use `RavenPlatform`:

```tsx
import { RavenPlatform } from '@raven-os/core';

const spacing = RavenPlatform.select({
  web: 24,
  native: 16,
});
```

### Layer Versioning (`raven.config.ts`)

Track independent versions for each platform layer:

```ts
// packages/core/src/raven.config.ts
layers: {
  shared: { version: '1.5.0', enabled: true }, // Base — used by all
  web:    { version: '1.5.0', enabled: true }, // Web production
  native: { version: '1.4.3', enabled: true }, // Mobile — still in review
}
```

### Rules for teams

| File | Responsible team |
|---|---|
| `Component.tsx` | Both teams (shared agreement) |
| `Component.web.tsx` | Web team only |
| `Component.native.tsx` | Mobile team only |


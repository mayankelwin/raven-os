# CLI Reference: Command & Control Hub

The **Raven CLI** is the management and execution hub for your framework. It coordinates development, builds, and synchronized data management.

## 🚀 Development & Build

### Launch Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

## 🗝️ Nexus Management (npm run nexus)

The Nexus CLI provides a dedicated toolset for inspecting and managing your synchronized data.

### List Active Collections
```bash
npm run nexus ls
```

### View Collection Data (Tabular Format)
```bash
npm run nexus view <collection_name>
```

### Drop a Collection
```bash
npm run nexus drop <collection_name>
```

### Complete NexusDB Reset
```bash
npm run nexus clear
```

## 🩺 System Diagnostic

### Framework Health Check
```bash
npm run doctor
```
Checks for proper directory structure, workspace configuration, and dependency health.

---
**Status: ELITE & GLOBAL.**
Developed with Antigravity ⬛🌌🚀

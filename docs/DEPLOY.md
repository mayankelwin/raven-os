# 🚀 Build & Deploy: O Pipeline Raven

O Raven-Os utiliza um sistema de build inteligente (Cli) para garantir que sua aplicação seja rápida em produção e instantânea em desenvolvimento.

## ⚡ Desenvolvimento (Dev Server)

Ao rodar `npm run dev`, o Raven inicia o **Dev Hub V3**:
- **Hot Module Replacement (HMR)**: O Clipping Server monitora as mudanças e injeta apenas os módulos alterados via WebSockets.
- **Smart Asset Handling**: Imagens e SVGs são processados automaticamente em tempo de execução.
- **Modo Network**: Com `--network`, o servidor libera acesso para IPs externos, permitindo testes remotos imediatos.

---

## 🏗️ Pipeline de Build (Produção)

O comando `npm run build` executa uma série de passos de otimização:

1. **Hashing de Código**: Todos os arquivos geram hashes de conteúdo. Se um módulo não mudou, o cache é reutilizado, economizando tempo de CPU.
2. **Minificação Total**: O esbuild remove espaços, comentários e otimiza nomes de variáveis sem quebrar a lógica.
3. **Tree Shaking**: Código morto (não utilizado) é removido do pacote final.
4. **Resolução de Plataforma**: O sistema decide se deve usar o bundle Web ou Native com base no alvo de build.

---

## 📱 Sincronização Mobile (Expo)

Diferente de frameworks que exigem recompilação total para mobile, o Raven-Os serve o bundle via Metro:
- **Fast Refresh**: Mudanças no código TSX são refletidas quase instantaneamente no app Expo Go.
- **Native Bridge**: O Raven-Os se comunica com as APIs nativas do dispositivo (Câmera, Storage, Biometria) de forma transparente.

---

## 🏁 Dicas de Deploy

- **Web**: A pasta `apps/web/dist` contém um site estático puro. Pode ser hospedada no Vercel, Netlify ou AWS S3.
- **Mobile**: Use `npx expo prebuild` e `npx expo run:android` para gerar binários nativos de produção.

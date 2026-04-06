# 🎨 Estilização & Design System no Raven-Os

O Raven-Os utiliza uma abordagem unificada de estilização, permitindo que você escreva classes **Tailwind CSS** que funcionam nativamente tanto na Web quanto no Mobile.

## 🌈 Sistema de Cores HSL

O framework utiliza um sistema de cores baseado em **HSL (Hue, Saturation, Lightness)**, garantindo harmonização automática entre temas claro e escuro.

### Uso prático:
```tsx
import { useRavenTheme } from '@raven-os/core';

const MyComponent = () => {
    const { colors, isDark, toggleTheme } = useRavenTheme();
    
    return (
        <div style={{ backgroundColor: colors.background }}>
            <button onClick={toggleTheme}>Alternar Tema</button>
        </div>
    );
}
```

---

## 🌪️ Tailwind CSS + NativeWind

O Raven-Os integra **NativeWind v4** para traduzir classes Tailwind em estilos React Native nativos.

### Web (Bruto):
As classes Tailwind são processadas pelo PostCSS e servidas como CSS padrão.

### Mobile (Nativo):
O NativeWind utiliza um plugin do Babel para transformar `className="..."` em `style={...}` otimizados durante o build.

### Exemplo Unificado:
```tsx
// Este componente renderiza perfeitamente no Browser e no Android/iOS
<RavenView className="flex-1 bg-slate-900 items-center justify-center p-6">
    <RavenText className="text-2xl font-bold text-white mb-2">
        Título de Impacto
    </RavenText>
    <RavenText className="text-slate-400 text-center">
        Subtítulo estilizado com Tailwind
    </RavenText>
</RavenView>
```

---

## 🚀 Guia de Migração: StyleSheet -> Tailwind

Se você vem do React Native tradicional (`StyleSheet.create`), aqui está como traduzir os conceitos comuns:

| React Native (StyleSheet) | Raven-Os (Tailwind) |
| :--- | :--- |
| `flex: 1` | `className="flex-1"` |
| `backgroundColor: '#0f172a'` | `className="bg-slate-900"` |
| `padding: 20` | `className="p-5"` (20px / 4) |
| `fontSize: 24, fontWeight: 'bold'` | `className="text-2xl font-bold"` |
| `alignItems: 'center'` | `className="items-center"` |
| `borderRadius: 8` | `className="rounded-lg"` |

> [!TIP]
> Use a extensão **Tailwind CSS IntelliSense** no seu editor. Ela sugerirá classes Raven que funcionam em ambas as plataformas.

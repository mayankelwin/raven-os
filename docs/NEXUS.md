# 🌐 Raven Nexus: O Motor Colaborativo

O **Raven Nexus** é o coração da experiência multi-jogador do framework. Ele permite que qualquer dado seja sincronizado entre navegadores, celulares e desktops em tempo real, com segurança absoluta.

## 🧠 Como funciona o Sync Hub

O Nexus utiliza um **Atomic Delta Relay Engine** (Motor de Retransmissão Delta Atômica) no servidor. Quando você altera um valor, o Raven-Os envia apenas a mudança (o delta) para o Hub, que a distribui instantaneamente para todos os outros colaboradores na "sala" (Room).

### Handshaking Inicial
Ao entrar em uma sala, o Nexus Hub solicita automaticamente o estado atual para o colaborador mais antigo. Isso garante que você nunca comece com uma tela vazia.

---

## 🔒 Segurança: RavenCrypt (E2EE)

A privacidade é o pilar do Nexus. Implementamos a criptografia **ponta-a-ponta (Zero-Knowledge)** baseada no padrão AES-GCM.

- **Criptografia no Cliente**: Todos os dados são criptografados no navegador ou celular antes de serem enviados para o servidor.
- **Relay Cego**: O servidor Raven nunca tem acesso ao conteúdo dos dados. Ele apenas retransmite "blobs" opacos para outros clientes autorizados.
- **Segurança Nativa**: No Mobile, o Raven-Os utiliza aceleração de hardware quando disponível para garantir performance criptográfica.

---

## 💾 NexusDB: Persistência Local-First

O Nexus não serve apenas para sincronizar; ele serve para durar. O **NexusDB** é o banco de dados persistente integrado que garante que seus scores, textos e conquistas sobrevivam ao reinício do aplicativo.

### Driver Inteligente:
- **Web**: Utiliza `localStorage` (Cache de alta performance).
- **Mobile**: Utiliza `AsyncStorage` / `SQLite` nativo para garantir que os dados não se percam entre sessões.

---

## 🛠️ Como usar no Projeto

### 1. Sincronização Simples com `useRavenNexus`
```tsx
import { useRavenNexus } from '@raven-os/ui';

const CollaborativeCounter = () => {
    const { data, setData, broadcastDelta } = useRavenNexus<number>({
        room: 'my-global-counter',
        initialValue: 0,
        encrypt: true, // Ativa AES-GCM
        persist: true  // Salva no NexusDB
    });

    const increment = () => {
        const next = data + 1;
        setData(next);
        broadcastDelta(next);
    }
    
    return <button onClick={increment}>Score: {data}</button>;
}
```

### 2. Componentes de UI Colaborativos:
O Raven-Os oferece componentes prontos que "já vêm com multiplayer":
- `<CollaborativeInput />`: Input de texto que sincroniza caractere por caractere.
- `<NexusLeaderboard />`: Ranking dinâmico e seguro para gamificação.

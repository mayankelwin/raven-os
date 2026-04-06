# Nexus Logic: Server-side Business Functions

The **Nexus Logic** engine allows you to write business logic that executes directly on the **Raven Hub (CLI)**. This provides a "Server-side Autonomy" that keeps your frontend clean and your processes centralized.

## 🚀 Creating Functions (nexus/functions/)

To create a new server-side function, place a `.ts` or `.js` file in the `nexus/functions` directory. Functions are hot-reloaded instantly when saved.

```ts
// nexus/functions/index.ts (Simplified Example)

/**
 * onDelta Trigger (Runs when a KV key changes)
 */
export const onDelta_counter = (value, ctx) => {
  if (value > 100) {
    ctx.update('alert', 'Warning: High Counter!');
  }
};

/**
 * onCall Trigger (Direct RPC from Frontend)
 */
export const onCall_sum = async (data, ctx) => {
  return data.a + data.b;
};

/**
 * onCollection Trigger (Runs when an item is added)
 */
export const onCollection_orders = (item, ctx) => {
  console.log(`New Order: ${item.id}`);
};
```

## 🪄 Invoking Functions (useNexusFunction)

You can call your server-side functions from any device using the `useNexusFunction` hook:

```tsx
const { call } = useNexusFunction();

const handleAdd = async () => {
  const result = await call('sum', { a: 10, b: 20 });
  console.log(`Server calculation: ${result}`);
}
```

## 🛡️ Secure Execution Context

Every function receives a **NexusContext**:
- **`state`**: Access to the full `nexusState`.
- **`room`**: The current room identifier.
- **`clientId`**: The ID of the client that triggered the function.
- **`update(key, value)`**: A method to modify the global state reactively.
- **`broadcast(msg)`**: Send messages to all clients in the room.

---
**Status: INTELLIGENT & COMMANDED.**
Developed with Antigravity ⬛🌌🚀

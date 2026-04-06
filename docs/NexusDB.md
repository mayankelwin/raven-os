# NexusDB: Unified Key-Value & Collection Sync

The **NexusDB** is the reactive heart of Raven-Os. It synchronizes your application state across all devices (Web & Mobile) in real-time, with local-first persistence.

## 🗝️ Key-Value Sync (useNexus)

For simple global states (theme, counters, settings), use `useNexus`:

```tsx
const [count, setCount] = useNexus('app_counter', 0);

// Changing it here updates it on all devices instantly.
setCount(count + 1);
```

## 📦 Dynamic Collections (useNexusCollection)

For lists of related data (users, messages, tasks), use `useNexusCollection`:

```tsx
const { data, add, remove, update } = useNexusCollection<{ name: string }>('tasks');

// Adding a task
add({ name: 'Build Raven App' });

// Updating it
update('xyz-123', { name: 'Build Raven Elite App' });
```

## 🛡️ Persistence & Room Isolation

- **Room Isolation**: Each application instance connects to a "Nexus Room". State is only shared within that room.
- **Local Cache**: Even when offline, data is saved in `RavenStorage`.
- **Hub Persistence**: The CLI saves state to `.raven/nexus_db.json`, ensuring data survives server restarts.

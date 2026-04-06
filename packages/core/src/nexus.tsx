import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { RavenStorage } from './storage';

/**
 * Raven Nexus Engine (V32 - Unified Sync)
 * 
 * Provides reactive, multi-device synchronization for application state.
 */

interface NexusMessage {
  type: 'nexus-delta' | 'nexus-presence' | 'nexus-req-state' | 'nexus-req-state-from-peer' | 'sync' | 'nexus-join' | 'nexus-call' | 'nexus-call-res';
  room: string;
  key?: string;
  value?: any;
  clientId?: string;
  targetId?: string;
  requesterId?: string;
  name?: string;
  data?: any;
  callId?: string;
  result?: any;
  error?: string;
}

export class RavenNexusManager {
  private ws: WebSocket | null = null;
  private listeners: Set<(msg: NexusMessage) => void> = new Set();
  private pendingDeltas: Map<string, any> = new Map();

  constructor(private room: string = 'DEFAULT') {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    // Try to get existing WS from window (injected by RavenDevServer)
    const existingWs = (window as any).__RAVEN_WS__;
    if (existingWs) {
      this.ws = existingWs;
      this.setupListeners();
    } else {
      // Manual fallback for production or standalone
      const host = window.location.host;
      this.ws = new WebSocket(`ws://${host}`);
      this.setupListeners();
    }
  }

  private setupListeners() {
    if (!this.ws) return;

    // Join the room
    this.send({ type: 'nexus-join', room: this.room });

    this.ws.addEventListener('message', (event) => {
      try {
        const msg = JSON.parse(event.data);
        this.listeners.forEach(l => l(msg));
      } catch (e) {}
    });

    // Listen for peer state requests
    window.addEventListener('raven-nexus-event', (e: any) => {
      const data = e.detail;
      this.listeners.forEach(l => l(data));
    });
  }

  send(msg: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ ...msg, room: this.room }));
    }
  }

  subscribe(callback: (msg: NexusMessage) => void) {
    this.listeners.add(callback);
    return () => { this.listeners.delete(callback); };
  }

  async call(name: string, data: any): Promise<any> {
    const callId = Math.random().toString(36).substr(2, 9);
    
    return new Promise((resolve, reject) => {
      const unsub = this.subscribe((msg) => {
        if (msg.type === 'nexus-call-res' && msg.callId === callId) {
          unsub();
          if (msg.error) reject(new Error(msg.error));
          else resolve(msg.result);
        }
      });

      this.send({ type: 'nexus-call', name, data, callId });
    });
  }
}

const nexusManager = new RavenNexusManager();

/**
 * useNexus - Fully reactive, multiplayer hook (V32)
 * 
 * Synchronizes state across all devices in real-time in a specific room.
 */
export function useNexus<T>(key: string, initialValue: T, room: string = 'DEFAULT'): [T, (val: T) => void] {
  const [state, setState] = useState<T>(initialValue);
  const isInternalChange = useRef(false);

  // 1. Initial Load from Local Cache
  useEffect(() => {
    const load = async () => {
      const saved = await RavenStorage.get<T>(`nexus_${room}_${key}`);
      if (saved !== null) {
        setState(saved);
      }
    };
    load();
  }, [key, room]);

  // 2. Listen for Network Deltas
  useEffect(() => {
    return nexusManager.subscribe((msg) => {
      if (msg.type === 'nexus-delta' && msg.key === key && msg.clientId !== 'nexus-self') {
        isInternalChange.current = true;
        setState(msg.value);
        RavenStorage.set(`nexus_${key}`, msg.value);
      } else if (msg.type === 'nexus-req-state-from-peer') {
        // Send our current state to the peer
        nexusManager.send({
          type: 'nexus-delta',
          key,
          value: state,
          targetId: msg.requesterId
        });
      }
    });
  }, [key, state]);

  // 3. Update Function (Local + Network)
  const setNexusState = useCallback((newValue: T) => {
    setState(newValue);
    RavenStorage.set(`nexus_${key}`, newValue);
    
    // Broadcast to the Hub
    nexusManager.send({
      type: 'nexus-delta',
      key,
      value: newValue
    });
  }, [key]);

  return [state, setNexusState];
}

/**
 * useNexusCollection - Dynamic Firebase-style Collection Hook (V33)
 * 
 * Manages an array of synchronized documents with full CRUD support.
 */
export function useNexusCollection<T extends { id?: string }>(collection: string, room: string = 'DEFAULT'): {
  data: T[];
  add: (item: Omit<T, 'id'>) => void;
  remove: (id: string) => void;
  update: (id: string, item: Partial<T>) => void;
  loading: boolean;
} {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Initial Load & Subscription
  useEffect(() => {
    const load = async () => {
      const saved = await RavenStorage.get<T[]>(`nexus_coll_${room}_${collection}`);
      if (saved) setData(saved);
      setLoading(false);
    };
    load();

    return nexusManager.subscribe((msg: any) => {
      if (msg.collection !== collection || msg.room !== room) return;

      if (msg.type === 'nexus-coll-add') {
        setData((prev: T[]) => {
          const next = [...prev, msg.item as T];
          RavenStorage.set(`nexus_coll_${room}_${collection}`, next);
          return next;
        });
      } else if (msg.type === 'nexus-coll-update') {
        setData((prev: T[]) => {
          const next = prev.map((i: T) => i.id === msg.id ? { ...i, ...msg.item } : i);
          RavenStorage.set(`nexus_coll_${room}_${collection}`, next);
          return next;
        });
      } else if (msg.type === 'nexus-coll-remove') {
        setData((prev: T[]) => {
          const next = prev.filter((i: T) => i.id !== msg.id);
          RavenStorage.set(`nexus_coll_${room}_${collection}`, next);
          return next;
        });
      }
    });
  }, [collection, room]);

  // 2. CRUD Methods
  const add = useCallback((item: Omit<T, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newItem = { ...item, id } as T;
    
    // Optimistic Update
    setData((prev: T[]) => [...prev, newItem]);

    nexusManager.send({
      type: 'nexus-coll-add',
      collection,
      item: newItem,
      room
    });
  }, [collection, room]);

  const remove = useCallback((id: string) => {
    setData((prev: T[]) => prev.filter((i: T) => i.id !== id));
    nexusManager.send({
      type: 'nexus-coll-remove',
      collection,
      id,
      room
    });
  }, [collection, room]);

  const update = useCallback((id: string, item: Partial<T>) => {
    setData((prev: T[]) => prev.map((i: T) => i.id === id ? { ...i, ...item } : i));
    nexusManager.send({
      type: 'nexus-coll-update',
      collection,
      id,
      item,
      room
    });
  }, [collection, room]);

  return { data, add, remove, update, loading };
}

/**
 * useNexusFunction - RPC Bridge (V35)
 * 
 * Invokes a server-side Nexus Function and returns the result.
 */
export function useNexusFunction() {
  const call = useCallback(async (name: string, data: any) => {
    return await nexusManager.call(name, data);
  }, []);

  return { call };
}

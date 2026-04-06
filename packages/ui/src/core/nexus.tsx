import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RavenCrypt, NexusDB } from '@raven-os/core';

export interface NexusOptions {
    room: string;
    initialValue: any;
    encrypt?: boolean;
    persist?: boolean;
    nexusKey?: string;
}

/**
 * Raven Nexus Engine (V2.2)
 * Stability Release: Support for Initial State Handshaking and Native Parity.
 */
export function useRavenNexus<T>(options: NexusOptions) {
  const { room, initialValue, encrypt, persist, nexusKey = 'raven-default-key' } = options;
  const [data, setData] = useState<T>(initialValue);
  const [presence, setPresence] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(persist ? true : false);
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const stateRef = useRef<T>(data);

  // Sync stateRef with state
  useEffect(() => { stateRef.current = data; }, [data]);

  // 1. Initialize Crypto Key if needed
  useEffect(() => {
    if (encrypt && typeof window !== 'undefined' && window.crypto) {
      RavenCrypt.deriveKey(nexusKey).then(setCryptoKey);
    }
  }, [encrypt, nexusKey]);

  // 2. Initial Re-hydration (NexusDB)
  useEffect(() => {
    if (persist) {
      NexusDB.get(room, 'state').then((val) => {
        if (val) setData(val);
        setIsLoading(false);
      });
    }
  }, [room, persist]);

  // 3. Network Lifecycle
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ws = (window as any).__RAVEN_WS__;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'nexus-join', room }));
      wsRef.current = ws;
    }

    const handleNexus = async (event: any) => {
      let { detail } = event;
      if (detail.room !== room) return;

      // Decrypt if needed
      if (encrypt && cryptoKey && detail.encrypted && typeof detail.payload === 'string') {
          try {
              detail = await RavenCrypt.decrypt(detail.payload, cryptoKey);
          } catch (e) {
              console.warn('[NEXUS] Decryption FAILED. Check your NexusKey.');
              return;
          }
      }

      if (detail.type === 'nexus-delta') {
        setData(detail.value);
        if (persist) NexusDB.put(room, 'state', detail.value);
      } else if (detail.type === 'nexus-presence') {
        setPresence(prev => ({ ...prev, [detail.clientId]: detail.presence }));
      } 
      // Handshake Logic: Newcomer wants state
      else if (detail.type === 'nexus-req-state') {
        broadcastDelta(stateRef.current);
      }
      // Handshake Logic: Specific peer requested state
      else if (detail.type === 'nexus-req-state-from-peer') {
        const payload = encrypt && cryptoKey 
            ? await RavenCrypt.encrypt({ type: 'nexus-delta', room, value: stateRef.current }, cryptoKey)
            : null;
        
        wsRef.current?.send(JSON.stringify({ 
            type: 'nexus-delta', 
            room, 
            value: !encrypt ? stateRef.current : undefined,
            payload,
            encrypted: encrypt,
            targetId: detail.requesterId 
        }));
      }
    };

    window.addEventListener('raven-nexus-event', handleNexus);
    return () => window.removeEventListener('raven-nexus-event', handleNexus);
  }, [room, encrypt, cryptoKey, persist]);

  /**
   * Broadcast an encrypted/plain delta to the room.
   */
  const broadcastDelta = useCallback(async (value: any) => {
    if (!wsRef.current) return;

    const message = { type: 'nexus-delta', room, value, timestamp: Date.now() };
    
    if (encrypt && cryptoKey) {
        const encryptedPayload = await RavenCrypt.encrypt(message, cryptoKey);
        wsRef.current.send(JSON.stringify({ type: 'nexus-delta', room, payload: encryptedPayload, encrypted: true }));
    } else {
        wsRef.current.send(JSON.stringify(message));
    }

    if (persist) NexusDB.put(room, 'state', value);
  }, [room, encrypt, cryptoKey, persist]);

  return {
    data,
    setData,
    broadcastDelta,
    presence,
    isLoading
  };
}

/**
 * Collaborative Input Primitive (V2.2 — Final Stability)
 */
export function CollaborativeInput({ room, value, onUpdate, nexusKey }: { room: string, value: string, onUpdate: (val: string) => void, nexusKey?: string }) {
    const nexus = useRavenNexus({ room, initialValue: value, encrypt: !!nexusKey, persist: true, nexusKey });
    
    useEffect(() => {
        if (nexus.data !== value && nexus.data !== undefined) {
            onUpdate(nexus.data as string);
        }
    }, [nexus.data]);

    const handleChange = (e: any) => {
        const newVal = e.target.value;
        onUpdate(newVal);
        nexus.broadcastDelta(newVal);
    };

    if (nexus.isLoading) return <div style={{ color: '#64748b' }}>Hydrating Nexus...</div>;

    return (
        <div style={{ position: 'relative' }}>
            <textarea 
                value={value} 
                onChange={handleChange}
                style={{ width: '100%', height: '200px', padding: '20px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: 'white' }}
                placeholder="Start collaborating securely..."
            />
            {nexusKey && (
                <div style={{ position: 'absolute', top: 5, right: 10, fontSize: '10px', color: '#10b981' }}>
                    🔒 E2EE Active
                </div>
            )}
        </div>
    );
}

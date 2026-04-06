import http from 'http';
import fs from 'fs';
import path from 'path';
import { RavenLogger } from './logger.js';
import { WebSocketServer, WebSocket } from 'ws';
import os from 'os';
import qrcode from 'qrcode-terminal';
import { RavenLogicRunner } from './logic.js';
import { SupabaseBridge } from '../bridges/supabase.js';
import { NexusBridge } from '../bridges/bridge.js';

export interface DevServerOptions {
  port: number;
  root: string;
  distDir: string;
  network?: boolean;
  relayUrl?: string; // V34: Nexus Edge Relay
}

export type HMRMessage = 
  | { type: 'reload' }
  | { type: 'update'; file: string; affected: string[] }
  | { type: 'sync'; key: string; value: any; persist?: boolean; platform?: string; clientId?: string }
  | { type: 'nexus-join'; room: string }
  | { type: 'nexus-req-state'; room: string }
  | { type: 'nexus-req-state-from-peer'; room: string; requesterId: string }
  | { type: 'nexus-delta'; room: string; value: any; clientId?: string; payload?: string; encrypted?: boolean; targetId?: string; timestamp?: number }
  | { type: 'nexus-presence'; room: string; presence: any; clientId?: string }
  | { type: 'dev-graph'; metafile: any }
  | { type: 'dev-journal'; history: any[] };

/**
 * Raven-Os Dev Server (V3) - INTEGRATED ECOSYSTEM HUB
 * Upgraded with Multi-device Networking, QR Discovery, and DevTools Core.
 */
export class RavenDevServer {
  private wss?: WebSocketServer;
  private clientCounter = 0;
  private rooms: Map<string, WebSocket[]> = new Map();
  private nexusJournal: Map<string, any[]> = new Map(); // Roll buffer for Time Travel
  private nexusState: Record<string, any> = {}; // Persistent Key-Value Store
  private dbPath: string;
  private relayClient: WebSocket | null = null; // V34: Remote Relay
  private logic: RavenLogicRunner; // V35: Server-side Logic
  private logBuffer: string[] = []; // V37: Log buffer for Studio
  private bridges: NexusBridge[] = []; // V41: Symmetry Bridges

  constructor(private options: DevServerOptions) {
    this.dbPath = path.join(options.root, '.raven', 'nexus_db.json');
    this.ensureDb();
    
    // V34: Setup Nexus Edge Relay
    if (options.relayUrl) {
      this.setupRelay(options.relayUrl);
    }

    this.logic = new RavenLogicRunner(options.root);

    // V41: Initialize Symmetry Bridges (Load from config in V42)
    this.setupBridges();

    // V41: Setup Real-time Logging Hook
    RavenLogger.onLog = (msg, type) => {
      const timestamp = new Date().toLocaleTimeString();
      this.logBuffer.push(`[${timestamp}] [${type.toUpperCase()}] ${msg}`);
      if (this.logBuffer.length > 100) this.logBuffer.shift(); // Circular buffer
    };
  }

  private getPerformanceMetrics() {
    const freeMem = os.freemem();
    const totalMem = os.totalmem();
    const usedMem = totalMem - freeMem;
    const cpuLoad = os.loadavg()[0]; // 1-minute load average
    const uptime = process.uptime();

    return {
      cpu: Math.min(100, (cpuLoad / os.cpus().length) * 100).toFixed(1),
      memory: {
        used: (usedMem / 1024 / 1024).toFixed(0),
        total: (totalMem / 1024 / 1024).toFixed(0),
        percent: ((usedMem / totalMem) * 100).toFixed(1)
      },
      uptime: Math.floor(uptime),
      platform: os.platform(),
      arch: os.arch(),
      rooms: this.rooms.size,
      nexusKeys: Object.keys(this.nexusState).length
    };
  }

  private setupRelay(url: string) {
    try {
      this.relayClient = new WebSocket(url);
      this.relayClient.on('open', () => {
        RavenLogger.success(`[NEXUS EDGE] Relay Active: ${url}`);
        this.relayClient?.send(JSON.stringify({ type: 'sync', state: this.nexusState }));
      });
      this.relayClient.on('error', (e: any) => {
        RavenLogger.error(`[NEXUS EDGE] Relay Connection Failed: ${e.message}`);
      });
    } catch (e: any) {
      RavenLogger.error(`[NEXUS EDGE] Invalid Relay URL: ${url}`);
    }
  }

  private ensureDb() {
    if (!fs.existsSync(path.dirname(this.dbPath))) {
      fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });
    }
    if (fs.existsSync(this.dbPath)) {
      try {
        this.nexusState = JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
      } catch (e) {
        this.nexusState = {};
      }
    }
  }

  private saveDb() {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.nexusState, null, 2));
    } catch (e: any) {
      RavenLogger.error('[NEXUS] DB Save Failed', e.message);
    }
  }

  private setupBridges() {
    // Mocking a Supabase bridge for the showcase
    const supabase = new SupabaseBridge({
      id: 'supabase-main',
      enabled: false, // Initially disabled until configured in Studio
      options: { url: 'https://xyz.supabase.co', key: 'sb_key_123' }
    });
    this.bridges.push(supabase);
  }

  private relayToBridges(type: 'delta' | 'coll-add', room: string, keyOrColl: string, valueOrItem: any) {
    this.bridges.forEach(bridge => {
      if (type === 'delta') bridge.onDelta(room, keyOrColl, valueOrItem);
      else if (type === 'coll-add') bridge.onCollectionAdd(room, keyOrColl, valueOrItem);
    });
  }

  async start() {
    const { port, distDir, network } = this.options;
    const hostLine = network ? '0.0.0.0' : 'localhost';

    const server = http.createServer((req, res) => {
      const url = req.url || '/';
      
      // Raven DevTools API: Module Graph
      if (url === '/dev/graph') {
          const metaPath = path.join(distDir, 'metafile.json');
          if (fs.existsSync(metaPath)) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              return res.end(fs.readFileSync(metaPath));
          }
      }

      // V37: Nexus Studio API (Highest Priority)
      if (url === '/api/studio/state') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ 
            state: this.nexusState, 
            functions: this.logic.getRegistry(), 
            logs: this.logBuffer,
            metrics: this.getPerformanceMetrics()
          }));
      }

      // V41: Specific Metrics Endpoint
      if (url === '/api/studio/metrics') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(this.getPerformanceMetrics()));
      }

      // V37: Nexus Studio Visual Dashboard
      if (url === '/studio' || url === '/studio/') {
          const studioPath = path.join(this.options.root, 'packages', 'cli', 'src', 'core', 'studio.html');
          
          if (fs.existsSync(studioPath)) {
              res.writeHead(200, { 'Content-Type': 'text/html' });
              return res.end(fs.readFileSync(studioPath));
          } else {
              const fallbackPath = path.join(process.cwd(), 'packages', 'cli', 'src', 'core', 'studio.html');
              if (fs.existsSync(fallbackPath)) {
                  res.writeHead(200, { 'Content-Type': 'text/html' });
                  return res.end(fs.readFileSync(fallbackPath));
              }
              
              res.writeHead(200, { 'Content-Type': 'text/html' });
              return res.end('<h1>Nexus Studio</h1><p>Path not found: ' + studioPath + '</p>');
          }
      }

      if (url === '/index.js' || url === '/bundle.js') {
        const bundlePath = path.join(distDir, 'index.js');
        if (fs.existsSync(bundlePath)) {
          res.writeHead(200, { 'Content-Type': 'application/javascript' });
          return res.end(fs.readFileSync(bundlePath));
        }
      }

      if (url === '/' || !url.includes('.')) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(this.getHtmlTemplate());
      }

      res.writeHead(404);
      res.end('Not Found');
    });

    this.wss = new WebSocketServer({ server });
    
    this.wss.on('connection', (ws: any) => {
      const clientId = `user_${++this.clientCounter}`;
      ws.clientId = clientId;
      ws.rooms = new Set<string>();
      
      ws.on('message', (data: any) => {
        try {
          const message = JSON.parse(data.toString());
          
          if (message.type === 'nexus-join') {
            this.joinRoom(message.room, ws);
          } else if (message.type === 'nexus-req-state') {
            this.handleStateRequest(message.room, ws);
          } else if (message.type === 'nexus-delta') {
            // 1. Journaling for Time Travel
            this.journalDelta(message.room, { ...message, clientId });
            
            // 2. GLOBAL PERSISTENCE (V32)
            if (message.key && message.value !== undefined) {
              const roomState = this.nexusState[message.room] || {};
              roomState[message.key] = message.value;
              this.nexusState[message.room] = roomState;
              this.saveDb();
              
              // V35: Delta Trigger
              this.runTriggers('onDelta', message.key, message.value, message.room, ws);
              
              // V41: Symmetry Bridge Relay
              this.relayToBridges('delta', message.room, message.key, message.value);
            }

            this.broadcastToRoom(message.room, { ...message, clientId }, ws);
          } else if (message.type === 'nexus-coll-add') {
             // V33: Add to Collection
             const roomState = this.nexusState[message.room] || {};
             const collection = roomState[message.collection] || [];
             collection.push(message.item);
             roomState[message.collection] = collection;
             this.nexusState[message.room] = roomState;
             this.saveDb();
             this.broadcastToRoom(message.room, message, ws);

             // V35: Collection Trigger
             this.runTriggers('onCollection', message.collection, message.item, message.room, ws);

             // V41: Symmetry Bridge Relay
             this.relayToBridges('coll-add', message.room, message.collection, message.item);
          } else if (message.type === 'nexus-coll-update') {
             // V33: Update in Collection
             const roomState = this.nexusState[message.room] || {};
             const collection = roomState[message.collection] || [];
             const idx = collection.findIndex((i: any) => i.id === message.id);
             if (idx !== -1) {
                collection[idx] = { ...collection[idx], ...message.item };
                roomState[message.collection] = collection;
                this.nexusState[message.room] = roomState;
                this.saveDb();
                this.broadcastToRoom(message.room, message, ws);
             }
          } else if (message.type === 'nexus-coll-remove') {
             // V33: Remove from Collection
             const roomState = this.nexusState[message.room] || {};
             const collection = roomState[message.collection] || [];
             roomState[message.collection] = collection.filter((i: any) => i.id !== message.id);
             this.nexusState[message.room] = roomState;
             this.saveDb();
             this.broadcastToRoom(message.room, message, ws);
          } else if (message.type === 'nexus-presence') {
            this.broadcastToRoom(message.room, { ...message, clientId }, ws);
          } else if (message.type === 'nexus-call') {
            // V35: Direct Logic Call
            this.handleLogicCall(message, ws);
          }

          // V34: Mirror all messages to Nexus Edge Relay
          if (this.relayClient && this.relayClient.readyState === WebSocket.OPEN) {
             this.relayClient.send(JSON.stringify(message));
          }
        } catch (e: any) { }
      });
      
      ws.on('close', () => {
        this.leaveAllRooms(ws);
      });
    });

    server.listen(port, hostLine, () => {
      // Find local IP manually using os
      const interfaces = os.networkInterfaces();
      let localIP = 'localhost';
      for (const name of Object.keys(interfaces)) {
          for (const iface of interfaces[name] || []) {
              if (iface.family === 'IPv4' && !iface.internal) {
                  localIP = iface.address;
                  break;
              }
          }
      }
      
      
      RavenLogger.success(`[NEXUS V3] Stability Engine: http://localhost:${port}`);
      RavenLogger.info(`[STUDIO] Visual Dashboard: http://localhost:${port}/studio`);
      
      if (network) {
          RavenLogger.info(`[NETWORK] Discovery active at: http://${localIP}:${port}`);
          RavenLogger.info(`[NETWORK] Scan QR code to connect mobile device:`);
          qrcode.generate(`http://${localIP}:${port}`, { small: true });
      }
    });
  }

  private journalDelta(room: string, delta: any) {
      if (!this.nexusJournal.has(room)) this.nexusJournal.set(room, []);
      const history = this.nexusJournal.get(room)!;
      history.push(delta);
      if (history.length > 100) history.shift(); // Keep last 100 deltas
  }

  private joinRoom(room: string, ws: any) {
    if (!this.rooms.has(room)) this.rooms.set(room, []);
    this.rooms.get(room)!.push(ws);
    ws.rooms.add(room);
    
    // Initial Handshake: Request state from the room (if not alone)
    const activeClients = this.rooms.get(room)!;
    if (activeClients.length > 1) {
        ws.send(JSON.stringify({ type: 'nexus-req-state', room }));
    } else if (this.nexusState[room]) {
        // V32: Fallback to Persistent Hub if no peers are online
        Object.entries(this.nexusState[room]).forEach(([key, value]) => {
          ws.send(JSON.stringify({ 
            type: 'nexus-delta', 
            room, 
            key, 
            value,
            clientId: 'nexus-hub'
          }));
        });
    }
  }

  private handleStateRequest(room: string, requester: any) {
    const clients = this.rooms.get(room);
    if (!clients || clients.length <= 1) return;

    // Direct existing senior client to send their state to the requester
    const senior = clients.find(c => (c as any).clientId !== requester.clientId);
    if (senior && senior.readyState === WebSocket.OPEN) {
        senior.send(JSON.stringify({ type: 'nexus-req-state-from-peer', room, requesterId: requester.clientId }));
    }
  }

  // --- V35: Nexus Logic Runner Helpers ---

  private async handleLogicCall(message: any, ws: WebSocket) {
    const ctx = this.getNexusContext(message.room, (ws as any).clientId);
    try {
      const result = await this.logic.trigger(message.name, 'onCall', message.data, ctx);
      ws.send(JSON.stringify({ 
        type: 'nexus-call-res', 
        callId: message.callId, 
        result 
      }));
    } catch (e: any) {
      ws.send(JSON.stringify({ 
        type: 'nexus-call-res', 
        callId: message.callId, 
        error: e.message 
      }));
    }
  }

  private runTriggers(type: string, name: string, data: any, room: string, originWs: WebSocket) {
    const ctx = this.getNexusContext(room, (originWs as any).clientId);
    this.logic.trigger(name, type, data, ctx);
  }

  private getNexusContext(room: string, clientId: string) {
    return {
      state: this.nexusState[room] || {},
      room,
      clientId,
      broadcast: (msg: any) => this.broadcastToRoom(room, msg),
      update: (key: string, value: any) => {
        const rState = this.nexusState[room] || {};
        rState[key] = value;
        this.nexusState[room] = rState;
        this.saveDb();
        this.broadcastToRoom(room, { type: 'nexus-delta', room, key, value, clientId: 'nexus-logic' });
      }
    };
  }

  private leaveAllRooms(ws: any) {
    ws.rooms.forEach((room: string) => {
      const clients = this.rooms.get(room);
      if (clients) {
          this.rooms.set(room, clients.filter(c => c !== ws));
      }
    });
  }

  private broadcastToRoom(room: string, message: any, sender?: WebSocket) {
    const clients = this.rooms.get(room);
    if (!clients) return;

    const payload = JSON.stringify(message);
    
    // Targeted Response (Handshake response)
    if (message.targetId) {
        const target = clients.find(c => (c as any).clientId === message.targetId);
        if (target && target.readyState === WebSocket.OPEN) {
            target.send(payload);
        }
        return;
    }

    // Normal Broadcast
    clients.forEach((client) => {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  private broadcast(message: HMRMessage, sender?: WebSocket) {
    if (this.wss) {
      const payload = JSON.stringify(message);
      this.wss.clients.forEach((client) => {
        if (client !== sender && client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      });
    }
  }

  sendUpdate(message: HMRMessage) {
    this.broadcast(message);
  }

  private getHtmlTemplate() {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Raven-Os Nexus (Collaborative)</title>
    <style>
        body { background: #0f172a; color: #f8fafc; font-family: sans-serif; height: 100vh; margin: 0; overflow: hidden; }
        #root { width: 100%; height: 100%; }
        #raven-status { position: fixed; bottom: 10px; right: 10px; background: rgba(0,0,0,0.8); padding: 5px 10px; border-radius: 5px; font-size: 12px; font-weight: bold; }
        .nexus-cursor { position: absolute; pointer-events: none; padding: 2px 5px; background: #6366f1; color: white; font-size: 10px; border-radius: 3px; z-index: 9999; }
    </style>
</head>
<body>
    <div id="root"></div>
    <div id="raven-status">Nexus Hub: Active</div>
    
    <script type="module" src="/index.js"></script>
    
    <script>
        const ws = new WebSocket('ws://' + location.host);
        window.__RAVEN_WS__ = ws; 

        ws.onmessage = (msg) => {
            const data = JSON.parse(msg.data);
            
            if (data.type === 'reload') location.reload();
            if (data.type === 'sync' || data.type === 'nexus-delta' || data.type === 'nexus-presence' || data.type === 'nexus-req-state' || data.type === 'nexus-req-state-from-peer') {
                window.dispatchEvent(new CustomEvent('raven-nexus-event', { detail: data }));
            }
        };
    </script>
</body>
</html>
    `;
  }
}

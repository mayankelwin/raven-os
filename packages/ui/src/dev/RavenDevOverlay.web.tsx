/// <reference types="vite/client" />
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRavenStore, useRavenTheme, RavenStorage } from '@raven-os/core';

// Only show in development mode
const isDev = import.meta.env.DEV;
// Don't show in the mobile preview iframe
const isPreviewFrame = typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('ravenpreview');

/**
 * RavenDevOverlay — Web Developer Tools (Vite only)
 */
export const RavenDevOverlay = () => {
  const { devDashboardOpen, devErrorModalOpen, runtimeErrors } = useRavenStore();
  if (!isDev || isPreviewFrame) return null;

  return (
    <>
      <DevFab />
      {devDashboardOpen && <RavenDevDashboard />}
      {devErrorModalOpen && runtimeErrors.length > 0 && <RavenErrorModal />}
    </>
  );
};

const DevFab = () => {
  const {
    devSplitScreen,
    devDeviceType,
    devMenuOpen,
    devDashboardOpen,
    toggleDevSplitScreen,
    toggleDevDevice,
    toggleDevMenu,
    toggleDevDashboard,
    demoCounter,
    performanceScore,
    runtimeErrors,
    toggleDevErrorModal,
  } = useRavenStore();
  const { colors, isDark, toggleTheme } = useRavenTheme();

  const menuRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  // --- Draggable Logic ---
  const [pos, setPos] = useState({ x: window.innerWidth - 72, y: window.innerHeight - 72 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const loadPos = async () => {
      const saved = await RavenStorage.get<{ x: number, y: number }>('raven_devtools_pos');
      if (saved) setPos(saved);
    };
    loadPos();
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (devMenuOpen) return;
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = Math.max(10, Math.min(window.innerWidth - 60, e.clientX - dragOffset.current.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 60, e.clientY - dragOffset.current.y));
      setPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        const snapX = pos.x > window.innerWidth / 2 ? window.innerWidth - 64 : 16;
        const newPos = { x: snapX, y: pos.y };
        setPos(newPos);
        RavenStorage.set('raven_devtools_pos', newPos);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, pos]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        fabRef.current && !fabRef.current.contains(e.target as Node)
      ) {
        if (devMenuOpen) toggleDevMenu();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [devMenuOpen, toggleDevMenu]);

  const MENU_WIDTH = 280;
  const PAD = 16;
  const FAB_SIZE = 48;

  let menuLeft = pos.x > window.innerWidth / 2 ? pos.x - MENU_WIDTH + FAB_SIZE : pos.x;
  menuLeft = Math.max(PAD, Math.min(window.innerWidth - MENU_WIDTH - PAD, menuLeft));

  const menuStyle: React.CSSProperties = {
    ...menu.panel,
    position: 'fixed',
    left: menuLeft,
    zIndex: 9998,
    maxHeight: `calc(100vh - ${PAD * 2}px)`,
    overflowY: 'auto',
  };

  if (pos.y > window.innerHeight / 2) {
    menuStyle.bottom = window.innerHeight - pos.y + 12;
  } else {
    menuStyle.top = pos.y + FAB_SIZE + 12;
  }

  return (
    <>
      <style>{`
        @keyframes ravenPulseError {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
      {devMenuOpen && (
        <div ref={menuRef} style={menuStyle}>
          <div style={menu.header}>
            <div style={menu.headerDot} />
            <span style={menu.headerTitle}>Raven DevTools</span>
            <span style={menu.version}>v3.0.0</span>
          </div>

          <div style={menu.divider} />
          <ExpoSection />
          <div style={menu.divider} />

          <MenuButton label="Split Screen" description={devSplitScreen ? 'Web + Mobile' : 'Single'} icon="⧉" active={devSplitScreen} onClick={toggleDevSplitScreen} />
          <MenuButton label="Dev Dashboard" description="Graph & Time Travel" icon="🧠" active={devDashboardOpen} onClick={toggleDevDashboard} />
          <MenuButton label={`Theme: ${isDark ? 'Dark' : 'Light'}`} description="Toggle theme" icon={isDark ? '☀️' : '🌙'} active={false} onClick={toggleTheme} />

          <div style={menu.divider} />

          <div style={menu.stateSection}>
            <span style={menu.stateLabel}>LIVE STATE</span>
            <div style={menu.stateGrid}>
              <StateItem label="Counter" value={String(demoCounter)} />
              <StateItem label="Perf" value={`${performanceScore}%`} />
            </div>
          </div>
        </div>
      )}

      <button
        ref={fabRef}
        onMouseDown={handleMouseDown}
        onClick={() => { 
          if (!isDragging) {
            if (runtimeErrors.length > 0) {
              toggleDevErrorModal(true);
            } else {
              toggleDevMenu(); 
            }
          }
        }}
        style={{
          ...fab.btn,
          left: pos.x,
          top: pos.y,
          backgroundColor: runtimeErrors.length > 0 ? '#ef4444' : (devMenuOpen ? '#8b5cf6' : '#1a1a2e'),
          boxShadow: runtimeErrors.length > 0 
            ? '0 0 20px rgba(239,68,68,0.4)' 
            : (devMenuOpen ? '0 0 0 2px #8b5cf6, 4px 12px 32px rgba(139,92,246,0.3)' : '0 4px 20px rgba(0,0,0,0.5)'),
          transform: devMenuOpen ? 'scale(1.05) rotate(45deg)' : 'scale(1)',
          cursor: isDragging ? 'grabbing' : 'grab',
          animation: runtimeErrors.length > 0 ? 'ravenPulseError 2s infinite' : 'none',
        }}
      >
        <span style={{ fontSize: 18, transform: devMenuOpen ? 'rotate(-45deg)' : 'none' }}>
            {runtimeErrors.length > 0 ? '⚠️' : (devMenuOpen ? '✕' : '⬛')}
        </span>
      </button>
    </>
  );
};

// ── Raven Error Modal (Next.js Style Diagnostic) ───────────────────────────────

export const RavenErrorModal = () => {
  const { runtimeErrors, toggleDevErrorModal, clearErrors, theme } = useRavenStore();
  const error = runtimeErrors[0]; // Show the most recent one

  if (!error) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(16px)',
      zIndex: 20000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      color: '#fff',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '800px',
        backgroundColor: '#1a1a1a',
        borderRadius: '24px',
        border: '1px solid #333',
        boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ padding: '24px 32px', backgroundColor: '#ef4444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>⚠️</span>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>UNHANDLED RUNTIME ERROR</h2>
           </div>
           <button onClick={() => toggleDevErrorModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ padding: '32px', overflowY: 'auto', maxHeight: '70vh' }}>
            <div style={{ backgroundColor: '#000', padding: '20px', borderRadius: '12px', border: '1px solid #ef444455', marginBottom: '24px' }}>
                <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                    {error.type.toUpperCase()} ERROR:
                </span>
                <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', lineHeight: '1.4', color: '#fca5a5' }}>
                    {error.message}
                </p>
            </div>

            {error.file && (
                <div style={{ marginBottom: '24px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>SOURCE FILE:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <code style={{ fontSize: '14px', color: '#c4b5fd', background: '#2e1065', padding: '6px 12px', borderRadius: '6px' }}>
                            {error.file.split('/').pop()} : {error.line || '??'}
                        </code>
                    </div>
                </div>
            )}

            {error.stack && (
                <div>
                     <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>STACK TRACE:</span>
                     <pre style={{ 
                        backgroundColor: '#000', 
                        padding: '20px', 
                        borderRadius: '12px', 
                        fontSize: '12px', 
                        lineHeight: '1.8', 
                        color: '#64748b',
                        overflowX: 'auto',
                        whiteSpace: 'pre-wrap',
                        border: '1px solid #333'
                     }}>
                        {error.stack.split('\n').slice(0, 8).join('\n')}
                     </pre>
                </div>
            )}

            <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => location.reload()} 
                  style={{ padding: '12px 24px', borderRadius: '12px', backgroundColor: '#fff', color: '#000', fontWeight: '700', border: 'none', cursor: 'pointer' }}
                >
                    RETRY / RELOAD
                </button>
                <button 
                  onClick={clearErrors} 
                  style={{ padding: '12px 24px', borderRadius: '12px', backgroundColor: 'transparent', color: '#64748b', fontWeight: '700', border: '1px solid #333', cursor: 'pointer' }}
                >
                    CLEAR ALL
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

// ── Raven Dev Dashboard (V14) ──────────────────────────────────────────────────

export const RavenDevDashboard = () => {
  const { toggleDevDashboard, theme } = useRavenStore();
  const [activeTab, setActiveTab] = useState<'graph' | 'nexus' | 'history'>('graph');

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: theme === 'dark' ? 'rgba(15,15,26,0.95)' : 'rgba(248,250,252,0.98)',
      backdropFilter: 'blur(32px)',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      animation: 'ravenFadeIn 0.3s ease-out',
      color: theme === 'dark' ? '#f8fafc' : '#1e293b',
    }}>
      <header style={{ padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#8b5cf6', boxShadow: '0 0 15px #8b5cf6' }} />
          <h1 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '0.5px', margin: 0 }}>RAVEN DASHBOARD <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '400', marginLeft: '10px' }}>v14.0.0 (Nexus V3)</span></h1>
        </div>
        <button onClick={toggleDevDashboard} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '24px', opacity: 0.6 }}>✕</button>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <aside style={{ width: '250px', borderRight: '1px solid rgba(255,255,255,0.08)', padding: '20px 10px' }}>
             <TabButton active={activeTab === 'graph'} onClick={() => setActiveTab('graph')} label="Module Graph" icon="🕸️" />
             <TabButton active={activeTab === 'nexus'} onClick={() => setActiveTab('nexus')} label="Nexus Journal" icon="📑" />
             <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} label="Time Travel" icon="⏳" />
        </aside>
        <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
            {activeTab === 'graph' && <GraphTab />}
            {activeTab === 'nexus' && <NexusTab />}
            {activeTab === 'history' && <TimeTravelTab />}
        </main>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, label, icon }: any) => (
    <button onClick={onClick} style={{
        width: '100%', padding: '12px 20px', textAlign: 'left',
        background: active ? 'rgba(139,92,246,0.1)' : 'transparent',
        border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
        color: active ? '#8b5cf6' : 'inherit', fontWeight: active ? '700' : '400', marginBottom: '4px',
    }}>
        <span>{icon}</span> {label}
    </button>
);

const GraphTab = () => {
    const [graph, setGraph] = useState<any>(null);
    useEffect(() => { fetch('/dev/graph').then(res => res.json()).then(setGraph).catch(e => console.error(e)); }, []);
    if (!graph) return <div>Loading Project Graph...</div>;
    return (
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '30px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ marginTop: 0 }}>Dependency Tree (Metafile)</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.keys(graph.inputs).map(file => (
                    <div key={file} style={{ fontSize: '13px', color: '#64748b' }}>
                        📦 <span style={{ color: '#f8fafc' }}>{file}</span> → {graph.inputs[file].imports.length} imports
                    </div>
                ))}
            </div>
        </div>
    );
};

const NexusTab = () => {
    const [journal, setJournal] = useState<any[]>([]);
    useEffect(() => {
        const handle = (e: any) => { if (e.detail.type === 'nexus-delta') setJournal(prev => [e.detail, ...prev].slice(0, 50)); };
        window.addEventListener('raven-nexus-event', handle);
        return () => window.removeEventListener('raven-nexus-event', handle);
    }, []);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h2>Live Nexus Journal</h2>
            {journal.map((j, i) => (
                <div key={i} style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '12px' }}>
                    <div style={{ color: '#8b5cf6', fontWeight: 'bold' }}>{j.clientId.toUpperCase()} | Room: {j.room}</div>
                    <code style={{ display: 'block', marginTop: '5px' }}>{JSON.stringify(j.value)}</code>
                </div>
            ))}
        </div>
    );
};

const TimeTravelTab = () => {
    const [scrubIndex, setScrubIndex] = useState(100);
    return (
        <div>
            <h2>Time Travel Engine</h2>
            <p style={{ color: '#64748b' }}>Scrub through state deltas to visualize past interactions across the network.</p>
            <div style={{ marginTop: '40px', padding: '40px', background: 'rgba(139,92,246,0.05)', borderRadius: '24px', textAlign: 'center' }}>
                <input type="range" min="0" max="100" value={scrubIndex} onChange={(e) => setScrubIndex(Number(e.target.value))} style={{ width: '100%', accentColor: '#8b5cf6' }} />
                <div style={{ marginTop: '20px', fontSize: '14px' }}>Position: <span style={{ color: '#8b5cf6', fontWeight: '800' }}>T-{100 - scrubIndex}%</span></div>
            </div>
        </div>
  );
};

// ── Shared Utilities ──────────────────────────────────────────────────────────

const ExpoSection = () => {
  const [ip, setIp] = useState(window.location.hostname === 'localhost' ? '192.168.0.1' : window.location.hostname);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`exp://${ip}:8081`)}&bgcolor=0f0f1a&color=8b5cf6`;
  return (
    <div style={expo.container}>
      <div style={expo.header}><span style={expo.title}>EXPO CONNECT</span></div>
      <div style={expo.qrWrapper}><img src={qrUrl} alt="Expo QR" style={expo.qrImage} /></div>
      <div style={expo.infoWrapper}><span style={expo.urlLabel}>METRO URL</span><div style={expo.urlBox}><code style={expo.urlText}>exp://{ip}:8081</code></div></div>
    </div>
  );
};

const MenuButton = ({ label, description, icon, active, onClick }: any) => {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ ...menuBtn.base, backgroundColor: hover ? 'rgba(139,92,246,0.12)' : 'transparent', borderColor: active ? 'rgba(139,92,246,0.5)' : 'transparent', borderWidth: 1, borderStyle: 'solid' }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <div style={menuBtn.textGroup}>
        <span style={{ color: active ? '#c4b5fd' : '#f1f5f9', fontSize: 13, fontWeight: '600' }}>{label}</span>
        <span style={{ color: '#64748b', fontSize: 11 }}>{description}</span>
      </div>
    </button>
  );
};

const StateItem = ({ label, value }: { label: string; value: string }) => (
  <div style={stateItem.root}><span style={stateItem.label}>{label}</span><span style={stateItem.value}>{value}</span></div>
);

// ── Styles ────────────────────────────────────────────────────────────────────

const fab: Record<string, React.CSSProperties> = {
  btn: { position: 'fixed', width: 48, height: 48, borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)' },
};

const expo: Record<string, React.CSSProperties> = {
  container: { padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#8b5cf6', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  qrWrapper: { backgroundColor: 'white', padding: 8, borderRadius: 12, width: 150, height: 150, alignSelf: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  qrImage: { width: '100%', height: '100%' },
  infoWrapper: { display: 'flex', flexDirection: 'column', gap: 4 },
  urlLabel: { color: '#475569', fontSize: 9, fontWeight: '700' },
  urlBox: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 6, padding: '6px 8px', border: '1px solid rgba(255,255,255,0.05)' },
  urlText: { color: '#c4b5fd', fontSize: 10, fontFamily: 'monospace' },
};

const menu: Record<string, React.CSSProperties> = {
  panel: { width: 280, backgroundColor: '#0f0f1a', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 60px rgba(0,0,0,0.7)', backdropFilter: 'blur(24px)', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px' },
  headerDot: { width: 8, height: 8, borderRadius: '50%', backgroundColor: '#8b5cf6', boxShadow: '0 0 8px rgba(139,92,246,0.8)' },
  headerTitle: { color: '#f1f5f9', fontSize: 13, fontWeight: '700', flex: 1 },
  version: { color: '#475569', fontSize: 10, fontFamily: 'monospace' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', margin: '0 8px' },
  stateSection: { padding: '12px 16px' },
  stateLabel: { color: '#475569', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, display: 'block', marginBottom: 8 },
  stateGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 },
};

const menuBtn: Record<string, React.CSSProperties> = {
  base: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', width: 'calc(100% - 8px)', textAlign: 'left', background: 'none', cursor: 'pointer', borderRadius: 8, margin: '2px 4px' },
  textGroup: { display: 'flex', flexDirection: 'column', flex: 1 },
};

const stateItem: Record<string, React.CSSProperties> = {
  root: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 2 },
  label: { color: '#475569', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  value: { color: '#c4b5fd', fontSize: 12, fontWeight: '700', fontFamily: 'monospace' },
};

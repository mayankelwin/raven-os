/// <reference types="vite/client" />
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRavenStore, useRavenTheme } from '@raven-os/core';

// Only show in development mode
const isDev = import.meta.env.DEV;
// Don't show in the mobile preview iframe
const isPreviewFrame = typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('ravenpreview');

/**
 * RavenDevOverlay — Web Developer Tools (Vite only)
 *
 * Provides:
 *  • Floating action button (FAB) — visible only in dev mode
 *  • Menu with dev options: split screen, device toggle, theme toggle
 *  • Real-time device info in the menu
 *
 * Invisible in production builds (`import.meta.env.PROD`).
 * Invisible in the mobile preview iframe.
 */
export const RavenDevOverlay = () => {
  if (!isDev || isPreviewFrame) return null;

  return <DevFab />;
};

const DevFab = () => {
  const {
    devSplitScreen,
    devDeviceType,
    devMenuOpen,
    toggleDevSplitScreen,
    toggleDevDevice,
    toggleDevMenu,
    demoCounter,
    performanceScore,
  } = useRavenStore();
  const { colors, isDark, toggleTheme } = useRavenTheme();

  const menuRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
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
  }, [devMenuOpen]);

  return (
    <>
      {/* Menu popup */}
      {devMenuOpen && (
        <div ref={menuRef} style={menu.panel}>
          {/* Header */}
          <div style={menu.header}>
            <div style={menu.headerDot} />
            <span style={menu.headerTitle}>Raven DevTools</span>
            <span style={menu.version}>v1.0.0</span>
          </div>

          <div style={menu.divider} />

          {/* Split Screen */}
          <MenuButton
            label="Split Screen"
            description={devSplitScreen ? 'Web + Mobile preview' : 'Single view'}
            icon="⧉"
            active={devSplitScreen}
            onClick={toggleDevSplitScreen}
          />

          {/* Device Type */}
          <MenuButton
            label={`Device: ${devDeviceType === 'android' ? 'Android' : 'iPhone'}`}
            description={devDeviceType === 'android' ? 'Switch to iPhone frame' : 'Switch to Android frame'}
            icon={devDeviceType === 'android' ? '🤖' : '📱'}
            active={false}
            onClick={toggleDevDevice}
          />

          {/* Theme */}
          <MenuButton
            label={`Theme: ${isDark ? 'Dark' : 'Light'}`}
            description="Toggle framework theme"
            icon={isDark ? '☀️' : '🌙'}
            active={false}
            onClick={toggleTheme}
          />

          <div style={menu.divider} />

          {/* Live State */}
          <div style={menu.stateSection}>
            <span style={menu.stateLabel}>LIVE STATE</span>
            <div style={menu.stateGrid}>
              <StateItem label="Counter" value={String(demoCounter)} />
              <StateItem label="Perf" value={`${performanceScore}%`} />
              <StateItem label="Theme" value={isDark ? 'dark' : 'light'} />
              <StateItem label="Device" value={devDeviceType} />
            </div>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        ref={fabRef}
        onClick={toggleDevMenu}
        style={{
          ...fab.btn,
          backgroundColor: devMenuOpen ? '#8b5cf6' : '#1a1a2e',
          boxShadow: devMenuOpen
            ? '0 0 0 2px #8b5cf6, 0 8px 32px rgba(139,92,246,0.4)'
            : '0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
          transform: devMenuOpen ? 'scale(1.05) rotate(45deg)' : 'scale(1)',
        }}
        title="Raven DevTools"
      >
        <span style={{ fontSize: 18, lineHeight: 1, display: 'block', transform: devMenuOpen ? 'rotate(-45deg)' : 'none' }}>
          {devMenuOpen ? '✕' : '⬛'}
        </span>
      </button>
    </>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

interface MenuButtonProps {
  label: string;
  description: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}

const MenuButton = ({ label, description, icon, active, onClick }: MenuButtonProps) => {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...menuBtn.base,
        backgroundColor: hover ? 'rgba(139,92,246,0.12)' : 'transparent',
        borderColor: active ? 'rgba(139,92,246,0.5)' : 'transparent',
        borderWidth: 1,
        borderStyle: 'solid',
      }}
    >
      <span style={{ fontSize: 16, width: 24, textAlign: 'center' }}>{icon}</span>
      <div style={menuBtn.textGroup}>
        <span style={{ color: active ? '#c4b5fd' : '#f1f5f9', fontSize: 13, fontWeight: '600' }}>{label}</span>
        <span style={{ color: '#64748b', fontSize: 11, marginTop: 1 }}>{description}</span>
      </div>
      {active && (
        <div style={menuBtn.activeDot} />
      )}
    </button>
  );
};

const StateItem = ({ label, value }: { label: string; value: string }) => (
  <div style={stateItem.root}>
    <span style={stateItem.label}>{label}</span>
    <span style={stateItem.value}>{value}</span>
  </div>
);

// ── Styles ────────────────────────────────────────────────────────────────────

const fab: Record<string, React.CSSProperties> = {
  btn: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
};

const menu: Record<string, React.CSSProperties> = {
  panel: {
    position: 'fixed',
    bottom: 84,
    right: 24,
    width: 280,
    backgroundColor: '#0f0f1a',
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,246,0.15)',
    backdropFilter: 'blur(24px)',
    zIndex: 9998,
    overflow: 'hidden',
    animation: 'ravenDevMenuIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '14px 16px',
  },
  headerDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: '#8b5cf6',
    boxShadow: '0 0 8px rgba(139,92,246,0.8)',
  },
  headerTitle: {
    color: '#f1f5f9',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    flex: 1,
  },
  version: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    margin: '0 8px',
  },
  stateSection: {
    padding: '12px 16px',
  },
  stateLabel: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    display: 'block',
    marginBottom: 8,
  },
  stateGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 6,
  },
};

const menuBtn: Record<string, React.CSSProperties> = {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    width: 'calc(100% - 8px)',
    textAlign: 'left',
    background: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s',
    borderRadius: 8,
    margin: '2px 4px',
  } as React.CSSProperties,
  textGroup: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  } as React.CSSProperties,
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: '#8b5cf6',
    flexShrink: 0,
  },
};

const stateItem: Record<string, React.CSSProperties> = {
  root: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 8,
    padding: '6px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  label: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  value: {
    color: '#c4b5fd',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
};

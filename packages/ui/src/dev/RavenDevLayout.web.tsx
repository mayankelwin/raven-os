import React, { useEffect, useRef, useState } from 'react';
import { useRavenStore } from '@raven-os/core';

interface Props { children: React.ReactNode; }

// Detect if we're running inside the mobile preview iframe
const isPreviewFrame = typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('ravenpreview');

/**
 * RavenDevLayout — Web (Vite only)
 *
 * When split-screen mode is ON:
 *   Left  → The actual app (current page, full web experience)
 *   Right → iframe pointing to the same URL at mobile viewport dimensions
 *            The app inside auto-detects the narrow viewport and renders
 *            as if on a real mobile device — zero extra code needed.
 *
 * When in preview frame (the iframe itself): renders as normal, no overlay.
 */
export const RavenDevLayout = ({ children }: Props) => {
  const { devSplitScreen, devDeviceType } = useRavenStore();

  // If we ARE the mobile preview iframe, just render normally
  if (isPreviewFrame) {
    return <>{children}</>;
  }

  if (!devSplitScreen) {
    return <>{children}</>;
  }

  const isMobile = devDeviceType === 'iphone';
  const deviceW = isMobile ? 390 : 412;
  const deviceH = isMobile ? 844 : 915;

  // Panel dimensions (must match the mobilePane CSS below)
  const panelW = 460;
  const panelPad = 24;
  const availableW = panelW - panelPad * 2;
  const availableH = window.innerHeight - 40;

  // Scale to fit both constraints — whichever is tighter wins
  const scaleByH = availableH / deviceH;
  const scaleByW = availableW / deviceW;
  const scale = Math.min(1, scaleByH, scaleByW);

  const scaledW = deviceW * scale;
  const scaledH = deviceH * scale;

  const previewUrl = `${window.location.href}${window.location.search ? '&' : '?'}ravenpreview=1`;

  return (
    <div style={styles.splitRoot}>
      {/* Left — Web view */}
      <div style={styles.webPane}>
        {children}
      </div>

      {/* Right — Mobile preview */}
      <div style={styles.mobilePane}>
        <DeviceFrame
          type={devDeviceType}
          deviceW={deviceW}
          deviceH={deviceH}
          scale={scale}
          scaledW={scaledW}
          scaledH={scaledH}
          previewUrl={previewUrl}
        />
      </div>
    </div>
  );
};

// ── Device Frame ──────────────────────────────────────────────────────────────

interface FrameProps {
  type: 'android' | 'iphone';
  deviceW: number;
  deviceH: number;
  scale: number;
  scaledW: number;
  scaledH: number;
  previewUrl: string;
}

const DeviceFrame = ({ type, deviceW, deviceH, scale, scaledW, scaledH, previewUrl }: FrameProps) => {
  const isAndroid = type === 'android';
  // Android nav bar height (in device px)
  const navBarH = isAndroid ? 56 : 0;
  const statusBarH = 32;
  const screenH = deviceH - navBarH - statusBarH;
  const radius = isAndroid ? 40 : 50;

  return (
    <div style={{
      width: scaledW,
      height: scaledH,
      position: 'relative',
      background: '#050505',
      borderRadius: radius * scale,
      boxShadow: [
        '0 40px 100px rgba(0,0,0,0.8)',
        '0 0 0 1px rgba(255,255,255,0.07)',
        '0 0 60px rgba(139,92,246,0.08)',
      ].join(', '),
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transform: 'translateZ(0)',
      willChange: 'transform',
    }}>
      {/* Status Bar */}
      <div style={{
        height: statusBarH * scale,
        backgroundColor: '#050505',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 ${16 * scale}px`,
        flexShrink: 0,
        zIndex: 10,
        position: 'relative',
      }}>
        {isAndroid ? (
          <AndroidStatusBar scale={scale} />
        ) : (
          <IPhoneStatusBar scale={scale} />
        )}
      </div>

      {/* Screen / iframe area */}
      <div style={{
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
        background: '#000',
      }}>
        <iframe
          src={previewUrl}
          style={{
            width: deviceW,
            height: screenH + navBarH, // iframe includes the nav for android
            border: 'none',
            display: 'block',
            transformOrigin: 'top left',
            transform: `scale(${scale})`,
            willChange: 'transform',
          }}
          title="Raven-Os Mobile Preview"
        />
      </div>

      {/* Android Navigation Bar */}
      {isAndroid && (
        <AndroidNavBar scale={scale} navH={navBarH} />
      )}

      {/* iPhone Home Indicator */}
      {!isAndroid && (
        <div style={{
          height: 24 * scale,
          backgroundColor: '#050505',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <div style={{
            width: 120 * scale,
            height: 4 * scale,
            backgroundColor: 'rgba(255,255,255,0.4)',
            borderRadius: 2 * scale,
          }} />
        </div>
      )}
    </div>
  );
};

// ── Android Status Bar ───────────────────────────────────────────────────────

const AndroidStatusBar = ({ scale }: { scale: number }) => {
  const [time, setTime] = useState(() => formatTime());

  useEffect(() => {
    const t = setInterval(() => setTime(formatTime()), 30000);
    return () => clearInterval(t);
  }, []);

  const fs = Math.max(9, 11 * scale);

  return (
    <>
      <span style={{ color: '#fff', fontSize: fs, fontWeight: '600', letterSpacing: 0.3 }}>
        {time}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 * scale }}>
        {/* Signal bars */}
        <SignalIcon scale={scale} />
        {/* WiFi */}
        <WifiIcon scale={scale} />
        {/* Battery */}
        <BatteryIcon scale={scale} />
      </div>
    </>
  );
};

// ── iPhone Status Bar ────────────────────────────────────────────────────────

const IPhoneStatusBar = ({ scale }: { scale: number }) => {
  const [time, setTime] = useState(() => formatTime());

  useEffect(() => {
    const t = setInterval(() => setTime(formatTime()), 30000);
    return () => clearInterval(t);
  }, []);

  const fs = Math.max(9, 12 * scale);

  return (
    <>
      <span style={{ color: '#fff', fontSize: fs, fontWeight: '600' }}>{time}</span>
      {/* Dynamic Island */}
      <div style={{
        position: 'absolute',
        top: 6 * scale,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 90 * scale,
        height: 24 * scale,
        backgroundColor: '#000',
        borderRadius: 20 * scale,
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 * scale }}>
        <SignalIcon scale={scale} />
        <WifiIcon scale={scale} />
        <BatteryIcon scale={scale} />
      </div>
    </>
  );
};

// ── Android Nav Bar ──────────────────────────────────────────────────────────

const AndroidNavBar = ({ scale, navH }: { scale: number; navH: number }) => {
  return (
    <div style={{
      height: navH * scale,
      backgroundColor: '#050505',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: `0 ${24 * scale}px`,
      flexShrink: 0,
    }}>
      {/* Back button */}
      <button
        onClick={() => window.history.back()}
        style={navBtnStyle(scale)}
        title="Back"
      >
        <svg width={18 * scale} height={18 * scale} viewBox="0 0 24 24" fill="none">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="rgba(255,255,255,0.8)" />
        </svg>
      </button>

      {/* Home button */}
      <button style={navBtnStyle(scale)} title="Home">
        <div style={{
          width: 16 * scale,
          height: 16 * scale,
          borderRadius: '50%',
          border: `2px solid rgba(255,255,255,0.8)`,
        }} />
      </button>

      {/* Recents */}
      <button style={navBtnStyle(scale)} title="Recent Apps">
        <div style={{
          width: 13 * scale,
          height: 13 * scale,
          border: `2px solid rgba(255,255,255,0.8)`,
          borderRadius: 3 * scale,
        }} />
      </button>
    </div>
  );
};

// ── Icon Components ──────────────────────────────────────────────────────────

const SignalIcon = ({ scale }: { scale: number }) => {
  const barW = 2.5 * scale;
  const gap = 1.5 * scale;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap, height: 10 * scale }}>
      {[0.4, 0.6, 0.8, 1].map((h, i) => (
        <div key={i} style={{
          width: barW,
          height: 10 * h * scale,
          backgroundColor: i < 3 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
          borderRadius: 1,
        }} />
      ))}
    </div>
  );
};

const WifiIcon = ({ scale }: { scale: number }) => (
  <svg width={12 * scale} height={10 * scale} viewBox="0 0 24 20" fill="none">
    <path d="M12 14.5a2 2 0 100 4 2 2 0 000-4z" fill="white" />
    <path d="M12 8.5C9.5 8.5 7.2 9.5 5.5 11.2l1.8 1.8C8.5 11.8 10.1 11 12 11s3.5.8 4.7 2l1.8-1.8C16.8 9.5 14.5 8.5 12 8.5z" fill="rgba(255,255,255,0.7)" />
    <path d="M12 2.5C7.3 2.5 3 4.5 0 7.7l1.8 1.8C4.3 7 8 5.2 12 5.2s7.7 1.8 10.2 4.3L24 7.7C21 4.5 16.7 2.5 12 2.5z" fill="rgba(255,255,255,0.4)" />
  </svg>
);

const BatteryIcon = ({ scale }: { scale: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <div style={{
      width: 20 * scale,
      height: 10 * scale,
      border: '1.5px solid rgba(255,255,255,0.8)',
      borderRadius: 2.5 * scale,
      padding: 1.5,
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{
        width: '80%',
        height: '100%',
        backgroundColor: '#4ade80',
        borderRadius: 1.5 * scale,
      }} />
    </div>
    <div style={{
      width: 2 * scale,
      height: 5 * scale,
      backgroundColor: 'rgba(255,255,255,0.7)',
      borderRadius: 1,
    }} />
  </div>
);

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function navBtnStyle(scale: number): React.CSSProperties {
  return {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 8 * scale,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background 0.15s',
  };
}

// ── Layout Styles ─────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  splitRoot: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
  },
  webPane: {
    flex: 1,
    height: '100%',
    overflow: 'auto',
    borderRight: '1px solid rgba(255,255,255,0.08)',
    position: 'relative',
  },
  mobilePane: {
    width: 460,
    minWidth: 360,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    flexShrink: 0,
    background: 'linear-gradient(160deg, rgba(10,10,20,0.95) 0%, rgba(15,10,30,0.98) 100%)',
    borderLeft: '1px solid rgba(139,92,246,0.15)',
    boxShadow: 'inset 4px 0 40px rgba(0,0,0,0.3)',
  },
};

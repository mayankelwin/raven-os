import { useEffect, useRef } from 'react';
import { useRavenStore } from './index';

/**
 * Raven-Os Performance Watchdog
 * Monitors frame rate and rendering efficiency.
 */

export const useRavenPerformance = () => {
  const { setPerformanceScore, isOptimizationActive } = useRavenStore();
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    if (!isOptimizationActive) return;

    let requestRef: number;

    const monitor = () => {
      frameCount.current++;
      const now = performance.now();
      const elapsed = now - lastTime.current;

      if (elapsed >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / elapsed);
        
        // Simple score calculation: 60fps = 100%, 30fps = 50%
        const score = Math.min(100, Math.round((fps / 60) * 100 * 10) / 10);
        
        setPerformanceScore(score);
        
        frameCount.current = 0;
        lastTime.current = now;
      }

      requestRef = requestAnimationFrame(monitor);
    };

    requestRef = requestAnimationFrame(monitor);
    return () => cancelAnimationFrame(requestRef);
  }, [isOptimizationActive, setPerformanceScore]);
};

/**
 * Utility to measure execution time of async functions.
 */
export const ravenMeasure = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const end = performance.now();
    console.log(`[Raven-Os] ${name} took ${(end - start).toFixed(2)}ms`);
  }
};

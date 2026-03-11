import React, { useRef, useState, useCallback } from "react";

const THRESHOLD = 70;
const MAX_PULL = 120;

export default function PullToRefresh({ onRefresh, children }) {
  const containerRef = useRef(null);
  const startY = useRef(0);
  const pulling = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const handleTouchStart = useCallback((e) => {
    if (refreshing) return;
    const el = containerRef.current;
    if (!el || el.scrollTop > 0) return;
    startY.current = e.touches[0].clientY;
    pulling.current = true;
  }, [refreshing]);

  const handleTouchMove = useCallback((e) => {
    if (!pulling.current || refreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta < 0) { setPullDistance(0); return; }
    const dampened = Math.min(delta * 0.5, MAX_PULL);
    setPullDistance(dampened);
  }, [refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pullDistance >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullDistance(THRESHOLD * 0.6);
      await onRefresh();
      setRefreshing(false);
    }
    setPullDistance(0);
  }, [pullDistance, refreshing, onRefresh]);

  const progress = Math.min(pullDistance / THRESHOLD, 1);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      <div
        className="pointer-events-none flex items-center justify-center overflow-hidden transition-[height] duration-200"
        style={{ height: pullDistance > 5 || refreshing ? Math.max(pullDistance, refreshing ? 42 : 0) : 0 }}
      >
        <div
          className="flex items-center justify-center rounded-full border border-white/10 bg-[var(--slate)] shadow-lg"
          style={{
            width: 32,
            height: 32,
            opacity: progress,
            transform: `rotate(${progress * 360}deg)`,
            transition: refreshing ? "transform 0s" : "opacity 0.15s",
            animation: refreshing ? "ptr-spin 0.7s linear infinite" : "none",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[var(--gold)]">
            <path d="M8 2v4M8 2L5.5 4.5M8 2l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 8a5 5 0 0 0 10 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity={refreshing ? 1 : progress} />
          </svg>
        </div>
      </div>

      <style>{`
        @keyframes ptr-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {children}
    </div>
  );
}
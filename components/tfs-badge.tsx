"use client";

import { useEffect, useState } from "react";

interface TFSBadgeProps {
  size?: number;
  className?: string;
}

export function TFSBadge({ size = 68, className = "" }: TFSBadgeProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const half = size / 2;
  const notchWidth = size * 0.147; // ~10px at 68
  const notchHeight = 1.5;
  const fontSize = size * 0.309; // ~21px at 68
  const letterSpacing = size * 0.029; // ~2px at 68

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Glow pulse */}
      <div
        className="absolute inset-0 rounded-sm"
        style={{
          boxShadow: mounted
            ? "0 0 16px rgba(74, 222, 128, 0.35), 0 0 40px rgba(74, 222, 128, 0.12)"
            : "0 0 8px rgba(74, 222, 128, 0.2)",
          animation: mounted ? "tfsBadgeGlow 3s ease-in-out infinite" : "none",
        }}
      />

      {/* Border */}
      <div
        className="absolute inset-0"
        style={{
          border: "1.5px solid rgba(74, 222, 128, 0.70)",
        }}
      />

      {/* Top notch */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: -0.75,
          width: notchWidth,
          height: notchHeight,
          backgroundColor: "rgba(74, 222, 128, 0.65)",
        }}
      />

      {/* Bottom notch */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: -0.75,
          width: notchWidth,
          height: notchHeight,
          backgroundColor: "rgba(74, 222, 128, 0.65)",
        }}
      />

      {/* TFS text */}
      <span
        style={{
          fontFamily: "'Monaco', 'Courier New', 'Consolas', monospace",
          fontSize,
          fontWeight: 700,
          color: "rgb(74, 222, 128)",
          letterSpacing,
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        TFS
      </span>

    </div>
  );
}

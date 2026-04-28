import React from 'react';

export function HookIconImage({ size }: { size: number }) {
  const chip = Math.round(size * 0.39);
  const chipX = Math.round((size - chip) / 2);
  const pinLen = Math.max(2, Math.round(size * 0.07));
  const pinStroke = Math.max(1, Math.round(size * 0.03));
  const center = Math.round(size / 2);
  const core = Math.round(size * 0.14);
  const arcStroke = Math.max(2, Math.round(size * 0.04));

  const pinStyle: React.CSSProperties = {
    position: 'absolute',
    background: '#082A57',
    borderRadius: 9999,
  };

  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        background: 'transparent',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: chipX,
          top: chipX,
          width: chip,
          height: chip,
          borderRadius: Math.round(chip * 0.16),
          background: '#082A57',
        }}
      />

      {[
        { x: chipX - pinLen, y: chipX + Math.round(chip * 0.22), w: pinLen, h: pinStroke },
        { x: chipX - pinLen, y: chipX + Math.round(chip * 0.5), w: pinLen, h: pinStroke },
        { x: chipX - pinLen, y: chipX + Math.round(chip * 0.78), w: pinLen, h: pinStroke },
        { x: chipX + chip, y: chipX + Math.round(chip * 0.22), w: pinLen, h: pinStroke },
        { x: chipX + chip, y: chipX + Math.round(chip * 0.5), w: pinLen, h: pinStroke },
        { x: chipX + chip, y: chipX + Math.round(chip * 0.78), w: pinLen, h: pinStroke },
        { x: chipX + Math.round(chip * 0.22), y: chipX - pinLen, w: pinStroke, h: pinLen },
        { x: chipX + Math.round(chip * 0.5), y: chipX - pinLen, w: pinStroke, h: pinLen },
        { x: chipX + Math.round(chip * 0.78), y: chipX - pinLen, w: pinStroke, h: pinLen },
        { x: chipX + Math.round(chip * 0.22), y: chipX + chip, w: pinStroke, h: pinLen },
        { x: chipX + Math.round(chip * 0.5), y: chipX + chip, w: pinStroke, h: pinLen },
        { x: chipX + Math.round(chip * 0.78), y: chipX + chip, w: pinStroke, h: pinLen },
      ].map((p, i) => (
        <div key={i} style={{ ...pinStyle, left: p.x, top: p.y, width: p.w, height: p.h }} />
      ))}

      <div
        style={{
          position: 'absolute',
          left: center - core,
          top: center - core,
          width: core * 2,
          height: core * 2,
          borderRadius: 9999,
          background: 'linear-gradient(135deg, #A45BFF 0%, #FF8A63 100%)',
        }}
      />

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: 'absolute', left: 0, top: 0 }}
      >
        <path
          d={`M${Math.round(size * 0.24)} ${Math.round(size * 0.24)} Q${center} ${Math.round(
            size * 0.08
          )} ${Math.round(size * 0.76)} ${Math.round(size * 0.24)}`}
          stroke="#17B7B0"
          strokeWidth={arcStroke}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M${Math.round(size * 0.24)} ${Math.round(size * 0.76)} Q${center} ${Math.round(
            size * 0.92
          )} ${Math.round(size * 0.76)} ${Math.round(size * 0.76)}`}
          stroke="#17B7B0"
          strokeWidth={arcStroke}
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

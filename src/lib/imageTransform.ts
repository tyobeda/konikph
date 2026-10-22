import React from 'react';

export interface ImageTransformData {
  x: number; // horizontal focus/shift (default 50)
  y: number; // vertical focus/shift (default 50, <50 moves up, >50 moves down)
  scale: number; // 1 - 2.5
}

export interface ResponsiveImageTransform {
  mobile: ImageTransformData;
  desktop: ImageTransformData;
}

const DEFAULT_TRANSFORM: ImageTransformData = { x: 50, y: 50, scale: 1 };

function sanitizeTransform(data?: any): ImageTransformData {
  if (!data || typeof data !== 'object') return { ...DEFAULT_TRANSFORM };
  return {
    x: typeof data.x === 'number' && !isNaN(data.x) ? data.x : 50,
    y: typeof data.y === 'number' && !isNaN(data.y) ? data.y : 50,
    scale: typeof data.scale === 'number' && !isNaN(data.scale) ? Math.max(1, Math.min(3, data.scale)) : 1,
  };
}

export function parseResponsiveImageTransform(val?: string | null): ResponsiveImageTransform {
  if (!val) {
    return {
      mobile: { ...DEFAULT_TRANSFORM },
      desktop: { ...DEFAULT_TRANSFORM },
    };
  }

  try {
    const trimmed = val.trim();
    if (trimmed.startsWith('{')) {
      const parsed = JSON.parse(trimmed);
      // Case 1: Already has mobile and desktop keys
      if (parsed.mobile || parsed.desktop) {
        return {
          mobile: sanitizeTransform(parsed.mobile),
          desktop: sanitizeTransform(parsed.desktop),
        };
      }
      // Case 2: Flat single transform { x, y, scale }
      if (typeof parsed.x === 'number' || typeof parsed.y === 'number') {
        const single = sanitizeTransform(parsed);
        return {
          mobile: { ...single },
          desktop: { ...DEFAULT_TRANSFORM },
        };
      }
    }
  } catch (_) {}

  // Fallback for string format like "50% 35%"
  const parts = val.replace(/%/g, '').trim().split(/\s+/);
  if (parts.length >= 2) {
    const x = parseFloat(parts[0]) || 50;
    const y = parseFloat(parts[1]) || 50;
    return {
      mobile: { x, y, scale: 1 },
      desktop: { ...DEFAULT_TRANSFORM },
    };
  }

  return {
    mobile: { ...DEFAULT_TRANSFORM },
    desktop: { ...DEFAULT_TRANSFORM },
  };
}

export function stringifyResponsiveImageTransform(data: ResponsiveImageTransform): string {
  return JSON.stringify({
    mobile: {
      x: Math.round(data.mobile.x),
      y: Math.round(data.mobile.y),
      scale: parseFloat(data.mobile.scale.toFixed(2)),
    },
    desktop: {
      x: Math.round(data.desktop.x),
      y: Math.round(data.desktop.y),
      scale: parseFloat(data.desktop.scale.toFixed(2)),
    },
  });
}

// Backward compatible helpers for single transform
export function parseImageTransform(val?: string | null): ImageTransformData {
  const resp = parseResponsiveImageTransform(val);
  return resp.desktop;
}

export function stringifyImageTransform(data: ImageTransformData): string {
  return JSON.stringify({
    x: Math.round(data.x),
    y: Math.round(data.y),
    scale: parseFloat(data.scale.toFixed(2)),
  });
}

export function getImageTransformStyle(
  val?: string | null,
  device: 'mobile' | 'desktop' = 'desktop'
): React.CSSProperties {
  const responsive = parseResponsiveImageTransform(val);
  const config = responsive[device] || DEFAULT_TRANSFORM;

  // Calculate translation offsets relative to center (50% 50%)
  // When y < 50, photo translates UP (negative Y)
  // When x < 50, photo translates LEFT (negative X)
  const translateX = (config.x - 50) * 1.0;
  const translateY = (config.y - 50) * 1.0;

  return {
    objectPosition: `${config.x}% ${config.y}%`,
    transform: `translate(${translateX}%, ${translateY}%) scale(${config.scale})`,
    transformOrigin: 'center center',
  };
}

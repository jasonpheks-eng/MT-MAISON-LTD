import React from 'react';
import { SingleImageConfig } from '../types';

export function getImageStyleAndClasses(
  slotKey: string,
  configs?: Record<string, SingleImageConfig>,
  fallbackAspect: string = 'aspect-[4/5]',
  fallbackFit: string = 'object-cover'
) {
  const config = configs?.[slotKey] || {};

  // Aspect ratio class
  let aspectClass = fallbackAspect;
  if (config.aspectRatio) {
    switch (config.aspectRatio) {
      case '4/5':
        aspectClass = 'aspect-[4/5]';
        break;
      case '1/1':
        aspectClass = 'aspect-square';
        break;
      case '4/3':
        aspectClass = 'aspect-[4/3]';
        break;
      case '16/9':
        aspectClass = 'aspect-[16/9]';
        break;
      case '3/4':
        aspectClass = 'aspect-[3/4]';
        break;
      case 'auto':
        aspectClass = 'aspect-auto';
        break;
      default:
        aspectClass = fallbackAspect;
    }
  }

  // Position class
  let positionClass = 'object-center';
  if (config.position) {
    switch (config.position) {
      case 'top':
        positionClass = 'object-top';
        break;
      case 'bottom':
        positionClass = 'object-bottom';
        break;
      case 'left':
        positionClass = 'object-left';
        break;
      case 'right':
        positionClass = 'object-right';
        break;
      case 'center':
      default:
        positionClass = 'object-center';
    }
  }

  // Object fit class
  let fitClass = fallbackFit;
  if (config.objectFit) {
    switch (config.objectFit) {
      case 'contain':
        fitClass = 'object-contain';
        break;
      case 'fill':
        fitClass = 'object-fill';
        break;
      case 'cover':
      default:
        fitClass = 'object-cover';
    }
  }

  // Border style class (Soft translucent & blend-in options)
  let borderClass = 'border-0 outline-none shadow-none';
  if (config.borderStyle) {
    switch (config.borderStyle) {
      case 'soft-translucent':
        borderClass = 'border border-white/20 bg-white/5 backdrop-blur-sm shadow-xl';
        break;
      case 'blend-in':
        borderClass = 'border border-rose-300/30 shadow-[inset_0_0_25px_rgba(255,255,255,0.12)] bg-black/15 backdrop-blur-xs';
        break;
      case 'ambient-glow':
        borderClass = 'border border-rose-300/40 shadow-[0_0_35px_rgba(196,82,102,0.45)]';
        break;
      case 'glass-card':
        borderClass = 'border border-white/25 bg-white/10 backdrop-blur-md shadow-2xl';
        break;
      case 'none':
      default:
        borderClass = 'border-0 outline-none shadow-none';
    }
  }

  // Corner radius class
  let radiusClass = 'rounded-2xl';
  if (config.cornerStyle) {
    switch (config.cornerStyle) {
      case 'pill':
        radiusClass = 'rounded-3xl';
        break;
      case 'full':
        radiusClass = 'rounded-full overflow-hidden';
        break;
      case 'sharp':
        radiusClass = 'rounded-none';
        break;
      case 'rounded':
      default:
        radiusClass = 'rounded-2xl';
    }
  }

  // Style transformations (Flip, Scale, Remove Background blend)
  const flipH = config.flipH ? -1 : 1;
  const flipV = config.flipV ? -1 : 1;
  const scale = config.scale || 1.0;

  const style: React.CSSProperties = {
    transform: `scaleX(${flipH}) scaleY(${flipV}) scale(${scale})`,
    transition: 'transform 0.3s ease, filter 0.3s ease, mix-blend-mode 0.3s ease',
  };

  if (config.removeBg) {
    style.mixBlendMode = 'multiply';
    style.filter = 'contrast(1.25) brightness(1.08)';
  }

  return {
    aspectClass,
    positionClass,
    fitClass,
    borderClass,
    radiusClass,
    containerClasses: `relative overflow-hidden ${aspectClass} ${radiusClass} ${borderClass}`,
    combinedClasses: `w-full h-full ${positionClass} ${fitClass} ${radiusClass}`,
    style,
  };
}

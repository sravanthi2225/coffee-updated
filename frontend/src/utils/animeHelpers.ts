import { animate, stagger, utils } from 'animejs';

/**
 * Creates a looping steam wisp animation on SVG path elements.
 * Used on menu card hover to show rising steam from coffee cup icons.
 */
export function createSteamWisp(
  targets: string | Element | Element[],
  options?: { duration?: number; loop?: boolean }
) {
  const duration = options?.duration ?? 2400;
  return animate(targets, {
    translateY: [0, -30],
    opacity: [0.7, 0],
    scaleX: [1, 1.3],
    ease: 'outSine',
    duration,
    loop: options?.loop ?? true,
    delay: stagger(300),
  });
}

/**
 * Creates a subtle sparkle/dust particle overlay effect.
 */
export function createSparkleEffect(
  targets: string | Element | Element[],
  options?: { duration?: number }
) {
  return animate(targets, {
    opacity: [0, 0.6, 0],
    translateY: () => utils.random(-40, -80),
    translateX: () => utils.random(-20, 20),
    scale: [0, 1, 0.5],
    ease: 'inOutQuad',
    duration: options?.duration ?? 3000,
    delay: stagger(200, { from: 'center' }),
    loop: true,
  });
}

/**
 * Animates a count-up on a numeric value (for price tags, stats).
 */
export function countUp(
  target: HTMLElement,
  endValue: number,
  options?: { duration?: number; prefix?: string; suffix?: string; decimals?: number }
) {
  const decimals = options?.decimals ?? 0;
  const prefix = options?.prefix ?? '';
  const suffix = options?.suffix ?? '';
  const obj = { val: 0 };

  return animate(obj, {
    val: endValue,
    duration: options?.duration ?? 1500,
    ease: 'outExpo',
    onUpdate: () => {
      target.textContent = `${prefix}${obj.val.toFixed(decimals)}${suffix}`;
    },
  });
}

/**
 * Creates SVG line-draw animation (stroke-dashoffset).
 */
export function drawSVGPath(
  targets: string | Element | Element[],
  options?: { duration?: number; ease?: string }
) {
  return animate(targets, {
    strokeDashoffset: [(el: any) => ((utils as any).get ? (utils as any).get(el, 'strokeDashoffset') : 0), 0],
    ease: (options?.ease as any) ?? 'inOutSine',
    duration: options?.duration ?? 2000,
    delay: stagger(400),
  });
}

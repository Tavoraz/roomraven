import { nanoid } from "nanoid";

export function nowIso() {
  return new Date().toISOString();
}

export function makeId(prefix: string) {
  return `${prefix}_${nanoid(10)}`;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function hashSeed(input: string) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash || 1;
}

export function createRng(seed: number) {
  let value = seed >>> 0;

  return () => {
    value = (1664525 * value + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

export function round(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function ensureArray<T>(value: T | T[]) {
  return Array.isArray(value) ? value : [value];
}

export function toDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function formatPercent(value: number) {
  return `${round(value)}%`;
}

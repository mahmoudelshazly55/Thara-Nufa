import { Request, Response, NextFunction } from 'express';

const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function sanitizeValue(val: unknown): unknown {
  if (typeof val === 'string') {
    return val
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<[^>]+>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }
  if (Array.isArray(val)) return val.map(sanitizeValue);
  if (val !== null && typeof val === 'object') {
    const map = new Map<string, unknown>();
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      if (BLOCKED_KEYS.has(k)) continue;
      map.set(k, sanitizeValue(v));
    }
    return Object.fromEntries(map);
  }
  return val;
}

export function sanitizeInput(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  next();
}

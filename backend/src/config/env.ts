/**
 * Centralized environment config with runtime validation.
 * Import JWT_SECRET from here instead of using process.env.JWT_SECRET! directly.
 * The runtime check guarantees the value exists; the cast tells TypeScript the same.
 */

const raw = process.env.JWT_SECRET;

if (!raw) {
  throw new Error('[Config] JWT_SECRET environment variable is required but not set.');
}

/** Validated, non-nullable JWT secret. */
export const JWT_SECRET: string = raw;

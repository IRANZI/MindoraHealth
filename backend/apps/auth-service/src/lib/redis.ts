import {
  blacklistToken,
  getRedisClient,
  isTokenBlacklisted,
  passwordResetKey,
} from '@mindora/auth-middleware';
import { config } from '../config.js';

export { blacklistToken, isTokenBlacklisted, passwordResetKey };

// In-memory fallback map for development/localhost when Redis is not running
const memoryTokenStore = new Map<string, { userId: string; expiresAt: number }>();
let safeRedisClient: ReturnType<typeof getRedisClient> | null = null;
let isRedisReachable = true;

function getSafeClient() {
  if (!safeRedisClient) {
    safeRedisClient = getRedisClient(config.redisUrl);
    safeRedisClient.on('error', () => {
      isRedisReachable = false;
    });
    safeRedisClient.on('ready', () => {
      isRedisReachable = true;
    });
  }
  return safeRedisClient;
}

export async function connectRedis(): Promise<void> {
  try {
    const client = getSafeClient();
    if (client.status === 'ready') {
      return;
    }
    await client.connect();
    await client.ping();
    isRedisReachable = true;
  } catch (err) {
    isRedisReachable = false;
    console.warn(
      '[redis] Redis not running on localhost (in-memory token store active):',
      err instanceof Error ? err.message : err
    );
  }
}

export async function storePasswordResetToken(
  tokenHash: string,
  userId: string
): Promise<void> {
  const key = passwordResetKey(tokenHash);
  // Always store in memory fallback so localhost dev works without Redis running
  memoryTokenStore.set(key, {
    userId,
    expiresAt: Date.now() + 15 * 60 * 1000,
  });

  try {
    const client = getSafeClient();
    if (isRedisReachable) {
      await client.set(key, userId, 'EX', 15 * 60);
    }
  } catch {
    isRedisReachable = false;
  }
}

export async function getPasswordResetUserId(
  tokenHash: string
): Promise<string | null> {
  const key = passwordResetKey(tokenHash);

  try {
    const client = getSafeClient();
    if (isRedisReachable) {
      const val = await client.get(key);
      if (val) return val;
    }
  } catch {
    isRedisReachable = false;
  }

  const entry = memoryTokenStore.get(key);
  if (entry) {
    if (Date.now() <= entry.expiresAt) {
      return entry.userId;
    }
    memoryTokenStore.delete(key);
  }
  return null;
}

export async function deletePasswordResetToken(
  tokenHash: string
): Promise<void> {
  const key = passwordResetKey(tokenHash);
  memoryTokenStore.delete(key);

  try {
    const client = getSafeClient();
    if (isRedisReachable) {
      await client.del(key);
    }
  } catch {
    isRedisReachable = false;
  }
}

/**
 * Shared signing key for login tokens and HTTP/WebSocket verification.
 * Production must set JWT_SECRET. The development fallback is refused there
 * so a missing secret cannot be used to forge tokens for existing users.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required when NODE_ENV is production');
  }

  return 'fallback-secret';
}

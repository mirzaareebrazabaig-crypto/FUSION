import bcrypt from 'bcrypt';

/**
 * Hash a plaintext password using bcrypt.
 * The cost factor is set to 12 which provides good security while remaining performant.
 */
export async function hashPassword(plain: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(plain, saltRounds);
}

/**
 * Verify a plaintext password against a bcrypt hash.
 */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(plain, hash);
}

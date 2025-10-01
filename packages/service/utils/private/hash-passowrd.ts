import config from '../../config/env';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export class PasswordUtils {
  static SALT_ROUNDS = config.SALT_ROUNDS || 10;
  private static SECRET_KEY = config.HASH_SECRET;

  // Combine password with secret pepper before hashing
  private static addPepper(password: string, secret?: string): string {
    const secretKey = secret || this.SECRET_KEY;
    if (!secretKey) return password;
    return crypto
      .createHmac('sha256', secretKey)
      .update(password)
      .digest('hex');
  }

  static async hash(
    password: string,
    secret?: string,
    saltRounds = this.SALT_ROUNDS
  ): Promise<string> {
    if (!password || typeof password !== 'string') {
      throw new Error('Password must be a non-empty string');
    }

    const pepperedPassword = this.addPepper(password, secret);
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(pepperedPassword, salt);
  }

  static async verify(
    password: string,
    hash: string,
    secret?: string
  ): Promise<boolean> {
    if (!password || !hash) return false;
    try {
      const pepperedPassword = this.addPepper(password, secret);
      return await bcrypt.compare(pepperedPassword, hash);
    } catch {
      return false;
    }
  }

  static hashSync(
    password: string,
    secret?: string,
    saltRounds = this.SALT_ROUNDS
  ): string {
    if (!password || typeof password !== 'string') {
      throw new Error('Password must be a non-empty string');
    }

    const pepperedPassword = this.addPepper(password, secret);
    return bcrypt.hashSync(pepperedPassword, bcrypt.genSaltSync(saltRounds));
  }

  static verifySync(password: string, hash: string, secret?: string): boolean {
    if (!password || !hash) return false;
    try {
      const pepperedPassword = this.addPepper(password, secret);
      return bcrypt.compareSync(pepperedPassword, hash);
    } catch {
      return false;
    }
  }

  static needsRehash(hash: string, saltRounds = this.SALT_ROUNDS): boolean {
    try {
      return bcrypt.getRounds(hash) < saltRounds;
    } catch {
      return true;
    }
  }

  // Helper method to check if secret key is configured
  static hasSecretKey(): boolean {
    return !!this.SECRET_KEY;
  }
}

// Updated exports - now automatically use env secret
export const hashPassword = (password: string, customSecret?: string) =>
  PasswordUtils.hash(password, customSecret);
export const verifyPassword = (
  password: string,
  hash: string,
  customSecret?: string
) => PasswordUtils.verify(password, hash, customSecret);

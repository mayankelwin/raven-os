/**
 * RavenCrypt Engine (V1)
 * Provides End-to-End Encryption (E2EE) using AES-GCM.
 * Supported: Web (SubtleCrypto) and Node/Mobile (TBD mapping).
 */

const ENCODER = new TextEncoder();
const DECODER = new TextDecoder();

export const RavenCrypt = {
  /**
   * Derive a encryption key from a password string.
   */
  async deriveKey(password: string): Promise<CryptoKey> {
    const rawKey = ENCODER.encode(password);
    
    if (typeof crypto === 'undefined' || !crypto.subtle) {
      throw new Error('[RAVEN CRYPT] SubtleCrypto is not available in this environment.');
    }

    const key = await crypto.subtle.importKey(
      'raw',
      rawKey,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: ENCODER.encode('raven-salt-nexus'), // In production, use a unique salt
        iterations: 1000,
        hash: 'SHA-256'
      },
      key,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  },

  /**
   * Encrypt a JSON payload into a secure opaque blob.
   */
  async encrypt(data: any, key: CryptoKey): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = ENCODER.encode(JSON.stringify(data));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    // Combine IV and Ciphertext for transport
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Return as Base64 for WebSocket transport
    return btoa(String.fromCharCode(...combined));
  },

  /**
   * Decrypt an opaque blob back into a JSON payload.
   */
  async decrypt(blob: string, key: CryptoKey): Promise<any> {
    const combined = new Uint8Array(
      atob(blob).split('').map(c => c.charCodeAt(0))
    );

    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    return JSON.parse(DECODER.decode(decrypted));
  }
};

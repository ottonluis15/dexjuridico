/**
 * Serviço de Criptografia e Hash Seguro para o DEX Jurídico
 * Utiliza a Web Crypto API nativa (SHA-256 com Salt criptográfico)
 * Sem senhas em texto puro no sistema.
 */

export const cryptoService = {
  /**
   * Gera um salt aleatório em hexadecimal
   */
  generateSalt(): string {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Gera o hash SHA-256 de uma senha combinada com o salt
   */
  async hashPassword(password: string, salt: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(salt + password);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Valida uma senha fornecida contra o hash e salt armazenados
   */
  async verifyPassword(password: string, salt: string, expectedHash: string): Promise<boolean> {
    const calculatedHash = await this.hashPassword(password, salt);
    return calculatedHash === expectedHash;
  }
};

/**
 * Basic Auth für Admin-Bereich (Middleware + API Defense in Depth).
 */

export function parseBasicAuthHeader(authHeader: string | null): {
  username: string;
  password: string;
} | null {
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return null;
  }

  const base64Credentials = authHeader.slice(6).trim();

  try {
    // Edge-kompatibel (Middleware): atob statt Buffer, da Buffer in Edge Runtime ggf. fehlt
    const decoded =
      typeof Buffer !== 'undefined'
        ? Buffer.from(base64Credentials, 'base64').toString('utf-8')
        : (() => {
            const binary = atob(base64Credentials.replace(/-/g, '+').replace(/_/g, '/'));
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            return new TextDecoder().decode(bytes);
          })();
    const separatorIndex = decoded.indexOf(':');

    if (separatorIndex === -1) {
      return null;
    }

    const username = decoded.slice(0, separatorIndex);
    const password = decoded.slice(separatorIndex + 1);

    return { username, password };
  } catch {
    return null;
  }
}

export function isValidBasicAuth(authHeader: string | null): boolean {
  const credentials = parseBasicAuthHeader(authHeader);

  if (!credentials) {
    return false;
  }

  const expectedUser = (process.env.ADMIN_BASIC_USER ?? '').trim();
  const expectedPass = (process.env.ADMIN_BASIC_PASS ?? '').trim();

  if (expectedUser.length === 0 || expectedPass.length === 0) {
    return false;
  }

  return (
    credentials.username.trim() === expectedUser &&
    credentials.password === expectedPass
  );
}

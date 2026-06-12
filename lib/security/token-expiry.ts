/**
 * Berechnet Ablaufzeit für Demo-/Zugangs-Tokens.
 * `expiresInMinutes` hat Vorrang vor `expiresInDays`.
 */
export function resolveTokenExpiresAt(input: {
  expiresInMinutes?: number;
  expiresInDays?: number;
  defaultDays?: number;
}): Date {
  const minutes = Number(input.expiresInMinutes);
  if (Number.isFinite(minutes) && minutes > 0) {
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  const defaultDays = input.defaultDays ?? 30;
  const days = Math.max(1, Number(input.expiresInDays) || defaultDays);
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

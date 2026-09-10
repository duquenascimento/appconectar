const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function isRegistrationExpired(
  createdAt: string | Date | undefined | null,
  maxDays = 30,
): boolean {
  if (!createdAt) return false;

  const createdAtMs = new Date(createdAt).getTime();
  if (Number.isNaN(createdAtMs)) return false;

  return Date.now() - createdAtMs > maxDays * DAY_IN_MS;
}

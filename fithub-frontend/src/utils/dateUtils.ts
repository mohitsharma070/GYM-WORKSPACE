export function getDaysLeft(endDate?: string): number | string {
  if (!endDate) return "N/A";
  const diff = new Date(endDate).getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function isExpired(endDate?: string): boolean {
  if (!endDate) return false;
  return new Date(endDate).getTime() < new Date().getTime();
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Generate a random ID with the given prefix, e.g. "evt_abc123def456789a" */
export function generateId(prefix: string): string {
  const rand =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 16)
      : Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
  return `${prefix}_${rand}`;
}

export const generateEventId       = (): string => generateId('evt');
export const generateSessionId     = (): string => generateId('sess');
export const generateCorrelationId = (): string => generateId('corr');
export const generateBatchId       = (): string => generateId('batch');

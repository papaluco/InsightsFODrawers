export const SEV_ORDER: Record<string, number> = {
  critical: 0, high: 1, medium: 2, low: 3,
};

export const SEV_COLORS: Record<string, string> = {
  critical: '#e11d48',
  high:     '#f97316',
  medium:   '#fbbf24',
  low:      '#d1d5db',
};

export const SEV_BADGE: Record<string, string> = {
  critical: 'bg-rose-100 text-rose-700',
  high:     'bg-orange-100 text-orange-700',
  medium:   'bg-amber-100 text-amber-700',
  low:      'bg-gray-100 text-gray-600',
};

export const CAT_LABEL: Record<string, string> = {
  api_error:          'API Error',
  frontend_exception: 'Frontend Exception',
  network_error:      'Network Error',
  permission_error:   'Permission Error',
  validation_error:   'Validation Error',
  data_error:         'Data Error',
  integration_error:  'Integration Error',
  unknown:            'Unknown',
};

export function fmtTs(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export function fmtTsFull(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', second: '2-digit',
  });
}

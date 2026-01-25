export function getApiBase(): string {
  if (typeof window !== 'undefined' && (window as any).__API_BASE__) {
    return (window as any).__API_BASE__;
  }
  
  const envApiUrl = import.meta.env.VITE_API_URL;
  
  // If VITE_API_URL is an absolute URL, use it
  if (envApiUrl && envApiUrl.startsWith('http')) {
    const cleanUrl = envApiUrl.endsWith('/') ? envApiUrl.slice(0, -1) : envApiUrl;
    return cleanUrl.endsWith('/api') ? cleanUrl.replace('/api', '') : cleanUrl;
  }
  
  // If we're on localhost, use local backend
  if (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    return 'http://localhost:5000';
  }
  
  // Otherwise use relative path (empty string means current domain)
  return '';
}

export function getApiUrl(): string {
  const base = getApiBase();
  return base ? `${base}/api` : '/api';
}

export function stripApiBase(path: string): string {
  if (!path || typeof path !== 'string') return path;
  
  const base = getApiBase();
  if (base && path.startsWith(base)) {
    return path.replace(base, '');
  }
  
  // Legacy/common hostnames to strip
  const legacyHosts = [
    /^https?:\/\/localhost:5000/,
    /^https?:\/\/127\.0\.0\.1:5000/,
    /^https?:\/\/eishro-backend\.onrender\.com/
  ];
  
  let stripped = path;
  for (const host of legacyHosts) {
    stripped = stripped.replace(host, '');
  }
  
  return stripped;
}

import { API_BASE_URL } from '@/config/api';

const PAYSTACK_BANKS_URL = 'https://api.paystack.co/bank?country=nigeria';
const CACHE_KEY = 'banks_cache_v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

const normalize = (raw) => {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((b) => b && b.active !== false && !b.is_deleted)
    .map((b) => ({
      id: b.id,
      name: b.name,
      code: b.code,
      slug: b.slug,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

const readCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.banks)) return null;
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return null;
    return parsed.banks;
  } catch {
    return null;
  }
};

const writeCache = (banks) => {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ banks, timestamp: Date.now() })
    );
  } catch {
    // Ignore quota / private-mode errors
  }
};

// Try the app's own backend first (safer — keeps any Paystack key server-side),
// then fall back to calling Paystack directly. Both return the same shape after
// normalize(), so the component doesn't need to care which source won.
export const fetchBanks = async () => {
  const cached = readCache();
  if (cached && cached.length > 0) return cached;

  const tryBackend = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/banks`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) return null;
      const payload = await res.json();
      const arr = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
        ? payload.data
        : null;
      return normalize(arr);
    } catch {
      return null;
    }
  };

  const tryPaystack = async () => {
    try {
      const res = await fetch(PAYSTACK_BANKS_URL);
      if (!res.ok) return null;
      const payload = await res.json();
      return normalize(payload?.data);
    } catch {
      return null;
    }
  };

  const backendBanks = await tryBackend();
  if (backendBanks && backendBanks.length > 0) {
    writeCache(backendBanks);
    return backendBanks;
  }

  const paystackBanks = await tryPaystack();
  if (paystackBanks && paystackBanks.length > 0) {
    writeCache(paystackBanks);
    return paystackBanks;
  }

  return [];
};

// Collect a best-effort device name and approximate location to send to the
// backend on login/register so the user's devices list (Settings → Devices)
// has something meaningful to show. Both helpers degrade gracefully — if the
// browser blocks geolocation lookups or the user is offline, login still
// works and the device row simply has no location.

// Friendly device label parsed from the User-Agent (e.g. "Chrome on Windows").
export const getDeviceName = () => {
  const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
  let browser = 'Browser';
  if (/Edg\//.test(ua)) browser = 'Edge';
  else if (/OPR\//.test(ua)) browser = 'Opera';
  else if (/Chrome\//.test(ua)) browser = 'Chrome';
  else if (/Firefox\//.test(ua)) browser = 'Firefox';
  else if (/Safari\//.test(ua)) browser = 'Safari';

  let os = 'Unknown';
  if (/iPhone/.test(ua)) os = 'iPhone';
  else if (/iPad/.test(ua)) os = 'iPad';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/Windows NT/.test(ua)) os = 'Windows';
  else if (/Mac OS X|Macintosh/.test(ua)) os = 'macOS';
  else if (/Linux/.test(ua)) os = 'Linux';

  return `${browser} on ${os}`;
};

// IP-based approximate location ("City, Country"). Cached in sessionStorage
// so we don't refetch on every auth attempt. Returns '' on any failure.
export const getApproxLocation = async () => {
  try {
    if (typeof sessionStorage !== 'undefined') {
      const cached = sessionStorage.getItem('approx_location');
      if (cached !== null) return cached;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const response = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) return '';
    const data = await response.json();
    const loc = [data.city, data.country_name].filter(Boolean).join(', ');
    if (loc && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('approx_location', loc);
    }
    return loc;
  } catch {
    return '';
  }
};

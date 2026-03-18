# Security Best Practices Report (Frontend)

## Executive Summary
I reviewed the React frontend for common client‑side security risks (XSS sinks, unsafe navigation, token handling, and baseline browser protections). I did **not** find `dangerouslySetInnerHTML`, `eval`, or `document.write` usage in the React code. The largest risks are **token storage in `localStorage`** and **OAuth tokens arriving via URL query parameters**. These are common patterns but increase exposure if any XSS occurs or if tokens leak via referrers/history. I also found a small tab‑nabbing risk with `window.open` and a low‑risk `innerHTML` usage in an HTML test file.

---

## High Severity

### [H-1] Access + refresh tokens stored in `localStorage`
**Rule ID:** REACT-AUTH-001

**Location:**
- `/Users/SAINT/Documents/botmon-v1.0/src/components/Auth/Login.jsx:59-102`
- `/Users/SAINT/Documents/botmon-v1.0/src/components/ProtectedRoute.jsx:24-31`
- `/Users/SAINT/Documents/botmon-v1.0/src/utils/axiosConfig.js:23-73`

**Evidence:**
- `localStorage.setItem('token', token);` and `localStorage.setItem('refreshToken', refreshToken);` in `Login.jsx`.
- `localStorage.setItem('token', urlToken);` and `localStorage.setItem('refreshToken', urlRefreshToken);` in `ProtectedRoute.jsx`.
- `localStorage.getItem('refresh_token')` and `localStorage.setItem('refresh_token', refresh_token);` in `axiosConfig.js`.

**Impact:** If an attacker achieves XSS, they can read `localStorage` and exfiltrate access/refresh tokens, leading to full account takeover.

**Fix:**
- Prefer **httpOnly, Secure cookies** for access/refresh tokens with CSRF protections if you must use cookies.
- Or keep access tokens **in memory only**, with short TTL, and use a secure refresh flow from the backend.

**Mitigation (defense‑in‑depth):**
- Deploy a strong CSP and avoid any dangerous DOM sinks.
- Rotate tokens frequently and bind refresh tokens to device/session.

**False positive notes:**
- This is a standard web‑app trade‑off. Risk severity depends on the likelihood of XSS and the sensitivity of the data.

---

## Medium Severity

### [M-1] OAuth tokens accepted from URL query parameters
**Rule ID:** REACT-AUTH-002

**Location:**
- `/Users/SAINT/Documents/botmon-v1.0/src/components/ProtectedRoute.jsx:12-38`

**Evidence:**
- `const urlToken = searchParams.get('token');` and storing the token to `localStorage`.
- URL is cleaned afterward with `window.history.replaceState`.

**Impact:** Tokens in query parameters can leak via browser history, logs, or referrer headers to third‑party resources that load before the URL is cleaned.

**Fix:**
- Use **OAuth Authorization Code + PKCE**, exchange code server‑side, and set tokens via httpOnly cookies.
- If you must pass tokens in the URL, prefer the **hash fragment** and immediately clear it before any third‑party requests load.

**Mitigation:**
- Ensure no third‑party scripts/resources load on the OAuth callback route before the URL is cleaned.

**False positive notes:**
- If the OAuth callback page is fully controlled and loads no third‑party resources, the risk is reduced but not eliminated.

---

## Low Severity

### [L-1] `window.open` without `noopener` / `noreferrer`
**Rule ID:** REACT-NAV-001

**Location:**
- `/Users/SAINT/Documents/botmon-v1.0/src/components/SupportPage.jsx:50-54`

**Evidence:**
- `window.open('https://wa.me/...', '_blank');`

**Impact:** Reverse‑tabnabbing: the opened page can access `window.opener` and navigate the original page.

**Fix:**
- Use `window.open(url, '_blank', 'noopener,noreferrer')` or set `newWindow.opener = null`.

**Mitigation:**
- Use regular links with `rel="noopener noreferrer"` when possible.

**False positive notes:**
- Risk applies when opening untrusted external pages.

---

### [L-2] `innerHTML` usage in test HTML file
**Rule ID:** JS-XSS-001

**Location:**
- `/Users/SAINT/Documents/botmon-v1.0/src/components/test.html:803-806`
- `/Users/SAINT/Documents/botmon-v1.0/src/components/test.html:996-1000`

**Evidence:**
- `gridContainer.innerHTML = '';`
- `foundWordsContainer.innerHTML = '';`

**Impact:** If this file is ever shipped to production and untrusted data is inserted, it could enable DOM‑XSS. Current usage clears the container only (low risk).

**Fix:**
- Prefer DOM APIs (`textContent`, `removeChild`) or ensure this file is not shipped/served in production.

**Mitigation:**
- Keep test/demo files out of the production build.

**False positive notes:**
- If `test.html` is not part of the deployed app, this is informational only.

---

## Informational

### [I-1] CSP / security headers not visible in repo
**Rule ID:** REACT-BASELINE-001

**Location:**
- `/Users/SAINT/Documents/botmon-v1.0/index.html` (no CSP meta tag)

**Evidence:**
- The HTML entrypoint lacks a `Content-Security-Policy` meta tag. No CSP config found in repo.

**Impact:** Missing defense‑in‑depth against XSS and clickjacking (if not configured at the edge).

**Fix:**
- Configure CSP (and other security headers) at the **server/edge** layer. If you cannot set headers, add a CSP meta tag early in `index.html`.

**False positive notes:**
- CSP might be set by your CDN or reverse proxy. Verify at runtime via response headers.

---

## Notes
- I did **not** find `dangerouslySetInnerHTML`, `eval`, `new Function`, or `document.write` in the React codebase.
- Most navigation is internal and appears safe; external navigation is limited to OAuth and support links.


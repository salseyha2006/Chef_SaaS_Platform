const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Access token ក្នុង memory ប៉ុណ្ណោះ (មិនដាក់ localStorage)
let accessToken = null;
let onAuthFailure = () => {};
let refreshPromise = null;

export const setAccessToken = (t) => { accessToken = t; };
export const getAccessToken = () => accessToken;
export const setAuthFailureHandler = (fn) => { onAuthFailure = fn; };

export class ApiError extends Error {
  constructor({ status, code, message, params, errors }) {
    super(message);
    this.status = status;
    this.code = code;
    this.params = params;
    this.errors = errors;
  }
}

/** ទាញ Token ថ្មី (single-flight: Request ច្រើនរង់ចាំ Promise តែមួយ) */
async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('refresh failed');
        const json = await res.json();
        accessToken = json.data.accessToken;
        return accessToken;
      })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

function buildInit({ method = 'GET', body, headers = {} }) {
  const isForm = body instanceof FormData;
  return {
    method,
    credentials: 'include',
    headers: {
      ...(isForm || body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  };
}

async function toApiError(res) {
  let json = {};
  try { json = await res.json(); } catch { /* non-JSON */ }
  return new ApiError({
    status: res.status,
    code: json.code || 'INTERNAL_ERROR',
    message: json.message || res.statusText,
    params: json.params,
    errors: json.errors,
  });
}

async function send(path, opts, canRetry = true) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, buildInit(opts));
  } catch {
    throw new ApiError({ status: 0, code: 'NETWORK_ERROR', message: 'Network error' });
  }

  if (res.status === 401 && canRetry) {
    const err = await toApiError(res.clone());
    if (err.code === 'AUTH_ACCESS_TOKEN_EXPIRED') {
      try {
        await refreshAccessToken();
        return send(path, opts, false);
      } catch {
        accessToken = null;
        onAuthFailure();
        throw err;
      }
    }
  }

  if (!res.ok) {
    const err = await toApiError(res);
    if (err.status === 403 && ['SUBSCRIPTION_EXPIRED', 'SUBSCRIPTION_NOT_FOUND'].includes(err.code)) {
      window.dispatchEvent(new CustomEvent('subscription:required', { detail: err }));
    }
    throw err;
  }
  return res;
}

async function request(path, opts) {
  const res = await send(path, opts);
  const json = await res.json();
  return json.data; // unwrap envelope
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};

/** Binary (PDF/Excel/invoice): មិន unwrap JSON */
export async function downloadBlob(path, filename, opts = {}) {
  const res = await send(path, { method: 'GET', ...opts });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

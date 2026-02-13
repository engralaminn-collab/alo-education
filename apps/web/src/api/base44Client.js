import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, serverUrl, token, functionsVersion } = appParams;
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const authLoginUrl = import.meta.env.VITE_AUTH_LOGIN_URL;

const shouldDisableBase44 =
  import.meta.env.VITE_DISABLE_BASE44 === 'true' ||
  serverUrl?.includes('app.base44.com');

const buildUrl = (path, params = {}) => {
  const base = apiBaseUrl || '';
  const url = new URL(path, base || window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
};

const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return (
    window.localStorage.getItem('token') ||
    window.localStorage.getItem('base44_access_token')
  );
};

const requestJson = async (path, options = {}) => {
  const authToken = getAuthToken();
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!response.ok) {
    const error = new Error(`Request failed: ${response.status}`);
    error.status = response.status;
    throw error;
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
};

const createApiEntity = (entityName) => ({
  list: async (sort, limit) => {
    try {
      return await requestJson(
        buildUrl(`/api/${entityName}`, { sort, limit })
      );
    } catch {
      return [];
    }
  },
  filter: async (filters = {}, sort, limit) => {
    try {
      return await requestJson(
        buildUrl(`/api/${entityName}`, { ...filters, sort, limit })
      );
    } catch {
      return [];
    }
  },
  create: async (data) =>
    requestJson(buildUrl(`/api/${entityName}`), {
      method: 'POST',
      body: JSON.stringify(data ?? {}),
    }),
  update: async (id, data) =>
    requestJson(buildUrl(`/api/${entityName}/${id}`), {
      method: 'PUT',
      body: JSON.stringify(data ?? {}),
    }),
  delete: async (id) =>
    requestJson(buildUrl(`/api/${entityName}/${id}`), {
      method: 'DELETE',
    }),
});

const createApiClient = () => ({
  auth: {
    me: async () => {
      try {
        return await requestJson(buildUrl('/api/auth/me'));
      } catch {
        return null;
      }
    },
    logout: async (redirectUrl) => {
      try {
        await requestJson(buildUrl('/api/auth/logout'), { method: 'POST' });
      } catch {
        // ignore logout errors
      }
      if (redirectUrl && typeof window !== 'undefined') {
        window.location.href = redirectUrl;
      }
    },
    redirectToLogin: (redirectUrl) => {
      if (typeof window === 'undefined') return;
      const destination = authLoginUrl || '/login';
      const loginUrl = new URL(destination, window.location.origin);
      if (redirectUrl) {
        loginUrl.searchParams.set('redirect', redirectUrl);
      }
      window.location.href = loginUrl.toString();
    },
  },
  appLogs: {
    logUserInApp: async (pageName) => {
      try {
        await requestJson(buildUrl('/api/app-logs'), {
          method: 'POST',
          body: JSON.stringify({ page: pageName }),
        });
      } catch {
        // ignore logging errors
      }
    },
  },
  integrations: {
    Core: {
      InvokeLLM: async (payload) =>
        requestJson(buildUrl('/api/ai/invoke'), {
          method: 'POST',
          body: JSON.stringify(payload ?? {}),
        }),
      SendEmail: async (payload) =>
        requestJson(buildUrl('/api/email/send'), {
          method: 'POST',
          body: JSON.stringify(payload ?? {}),
        }),
    },
  },
  entities: new Proxy(
    {},
    {
      get: (_target, prop) => createApiEntity(String(prop)),
    }
  ),
});

//Create a client with authentication required
export const base44 = shouldDisableBase44
  ? createApiClient()
  : createClient({
      appId,
      serverUrl,
      token,
      functionsVersion,
      requiresAuth: false,
    });

import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const debugApiRequests = process.env.NEXT_PUBLIC_DATABRICKS_DEBUG === "true";

function getRequestUrl(config = {}) {
  try {
    if (typeof window === "undefined") {
      return config.url;
    }

    const configuredBaseUrl = config.baseURL ?? "";
    const baseUrl = new URL(
      configuredBaseUrl.endsWith("/") ? configuredBaseUrl : `${configuredBaseUrl}/`,
      window.location.origin
    );
    return new URL(config.url ?? "", baseUrl).toString();
  } catch {
    return config.url ?? "unknown";
  }
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const DASHBOARD_URL = `${API_BASE_URL}/ui/dashboard`;
export const WORKBENCH_URL = `${API_BASE_URL}/ui/workbench`;
export const PROMISE_TO_PAY_URL = `${API_BASE_URL}/ui/promise-to-pay?status=all&limit=500`;
export const ACCOUNT_URL = `${API_BASE_URL}/ui/account360/32342`;
export const COPILOT_CHAT_URL = `${API_BASE_URL}/v1/copilot/chat`;
export const LOGIN_URL = `${API_BASE_URL}/auth/login`;
export const REGISTER_URL = `${API_BASE_URL}/auth/register`;
export const AGENT_STATUS_URL = `${API_BASE_URL}/agent-status`;
export const NOTIFICATION_URL = `${API_BASE_URL}/notification`;

const dashboardRequests = new Map();
let workbenchRequest;
const promiseToPayRequests = new Map();
let accountRequest;
let agentStatusRequest;
let notificationsRequest;
let agentStatusCache;
let notificationsCache;
const LIVE_STATUS_CACHE_TTL_MS = 15000;
const NOTIFICATION_CACHE_TTL_MS = 15000;

axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const isAuthenticationRequest = config.url?.startsWith("auth/");
      const storedToken = localStorage.getItem("access_token");
      const token = ["", "null", "undefined"].includes(storedToken)
        ? null
        : storedToken;

      if (!token && storedToken) {
        localStorage.removeItem("access_token");
      }

      if (isAuthenticationRequest) {
        delete config.headers.Authorization;
      }

      if (debugApiRequests) {
        console.debug("[Databricks API] Request", {
          method: config.method?.toUpperCase(),
          url: getRequestUrl(config),
          hasAccessToken: Boolean(token) && !isAuthenticationRequest,
        });
      }

      if (token && !isAuthenticationRequest) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (debugApiRequests && typeof window !== "undefined") {
      console.error("[Databricks API] Request failed", {
        method: error.config?.method?.toUpperCase(),
        url: getRequestUrl(error.config ?? {}),
        status: error.response?.status,
        statusText: error.response?.statusText,
      });
    }

    return Promise.reject(error);
  }
);
export async function getAgentStatus() {
  const now = Date.now();

  if (
    agentStatusCache &&
    now - agentStatusCache.fetchedAt < LIVE_STATUS_CACHE_TTL_MS
  ) {
    return agentStatusCache.data;
  }

  if (!agentStatusRequest) {
    agentStatusRequest = axiosInstance
      .get("agent-status")
      .then((response) => {
        agentStatusCache = {
          data: response.data,
          fetchedAt: Date.now(),
        };

        return response.data;
      })
      .finally(() => {
        agentStatusRequest = undefined;
      });
  }

  return agentStatusRequest;
}
export async function getNotifications() {
  const now = Date.now();

  if (
    notificationsCache &&
    now - notificationsCache.fetchedAt < NOTIFICATION_CACHE_TTL_MS
  ) {
    return notificationsCache.data;
  }

  if (!notificationsRequest) {
    notificationsRequest = axiosInstance
      .get("notification")
      .then((response) => {
        notificationsCache = {
          data: response.data,
          fetchedAt: Date.now(),
        };

        return response.data;
      })
      .finally(() => {
        notificationsRequest = undefined;
      });
  }

  return notificationsRequest;
}

export async function loginUser(email, password) {
  const response = await axiosInstance.post("auth/login", {
  email,
  password,
  });

  return response.data;
  }
export async function registerUser(
email,
name
) {
const response = await axiosInstance.post("auth/register", {
email,
name,
});
return response.data;
}

function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams.set(key, String(value));
  });

  return searchParams.toString();
}

export async function getDashboard(params = {}, options = {}) {
  const queryString = buildQueryString(params);
  const cacheKey = queryString || "__default__";

  if (options.force) {
    dashboardRequests.delete(cacheKey);
  }

  if (!dashboardRequests.has(cacheKey)) {
    const request = axiosInstance
      .get(queryString ? `ui/dashboard?${queryString}` : "ui/dashboard")
      .then((response) => response.data)
      .catch((error) => {
        dashboardRequests.delete(cacheKey);
        throw error;
      });

    dashboardRequests.set(cacheKey, request);
  }

  return dashboardRequests.get(cacheKey);
}

export async function getWorkbench({ force = false } = {}) {
  if (force) {
    workbenchRequest = undefined;
  }

  if (!workbenchRequest) {
    workbenchRequest = axiosInstance
      .get("ui/workbench")
      .then((response) => response.data)
      .catch((error) => {
        workbenchRequest = undefined;
        throw error;
      });
  }

  return workbenchRequest;
}

// GET /ui/promise-to-pay — month: YYYY-MM | "all" (omit = latest completed month),
// status: all|active|partial|broken|fulfilled, search: customer name, limit: 1-1000.
export async function getPromiseToPay({ limit = 1000, month, status = "all", search, force = false } = {}) {
  const query = { status, limit };
  if (month) query.month = month;
  if (search) query.search = search;
  const cacheKey = JSON.stringify(query);

  if (force) {
    promiseToPayRequests.delete(cacheKey);
  }

  if (!promiseToPayRequests.has(cacheKey)) {
    const request = axiosInstance
      .get(`ui/promise-to-pay?${buildQueryString(query)}`)
      .then((response) => response.data)
      .catch((error) => {
        promiseToPayRequests.delete(cacheKey);
        throw error;
      });

    promiseToPayRequests.set(cacheKey, request);
  }

  return promiseToPayRequests.get(cacheKey);
}

// GET /ui/ptp-analytics — KPI cards, PTP trend, status distribution, aging,
// fulfillment-rate trend and top collectors for the Promise to Pay page.
export async function getPtpAnalytics({ months = 6, collector = "all", month, top = 5 } = {}) {
  const params = { months, collector_name: collector || "all", top };
  if (month && month !== "all") params.month = month;
  const response = await axiosInstance.get("ui/ptp-analytics", { params });
  return response.data;
}

// GET /ui/collectors — collector names for the owner filter.
export async function getCollectors() {
  const response = await axiosInstance.get("ui/collectors");
  return response.data;
}

// export async function getAccount() {
//   if (!accountRequest) {
//     accountRequest = axiosInstance
//       .get(`ui/account360/32342`)
//       .then((response) => response.data)
//       .catch((error) => {
//         accountRequest = undefined;
//         throw error;
//       });
//   }

//   return accountRequest;
// }

// Account 360. The backend paginates transactions (page/page_size, max 100) and
// PTP history (ptp_page/ptp_page_size, max 100); request the largest pages so the
// tabs can search, filter and paginate on the client.
export async function getAccount(customerId = "32342", params = {}) {
  const response = await axiosInstance.get(`ui/account360/${encodeURIComponent(customerId)}`, {
    params: { page: 1, page_size: 100, ptp_page: 1, ptp_page_size: 100, ...params },
  });

  return response.data;
}

// Add Note
export async function addNote(payload) {
  const response = await axiosInstance.post("ui/notes", payload);
  return response.data;
}

// Edit Note
export async function updateNote(noteId, payload) {
  const response = await axiosInstance.put(`ui/notes/${noteId}`, payload);
  return response.data;
}

// Delete Note
export async function deleteNote(noteId) {
  const response = await axiosInstance.delete(`ui/notes/${noteId}`);
  return response.data;
}
// export async function sendCopilotMessage(message, userId, userName) {
//   const response = await axiosInstance.post("v1/copilot/chat", {
//     userId,
//     userName,
//     message,
//     timestamp: new Date().toISOString(),
//   });

//   return response.data;
// }

export default axiosInstance;
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const debugApiRequests = process.env.NEXT_PUBLIC_DATABRICKS_DEBUG === "true";

function getRequestUrl(config) {
  if (typeof window === "undefined") {
    return config.url;
  }

  const configuredBaseUrl = config.baseURL ?? "";
  const baseUrl = new URL(
    configuredBaseUrl.endsWith("/") ? configuredBaseUrl : `${configuredBaseUrl}/`,
    window.location.origin
  );
  return new URL(config.url ?? "", baseUrl).toString();
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

let dashboardRequest;
let workbenchRequest;
let promiseToPayRequest;
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

export async function getDashboard() {
  if (!dashboardRequest) {
    dashboardRequest = axiosInstance
      .get("ui/dashboard")
      .then((response) => response.data)
      .catch((error) => {
        dashboardRequest = undefined;
        throw error;
      });
  }

  return dashboardRequest;
}

export async function getWorkbench() {
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

export async function getPromiseToPay() {
  if (!promiseToPayRequest) {
    promiseToPayRequest = axiosInstance
      .get("ui/promise-to-pay?status=all&limit=500")
      .then((response) => response.data)
      .catch((error) => {
        promiseToPayRequest = undefined;
        throw error;
      });
  }

  return promiseToPayRequest;
}

export async function getAccount() {
  if (!accountRequest) {
    accountRequest = axiosInstance
      .get("ui/account360/32342")
      .then((response) => response.data)
      .catch((error) => {
        accountRequest = undefined;
        throw error;
      });
  }

  return accountRequest;
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
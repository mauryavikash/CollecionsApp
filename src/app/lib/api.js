import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
console.log("API_BASE_URL:", process.env.NEXT_PUBLIC_API_BASE_URL);
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

console.log(
"API_BASE_URL",
process.env.NEXT_PUBLIC_API_BASE_URL
);

export const HOME_DASHBOARD_URL = `${API_BASE_URL}/home`;
export const CASES_URL = `${API_BASE_URL}/cases`;
export const RECOVERIES_URL = `${API_BASE_URL}/recoveries`;
export const AUDIT_URL = `${API_BASE_URL}/audit`;
export const VENDORS_URL = `${API_BASE_URL}/vendors`;
export const COPILOT_CHAT_URL = `${API_BASE_URL}/v1/copilot/chat`;
export const LOGIN_URL = `${API_BASE_URL}/auth/login`;
export const REGISTER_URL = `${API_BASE_URL}/auth/register`;
export const AGENT_STATUS_URL = `${API_BASE_URL}/agent-status`;
export const NOTIFICATION_URL = `${API_BASE_URL}/notification`;

let homeDashboardRequest;
let casesRequest;
let recoveriesRequest;
let auditRequest;
let vendorsRequest;

axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");

      console.log("TOKEN =", token);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);
// axiosInstance.interceptors.request.use(
//   (config) => {
//     if (typeof window !== "undefined") {
//       const token = localStorage.getItem("access_token");

//       console.log("TOKEN =", token);

//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );


export async function getAgentStatus() {
const response = await axiosInstance.get("/agent-status");
return response.data;
}
export async function getNotifications() {
const response = await axiosInstance.get("/notification");
return response.data;
}

export async function loginUser(email, password) {
  const response = await axiosInstance.post("/auth/login", {
  email,
  password,
  });

  return response.data;
  }

export async function registerUser(
email,
password,
confirm_password
) {
const response = await axiosInstance.post("/auth/register", {
email,
password,
confirm_password,
});
return response.data;
}

// homeDashboardRequest = axiosInstance
// .get(HOME_DASHBOARD_URL)

export async function getHomeDashboard() {
  if (!homeDashboardRequest) {
    homeDashboardRequest = axiosInstance
      .get(HOME_DASHBOARD_URL)
      .then((response) => response.data)
      .catch((error) => {
        homeDashboardRequest = undefined;
        throw error;
      });
  }

  return homeDashboardRequest;
}

export async function getCases() {
  if (!casesRequest) {
    casesRequest = axiosInstance
      .get(CASES_URL)
      .then((response) => response.data)
      .catch((error) => {
        casesRequest = undefined;
        throw error;
      });
  }

  return casesRequest;
}

export async function submitCaseAction(payload) {
  const response = await axiosInstance.post(
    "/case-action",
    payload
  );

  return response.data;
}


export async function getRecoveries() {
  if (!recoveriesRequest) {
    recoveriesRequest = axiosInstance
      .get(RECOVERIES_URL)
      .then((response) => response.data)
      .catch((error) => {
        recoveriesRequest = undefined;
        throw error;
      });
  }

  return recoveriesRequest;
}

export async function getAudit() {
  if (!auditRequest) {
    auditRequest = axiosInstance
      .get(AUDIT_URL)
      .then((response) => response.data)
      .catch((error) => {
        auditRequest = undefined;
        throw error;
      });
  }

  return auditRequest;
}

export async function getVendors() {
  if (!vendorsRequest) {
    vendorsRequest = axiosInstance
      .get(VENDORS_URL)
      .then((response) => response.data)
      .catch((error) => {
        vendorsRequest = undefined;
        throw error;
      });
  }

  return vendorsRequest;
}

export async function sendCopilotMessage(message, userId, userName) {
  const response = await axiosInstance.post(COPILOT_CHAT_URL, {
    userId,
    userName,
    message,
    timestamp: new Date().toISOString(),
  });

  return response.data;
}

export default axiosInstance;
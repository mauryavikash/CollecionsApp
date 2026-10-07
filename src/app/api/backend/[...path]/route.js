export const runtime = "nodejs";

function getAppApiBaseUrl() {
  const value = process.env.DATABRICKS_APP_API_BASE_URL;

  if (!value) {
    throw new Error("Missing required environment variable: DATABRICKS_APP_API_BASE_URL");
  }

  return value.replace(/\/$/, "");
}

function getRequiredEnvironment(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function getServicePrincipalToken() {
  const host = getRequiredEnvironment("DATABRICKS_HOST")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  const response = await fetch(`https://${host}/oidc/v1/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: getRequiredEnvironment("DATABRICKS_CLIENT_ID"),
      client_secret: getRequiredEnvironment("DATABRICKS_CLIENT_SECRET"),
      scope: "all-apis",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Databricks OAuth request failed with status ${response.status}`);
  }

  const { access_token: accessToken } = await response.json();

  if (!accessToken) {
    throw new Error("Databricks OAuth response did not include an access token");
  }

  return accessToken;
}

export async function GET(request, { params }) {
  return proxyRequest(request, params);
}

export async function POST(request, { params }) {
  return proxyRequest(request, params);
}

export async function PUT(request, { params }) {
  return proxyRequest(request, params);
}

export async function PATCH(request, { params }) {
  return proxyRequest(request, params);
}

export async function DELETE(request, { params }) {
  return proxyRequest(request, params);
}

async function proxyRequest(request, paramsPromise) {
  try {
    const { path } = await paramsPromise;
    const requestUrl = new URL(request.url);
    const targetUrl = new URL(`${getAppApiBaseUrl()}/${path.map(encodeURIComponent).join("/")}`);
    targetUrl.search = requestUrl.search;

    const headers = new Headers();
    const authorization = request.headers.get("authorization");
    const contentType = request.headers.get("content-type");

    headers.set(
      "authorization",
      authorization ?? `Bearer ${await getServicePrincipalToken()}`
    );

    if (contentType) {
      headers.set("content-type", contentType);
    }

    const body = ["GET", "HEAD"].includes(request.method)
      ? undefined
      : await request.arrayBuffer();
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });
    const responseHeaders = new Headers();
    const responseContentType = response.headers.get("content-type");

    if (responseContentType) {
      responseHeaders.set("content-type", responseContentType);
    }

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Databricks App API proxy failed", error);
    return Response.json(
      { error: "Unable to reach the Databricks App API" },
      { status: 502 }
    );
  }
}
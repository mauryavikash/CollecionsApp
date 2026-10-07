export const runtime = "nodejs";

function getRequiredEnvironment(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function getServicePrincipalToken(host, clientId, clientSecret) {
  const response = await fetch(`https://${host}/oidc/v1/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: "all-apis",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const { access_token: accessToken } = await response.json();
  return accessToken ?? null;
}

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return new Response(null, { status: 404 });
  }

  try {
    const host = getRequiredEnvironment("DATABRICKS_HOST").replace(/^https?:\/\//, "").replace(/\/$/, "");
    const clientId = getRequiredEnvironment("DATABRICKS_CLIENT_ID");
    const clientSecret = getRequiredEnvironment("DATABRICKS_CLIENT_SECRET");
    const apiBaseUrl = getRequiredEnvironment("DATABRICKS_APP_API_BASE_URL").replace(/\/$/, "");
    const accessToken = await getServicePrincipalToken(host, clientId, clientSecret);

    if (!accessToken) {
      return Response.json({ oauth: "failed" }, { status: 502 });
    }

    const [warehouseResponse, appApiResponse] = await Promise.all([
      fetch(`https://${host}/api/2.0/sql/warehouses`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      }),
      fetch(`${apiBaseUrl}/home`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      }),
    ]);

    return Response.json({
      oauth: "valid",
      warehouseApiStatus: warehouseResponse.status,
      deployedAppApiStatus: appApiResponse.status,
      deployedAppApiAuthorized: appApiResponse.ok,
    });
  } catch (error) {
    console.error("Databricks debug check failed", error);
    return Response.json({ error: "Databricks debug check failed" }, { status: 502 });
  }
}
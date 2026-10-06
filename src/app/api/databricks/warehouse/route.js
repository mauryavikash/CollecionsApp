export const runtime = "nodejs";

function getRequiredEnvironment(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getWarehouseId(httpPath) {
  const warehouseId = httpPath.split("/").filter(Boolean).at(-1);

  if (!warehouseId) {
    throw new Error("DATABRICKS_HTTP_PATH must include a warehouse ID");
  }

  return warehouseId;
}

async function getAccessToken(host, clientId, clientSecret) {
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
    throw new Error(`Databricks OAuth request failed with status ${response.status}`);
  }

  const { access_token: accessToken } = await response.json();

  if (!accessToken) {
    throw new Error("Databricks OAuth response did not include an access token");
  }

  return accessToken;
}

export async function GET() {
  try {
    const host = getRequiredEnvironment("DATABRICKS_HOST").replace(/^https?:\/\//, "").replace(/\/$/, "");
    const clientId = getRequiredEnvironment("DATABRICKS_CLIENT_ID");
    const clientSecret = getRequiredEnvironment("DATABRICKS_CLIENT_SECRET");
    const warehouseId = getWarehouseId(getRequiredEnvironment("DATABRICKS_HTTP_PATH"));
    const accessToken = await getAccessToken(host, clientId, clientSecret);
    const response = await fetch(
      `https://${host}/api/2.0/sql/warehouses/${encodeURIComponent(warehouseId)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return Response.json(
        { error: "Databricks warehouse access was denied" },
        { status: response.status }
      );
    }

    const warehouse = await response.json();

    return Response.json({
      connected: true,
      warehouse: {
        id: warehouse.id,
        name: warehouse.name,
        state: warehouse.state,
      },
    });
  } catch (error) {
    console.error("Databricks warehouse connection failed", error);

    return Response.json(
      { error: "Unable to connect to Databricks" },
      { status: 502 }
    );
  }
}
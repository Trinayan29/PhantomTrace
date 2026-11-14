import { cookies } from "next/headers";

export async function POST(request: Request) {
  const token = (await cookies()).get("access_token")?.value;

  if (!token) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const api = process.env.DJANGO_API_URL || "http://127.0.0.1:8000";

    const upstream = await fetch(`${api}/api/v1/risk-analysis/evaluate/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await upstream.json().catch(() => ({
      error: "Invalid response from risk analysis service",
    }));

    return Response.json(data, { status: upstream.status });
  } catch {
    return Response.json(
      { error: "Could not connect to the risk analysis service" },
      { status: 502 }
    );
  }
}

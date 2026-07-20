import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "url query param required" }, { status: 400 });
  }

  try {
    // Only allow HTTP for agent health checks
    const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(5000) });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json({ ok: res.ok, status: res.status, data });
  } catch {
    return NextResponse.json({ ok: false, status: 0, error: "Connection failed" });
  }
}

import { zoomFetch } from "@/lib/zoom-api";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { session_name, session_password } = await req.json();

  if (!session_name) {
    return NextResponse.json({ error: "session_name is required" }, { status: 400 });
  }

  const res = await zoomFetch("/videosdk/sessions", {
    method: "POST",
    body: JSON.stringify({
      session_name,
      ...(session_password ? { session_password } : {}),
      settings: { auto_recording: "none" },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: data }, { status: res.status });
  }

  return NextResponse.json(data);
}

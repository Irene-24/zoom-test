import { zoomFetch } from "@/lib/zoom-api";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const res = await zoomFetch("/videosdk/recordings?page_size=30");

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: data }, { status: res.status });
  }

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const recordingId = searchParams.get("recordingId");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const path = recordingId
    ? `/videosdk/sessions/${sessionId}/recordings/${recordingId}?action=delete`
    : `/videosdk/sessions/${sessionId}/recordings?action=delete`;

  const res = await zoomFetch(path, { method: "DELETE" });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return NextResponse.json({ error: data }, { status: res.status });
  }

  return NextResponse.json({ success: true });
}

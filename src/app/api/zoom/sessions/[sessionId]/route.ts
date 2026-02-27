import { zoomFetch } from "@/lib/zoom-api";
import { NextResponse } from "next/server";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const res = await zoomFetch(`/videosdk/sessions/${sessionId}`, { method: "DELETE" });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return NextResponse.json({ error: data }, { status: res.status });
  }

  return NextResponse.json({ success: true });
}

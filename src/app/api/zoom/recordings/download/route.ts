import { generateApiJwt } from "@/lib/zoom-api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const downloadUrl = searchParams.get("url");
  const filename = searchParams.get("filename") ?? "recording";

  if (!downloadUrl) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  const fileRes = await fetch(downloadUrl, {
    headers: { Authorization: `Bearer ${generateApiJwt()}` },
  });

  if (!fileRes.ok) {
    return NextResponse.json(
      { error: "Failed to fetch recording" },
      { status: fileRes.status }
    );
  }

  const contentType =
    fileRes.headers.get("content-type") ?? "application/octet-stream";
  const body = await fileRes.arrayBuffer();

  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

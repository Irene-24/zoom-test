import { createHmac } from "crypto";
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

const WEBHOOK_LOG = join(process.cwd(), "webhook-events.json");

function appendEvent(event: unknown) {
  let events: unknown[] = [];
  if (existsSync(WEBHOOK_LOG)) {
    try {
      events = JSON.parse(readFileSync(WEBHOOK_LOG, "utf8"));
    } catch {
      events = [];
    }
  }
  events.push(event);
  writeFileSync(WEBHOOK_LOG, JSON.stringify(events, null, 2));
}

export async function POST(req: NextRequest) {
  const secret = process.env.ZOOM_SECRET_TOKEN;
  if (!secret) {
    return NextResponse.json({ error: "ZOOM_SECRET_TOKEN not set" }, { status: 500 });
  }

  const rawBody = await req.text();
  const body = JSON.parse(rawBody);

  // Zoom URL validation handshake
  if (body.event === "endpoint.url_validation") {
    const encryptedToken = createHmac("sha256", secret)
      .update(body.payload.plainToken)
      .digest("hex");
    return NextResponse.json({
      plainToken: body.payload.plainToken,
      encryptedToken,
    });
  }

  // Verify signature on all other events
  const timestamp = req.headers.get("x-zm-request-timestamp") ?? "";
  const signature = req.headers.get("x-zm-signature") ?? "";
  const expected = "v0=" + createHmac("sha256", secret)
    .update(`v0:${timestamp}:${rawBody}`)
    .digest("hex");

  if (expected !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Append all other events to file
  appendEvent({ receivedAt: new Date().toISOString(), ...body });

  return NextResponse.json({ ok: true });
}

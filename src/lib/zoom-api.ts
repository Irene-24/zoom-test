import "server-only";
import { KJUR } from "jsrsasign";

export function generateApiJwt(): string {
  if (!process.env.ZOOM_API_KEY || !process.env.ZOOM_API_SECRET) {
    throw new Error("Missing ZOOM_API_KEY or ZOOM_API_SECRET");
  }
  const iat = Math.round(new Date().getTime() / 1000) - 30;
  const exp = iat + 60 * 60; // 1 hour
  const oHeader = { alg: "HS256", typ: "JWT" };
  const oPayload = {
    iss: process.env.ZOOM_API_KEY,
    iat,
    exp,
  };
  return KJUR.jws.JWS.sign(
    "HS256",
    JSON.stringify(oHeader),
    JSON.stringify(oPayload),
    process.env.ZOOM_API_SECRET,
  );
}

export async function zoomFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const jwt = generateApiJwt();

  return fetch(`https://api.zoom.us/v2${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
      ...options.headers,
    },
  });
}

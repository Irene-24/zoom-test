import "server-only";
import { KJUR } from "jsrsasign";

export async function getData(slug: string, userKey: string, role: number) {
  const JWT = generateSignature(slug, role, userKey);
  return JWT;
}

function generateSignature(sessionName: string, role: number, userKey: string) {
  if (!process.env.ZOOM_SDK_KEY || !process.env.ZOOM_SDK_SECRET) {
    throw new Error("Missing ZOOM_SDK_KEY or ZOOM_SDK_SECRET");
  }
  const iat = Math.round(new Date().getTime() / 1000) - 30;
  const exp = iat + 60 * 60 * 2;
  const oHeader = { alg: "HS256", typ: "JWT" };
  const sdkKey = process.env.ZOOM_SDK_KEY;
  const sdkSecret = process.env.ZOOM_SDK_SECRET;
  const oPayload = {
    app_key: sdkKey,
    tpc: sessionName,
    role_type: role, // 1 for host, 0 for attendee
    version: 1,
    iat: iat,
    exp: exp,

    user_key: userKey,
  };

  const sHeader = JSON.stringify(oHeader);
  const sPayload = JSON.stringify(oPayload);
  const sdkJWT = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, sdkSecret);
  return sdkJWT;
}

import { NextResponse, type NextRequest } from "next/server";

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);
const SECURITY_HEADERS = [
  ["Content-Security-Policy", "upgrade-insecure-requests"],
  ["Permissions-Policy", "camera=(), geolocation=(), microphone=()"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ["X-Content-Type-Options", "nosniff"]
] as const;
const HSTS_HEADER = "max-age=31536000; includeSubDomains";

function isLocalHostname(hostname: string) {
  return LOCAL_HOSTNAMES.has(hostname) || hostname.endsWith(".local");
}

function getRequestProtocol(request: NextRequest) {
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (forwardedProto) {
    return forwardedProto.split(",")[0]?.trim() ?? "http";
  }

  return request.nextUrl.protocol.replace(":", "");
}

function applySecurityHeaders(response: NextResponse, isSecureRequest: boolean) {
  for (const [key, value] of SECURITY_HEADERS) {
    response.headers.set(key, value);
  }

  if (isSecureRequest) {
    response.headers.set("Strict-Transport-Security", HSTS_HEADER);
  }

  return response;
}

export function proxy(request: NextRequest) {
  const protocol = getRequestProtocol(request);
  const isSecureRequest = protocol === "https";
  const hostname = request.nextUrl.hostname;

  if (!isLocalHostname(hostname) && !isSecureRequest) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.protocol = "https";

    return applySecurityHeaders(NextResponse.redirect(redirectUrl, 308), false);
  }

  return applySecurityHeaders(NextResponse.next(), isSecureRequest);
}

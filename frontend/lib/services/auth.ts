import { SignJWT, jwtVerify } from "jose";
import type { User, UserRole } from "@/types";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "campuschain-dev-secret-change-in-production"
);

export interface JWTPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  walletAddress: string;
  iat: number;
  exp: number;
}

export async function createToken(user: User): Promise<string> {
  return new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
    walletAddress: user.metadata.walletAddress,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload as unknown as JWTPayload;
}

export function getTokenFromRequest(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7);
  }
  // Also check cookies
  const cookies = request.headers.get("cookie") || "";
  const match = cookies.match(/token=([^;]+)/);
  return match ? match[1] : null;
}

export async function authenticateRequest(
  request: Request
): Promise<JWTPayload | null> {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export async function requireAuth(
  request: Request,
  allowedRoles?: UserRole[]
): Promise<JWTPayload> {
  const payload = await authenticateRequest(request);
  if (!payload) {
    throw new Error("Unauthorized");
  }
  if (allowedRoles && !allowedRoles.includes(payload.role)) {
    throw new Error("Forbidden");
  }
  return payload;
}

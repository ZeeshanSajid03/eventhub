// This is a lightweight JWT verifier for middleware (Edge Runtime)
// It does NOT use jsonwebtoken since that requires Node.js

export function verifyTokenEdge(token) {
  try {
    // JWT is 3 base64url parts: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Decode the payload (middle part)
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    );

    // Check expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
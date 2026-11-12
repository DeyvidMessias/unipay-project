import jwt from "jsonwebtoken";
import { HttpError } from "./http.js";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must contain at least 32 characters.");
}

export function createToken(userId) {
  return jwt.sign({ sub: String(userId) }, jwtSecret, { expiresIn: "8h" });
}

export function requireAuth(request, _response, next) {
  const authorization = request.get("authorization") ?? "";
  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(new HttpError(401, "Faça login para continuar."));
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    request.userId = Number(payload.sub);
    return next();
  } catch {
    return next(new HttpError(401, "Sua sessão expirou. Entre novamente."));
  }
}

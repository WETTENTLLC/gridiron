import type { CookieOptions } from "hono/utils/cookie";

import { env } from "../lib/env";

export function getSessionCookieOptions(_headers: Headers): CookieOptions {
  const secure = env.isProduction;
  return {
    httpOnly: true,
    path: "/",
    sameSite: secure ? "None" : "Lax",
    secure,
    domain: secure ? undefined : undefined,
  };
}

import { z } from "zod";
import * as cookie from "cookie";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { signup, login, SESSION_COOKIE, SESSION_MAX_AGE } from "./auth";
import { env } from "./lib/env";

function sessionCookieOpts() {
  const secure = env.isProduction;
  return {
    httpOnly: true,
    path: "/",
    sameSite: secure ? ("None" as const) : ("Lax" as const),
    secure,
    maxAge: SESSION_MAX_AGE,
  };
}

export const authRouter = createRouter({
  me: authedQuery.query((opts) => {
    const { passwordHash, ...user } = opts.ctx.user;
    return user;
  }),

  signup: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8, "Password must be at least 8 characters"),
        name: z.string().min(1).max(255).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { user, token } = await signup(
        input.email,
        input.password,
        input.name,
      );

      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(SESSION_COOKIE, token, sessionCookieOpts()),
      );

      const { passwordHash, ...safeUser } = user;
      return safeUser;
    }),

  login: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { user, token } = await login(input.email, input.password);

      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(SESSION_COOKIE, token, sessionCookieOpts()),
      );

      const { passwordHash, ...safeUser } = user;
      return safeUser;
    }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(SESSION_COOKIE, "", {
        httpOnly: true,
        path: "/",
        sameSite: env.isProduction ? "None" : "Lax",
        secure: env.isProduction,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
});

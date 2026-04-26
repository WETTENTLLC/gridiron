import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { waitlist } from "@db/schema";
import { desc } from "drizzle-orm";

export const waitlistRouter = createRouter({
  join: publicQuery
    .input(z.object({
      email: z.string().email(),
      source: z.string().max(100).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      try {
        await db.insert(waitlist).values({
          email: input.email,
          source: input.source ?? "website",
        });
        return { success: true };
      } catch {
        // Duplicate email — still return success (don't leak info)
        return { success: true };
      }
    }),

  list: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(waitlist).orderBy(desc(waitlist.createdAt));
  }),

  count: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db.select().from(waitlist);
    return { count: rows.length };
  }),
});

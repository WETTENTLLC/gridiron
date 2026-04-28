import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  decimal,
  boolean,
  json,
  bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin", "analyst"]).default("user").notNull(),
  subscriptionTier: mysqlEnum("subscription_tier", ["free", "pro", "analyst"]).default("free").notNull(),
  paypalSubscriberId: varchar("paypal_subscriber_id", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const teams = mysqlTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  abbreviation: varchar("abbreviation", { length: 10 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  conference: mysqlEnum("conference", ["AFC", "NFC"]).notNull(),
  division: mysqlEnum("division", ["North", "South", "East", "West"]).notNull(),
  primaryColor: varchar("primary_color", { length: 20 }).default("#000000"),
  secondaryColor: varchar("secondary_color", { length: 20 }).default("#FFFFFF"),
  logoUrl: text("logo_url"),
  passOffenseRank: int("pass_offense_rank").default(16),
  runOffenseRank: int("run_offense_rank").default(16),
  passDefenseRank: int("pass_defense_rank").default(16),
  runDefenseRank: int("run_defense_rank").default(16),
  schemeComplexity: int("scheme_complexity").default(50),
  qbVolatility: int("qb_volatility").default(50),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Team = typeof teams.$inferSelect;

export const games = mysqlTable("games", {
  id: serial("id").primaryKey(),
  externalId: varchar("external_id", { length: 100 }).unique(),
  week: int("week").notNull(),
  season: int("season").notNull(),
  homeTeamId: bigint("home_team_id", { mode: "number", unsigned: true }).notNull(),
  awayTeamId: bigint("away_team_id", { mode: "number", unsigned: true }).notNull(),
  gameDate: timestamp("game_date").notNull(),
  status: mysqlEnum("status", ["scheduled", "live", "halftime", "final", "postponed"]).default("scheduled").notNull(),
  homeScore: int("home_score"),
  awayScore: int("away_score"),
  spread: decimal("spread", { precision: 5, scale: 2 }),
  total: decimal("total", { precision: 5, scale: 2 }),
  weatherTemp: int("weather_temp"),
  weatherWind: int("weather_wind"),
  weatherPrecip: int("weather_precip"),
  venue: varchar("venue", { length: 200 }),
  primetime: boolean("primetime").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Game = typeof games.$inferSelect;

export const predictions = mysqlTable("predictions", {
  id: serial("id").primaryKey(),
  gameId: bigint("game_id", { mode: "number", unsigned: true }).notNull(),
  predictedHomeScore: decimal("predicted_home_score", { precision: 5, scale: 2 }),
  predictedAwayScore: decimal("predicted_away_score", { precision: 5, scale: 2 }),
  confidenceScore: int("confidence_score").default(50),
  chaosScore: int("chaos_score").default(50),
  predictabilityIndex: int("predictability_index").default(50),
  homeWinProbability: decimal("home_win_probability", { precision: 5, scale: 2 }),
  awayWinProbability: decimal("away_win_probability", { precision: 5, scale: 2 }),
  passGameAdvantage: int("pass_game_advantage").default(0),
  runGameAdvantage: int("run_game_advantage").default(0),
  schemeMismatchScore: int("scheme_mismatch_score").default(0),
  lineMovementSignal: mysqlEnum("line_movement_signal", ["sharp_home", "sharp_away", "public_home", "public_away", "neutral", "contrarian"]).default("neutral"),
  sharpMoneyPercent: int("sharp_money_percent").default(50),
  publicBettingPercent: int("public_betting_percent").default(50),
  analystConsensus: int("analyst_consensus").default(50),
  varianceFactors: json("variance_factors"),
  schemeFactors: json("scheme_factors"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  modelVersion: varchar("model_version", { length: 50 }).default("v1.0"),
});

export type Prediction = typeof predictions.$inferSelect;

export const narratives = mysqlTable("narratives", {
  id: serial("id").primaryKey(),
  gameId: bigint("game_id", { mode: "number", unsigned: true }).notNull(),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  narrativeType: mysqlEnum("narrative_type", ["pregame", "live", "postgame", "breakdown"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  scriptOutline: json("script_outline"),
  keyTalkingPoints: json("key_talking_points"),
  broadcastReady: boolean("broadcast_ready").default(false),
  format169: boolean("format_16_9").default(false),
  format916: boolean("format_9_16").default(false),
  aiGenerated: boolean("ai_generated").default(false),
  aiModel: varchar("ai_model", { length: 100 }),
  confidenceRating: int("confidence_rating").default(80),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Narrative = typeof narratives.$inferSelect;

export const analystProfiles = mysqlTable("analyst_profiles", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull().unique(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  bio: text("bio"),
  specialization: mysqlEnum("specialization", ["offense", "defense", "special_teams", "betting", "general"]).default("general"),
  accuracyScore: decimal("accuracy_score", { precision: 5, scale: 2 }).default("0.00"),
  totalPredictions: int("total_predictions").default(0),
  correctPredictions: int("correct_predictions").default(0),
  streak: int("streak").default(0),
  tier: mysqlEnum("tier", ["bronze", "silver", "gold", "platinum"]).default("bronze"),
  verified: boolean("verified").default(false),
  socialLinks: json("social_links"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type AnalystProfile = typeof analystProfiles.$inferSelect;

export const analystAdjustments = mysqlTable("analyst_adjustments", {
  id: serial("id").primaryKey(),
  analystId: bigint("analyst_id", { mode: "number", unsigned: true }).notNull(),
  gameId: bigint("game_id", { mode: "number", unsigned: true }).notNull(),
  predictionId: bigint("prediction_id", { mode: "number", unsigned: true }).notNull(),
  adjustedHomeWinProb: decimal("adjusted_home_win_prob", { precision: 5, scale: 2 }),
  adjustedChaosScore: int("adjusted_chaos_score"),
  adjustedConfidence: int("adjusted_confidence"),
  weightChange: decimal("weight_change", { precision: 4, scale: 2 }).default("0.00"),
  reasoning: text("reasoning"),
  factors: json("factors"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalystAdjustment = typeof analystAdjustments.$inferSelect;

export const lineMovements = mysqlTable("line_movements", {
  id: serial("id").primaryKey(),
  gameId: bigint("game_id", { mode: "number", unsigned: true }).notNull(),
  sportsbook: varchar("sportsbook", { length: 100 }).notNull(),
  openSpread: decimal("open_spread", { precision: 5, scale: 2 }),
  currentSpread: decimal("current_spread", { precision: 5, scale: 2 }),
  openTotal: decimal("open_total", { precision: 5, scale: 2 }),
  currentTotal: decimal("current_total", { precision: 5, scale: 2 }),
  homeMoneyline: int("home_moneyline"),
  awayMoneyline: int("away_moneyline"),
  publicBetPercent: int("public_bet_percent").default(50),
  sharpBetPercent: int("sharp_bet_percent").default(50),
  reverseLineMovement: boolean("reverse_line_movement").default(false),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

export type LineMovement = typeof lineMovements.$inferSelect;

export const userFavorites = mysqlTable("user_favorites", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  gameId: bigint("game_id", { mode: "number", unsigned: true }).notNull(),
  teamId: bigint("team_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserFavorite = typeof userFavorites.$inferSelect;

export const subscriptions = mysqlTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  paypalSubscriptionId: varchar("paypal_subscription_id", { length: 255 }).notNull().unique(),
  paypalPlanId: varchar("paypal_plan_id", { length: 255 }).notNull(),
  tier: mysqlEnum("tier", ["pro", "analyst"]).notNull(),
  status: mysqlEnum("status", ["active", "canceled", "past_due", "trialing", "incomplete"]).default("active").notNull(),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Subscription = typeof subscriptions.$inferSelect;

export const syncLogs = mysqlTable("sync_logs", {
  id: serial("id").primaryKey(),
  syncType: mysqlEnum("sync_type", ["schedules", "scores", "odds", "teams"]).notNull(),
  status: mysqlEnum("status", ["running", "completed", "failed"]).default("running").notNull(),
  recordsProcessed: int("records_processed").default(0),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export type SyncLog = typeof syncLogs.$inferSelect;

export const waitlist = mysqlTable("waitlist", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  source: varchar("source", { length: 100 }).default("website"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WaitlistEntry = typeof waitlist.$inferSelect;

export const posts = mysqlTable("posts", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  excerpt: varchar("excerpt", { length: 500 }).notNull(),
  content: text("content").notNull(),
  coverImage: text("cover_image"),
  authorName: varchar("author_name", { length: 255 }).default("GridIron Intelligence"),
  tags: json("tags"),
  published: boolean("published").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Post = typeof posts.$inferSelect;

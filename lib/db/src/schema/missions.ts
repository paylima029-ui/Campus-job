import { pgTable, text, serial, timestamp, integer, numeric, date, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const missionStatusEnum = pgEnum("mission_status", ["open", "in_progress", "completed", "cancelled"]);

export const missionsTable = pgTable("missions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  budget: numeric("budget", { precision: 12, scale: 2 }).notNull(),
  deadline: date("deadline", { mode: "string" }).notNull(),
  status: missionStatusEnum("status").notNull().default("open"),
  skills: text("skills").array().notNull().default([]),
  clientId: integer("client_id").notNull(),
  applicationCount: integer("application_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertMissionSchema = createInsertSchema(missionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMission = z.infer<typeof insertMissionSchema>;
export type Mission = typeof missionsTable.$inferSelect;

import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema with enhanced profile information
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// User relations will be defined at the end of the file

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
  profilePicture: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Emotion type
export interface Emotion {
  name: string;
  score: number;
}

// Music Suggestion type
export interface MusicSuggestion {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  previewUrl?: string | null;
  spotifyUrl?: string;
}

// Analysis schema with user relationship
export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  label: text("label").notNull(),
  imageUrl: text("image_url").notNull(),
  emotions: jsonb("emotions").notNull().$type<Emotion[]>(),
  description: text("description").notNull(),
  recommendedActivities: text("recommended_activities").notNull(),
  musicSuggestions: jsonb("music_suggestions").notNull().$type<MusicSuggestion[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  tags: jsonb("tags").$type<string[]>(),
  location: text("location"),
  notes: text("notes"),
});

// Analysis relations
export const analysesRelations = relations(analyses, ({ one }) => ({
  user: one(users, {
    fields: [analyses.userId],
    references: [users.id],
  }),
}));

export const insertAnalysisSchema = createInsertSchema(analyses).omit({
  id: true,
  createdAt: true,
});

export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analyses.$inferSelect;

// User Preferences - for tracking app settings and preferences
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  theme: text("theme").default("light"),
  language: text("language").default("en"),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  privacySettings: jsonb("privacy_settings").$type<{
    shareEmotionalData: boolean;
    publicProfile: boolean;
    anonymizeData: boolean;
  }>(),
  musicPreferences: jsonb("music_preferences").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User Preferences relations
export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;

// Emotional Patterns - for tracking user's emotional trends over time
export const emotionalPatterns = pgTable("emotional_patterns", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  period: text("period").notNull(), // daily, weekly, monthly
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  dominantEmotions: jsonb("dominant_emotions").$type<Emotion[]>(),
  emotionTrends: jsonb("emotion_trends").$type<Record<string, number[]>>(), // emotion name -> array of scores
  emotionalStability: integer("emotional_stability"), // 1-10 scale
  moodSwings: integer("mood_swings"), // count of significant mood changes
  triggers: jsonb("triggers").$type<string[]>(), // identified emotional triggers
  insights: text("insights"),
  recommendations: text("recommendations"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Emotional Pattern relations
export const emotionalPatternsRelations = relations(emotionalPatterns, ({ one }) => ({
  user: one(users, {
    fields: [emotionalPatterns.userId],
    references: [users.id],
  }),
}));

export const insertEmotionalPatternSchema = createInsertSchema(emotionalPatterns).omit({
  id: true,
  createdAt: true,
});

export type InsertEmotionalPattern = z.infer<typeof insertEmotionalPatternSchema>;
export type EmotionalPattern = typeof emotionalPatterns.$inferSelect;

// Define user relations after all tables are created
export const usersRelations = relations(users, ({ many }) => ({
  analyses: many(analyses),
  emotionalPatterns: many(emotionalPatterns),
  userPreferences: many(userPreferences),
}));

import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const galleries = pgTable("galleries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  wallColor: text("wall_color").notNull().default("#f5f0eb"),
  floorColor: text("floor_color").notNull().default("#8b7355"),
  roomWidth: real("room_width").notNull().default(12),
  roomDepth: real("room_depth").notNull().default(16),
  roomHeight: real("room_height").notNull().default(4),
  isPublic: boolean("is_public").notNull().default(true),
  musicUrl: text("music_url"),
  whatsappNumber: text("whatsapp_number"),
});

export const artworks = pgTable("artworks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  galleryId: varchar("gallery_id").notNull().references(() => galleries.id),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  year: text("year"),
  medium: text("medium"),
  price: text("price"),
  priceCurrency: text("price_currency").notNull().default("USD"),
  width: real("width").notNull().default(2),
  height: real("height").notNull().default(1.5),
  wall: text("wall").notNull().default("left"),
  positionX: real("position_x").notNull().default(0),
  positionY: real("position_y").notNull().default(2),
  sortOrder: integer("sort_order").notNull().default(0),
  showFrame: boolean("show_frame").notNull().default(true),
  artistPhoto: text("artist_photo"),
  artistBio: text("artist_bio"),
  artistLink: text("artist_link"),
});

export const wallTexts = pgTable("wall_texts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  galleryId: varchar("gallery_id").notNull().references(() => galleries.id),
  wall: text("wall").notNull().default("back"),
  positionX: real("position_x").notNull().default(0),
  positionY: real("position_y").notNull().default(2),
  content: text("content").notNull(),
  fontSize: real("font_size").notNull().default(0.15),
  maxWidth: real("max_width").notNull().default(3),
  fontFamily: text("font_family").notNull().default("Georgia"),
  fontColor: text("font_color").notNull().default("#333333"),
});

export const insertGallerySchema = createInsertSchema(galleries).omit({ id: true });
export const insertArtworkSchema = createInsertSchema(artworks).omit({ id: true });
export const insertWallTextSchema = createInsertSchema(wallTexts).omit({ id: true });

export type InsertGallery = z.infer<typeof insertGallerySchema>;
export type Gallery = typeof galleries.$inferSelect;
export type InsertArtwork = z.infer<typeof insertArtworkSchema>;
export type Artwork = typeof artworks.$inferSelect;
export type InsertWallText = z.infer<typeof insertWallTextSchema>;
export type WallText = typeof wallTexts.$inferSelect;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

import {
  type User, type InsertUser,
  type Gallery, type InsertGallery,
  type Artwork, type InsertArtwork,
  type WallText, type InsertWallText,
  users, galleries, artworks, wallTexts,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getGalleries(): Promise<Gallery[]>;
  getGallery(id: string): Promise<Gallery | undefined>;
  createGallery(gallery: InsertGallery): Promise<Gallery>;
  updateGallery(id: string, gallery: Partial<InsertGallery>): Promise<Gallery | undefined>;
  deleteGallery(id: string): Promise<void>;

  getArtworksByGallery(galleryId: string): Promise<Artwork[]>;
  getArtwork(id: string): Promise<Artwork | undefined>;
  createArtwork(artwork: InsertArtwork): Promise<Artwork>;
  updateArtwork(id: string, artwork: Partial<InsertArtwork>): Promise<Artwork | undefined>;
  deleteArtwork(id: string): Promise<void>;

  getWallTextsByGallery(galleryId: string): Promise<WallText[]>;
  createWallText(wallText: InsertWallText): Promise<WallText>;
  updateWallText(id: string, wallText: Partial<InsertWallText>): Promise<WallText | undefined>;
  deleteWallText(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getGalleries(): Promise<Gallery[]> {
    return db.select().from(galleries);
  }

  async getGallery(id: string): Promise<Gallery | undefined> {
    const [gallery] = await db.select().from(galleries).where(eq(galleries.id, id));
    return gallery;
  }

  async createGallery(gallery: InsertGallery): Promise<Gallery> {
    const [created] = await db.insert(galleries).values(gallery).returning();
    return created;
  }

  async updateGallery(id: string, gallery: Partial<InsertGallery>): Promise<Gallery | undefined> {
    const [updated] = await db.update(galleries).set(gallery).where(eq(galleries.id, id)).returning();
    return updated;
  }

  async deleteGallery(id: string): Promise<void> {
    await db.delete(wallTexts).where(eq(wallTexts.galleryId, id));
    await db.delete(artworks).where(eq(artworks.galleryId, id));
    await db.delete(galleries).where(eq(galleries.id, id));
  }

  async getArtworksByGallery(galleryId: string): Promise<Artwork[]> {
    return db.select().from(artworks).where(eq(artworks.galleryId, galleryId));
  }

  async getArtwork(id: string): Promise<Artwork | undefined> {
    const [artwork] = await db.select().from(artworks).where(eq(artworks.id, id));
    return artwork;
  }

  async createArtwork(artwork: InsertArtwork): Promise<Artwork> {
    const [created] = await db.insert(artworks).values(artwork).returning();
    return created;
  }

  async updateArtwork(id: string, artwork: Partial<InsertArtwork>): Promise<Artwork | undefined> {
    const [updated] = await db.update(artworks).set(artwork).where(eq(artworks.id, id)).returning();
    return updated;
  }

  async deleteArtwork(id: string): Promise<void> {
    await db.delete(artworks).where(eq(artworks.id, id));
  }

  async getWallTextsByGallery(galleryId: string): Promise<WallText[]> {
    return db.select().from(wallTexts).where(eq(wallTexts.galleryId, galleryId));
  }

  async createWallText(wallText: InsertWallText): Promise<WallText> {
    const [created] = await db.insert(wallTexts).values(wallText).returning();
    return created;
  }

  async updateWallText(id: string, wallText: Partial<InsertWallText>): Promise<WallText | undefined> {
    const [updated] = await db.update(wallTexts).set(wallText).where(eq(wallTexts.id, id)).returning();
    return updated;
  }

  async deleteWallText(id: string): Promise<void> {
    await db.delete(wallTexts).where(eq(wallTexts.id, id));
  }
}

export const storage = new DatabaseStorage();

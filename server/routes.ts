import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGallerySchema, insertArtworkSchema, insertWallTextSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/galleries", async (_req, res) => {
    try {
      const galleries = await storage.getGalleries();
      res.json(galleries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch galleries" });
    }
  });

  app.get("/api/galleries/:id", async (req, res) => {
    try {
      const gallery = await storage.getGallery(req.params.id);
      if (!gallery) return res.status(404).json({ error: "Gallery not found" });
      res.json(gallery);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch gallery" });
    }
  });

  app.post("/api/galleries", async (req, res) => {
    try {
      const parsed = insertGallerySchema.parse(req.body);
      const gallery = await storage.createGallery(parsed);
      res.status(201).json(gallery);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid gallery data" });
    }
  });

  app.patch("/api/galleries/:id", async (req, res) => {
    try {
      const gallery = await storage.updateGallery(req.params.id, req.body);
      if (!gallery) return res.status(404).json({ error: "Gallery not found" });
      res.json(gallery);
    } catch (error) {
      res.status(500).json({ error: "Failed to update gallery" });
    }
  });

  app.delete("/api/galleries/:id", async (req, res) => {
    try {
      await storage.deleteGallery(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete gallery" });
    }
  });

  app.get("/api/galleries/:id/artworks", async (req, res) => {
    try {
      const artworks = await storage.getArtworksByGallery(req.params.id);
      res.json(artworks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch artworks" });
    }
  });

  app.post("/api/galleries/:id/artworks", async (req, res) => {
    try {
      const galleryId = req.params.id as string;
      const gallery = await storage.getGallery(galleryId);
      if (!gallery) return res.status(404).json({ error: "Gallery not found" });

      const imageUrl = req.body.imageUrl;
      if (!imageUrl) return res.status(400).json({ error: "Image URL is required" });

      const artworkData = {
        galleryId,
        title: req.body.title || "Untitled",
        artist: req.body.artist || "Unknown Artist",
        description: req.body.description || null,
        imageUrl,
        year: req.body.year || null,
        medium: req.body.medium || null,
        price: req.body.price ? String(req.body.price).replace(/^[\$₹]\s?/, "") : null,
        priceCurrency: req.body.priceCurrency || "USD",
        width: parseFloat(req.body.width) || 2,
        height: parseFloat(req.body.height) || 1.5,
        wall: req.body.wall || "left",
        positionX: parseFloat(req.body.positionX) || 0,
        positionY: parseFloat(req.body.positionY) || 2.5,
        sortOrder: parseInt(req.body.sortOrder) || 0,
        showFrame: req.body.showFrame !== undefined ? req.body.showFrame : true,
        artistPhoto: req.body.artistPhoto || null,
        artistBio: req.body.artistBio || null,
        artistLink: req.body.artistLink || null,
      };

      const artwork = await storage.createArtwork(artworkData);
      res.status(201).json(artwork);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create artwork" });
    }
  });

  app.patch("/api/artworks/:id", async (req, res) => {
    try {
      const updateSchema = insertArtworkSchema.partial();
      const parsed = updateSchema.parse(req.body);
      if (parsed.price) {
        parsed.price = String(parsed.price).replace(/^[\$₹]\s?/, "");
      }
      const artwork = await storage.updateArtwork(req.params.id, parsed);
      if (!artwork) return res.status(404).json({ error: "Artwork not found" });
      res.json(artwork);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update artwork" });
    }
  });

  app.delete("/api/artworks/:id", async (req, res) => {
    try {
      await storage.deleteArtwork(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete artwork" });
    }
  });

  app.get("/api/galleries/:id/wall-texts", async (req, res) => {
    try {
      const texts = await storage.getWallTextsByGallery(req.params.id);
      res.json(texts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wall texts" });
    }
  });

  app.post("/api/galleries/:id/wall-texts", async (req, res) => {
    try {
      const parsed = insertWallTextSchema.parse({ ...req.body, galleryId: req.params.id });
      const text = await storage.createWallText(parsed);
      res.status(201).json(text);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create wall text" });
    }
  });

  app.patch("/api/wall-texts/:id", async (req, res) => {
    try {
      const updateSchema = insertWallTextSchema.partial();
      const parsed = updateSchema.parse(req.body);
      const text = await storage.updateWallText(req.params.id, parsed);
      if (!text) return res.status(404).json({ error: "Wall text not found" });
      res.json(text);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update wall text" });
    }
  });

  app.delete("/api/wall-texts/:id", async (req, res) => {
    try {
      await storage.deleteWallText(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete wall text" });
    }
  });

  return httpServer;
}

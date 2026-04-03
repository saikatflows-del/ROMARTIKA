import { storage } from "./storage";

export async function seedDatabase() {
  const existingGalleries = await storage.getGalleries();
  if (existingGalleries.length > 0) return;

  const gallery1 = await storage.createGallery({
    title: "Modern Perspectives",
    description: "A curated collection of contemporary abstract works exploring color, form, and emotion through diverse artistic approaches.",
    wallColor: "#f5f0eb",
    floorColor: "#8b7355",
    roomWidth: 12,
    roomDepth: 16,
    roomHeight: 4,
    isPublic: true,
  });

  const gallery2 = await storage.createGallery({
    title: "Nature & Imagination",
    description: "Where reality meets fantasy - landscapes and dreamscapes that blur the boundaries between the seen and the imagined.",
    wallColor: "#faf6f1",
    floorColor: "#6b5b45",
    roomWidth: 12,
    roomDepth: 16,
    roomHeight: 4,
    isPublic: true,
  });

  const seedArtworks = [
    {
      galleryId: gallery1.id,
      title: "Celestial Drift",
      artist: "Elena Kovarik",
      description: "A mesmerizing exploration of fluid dynamics frozen in time. The swirling blues and golds evoke cosmic phenomena, inviting viewers into an oceanic universe of light and motion.",
      imageUrl: "/images/artwork1.png",
      year: "2024",
      medium: "Oil on canvas",
      price: "$4,200",
      width: 2,
      height: 2.6,
      wall: "left",
      positionX: -3,
      positionY: 2.0,
      sortOrder: 0,
    },
    {
      galleryId: gallery1.id,
      title: "Convergence No. 7",
      artist: "Marcus Chen",
      description: "Part of the artist's acclaimed series exploring the intersection of geometry and chaos. Bold red and black forms create a visual tension that challenges the viewer's sense of balance.",
      imageUrl: "/images/artwork3.png",
      year: "2023",
      medium: "Acrylic on canvas",
      price: "$3,800",
      width: 2,
      height: 2,
      wall: "left",
      positionX: 3,
      positionY: 2.0,
      sortOrder: 1,
    },
    {
      galleryId: gallery1.id,
      title: "Emerald Resonance",
      artist: "Sofia Petrova",
      description: "This large-scale work captures the raw energy of the natural world through vigorous gestural brushwork. Layers of emerald green and silver create a shimmering, almost musical quality.",
      imageUrl: "/images/artwork5.png",
      year: "2024",
      medium: "Mixed media on canvas",
      price: "$5,600",
      width: 2.5,
      height: 1.8,
      wall: "right",
      positionX: 0,
      positionY: 2.0,
      sortOrder: 2,
    },
    {
      galleryId: gallery2.id,
      title: "Dawn over the Peaks",
      artist: "James Whitfield",
      description: "An atmospheric rendering of mountain ranges at first light. The delicate gradations of purple and pink capture the fleeting moments of dawn with masterful impressionistic technique.",
      imageUrl: "/images/artwork2.png",
      year: "2023",
      medium: "Oil on linen",
      price: "$3,500",
      width: 2.5,
      height: 1.8,
      wall: "left",
      positionX: 0,
      positionY: 2.0,
      sortOrder: 0,
    },
    {
      galleryId: gallery2.id,
      title: "Garden of Eternal Spring",
      artist: "Isabella Van Der Berg",
      description: "A rich homage to the Dutch masters. Lush blooms emerge from darkness with photorealistic precision, celebrating the timeless beauty and fragility of nature.",
      imageUrl: "/images/artwork4.png",
      year: "2024",
      medium: "Oil on panel",
      price: "$6,200",
      width: 2,
      height: 2.6,
      wall: "right",
      positionX: -3,
      positionY: 2.0,
      sortOrder: 1,
    },
    {
      galleryId: gallery2.id,
      title: "The Threshold",
      artist: "Alejandro Ruiz",
      description: "A surrealist vision where familiar objects defy gravity and logic. Warm sunset tones bathe the dreamscape in an otherworldly glow that invites contemplation and wonder.",
      imageUrl: "/images/artwork6.png",
      year: "2023",
      medium: "Oil and tempera on canvas",
      price: "$4,800",
      width: 2.5,
      height: 1.8,
      wall: "right",
      positionX: 3,
      positionY: 2.0,
      sortOrder: 2,
    },
  ];

  for (const artwork of seedArtworks) {
    await storage.createArtwork(artwork);
  }

  console.log("Database seeded with sample galleries and artworks");
}

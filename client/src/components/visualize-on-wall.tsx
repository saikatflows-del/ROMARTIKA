import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, Eye } from "lucide-react";
import bedroomImg from "@assets/bedroom_final.jpg";
import livingRoomImg from "@assets/livingroom_final2.jpg";
import diningRoomImg from "@assets/diningroom_final2.jpg";

type RoomType = "bedroom" | "living-room" | "dining-room";

interface RoomConfig {
  value: RoomType;
  label: string;
  image: string;
  area: { top: string; left: string; width: string; height: string };
  artworkFilter: string;
  frameColor: string;
}

const ROOMS: RoomConfig[] = [
  {
    value: "bedroom",
    label: "Bedroom",
    image: bedroomImg,
    area: { top: "0.5%", left: "32.3%", width: "41.1%", height: "35.8%" },
    artworkFilter: "brightness(0.95)",
    frameColor: "#3d2b1f",
  },
  {
    value: "living-room",
    label: "Living Room",
    image: livingRoomImg,
    area: { top: "17.3%", left: "38.4%", width: "26.8%", height: "35.4%" },
    artworkFilter: "brightness(0.88) saturate(0.92)",
    frameColor: "#c4a265",
  },
  {
    value: "dining-room",
    label: "Dining Room",
    image: diningRoomImg,
    area: { top: "20.1%", left: "31.2%", width: "42.8%", height: "36.6%" },
    artworkFilter: "brightness(0.82) saturate(0.88)",
    frameColor: "#555",
  },
];

export function VisualizeOnWallButton({ artwork }: { artwork: { imageUrl: string; title: string } }) {
  const [open, setOpen] = useState(false);
  const [roomType, setRoomType] = useState<RoomType>("living-room");

  const handleClose = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        data-testid="button-visualize-on-wall"
        className="gap-2"
      >
        <Eye className="w-4 h-4" />
        Visualize on Wall
      </Button>
    );
  }

  const room = ROOMS.find((r) => r.value === roomType)!;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85"
      onClick={handleClose}
      data-testid="visualize-overlay"
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-lg w-full max-w-4xl mx-4 overflow-hidden max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
            Visualize on Wall
          </h3>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleClose}
            data-testid="button-close-visualize"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-2 px-5 py-3 border-b border-neutral-100 dark:border-neutral-800">
          {ROOMS.map((r) => (
            <Button
              key={r.value}
              size="sm"
              variant={roomType === r.value ? "default" : "outline"}
              onClick={() => setRoomType(r.value)}
              data-testid={`button-room-${r.value}`}
            >
              {r.label}
            </Button>
          ))}
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          <div
            className="relative w-full overflow-hidden rounded-lg"
            data-testid="room-visualization-scene"
          >
            <img
              src={room.image}
              alt={room.label}
              className="w-full h-auto block"
            />
            <div
              className="absolute flex items-center justify-center"
              style={{
                top: room.area.top,
                left: room.area.left,
                width: room.area.width,
                height: room.area.height,
              }}
            >
              <img
                src={artwork.imageUrl}
                alt={artwork.title}
                className="block"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  filter: room.artworkFilter,
                  border: `3px solid ${room.frameColor}`,
                  boxShadow: "2px 3px 12px rgba(0,0,0,0.35)",
                }}
                data-testid="visualize-artwork-image"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
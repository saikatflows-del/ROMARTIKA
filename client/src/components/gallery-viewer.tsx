import { useEffect, useRef, useState, useCallback } from "react";
import { GalleryScene } from "@/lib/three-gallery";
import type { Gallery, Artwork, WallText } from "@shared/schema";
import { X, ZoomIn, Info, Move, MousePointer, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Play, Square, Volume2, VolumeX, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VisualizeOnWallButton } from "@/components/visualize-on-wall";

interface GalleryViewerProps {
  gallery: Gallery;
  artworks: Artwork[];
  wallTexts?: WallText[];
}

function isTouchDevice() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

export function GalleryViewer({ gallery, artworks, wallTexts = [] }: GalleryViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<GalleryScene | null>(null);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [webglError, setWebglError] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [tourInfo, setTourInfo] = useState<{ name: string; index: number; total: number } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicMuted, setMusicMuted] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.4);

  const handleArtworkClick = useCallback((artwork: Artwork) => {
    setSelectedArtwork(artwork);
  }, []);

  useEffect(() => {
    if (gallery.musicUrl) {
      const audio = new Audio(gallery.musicUrl);
      audio.loop = true;
      audio.volume = musicVolume;
      audioRef.current = audio;
      return () => {
        audio.pause();
        audio.src = "";
        audioRef.current = null;
      };
    }
  }, [gallery.musicUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicMuted ? 0 : musicVolume;
    }
  }, [musicVolume, musicMuted]);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      const scene = new GalleryScene(containerRef.current, {
        wallColor: gallery.wallColor,
        floorColor: gallery.floorColor,
        roomWidth: gallery.roomWidth,
        roomDepth: gallery.roomDepth,
        roomHeight: gallery.roomHeight,
      });

      scene.setOnArtworkClick(handleArtworkClick);
      scene.setOnTourStop(() => {
        setTourActive(false);
        setTourInfo(null);
      });
      scene.loadArtworks(artworks);
      scene.loadWallTexts(wallTexts);
      sceneRef.current = scene;

      return () => {
        scene.dispose();
        sceneRef.current = null;
      };
    } catch (e) {
      console.warn("WebGL not available:", e);
      setWebglError(true);
    }
  }, [gallery, artworks, wallTexts, handleArtworkClick]);

  const playMusic = useCallback(() => {
    if (audioRef.current && !musicPlaying) {
      audioRef.current.play().then(() => setMusicPlaying(true)).catch(() => {});
    }
  }, [musicPlaying]);

  const enterGallery = () => {
    setShowInstructions(false);
    if (sceneRef.current) {
      sceneRef.current.activate();
    }
    if (isTouchDevice()) {
      setShowMobileControls(true);
    }
    playMusic();
  };

  const startTour = useCallback(() => {
    if (!sceneRef.current) return;
    setShowInstructions(false);
    setTourActive(true);
    setTourInfo(null);
    playMusic();
    sceneRef.current.startTour(
      () => {
        setTourActive(false);
        setTourInfo(null);
      },
      (artwork, index, total) => {
        setTourInfo({ name: artwork.title, index: index + 1, total });
      }
    );
  }, [playMusic]);

  const stopTour = useCallback(() => {
    if (!sceneRef.current) return;
    sceneRef.current.stopTour();
    setTourActive(false);
    setTourInfo(null);
  }, []);

  const handleMoveStart = useCallback((dir: "forward" | "backward" | "left" | "right") => {
    if (!sceneRef.current) return;
    if (sceneRef.current.isTourActive()) {
      sceneRef.current.stopTour();
      setTourActive(false);
      setTourInfo(null);
    }
    switch (dir) {
      case "forward": sceneRef.current.setMoveForward(true); break;
      case "backward": sceneRef.current.setMoveBackward(true); break;
      case "left": sceneRef.current.setMoveLeft(true); break;
      case "right": sceneRef.current.setMoveRight(true); break;
    }
  }, []);

  const handleMoveEnd = useCallback((dir: "forward" | "backward" | "left" | "right") => {
    if (!sceneRef.current) return;
    switch (dir) {
      case "forward": sceneRef.current.setMoveForward(false); break;
      case "backward": sceneRef.current.setMoveBackward(false); break;
      case "left": sceneRef.current.setMoveLeft(false); break;
      case "right": sceneRef.current.setMoveRight(false); break;
    }
  }, []);

  if (webglError) {
    return (
      <div className="relative w-full h-full bg-black overflow-auto" data-testid="gallery-fallback">
        <div className="max-w-4xl mx-auto py-12 px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-light tracking-wide mb-4 text-white">{gallery.title}</h2>
            {gallery.description && (
              <p className="text-sm text-white/60 mb-4 leading-relaxed">{gallery.description}</p>
            )}
            <p className="text-xs text-white/40">3D view requires WebGL support</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {artworks.map((artwork) => (
              <div
                key={artwork.id}
                className="cursor-pointer group"
                onClick={() => setSelectedArtwork(artwork)}
                data-testid={`fallback-artwork-${artwork.id}`}
              >
                <div className="bg-neutral-900 rounded-md p-4">
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full h-56 object-cover rounded-md"
                  />
                  <div className="mt-3">
                    <p className="text-sm text-white/80 font-medium">{artwork.title}</p>
                    <p className="text-xs text-white/50 mt-0.5">{artwork.artist}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {selectedArtwork && (
          <ArtworkDetailOverlay
            artwork={selectedArtwork}
            onClose={() => setSelectedArtwork(null)}
            whatsappNumber={gallery.whatsappNumber}
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black">
      <div
        ref={containerRef}
        className="w-full h-full"
        data-testid="gallery-3d-canvas"
        tabIndex={0}
      />

      {showInstructions && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 cursor-pointer"
          data-testid="gallery-instructions-overlay"
          onClick={enterGallery}
        >
          <div className="text-center text-white max-w-md px-6">
            <h2 className="text-2xl font-light tracking-wide mb-6">{gallery.title}</h2>
            {gallery.description && (
              <p className="text-sm text-white/70 mb-8 leading-relaxed">{gallery.description}</p>
            )}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-white/80 justify-center">
                <MousePointer className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">Drag to look around</span>
              </div>
              <div className="flex items-center gap-3 text-white/80 justify-center">
                <Move className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{isTouchDevice() ? "Use arrows to walk" : "Click on the floor to walk there"}</span>
              </div>
              <div className="flex items-center gap-3 text-white/80 justify-center">
                <ZoomIn className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">Tap on artwork to view details</span>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center flex-wrap">
              <Button
                variant="outline"
                className="text-white border-white/30 bg-white/10"
                data-testid="button-enter-gallery"
              >
                Enter Gallery
              </Button>
              {artworks.length > 0 && (
                <Button
                  variant="outline"
                  className="text-white border-white/30 bg-white/10"
                  onClick={(e) => { e.stopPropagation(); startTour(); }}
                  data-testid="button-start-tour"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Auto Tour
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {showMobileControls && !showInstructions && !selectedArtwork && (
        <MobileArrowControls onMoveStart={handleMoveStart} onMoveEnd={handleMoveEnd} />
      )}

      {tourActive && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-black/60 backdrop-blur-sm rounded-md px-4 py-2" data-testid="tour-hud">
          {tourInfo && (
            <span className="text-white/90 text-sm font-light tracking-wide" data-testid="tour-info">
              {tourInfo.index} / {tourInfo.total} — {tourInfo.name}
            </span>
          )}
          {!tourInfo && (
            <span className="text-white/70 text-sm font-light">Starting tour...</span>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="text-white/80"
            onClick={stopTour}
            data-testid="button-stop-tour"
          >
            <Square className="w-4 h-4" />
          </Button>
        </div>
      )}

      {!showInstructions && !tourActive && !selectedArtwork && artworks.length > 0 && (
        <div className="absolute top-4 right-28 z-40">
          <Button
            size="icon"
            variant="ghost"
            className="text-white/80 bg-black/50 backdrop-blur-sm"
            onClick={startTour}
            data-testid="button-tour-from-gallery"
          >
            <Play className="w-4 h-4" />
          </Button>
        </div>
      )}

      {!showInstructions && gallery.musicUrl && (
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-md px-3 py-1.5" data-testid="music-controls">
          {!musicPlaying ? (
            <Button
              size="icon"
              variant="ghost"
              className="text-white/70 w-8 h-8"
              onClick={playMusic}
              data-testid="button-play-music"
            >
              <Volume2 className="w-4 h-4" />
            </Button>
          ) : (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="text-white/70 w-8 h-8"
                onClick={() => setMusicMuted(!musicMuted)}
                data-testid="button-toggle-mute"
              >
                {musicMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={musicMuted ? 0 : musicVolume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setMusicVolume(v);
                  if (v > 0) setMusicMuted(false);
                }}
                className="w-20 h-1 accent-white/80"
                data-testid="input-volume-slider"
              />
            </>
          )}
        </div>
      )}

      {selectedArtwork && (
        <ArtworkDetailOverlay
          artwork={selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
          whatsappNumber={gallery.whatsappNumber}
        />
      )}
    </div>
  );
}

function MobileArrowControls({
  onMoveStart,
  onMoveEnd,
}: {
  onMoveStart: (dir: "forward" | "backward" | "left" | "right") => void;
  onMoveEnd: (dir: "forward" | "backward" | "left" | "right") => void;
}) {
  const createHandlers = (dir: "forward" | "backward" | "left" | "right") => ({
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onMoveStart(dir);
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onMoveEnd(dir);
    },
    onTouchCancel: (e: React.TouchEvent) => {
      e.preventDefault();
      onMoveEnd(dir);
    },
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault();
      onMoveStart(dir);
    },
    onMouseUp: (e: React.MouseEvent) => {
      e.preventDefault();
      onMoveEnd(dir);
    },
    onMouseLeave: () => {
      onMoveEnd(dir);
    },
  });

  const btnClass = "flex items-center justify-center w-14 h-14 rounded-full bg-white/15 border border-white/30 active:bg-white/30 select-none touch-none";

  return (
    <div className="absolute bottom-6 left-6 z-10 select-none touch-none" data-testid="mobile-controls">
      <div className="grid grid-cols-3 gap-1" style={{ width: "180px" }}>
        <div />
        <button
          className={btnClass}
          {...createHandlers("forward")}
          data-testid="button-move-forward"
        >
          <ChevronUp className="w-7 h-7 text-white/80" />
        </button>
        <div />

        <button
          className={btnClass}
          {...createHandlers("left")}
          data-testid="button-move-left"
        >
          <ChevronLeft className="w-7 h-7 text-white/80" />
        </button>
        <div />
        <button
          className={btnClass}
          {...createHandlers("right")}
          data-testid="button-move-right"
        >
          <ChevronRight className="w-7 h-7 text-white/80" />
        </button>

        <div />
        <button
          className={btnClass}
          {...createHandlers("backward")}
          data-testid="button-move-backward"
        >
          <ChevronDown className="w-7 h-7 text-white/80" />
        </button>
        <div />
      </div>
    </div>
  );
}

function ArtworkDetailOverlay({
  artwork,
  onClose,
  whatsappNumber,
}: {
  artwork: Artwork;
  onClose: () => void;
  whatsappNumber?: string | null;
}) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-black/80 z-20"
      onClick={onClose}
      data-testid="artwork-detail-overlay"
    >
      <div
        className="bg-white dark:bg-neutral-900 max-w-4xl w-full mx-4 flex flex-col md:flex-row rounded-md overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md:w-1/2 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center p-6">
          <img
            src={artwork.imageUrl}
            alt={artwork.title}
            className="max-w-full max-h-[60vh] object-contain"
            data-testid="artwork-detail-image"
          />
        </div>
        <div className="md:w-1/2 p-8 flex flex-col overflow-y-auto">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2
                className="text-2xl font-light text-neutral-900 dark:text-white tracking-wide"
                data-testid="artwork-detail-title"
              >
                {artwork.title}
              </h2>
              <p
                className="text-sm text-neutral-500 dark:text-neutral-400 mt-1"
                data-testid="artwork-detail-artist"
              >
                {artwork.artist}
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              data-testid="button-close-artwork"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="mt-6 space-y-4 flex-1">
            {artwork.year && (
              <div>
                <span className="text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  Year
                </span>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-0.5">
                  {artwork.year}
                </p>
              </div>
            )}
            {artwork.medium && (
              <div>
                <span className="text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  Medium
                </span>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-0.5">
                  {artwork.medium}
                </p>
              </div>
            )}
            {artwork.description && (
              <div>
                <span className="text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  About
                </span>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-0.5 leading-relaxed">
                  {artwork.description}
                </p>
              </div>
            )}
            {artwork.width && artwork.height && (
              <div>
                <span className="text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  Dimensions
                </span>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-0.5">
                  {(artwork.width * 50).toFixed(0)} x {(artwork.height * 50).toFixed(0)} cm
                </p>
              </div>
            )}
          </div>

          {(artwork.artistPhoto || artwork.artistBio || artwork.artistLink) && (
            <div className="mt-5 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <p className="text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">About the Artist</p>
              <div className="flex items-start gap-3">
                {artwork.artistPhoto && (
                  <img
                    src={artwork.artistPhoto.startsWith("/objects/") ? artwork.artistPhoto : `/objects/${artwork.artistPhoto}`}
                    alt={artwork.artist}
                    className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                    data-testid="artwork-detail-artist-photo"
                  />
                )}
                <div className="flex-1 min-w-0">
                  {artwork.artistBio && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed" data-testid="artwork-detail-artist-bio">
                      {artwork.artistBio}
                    </p>
                  )}
                  {artwork.artistLink && (
                    <a
                      href={artwork.artistLink.startsWith("http") ? artwork.artistLink : `https://${artwork.artistLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 mt-2 hover:underline"
                      data-testid="artwork-detail-artist-link"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {artwork.artistLink.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {artwork.price ? (
                <span className="text-lg font-light text-neutral-900 dark:text-white" data-testid="text-artwork-price">
                  {artwork.priceCurrency === "INR" ? "₹" : "$"}{artwork.price.replace(/^[\$₹]\s?/, "")}
                </span>
              ) : <span />}
              <div className="flex items-center gap-2 flex-wrap">
                <VisualizeOnWallButton artwork={artwork} />
                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber.replace(/[\s\-\(\)]/g, "")}?text=${encodeURIComponent(`Hi, I'm interested in "${artwork.title}" by ${artwork.artist}${artwork.price ? ` (${artwork.priceCurrency === "INR" ? "₹" : "$"}${artwork.price.replace(/^[\$₹]\s?/, "")})` : ""}. Could you share more details?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="link-inquire-artwork"
                  >
                    <Button variant="default">
                      <Info className="w-4 h-4 mr-2" />
                      Enquire
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

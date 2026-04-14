import { useFileUrl } from "@/blob-storage/FileStorage";
import LazyImage from "@/components/LazyImage";
import ScrollReveal from "@/components/ScrollReveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonMediaCard } from "@/components/ui/skeleton-cards";
import type { Album, AlbumTrack } from "@/hooks/useQueries";
import { useAlbums, useMediaItems } from "@/hooks/useQueries";
import {
  AlertCircle,
  ArrowUpDown,
  ChevronDown,
  Disc3,
  ExternalLink,
  LayoutGrid,
  Link2,
  Music2,
  RefreshCw,
  Video,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiSoundcloud, SiSpotify, SiYoutube } from "react-icons/si";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type FilterTab = "alle" | "audio" | "video" | "link" | "alben";
type SortMode = "datum" | "titel";

interface MediaItem {
  id: bigint;
  title: string;
  description: string;
  mediaType: string;
  url: string;
  thumbnailPath?: string;
  waveformPath?: string;
  albumId?: string;
  isAlbumTrack: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function classifyItem(item: MediaItem): "audio" | "video" | "link" {
  const type = item.mediaType.toLowerCase();
  if (type.includes("audio")) return "audio";
  if (type.includes("video") || type.includes("youtube")) return "video";
  return "link";
}

function isAlbumTrackItem(item: MediaItem): boolean {
  return item.isAlbumTrack === true;
}

// ---------------------------------------------------------------------------
// CoverPlaceholder
// ---------------------------------------------------------------------------
function CoverPlaceholder({
  type,
}: { type: "audio" | "video" | "link" | "album" }) {
  const iconMap = {
    audio: <Music2 className="w-8 h-8 text-primary/60" />,
    video: <Video className="w-8 h-8 text-primary/60" />,
    link: <Link2 className="w-8 h-8 text-primary/60" />,
    album: <Disc3 className="w-8 h-8 text-primary/60" />,
  };
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/20">
      <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
        {iconMap[type]}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AudioCard
// ---------------------------------------------------------------------------
function AudioCard({ item }: { item: MediaItem }) {
  const { data: fileUrl, isLoading: urlLoading } = useFileUrl(item.url);
  const { data: thumbUrl } = useFileUrl(item.thumbnailPath ?? "");
  const [hasError, setHasError] = useState(false);

  return (
    <div className="card-base overflow-hidden group flex flex-col hover:border-primary/40 hover:shadow-medium transition-smooth">
      <div className="relative aspect-square w-full overflow-hidden bg-muted/10">
        {thumbUrl ? (
          <LazyImage
            src={thumbUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <CoverPlaceholder type="audio" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/20 to-transparent" />
        <Badge
          variant="secondary"
          className="absolute top-3 left-3 text-xs font-mono uppercase tracking-wider bg-background/80 backdrop-blur-sm border-border/60"
        >
          <Music2 className="w-3 h-3 mr-1" />
          Audio
        </Badge>
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-display font-bold text-base leading-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-200">
            {item.title}
          </h3>
          {item.description && !item.description.startsWith("{") && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>
        <div className="mt-auto">
          {urlLoading ? (
            <Skeleton className="h-9 w-full rounded-md" />
          ) : fileUrl && !hasError ? (
            // biome-ignore lint/a11y/useMediaCaption: uploaded audio lacks caption track
            <audio
              controls
              className="w-full h-9"
              preload="metadata"
              onError={() => setHasError(true)}
              style={{
                colorScheme: "dark",
                accentColor: "var(--accent-hex, #0D9488)",
              }}
            >
              <source src={fileUrl} type="audio/mpeg" />
              <source src={fileUrl} type="audio/ogg" />
              <source src={fileUrl} type="audio/wav" />
              Dein Browser unterstützt das Audio-Element nicht.
            </audio>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Audio nicht verfügbar
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// VideoCard
// ---------------------------------------------------------------------------
function VideoCard({ item }: { item: MediaItem }) {
  const { data: fileUrl, isLoading: urlLoading } = useFileUrl(item.url);
  const { data: thumbUrl } = useFileUrl(item.thumbnailPath ?? "");
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  return (
    <div className="card-base overflow-hidden group flex flex-col hover:border-primary/40 hover:shadow-medium transition-smooth">
      <div className="relative aspect-video w-full overflow-hidden bg-muted/10">
        {urlLoading ? (
          <Skeleton className="absolute inset-0 rounded-none" />
        ) : fileUrl && !hasError ? (
          // biome-ignore lint/a11y/useMediaCaption: uploaded video lacks caption track
          <video
            key={retryKey}
            controls
            className="w-full h-full object-contain bg-black"
            poster={thumbUrl}
            preload="metadata"
            onError={() => setHasError(true)}
          >
            <source src={fileUrl} type="video/mp4" />
            <source src={fileUrl} type="video/webm" />
            Dein Browser unterstützt das Video-Element nicht.
          </video>
        ) : hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/20">
            <AlertCircle className="w-8 h-8 text-destructive/60" />
            <p className="text-xs text-muted-foreground">
              Video konnte nicht geladen werden
            </p>
            <button
              type="button"
              onClick={() => {
                setHasError(false);
                setRetryKey((k) => k + 1);
              }}
              className="flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <RefreshCw className="w-3 h-3" />
              Erneut versuchen
            </button>
          </div>
        ) : (
          <CoverPlaceholder type="video" />
        )}
        {!urlLoading && !hasError && (
          <Badge
            variant="secondary"
            className="absolute top-3 left-3 text-xs font-mono uppercase tracking-wider bg-background/80 backdrop-blur-sm border-border/60 z-10 pointer-events-none"
          >
            <Video className="w-3 h-3 mr-1" />
            Video
          </Badge>
        )}
      </div>
      <div className="p-4 flex flex-col gap-1">
        <h3 className="font-display font-bold text-base leading-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-200">
          {item.title}
        </h3>
        {item.description && !item.description.startsWith("{") && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// YouTubeCard
// ---------------------------------------------------------------------------
function YouTubeCard({ item }: { item: MediaItem }) {
  const videoId = extractYouTubeId(item.url);
  const { data: thumbUrl } = useFileUrl(item.thumbnailPath ?? "");
  const [playing, setPlaying] = useState(false);

  const ytThumb = videoId
    ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    : null;
  const thumbnailSrc = thumbUrl ?? ytThumb;

  if (!videoId) {
    return (
      <div className="card-base overflow-hidden group flex flex-col hover:border-primary/40 hover:shadow-medium transition-smooth">
        <div className="relative h-40 bg-muted/20 flex items-center justify-center">
          <SiYoutube className="w-12 h-12 text-[#FF0000]/40" />
        </div>
        <div className="p-4 flex flex-col gap-3 flex-1">
          <h3 className="font-display font-bold text-base leading-tight text-foreground line-clamp-1">
            {item.title}
          </h3>
          <Button variant="outline" size="sm" className="mt-auto gap-2" asChild>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
              Auf YouTube öffnen
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="card-base overflow-hidden group flex flex-col hover:border-primary/40 hover:shadow-medium transition-smooth">
      <div className="relative w-full aspect-video bg-black overflow-hidden">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&color=white&autoplay=1`}
            title={item.title}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <button
            type="button"
            className="absolute inset-0 w-full h-full group/play"
            onClick={() => setPlaying(true)}
            aria-label={`${item.title} abspielen`}
          >
            {thumbnailSrc && (
              <img
                src={thumbnailSrc}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover/play:scale-105"
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 bg-black/40 group-hover/play:bg-black/20 transition-colors duration-200" />
            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#FF0000] flex items-center justify-center shadow-lg group-hover/play:scale-110 transition-transform duration-200">
                <SiYoutube className="w-8 h-8 text-white" />
              </div>
            </div>
          </button>
        )}
        {!playing && (
          <Badge
            variant="secondary"
            className="absolute top-3 left-3 text-xs font-mono uppercase tracking-wider bg-background/80 backdrop-blur-sm border-border/60 z-10 pointer-events-none"
          >
            <SiYoutube className="w-3 h-3 mr-1 text-[#FF0000]" />
            YouTube
          </Badge>
        )}
      </div>
      <div className="p-4 flex flex-col gap-1">
        <h3 className="font-display font-bold text-base leading-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-200">
          {item.title}
        </h3>
        {item.description && !item.description.startsWith("{") && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SpotifyCard — attempts oEmbed first, falls back to styled card
// ---------------------------------------------------------------------------
function SpotifyCard({ item }: { item: MediaItem }) {
  const [embedState, setEmbedState] = useState<
    "loading" | "embed" | "fallback"
  >("loading");
  const [embedHtml, setEmbedHtml] = useState<string>("");

  // Build the direct embed URL from the Spotify URL as fallback-of-fallback
  const getSpotifyEmbedUrl = (url: string): string | null => {
    const m = url.match(
      /spotify\.com\/(track|album|playlist|episode|artist)\/([A-Za-z0-9]+)/,
    );
    if (!m) return null;
    return `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&theme=0`;
  };

  const embedUrl = getSpotifyEmbedUrl(item.url);
  const embedHeight = (() => {
    const m = item.url.match(
      /spotify\.com\/(track|album|playlist|episode|artist)\//,
    );
    const type = m?.[1];
    return type === "track" || type === "episode" ? 152 : 352;
  })();

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);

    const oEmbedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(item.url)}`;

    fetch(oEmbedUrl, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json() as Promise<{ html?: string }>;
      })
      .then((data) => {
        clearTimeout(timer);
        if (cancelled) return;
        if (data.html) {
          setEmbedHtml(data.html);
          setEmbedState("embed");
        } else {
          setEmbedState("fallback");
        }
      })
      .catch(() => {
        clearTimeout(timer);
        if (!cancelled) setEmbedState("fallback");
      });

    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [item.url]);

  // oEmbed succeeded — render the HTML
  if (embedState === "embed" && embedHtml) {
    return (
      <div className="card-base overflow-hidden group flex flex-col hover:border-primary/40 hover:shadow-medium transition-smooth">
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: trusted Spotify oEmbed HTML — no user input */}
        <div
          className="w-full [&>iframe]:w-full [&>iframe]:border-0 [&>iframe]:rounded-t-lg"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Spotify oEmbed only
          dangerouslySetInnerHTML={{ __html: embedHtml }}
        />
        <div className="p-4 flex items-center gap-2 min-w-0">
          <SiSpotify className="w-4 h-4 text-[#1DB954] shrink-0" />
          <span className="text-sm font-medium text-foreground line-clamp-1">
            {item.title}
          </span>
        </div>
      </div>
    );
  }

  // Fallback — use direct embed URL (usually works even when oEmbed is CORS-blocked)
  return (
    <div className="card-base overflow-hidden group flex flex-col hover:border-primary/40 hover:shadow-medium transition-smooth">
      {embedState === "loading" && !embedUrl ? (
        <Skeleton className="w-full h-36 rounded-t-lg rounded-b-none" />
      ) : embedUrl ? (
        <iframe
          title={`Spotify: ${item.title}`}
          src={embedUrl}
          className="w-full border-0 rounded-t-lg"
          style={{ height: `${embedHeight}px` }}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <div className="relative h-24 bg-gradient-to-br from-[#1DB954]/10 to-muted/20 flex items-center justify-center rounded-t-lg">
          <SiSpotify className="w-12 h-12 text-[#1DB954]/40" />
        </div>
      )}

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start gap-2 min-w-0">
          <SiSpotify className="w-5 h-5 text-[#1DB954] mt-0.5 shrink-0" />
          <div className="min-w-0">
            <h3 className="font-display font-bold text-base leading-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-200">
              {item.title}
            </h3>
            {item.description && !item.description.startsWith("{") && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-auto w-full gap-2 border-border hover:border-[#1DB954]/40 hover:bg-[#1DB954]/5"
          asChild
          data-ocid="media-spotify-link"
        >
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            <SiSpotify className="w-4 h-4 text-[#1DB954]" />
            Auf Spotify öffnen
          </a>
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LinkCard (generic external link)
// ---------------------------------------------------------------------------
function LinkCard({ item }: { item: MediaItem }) {
  const { data: thumbUrl } = useFileUrl(item.thumbnailPath ?? "");
  const u = item.url.toLowerCase();

  function ExternalIcon() {
    if (u.includes("soundcloud"))
      return <SiSoundcloud className="w-5 h-5 text-[#FF5500]" />;
    return <Link2 className="w-5 h-5 text-primary" />;
  }

  function getLabel() {
    if (u.includes("soundcloud")) return "Auf SoundCloud öffnen";
    if (u.includes("bandcamp")) return "Auf Bandcamp öffnen";
    return "Link öffnen";
  }

  return (
    <div className="card-base overflow-hidden group flex flex-col hover:border-primary/40 hover:shadow-medium transition-smooth">
      <div className="relative aspect-square w-full overflow-hidden bg-muted/10">
        {thumbUrl ? (
          <LazyImage
            src={thumbUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ExternalIcon />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-card/10 to-transparent" />
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start gap-2 min-w-0">
          <ExternalIcon />
          <div className="min-w-0">
            <h3 className="font-display font-bold text-base leading-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-200">
              {item.title}
            </h3>
            {item.description && !item.description.startsWith("{") && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-auto w-full gap-2 border-border hover:border-primary/60 hover:bg-primary/5"
          asChild
          data-ocid="media-external-link"
        >
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" />
            {getLabel()}
          </a>
        </Button>
      </div>
    </div>
  );
}

function MediaCard({ item }: { item: MediaItem }) {
  const type = item.mediaType.toLowerCase();
  const isYouTube =
    type === "youtube" || item.url.toLowerCase().includes("youtube");
  const isSpotify =
    type === "spotify" || item.url.toLowerCase().includes("spotify");

  if (type === "audio") return <AudioCard item={item} />;
  if (isYouTube) return <YouTubeCard item={item} />;
  if (type === "video") return <VideoCard item={item} />;
  if (isSpotify) return <SpotifyCard item={item} />;
  return <LinkCard item={item} />;
}

// ---------------------------------------------------------------------------
// AlbumTrackRow — a single track inside an expanded album
// ---------------------------------------------------------------------------
function AlbumTrackRow({ track, index }: { track: AlbumTrack; index: number }) {
  const { data: fileUrl } = useFileUrl(track.url);
  const isSpotify = track.url.toLowerCase().includes("spotify");
  const [hasAudioError, setHasAudioError] = useState(false);

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors duration-150"
      data-ocid={`album-track-${track.id}`}
    >
      {/* Track number */}
      <span className="w-6 text-center text-xs font-mono text-muted-foreground shrink-0">
        {index + 1}
      </span>

      {/* Title */}
      <span className="flex-1 text-sm font-medium text-foreground line-clamp-1 min-w-0">
        {track.title}
      </span>

      {/* Player or Spotify button */}
      <div className="shrink-0 flex items-center gap-2">
        {isSpotify ? (
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 text-xs px-2 border-[#1DB954]/30 hover:bg-[#1DB954]/10"
            asChild
          >
            <a href={track.url} target="_blank" rel="noopener noreferrer">
              <SiSpotify className="w-3 h-3 text-[#1DB954]" />
              Spotify
            </a>
          </Button>
        ) : fileUrl && !hasAudioError ? (
          // biome-ignore lint/a11y/useMediaCaption: track audio lacks caption track
          <audio
            controls
            className="h-7 w-40 sm:w-48"
            preload="metadata"
            onError={() => setHasAudioError(true)}
            style={{
              colorScheme: "dark",
              accentColor: "var(--accent-hex, #0D9488)",
            }}
          >
            <source src={fileUrl} type="audio/mpeg" />
            <source src={fileUrl} type="audio/ogg" />
          </audio>
        ) : (
          <span className="text-xs text-muted-foreground italic">–</span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AlbumCard — expandable accordion card for albums
// ---------------------------------------------------------------------------
function AlbumCard({ album }: { album: Album }) {
  const [expanded, setExpanded] = useState(false);
  const { data: coverUrl } = useFileUrl(album.coverPath ?? "");
  const trackListRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="card-base overflow-hidden group hover:border-primary/40 hover:shadow-medium transition-smooth"
      data-ocid={`album-card-${album.id}`}
    >
      {/* Cover art */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted/10">
        {coverUrl ? (
          <LazyImage
            src={coverUrl}
            alt={album.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <CoverPlaceholder type="album" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/20 to-transparent" />
        <Badge
          variant="secondary"
          className="absolute top-3 left-3 text-xs font-mono uppercase tracking-wider bg-background/80 backdrop-blur-sm border-border/60"
        >
          <Disc3 className="w-3 h-3 mr-1" />
          Album
        </Badge>
        {album.releaseYear && (
          <Badge
            variant="outline"
            className="absolute top-3 right-3 text-xs font-mono bg-background/80 backdrop-blur-sm"
          >
            {album.releaseYear}
          </Badge>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1">
        <h3 className="font-display font-bold text-base leading-tight text-foreground group-hover:text-primary transition-colors duration-200">
          {album.title}
        </h3>
        <p className="text-sm text-primary">{album.artist}</p>
        {album.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {album.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {album.tracks.length} {album.tracks.length === 1 ? "Track" : "Tracks"}
        </p>
      </div>

      {/* Expand toggle */}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-4 py-3 border-t border-border/60 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors duration-150"
        aria-expanded={expanded}
        data-ocid="album-expand-toggle"
      >
        <span className="font-medium">
          {expanded ? "Trackliste ausblenden" : "Trackliste anzeigen"}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Track list — smooth height transition */}
      <div
        ref={trackListRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: expanded ? `${album.tracks.length * 56 + 16}px` : "0px",
          opacity: expanded ? 1 : 0,
        }}
      >
        <div className="border-t border-border/40">
          {album.tracks.map((track, i) => (
            <AlbumTrackRow key={String(track.id)} track={track} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filter / sort controls
// ---------------------------------------------------------------------------
const FILTER_TABS: { id: FilterTab; label: string; icon: React.ReactNode }[] = [
  { id: "alle", label: "Alle", icon: <LayoutGrid className="w-4 h-4" /> },
  { id: "audio", label: "Audio", icon: <Music2 className="w-4 h-4" /> },
  { id: "video", label: "Video", icon: <Video className="w-4 h-4" /> },
  { id: "link", label: "Links", icon: <Link2 className="w-4 h-4" /> },
  { id: "alben", label: "Alben", icon: <Disc3 className="w-4 h-4" /> },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function MediaPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("alle");
  const [sortMode, setSortMode] = useState<SortMode>("datum");

  useEffect(() => {
    document.title = "Media – Everblack Music";
  }, []);

  // Use the shared hook from useQueries instead of inline query
  const { data: rawItems, isLoading } = useMediaItems();
  const { data: albums, isLoading: albumsLoading } = useAlbums();

  const items = useMemo(() => {
    if (!rawItems) return [];

    // Exclude album tracks from the regular grid (they appear in AlbumCards)
    let filtered = rawItems.filter((item) => !isAlbumTrackItem(item));

    if (activeFilter !== "alle" && activeFilter !== "alben") {
      filtered = filtered.filter((item) => classifyItem(item) === activeFilter);
    }

    if (activeFilter === "alben") {
      return [];
    }

    if (sortMode === "datum") {
      // Sort by id descending as proxy for creation order (newer items have higher ids)
      filtered.sort((a, b) => Number(b.id - a.id));
    } else {
      filtered.sort((a, b) => a.title.localeCompare(b.title, "de"));
    }

    return filtered;
  }, [rawItems, activeFilter, sortMode]);

  const totalCount = rawItems?.filter((i) => !isAlbumTrackItem(i)).length ?? 0;
  const showAlbums = activeFilter === "alben" || activeFilter === "alle";
  const showItems = activeFilter !== "alben";
  const combinedLoading =
    isLoading || (activeFilter === "alben" && albumsLoading);

  return (
    <div className="min-h-screen">
      {/* ── Page Hero Header ── */}
      <section className="bg-card border-b border-border py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <ScrollReveal direction="up" duration={600}>
            <div className="max-w-2xl">
              <p className="text-sm font-mono uppercase tracking-[0.2em] text-primary mb-3">
                Portfolio
              </p>
              <h1 className="text-display text-foreground mb-4">
                Meine Musik &amp; Videos
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Hör rein, schau vorbei — hier findest du Produktionen, Aufnahmen
                und Videos, an denen ich mitgewirkt habe.
              </p>
              <div className="accent-divider mt-6" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Gallery Section ── */}
      <section className="bg-background py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* ── Filter + sort bar ── */}
          <ScrollReveal direction="up" delay={80} duration={500}>
            <div
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10"
              data-ocid="media-filter-bar"
            >
              {/* Filter tabs */}
              <div className="flex items-center gap-1 bg-muted/40 border border-border rounded-xl p-1 w-fit overflow-x-auto">
                {FILTER_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFilter(tab.id)}
                    data-ocid={`media-filter-${tab.id}`}
                    className={[
                      "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-smooth whitespace-nowrap",
                      activeFilter === tab.id
                        ? "bg-primary text-primary-foreground shadow-subtle"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                    ].join(" ")}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Right side: count + sort */}
              {activeFilter !== "alben" && (
                <div className="flex items-center gap-3">
                  {!isLoading && totalCount > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {items.length} von {totalCount} Medien
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setSortMode((m) => (m === "datum" ? "titel" : "datum"))
                    }
                    data-ocid="media-sort-toggle"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-smooth"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                    <span className="hidden sm:inline">Sortiert nach: </span>
                    <span className="font-semibold text-foreground capitalize">
                      {sortMode === "datum" ? "Datum" : "Titel"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* ── Loading skeletons ── */}
          {combinedLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {["s1", "s2", "s3", "s4", "s5", "s6"].map((k) => (
                <SkeletonMediaCard key={k} />
              ))}
            </div>
          )}

          {/* ── Albums section (shown in "Alle" and "Alben" tabs) ── */}
          {!combinedLoading && showAlbums && albums && albums.length > 0 && (
            <div className="mb-12">
              {activeFilter === "alle" && (
                <ScrollReveal direction="up" delay={40} duration={500}>
                  <div className="flex items-center gap-3 mb-6">
                    <Disc3 className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-display font-semibold text-foreground">
                      Alben
                    </h2>
                    <div className="flex-1 h-px bg-border/60" />
                  </div>
                </ScrollReveal>
              )}
              <div
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                data-ocid="album-grid"
              >
                {albums.map((album, index) => (
                  <ScrollReveal
                    key={album.id}
                    direction="up"
                    delay={Math.min(index * 60, 300)}
                    duration={500}
                  >
                    <AlbumCard album={album} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          )}

          {/* ── Section header for individual tracks in "Alle" tab ── */}
          {!combinedLoading &&
            activeFilter === "alle" &&
            items.length > 0 &&
            albums &&
            albums.length > 0 && (
              <ScrollReveal direction="up" delay={40} duration={500}>
                <div className="flex items-center gap-3 mb-6">
                  <Music2 className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-display font-semibold text-foreground">
                    Einzelne Tracks & Videos
                  </h2>
                  <div className="flex-1 h-px bg-border/60" />
                </div>
              </ScrollReveal>
            )}

          {/* ── Empty state ── */}
          {!combinedLoading &&
            showItems &&
            items.length === 0 &&
            (!showAlbums || !albums || albums.length === 0) && (
              <ScrollReveal direction="none">
                <div
                  className="flex flex-col items-center justify-center py-24 text-center"
                  data-ocid="media-empty-state"
                >
                  <div className="w-24 h-24 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center mb-6">
                    <Music2 className="w-10 h-10 text-primary/40" />
                  </div>
                  <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                    {activeFilter === "alle"
                      ? "Noch keine Medien verfügbar"
                      : `Keine ${activeFilter === "audio" ? "Audio-Dateien" : activeFilter === "video" ? "Videos" : "Links"} vorhanden`}
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                    {activeFilter === "alle"
                      ? "Schau bald wieder vorbei — hier wird es Musik, Videos und mehr geben."
                      : "Probiere einen anderen Filter oder schau später nochmal vorbei."}
                  </p>
                  {activeFilter !== "alle" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-6"
                      onClick={() => setActiveFilter("alle")}
                      data-ocid="media-empty-reset-filter"
                    >
                      Alle Medien anzeigen
                    </Button>
                  )}
                </div>
              </ScrollReveal>
            )}

          {/* ── Alben empty state ── */}
          {!combinedLoading &&
            activeFilter === "alben" &&
            (!albums || albums.length === 0) && (
              <ScrollReveal direction="none">
                <div
                  className="flex flex-col items-center justify-center py-24 text-center"
                  data-ocid="media-empty-albums"
                >
                  <div className="w-24 h-24 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center mb-6">
                    <Disc3 className="w-10 h-10 text-primary/40" />
                  </div>
                  <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                    Noch keine Alben verfügbar
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                    Alben werden über das Admin-Panel mit mehreren Tracks
                    hinzugefügt.
                  </p>
                </div>
              </ScrollReveal>
            )}

          {/* ── Media grid (individual items) ── */}
          {!combinedLoading && showItems && items.length > 0 && (
            <div
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
              data-ocid="media-grid"
            >
              {items.map((item, index) => (
                <ScrollReveal
                  key={Number(item.id)}
                  direction="up"
                  delay={Math.min(index * 60, 300)}
                  duration={500}
                >
                  <MediaCard item={item} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

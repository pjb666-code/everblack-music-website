import ScrollReveal from "@/components/ScrollReveal";
import { useMediaItems } from "@/hooks/useQueries";
import { ExternalLink, Music, Video } from "lucide-react";

interface FeaturedContentProps {
  contentType: string;
  contentId?: bigint;
}

export default function FeaturedContent({
  contentType,
  contentId,
}: FeaturedContentProps) {
  const { data: mediaItems } = useMediaItems();

  if (!mediaItems || mediaItems.length === 0) return null;

  // Find the featured item: by ID if specified, otherwise latest
  let featured = contentId
    ? mediaItems.find((item) => item.id === contentId)
    : undefined;

  if (!featured) {
    if (contentType === "video") {
      featured = [...mediaItems]
        .filter((m) => m.mediaType === "video" || m.url.includes("youtube"))
        .sort((a, b) => Number(b.id) - Number(a.id))[0];
    } else {
      featured = [...mediaItems].sort((a, b) => Number(b.id) - Number(a.id))[0];
    }
  }

  if (!featured) return null;

  const isYoutube =
    featured.url.includes("youtube.com") || featured.url.includes("youtu.be");
  const isSpotify = featured.url.includes("spotify.com");

  const getYoutubeEmbedUrl = (url: string) => {
    const match =
      url.match(/[?&]v=([^&]+)/) ??
      url.match(/youtu\.be\/([^?]+)/) ??
      url.match(/embed\/([^?]+)/);
    const id = match?.[1];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  };

  const getSpotifyEmbedUrl = (url: string) =>
    url.replace("open.spotify.com", "open.spotify.com/embed");

  const embedUrl = isYoutube
    ? getYoutubeEmbedUrl(featured.url)
    : isSpotify
      ? getSpotifyEmbedUrl(featured.url)
      : null;

  return (
    <section
      className="section-default py-20 relative"
      data-ocid="featured-content"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

      <div className="container mx-auto px-4">
        <ScrollReveal direction="up" duration={600}>
          <div className="max-w-3xl mx-auto">
            {/* Label */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="w-8 h-px bg-primary/40" />
              <span className="text-xs uppercase tracking-widest text-primary/70 font-semibold flex items-center gap-1.5">
                {contentType === "video" ? (
                  <Video className="w-3.5 h-3.5" />
                ) : (
                  <Music className="w-3.5 h-3.5" />
                )}
                Aktuelles
              </span>
              <span className="w-8 h-px bg-primary/40" />
            </div>

            <h2 className="text-heading text-foreground text-center mb-2">
              {featured.title}
            </h2>
            {featured.description && (
              <p className="text-body-sm text-muted-foreground text-center mb-8 max-w-xl mx-auto">
                {featured.description}
              </p>
            )}

            {embedUrl ? (
              <div className="rounded-xl overflow-hidden border border-border/40 shadow-elevated">
                <div
                  className="relative w-full"
                  style={{ paddingBottom: isSpotify ? "80px" : "56.25%" }}
                >
                  <iframe
                    src={embedUrl}
                    title={featured.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                    style={
                      isSpotify
                        ? { position: "absolute", height: "80px" }
                        : undefined
                    }
                  />
                </div>
              </div>
            ) : (
              <a
                href={featured.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
                data-ocid="featured-content-link"
              >
                <ExternalLink className="w-4 h-4" />
                Jetzt anhören / ansehen
              </a>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

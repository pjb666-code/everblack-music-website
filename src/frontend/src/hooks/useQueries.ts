import type {
  AboutSection,
  AnimationConfig,
  ColorScheme,
  ContactInfo,
  FeatureCard,
  HeroSection,
  LandingPageConfig,
  LegalDocument,
  MediaItem,
  Product,
  StudioService,
  TeachingModel,
} from "@/backend";
import { useActor } from "@/hooks/useActor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const SAVE_ERROR_MSG = "Speichern fehlgeschlagen. Bitte versuche es erneut.";

// ─── Teaching Models ──────────────────────────────────────────────────────────

export function useTeachingModels() {
  const { actor, isFetching } = useActor();
  return useQuery<TeachingModel[]>({
    queryKey: ["teaching-models"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTeachingModels();
    },
    enabled: !!actor && !isFetching,
    retry: 2,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useAddTeachingModel() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (model: TeachingModel) => {
      if (!actor) throw new Error("No actor");
      return actor.addTeachingModel(model);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teaching-models"] }),
    onError: () => toast.error(SAVE_ERROR_MSG),
  });
}

export function useUpdateTeachingModel() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (model: TeachingModel) => {
      if (!actor) throw new Error("No actor");
      return actor.updateTeachingModel(model);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teaching-models"] }),
    onError: () => toast.error(SAVE_ERROR_MSG),
  });
}

export function useDeleteTeachingModel() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteTeachingModel(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teaching-models"] }),
    onError: () => toast.error(SAVE_ERROR_MSG),
  });
}

// ─── Studio Services ─────────────────────────────────────────────────────────

export function useStudioServices() {
  const { actor, isFetching } = useActor();
  return useQuery<StudioService[]>({
    queryKey: ["studio-services"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStudioServices();
    },
    enabled: !!actor && !isFetching,
    retry: 2,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useAddStudioService() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (service: StudioService) => {
      if (!actor) throw new Error("No actor");
      return actor.addStudioService(service);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studio-services"] }),
    onError: () => toast.error(SAVE_ERROR_MSG),
  });
}

export function useUpdateStudioService() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (service: StudioService) => {
      if (!actor) throw new Error("No actor");
      return actor.updateStudioService(service);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studio-services"] }),
    onError: () => toast.error(SAVE_ERROR_MSG),
  });
}

export function useDeleteStudioService() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteStudioService(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studio-services"] }),
    onError: () => toast.error(SAVE_ERROR_MSG),
  });
}

// ─── Media Items ─────────────────────────────────────────────────────────────

export function useMediaItems() {
  const { actor, isFetching } = useActor();
  return useQuery<MediaItem[]>({
    queryKey: ["media-items"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMediaItems();
    },
    enabled: !!actor && !isFetching,
    retry: 2,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useAddMediaItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (item: MediaItem) => {
      if (!actor) throw new Error("No actor");
      return actor.addMediaItem(item);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["media-items"] }),
    onError: () => toast.error(SAVE_ERROR_MSG),
  });
}

export function useUpdateMediaItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (item: MediaItem) => {
      if (!actor) throw new Error("No actor");
      return actor.updateMediaItem(item);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["media-items"] }),
    onError: () => toast.error(SAVE_ERROR_MSG),
  });
}

export function useDeleteMediaItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteMediaItem(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["media-items"] }),
    onError: () => toast.error(SAVE_ERROR_MSG),
  });
}

// ─── Albums (backend-driven) ──────────────────────────────────────────────────
// Albums are stored via actor.addAlbum/getAlbums/updateAlbum/deleteAlbum.
// Tracks are MediaItems with isAlbumTrack:true and albumId set.

export interface AlbumTrack {
  id: bigint;
  title: string;
  url: string;
  mediaType: string;
  thumbnailPath?: string;
  trackNumber: number;
  isAlbumTrack: boolean;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  coverPath?: string;
  description?: string;
  releaseYear?: string;
  tracks: AlbumTrack[];
}

/** useAlbums: merges backend Album records with MediaItem tracks */
export function useAlbums() {
  const { actor, isFetching } = useActor();
  const { data: mediaItems, isLoading: itemsLoading } = useMediaItems();

  const albumsQuery = useQuery<import("@/backend").Album[]>({
    queryKey: ["backend-albums"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAlbums();
    },
    enabled: !!actor && !isFetching,
    retry: 2,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const isLoading = albumsQuery.isLoading || itemsLoading;

  const albums: Album[] = [];

  if (albumsQuery.data) {
    // Build track map from media items that have isAlbumTrack = true
    const tracksByAlbum = new Map<string, AlbumTrack[]>();
    if (mediaItems) {
      for (const item of mediaItems) {
        if (!item.isAlbumTrack || !item.albumId) continue;
        const albumId = item.albumId;
        if (!tracksByAlbum.has(albumId)) tracksByAlbum.set(albumId, []);
        const trackNumber = item.trackNumber ? Number(item.trackNumber) : 999;
        tracksByAlbum.get(albumId)!.push({
          id: item.id,
          title: item.title,
          url: item.url,
          mediaType: item.mediaType,
          thumbnailPath: item.thumbnailPath,
          trackNumber,
          isAlbumTrack: true,
        });
      }
    }

    for (const a of albumsQuery.data) {
      const tracks = (tracksByAlbum.get(a.id) ?? []).sort(
        (x, y) => x.trackNumber - y.trackNumber,
      );
      albums.push({
        id: a.id,
        title: a.title,
        artist: a.artist,
        coverPath: a.coverPath,
        description: a.description,
        releaseYear: a.releaseYear,
        tracks,
      });
    }

    // Sort albums by order field
    albums.sort(
      (a, b) =>
        Number(albumsQuery.data!.find((x) => x.id === a.id)?.order ?? 0n) -
        Number(albumsQuery.data!.find((x) => x.id === b.id)?.order ?? 0n),
    );
  }

  return { data: albums, isLoading, error: albumsQuery.error };
}

// StandaloneAlbum = same shape used by admin form (maps to backend Album)
export interface StandaloneAlbum {
  id: string;
  title: string;
  artist: string;
  coverPath: string | null;
  description: string | null;
  releaseYear: string | null;
  order: number;
}

export interface StandaloneAlbumTrack {
  id: string;
  albumId: string;
  title: string;
  trackNumber: number;
  filePath: string;
}

/** useStandaloneAlbums: reads from backend (same data as useAlbums but simpler shape) */
export function useStandaloneAlbums() {
  const { actor, isFetching } = useActor();
  return useQuery<StandaloneAlbum[]>({
    queryKey: ["standalone-albums"],
    queryFn: async () => {
      if (!actor) return [];
      const backendAlbums = await actor.getAlbums();
      return backendAlbums.map((a) => ({
        id: a.id,
        title: a.title,
        artist: a.artist,
        coverPath: a.coverPath ?? null,
        description: a.description ?? null,
        releaseYear: a.releaseYear ?? null,
        order: Number(a.order),
      }));
    },
    enabled: !!actor && !isFetching,
    retry: 2,
    staleTime: 30_000,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useStandaloneAlbumTracks(albumId?: string) {
  const { data: mediaItems } = useMediaItems();
  return useQuery<StandaloneAlbumTrack[]>({
    queryKey: ["standalone-album-tracks", albumId ?? "all"],
    queryFn: () => {
      if (!mediaItems) return [];
      const tracks = mediaItems
        .filter(
          (item) =>
            item.isAlbumTrack &&
            item.albumId &&
            (albumId ? item.albumId === albumId : true),
        )
        .map((item) => ({
          id: String(item.id),
          albumId: item.albumId!,
          title: item.title,
          trackNumber: item.trackNumber ? Number(item.trackNumber) : 999,
          filePath: item.url,
        }))
        .sort((a, b) => a.trackNumber - b.trackNumber);
      return tracks;
    },
    enabled: !!mediaItems,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });
}

export function useAddAlbum() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (album: StandaloneAlbum) => {
      if (!actor) throw new Error("No actor");
      return actor.addAlbum({
        id: album.id,
        title: album.title,
        artist: album.artist,
        coverPath: album.coverPath ?? undefined,
        description: album.description ?? undefined,
        releaseYear: album.releaseYear ?? undefined,
        order: BigInt(album.order),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["standalone-albums"] });
      qc.invalidateQueries({ queryKey: ["backend-albums"] });
    },
    onError: () => toast.error(SAVE_ERROR_MSG),
  });
}

export function useUpdateAlbum() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (album: StandaloneAlbum) => {
      if (!actor) throw new Error("No actor");
      return actor.updateAlbum({
        id: album.id,
        title: album.title,
        artist: album.artist,
        coverPath: album.coverPath ?? undefined,
        description: album.description ?? undefined,
        releaseYear: album.releaseYear ?? undefined,
        order: BigInt(album.order),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["standalone-albums"] });
      qc.invalidateQueries({ queryKey: ["backend-albums"] });
    },
    onError: () => toast.error(SAVE_ERROR_MSG),
  });
}

export function useDeleteAlbum() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteAlbum(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["standalone-albums"] });
      qc.invalidateQueries({ queryKey: ["backend-albums"] });
      qc.invalidateQueries({ queryKey: ["media-items"] });
    },
    onError: () => toast.error(SAVE_ERROR_MSG),
  });
}

export function useAddAlbumTrack() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (track: StandaloneAlbumTrack) => {
      if (!actor) throw new Error("No actor");
      // Album tracks are stored as MediaItems with isAlbumTrack:true
      await actor.addMediaItem({
        id: BigInt(Date.now()),
        title: track.title,
        description: "",
        mediaType: "audio",
        url: track.filePath,
        albumId: track.albumId,
        trackNumber: BigInt(track.trackNumber),
        isAlbumTrack: true,
        thumbnailPath: undefined,
        waveformPath: undefined,
        albumCoverPath: undefined,
        albumTitle: undefined,
      });
    },
    onSuccess: (_d, track) => {
      qc.invalidateQueries({ queryKey: ["media-items"] });
      qc.invalidateQueries({
        queryKey: ["standalone-album-tracks", track.albumId],
      });
      qc.invalidateQueries({ queryKey: ["standalone-album-tracks", "all"] });
      qc.invalidateQueries({ queryKey: ["backend-albums"] });
    },
    onError: () => toast.error(SAVE_ERROR_MSG),
  });
}

export function useDeleteAlbumTrack() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, albumId }: { id: string; albumId: string }) => {
      if (!actor) throw new Error("No actor");
      await actor.deleteMediaItem(BigInt(id));
      return albumId;
    },
    onSuccess: (_d, { albumId }) => {
      qc.invalidateQueries({ queryKey: ["media-items"] });
      qc.invalidateQueries({ queryKey: ["standalone-album-tracks", albumId] });
      qc.invalidateQueries({ queryKey: ["standalone-album-tracks", "all"] });
      qc.invalidateQueries({ queryKey: ["backend-albums"] });
    },
    onError: () => toast.error(SAVE_ERROR_MSG),
  });
}

export function useAlbumTracks(albumId?: string) {
  return useStandaloneAlbumTracks(albumId);
}

export function useFeatureCards() {
  const { actor } = useActor();
  return useQuery<FeatureCard[]>({
    queryKey: ["feature-cards"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeatureCards();
    },
    enabled: !!actor,
    retry: 2,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useAddFeatureCard() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (card: FeatureCard) => {
      if (!actor) throw new Error("No actor");
      return actor.addFeatureCard(card);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feature-cards"] }),
    onError: () => toast.error(SAVE_ERROR_MSG),
  });
}

export function useUpdateFeatureCard() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (card: FeatureCard) => {
      if (!actor) throw new Error("No actor");
      return actor.updateFeatureCard(card);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feature-cards"] }),
    onError: () => toast.error(SAVE_ERROR_MSG),
  });
}

export function useDeleteFeatureCard() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteFeatureCard(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feature-cards"] }),
    onError: () => toast.error(SAVE_ERROR_MSG),
  });
}

// ─── Color Scheme ─────────────────────────────────────────────────────────────

export function useColorScheme() {
  const { actor, isFetching } = useActor();
  return useQuery<ColorScheme>({
    queryKey: ["color-scheme"],
    queryFn: async () => {
      if (!actor)
        return {
          primaryColor: "#0D9488",
          backgroundColor: "#141414",
          textColor: "#F2F2F2",
          secondaryColor: "#1A1A1A",
          gradientEnabled: false,
          gradientStartColor: "#0D9488",
          gradientEndColor: "#06b6d4",
        };
      return actor.getColorScheme();
    },
    enabled: !!actor && !isFetching,
    retry: 2,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useUpdateColorScheme() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (scheme: ColorScheme) => {
      if (!actor) throw new Error("No actor");
      return actor.updateColorScheme(scheme);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["color-scheme"] }),
    onError: () => toast.error(SAVE_ERROR_MSG),
  });
}

// ─── Hero / About / Contact ───────────────────────────────────────────────────

export function useHeroSection() {
  const { actor, isFetching } = useActor();
  return useQuery<HeroSection>({
    queryKey: ["hero-section"],
    queryFn: async () => {
      if (!actor)
        return {
          headline: "",
          subheadline: "",
          ctaPrimary: "",
          ctaSecondary: "",
          backgroundImageUrl: "",
        };
      return actor.getHeroSection();
    },
    enabled: !!actor && !isFetching,
    retry: 2,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useAboutSection() {
  const { actor } = useActor();
  return useQuery<AboutSection>({
    queryKey: ["about-section"],
    queryFn: async () => {
      if (!actor)
        return {
          title: "Über mich",
          content:
            "Ich bin Sebastian, Gitarrenlehrer aus Aachen mit über 10 Jahren Erfahrung.",
        };
      return actor.getAboutSection();
    },
    enabled: !!actor,
    retry: 2,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useContactInfo() {
  const { actor, isFetching } = useActor();
  return useQuery<ContactInfo>({
    queryKey: ["contact-info"],
    queryFn: async () => {
      if (!actor) return { name: "", email: "", address: "" };
      return actor.getContactInfo();
    },
    enabled: !!actor && !isFetching,
    retry: 2,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

// ─── Products ─────────────────────────────────────────────────────────────────

export function useProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
    retry: 2,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (product: Product) => {
      if (!actor) throw new Error("No actor");
      return actor.addProduct(product);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
    onError: () => toast.error(SAVE_ERROR_MSG),
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (product: Product) => {
      if (!actor) throw new Error("No actor");
      return actor.updateProduct(product);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
    onError: () => toast.error(SAVE_ERROR_MSG),
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteProduct(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
    onError: () => toast.error(SAVE_ERROR_MSG),
  });
}

// ─── Landing Page Config ──────────────────────────────────────────────────────

export function useLandingPageConfig() {
  const { actor, isFetching } = useActor();
  return useQuery<LandingPageConfig>({
    queryKey: ["landing-page-config"],
    queryFn: async () => {
      if (!actor)
        return {
          featuredContentType: "none",
          showFeaturedContent: false,
        } satisfies LandingPageConfig;
      return actor.getLandingPageConfig();
    },
    enabled: !!actor && !isFetching,
    retry: 2,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useUpdateLandingPageConfig() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (config: LandingPageConfig) => {
      if (!actor) throw new Error("No actor");
      return actor.updateLandingPageConfig(config);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["landing-page-config"] }),
    onError: () => toast.error(SAVE_ERROR_MSG),
  });
}

// ─── Animation Config ─────────────────────────────────────────────────────────

export function useAnimationConfig() {
  const { actor, isFetching } = useActor();
  return useQuery<AnimationConfig>({
    queryKey: ["animation-config"],
    queryFn: async () => {
      if (!actor)
        return {
          animationDuration: 0n,
          scrollAnimationsEnabled: false,
        } satisfies AnimationConfig;
      return actor.getAnimationConfig();
    },
    enabled: !!actor && !isFetching,
    retry: 2,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });
}

// ─── Legal Documents ──────────────────────────────────────────────────────────

export function useImprint() {
  const { actor, isFetching } = useActor();
  return useQuery<LegalDocument>({
    queryKey: ["imprint"],
    queryFn: async () => {
      if (!actor) return { content: "", lastUpdated: 0n };
      return actor.getImprint();
    },
    enabled: !!actor && !isFetching,
    retry: 2,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });
}

export function usePrivacyPolicy() {
  const { actor, isFetching } = useActor();
  return useQuery<LegalDocument>({
    queryKey: ["privacy-policy"],
    queryFn: async () => {
      if (!actor) return { content: "", lastUpdated: 0n };
      return actor.getPrivacyPolicy();
    },
    enabled: !!actor && !isFetching,
    retry: 2,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });
}

export function useTermsOfService() {
  const { actor, isFetching } = useActor();
  return useQuery<LegalDocument>({
    queryKey: ["terms-of-service"],
    queryFn: async () => {
      if (!actor) return { content: "", lastUpdated: 0n };
      return actor.getTermsOfService();
    },
    enabled: !!actor && !isFetching,
    retry: 2,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });
}

// ─── Site Logo / Favicon ─────────────────────────────────────────────────────

export function useSiteLogoUrl() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["site-logo-url"],
    queryFn: async () => {
      if (!actor) return "";
      return actor.getSiteLogoUrl();
    },
    enabled: !!actor && !isFetching,
    retry: 2,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });
}

export function useUpdateSiteLogoUrl() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (url: string) => {
      if (!actor) throw new Error("No actor");
      return actor.updateSiteLogoUrl(url);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site-logo-url"] }),
    onError: () => toast.error(SAVE_ERROR_MSG),
  });
}

// ─── Logo Size ───────────────────────────────────────────────────────────────

export function useLogoSizePercent() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["logo-size-percent"],
    queryFn: async () => {
      if (!actor) return 100n;
      return actor.getLogoSizePercent();
    },
    enabled: !!actor && !isFetching,
    retry: 2,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });
}

export function useUpdateLogoSizePercent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (size: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.updateLogoSizePercent(size);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["logo-size-percent"] }),
    onError: () => toast.error(SAVE_ERROR_MSG),
  });
}

// ─── Studio Stats ─────────────────────────────────────────────────────────────

export function useStudioStats() {
  const { actor, isFetching } = useActor();
  return useQuery<import("@/backend").StudioStat[]>({
    queryKey: ["studio-stats"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStudioStats();
    },
    enabled: !!actor && !isFetching,
    retry: 2,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useAddStudioStat() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (stat: import("@/backend").StudioStat) => {
      if (!actor) throw new Error("No actor");
      return actor.addStudioStat(stat);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studio-stats"] }),
    onError: () => toast.error(SAVE_ERROR_MSG),
  });
}

export function useUpdateStudioStat() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (stat: import("@/backend").StudioStat) => {
      if (!actor) throw new Error("No actor");
      return actor.updateStudioStat(stat);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studio-stats"] }),
    onError: () => toast.error(SAVE_ERROR_MSG),
  });
}

export function useDeleteStudioStat() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteStudioStat(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studio-stats"] }),
    onError: () => toast.error(SAVE_ERROR_MSG),
  });
}

// ─── Site Texts ───────────────────────────────────────────────────────────────

export interface SiteTexts {
  unterrichtHeadline: string | null;
  unterrichtIntro: string | null;
  unterrichtCTA: string | null;
  studioHeadline: string | null;
  studioIntro: string | null;
  studioCTA: string | null;
  mediaHeadline: string | null;
  mediaIntro: string | null;
  mediaCTA: string | null;
  shopHeadline: string | null;
  shopIntro: string | null;
  shopCTA: string | null;
  footerCopyright: string | null;
}

const EMPTY_SITE_TEXTS: SiteTexts = {
  unterrichtHeadline: null,
  unterrichtIntro: null,
  unterrichtCTA: null,
  studioHeadline: null,
  studioIntro: null,
  studioCTA: null,
  mediaHeadline: null,
  mediaIntro: null,
  mediaCTA: null,
  shopHeadline: null,
  shopIntro: null,
  shopCTA: null,
  footerCopyright: null,
};

export function useSiteTexts() {
  const { actor, isFetching } = useActor();
  return useQuery<SiteTexts>({
    queryKey: ["site-texts"],
    queryFn: async () => {
      // Primary: localStorage (fast, always available)
      try {
        const raw = localStorage.getItem("everblack-site-texts");
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (typeof parsed === "object" && parsed !== null) {
            return { ...EMPTY_SITE_TEXTS, ...(parsed as Partial<SiteTexts>) };
          }
        }
      } catch {
        /* ignore */
      }
      // Secondary: backend if method is available
      if (actor) {
        try {
          const extActor = actor as unknown as {
            getSiteTexts?: () => Promise<SiteTexts>;
          };
          if (typeof extActor.getSiteTexts === "function") {
            return await extActor.getSiteTexts();
          }
        } catch {
          // fall through
        }
      }
      return EMPTY_SITE_TEXTS;
    },
    enabled: !isFetching,
    retry: 2,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useUpdateSiteTexts() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (texts: Partial<SiteTexts>) => {
      // Always persist to localStorage so texts survive page reloads
      const existing = EMPTY_SITE_TEXTS;
      const merged = { ...existing, ...texts };
      localStorage.setItem("everblack-site-texts", JSON.stringify(merged));
      // Additionally try the backend method if available
      if (actor) {
        const extActor = actor as unknown as {
          updateSiteTexts?: (t: Partial<SiteTexts>) => Promise<void>;
        };
        if (typeof extActor.updateSiteTexts === "function") {
          await extActor.updateSiteTexts(texts);
        }
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site-texts"] }),
    onError: () => toast.error(SAVE_ERROR_MSG),
  });
}

// ─── Favicon URL (separate from site logo) ───────────────────────────────────

export function useFaviconUrl() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["favicon-url"],
    queryFn: async () => {
      // Primary: localStorage
      const lsUrl = localStorage.getItem("everblack-favicon-url");
      if (lsUrl) return lsUrl;
      // Secondary: backend if available
      if (actor) {
        try {
          const extActor = actor as unknown as {
            getFaviconUrl?: () => Promise<string>;
          };
          if (typeof extActor.getFaviconUrl === "function") {
            return await extActor.getFaviconUrl();
          }
        } catch {
          /* ignore */
        }
      }
      return "";
    },
    enabled: !isFetching,
    retry: 2,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useUpdateFaviconUrl() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (url: string) => {
      // Always persist to localStorage
      localStorage.setItem("everblack-favicon-url", url);
      // Additionally try backend if available
      if (actor) {
        const extActor = actor as unknown as {
          updateFaviconUrl?: (u: string) => Promise<void>;
        };
        if (typeof extActor.updateFaviconUrl === "function") {
          await extActor.updateFaviconUrl(url);
        }
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favicon-url"] }),
    onError: () => toast.error(SAVE_ERROR_MSG),
  });
}

/**
 * Imperatively sets the browser tab favicon to the given URL.
 * Used by the admin panel after a favicon upload to update the browser tab immediately.
 */
export function applyFaviconToDocument(url: string): void {
  if (!url) return;
  const existing = document.querySelector(
    "link[rel~='icon']",
  ) as HTMLLinkElement | null;
  const link =
    existing ??
    (() => {
      const el = document.createElement("link");
      el.rel = "icon";
      document.head.appendChild(el);
      return el;
    })();
  link.href = url;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["is-admin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    retry: false,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });
}

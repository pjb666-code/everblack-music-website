import type { backendInterface, UserRole } from "../backend";
import type { _CaffeineStorageCreateCertificateResult, _CaffeineStorageRefillResult } from "../backend";

export const mockBackend: backendInterface = {
  addAlbum: async () => undefined,
  deleteAlbum: async () => undefined,
  getAlbums: async () => [],
  getFaviconUrl: async () => "",
  getSiteTexts: async () => ({}),
  updateAlbum: async () => undefined,
  updateSiteTexts: async () => undefined,
  updateFaviconUrl: async () => undefined,
  addFeatureCard: async () => BigInt(0),
  addMediaItem: async () => BigInt(0),
  addProduct: async () => BigInt(0),
  addStudioService: async () => BigInt(0),
  addTeachingModel: async () => BigInt(0),
  assignCallerUserRole: async () => undefined,
  createCheckoutSession: async () => "mock-session-id",
  deleteFeatureCard: async () => undefined,
  deleteMediaItem: async () => undefined,
  deleteProduct: async () => undefined,
  deleteStudioService: async () => undefined,
  deleteTeachingModel: async () => undefined,
  dropFileReference: async () => undefined,

  getAboutSection: async () => ({
    title: "Über mich",
    content:
      "Hallo! Mein Name ist Pascal und ich bin leidenschaftlicher Gitarrenlehrer mit über 10 Jahren Erfahrung. Mein Unterricht ist individuell auf deine Bedürfnisse zugeschnitten und bietet dir die perfekte Mischung aus Technik, Theorie und Praxis. Egal ob Anfänger oder Fortgeschrittener – gemeinsam erreichen wir deine musikalischen Ziele!",
  }),

  getAnimationConfig: async () => ({
    animationDuration: BigInt(3),
    scrollAnimationsEnabled: true,
  }),

  getCallerUserProfile: async () => null,

  getCallerUserRole: async () => "guest" as unknown as UserRole,

  getColorScheme: async () => ({
    primaryColor: "#0D9488",
    secondaryColor: "#0F766E",
    backgroundColor: "#111827",
    textColor: "#F9FAFB",
    gradientEnabled: false,
    gradientStartColor: "#0D9488",
    gradientEndColor: "#0F766E",
  }),

  getContactInfo: async () => ({
    name: "Pascal - Everblack Music",
    email: "info@everblackmusic.com",
    address: "Bergische Gasse 9, 52064 Aachen",
  }),

  getFeatureCards: async () => [
    {
      id: BigInt(1),
      order: BigInt(1),
      icon: "guitar",
      color: "#0D9488",
      title: "10+ Jahre Erfahrung",
      subtitle: "Professioneller Unterricht auf höchstem Niveau",
    },
    {
      id: BigInt(2),
      order: BigInt(2),
      icon: "user",
      color: "#0D9488",
      title: "Individuell",
      subtitle: "Unterricht maßgeschneidert auf deine Ziele",
    },
    {
      id: BigInt(3),
      order: BigInt(3),
      icon: "music",
      color: "#0D9488",
      title: "Alle Stile",
      subtitle: "Rock, Metal, Blues, Jazz und mehr",
    },
    {
      id: BigInt(4),
      order: BigInt(4),
      icon: "star",
      color: "#0D9488",
      title: "Alle Level",
      subtitle: "Von Anfänger bis Profi – jeder ist willkommen",
    },
  ],

  getFileReference: async () => ({ hash: "", path: "" }),

  getHeaderSection: async () => ({
    logoPath: "",
    compact: true,
    verticalPadding: BigInt(4),
    logoSizePercent: 100n,
  }),

  getHeroSection: async () => ({
    headline: "Professioneller Gitarrenunterricht mit System!",
    subheadline: "Gitarrenunterricht in Aachen und online",
    ctaPrimary: "Jetzt starten",
    ctaSecondary: "Unterrichtsmodelle",
  }),

  getImprint: async () => ({
    content:
      "Angaben gemäß § 5 TMG\n\nPascal Müller\nEverblack Music\nBergische Gasse 9\n52064 Aachen\n\nKontakt:\nE-Mail: info@everblackmusic.com",
    lastUpdated: BigInt(Date.now() * 1000000),
  }),

  getLandingPageConfig: async () => ({
    featuredContentType: "none",
    featuredContentId: undefined,
    showFeaturedContent: false,
  }),

  getMediaItems: async () => [
    {
      id: BigInt(1),
      title: "Everblack – Shadows of Steel",
      description: "Single aus dem Album 'Iron Resonance', 2023",
      mediaType: "audio",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      isAlbumTrack: false,
      thumbnailPath: undefined,
      waveformPath: undefined,
    },
    {
      id: BigInt(2),
      title: "Live Session – Aachen 2024",
      description: "Unplugged performance im Studio",
      mediaType: "youtube",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      isAlbumTrack: false,
      thumbnailPath: undefined,
      waveformPath: undefined,
    },
    {
      id: BigInt(3),
      title: "Iron Resonance – Album",
      description: "Vollständiges Album 2023, verfügbar auf allen Plattformen",
      mediaType: "audio",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      isAlbumTrack: false,
      thumbnailPath: undefined,
      waveformPath: undefined,
    },
  ],

  getPrivacyPolicy: async () => ({
    content:
      "Datenschutzerklärung\n\nVerantwortlicher: Pascal Müller, Everblack Music, Bergische Gasse 9, 52064 Aachen.\n\nWir erheben nur die für den Betrieb dieser Website notwendigen Daten.",
    lastUpdated: BigInt(Date.now() * 1000000),
  }),

  getProducts: async () => [
    {
      id: BigInt(1),
      title: "Gitarren-Technik Masterclass",
      description:
        "Umfangreiches Video-Kurs-Paket mit über 5 Stunden Unterrichtsmaterial für alle Level",
      price: BigInt(2999),
      imageUrl: "https://picsum.photos/seed/product1/600/400",
      category: "digital",
      inventory: BigInt(999),
      isDigital: true,
    },
    {
      id: BigInt(2),
      title: "Everblack T-Shirt",
      description:
        "Hochwertiges schwarzes T-Shirt mit Everblack Music Logo, 100% Baumwolle",
      price: BigInt(2499),
      imageUrl: "https://picsum.photos/seed/product2/600/400",
      category: "merch",
      inventory: BigInt(50),
      isDigital: false,
    },
    {
      id: BigInt(3),
      title: "Songwriting & Komposition Guide",
      description:
        "PDF-Guide mit Techniken für Songwriting, Riff-Entwicklung und Arrangement",
      price: BigInt(1499),
      imageUrl: "https://picsum.photos/seed/product3/600/400",
      category: "digital",
      inventory: BigInt(999),
      isDigital: true,
    },
  ],

  getStripeSessionStatus: async () => ({
    __kind__: "failed",
    failed: { error: "Not configured" },
  }),

  getStudioStats: async () => [
    { id: "stat-1", order: BigInt(0), icon: "Calendar", statLabel: "10+ Jahre Erfahrung" },
    { id: "stat-2", order: BigInt(1), icon: "CheckCircle2", statLabel: "200+ Projekte" },
    { id: "stat-3", order: BigInt(2), icon: "Headphones", statLabel: "Pro Equipment" },
    { id: "stat-4", order: BigInt(3), icon: "Zap", statLabel: "Flexible Terminbuchung" },
  ],
  addStudioStat: async () => undefined,
  updateStudioStat: async () => undefined,
  deleteStudioStat: async () => undefined,

  getStudioServices: async () => [
    {
      id: BigInt(1),
      order: BigInt(1),
      title: "Recording",
      description:
        "Professionelle Gitarrenaufnahmen in unserem voll ausgestatteten Studio. Ideal für Demos, EPs und Full-Length Alben.",
      price: "ab 80€/Stunde",
      imagePath: undefined,
      mediaSamples: [],
    },
    {
      id: BigInt(2),
      order: BigInt(2),
      title: "Mixing",
      description:
        "Professionelles Mixing für deinen Sound. Wir bringen deine Musik auf das nächste Level.",
      price: "ab 100€/Track",
      imagePath: undefined,
      mediaSamples: [],
    },
    {
      id: BigInt(3),
      order: BigInt(3),
      title: "Mastering",
      description:
        "Mastering für den finalen Schliff. Deine Musik klingt auf allen Plattformen optimal.",
      price: "ab 50€/Track",
      imagePath: undefined,
      mediaSamples: [],
    },
  ],

  getTeachingModels: async () => [
    {
      id: BigInt(1),
      order: BigInt(1),
      featured: true,
      title: "Privatunterricht",
      subtitle: "Aachen & online",
      description:
        "Intensiver 1:1-Unterricht, vollständig auf deine Ziele und dein Level abgestimmt.",
      features: [
        "60 Min. pro Einheit",
        "Alle Stile & Level",
        "Flexible Termingestaltung",
        "Materialien inklusive",
      ],
      price: "150€ / Monat",
      imagePath: undefined,
    },
    {
      id: BigInt(2),
      order: BigInt(2),
      featured: false,
      title: "Gitarren-Coaching",
      subtitle: "Online",
      description:
        "Gezieltes Coaching für spezifische Probleme oder Ziele – flexibel buchbar.",
      features: [
        "30 Min. / 1:1",
        "Gezieltes Feedback",
        "Flexible Terminbuchung",
        "Spezifische Problemlösung",
      ],
      price: "50€ / Einheit",
      imagePath: undefined,
    },
  ],

  getTermsOfService: async () => ({
    content:
      "Nutzungsbedingungen\n\nMit der Nutzung dieser Website stimmen Sie unseren Nutzungsbedingungen zu. Alle Inhalte sind urheberrechtlich geschützt.",
    lastUpdated: BigInt(Date.now() * 1000000),
  }),

  getUserProfile: async () => null,
  getLogoSizePercent: async () => BigInt(100),
  getSiteLogoUrl: async () => "",
  initializeAccessControl: async () => undefined,
  isCallerAdmin: async () => false,
  isStripeConfigured: async () => false,
  listFileReferences: async () => [],
  registerFileReference: async () => undefined,
  resetAdminForNewPrincipal: async () => false,
  saveCallerUserProfile: async () => undefined,
  setStripeConfiguration: async () => undefined,
  transform: async (_input) => ({
    status: BigInt(200),
    body: new Uint8Array(),
    headers: [],
  }),
  updateAboutSection: async () => undefined,
  updateAdminCredentials: async () => undefined,
  updateAdminSetupCode: async () => undefined,
  updateAnimationConfig: async () => undefined,
  updateColorScheme: async () => undefined,
  updateContactInfo: async () => undefined,
  updateFeatureCard: async () => undefined,
  updateHeroSection: async () => undefined,
  updateImprint: async () => undefined,
  updateLandingPageConfig: async () => undefined,
  updateMediaItem: async () => undefined,
  updatePrivacyPolicy: async () => undefined,
  updateProduct: async () => undefined,
  updateSiteLogoUrl: async () => undefined,
  updateLogoSizePercent: async () => undefined,
  updateStudioService: async () => undefined,
  updateTeachingModel: async () => undefined,
  updateTermsOfService: async () => undefined,
  _caffeineStorageBlobsToDelete: async () => [],
  _caffeineStorageConfirmBlobDeletion: async () => undefined,
  _caffeineStorageCreateCertificate: async (): Promise<_CaffeineStorageCreateCertificateResult> => ({ method: "mock", blob_hash: "mock" }),
  _caffeineStorageRefillCashier: async (): Promise<_CaffeineStorageRefillResult> => ({ success: true }),
  _caffeineStorageUpdateGatewayPrincipals: async () => undefined,
};

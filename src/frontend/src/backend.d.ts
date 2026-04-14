import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface MediaItem {
    id: bigint;
    url: string;
    title: string;
    trackNumber?: bigint;
    description: string;
    albumCoverPath?: string;
    thumbnailPath?: string;
    waveformPath?: string;
    albumId?: string;
    mediaType: string;
    isAlbumTrack: boolean;
    albumTitle?: string;
}
export interface HeroSection {
    backgroundImageUrl?: string;
    headline: string;
    ctaSecondary: string;
    subheadline: string;
    ctaPrimary: string;
}
export interface LandingPageConfig {
    featuredContentType: string;
    featuredContentId?: bigint;
    showFeaturedContent: boolean;
}
export interface Album {
    id: string;
    title: string;
    order: bigint;
    description?: string;
    artist: string;
    coverPath?: string;
    releaseYear?: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface ColorScheme {
    backgroundColor: string;
    primaryColor: string;
    gradientEnabled: boolean;
    gradientEndColor: string;
    secondaryColor: string;
    gradientStartColor: string;
    textColor: string;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface FileReference {
    hash: string;
    path: string;
}
export interface ContactInfo {
    name: string;
    email: string;
    address: string;
    phone?: string;
}
export interface AdminCredentials {
    username: string;
    passwordHash: string;
}
export interface TeachingModel {
    id: bigint;
    title: string;
    featured: boolean;
    features: Array<string>;
    imagePath?: string;
    order: bigint;
    description: string;
    price: string;
    subtitle: string;
}
export interface SiteTexts {
    unterrichtHeadline?: string;
    shopIntro?: string;
    studioCTA?: string;
    mediaCTA?: string;
    shopCTA?: string;
    studioIntro?: string;
    unterrichtIntro?: string;
    mediaIntro?: string;
    unterrichtCTA?: string;
    shopHeadline?: string;
    footerCopyright?: string;
    mediaHeadline?: string;
    studioHeadline?: string;
}
export interface AboutSection {
    title: string;
    content: string;
}
export interface StudioService {
    id: bigint;
    title: string;
    imagePath?: string;
    order: bigint;
    description: string;
    mediaSamples: Array<string>;
    price: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface StudioStat {
    id: string;
    order: bigint;
    icon: string;
    statLabel: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface LegalDocument {
    content: string;
    lastUpdated: bigint;
}
export interface HeaderSection {
    verticalPadding: bigint;
    logoPath: string;
    compact: boolean;
    logoSizePercent: bigint;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface AnimationConfig {
    animationDuration: bigint;
    scrollAnimationsEnabled: boolean;
}
export interface FeatureCard {
    id: bigint;
    title: string;
    order: bigint;
    icon: string;
    color: string;
    subtitle: string;
}
export interface Product {
    id: bigint;
    title: string;
    inventory: bigint;
    description: string;
    imageUrl: string;
    category: string;
    price: bigint;
    isDigital: boolean;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAlbum(album: Album): Promise<void>;
    addFeatureCard(card: FeatureCard): Promise<bigint>;
    addMediaItem(item: MediaItem): Promise<bigint>;
    addProduct(product: Product): Promise<bigint>;
    addStudioService(service: StudioService): Promise<bigint>;
    addStudioStat(stat: StudioStat): Promise<void>;
    addTeachingModel(model: TeachingModel): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    deleteAlbum(id: string): Promise<void>;
    deleteFeatureCard(id: bigint): Promise<void>;
    deleteMediaItem(id: bigint): Promise<void>;
    deleteProduct(id: bigint): Promise<void>;
    deleteStudioService(id: bigint): Promise<void>;
    deleteStudioStat(id: string): Promise<void>;
    deleteTeachingModel(id: bigint): Promise<void>;
    dropFileReference(path: string): Promise<void>;
    getAboutSection(): Promise<AboutSection>;
    getAlbums(): Promise<Array<Album>>;
    getAnimationConfig(): Promise<AnimationConfig>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getColorScheme(): Promise<ColorScheme>;
    getContactInfo(): Promise<ContactInfo>;
    getFaviconUrl(): Promise<string>;
    getFeatureCards(): Promise<Array<FeatureCard>>;
    getFileReference(path: string): Promise<FileReference>;
    getHeaderSection(): Promise<HeaderSection>;
    getHeroSection(): Promise<HeroSection>;
    getImprint(): Promise<LegalDocument>;
    getLandingPageConfig(): Promise<LandingPageConfig>;
    getLogoSizePercent(): Promise<bigint>;
    getMediaItems(): Promise<Array<MediaItem>>;
    getPrivacyPolicy(): Promise<LegalDocument>;
    getProducts(): Promise<Array<Product>>;
    getSiteLogoUrl(): Promise<string>;
    getSiteTexts(): Promise<SiteTexts>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getStudioServices(): Promise<Array<StudioService>>;
    getStudioStats(): Promise<Array<StudioStat>>;
    getTeachingModels(): Promise<Array<TeachingModel>>;
    getTermsOfService(): Promise<LegalDocument>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    listFileReferences(): Promise<Array<FileReference>>;
    registerFileReference(path: string, hash: string): Promise<void>;
    resetAdminForNewPrincipal(setupCode: string): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateAboutSection(section: AboutSection): Promise<void>;
    updateAdminCredentials(newCredentials: AdminCredentials): Promise<void>;
    updateAdminSetupCode(newCode: string): Promise<void>;
    updateAlbum(album: Album): Promise<void>;
    updateAnimationConfig(config: AnimationConfig): Promise<void>;
    updateColorScheme(newScheme: ColorScheme): Promise<void>;
    updateContactInfo(info: ContactInfo): Promise<void>;
    updateFaviconUrl(url: string): Promise<void>;
    updateFeatureCard(card: FeatureCard): Promise<void>;
    updateHeroSection(section: HeroSection): Promise<void>;
    updateImprint(content: string): Promise<void>;
    updateLandingPageConfig(config: LandingPageConfig): Promise<void>;
    updateLogoSizePercent(size: bigint): Promise<void>;
    updateMediaItem(item: MediaItem): Promise<void>;
    updatePrivacyPolicy(content: string): Promise<void>;
    updateProduct(product: Product): Promise<void>;
    updateSiteLogoUrl(url: string): Promise<void>;
    updateSiteTexts(updated: SiteTexts): Promise<void>;
    updateStudioService(service: StudioService): Promise<void>;
    updateStudioStat(stat: StudioStat): Promise<void>;
    updateTeachingModel(model: TeachingModel): Promise<void>;
    updateTermsOfService(content: string): Promise<void>;
}

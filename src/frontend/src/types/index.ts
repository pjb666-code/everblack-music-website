/**
 * Shared frontend types — re-export from backend.d.ts where possible.
 * These types must stay in sync with backend.d.ts.
 */

export type {
  TeachingModel,
  StudioService,
  MediaItem,
  FeatureCard,
  ColorScheme,
  Product,
  HeroSection,
  AboutSection,
  ContactInfo,
  LegalDocument,
  LandingPageConfig,
  AnimationConfig,
  HeaderSection,
} from "@/backend";

import About from "@/components/About";
import Contact from "@/components/Contact";
import FeaturedContent from "@/components/FeaturedContent";
import Hero from "@/components/Hero";
import StudioServices from "@/components/StudioServices";
import TeachingModels from "@/components/TeachingModels";
import { useLandingPageConfig } from "@/hooks/useQueries";
import { useEffect } from "react";

export default function LandingPage() {
  useEffect(() => {
    document.title = "Everblack Music – Gitarrenunterricht Aachen";
  }, []);

  const { data: landingConfig } = useLandingPageConfig();

  const showFeatured =
    landingConfig?.featuredContentType &&
    landingConfig.featuredContentType !== "none" &&
    landingConfig.featuredContentType !== "";

  return (
    <>
      <Hero />
      <About />
      {showFeatured && landingConfig && (
        <FeaturedContent
          contentType={landingConfig.featuredContentType}
          contentId={landingConfig.featuredContentId}
        />
      )}
      <TeachingModels />
      <StudioServices />
      <Contact />
    </>
  );
}

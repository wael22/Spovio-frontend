import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { AIFeaturesPreview } from "@/components/sections/AIFeaturesPreview";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { PricingSection } from "@/components/PricingSection";
import { AboutSection } from "@/components/sections/AboutSection";

import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <AIFeaturesPreview />
        <HowItWorksSection />
        <PricingSection />
        <AboutSection />

        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

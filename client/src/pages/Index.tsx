import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PlatformSection from "@/components/PlatformSection";
import StylesSection from "@/components/StylesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import TemplatesSection from "@/components/TemplatesSection";
import GrowSection from "@/components/GrowSection";
import PricingSection from "@/components/PricingSection";
import SignupSection from "@/components/SignupSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <PlatformSection />
      <StylesSection />
      <TestimonialsSection />
      <TemplatesSection />
      <GrowSection />
      <PricingSection />
      <SignupSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;

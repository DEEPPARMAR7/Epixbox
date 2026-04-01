import { ArrowRight } from "lucide-react";
import heroImg from "../assets/hero-main.jpg";

const HeroSection = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Giant Brand Name */}
      <h1 className="heading-xl text-center text-foreground mb-6 md:mb-8">
        EpixBox
      </h1>

      {/* Hero Image */}
      <div className="max-w-4xl mx-auto mb-10 md:mb-14">
        <img
          src={heroImg}
          alt="Photographer celebrating success"
          className="w-full h-[300px] md:h-[500px] object-cover"
          width={1200}
          height={800}
        />
      </div>

      {/* Tagline */}
      <div className="max-w-2xl">
        <h2 className="heading-lg text-foreground mb-4">
          Success starts here.
        </h2>
        <p className="body-lg mb-8">
          EpixBox powers your photography–and your business. You bring the visuals, we'll bring the everything else.
        </p>
        <a href="#signup" className="btn-cta">
          Try for Free <ArrowRight size={18} />
        </a>
      </div>
    </section>
  );
};

export default HeroSection;

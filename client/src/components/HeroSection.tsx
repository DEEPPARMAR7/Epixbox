import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
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
      <div className="max-w-3xl mx-auto text-center">
        <p className="font-heading text-xs uppercase tracking-[0.28em] text-muted-foreground mb-4">
          Public experience first
        </p>
        <h2 className="heading-lg text-foreground mb-4">
          Everything photographers expect before they sign up.
        </h2>
        <p className="body-lg mb-8">
          Browse features, pricing, apps, resources, and support up front. Then jump into your trial when you're ready.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup" className="btn-cta">
            Start Free Trial <ArrowRight size={18} />
          </Link>
          <a href="#browse" className="btn-outline-cta">
            Explore the Site <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

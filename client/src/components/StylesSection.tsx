import { ArrowRight } from "lucide-react";
import featuresImg from "@/assets/features-hero.jpg";

const StylesSection = () => {
  return (
    <section className="section-padding">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Content */}
        <div>
          <h2 className="heading-lg text-foreground mb-6">
            Zero-stress support for every style and subject.
          </h2>
          <p className="body-lg mb-8">
            From astrophotography to zoological portraits and everything in between, these are just a few of the businesses finding success on EpixBox.
          </p>
          <a href="#features" className="btn-outline-cta">
            Learn More <ArrowRight size={18} />
          </a>
        </div>

        {/* Image */}
        <div>
          <img
            src={featuresImg}
            alt="Surfer at sunset, representing diverse photography styles"
            className="w-full h-[350px] md:h-[500px] object-cover"
            loading="lazy"
            width={1200}
            height={800}
          />
        </div>
      </div>
    </section>
  );
};

export default StylesSection;

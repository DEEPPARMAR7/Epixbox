import { ArrowRight, Mountain } from "lucide-react";
import growImg from "../assets/grow-section.jpg";

const GrowSection = () => {
  return (
    <section className="section-padding">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Content */}
        <div>
          <h2 className="heading-lg text-foreground mb-6">
            Grow from hobbyist to studio to full business.
          </h2>
          <p className="body-lg mb-8">
            Whether you're a solo creator, a volume photography studio, a school, a camp, or a brand with multiple photographers, EpixBox scales with your workflow.
          </p>
          <a href="#pricing" className="btn-outline-cta">
            Explore Plans <ArrowRight size={18} />
          </a>
        </div>

        {/* Image */}
        <div className="relative">
          <img
            src={growImg}
            alt="Photographer on mountain ridge at sunrise"
            className="w-full h-[350px] md:h-[500px] object-cover"
            loading="lazy"
            width={1200}
            height={800}
          />
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-background/90 backdrop-blur-sm px-4 py-2">
            <Mountain size={16} className="text-foreground" />
            <span className="font-body text-sm text-muted-foreground">
              Photo by <span className="text-foreground font-medium">Jake Johnson</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GrowSection;

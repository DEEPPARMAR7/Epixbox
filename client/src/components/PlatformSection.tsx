import { ArrowRight, Mountain } from "lucide-react";
import platformImg from "../assets/platform-showcase.jpg";

const PlatformSection = () => {
  return (
    <section className="section-padding" id="features">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Image */}
        <div className="relative">
          <img
            src={platformImg}
            alt="Stunning landscape photography showcase"
            className="w-full h-[350px] md:h-[500px] object-cover"
            loading="lazy"
            width={1200}
            height={800}
          />
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-background/90 backdrop-blur-sm px-4 py-2">
            <Mountain size={16} className="text-foreground" />
            <span className="font-body text-sm text-muted-foreground">
              Photo by <span className="text-foreground font-medium">David Sauza</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div>
          <h2 className="heading-lg text-foreground mb-6">
            Get more done better.
          </h2>
          <p className="body-lg mb-8">
            Store your photos. Share the highlights. Delight your clients. Make some money. Do it all with one platform.
          </p>
          <a href="#features" className="btn-outline-cta">
            Explore Features <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default PlatformSection;

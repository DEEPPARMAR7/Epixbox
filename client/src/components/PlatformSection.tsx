import { ArrowRight, Mountain } from "lucide-react";
import platformImg from "../assets/platform-showcase.jpg";

const PlatformSection = () => {
  return (
    <section className="section-padding" id="features">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-[32px] premium-card p-3 md:p-4">
          <img
            src={platformImg}
            alt="Stunning landscape photography showcase"
            className="h-[350px] w-full object-cover md:h-[520px] rounded-[24px]"
            loading="lazy"
            width={1200}
            height={800}
          />
          <div className="absolute bottom-7 left-7 flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-white backdrop-blur-md">
            <Mountain size={16} className="text-foreground" />
            <span className="font-body text-sm text-muted-foreground">
              Photo by <span className="text-foreground font-medium">David Sauza</span>
            </span>
          </div>
        </div>

        <div>
          <p className="font-heading text-[11px] uppercase tracking-[0.32em] text-muted-foreground mb-3">
            Platform
          </p>
          <h2 className="heading-lg text-foreground mb-6 max-w-xl">
            Everything you need to run a photography business.
          </h2>
          <p className="body-lg mb-8">
            Store your photos, build your portfolio, send proofing galleries, sell prints and downloads, and manage memberships from one platform.
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

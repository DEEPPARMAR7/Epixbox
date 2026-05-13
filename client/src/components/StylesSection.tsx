import { ArrowRight } from "lucide-react";
import featuresImg from "../assets/features-hero.jpg";

const StylesSection = () => {
  return (
    <section className="section-padding">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="font-heading text-[11px] uppercase tracking-[0.32em] text-muted-foreground mb-3">
            Styles
          </p>
          <h2 className="heading-lg text-foreground mb-6 max-w-xl">
            Built for every style, subject, and client workflow.
          </h2>
          <p className="body-lg mb-8">
            From weddings and portraits to schools, teams, and branded client galleries, EpixBox is built to handle the real work photographers do every day.
          </p>
          <a href="#features" className="btn-outline-cta">
            Learn More <ArrowRight size={18} />
          </a>
        </div>

        <div className="overflow-hidden rounded-[32px] premium-card p-3 md:p-4">
          <img
            src={featuresImg}
            alt="Surfer at sunset, representing diverse photography styles"
            className="h-[350px] w-full object-cover rounded-[24px] md:h-[520px]"
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

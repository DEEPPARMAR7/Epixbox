import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImg from "../assets/hero-main.jpg";

const highlights = [
  { label: "Curated portfolios", value: "01" },
  { label: "Client proofing", value: "02" },
  { label: "Print sales", value: "03" },
];

const proofPoints = [
  "Museum-grade portfolio presentation",
  "Private client galleries with clean UX",
  "Fast checkout for prints and digital sales",
];

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden section-padding">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_hsl(var(--accent)/0.18),_transparent_30%),radial-gradient(circle_at_top_right,_hsl(205_70%_50%/0.12),_transparent_28%)]" />
      <div className="absolute left-0 top-10 -z-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute right-0 bottom-10 -z-10 h-80 w-80 rounded-full bg-slate-400/10 blur-3xl" />

      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1.05fr),minmax(420px,0.95fr)] lg:items-center">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.28em] text-foreground/70 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Built for premium photography brands
          </div>

          <h1 className="heading-xl max-w-4xl text-foreground">
            A polished home for your portfolio, proofing, and sales.
          </h1>

          <p className="body-lg mt-6 max-w-2xl">
            Present your work with a gallery-first layout, a refined admin experience, and a checkout flow that feels intentional from the first click.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link to="/signup" className="btn-cta">
              Start Free Trial <ArrowRight size={18} />
            </Link>
            <a href="#browse" className="btn-outline-cta">
              Explore the Site <ArrowRight size={18} />
            </a>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.label} className="premium-card px-4 py-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-muted-foreground">{item.value}</div>
                <div className="mt-2 text-sm font-semibold text-foreground">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-3">
            {proofPoints.map((point) => (
              <div key={point} className="flex items-center gap-3 text-sm text-foreground/70">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-accent-foreground">✓</span>
                {point}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="premium-card overflow-hidden p-3 md:p-4">
            <div className="relative overflow-hidden rounded-[22px]">
              <img
                src={heroImg}
                alt="Photographer celebrating success"
                className="h-[440px] w-full object-cover md:h-[620px]"
                width={1200}
                height={800}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-white backdrop-blur-md">Featured portfolio</span>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-white backdrop-blur-md">Private proofing</span>
                </div>
                <h2 className="mt-5 max-w-xl text-3xl font-black leading-tight text-white md:text-4xl">
                  Elegant presentation, built like a serious studio product.
                </h2>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                ['Portfolio', 'Curated layouts'],
                ['Proofing', 'Secure client flow'],
                ['Sales', 'Stripe checkout'],
              ].map(([title, value]) => (
                <div key={title} className="rounded-[20px] border border-border/70 bg-background/80 px-4 py-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{title}</div>
                  <div className="mt-2 text-base font-semibold text-foreground">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

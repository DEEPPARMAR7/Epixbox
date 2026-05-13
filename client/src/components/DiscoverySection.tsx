import { ArrowRight, BookOpen, HelpCircle, Images, LayoutGrid, Smartphone, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const discoverItems = [
  {
    title: "Features",
    description: "See uploads, galleries, proofing, selling, and branding in one place.",
    href: "/features",
    icon: LayoutGrid,
  },
  {
    title: "Pricing",
    description: "Compare plans before you register and understand what changes with each tier.",
    href: "/pricing",
    icon: Sparkles,
  },
  {
    title: "Apps",
    description: "Browse mobile-friendly and desktop workflows designed for photographers on the move.",
    href: "/apps",
    icon: Smartphone,
  },
  {
    title: "Resources",
    description: "Read tutorials, guides, webinars, and product articles before you sign up.",
    href: "/resources",
    icon: BookOpen,
  },
  {
    title: "Support",
    description: "Find help center guidance, contact paths, and account support information.",
    href: "/support",
    icon: HelpCircle,
  },
  {
    title: "Portfolio Browsing",
    description: "Explore public galleries and client-facing portfolio experiences.",
    href: "/p/demo",
    icon: Images,
  },
];

const DiscoverySection = () => {
  return (
    <section className="section-padding" id="browse">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-heading text-[11px] uppercase tracking-[0.32em] text-muted-foreground mb-3">
              Browse first
            </p>
            <h2 className="heading-lg max-w-xl text-foreground mb-4">
              The public site should answer every question before signup.
            </h2>
            <p className="body-lg">
              EpixBox gives photographers a place to explore the product before they commit.
            </p>
          </div>
          <Link to="/pricing" className="btn-outline-cta self-start">
            Compare Plans <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {discoverItems.map((item) => (
            <Link
              key={item.title}
              to={item.href}
              className="group premium-card p-6 transition-all hover:-translate-y-1 hover:border-foreground/40"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                <item.icon size={22} className="text-accent-foreground group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-heading font-bold text-sm uppercase tracking-[0.22em] text-foreground mb-2">
                {item.title}
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
                {item.description}
              </p>
              <span className="font-heading text-xs uppercase tracking-[0.22em] text-foreground inline-flex items-center gap-2">
                Explore
                <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="premium-card p-5">
            <ShieldCheck size={20} className="text-foreground mb-3" />
            <p className="font-heading text-xs uppercase tracking-[0.22em] text-foreground mb-2">Protected galleries</p>
            <p className="font-body text-sm text-muted-foreground">Password protection, expiring links, comments, favorites, and download control.</p>
          </div>
          <div className="premium-card p-5">
            <LayoutGrid size={20} className="text-foreground mb-3" />
            <p className="font-heading text-xs uppercase tracking-[0.22em] text-foreground mb-2">Business tools</p>
            <p className="font-body text-sm text-muted-foreground">Pricing, subscriptions, sales, proofing, and portfolio management from one account.</p>
          </div>
          <div className="premium-card p-5">
            <Sparkles size={20} className="text-foreground mb-3" />
            <p className="font-heading text-xs uppercase tracking-[0.22em] text-foreground mb-2">Ready for trial</p>
            <p className="font-body text-sm text-muted-foreground">A clear next step when users are ready to create an account.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiscoverySection;
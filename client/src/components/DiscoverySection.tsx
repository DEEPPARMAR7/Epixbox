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
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="font-heading text-xs uppercase tracking-[0.28em] text-muted-foreground mb-3">
              Browse first
            </p>
            <h2 className="heading-lg text-foreground mb-4">
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

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {discoverItems.map((item) => (
            <Link
              key={item.title}
              to={item.href}
              className="group border-2 border-border bg-card p-6 transition-colors hover:border-foreground"
            >
              <div className="w-12 h-12 bg-accent flex items-center justify-center mb-5 group-hover:bg-foreground transition-colors">
                <item.icon size={22} className="text-accent-foreground group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground mb-2">
                {item.title}
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
                {item.description}
              </p>
              <span className="font-heading text-xs uppercase tracking-wider text-foreground inline-flex items-center gap-2">
                Explore
                <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="border-2 border-border bg-background p-5">
            <ShieldCheck size={20} className="text-foreground mb-3" />
            <p className="font-heading text-xs uppercase tracking-wider text-foreground mb-2">Protected galleries</p>
            <p className="font-body text-sm text-muted-foreground">Password protection, expiring links, comments, favorites, and download control.</p>
          </div>
          <div className="border-2 border-border bg-background p-5">
            <LayoutGrid size={20} className="text-foreground mb-3" />
            <p className="font-heading text-xs uppercase tracking-wider text-foreground mb-2">Business tools</p>
            <p className="font-body text-sm text-muted-foreground">Pricing, subscriptions, sales, proofing, and portfolio management from one account.</p>
          </div>
          <div className="border-2 border-border bg-background p-5">
            <Sparkles size={20} className="text-foreground mb-3" />
            <p className="font-heading text-xs uppercase tracking-wider text-foreground mb-2">Ready for trial</p>
            <p className="font-body text-sm text-muted-foreground">A clear next step when users are ready to create an account.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiscoverySection;
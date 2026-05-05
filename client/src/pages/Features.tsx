import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ArrowRight, Cloud, Image, ShoppingBag, Globe, Shield, Palette, Users, BarChart3, Download, Layers, Zap, Lock, Smartphone, Search, Mail, Star, Crown, Sparkles } from "lucide-react";
import featuresHero from "../assets/features-hero.jpg";

const featureCategories = [
  {
    title: "Store & Organize",
    description: "Keep every pixel safe with full-resolution storage and structured organization.",
    features: [
      { icon: Cloud, title: "Full-Resolution Storage", desc: "Upload photos in full resolution with S3-backed storage and derivative variants." },
      { icon: Layers, title: "Smart Organization", desc: "Organize with galleries, folders, and searchable metadata so you can find work fast." },
      { icon: Shield, title: "Backup & Protection", desc: "Private galleries, expiring links, and controlled access keep your work protected." },
      { icon: Download, title: "Easy Downloads", desc: "Let clients download originals or web-ready sizes with the right access controls." },
    ],
  },
  {
    title: "Share & Showcase",
    description: "Beautiful galleries and portfolio pages that make your work shine.",
    features: [
      { icon: Globe, title: "Custom Website", desc: "Build a branded portfolio site and public home for your work." },
      { icon: Palette, title: "Customizable Templates", desc: "Choose polished templates and shape them to your brand." },
      { icon: Image, title: "Client Galleries", desc: "Share password-protected galleries where clients can favorite, comment, and download." },
      { icon: Smartphone, title: "Mobile Optimized", desc: "Every gallery is designed to work beautifully on desktop and mobile web." },
    ],
  },
  {
    title: "Sell & Grow",
    description: "Turn your portfolio into a business with built-in commerce and growth tools.",
    features: [
      { icon: ShoppingBag, title: "Print Sales", desc: "Sell prints, canvases, and products with fulfillment workflows." },
      { icon: BarChart3, title: "Business Analytics", desc: "Track sales, views, and engagement so you know what works." },
      { icon: Users, title: "Client Management", desc: "Manage clients, proofing sessions, pricing, and subscriptions in one account." },
      { icon: Zap, title: "Marketing Tools", desc: "Use SEO, sharing, and discovery pages to grow your audience." },
    ],
  },
];

const additionalFeatures = [
  { icon: Lock, title: "Privacy Controls", desc: "Granular privacy settings for every gallery and photo." },
  { icon: Search, title: "SEO Built-in", desc: "Optimized for search engines so clients can find you." },
  { icon: Mail, title: "Contact Forms", desc: "Built-in contact and booking forms for your site." },
  { icon: Smartphone, title: "Mobile Web", desc: "Upload and manage photos on the go from a mobile-friendly web experience." },
];

const subscriberOptions = [
  {
    icon: Star,
    name: "Basic",
    price: "$13/mo",
    description: "For hobbyists who want unlimited photo storage and a personal site.",
    highlights: ["Unlimited photo uploads", "Custom photo site", "Privacy controls"],
  },
  {
    icon: Sparkles,
    name: "Power",
    price: "$27/mo",
    description: "For enthusiasts who want to showcase, share, and delight clients.",
    highlights: ["Everything in Basic", "Client proofing", "Marketing tools"],
  },
  {
    icon: Crown,
    name: "Pro",
    price: "$36/mo",
    description: "For professionals who want to sell, grow, and run their business.",
    highlights: ["Everything in Power", "Print and digital sales", "Advanced analytics"],
  },
];

const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="section-padding text-center">
        <h1 className="heading-xl text-foreground mb-4">
          Do more of what you love.
        </h1>
        <p className="font-heading text-sm tracking-wider text-muted-foreground mb-8">
          (We'll handle the rest.)
        </p>
        <Link to="/signup" className="btn-cta mb-10">
          Try it Free <ArrowRight size={18} />
        </Link>
        <div className="max-w-5xl mx-auto mt-10">
          <img
            src={featuresHero}
            alt="Photographer with surfboard at sunset"
            className="w-full h-[300px] md:h-[500px] object-cover"
            width={1200}
            height={800}
          />
        </div>
      </section>

      {/* Feature Categories */}
      {featureCategories.map((cat, idx) => (
        <section key={cat.title} className={`section-padding ${idx % 2 === 1 ? "bg-card" : ""}`}>
          <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              <h2 className="heading-lg text-foreground mb-3">{cat.title}</h2>
              <p className="body-lg">{cat.description}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {cat.features.map((f) => (
                <div key={f.title} className="group">
                  <div className="w-12 h-12 bg-accent flex items-center justify-center mb-4 group-hover:bg-foreground transition-colors">
                    <f.icon size={24} className="text-accent-foreground group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground mb-2">
                    {f.title}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Additional Features */}
      <section className="section-padding bg-foreground text-primary-foreground">
        <div className="max-w-6xl mx-auto">
          <h2 className="heading-lg text-primary-foreground mb-12 text-center">
            And so much more.
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {additionalFeatures.map((f) => (
              <div key={f.title} className="text-center">
                <div className="w-12 h-12 bg-accent flex items-center justify-center mb-4 mx-auto">
                  <f.icon size={24} className="text-accent-foreground" />
                </div>
                <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-primary-foreground mb-2">
                  {f.title}
                </h3>
                <p className="font-body text-sm text-primary-foreground/70 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/signup" className="btn-cta">
              Start Your Free Trial <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Subscribers */}
      <section className="section-padding bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 text-center">
            <p className="font-heading text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
              Subscriber Options
            </p>
            <h2 className="heading-lg text-foreground mb-3">Choose the plan that fits your studio</h2>
            <p className="body-lg max-w-2xl mx-auto">
              Start with a 14-day free trial, then upgrade as your photography business grows.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {subscriberOptions.map((option, idx) => (
              <div
                key={option.name}
                className={`border-2 p-6 ${idx === 2 ? "border-foreground bg-foreground text-primary-foreground" : "border-border bg-background"}`}
              >
                <div className={`w-12 h-12 flex items-center justify-center mb-4 ${idx === 2 ? "bg-accent text-accent-foreground" : "bg-accent"}`}>
                  <option.icon size={22} />
                </div>
                <h3 className="font-heading font-bold text-sm uppercase tracking-wider mb-2">{option.name}</h3>
                <p className={`font-heading text-3xl font-bold mb-3 ${idx === 2 ? "text-primary-foreground" : "text-foreground"}`}>{option.price}</p>
                <p className={`font-body text-sm mb-5 ${idx === 2 ? "text-primary-foreground/75" : "text-muted-foreground"}`}>{option.description}</p>
                <ul className="space-y-2 mb-6">
                  {option.highlights.map((item) => (
                    <li key={item} className={`font-body text-sm ${idx === 2 ? "text-primary-foreground/90" : "text-foreground"}`}>
                      • {item}
                    </li>
                  ))}
                </ul>
                <Link to="/pricing" className={idx === 2 ? "btn-cta" : "btn-outline-cta"}>
                  View Plan
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link to="/signup" className="btn-cta">
              Start Subscriber Trial <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FeaturesPage;

import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, Cloud, Image, ShoppingBag, Globe, Shield, Palette, Users, BarChart3, Download, Layers, Zap, Lock, Smartphone, Search, Mail } from "lucide-react";
import featuresHero from "@/assets/features-hero.jpg";

const featureCategories = [
  {
    title: "Store & Organize",
    description: "Keep every pixel safe with unlimited, full-resolution storage.",
    features: [
      { icon: Cloud, title: "Unlimited Storage", desc: "Upload unlimited photos and videos in full resolution. No compression, no limits." },
      { icon: Layers, title: "Smart Organization", desc: "Auto-organize with AI-powered keywords, folders, and galleries. Find any photo in seconds." },
      { icon: Shield, title: "Backup & Protection", desc: "Military-grade encryption and automatic backups. Your work is always safe." },
      { icon: Download, title: "Easy Downloads", desc: "Let clients download originals, web-sized, or custom sizes with one click." },
    ],
  },
  {
    title: "Share & Showcase",
    description: "Beautiful galleries that make your work shine.",
    features: [
      { icon: Globe, title: "Custom Website", desc: "Build a stunning portfolio site with drag-and-drop ease. Your domain, your brand." },
      { icon: Palette, title: "Customizable Templates", desc: "Choose from dozens of gorgeous templates and make them uniquely yours." },
      { icon: Image, title: "Client Galleries", desc: "Share password-protected galleries. Clients can favorite, comment, and download." },
      { icon: Smartphone, title: "Mobile Optimized", desc: "Every gallery looks perfect on any device. Beautiful from desktop to phone." },
    ],
  },
  {
    title: "Sell & Grow",
    description: "Turn your passion into profit with built-in commerce.",
    features: [
      { icon: ShoppingBag, title: "Print Sales", desc: "Sell prints, canvases, and products with automated fulfillment. You shoot, we ship." },
      { icon: BarChart3, title: "Business Analytics", desc: "Track sales, views, and engagement. Know what's working and grow smarter." },
      { icon: Users, title: "Client Management", desc: "CRM tools to manage clients, invoices, and bookings all in one place." },
      { icon: Zap, title: "Marketing Tools", desc: "Email campaigns, SEO tools, and social sharing to grow your audience." },
    ],
  },
];

const additionalFeatures = [
  { icon: Lock, title: "Privacy Controls", desc: "Granular privacy settings for every gallery and photo." },
  { icon: Search, title: "SEO Built-in", desc: "Optimized for search engines so clients can find you." },
  { icon: Mail, title: "Contact Forms", desc: "Built-in contact and booking forms for your site." },
  { icon: Smartphone, title: "Mobile App", desc: "Upload and manage photos on the go with our mobile app." },
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

      <Footer />
    </div>
  );
};

export default FeaturesPage;

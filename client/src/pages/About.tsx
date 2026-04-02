import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ArrowRight, Camera, Heart, Globe, Users, Zap, Shield } from "lucide-react";

const values = [
  {
    icon: Camera,
    title: "Built for Photographers",
    desc: "Every feature is designed with photographers in mind — from the way you upload to the way clients experience your work.",
  },
  {
    icon: Heart,
    title: "Passion-First",
    desc: "We believe photography is more than a job. EpixBox exists so you can spend less time on admin and more time behind the lens.",
  },
  {
    icon: Globe,
    title: "Global Community",
    desc: "Thousands of photographers across the world trust EpixBox to run their businesses and showcase their art.",
  },
  {
    icon: Shield,
    title: "Your Work, Protected",
    desc: "Military-grade encryption and automatic backups keep every photo safe. Your creative work is always secure with us.",
  },
  {
    icon: Zap,
    title: "Always Evolving",
    desc: "We ship new features every week, guided by feedback from our community of photographers.",
  },
  {
    icon: Users,
    title: "People Behind the Pixels",
    desc: "Our small, dedicated team is made up of photographers and engineers who care deeply about the craft.",
  },
];

const stats = [
  { value: "50K+", label: "Photographers" },
  { value: "200M+", label: "Photos Stored" },
  { value: "120+", label: "Countries" },
  { value: "99.9%", label: "Uptime" },
];

const team = [
  { name: "Alex Rivera", role: "Co-founder & CEO", bio: "Wedding photographer turned builder. Started EpixBox after losing a hard drive full of irreplaceable client work." },
  { name: "Jordan Lee", role: "Co-founder & CTO", bio: "Full-stack engineer with a love for film photography. Obsessed with making complex things feel simple." },
  { name: "Sam Patel", role: "Head of Product", bio: "Former photo editor at a major magazine. Brings a deep understanding of how photographers actually work." },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="section-padding text-center">
        <h1 className="heading-xl text-foreground mb-6">
          About EpixBox
        </h1>
        <p className="body-lg max-w-2xl mx-auto">
          EpixBox is the all-in-one platform photographers use to store, share, and sell their work — built by photographers, for photographers.
        </p>
      </section>

      {/* Mission */}
      <section className="section-padding bg-card">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="heading-lg text-foreground mb-6">Our Mission</h2>
          <p className="body-lg">
            We started EpixBox with one simple goal: give photographers the tools to run a thriving business without sacrificing the time they spend creating. From safe cloud storage to stunning client galleries, from seamless proofing to built-in e-commerce — EpixBox handles the business side so you can focus on the art.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding bg-foreground text-primary-foreground">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-heading font-bold text-4xl md:text-6xl text-accent mb-2">{s.value}</p>
              <p className="font-heading text-xs uppercase tracking-wider text-primary-foreground/70">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="section-padding">
        <div className="max-w-6xl mx-auto">
          <h2 className="heading-lg text-foreground mb-12 text-center">What We Stand For</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((v) => (
              <div key={v.title} className="group">
                <div className="w-12 h-12 bg-accent flex items-center justify-center mb-4 group-hover:bg-foreground transition-colors">
                  <v.icon size={24} className="text-accent-foreground group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground mb-2">
                  {v.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-padding bg-card">
        <div className="max-w-5xl mx-auto">
          <h2 className="heading-lg text-foreground mb-12 text-center">Meet the Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member) => (
              <div key={member.name} className="border-2 border-border p-8 hover:border-foreground transition-colors">
                <div className="w-16 h-16 bg-accent flex items-center justify-center mb-4">
                  <span className="font-heading font-bold text-xl text-accent-foreground">
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground mb-1">
                  {member.name}
                </h3>
                <p className="font-heading text-xs text-accent-foreground uppercase tracking-wider mb-3">
                  {member.role}
                </p>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding text-center">
        <h2 className="heading-md text-foreground mb-4">Join thousands of photographers.</h2>
        <p className="body-lg max-w-xl mx-auto mb-8">
          Start your free trial today — no credit card required.
        </p>
        <Link to="/signup" className="btn-cta">
          Get Started Free <ArrowRight size={18} />
        </Link>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, BookOpen, Video, HelpCircle, MessageCircle, FileText, Users } from "lucide-react";
import { Link } from "react-router-dom";

const resources = [
  { icon: BookOpen, title: "Blog", desc: "Tips, tutorials, and inspiration for photographers at every level.", link: "#", count: "200+ articles" },
  { icon: Video, title: "Webinars", desc: "Live and on-demand sessions with photography and business experts.", link: "#", count: "Weekly sessions" },
  { icon: HelpCircle, title: "Help Center", desc: "Step-by-step guides and answers to common questions.", link: "#", count: "500+ articles" },
  { icon: MessageCircle, title: "Community Forum", desc: "Connect with fellow photographers, share tips, and get feedback.", link: "#", count: "10K+ members" },
  { icon: FileText, title: "API Documentation", desc: "Build custom integrations and extend EpixBox with our REST API.", link: "#", count: "Full API access" },
  { icon: Users, title: "Partner Program", desc: "Earn commissions by referring photographers to EpixBox.", link: "#", count: "30% commission" },
];

const blogPosts = [
  { title: "10 Tips for Stunning Landscape Photography", category: "Tutorial", readTime: "8 min read" },
  { title: "How to Price Your Photography Services in 2026", category: "Business", readTime: "12 min read" },
  { title: "Client Gallery Best Practices", category: "Guide", readTime: "6 min read" },
  { title: "SEO for Photographers: The Complete Guide", category: "Marketing", readTime: "15 min read" },
  { title: "Building a Photography Brand That Stands Out", category: "Business", readTime: "10 min read" },
  { title: "Print vs Digital: Maximizing Your Revenue Streams", category: "Business", readTime: "7 min read" },
];

const ResourcesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="section-padding text-center">
        <h1 className="heading-xl text-foreground mb-4">Resources</h1>
        <p className="body-lg max-w-2xl mx-auto">
          Everything you need to grow your photography business — tutorials, guides, community, and more.
        </p>
      </section>

      {/* Resource Cards */}
      <section className="section-padding pt-0">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {resources.map((r) => (
            <a key={r.title} href={r.link} className="bg-card border-2 border-border p-8 hover:border-foreground transition-colors group">
              <div className="w-12 h-12 bg-accent flex items-center justify-center mb-4 group-hover:bg-foreground transition-colors">
                <r.icon size={24} className="text-accent-foreground group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground mb-2">{r.title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">{r.desc}</p>
              <span className="font-heading text-xs text-accent-foreground uppercase tracking-wider">{r.count}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Blog Posts */}
      <section className="section-padding bg-card">
        <div className="max-w-4xl mx-auto">
          <h2 className="heading-lg text-foreground mb-10 text-center">Latest from the blog</h2>
          <div className="space-y-0 border-t-2 border-foreground">
            {blogPosts.map((post) => (
              <a key={post.title} href="#" className="flex items-center justify-between py-5 border-b border-border hover:bg-background/50 px-4 -mx-4 transition-colors">
                <div>
                  <span className="font-heading text-xs uppercase tracking-wider text-accent-foreground mr-3">{post.category}</span>
                  <span className="font-body text-sm md:text-base text-foreground font-medium">{post.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-body text-xs text-muted-foreground hidden md:block">{post.readTime}</span>
                  <ArrowRight size={16} className="text-muted-foreground" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding text-center">
        <h2 className="heading-md text-foreground mb-4">Ready to get started?</h2>
        <p className="body-lg max-w-xl mx-auto mb-8">
          Join thousands of photographers building their dream business with EpixBox.
        </p>
        <Link to="/signup" className="btn-cta">
          Start Free Trial <ArrowRight size={18} />
        </Link>
      </section>

      <Footer />
    </div>
  );
};

export default ResourcesPage;

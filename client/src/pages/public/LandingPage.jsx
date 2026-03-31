import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ArrowRight, Mountain, Check } from 'lucide-react'
import BrandLogo from '@/components/BrandLogo'

// Navbar Component
const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { label: 'features', href: '/#features' },
    { label: 'pricing', href: '/#pricing' },
    { label: 'resources', href: '/resources' },
    { label: 'log in', href: '/login' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-6 md:px-12 lg:px-20 h-16 md:h-20">
        <Link to="/" aria-label="EpixBox home" className="text-foreground">
          <BrandLogo textClassName="text-xl md:text-2xl" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={`font-heading text-sm tracking-wide transition-colors ${
                location.pathname === link.href
                  ? "text-accent-foreground underline underline-offset-4"
                  : "text-foreground hover:text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/register" className="btn-cta text-xs py-3 px-6">
            try free
          </Link>
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-background border-t border-border px-6 py-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="block font-heading text-sm tracking-wide text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/register" className="btn-cta text-xs py-3 px-6 w-full justify-center" onClick={() => setMobileOpen(false)}>
            try free
          </Link>
        </div>
      )}
    </nav>
  )
}

// Hero Section
const HeroSection = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      <h1 className="heading-xl text-center text-foreground mb-6 md:mb-8">
        EpixBox
      </h1>

      <div className="max-w-4xl mx-auto mb-10 md:mb-14">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&q=80"
          alt="Photographer celebrating success"
          className="w-full h-[300px] md:h-[500px] object-cover"
          width={1200}
          height={800}
        />
      </div>

      <div className="max-w-2xl">
        <h2 className="heading-lg text-foreground mb-4">
          Success starts here.
        </h2>
        <p className="body-lg mb-8">
          EpixBox powers your photography–and your business. You bring the visuals, we'll bring the everything else.
        </p>
        <Link to="/register" className="btn-cta">
          Try for Free <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  )
}

// Platform Section
const PlatformSection = () => {
  return (
    <section className="section-padding" id="features">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&q=80"
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
  )
}

// Styles Section
const StylesSection = () => {
  return (
    <section className="section-padding">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="heading-lg text-foreground mb-6">
            Zero-stress support for every style and subject.
          </h2>
          <p className="body-lg mb-8">
            From astrophotography to zoological portraits and everything in between, these are just a few of the businesses finding success on EpixBox.
          </p>
          <a href="#features" className="btn-outline-cta">
            Learn More <ArrowRight size={18} />
          </a>
        </div>

        <div>
          <img
            src="https://images.unsplash.com/photo-1500595046891-d7a0d8ed4f8d?w=1200&h=800&q=80"
            alt="Surfer at sunset, representing diverse photography styles"
            className="w-full h-[350px] md:h-[500px] object-cover"
            loading="lazy"
            width={1200}
            height={800}
          />
        </div>
      </div>
    </section>
  )
}

// Templates Section
const TemplatesSection = () => {
  const templates = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=800&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=800&q=80',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&h=800&q=80',
    'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&h=800&q=80',
  ]

  return (
    <section className="section-padding">
      <h2 className="heading-lg text-foreground mb-12 text-center">
        Show off with gorgeous drag-and-drop site templates.
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-4">
          <img src={templates[0]} alt="Nature photography template" className="w-full h-[250px] md:h-[350px] object-cover" loading="lazy" width={600} height={800} />
        </div>
        <div className="space-y-4 mt-8">
          <img src={templates[1]} alt="Portrait photography template" className="w-full h-[250px] md:h-[350px] object-cover" loading="lazy" width={600} height={800} />
        </div>
        <div className="space-y-4">
          <img src={templates[2]} alt="Street photography template" className="w-full h-[250px] md:h-[350px] object-cover" loading="lazy" width={600} height={800} />
        </div>
        <div className="space-y-4 mt-8">
          <img src={templates[3]} alt="Landscape photography template" className="w-full h-[250px] md:h-[350px] object-cover" loading="lazy" width={600} height={800} />
        </div>
      </div>
    </section>
  )
}

// Testimonials Section
const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "The amount of time we save with the built-in sales tools is amazing. Literally, other than taking the photo, there's not a single aspect of our business that's not run through EpixBox.",
      name: "Sarah Mitchell",
      business: "Mitchell Photography",
      tags: ["WEDDINGS", "PORTRAITS"],
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&q=80",
    },
    {
      quote: "EpixBox made it incredibly easy to deliver galleries and sell prints. My clients love the experience.",
      name: "James Carter",
      business: "Carter Visuals",
      tags: ["SPORTS", "EVENTS"],
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&q=80",
    },
    {
      quote: "I switched from three different platforms to just EpixBox. Everything I need is in one place.",
      name: "Linda Torres",
      business: "Torres Fine Art",
      tags: ["LANDSCAPE", "FINE ART"],
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&q=80",
    },
  ]

  return (
    <section className="section-padding">
      <div className="grid lg:grid-cols-[300px_1fr] gap-8 mb-16">
        <div className="flex-shrink-0">
          <img
            src={testimonials[0].image}
            alt={testimonials[0].name}
            className="w-full h-[300px] lg:h-full object-cover"
            loading="lazy"
            width={512}
            height={512}
          />
        </div>
        <div className="flex flex-col justify-center">
          <blockquote className="text-xl md:text-2xl lg:text-3xl font-body text-foreground leading-relaxed mb-6">
            "{testimonials[0].quote}"
          </blockquote>
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground">
              {testimonials[0].name}
            </h4>
            <a href="#" className="font-body text-muted-foreground underline text-sm">
              {testimonials[0].business}
            </a>
            <div className="flex gap-2 mt-3">
              {testimonials[0].tags.map((tag) => (
                <span key={tag} className="font-heading text-xs tracking-wider bg-secondary text-secondary-foreground px-3 py-1">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {testimonials.slice(1).map((t) => (
          <div key={t.name} className="flex gap-4 items-start">
            <img
              src={t.image}
              alt={t.name}
              className="w-20 h-20 object-cover flex-shrink-0"
              loading="lazy"
              width={512}
              height={512}
            />
            <div>
              <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground">
                {t.name}
              </h4>
              <a href="#" className="font-body text-muted-foreground underline text-sm">
                {t.business}
              </a>
              <div className="flex gap-2 mt-2">
                {t.tags.map((tag) => (
                  <span key={tag} className="font-heading text-xs tracking-wider bg-secondary text-secondary-foreground px-3 py-1">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <h3 className="heading-md text-foreground mb-6">
          Don't just take their words for it. Find a plan that fits <span className="italic">your vision</span>.
        </h3>
        <a href="#pricing" className="btn-outline-cta">
          Explore Plans <ArrowRight size={18} />
        </a>
      </div>
    </section>
  )
}

// Grow Section
const GrowSection = () => {
  return (
    <section className="section-padding">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="heading-lg text-foreground mb-6">
            Grow with the flow.
          </h2>
          <p className="body-lg mb-8">
            Whether you're a two-person team, a volume photography studio, an organization like a school or camp, or even multiple photo businesses under one roof, EpixBox adapts to your needs and scales with your growth.
          </p>
          <a href="#pricing" className="btn-outline-cta">
            Explore Plans <ArrowRight size={18} />
          </a>
        </div>

        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&q=80"
            alt="Photographer on mountain ridge at sunrise"
            className="w-full h-[350px] md:h-[500px] object-cover"
            loading="lazy"
            width={1200}
            height={800}
          />
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-background/90 backdrop-blur-sm px-4 py-2">
            <Mountain size={16} className="text-foreground" />
            <span className="font-body text-sm text-muted-foreground">
              Photo by <span className="text-foreground font-medium">Jake Johnson</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

// Pricing Section
const PricingSection = () => {
  const plans = [
    {
      name: "Basic",
      price: "13",
      period: "/mo",
      description: "For hobbyists who want unlimited photo storage.",
      features: [
        "Unlimited photo uploads",
        "Custom photo site",
        "Basic customization",
        "Privacy controls",
        "24/7 support",
      ],
      featured: false,
    },
    {
      name: "Power",
      price: "27",
      period: "/mo",
      description: "For enthusiasts who want to showcase and share.",
      features: [
        "Everything in Basic",
        "Advanced customization",
        "Client proofing",
        "Photo downloads",
        "Marketing tools",
        "Portfolio website",
      ],
      featured: true,
    },
    {
      name: "Pro",
      price: "36",
      period: "/mo",
      description: "For professionals who want to sell and grow.",
      features: [
        "Everything in Power",
        "Print sales & fulfillment",
        "Digital download sales",
        "Custom price lists",
        "Coupons & discounts",
        "Business analytics",
        "Priority support",
      ],
      featured: false,
    },
  ]

  return (
    <section className="section-padding" id="pricing">
      <div className="text-center mb-16">
        <h2 className="heading-lg text-foreground mb-4">
          Simple, transparent pricing.
        </h2>
        <p className="body-lg max-w-2xl mx-auto">
          Start with a 14-day free trial. No credit card required. Upgrade, downgrade, or cancel anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`p-8 border-2 transition-all ${
              plan.featured
                ? "border-foreground bg-foreground text-primary-foreground"
                : "border-border bg-card text-card-foreground"
            }`}
          >
            <h3 className="font-heading font-bold text-lg uppercase tracking-wider mb-2">
              {plan.name}
            </h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-heading font-bold">${plan.price}</span>
              <span className={`text-sm font-body ${plan.featured ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {plan.period}
              </span>
            </div>
            <p className={`text-sm font-body mb-6 ${plan.featured ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
              {plan.description}
            </p>
            <ul className="space-y-3 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm font-body">
                  <Check size={16} className={`mt-0.5 flex-shrink-0 ${plan.featured ? "text-accent" : "text-foreground"}`} />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className={`w-full justify-center block text-center ${plan.featured ? "btn-cta" : "btn-outline-cta"}`}
            >
              Start Trial <ArrowRight size={16} />
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}

// Footer
const Footer = () => {
  const footerLinks = {
    Product: ["Features", "Pricing", "Templates", "Portfolio Sites", "Client Galleries"],
    Resources: ["Blog", "Help Center", "Community", "Webinars", "API"],
    Company: ["About", "Careers", "Press", "Contact", "Partners"],
    Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "DMCA"],
  }

  return (
    <footer className="bg-foreground text-primary-foreground section-padding">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
        <div className="col-span-2 md:col-span-1">
          <div className="mb-4">
            <BrandLogo theme="dark" textClassName="text-2xl" />
          </div>
          <p className="font-body text-sm text-primary-foreground/70 leading-relaxed">
            The all-in-one platform for photographers to store, share, and sell.
          </p>
        </div>

        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider mb-4">
              {title}
            </h4>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link}>
                  <a href="#" className="font-body text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-body text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} EpixBox. All rights reserved.
        </p>
        <div className="flex gap-6">
          <a href="#" className="font-body text-sm text-primary-foreground/50 hover:text-primary-foreground transition-colors">
            Twitter
          </a>
          <a href="#" className="font-body text-sm text-primary-foreground/50 hover:text-primary-foreground transition-colors">
            Instagram
          </a>
          <a href="#" className="font-body text-sm text-primary-foreground/50 hover:text-primary-foreground transition-colors">
            YouTube
          </a>
        </div>
      </div>
    </footer>
  )
}

// Main Landing Page
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <PlatformSection />
      <StylesSection />
      <TemplatesSection />
      <TestimonialsSection />
      <GrowSection />
      <PricingSection />
      <Footer />
    </div>
  )
}

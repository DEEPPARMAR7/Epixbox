import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, ArrowRight, Check, Mountain } from 'lucide-react'

// Navbar Component
const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { label: 'features', href: '/#features' },
    { label: 'pricing', href: '/#pricing' },
    { label: 'resources', href: '/resources' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 md:px-12 lg:px-20 h-16 md:h-20 max-w-7xl mx-auto w-full">
        <Link to="/" className="text-2xl font-bold text-black">
          EpicBox
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm tracking-wide transition-colors text-gray-700 hover:text-black capitalize"
            >
              {link.label}
            </a>
          ))}
          <Link to="/register" className="bg-black text-white text-xs py-3 px-6 hover:bg-gray-800 transition">
            try free
          </Link>
        </div>

        <button
          className="md:hidden text-black"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-6 py-6 space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block text-sm tracking-wide text-gray-700 capitalize"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link to="/register" className="block w-full bg-black text-white text-xs py-3 px-6 text-center hover:bg-gray-800 transition" onClick={() => setMobileOpen(false)}>
            try free
          </Link>
        </div>
      )}
    </nav>
  )
}

// Hero Section Component
const HeroSection = () => {
  return (
    <section className="py-20 md:py-32 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold text-black text-center mb-8">
          EpicBox
        </h1>

        <div className="max-w-4xl mx-auto mb-12">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&q=80"
            alt="Photographer celebrating success"
            className="w-full h-[300px] md:h-[500px] object-cover"
          />
        </div>

        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Success starts here.
          </h2>
          <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
            EpicBox powers your photography–and your business. You bring the visuals, we'll bring the everything else.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-black text-white font-semibold py-4 px-8 hover:bg-gray-800 transition">
            Try for Free <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}

// Platform Section
const PlatformSection = () => {
  return (
    <section className="py-20 md:py-32 px-6 md:px-12 lg:px-20" id="features">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&q=80"
              alt="Stunning landscape photography showcase"
              className="w-full h-[350px] md:h-[500px] object-cover"
            />
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 w-fit mt-4">
              <Mountain size={16} className="text-black" />
              <span className="text-sm text-gray-700">
                Photo by <span className="text-black font-medium">David Sauza</span>
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Get more done better.
            </h2>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Store your photos. Share the highlights. Delight your clients. Make some money. Do it all with one platform.
            </p>
            <a href="#features" className="inline-flex items-center gap-2 border-2 border-black text-black font-semibold py-3 px-8 hover:bg-black hover:text-white transition">
              Explore Features <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

// Styles Section
const StylesSection = () => {
  return (
    <section className="py-20 md:py-32 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Zero-stress support for every style and subject.
            </h2>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              From astrophotography to zoological portraits and everything in between, these are just a few of the businesses finding success on EpicBox.
            </p>
            <a href="#features" className="inline-flex items-center gap-2 border-2 border-black text-black font-semibold py-3 px-8 hover:bg-black hover:text-white transition">
              Learn More <ArrowRight size={18} />
            </a>
          </div>

          <div>
            <img
              src="https://images.unsplash.com/photo-1500595046891-d7a0d8ed4f8d?w=1200&h=800&q=80"
              alt="Surfer at sunset, representing diverse photography styles"
              className="w-full h-[350px] md:h-[500px] object-cover"
            />
          </div>
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
    <section className="py-20 md:py-32 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-black mb-16 text-center">
          Show off with gorgeous drag-and-drop site templates.
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-4">
            <img src={templates[0]} alt="Nature photography template" className="w-full h-[250px] md:h-[350px] object-cover" />
          </div>
          <div className="space-y-4 mt-8">
            <img src={templates[1]} alt="Portrait photography template" className="w-full h-[250px] md:h-[350px] object-cover" />
          </div>
          <div className="space-y-4">
            <img src={templates[2]} alt="Street photography template" className="w-full h-[250px] md:h-[350px] object-cover" />
          </div>
          <div className="space-y-4 mt-8">
            <img src={templates[3]} alt="Landscape photography template" className="w-full h-[250px] md:h-[350px] object-cover" />
          </div>
        </div>
      </div>
    </section>
  )
}

// Testimonials Section
const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "The amount of time we save with the built-in sales tools is amazing. Literally, other than taking the photo, there's not a single aspect of our business that's not run through EpicBox.",
      name: "Sarah Mitchell",
      business: "Mitchell Photography",
      tags: ["WEDDINGS", "PORTRAITS"],
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&q=80",
    },
    {
      quote: "EpicBox made it incredibly easy to deliver galleries and sell prints. My clients love the experience.",
      name: "James Carter",
      business: "Carter Visuals",
      tags: ["SPORTS", "EVENTS"],
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&q=80",
    },
    {
      quote: "I switched from three different platforms to just EpicBox. Everything I need is in one place.",
      name: "Linda Torres",
      business: "Torres Fine Art",
      tags: ["LANDSCAPE", "FINE ART"],
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&q=80",
    },
  ]

  return (
    <section className="py-20 md:py-32 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Featured testimonial */}
        <div className="grid lg:grid-cols-[300px_1fr] gap-8 mb-16">
          <div>
            <img
              src={testimonials[0].image}
              alt={testimonials[0].name}
              className="w-full h-[300px] lg:h-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center">
            <blockquote className="text-2xl md:text-3xl lg:text-4xl font-light text-black leading-relaxed mb-8">
              "{testimonials[0].quote}"
            </blockquote>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-black mb-1">
                {testimonials[0].name}
              </h4>
              <a href="#" className="text-gray-700 underline text-sm mb-3 block">
                {testimonials[0].business}
              </a>
              <div className="flex gap-2 flex-wrap">
                {testimonials[0].tags.map((tag) => (
                  <span key={tag} className="text-xs tracking-wider bg-gray-200 text-black px-3 py-1">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Other testimonials */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {testimonials.slice(1).map((t) => (
            <div key={t.name} className="flex gap-4 items-start">
              <img
                src={t.image}
                alt={t.name}
                className="w-20 h-20 object-cover flex-shrink-0"
              />
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-black mb-1">
                  {t.name}
                </h4>
                <a href="#" className="text-gray-700 underline text-sm block mb-2">
                  {t.business}
                </a>
                <div className="flex gap-2 flex-wrap">
                  {t.tags.map((tag) => (
                    <span key={tag} className="text-xs tracking-wider bg-gray-200 text-black px-3 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center border-t pt-12">
          <h3 className="text-2xl md:text-3xl font-bold text-black mb-6">
            Don't just take their words for it. Find a plan that fits <span className="italic">your vision</span>.
          </h3>
          <a href="#pricing" className="inline-flex items-center gap-2 border-2 border-black text-black font-semibold py-3 px-8 hover:bg-black hover:text-white transition">
            Explore Plans <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  )
}

// Grow Section
const GrowSection = () => {
  return (
    <section className="py-20 md:py-32 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Grow with the flow.
            </h2>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Whether you're a two-person team, a volume photography studio, an organization like a school or camp, or even multiple photo businesses under one roof, EpicBox adapts to your needs and scales with your growth.
            </p>
            <a href="#pricing" className="inline-flex items-center gap-2 border-2 border-black text-black font-semibold py-3 px-8 hover:bg-black hover:text-white transition">
              Explore Plans <ArrowRight size={18} />
            </a>
          </div>

          <div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&q=80"
                alt="Photographer on mountain ridge at sunrise"
                className="w-full h-[350px] md:h-[500px] object-cover"
              />
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 w-fit mt-4">
                <Mountain size={16} className="text-black" />
                <span className="text-sm text-gray-700">
                  Photo by <span className="text-black font-medium">Jake Johnson</span>
                </span>
              </div>
            </div>
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
    <section className="py-20 md:py-32 px-6 md:px-12 lg:px-20" id="pricing">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Simple, transparent pricing.
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Start with a 14-day free trial. No credit card required. Upgrade, downgrade, or cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-8 border-2 transition-all ${
                plan.featured
                  ? "border-black bg-black text-white"
                  : "border-gray-300 bg-white text-black"
              }`}
            >
              <h3 className="font-bold text-lg uppercase tracking-wider mb-2">
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className={`text-sm ${plan.featured ? "text-white/70" : "text-gray-700"}`}>
                  {plan.period}
                </span>
              </div>
              <p className={`text-sm mb-6 ${plan.featured ? "text-white/80" : "text-gray-700"}`}>
                {plan.description}
              </p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check size={16} className={`mt-0.5 flex-shrink-0 ${plan.featured ? "text-white" : "text-black"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className={`w-full block text-center py-3 font-semibold transition ${
                  plan.featured
                    ? "bg-white text-black hover:bg-gray-200"
                    : "bg-black text-white hover:bg-gray-800 border-2 border-black"
                }`}
              >
                Start Trial
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Footer Component
const Footer = () => {
  const footerLinks = {
    Product: ["Features", "Pricing", "Templates", "Portfolio Sites", "Client Galleries"],
    Resources: ["Blog", "Help Center", "Community", "Webinars", "API"],
    Company: ["About", "Careers", "Press", "Contact", "Partners"],
    Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "DMCA"],
  }

  return (
    <footer className="bg-black text-white py-20 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-2xl font-bold mb-4">EpicBox</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              The all-in-one platform for photographers to store, share, and sell.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-4">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/50">
            © {new Date().getFullYear()} EpicBox. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-white/50 hover:text-white transition-colors">
              Twitter
            </a>
            <a href="#" className="text-sm text-white/50 hover:text-white transition-colors">
              Instagram
            </a>
            <a href="#" className="text-sm text-white/50 hover:text-white transition-colors">
              YouTube
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Main Landing Page
export default function LandingPage() {
  return (
    <div className="bg-white text-black font-sans">
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

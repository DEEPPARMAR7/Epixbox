import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'

const HERO_PHOTOS = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1920&q=80',
]

const GRID_PHOTOS = [
  { src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80', span: 'row-span-2' },
  { src: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80', span: '' },
  { src: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&q=80', span: '' },
  { src: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80', span: 'row-span-2' },
  { src: 'https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=600&q=80', span: '' },
  { src: 'https://images.unsplash.com/photo-1502657877623-f66bf489d236?w=600&q=80', span: '' },
]

const platformFeatures = [
  {
    icon: '📸',
    title: 'Smart Photo Management',
    desc: 'Automatic EXIF extraction, intelligent tagging, and powerful search. Find any photo in seconds.',
    benefit: 'Save hours organizing'
  },
  {
    icon: '🎯',
    title: 'Client-First Design',
    desc: 'Password-protected galleries, download permissions, and custom watermarks. Full control.',
    benefit: 'Professional delivery'
  },
  {
    icon: '💳',
    title: 'Integrated Commerce',
    desc: 'Sell prints, digital files, and photo packages. Payments handled automatically via Stripe.',
    benefit: 'Monetize instantly'
  },
  {
    icon: '⚡',
    title: 'Lightning-Fast Delivery',
    desc: 'Global CDN ensures your images load instantly anywhere in the world.',
    benefit: 'Impress every client'
  },
]

const galleryStyles = [
  {
    name: 'Classic Grid',
    desc: 'Clean, uniform layout perfect for portfolios',
    preview: 'https://images.unsplash.com/photo-1452457807411-4979b707c5be?w=800&q=80',
    cols: 'grid-cols-3',
  },
  {
    name: 'Masonry',
    desc: 'Dynamic, Pinterest-style cascading layout',
    preview: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    cols: 'row-span-2',
  },
  {
    name: 'Slideshow',
    desc: 'Full-screen presentation with auto-advance',
    preview: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80',
    cols: 'grid-cols-3',
  },
]

const templates = [
  {
    name: 'Minimal',
    desc: 'Clean, modern design that puts photos first',
    image: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=600&q=80',
    tag: 'Most Popular'
  },
  {
    name: 'Editorial',
    desc: 'Magazine-style layout for storytelling',
    image: 'https://images.unsplash.com/photo-1618004912476-29818d81ae2e?w=600&q=80',
    tag: null
  },
  {
    name: 'Bold',
    desc: 'Make a statement with dramatic full-screen',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80',
    tag: 'New'
  },
]

const growthFeatures = [
  {
    icon: '📊',
    title: 'Analytics Dashboard',
    desc: 'Track views, engagement, and sales. Understand what resonates with your audience.',
  },
  {
    icon: '📧',
    title: 'Email Marketing',
    desc: 'Built-in email tools to announce new galleries and promote your work to clients.',
  },
  {
    icon: '🔗',
    title: 'SEO Optimized',
    desc: 'Get discovered on Google. Every portfolio is automatically optimized for search engines.',
  },
  {
    icon: '🤝',
    title: 'Client Management',
    desc: 'Keep track of inquiries, bookings, and client communications in one place.',
  },
]

const features = [
  { icon: '🖼️', title: 'Stunning Galleries', desc: 'Organize your work into beautiful, customizable galleries with masonry layouts.' },
  { icon: '✅', title: 'Client Proofing', desc: 'Share private galleries. Clients star, select, and comment — no login needed.' },
  { icon: '🛒', title: 'Sell Prints Online', desc: 'Sell prints, canvases, and digital downloads directly from your portfolio.' },
  { icon: '🌐', title: 'Your Portfolio Site', desc: 'A beautiful public portfolio at yourname.epicbox.app — instant setup.' },
  { icon: '📤', title: 'Batch Upload', desc: 'Drag and drop hundreds of photos. EXIF data extracted automatically.' },
  { icon: '🎨', title: 'Custom Branding', desc: 'Your brand colors, logo, and name. Clients see you — not us.' },
]

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['5 GB storage', 'Up to 3 galleries', 'Public portfolio', 'Basic analytics'],
    cta: 'Get started free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$15',
    period: '/month',
    badge: 'Most Popular',
    features: ['100 GB storage', 'Unlimited galleries', 'Client proofing', 'Online store', 'Custom branding'],
    cta: 'Start Pro trial',
    highlight: true,
  },
  {
    name: 'Business',
    price: '$30',
    period: '/month',
    features: ['Unlimited storage', 'Everything in Pro', 'Custom domain', 'Priority support', 'Advanced analytics'],
    cta: 'Go Business',
    highlight: false,
  },
]

const testimonials = [
  {
    quote: "EpicBox transformed how I run my photography business. Client proofing is seamless and my print sales doubled.",
    author: "Sarah Chen",
    role: "Wedding Photographer",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80"
  },
  {
    quote: "The portfolio looks incredible. My clients are blown away every time I send them a gallery link.",
    author: "Marcus Rivera",
    role: "Portrait Photographer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80"
  },
  {
    quote: "Finally, a platform that doesn't compromise on image quality. The upload process is fast and the galleries are stunning.",
    author: "Emily Park",
    role: "Commercial Photographer",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80"
  },
]

export default function LandingPage() {
  const heroRef = useRef(null)

  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const onScroll = () => {
      const scrolled = window.scrollY
      el.style.transform = `translateY(${scrolled * 0.4}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="bg-black text-white font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight text-white">EpicBox</Link>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm text-white/70 hover:text-white transition">Sign In</Link>
            <Link to="/register" className="bg-white text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition">
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div ref={heroRef} className="absolute inset-0 will-change-transform">
          <img
            src={HERO_PHOTOS[0]}
            alt="Hero"
            className="w-full h-full object-cover scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <p className="text-sm font-semibold tracking-[0.3em] uppercase text-white/60 mb-6 animate-fade-in">
            The Photographer's Platform
          </p>
          <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tight mb-8">
            Your Photos.<br />
            <span className="bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
              Your Business.
            </span>
          </h1>
          <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed">
            Showcase your work, proof with clients, and sell prints — all from one beautiful platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-black font-bold px-10 py-4 rounded-xl hover:bg-gray-100 transition text-lg shadow-2xl"
            >
              Start for Free
            </Link>
            <Link
              to="/p/demo"
              className="border border-white/30 text-white font-semibold px-10 py-4 rounded-xl hover:bg-white/10 transition text-lg backdrop-blur-sm"
            >
              View Demo Portfolio
            </Link>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center pt-2">
            <div className="w-1 h-2 bg-white/60 rounded-full animate-scroll-down" />
          </div>
        </div>
      </section>

      {/* Photo Grid Showcase */}
      <section className="py-2 bg-black">
        <div className="grid grid-cols-3 grid-rows-2 gap-0.5 h-[70vh]">
          {GRID_PHOTOS.map((p, i) => (
            <div key={i} className={`overflow-hidden group relative ${p.span}`}>
              <img
                src={p.src}
                alt=""
                className="w-full h-full object-cover transition duration-700 group-hover:scale-105 group-hover:brightness-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition duration-500" />
            </div>
          ))}
        </div>
      </section>

      {/* Tagline Strip */}
      <section className="bg-white text-black py-20 px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-black max-w-3xl mx-auto leading-tight">
          Built for photographers who take their craft seriously.
        </h2>
      </section>

      {/* Platform Section - NEW */}
      <section className="py-28 px-4 bg-gradient-to-b from-black to-zinc-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-white/40 tracking-widest uppercase text-sm mb-4">Platform</p>
            <h2 className="text-5xl font-black text-white mb-6">The complete photographer toolkit</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Everything you need to showcase, deliver, and sell your photography — all in one powerful platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {platformFeatures.map((feature, i) => (
              <div
                key={i}
                className="relative group bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-3xl p-10 hover:border-white/30 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition" />
                <div className="relative">
                  <div className="text-6xl mb-6 filter grayscale group-hover:grayscale-0 transition">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-white/60 leading-relaxed mb-4">{feature.desc}</p>
                  <p className="text-sm text-white/40 font-semibold">→ {feature.benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Styles Section - NEW */}
      <section className="py-28 px-4 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-white/40 tracking-widest uppercase text-sm mb-4">Gallery Styles</p>
            <h2 className="text-5xl font-black text-white mb-6">Your photos, your way</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Choose from multiple gallery layouts. Switch styles anytime to match your vision.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {galleryStyles.map((style, i) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition">
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img
                    src={style.preview}
                    alt={style.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{style.name}</h3>
                    <p className="text-white/70 text-sm">{style.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-zinc-950">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-white/40 tracking-widest uppercase text-sm mb-4">Features</p>
          <h2 className="text-4xl font-bold text-center text-white mb-16">Everything you need. Nothing you don't.</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-8 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition group"
              >
                <div className="text-4xl mb-5 grayscale group-hover:grayscale-0 transition">{f.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-3">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Section - NEW */}
      <section className="py-28 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-white/40 tracking-widest uppercase text-sm mb-4">Templates</p>
            <h2 className="text-5xl font-black text-white mb-6">Professionally designed templates</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Launch your portfolio in minutes with beautiful, mobile-responsive templates. No coding required.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {templates.map((template, i) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300">
                {template.tag && (
                  <div className="absolute top-4 right-4 z-10 bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full">
                    {template.tag}
                  </div>
                )}
                <div className="aspect-[3/4] overflow-hidden relative">
                  <img
                    src={template.image}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h3 className="text-3xl font-bold text-white mb-3">{template.name}</h3>
                    <p className="text-white/80 leading-relaxed">{template.desc}</p>
                  </div>
                </div>
                <div className="bg-white/5 p-6 backdrop-blur-sm border-t border-white/10">
                  <button className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-lg transition text-sm">
                    Preview Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full-width photo split section */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[60vh]">
        <div className="relative overflow-hidden">
          <img
            src={HERO_PHOTOS[1]}
            alt=""
            className="w-full h-full object-cover scale-105 hover:scale-100 transition duration-700"
          />
          <div className="absolute inset-0 bg-black/40 flex items-end p-10">
            <div>
              <h3 className="text-3xl font-bold text-white mb-2">Client Proofing</h3>
              <p className="text-white/70 text-sm max-w-xs">
                Share a private link. Clients pick their favorites without creating an account.
              </p>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden">
          <img
            src={HERO_PHOTOS[2]}
            alt=""
            className="w-full h-full object-cover scale-105 hover:scale-100 transition duration-700"
          />
          <div className="absolute inset-0 bg-black/40 flex items-end p-10">
            <div>
              <h3 className="text-3xl font-bold text-white mb-2">Sell Prints</h3>
              <p className="text-white/70 text-sm max-w-xs">
                Turn your photography into revenue with a built-in print store powered by Stripe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Grow Section - NEW */}
      <section className="py-28 px-4 bg-gradient-to-b from-zinc-950 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-white/40 tracking-widest uppercase text-sm mb-4">Grow Your Business</p>
            <h2 className="text-5xl font-black text-white mb-6">Tools to scale your photography business</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Marketing, analytics, and client management tools designed specifically for photographers.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {growthFeatures.map((feature, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-10 hover:from-white/15 hover:to-white/10 transition group"
              >
                <div className="flex items-start gap-6">
                  <div className="text-5xl flex-shrink-0 filter grayscale group-hover:grayscale-0 transition">{feature.icon}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-white/60 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <Link
              to="/register"
              className="inline-block bg-white text-black font-bold px-10 py-4 rounded-xl hover:bg-gray-100 transition shadow-2xl"
            >
              Start Growing Today
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 bg-zinc-900">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-white/40 tracking-widest uppercase text-sm mb-4">Get Started</p>
          <h2 className="text-4xl font-bold text-white mb-16">Up and running in minutes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { num: '01', title: 'Create your account', desc: 'Sign up free. No credit card required.' },
              { num: '02', title: 'Upload your photos', desc: 'Drag & drop. We handle resizing, storage, and EXIF.' },
              { num: '03', title: 'Share & earn', desc: 'Send your portfolio link, proof with clients, sell prints.' },
            ].map((step) => (
              <div key={step.num} className="relative">
                <div className="text-7xl font-black text-white/5 mb-2 leading-none">{step.num}</div>
                <h3 className="text-lg font-semibold text-white mb-2 -mt-4">{step.title}</h3>
                <p className="text-white/50 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-white/40 tracking-widest uppercase text-sm mb-4">Testimonials</p>
          <h2 className="text-4xl font-bold text-center text-white mb-4">Loved by photographers worldwide</h2>
          <p className="text-center text-white/50 mb-16 max-w-2xl mx-auto">
            Join thousands of professional photographers growing their business with EpicBox
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition">
                <div className="flex items-center gap-4 mb-6">
                  <img src={t.image} alt={t.author} className="w-14 h-14 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-white">{t.author}</p>
                    <p className="text-white/40 text-sm">{t.role}</p>
                  </div>
                </div>
                <p className="text-white/70 leading-relaxed italic">"{t.quote}"</p>
                <div className="mt-4 flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="text-yellow-400 text-lg">★</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-4 bg-black">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-white/40 tracking-widest uppercase text-sm mb-4">Pricing</p>
          <h2 className="text-4xl font-bold text-center text-white mb-4">Simple, transparent pricing</h2>
          <p className="text-center text-white/50 mb-16">Start free. Upgrade when you're ready.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 border transition ${
                  plan.highlight
                    ? 'bg-white text-black border-white shadow-2xl shadow-white/10 scale-105'
                    : 'bg-white/5 text-white border-white/10 hover:border-white/30'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                    {plan.badge}
                  </span>
                )}
                <h3 className={`text-lg font-bold mb-1 ${plan.highlight ? 'text-black' : 'text-white'}`}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`text-5xl font-black ${plan.highlight ? 'text-black' : 'text-white'}`}>{plan.price}</span>
                  <span className={`text-sm ${plan.highlight ? 'text-black/50' : 'text-white/40'}`}>{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${plan.highlight ? 'text-black/70' : 'text-white/60'}`}>
                      <span className={`font-bold ${plan.highlight ? 'text-black' : 'text-white'}`}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`block text-center py-3 rounded-xl font-semibold transition text-sm ${
                    plan.highlight
                      ? 'bg-black text-white hover:bg-zinc-800'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 px-4 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1920&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Your portfolio deserves to be seen.
          </h2>
          <p className="text-white/60 text-lg mb-10">
            Join thousands of photographers already using EpicBox. Start for free.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-black font-bold px-12 py-5 rounded-xl hover:bg-gray-100 transition text-lg shadow-2xl"
          >
            Create Your Free Portfolio
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-white/10 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-white font-semibold text-sm mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link to="/register" className="text-white/50 hover:text-white text-sm transition">Features</Link></li>
                <li><Link to="/register" className="text-white/50 hover:text-white text-sm transition">Pricing</Link></li>
                <li><Link to="/register" className="text-white/50 hover:text-white text-sm transition">Examples</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/register" className="text-white/50 hover:text-white text-sm transition">About</Link></li>
                <li><Link to="/register" className="text-white/50 hover:text-white text-sm transition">Blog</Link></li>
                <li><Link to="/register" className="text-white/50 hover:text-white text-sm transition">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link to="/register" className="text-white/50 hover:text-white text-sm transition">Help Center</Link></li>
                <li><Link to="/register" className="text-white/50 hover:text-white text-sm transition">Contact Us</Link></li>
                <li><Link to="/register" className="text-white/50 hover:text-white text-sm transition">Community</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/register" className="text-white/50 hover:text-white text-sm transition">Privacy</Link></li>
                <li><Link to="/register" className="text-white/50 hover:text-white text-sm transition">Terms</Link></li>
                <li><Link to="/register" className="text-white/50 hover:text-white text-sm transition">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/30 text-sm">© 2025 EpicBox. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-white/30 hover:text-white transition text-sm">Twitter</a>
              <a href="#" className="text-white/30 hover:text-white transition text-sm">Instagram</a>
              <a href="#" className="text-white/30 hover:text-white transition text-sm">YouTube</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

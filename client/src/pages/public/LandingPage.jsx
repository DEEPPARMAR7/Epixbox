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

const features = [
  { icon: '🖼️', title: 'Stunning Galleries', desc: 'Organize your work into beautiful galleries with client-friendly browsing.' },
  { icon: '✅', title: 'Client Proofing', desc: 'Share private galleries. Clients star, select, and comment with controlled access.' },
  { icon: '🛒', title: 'Sell Prints Online', desc: 'Sell prints, canvases, and digital downloads from your portfolio workflow.' },
  { icon: '🌐', title: 'Your Portfolio Site', desc: 'A polished public portfolio that puts your brand front and center.' },
  { icon: '📤', title: 'Batch Upload', desc: 'Drag and drop hundreds of photos. EXIF data and derivatives are handled for you.' },
  { icon: '🎨', title: 'Custom Branding', desc: 'Brand colors, logo, and name so clients see your studio, not a generic template.' },
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

      {/* Hero */}
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
      <section className="py-4 bg-black">
        <div className="grid grid-cols-3 grid-rows-2 gap-1 h-[70vh]">
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


      {/* Features */}
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

      {/* What you can do - Feature Matrix */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-white/40 tracking-widest uppercase text-sm mb-4">What you can do</p>
          <h2 className="text-4xl font-bold text-center text-white mb-12">EpixBox platform, your way</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center p-8 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-4xl mb-4">🖼️</span>
              <h3 className="font-semibold text-white mb-2">Portfolios & Galleries</h3>
              <p className="text-white/60 text-sm">Showcase your work in beautiful, customizable galleries and portfolios.</p>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-4xl mb-4">✅</span>
              <h3 className="font-semibold text-white mb-2">Client Proofing</h3>
              <p className="text-white/60 text-sm">Let clients select favorites, comment, and approve images securely.</p>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-4xl mb-4">🛒</span>
              <h3 className="font-semibold text-white mb-2">Print & Digital Sales</h3>
              <p className="text-white/60 text-sm">Sell prints and downloads directly from your galleries with Stripe payments.</p>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-4xl mb-4">⚙️</span>
              <h3 className="font-semibold text-white mb-2">Admin Panel</h3>
              <p className="text-white/60 text-sm">Manage galleries, orders, users, and site settings in one place.</p>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-4xl mb-4">💳</span>
              <h3 className="font-semibold text-white mb-2">Payment Gateway</h3>
              <p className="text-white/60 text-sm">Accept secure payments for your products and services via Stripe.</p>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-4xl mb-4">🎨</span>
              <h3 className="font-semibold text-white mb-2">Branding & Templates</h3>
              <p className="text-white/60 text-sm">Personalize your site with your logo, colors, and portfolio templates.</p>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-4xl mb-4">📈</span>
              <h3 className="font-semibold text-white mb-2">Analytics & Tools</h3>
              <p className="text-white/60 text-sm">Track gallery views, sales, and client activity with built-in analytics.</p>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-4xl mb-4">📱</span>
              <h3 className="font-semibold text-white mb-2">Mobile-Friendly</h3>
              <p className="text-white/60 text-sm">Access and manage your business from any device, anywhere.</p>
            </div>
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
      <footer className="bg-black border-t border-white/10 py-12 px-6 text-center">
        <p className="text-white/20 text-sm">© 2025 EpicBox. All rights reserved.</p>
      </footer>
    </div>
  )
}

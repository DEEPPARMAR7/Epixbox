import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

const PORTFOLIO_IMAGES = [
  'https://images.unsplash.com/photo-1490604001847-b3bbb8b7ce75?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1502720917128-1aa500764cbd?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=600&h=600&fit=crop',
]

const PHOTOGRAPHY_TYPES = [
  {
    title: 'Portraits',
    desc: 'Capture the essence of people',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    icon: '👤'
  },
  {
    title: 'Nature & Landscape',
    desc: 'Breathtaking outdoor moments',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    icon: '🏔️'
  },
  {
    title: 'Travel',
    desc: 'Stories from around the world',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop',
    icon: '✈️'
  },
  {
    title: 'Lifestyle',
    desc: 'Real moments, real emotions',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop',
    icon: '📸'
  }
]

const FEATURES = [
  {
    icon: '🎨',
    title: 'Beautiful Gallery Templates',
    desc: 'Showcase your best work with stunning, customizable layouts'
  },
  {
    icon: '📊',
    title: 'Powerful Analytics',
    desc: 'Track views, engagement, and understand your audience'
  },
  {
    icon: '💳',
    title: 'Sell Your Work',
    desc: 'Integrated e-commerce to monetize your photography'
  },
  {
    icon: '🔐',
    title: 'Client Proofing',
    desc: 'Secure galleries for client review and selection'
  },
  {
    icon: '📱',
    title: 'Mobile Optimized',
    desc: 'Beautiful on all devices - phones, tablets, desktops'
  },
  {
    icon: '🌐',
    title: 'Custom Domain',
    desc: 'Your own professional website URL'
  }
]

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Wedding Photographer',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    text: 'EpicBox transformed my photography business. My clients love the beautiful galleries and I\'ve tripled my print sales!'
  },
  {
    name: 'Marcus Rivera',
    role: 'Travel Photographer',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    text: 'Finally, a platform designed for photographers. The ease of use and professional results are unmatched.'
  },
  {
    name: 'Emma Wilson',
    role: 'Commercial Photographer',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    text: 'My portfolio has never looked better. Clients are impressed before we even have our first meeting!'
  }
]

const PRICING = [
  {
    plan: 'Starter',
    price: '0',
    period: 'Forever',
    features: ['5 GB Storage', '3 Galleries', 'Basic Design', 'Mobile Responsive'],
    cta: 'Get Started',
    popular: false
  },
  {
    plan: 'Professional',
    price: '19',
    period: 'Month',
    features: ['100 GB Storage', 'Unlimited Galleries', 'Advanced Design', 'Client Proofing', 'E-Commerce', 'Analytics'],
    cta: 'Start Free Trial',
    popular: true
  },
  {
    plan: 'Premium',
    price: '49',
    period: 'Month',
    features: ['Unlimited Storage', 'All Features', 'Custom Domain', 'Priority Support', 'API Access', 'Team Collaboration'],
    cta: 'Contact Sales',
    popular: false
  }
]

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(0)
  const heroRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrolled = window.scrollY
        heroRef.current.style.transform = `translateY(${scrolled * 0.3}px)`
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="w-full overflow-hidden bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-black">
            EpicBox
          </Link>
          <div className="flex items-center gap-8">
            <Link to="/login" className="text-sm text-gray-600 hover:text-black transition">
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div
          ref={heroRef}
          className="absolute inset-0 -z-10 will-change-transform"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
            ✨ The Photographer's Platform
          </div>
          <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight text-black">
            Your Photography,<br />
            <span className="bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
              Your Business
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Create a stunning online portfolio, impress clients with beautiful galleries, and start selling your work today. All in one powerful platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition shadow-lg text-lg"
            >
              Create Free Portfolio
            </Link>
            <Link
              to="/p/demo"
              className="px-8 py-4 border-2 border-black text-black font-semibold rounded-lg hover:bg-black hover:text-white transition text-lg"
            >
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Portfolio Showcase */}
      <section className="py-24 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4 text-black">Showcase Your Best Work</h2>
            <p className="text-xl text-gray-600">Beautiful galleries that make your photographs shine</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PORTFOLIO_IMAGES.map((img, i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition group cursor-pointer"
              >
                <img
                  src={img}
                  alt={`Portfolio ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photography Types */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4 text-black">Works for Every Photography Style</h2>
            <p className="text-xl text-gray-600">Whether you shoot portraits, landscapes, travel, or lifestyle</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PHOTOGRAPHY_TYPES.map((type, i) => (
              <div
                key={i}
                className="group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={type.image}
                    alt={type.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition" />
                </div>
                <div className="p-6 bg-white">
                  <div className="text-4xl mb-3">{type.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-black">{type.title}</h3>
                  <p className="text-gray-600">{type.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4 text-black">Powerful Features for Photographers</h2>
            <p className="text-xl text-gray-600">Everything you need to run your photography business</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => (
              <div key={i} className="p-8 bg-white rounded-2xl shadow-md hover:shadow-lg transition border border-gray-100">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-black">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">Loved by Photographers</h2>
            <p className="text-xl text-gray-400">Join thousands of creative professionals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((test, i) => (
              <div key={i} className="bg-white/10 p-8 rounded-2xl backdrop-blur border border-white/20 hover:border-white/40 transition">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={test.image}
                    alt={test.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold">{test.name}</p>
                    <p className="text-sm text-gray-400">{test.role}</p>
                  </div>
                </div>
                <p className="text-gray-200 leading-relaxed">"{test.text}"</p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="text-yellow-400">★</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4 text-black">Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that fits your needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRICING.map((pricing, i) => (
              <div
                key={i}
                className={`rounded-2xl p-8 transition relative ${
                  pricing.popular
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white transform md:scale-105 shadow-2xl'
                    : 'bg-white border-2 border-gray-200 hover:border-gray-300 text-black'
                }`}
              >
                {pricing.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-bold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{pricing.plan}</h3>
                <div className="mb-6">
                  <span className="text-5xl font-black">${pricing.price}</span>
                  <span className={`ml-2 ${pricing.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                    /{pricing.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {pricing.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <span className="text-xl">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`block w-full py-3 px-6 rounded-lg font-bold text-center transition ${
                    pricing.popular
                      ? 'bg-white text-blue-600 hover:bg-gray-100'
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                >
                  {pricing.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
        <div className="relative max-w-4xl mx-auto text-center text-white z-10">
          <h2 className="text-5xl font-black mb-6">Ready to Showcase Your Work?</h2>
          <p className="text-xl mb-10 text-blue-100">
            Create your professional photography portfolio in minutes. No credit card required.
          </p>
          <Link
            to="/register"
            className="inline-block px-10 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition text-lg shadow-lg"
          >
            Start Your Free Portfolio Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-xl font-bold mb-6">EpicBox</h3>
              <p className="text-gray-400">The photographer's platform for building stunning portfolios and growing your business.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/" className="hover:text-white transition">Features</Link></li>
                <li><Link to="/" className="hover:text-white transition">Pricing</Link></li>
                <li><Link to="/" className="hover:text-white transition">Portfolio</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/" className="hover:text-white transition">About</Link></li>
                <li><Link to="/" className="hover:text-white transition">Blog</Link></li>
                <li><Link to="/" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/" className="hover:text-white transition">Privacy</Link></li>
                <li><Link to="/" className="hover:text-white transition">Terms</Link></li>
                <li><Link to="/" className="hover:text-white transition">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400">
            <p>&copy; 2025 EpicBox. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition">Twitter</a>
              <a href="#" className="hover:text-white transition">Instagram</a>
              <a href="#" className="hover:text-white transition">Facebook</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

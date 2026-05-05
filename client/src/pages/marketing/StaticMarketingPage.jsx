import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { ArrowRight, BookOpen, Building2, CalendarDays, CircleHelp, Code2, Globe, Mail, ShieldCheck, Sparkles, Users } from 'lucide-react'

const PAGE_CONFIG = {
  apps: {
    title: 'Apps',
    subtitle: 'Take your workflow everywhere with mobile-friendly and desktop tools built for photographers.',
    hero: 'Upload, organize, proof, and sell from anywhere.',
    actionLabel: 'Start Free Trial',
    actionHref: '/signup',
    cards: [
      { icon: Sparkles, title: 'Mobile Uploads', desc: 'Upload full-resolution files directly from your phone or tablet with original quality preserved.' },
      { icon: Globe, title: 'Cross-device Sync', desc: 'Stay in sync across desktop, mobile web, and client-facing galleries.' },
      { icon: ShieldCheck, title: 'Secure Access', desc: 'Protect your work with sign-in, gallery passwords, and expiring share links.' },
    ],
    sections: [
      { title: 'Why photographers use the app experience', body: 'Quick culling, portfolio sharing, and client management are available where you need them most.' },
      { title: 'Designed for speed', body: 'We optimized gallery browsing, downloads, and proofing so the experience feels fast even with large libraries.' },
    ],
  },
  blog: {
    title: 'Blog',
    subtitle: 'Photography tips, product updates, and business guidance from the EpixBox team.',
    hero: 'Learn how to grow your photography business.',
    actionLabel: 'Browse Resources',
    actionHref: '/resources',
    cards: [
      { icon: BookOpen, title: 'Editing workflow', desc: 'Learn how to keep post-production organized without losing your creative flow.' },
      { icon: CalendarDays, title: 'Business planning', desc: 'Set pricing, plan client delivery, and avoid admin overload.' },
      { icon: Users, title: 'Client communication', desc: 'Share proofing galleries and get feedback faster.' },
    ],
    sections: [
      { title: 'Popular topics', body: 'Portfolio presentation, sales strategy, SEO, client proofing, and storage workflow are our most-requested categories.' },
      { title: 'Fresh updates', body: 'We publish feature notes and practical photography advice so the platform feels current and useful.' },
    ],
  },
  company: {
    title: 'Company',
    subtitle: 'Learn about the team, mission, and direction behind EpixBox.',
    hero: 'A photography platform built by people who care about photographers.',
    actionLabel: 'About EpixBox',
    actionHref: '/about',
    cards: [
      { icon: Building2, title: 'About', desc: 'Read the company story and mission.' },
      { icon: Users, title: 'Careers', desc: 'See how the team grows and what roles are open.' },
      { icon: Globe, title: 'Partners', desc: 'Explore how we work with studios, labs, and service partners.' },
    ],
    sections: [
      { title: 'What we build', body: 'Tools for gallery hosting, proofing, commerce, and portfolio presentation.' },
      { title: 'How we work', body: 'We ship practical improvements quickly and keep photographers at the center of decisions.' },
    ],
  },
  webinars: {
    title: 'Webinars',
    subtitle: 'Live and recorded product walkthroughs, workflow demos, and photography business sessions.',
    hero: 'Watch how other photographers use EpixBox.',
    actionLabel: 'Browse Resources',
    actionHref: '/resources',
    cards: [
      { icon: CalendarDays, title: 'Live sessions', desc: 'Product walkthroughs and training for new features.' },
      { icon: BookOpen, title: 'Recorded demos', desc: 'Replays for onboarding, workflow tips, and feature releases.' },
      { icon: Users, title: 'Ask questions', desc: 'Bring your setup questions and get practical answers.' },
    ],
    sections: [
      { title: 'What to expect', body: 'Short, actionable sessions focused on photographer workflows and platform capabilities.' },
      { title: 'Where to find them', body: 'We surface webinar announcements through the resources area and product updates.' },
    ],
  },
  support: {
    title: 'Support',
    subtitle: 'Get help with setup, billing, galleries, proofing, uploads, and account settings.',
    hero: 'Answers when you need them.',
    actionLabel: 'Contact Support',
    actionHref: '/contact',
    cards: [
      { icon: CircleHelp, title: 'Help Center', desc: 'Search step-by-step guidance for common workflows and setup issues.' },
      { icon: Mail, title: 'Email Support', desc: 'Reach the team directly for billing, account, or technical help.' },
      { icon: ShieldCheck, title: 'Account Safety', desc: 'Manage passwords, 2FA, and recovery settings from one place.' },
    ],
    sections: [
      { title: 'What we support', body: 'Gallery setup, photo uploads, proofing, downloads, subscriptions, and order troubleshooting.' },
      { title: 'Need urgent help?', body: 'Use the contact page to send your issue and we’ll route it to the right team.' },
    ],
  },
  contact: {
    title: 'Contact',
    subtitle: 'Talk to the team about product questions, sales, press, or account help.',
    hero: 'We’d love to hear from you.',
    actionLabel: 'Start Free Trial',
    actionHref: '/signup',
    cards: [
      { icon: Mail, title: 'Email us', desc: 'Send product, billing, or partnership questions through the contact form.' },
      { icon: Users, title: 'Sales & demos', desc: 'Learn which plan fits your workflow and studio size.' },
      { icon: Building2, title: 'Press & partnerships', desc: 'Reach our team for media coverage and collaboration requests.' },
    ],
    sections: [
      { title: 'Response windows', body: 'We aim to respond quickly to support and business inquiries during business hours.' },
      { title: 'What to include', body: 'If you’re reporting a bug, include the page, browser, and the action you were trying to complete.' },
    ],
  },
  careers: {
    title: 'Careers',
    subtitle: 'Help build the platform photographers rely on to store, share, and sell their work.',
    hero: 'Join the team building the creative business layer.',
    actionLabel: 'View Openings',
    actionHref: '/contact',
    cards: [
      { icon: Users, title: 'Small team, large impact', desc: 'Work across product, design, and engineering on features photographers use every day.' },
      { icon: Sparkles, title: 'Craft-first product culture', desc: 'We care about user experience, reliability, and detail.' },
      { icon: Globe, title: 'Remote-friendly', desc: 'Collaborate with a distributed team focused on shipping useful work.' },
    ],
    sections: [
      { title: 'Open roles', body: 'Product, frontend, backend, and support roles are posted as the team grows.' },
      { title: 'What we value', body: 'Ownership, clarity, craft, and empathy for photographers and small business owners.' },
    ],
  },
  press: {
    title: 'Press',
    subtitle: 'Company information, media assets, and product stories for journalists and partners.',
    hero: 'Press assets and company story.',
    actionLabel: 'Contact Press',
    actionHref: '/contact',
    cards: [
      { icon: Building2, title: 'Company overview', desc: 'EpixBox helps photographers manage galleries, proofing, commerce, and client delivery.' },
      { icon: Sparkles, title: 'Brand assets', desc: 'Request logos, screenshots, and product images for coverage.' },
      { icon: Globe, title: 'Product updates', desc: 'Follow launches, platform milestones, and feature releases.' },
    ],
    sections: [
      { title: 'Media contact', body: 'Please use the contact page for all press inquiries and partnership requests.' },
      { title: 'About EpixBox', body: 'We’re building a complete business platform for photographers, from storage to sales.' },
    ],
  },
  partners: {
    title: 'Partners',
    subtitle: 'Join the ecosystem of labs, studios, agencies, and technology partners around photographers.',
    hero: 'Build with EpixBox.',
    actionLabel: 'Partner With Us',
    actionHref: '/contact',
    cards: [
      { icon: Users, title: 'Referral partners', desc: 'Help introduce photographers to the platform and grow with us.' },
      { icon: Building2, title: 'Studio integrations', desc: 'Explore workflows for labs, fulfillment, and enterprise customers.' },
      { icon: Code2, title: 'API partners', desc: 'Extend EpixBox through integrations and custom tooling.' },
    ],
    sections: [
      { title: 'Who we partner with', body: 'Print labs, album vendors, studios, creative agencies, and software integrators.' },
      { title: 'Get started', body: 'Tell us what you build and how you’d like to collaborate.' },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'How we handle personal data, gallery access, and account information.',
    hero: 'Your data, handled carefully.',
    actionLabel: 'Back to Home',
    actionHref: '/',
    cards: [
      { icon: ShieldCheck, title: 'Data protection', desc: 'We use access controls, encryption, and platform safeguards to protect your content.' },
      { icon: Globe, title: 'Usage transparency', desc: 'We only use data to deliver features, support accounts, and improve the service.' },
      { icon: Mail, title: 'Contact rights', desc: 'You can request support for privacy questions through the contact page.' },
    ],
    sections: [
      { title: 'What we collect', body: 'Account details, uploaded content, billing data, and service activity needed to run the platform.' },
      { title: 'How we use it', body: 'To provide galleries, proofing, commerce, notifications, analytics, and support.' },
      { title: 'Your control', body: 'You can manage profile settings, billing, and gallery visibility from your account.' },
    ],
  },
  terms: {
    title: 'Terms of Service',
    subtitle: 'The rules for using EpixBox, including account behavior and platform responsibilities.',
    hero: 'Clear terms for creative businesses.',
    actionLabel: 'Back to Home',
    actionHref: '/',
    cards: [
      { icon: ShieldCheck, title: 'Account responsibility', desc: 'Keep your login secure and ensure your uploaded content rights are valid.' },
      { icon: Globe, title: 'Service usage', desc: 'Use the platform in a way that respects laws, rights, and product limits.' },
      { icon: Users, title: 'Business usage', desc: 'Your customers, galleries, and sales workflows are tied to your account settings.' },
    ],
    sections: [
      { title: 'Platform access', body: 'We may limit or suspend access if an account violates terms or endangers the service.' },
      { title: 'Content ownership', body: 'You retain rights to your work, and you’re responsible for the content you upload and share.' },
    ],
  },
  cookie: {
    title: 'Cookie Policy',
    subtitle: 'How cookies and similar technologies help the app remember your settings and keep you signed in.',
    hero: 'Helpful cookies, not clutter.',
    actionLabel: 'Manage Account',
    actionHref: '/login',
    cards: [
      { icon: ShieldCheck, title: 'Session cookies', desc: 'Used to keep you authenticated while you use the platform.' },
      { icon: Sparkles, title: 'Preferences', desc: 'Remembered settings help preserve your layout and theme choices.' },
      { icon: Globe, title: 'Analytics', desc: 'Usage data helps us improve performance and product quality.' },
    ],
    sections: [
      { title: 'How cookies help', body: 'They keep your session, preferences, and navigation state intact.' },
      { title: 'Your control', body: 'You can clear cookies in your browser, but some features may require them to function.' },
    ],
  },
  dmca: {
    title: 'DMCA',
    subtitle: 'How to request removal of content that you believe infringes your rights.',
    hero: 'Rights and takedown requests.',
    actionLabel: 'Contact Us',
    actionHref: '/contact',
    cards: [
      { icon: ShieldCheck, title: 'Takedown requests', desc: 'Submit valid notices if you believe content is posted without permission.' },
      { icon: Mail, title: 'Counter notices', desc: 'We review reports and support proper responses under applicable rules.' },
      { icon: Users, title: 'Content review', desc: 'We may restrict content while a notice is being evaluated.' },
    ],
    sections: [
      { title: 'How to report', body: 'Provide the content location, rights statement, and contact information needed to process a notice.' },
      { title: 'Fast handling', body: 'We review notices as quickly as possible and may contact you for follow-up.' },
    ],
  },
  community: {
    title: 'Community',
    subtitle: 'Learn, share, and grow with other photographers using EpixBox.',
    hero: 'Join the photographer community.',
    actionLabel: 'Browse Resources',
    actionHref: '/resources',
    cards: [
      { icon: Users, title: 'Peer support', desc: 'Share tips, workflows, and inspiration with other creators.' },
      { icon: BookOpen, title: 'Education', desc: 'Find tutorials and practical guides for business and craft.' },
      { icon: Sparkles, title: 'Product feedback', desc: 'Help shape what we build next with your ideas and requests.' },
    ],
    sections: [
      { title: 'What makes the community useful', body: 'Photographers helping photographers with real workflows and real feedback.' },
      { title: 'Stay involved', body: 'Use the resources page to discover more product content and community updates.' },
    ],
  },
  api: {
    title: 'API',
    subtitle: 'Integrate EpixBox with your studio tools, workflows, and services.',
    hero: 'Build on top of EpixBox.',
    actionLabel: 'Contact Partners',
    actionHref: '/contact',
    cards: [
      { icon: Code2, title: 'REST endpoints', desc: 'Automate gallery, photo, order, and account workflows.' },
      { icon: ShieldCheck, title: 'Secure access', desc: 'Use API keys and scoped access for integrations.' },
      { icon: Globe, title: 'Workflow automation', desc: 'Connect external tools for reporting and studio ops.' },
    ],
    sections: [
      { title: 'What you can build', body: 'Custom studio apps, automations, reporting tools, and partner integrations.' },
      { title: 'Access management', body: 'Manage keys and permissions inside the admin/settings areas.' },
    ],
  },
}

export default function StaticMarketingPage({ page }) {
  const config = PAGE_CONFIG[page] || PAGE_CONFIG.support

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{config.title} | EpixBox</title>
      </Helmet>

      <Navbar />

      <section className="section-padding text-center">
        <p className="font-heading text-xs uppercase tracking-[0.28em] text-muted-foreground mb-3">EpixBox</p>
        <h1 className="heading-xl text-foreground mb-4">{config.title}</h1>
        <p className="body-lg max-w-2xl mx-auto mb-8">{config.subtitle}</p>
        <div className="max-w-4xl mx-auto rounded-[2rem] border border-border bg-card p-8 shadow-sm">
          <h2 className="heading-lg text-foreground mb-4">{config.hero}</h2>
          <p className="body-lg max-w-3xl mx-auto mb-8">The public side of EpixBox is built to answer the same questions photographers ask before they sign up.</p>
          <Link to={config.actionHref} className="btn-cta inline-flex">
            {config.actionLabel} <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-3">
          {config.cards.map((card) => (
            <div key={card.title} className="border-2 border-border bg-background p-6">
              <div className="w-12 h-12 bg-accent flex items-center justify-center mb-4">
                <card.icon size={24} className="text-accent-foreground" />
              </div>
              <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground mb-2">{card.title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-padding bg-card">
        <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
          {config.sections.map((section) => (
            <div key={section.title} className="rounded-2xl border border-border bg-background p-6">
              <h2 className="heading-md text-foreground mb-3">{section.title}</h2>
              <p className="body-lg">{section.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-padding text-center">
        <h2 className="heading-lg text-foreground mb-4">Ready to see the full product?</h2>
        <p className="body-lg max-w-xl mx-auto mb-8">Create an account to use galleries, proofing, selling, subscriptions, and all the tools photographers need.</p>
        <Link to="/signup" className="btn-cta inline-flex">
          Start Free Trial <ArrowRight size={18} />
        </Link>
      </section>

      <Footer />
    </div>
  )
}

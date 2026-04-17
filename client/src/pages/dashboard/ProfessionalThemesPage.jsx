import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import useAuthStore from '../../store/authStore'

const THEMES = [
  {
    id: 'editorial-luxe',
    name: 'Editorial Luxe',
    style: 'Luxury editorial look for weddings and portraits',
    gradient: 'from-[#1f2937] via-[#312e81] to-[#0f172a]',
    premium: true,
    tags: ['Hero Story', 'Minimal Nav', 'Bold Typography'],
  },
  {
    id: 'minimal-atelier',
    name: 'Minimal Atelier',
    style: 'Clean commercial layout for modern portfolios',
    gradient: 'from-[#0f172a] via-[#334155] to-[#1e293b]',
    premium: false,
    tags: ['Grid First', 'Whitespace', 'Neutral Palette'],
  },
  {
    id: 'cinematic-dark',
    name: 'Cinematic Dark',
    style: 'High-contrast fashion and cinematic storytelling',
    gradient: 'from-[#2d1b69] via-[#111827] to-[#3f1d2e]',
    premium: true,
    tags: ['Fullscreen Hero', 'Masonry', 'Interactive Cards'],
  },
  {
    id: 'brand-studio',
    name: 'Brand Studio',
    style: 'Professional service-driven portfolio presentation',
    gradient: 'from-[#1f2937] via-[#0f766e] to-[#0f172a]',
    premium: false,
    tags: ['Service Blocks', 'Client Logos', 'Lead CTA'],
  },
]

export default function ProfessionalThemesPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isPaidPlan = user?.plan === 'pro' || user?.plan === 'business'

  const availableThemes = useMemo(() => {
    if (isPaidPlan) return THEMES
    return THEMES.filter((theme) => !theme.premium)
  }, [isPaidPlan])

  return (
    <DashboardLayout>
      <div className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,#0b1020,#080d19)] p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-200/80">Theme Studio</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-white">Professional Portfolio Templates</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Build a premium client-facing experience with modern template systems, strong typography, and visual hierarchy.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard/settings')}
            className="rounded-md border border-white/25 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Back to My Site
          </button>
          {!isPaidPlan && (
            <button
              type="button"
              onClick={() => navigate('/pricing')}
              className="rounded-md border border-emerald-300/35 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-300/15"
            >
              Upgrade for Premium Themes
            </button>
          )}
        </div>
      </div>

      {!isPaidPlan && (
        <div className="mt-5 rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-200">
          Free plan includes standard professional themes. Upgrade to unlock premium templates and public portfolio access.
        </div>
      )}

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {THEMES.map((theme) => {
          const locked = theme.premium && !isPaidPlan
          return (
            <article
              key={theme.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1426] shadow-[0_18px_50px_rgba(0,0,0,0.38)]"
            >
              <div className={`relative h-44 bg-gradient-to-br ${theme.gradient}`}>
                <div className="absolute inset-0 bg-black/15" />
                <div className="absolute left-4 top-4 flex items-center gap-2">
                  <span className="rounded-full border border-white/25 bg-black/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">
                    {locked ? 'Locked' : 'Available'}
                  </span>
                  {theme.premium && (
                    <span className="rounded-full border border-amber-300/45 bg-amber-300/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-100">
                      Premium
                    </span>
                  )}
                </div>
                <p className="absolute bottom-4 left-4 text-lg font-black text-white">{theme.name}</p>
              </div>

              <div className="p-4">
                <p className="text-sm text-slate-300">{theme.style}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {theme.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    disabled={locked}
                    className="w-full rounded-md border border-white/25 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {locked ? 'Upgrade to Use Theme' : 'Apply Theme'}
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-[#0f172a] p-6">
        <h2 className="text-xl font-black text-white">SmugMug-Style Experience Targets</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-300">
          <li>Professional template depth with clear premium differentiation.</li>
          <li>Paid plan unlock for public portfolio visibility.</li>
          <li>Consistent visual polish across gallery and homepage.</li>
        </ul>
      </section>
    </DashboardLayout>
  )
}

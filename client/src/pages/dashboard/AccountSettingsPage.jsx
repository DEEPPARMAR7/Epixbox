import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/common/Button'
import { getProfile, updateProfile, connectCustomDomain } from '../../api/settingsApi'
import useAuthStore from '../../store/authStore'

const SUPPORT_LINKS = [
  'Learn how to add a logo',
  'Learn how to update your site\'s menu',
  'Learn how to add social media links',
  'Learn how to update your colors and fonts',
]

const PREVIEW_TILES = [
  'bg-[linear-gradient(135deg,#751b5f,#f38ba0)]',
  'bg-[linear-gradient(135deg,#0f3460,#8f1d2c,#f39f5a)]',
  'bg-[linear-gradient(90deg,#00c6ff,#0072ff)]',
  'bg-[linear-gradient(90deg,#f953c6,#b91d73)]',
]

const INFO_CHIPS = [
  'Website Builder',
  'Custom Domain',
  'SEO Ready',
]

export default function AccountSettingsPage() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [domainSaving, setDomainSaving] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    website_url: '',
    brand_name: '',
    brand_color: '#22d3ee',
  })
  const [siteUrlInput, setSiteUrlInput] = useState('')
  const [customDomain, setCustomDomain] = useState('')

  const resolveUsername = () => {
    if (user?.username) return user.username
    try {
      const authV2 = JSON.parse(localStorage.getItem('epixbox-auth') || '{}')
      if (authV2?.user?.username) return authV2.user.username
    } catch (err) {
      void err
    }
    try {
      const authV1 = JSON.parse(localStorage.getItem('auth-storage') || '{}')
      if (authV1?.state?.user?.username) return authV1.state.user.username
    } catch (err) {
      void err
    }
    return null
  }

  useEffect(() => {
    getProfile()
      .then((u) => {
        setProfile({
          first_name: u.first_name || '',
          last_name: u.last_name || '',
          website_url: u.website_url || '',
          brand_name: u.brand_name || '',
          brand_color: u.brand_color || '#22d3ee',
        })
        setSiteUrlInput(u.website_url || '')
        updateUser(u)
      })
      .catch(() => {
        toast.error('Failed to load site settings')
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const username = resolveUsername()
  const publicUrl = useMemo(() => `${window.location.origin}/p/${username ? username.toLowerCase() : ''}`, [username])
  const siteHost = useMemo(() => {
    if (siteUrlInput?.trim()) return siteUrlInput.trim()
    if (username) return `${username.toLowerCase()}.epixbox.com`
    return 'yourname.epixbox.com'
  }, [siteUrlInput, username])

  const handleCopyUrl = async () => {
    if (!username) return toast.error('Unable to resolve portfolio username')
    try {
      await navigator.clipboard.writeText(publicUrl)
      toast.success('URL copied')
    } catch {
      toast.error('Unable to copy URL')
    }
  }

  const handleSaveSiteUrl = async () => {
    setLoading(true)
    try {
      const updated = await updateProfile({
        website_url: siteUrlInput,
        brand_name: profile.brand_name,
        brand_color: profile.brand_color,
      })
      updateUser(updated)
      setProfile((prev) => ({ ...prev, website_url: updated.website_url || siteUrlInput }))
      toast.success('Site URL saved')
    } catch {
      toast.error('Failed to save site URL')
    } finally {
      setLoading(false)
    }
  }

  const handleConnectDomain = async () => {
    const domain = customDomain.trim().toLowerCase()
    if (!domain) return toast.error('Enter a custom domain first')
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
      return toast.error('Enter a valid domain like photos.example.com')
    }
    setDomainSaving(true)
    try {
      const result = await connectCustomDomain(domain)
      toast.success(result?.is_verified ? 'Domain connected and verified' : 'Domain saved. Update DNS to verify.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to connect domain')
    } finally {
      setDomainSaving(false)
    }
  }

  const openSite = () => {
    if (!username) return toast.error('Unable to resolve portfolio username')
    window.open(publicUrl, '_blank')
  }

  const searchSite = () => {
    if (!username) return toast.error('Unable to resolve portfolio username')
    window.open(`${publicUrl}?search=1`, '_blank')
  }

  const manageSeo = () => {
    openSite()
    toast.success('Open your public site and update SEO content in profile details')
  }

  const setPublicContactEmail = async () => {
    if (!user?.email) return toast.error('No account email found')
    try {
      await navigator.clipboard.writeText(user.email)
      toast.success('Public contact email copied')
    } catch {
      toast.error('Unable to copy email')
    }
  }

  const publishedDate = new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <DashboardLayout>
      <div className="mb-4 rounded-sm border border-cyan-300/40 bg-[linear-gradient(90deg,#0ea5b7,#22d3ee)] px-4 py-2 text-center text-[11px] font-semibold text-[#06222c]">
        Your website is private during trial. Publish to visitors after upgrading your plan.
      </div>

      <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,#0b1020,#080d19)] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-200/80">Website Settings</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-white">My Site</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Design, publish, and manage your website from one clean workspace built for your brand.</p>
          </div>
          <div className="space-y-3 text-xs font-extrabold uppercase tracking-wide">
            <div className="flex flex-wrap gap-3">
              <button onClick={openSite} className="rounded-md border border-white/25 bg-white/5 px-4 py-2 text-white transition hover:bg-white/10">View Site</button>
              <button onClick={searchSite} className="rounded-md border border-white/25 bg-white/5 px-4 py-2 text-white transition hover:bg-white/10">Search Your Site</button>
            </div>
            <div className="flex flex-wrap gap-4">
              <button onClick={handleCopyUrl} className="rounded-md border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-emerald-200 hover:bg-emerald-300/15">Copy URL</button>
              <button onClick={() => setShowQr((v) => !v)} className="rounded-md border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-emerald-200 hover:bg-emerald-300/15">Show QR Code</button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-5 grid max-w-[1220px] gap-4 lg:grid-cols-[312px,minmax(0,1fr)]">
        <aside className="rounded-sm border border-white/10 bg-[linear-gradient(180deg,#161c2a,#101521)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.38)] lg:sticky lg:top-6 lg:self-start">
          <h2 className="text-[22px] font-black tracking-tight text-white">{profile.brand_name || 'EpixBox Site'}</h2>
          <div className="mt-3 h-px w-full bg-white/10" />
          <div className="mt-4 flex flex-wrap gap-2">
            {INFO_CHIPS.map((chip) => (
              <span key={chip} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                {chip}
              </span>
            ))}
          </div>

          <div className="mt-6 space-y-7 text-sm leading-6">
            <div>
              <p className="font-bold uppercase tracking-[0.18em] text-white/90">Visitor Access</p>
              <p className="mt-1 font-semibold text-slate-200">Your Website is Private</p>
              <p className="mt-1 text-emerald-300">Upgrade your plan to make your portfolio visible to visitors.</p>
            </div>

            <div>
              <p className="font-bold uppercase tracking-[0.18em] text-white/90">Status</p>
              <p className="mt-1 font-semibold text-slate-200">Published</p>
              <p className="mt-1 text-slate-400">Last published on {publishedDate}</p>
            </div>

            <div>
              <p className="font-bold uppercase tracking-[0.18em] text-white/90">Site Settings</p>
              <div className="mt-2 space-y-1.5">
                <button onClick={() => document.getElementById('site-url-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="block text-left font-semibold text-emerald-300 underline-offset-2 hover:underline">Update Website URL</button>
                <button onClick={() => document.getElementById('domain-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="block text-left font-semibold text-emerald-300 underline-offset-2 hover:underline">Configure Custom Domain</button>
                <button onClick={manageSeo} className="block text-left font-semibold text-emerald-300 underline-offset-2 hover:underline">Manage Website SEO</button>
                <button onClick={setPublicContactEmail} className="block text-left font-semibold text-emerald-300 underline-offset-2 hover:underline">Set Public Contact Email</button>
              </div>
            </div>

            <div>
              <p className="font-bold uppercase tracking-[0.18em] text-white/90">Site Designs</p>
              <button onClick={() => document.getElementById('design-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="mt-2 block text-left font-semibold text-emerald-300 underline-offset-2 hover:underline">New & Saved Website Designs</button>
            </div>
          </div>
        </aside>

        <div className="space-y-4">
          <div className="rounded-sm border border-white/10 bg-[linear-gradient(180deg,#0b1220,#080e1a)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.38)]">
            <div className="flex items-start justify-between gap-3">
              <p className="text-lg font-extrabold text-slate-100">{siteHost}</p>
              <span className="rounded-full border border-emerald-300/35 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200">Published</span>
            </div>
            <div className="mt-3 flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              <span>Home</span>
              <span>Browse</span>
              <span>Search</span>
            </div>
            <h3 className="mt-5 text-5xl font-thin tracking-[0.08em] text-white">{(profile.brand_name || 'EPIXBOX').toUpperCase()}</h3>
            <p className="mt-2 text-sm text-slate-400">A clean public presence for your own brand and clients.</p>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className={`relative h-56 rounded-sm border border-white/10 ${PREVIEW_TILES[0]}`}>
                <span className="absolute bottom-2 left-2 text-xs font-semibold text-white/90">Homepage Cover</span>
              </div>
              <div className={`relative h-56 rounded-sm border border-white/10 ${PREVIEW_TILES[1]}`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-sm bg-black/35 px-4 py-2 text-center shadow-[0_12px_28px_rgba(0,0,0,0.25)]">
                    <p className="text-4xl font-black text-white/95">{(profile.brand_name || 'EpixBox').split(' ')[0]}</p>
                    <p className="text-lg font-semibold text-white/85">Your Website</p>
                  </div>
                </div>
                <span className="absolute bottom-2 left-2 text-xs font-semibold text-white/90">Featured Gallery</span>
              </div>
              <div className={`h-20 rounded-sm border border-white/10 ${PREVIEW_TILES[2]}`} />
              <div className={`h-20 rounded-sm border border-white/10 ${PREVIEW_TILES[3]}`} />
            </div>
          </div>

          <div id="design-card" className="rounded-sm border border-white/10 bg-[#121926] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.38)]">
            <div className="flex items-center justify-between gap-4">
              <h4 className="text-2xl font-black text-white">Edit Website Layout</h4>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">Global</span>
            </div>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">Edit content that appears on every page of your website. Add a logo, change your menu, or update colors and fonts.</p>
            <div className="mt-4 space-y-1.5 text-sm">
              {SUPPORT_LINKS.map((line) => (
                <p key={line} className="font-semibold text-emerald-300 underline-offset-2 hover:underline">{line}</p>
              ))}
            </div>
            <button onClick={() => navigate('/dashboard/galleries')} className="mt-5 rounded-md border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">Edit Website Layout</button>
          </div>

          <div className="rounded-sm border border-white/10 bg-[#121926] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.38)]">
            <div className="flex items-center justify-between gap-4">
              <h4 className="text-2xl font-black text-white">Manage Individual Pages</h4>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">Pages</span>
            </div>
            <p className="mt-2 text-sm text-slate-300">Add content to pages on your website. Tap Edit, drag content blocks onto your page, and customize as needed.</p>
            <p className="mt-3 text-sm text-slate-300">Visit our support page to <span className="font-semibold text-emerald-300">learn more about customizing website content</span>.</p>

            <div className="mt-4 flex items-center justify-between rounded-lg border border-white/10 bg-black/25 px-4 py-3">
              <span className="font-semibold text-white">Home Page</span>
              <button onClick={() => navigate('/dashboard/proofing')} className="text-sm font-extrabold uppercase tracking-wide text-emerald-300 hover:text-emerald-200">Edit</button>
            </div>
            <p className="mt-4 text-sm text-slate-300"><button onClick={() => navigate('/dashboard/proofing')} className="font-semibold text-emerald-300 underline-offset-2 hover:underline">Go to Organize</button> to create and manage new website pages.</p>
          </div>

          <div id="site-url-card" className="rounded-sm border border-white/10 bg-[#101827] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.38)]">
            <h4 className="text-2xl font-black text-white">Update Website URL</h4>
            <p className="mt-2 text-sm text-slate-300">Set the display URL text used inside your My Site workspace.</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                value={siteUrlInput}
                onChange={(e) => setSiteUrlInput(e.target.value)}
                placeholder="your-brand"
                className="w-full rounded-sm border border-white/20 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-emerald-300"
              />
              <Button onClick={handleSaveSiteUrl} loading={loading}>Save URL</Button>
            </div>
          </div>

          <div id="domain-card" className="rounded-sm border border-white/10 bg-[#101827] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.38)]">
            <h4 className="text-2xl font-black text-white">Configure Custom Domain</h4>
            <p className="mt-2 text-sm text-slate-300">Point your own domain to your EpixBox website.</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="photos.example.com"
                className="w-full rounded-sm border border-white/20 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-emerald-300"
              />
              <Button onClick={handleConnectDomain} loading={domainSaving}>Connect Domain</Button>
            </div>
          </div>
        </div>
      </section>

      {showQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowQr(false)}>
          <div className="w-full max-w-sm rounded-sm border border-white/20 bg-[#0f172a] p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white">Site QR Code</h3>
            <p className="mt-1 text-xs text-slate-400">Scan to open your public site.</p>
            <div className="mt-4 rounded-lg bg-white p-3">
              <img
                src={`https://quickchart.io/qr?text=${encodeURIComponent(publicUrl)}&size=250`}
                alt="Site QR"
                className="mx-auto h-56 w-56"
              />
            </div>
            <button onClick={handleCopyUrl} className="mt-4 w-full rounded-md border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">Copy URL</button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

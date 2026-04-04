import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/common/Button'
import { getProfile, updateProfile } from '../../api/settingsApi'
import useAuthStore from '../../store/authStore'

export default function EditProfilePage() {
  const { updateUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    brand_name: '',
    brand_color: '#22d3ee',
  })

  useEffect(() => {
    getProfile()
      .then((u) => {
        setProfile({
          first_name: u.first_name || '',
          last_name: u.last_name || '',
          brand_name: u.brand_name || '',
          brand_color: u.brand_color || '#22d3ee',
        })
      })
      .catch(() => {
        toast.error('Failed to load profile')
      })
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      const updated = await updateProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
        brand_name: profile.brand_name,
        brand_color: profile.brand_color,
      })
      updateUser(updated)
      setProfile((prev) => ({
        ...prev,
        first_name: updated.first_name || prev.first_name,
        last_name: updated.last_name || prev.last_name,
        brand_name: updated.brand_name || prev.brand_name,
        brand_color: updated.brand_color || prev.brand_color,
      }))
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <section className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[linear-gradient(180deg,#0b1020,#080d19)] p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-200/80">Account</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Edit My Profile</h1>
        <p className="mt-2 text-sm text-slate-300">Update your personal profile details from this page only.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">First Name</label>
            <input
              value={profile.first_name}
              onChange={(e) => setProfile((prev) => ({ ...prev, first_name: e.target.value }))}
              placeholder="First name"
              className="w-full rounded-sm border border-white/20 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-emerald-300"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Last Name</label>
            <input
              value={profile.last_name}
              onChange={(e) => setProfile((prev) => ({ ...prev, last_name: e.target.value }))}
              placeholder="Last name"
              className="w-full rounded-sm border border-white/20 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-emerald-300"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr,180px]">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Brand Name</label>
            <input
              value={profile.brand_name}
              onChange={(e) => setProfile((prev) => ({ ...prev, brand_name: e.target.value }))}
              placeholder="Your brand name"
              className="w-full rounded-sm border border-white/20 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-emerald-300"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Brand Color</label>
            <input
              type="color"
              value={profile.brand_color || '#22d3ee'}
              onChange={(e) => setProfile((prev) => ({ ...prev, brand_color: e.target.value }))}
              className="h-10 w-full rounded-sm border border-white/20 bg-black/25 p-1"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} loading={loading}>Save Profile</Button>
        </div>
      </section>
    </DashboardLayout>
  )
}

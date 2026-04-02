import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import useAuthStore from '../../store/authStore'
import { getProfile, updateProfile, updatePassword, uploadAvatar, getBilling, createBillingPortal } from '../../api/settingsApi'

const TABS = ['Profile', 'Branding', 'Security', 'Billing']

const PLANS = [
  { name: 'Free', price: '$0/mo', features: ['5 GB storage', 'Up to 3 galleries', 'Public portfolio'] },
  { name: 'Pro', price: '$15/mo', features: ['100 GB storage', 'Unlimited galleries', 'Client proofing', 'Online store'] },
  { name: 'Business', price: '$30/mo', features: ['Unlimited storage', 'Custom domain', 'Priority support'] },
]

export default function AccountSettingsPage() {
  const { user, updateUser } = useAuthStore()
  const [tab, setTab] = useState('Profile')
  const [loading, setLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [billing, setBilling] = useState(null)
  const avatarInputRef = useRef(null)
  const [profile, setProfile] = useState({
    first_name: '', last_name: '', bio: '', website_url: '',
    brand_name: '', brand_color: '#6366f1',
  })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  useEffect(() => {
    getProfile()
      .then(u => {
        setProfile({
          first_name: u.first_name || '',
          last_name: u.last_name || '',
          bio: u.bio || '',
          website_url: u.website_url || '',
          brand_name: u.brand_name || '',
          brand_color: u.brand_color || '#6366f1',
        })
        updateUser(u)
      })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (tab === 'Billing') {
      getBilling()
        .then(data => setBilling(data))
        .catch(() => {})
    }
  }, [tab])

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      return toast.error('Please select an image file')
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image must be smaller than 5 MB')
    }
    setAvatarLoading(true)
    try {
      const data = await uploadAvatar(file)
      updateUser({ avatar_url: data.avatar_url })
      toast.success('Avatar updated!')
    } catch {
      toast.error('Failed to upload avatar')
    } finally {
      setAvatarLoading(false)
      e.target.value = ''
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const updated = await updateProfile(profile)
      updateUser(updated)
      toast.success('Profile saved!')
    } catch { toast.error('Failed to save profile') }
    finally { setLoading(false) }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('Passwords do not match')
    }
    if (passwords.newPassword.length < 8) {
      return toast.error('Password must be at least 8 characters')
    }
    setLoading(true)
    try {
      await updatePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword })
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast.success('Password updated!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update password')
    } finally { setLoading(false) }
  }

  const handleBillingPortal = async () => {
    try {
      const { url } = await createBillingPortal()
      window.open(url, '_blank')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Billing portal unavailable')
    }
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition',
              tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="max-w-2xl">
        {/* Profile Tab */}
        {tab === 'Profile' && (
          <form onSubmit={handleSaveProfile} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative group">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="Avatar"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-2xl font-bold uppercase">
                    {user?.first_name?.[0] || user?.username?.[0] || '?'}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarLoading}
                  className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-indigo-500 transition-opacity cursor-pointer"
                  aria-label="Change avatar"
                >
                  {avatarLoading ? (
                    <Spinner size="sm" />
                  ) : (
                    <span className="text-white text-xs font-medium">Edit</span>
                  )}
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user?.username}</p>
                <p className="text-sm text-gray-400">{user?.email}</p>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarLoading}
                  className="text-xs text-indigo-600 hover:underline mt-0.5 disabled:opacity-50"
                >
                  Change photo
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input value={profile.first_name} onChange={e => setProfile(p => ({ ...p, first_name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input value={profile.last_name} onChange={e => setProfile(p => ({ ...p, last_name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} rows={3} placeholder="Tell clients about yourself..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
              <input value={profile.website_url} onChange={e => setProfile(p => ({ ...p, website_url: e.target.value }))} placeholder="https://yourwebsite.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div className="pt-2">
              <Button type="submit" loading={loading}>Save Profile</Button>
            </div>
          </form>
        )}

        {/* Branding Tab */}
        {tab === 'Branding' && (
          <form onSubmit={handleSaveProfile} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
              <input value={profile.brand_name} onChange={e => setProfile(p => ({ ...p, brand_name: e.target.value }))} placeholder="Your Photography Name" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={profile.brand_color} onChange={e => setProfile(p => ({ ...p, brand_color: e.target.value }))} className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer" />
                <span className="text-sm text-gray-500">{profile.brand_color}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
              <div className="rounded-lg py-3 px-4" style={{ backgroundColor: profile.brand_color }}>
                <span className="text-white font-bold">{profile.brand_name || 'Your Brand Name'}</span>
              </div>
            </div>
            <Button type="submit" loading={loading}>Save Branding</Button>
          </form>
        )}

        {/* Security Tab */}
        {tab === 'Security' && (
          <form onSubmit={handlePasswordChange} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Change Password</h3>
            {[
              { label: 'Current Password', key: 'currentPassword' },
              { label: 'New Password', key: 'newPassword' },
              { label: 'Confirm New Password', key: 'confirmPassword' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input
                  type="password"
                  value={passwords[f.key]}
                  onChange={e => setPasswords(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            ))}
            <Button type="submit" loading={loading}>Update Password</Button>
          </form>
        )}

        {/* Billing Tab */}
        {tab === 'Billing' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <p className="text-sm text-gray-500 mb-1">Current Plan</p>
              <p className="text-2xl font-bold text-gray-900 capitalize">
                {billing ? billing.plan : (user?.plan || 'Free')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS.map(plan => {
                const activePlan = billing ? billing.plan : (user?.plan || 'free')
                return (
                  <div key={plan.name} className={clsx('rounded-xl border-2 p-5', activePlan === plan.name.toLowerCase() ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200')}>
                    <p className="font-bold text-gray-900">{plan.name}</p>
                    <p className="text-lg font-bold text-indigo-600 my-2">{plan.price}</p>
                    <ul className="space-y-1">
                      {plan.features.map(f => <li key={f} className="text-xs text-gray-500">✓ {f}</li>)}
                    </ul>
                  </div>
                )
              })}
            </div>
            <Button variant="outline" onClick={handleBillingPortal}>Manage Billing →</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

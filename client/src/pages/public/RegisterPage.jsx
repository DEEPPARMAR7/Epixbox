import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { register as apiRegister } from '../../api/authApi'
import useAuthStore from '../../store/authStore'

const schema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  username: z.string().min(3, 'Min 3 chars').max(20, 'Max 20 chars')
    .regex(/^[a-z0-9_]+$/, 'Lowercase letters, numbers, underscores only'),
  password: z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match', path: ['confirmPassword'],
})

const INPUT = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/40 focus:bg-white/10 transition text-sm'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      const payload = { ...data }
      delete payload.confirmPassword
      const res = await apiRegister(payload)
      login(res.user, res.accessToken, res.refreshToken)
      toast.success('Welcome to EpicBox!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex bg-black">
      {/* Left - Photo */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden flex-col">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        <div className="relative z-10 flex flex-col justify-between p-12 h-full">
          <Link to="/" className="text-2xl font-black text-white">EpicBox</Link>
          <div className="space-y-6">
            {['Showcase your portfolio', 'Proof with clients', 'Sell prints worldwide'].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <span className="text-white/80 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-12 lg:px-16 bg-zinc-950 overflow-y-auto py-12">
        <div className="w-full max-w-md mx-auto">
          <Link to="/" className="lg:hidden text-2xl font-black text-white mb-8 block">EpicBox</Link>
          <h1 className="text-3xl font-black text-white mb-2">Create your portfolio</h1>
          <p className="text-white/40 text-sm mb-8">Free forever. No credit card required.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">First Name</label>
                <input {...register('first_name')} type="text" placeholder="Jane" className={INPUT} />
                {errors.first_name && <p className="text-red-400 text-xs mt-1">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Last Name</label>
                <input {...register('last_name')} type="text" placeholder="Doe" className={INPUT} />
                {errors.last_name && <p className="text-red-400 text-xs mt-1">{errors.last_name.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Email</label>
              <input {...register('email')} type="email" placeholder="jane@example.com" className={INPUT} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Username</label>
              <input
                {...register('username')}
                type="text"
                placeholder="janedoe"
                className={INPUT}
              />
              {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Password</label>
              <input {...register('password')} type="password" placeholder="Min 8 characters" className={INPUT} />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Confirm Password</label>
              <input {...register('confirmPassword')} type="password" placeholder="••••••••" className={INPUT} />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating account...' : 'Create My Portfolio'}
            </button>
          </form>

          <p className="text-center text-sm text-white/30 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-white font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

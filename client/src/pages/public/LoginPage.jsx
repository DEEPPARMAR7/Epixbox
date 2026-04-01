import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { login as apiLogin } from '../../api/authApi'
import useAuthStore from '../../store/authStore'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

const INPUT = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/40 focus:bg-white/10 transition text-sm'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      const res = await apiLogin(data)
      login(res.user, res.accessToken, res.refreshToken)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen flex bg-black">
      {/* Left - Photo */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1200&q=85"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="text-2xl font-black text-white tracking-tight">EpicBox</Link>
          <div>
            <blockquote className="text-3xl font-bold text-white leading-tight mb-4">
              "Your work deserves to be seen by the world."
            </blockquote>
            <p className="text-white/50 text-sm">EpicBox Photography Platform</p>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-20 bg-zinc-950">
        <div className="w-full max-w-md mx-auto">
          <Link to="/" className="lg:hidden text-2xl font-black text-white mb-10 block">EpicBox</Link>
          <h1 className="text-3xl font-black text-white mb-2">Welcome back</h1>
          <p className="text-white/40 text-sm mb-10">Sign in to your EpicBox account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Email</label>
              <input {...register('email')} type="email" placeholder="you@example.com" className={INPUT} />
              {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>}
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs text-white/40 hover:text-white transition">Forgot password?</Link>
              </div>
              <input {...register('password')} type="password" placeholder="••••••••" className={INPUT} />
              {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-100 transition mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-white/30 mt-8">
            No account?{' '}
            <Link to="/register" className="text-white font-semibold hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

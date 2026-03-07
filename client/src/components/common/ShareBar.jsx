import { useState } from 'react'
import toast from 'react-hot-toast'

export default function ShareBar({ url, title }) {
  const [copied, setCopied] = useState(false)
  const fullUrl = url || window.location.href
  const encoded = encodeURIComponent(fullUrl)
  const encodedTitle = encodeURIComponent(title || document.title)

  const copyLink = () => {
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true)
      toast.success('Link copied!')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const shares = [
    {
      label: 'X / Twitter',
      icon: '𝕏',
      href: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`,
      bg: 'hover:bg-black',
    },
    {
      label: 'Facebook',
      icon: 'f',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      bg: 'hover:bg-blue-600',
    },
    {
      label: 'WhatsApp',
      icon: '💬',
      href: `https://wa.me/?text=${encodedTitle}%20${encoded}`,
      bg: 'hover:bg-green-600',
    },
    {
      label: 'Pinterest',
      icon: '📌',
      href: `https://pinterest.com/pin/create/button/?url=${encoded}&description=${encodedTitle}`,
      bg: 'hover:bg-red-600',
    },
  ]

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Copy link */}
      <button
        onClick={copyLink}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition border ${
          copied
            ? 'bg-white text-black border-white'
            : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
        }`}
      >
        {copied ? '✓ Copied!' : '🔗 Copy Link'}
      </button>

      {shares.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          title={`Share on ${s.label}`}
          className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm bg-white/5 border border-white/10 text-white/60 hover:text-white transition ${s.bg}`}
        >
          {s.icon}
        </a>
      ))}
    </div>
  )
}

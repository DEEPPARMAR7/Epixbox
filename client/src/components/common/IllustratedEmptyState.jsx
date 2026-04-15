import { Link } from 'react-router-dom'

const VARIANT_STYLES = {
  gallery: {
    accent: 'from-emerald-400/30 to-cyan-400/30',
    blob: 'bg-emerald-300/15',
    glyph: '📷',
  },
  orders: {
    accent: 'from-sky-400/30 to-indigo-400/30',
    blob: 'bg-sky-300/15',
    glyph: '🧾',
  },
  plans: {
    accent: 'from-amber-400/30 to-orange-400/30',
    blob: 'bg-amber-300/15',
    glyph: '🔁',
  },
  analytics: {
    accent: 'from-violet-400/30 to-fuchsia-400/30',
    blob: 'bg-violet-300/15',
    glyph: '📈',
  },
}

export default function IllustratedEmptyState({
  variant = 'gallery',
  title,
  description,
  actionLabel,
  actionTo,
  action,
}) {
  const style = VARIANT_STYLES[variant] || VARIANT_STYLES.gallery

  return (
    <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-12 text-center sm:px-8 sm:py-14">
      <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-3xl border border-white/15 bg-gradient-to-br shadow-[0_20px_40px_rgba(0,0,0,0.2)] sm:h-24 sm:w-24">
        <div className={`absolute h-20 w-20 rounded-3xl blur-xl ${style.blob}`} aria-hidden="true" />
        <span className="relative text-3xl sm:text-4xl" aria-hidden="true">{style.glyph}</span>
      </div>

      <h3 className="text-lg font-bold text-white sm:text-xl">{title}</h3>
      {description && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">{description}</p>}

      {(actionLabel && actionTo) || action ? (
        <div className="mt-6">
          {action ? (
            <button
              type="button"
              onClick={action}
              className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r px-5 py-2.5 text-sm font-extrabold uppercase tracking-wide text-white transition hover:opacity-90 ${style.accent}`}
            >
              {actionLabel}
            </button>
          ) : (
            <Link
              to={actionTo}
              className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r px-5 py-2.5 text-sm font-extrabold uppercase tracking-wide text-white transition hover:opacity-90 ${style.accent}`}
            >
              {actionLabel}
            </Link>
          )}
        </div>
      ) : null}
    </div>
  )
}
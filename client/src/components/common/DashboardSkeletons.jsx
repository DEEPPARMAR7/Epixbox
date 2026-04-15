function PulseBlock({ className }) {
  return <div className={`animate-pulse rounded-xl bg-white/10 ${className}`} />
}

export function DashboardHeaderSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
      <PulseBlock className="h-3 w-24" />
      <PulseBlock className="mt-3 h-9 w-64 max-w-full" />
      <PulseBlock className="mt-3 h-4 w-full" />
      <PulseBlock className="mt-2 h-4 w-5/6" />
    </div>
  )
}

export function DashboardStatsSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-4">
          <PulseBlock className="h-3 w-24" />
          <PulseBlock className="mt-3 h-8 w-20" />
        </div>
      ))}
    </div>
  )
}

export function DashboardCardsSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <PulseBlock className="h-24 w-full" />
          <PulseBlock className="mt-4 h-4 w-2/3" />
          <PulseBlock className="mt-2 h-3 w-5/6" />
        </div>
      ))}
    </div>
  )
}

export function DashboardTableSkeleton({ rows = 6 }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <div className="grid grid-cols-4 gap-3 border-b border-white/10 p-4">
        <PulseBlock className="h-3 w-20" />
        <PulseBlock className="h-3 w-20" />
        <PulseBlock className="h-3 w-20" />
        <PulseBlock className="h-3 w-20" />
      </div>
      <div className="space-y-2 p-4">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="grid grid-cols-4 gap-3">
            <PulseBlock className="h-4 w-full" />
            <PulseBlock className="h-4 w-full" />
            <PulseBlock className="h-4 w-full" />
            <PulseBlock className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardChartSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <PulseBlock className="h-4 w-40" />
      <PulseBlock className="mt-5 h-64 w-full" />
    </div>
  )
}

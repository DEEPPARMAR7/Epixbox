export default function PortfolioLayout({ children, photographer }) {
  const brandColor = photographer?.brand_color || '#6366f1'
  const brandName = photographer?.brand_name || photographer?.username || 'Portfolio'

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <nav className="py-4 px-8 shadow-sm" style={{ backgroundColor: brandColor }}>
        <h1 className="text-white text-2xl font-bold tracking-tight">{brandName}</h1>
      </nav>
      <main className="flex-1">{children}</main>
      <footer className="py-6 text-center text-gray-400 text-sm border-t border-gray-100">
        <p>Powered by <span className="font-semibold text-indigo-600">EpicBox</span></p>
      </footer>
    </div>
  )
}

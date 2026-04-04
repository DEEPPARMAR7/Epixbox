import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Spinner from '../../components/common/Spinner'
import { getSessions, createSession, deleteSession, sendInvite, getSessionDownloads } from '../../api/proofingApi'
import { getGalleries, updateGallery } from '../../api/galleryApi'
import { formatDate } from '../../utils/formatters'
import useAuthStore from '../../store/authStore'

export default function ClientProofingAdminPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [sessions, setSessions] = useState([])
  const [galleries, setGalleries] = useState([])
  const [selectedGalleryId, setSelectedGalleryId] = useState('')
  const [selectedGalleryIds, setSelectedGalleryIds] = useState([])
  const [sortBy, setSortBy] = useState('manual')
  const [gridSize, setGridSize] = useState('medium')
  const [treeOpen, setTreeOpen] = useState({ homepage: true, events: true })
  const [orderedGalleryIds, setOrderedGalleryIds] = useState([])
  const [draggingGalleryId, setDraggingGalleryId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showPageActions, setShowPageActions] = useState(false)
  const [creating, setCreating] = useState(false)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [moveTargetParentId, setMoveTargetParentId] = useState('')
  const [savingOrder, setSavingOrder] = useState(false)
  const [moving, setMoving] = useState(false)
  const [showDownloadsModal, setShowDownloadsModal] = useState(false)
  const [downloadsLoading, setDownloadsLoading] = useState(false)
  const [downloadsMeta, setDownloadsMeta] = useState({ total: 0, last_download_at: null, max_download_count: null })
  const [downloadsList, setDownloadsList] = useState([])
  const [downloadsSessionTitle, setDownloadsSessionTitle] = useState('')
  const [form, setForm] = useState({
    gallery_id: '',
    client_name: '',
    client_email: '',
    message: '',
    include_subfolders: false,
    allow_downloads: true,
    download_mode: 'original',
    max_download_count: '',
  })

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

  const load = () => {
    Promise.all([getSessions(), getGalleries()])
      .then(([s, g]) => {
        setSessions(s)
        setGalleries(g)
        setOrderedGalleryIds((prev) => {
          if (prev.length === 0) return g.map((x) => x.id)
          const existing = prev.filter((id) => g.some((x) => x.id === id))
          const missing = g.filter((x) => !existing.includes(x.id)).map((x) => x.id)
          return [...existing, ...missing]
        })
        if (g.length > 0) {
          setSelectedGalleryId((prev) => prev || g[0].id)
          setForm((prev) => ({ ...prev, gallery_id: prev.gallery_id || g[0].id }))
        }
      })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (galleries.length === 0) return toast.error('Create a gallery first before creating a session')
    if (!form.gallery_id) return toast.error('Select a gallery')
    setCreating(true)
    try {
      await createSession(form)
      toast.success('Proofing session created!')
      setShowCreate(false)
      setForm({
        gallery_id: galleries[0]?.id || '',
        client_name: '',
        client_email: '',
        message: '',
        include_subfolders: false,
        allow_downloads: true,
        download_mode: 'original',
        max_download_count: '',
      })
      load()
    } catch (err) {
      const apiError = err.response?.data?.error
      const fallback = err.message || 'Failed to create session'
      toast.error(apiError || fallback)
    } finally {
      setCreating(false)
    }
  }

  const handleSendInvite = async (id) => {
    try {
      await sendInvite(id)
      toast.success('Invite email sent!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send invite')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this proofing session?')) return
    try {
      await deleteSession(id)
      setSessions(s => s.filter(x => x.id !== id))
      toast.success('Session deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const openDownloads = async (session) => {
    setShowDownloadsModal(true)
    setDownloadsLoading(true)
    setDownloadsMeta({ total: 0, last_download_at: null, max_download_count: null })
    setDownloadsList([])
    setDownloadsSessionTitle(session?.client_name || 'Session')
    try {
      const data = await getSessionDownloads(session.id)
      setDownloadsMeta({
        total: data.total || 0,
        last_download_at: data.last_download_at || null,
        max_download_count: data.max_download_count || null,
      })
      setDownloadsList(data.downloads || [])
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load download history')
    } finally {
      setDownloadsLoading(false)
    }
  }

  const copyLink = (token) => {
    const link = `${window.location.origin}/proof/${token}`
    navigator.clipboard.writeText(link)
    toast.success('Link copied!')
  }

  const copyGalleryLink = (gallery) => {
    const username = resolveUsername()

    if (!username) {
      toast.error('Unable to resolve portfolio username')
      return
    }

    if (!gallery?.slug) {
      toast.error('No public gallery link available')
      return
    }
    const link = `${window.location.origin}/p/${username}/${gallery.slug}`
    navigator.clipboard.writeText(link)
    toast.success('Gallery link copied!')
  }

  const handleShare = () => {
    const username = resolveUsername()

    if (!username) {
      toast.error('Unable to resolve portfolio username')
      return
    }

    if (selectedGalleryIds.length > 0) {
      const links = galleries
        .filter((g) => selectedGalleryIds.includes(g.id) && g.slug)
        .map((g) => `${window.location.origin}/p/${username}/${g.slug}`)
      if (links.length === 0) return toast.error('Selected galleries have no public links')
      navigator.clipboard.writeText(links.join('\n'))
      toast.success('Selected gallery links copied')
      return
    }

    if (selectedGallery) {
      copyGalleryLink(selectedGallery)
      return
    }

    toast.error('Select a gallery first')
  }

  const handleViewOnSite = () => {
    const username = resolveUsername()

    if (!username) return toast.error('Unable to resolve portfolio username')
    if (!selectedGallery?.slug) {
      window.open(`/p/${username}`, '_blank')
      return
    }

    if (selectedGallery.visibility === 'private') {
      toast('Selected gallery is private. Opening public portfolio instead.')
      window.open(`/p/${username}`, '_blank')
      return
    }

    window.open(`/p/${username}/${selectedGallery.slug}`, '_blank')
  }

  const handleSelectAll = () => {
    if (sortedGalleries.length === 0) return
    if (selectedGalleryIds.length === sortedGalleries.length) {
      setSelectedGalleryIds([])
    } else {
      setSelectedGalleryIds(sortedGalleries.map((g) => g.id))
    }
  }

  const toggleGallerySelection = (galleryId) => {
    setSelectedGalleryIds((prev) => (
      prev.includes(galleryId)
        ? prev.filter((id) => id !== galleryId)
        : [...prev, galleryId]
    ))
  }

  const toggleTree = (key) => {
    setTreeOpen((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleIconClearSelection = () => {
    setSelectedGalleryIds([])
    toast.success('Selection cleared')
  }

  const handleIconInvertSelection = () => {
    const visibleIds = sortedGalleries.map((g) => g.id)
    setSelectedGalleryIds((prev) => visibleIds.filter((id) => !prev.includes(id)))
    toast.success('Selection inverted')
  }

  const handleDeleteSelectedSessions = async () => {
    const toDelete = selectedSessions.filter((s) => selectedGalleryIds.includes(s.gallery_id))
    if (toDelete.length === 0) return toast.error('Select galleries with sessions first')
    if (!confirm(`Delete ${toDelete.length} sessions from selected galleries?`)) return

    try {
      await Promise.all(toDelete.map((s) => deleteSession(s.id)))
      setSessions((prev) => prev.filter((s) => !toDelete.some((d) => d.id === s.id)))
      toast.success(`Deleted ${toDelete.length} sessions`)
    } catch {
      toast.error('Failed to delete selected sessions')
    }
  }

  const handleMoveSelected = () => {
    if (selectedGalleryIds.length === 0) {
      toast.error('Select at least one gallery first')
      return
    }
    setMoveTargetParentId('')
    setShowMoveModal(true)
  }

  const submitMoveSelected = async () => {
    if (selectedGalleryIds.length === 0) return
    setMoving(true)
    try {
      const selectedMap = new Set(selectedGalleryIds)
      const updates = galleries
        .filter((g) => selectedMap.has(g.id))
        .map((gallery) => updateGallery(gallery.id, {
          title: gallery.title,
          description: gallery.description || '',
          visibility: gallery.visibility || 'public',
          parent_id: moveTargetParentId || null,
          sort_order: gallery.sort_order || 0,
        }))

      await Promise.all(updates)
      toast.success(`Moved ${selectedGalleryIds.length} item${selectedGalleryIds.length > 1 ? 's' : ''}`)
      setShowMoveModal(false)
      setSelectedGalleryIds([])
      load()
    } catch {
      toast.error('Failed to move selected galleries')
    } finally {
      setMoving(false)
    }
  }

  const handleSaveOrder = async () => {
    if (sortBy !== 'manual') {
      toast.error('Switch sort to Manual Order first')
      return
    }
    setSavingOrder(true)
    try {
      const ordered = orderedGalleryIds
        .map((id) => galleries.find((g) => g.id === id))
        .filter(Boolean)

      await Promise.all(
        ordered.map((gallery, idx) => updateGallery(gallery.id, {
          title: gallery.title,
          description: gallery.description || '',
          visibility: gallery.visibility || 'public',
          parent_id: gallery.parent_id || null,
          sort_order: idx,
        }))
      )

      toast.success('Manual order saved')
      load()
    } catch {
      toast.error('Failed to save manual order')
    } finally {
      setSavingOrder(false)
    }
  }

  const handleDragStart = (galleryId) => {
    setDraggingGalleryId(galleryId)
  }

  const handleDragOver = (targetGalleryId) => {
    if (!draggingGalleryId || draggingGalleryId === targetGalleryId) return
    setOrderedGalleryIds((prev) => {
      const withoutDragging = prev.filter((id) => id !== draggingGalleryId)
      const insertAt = withoutDragging.indexOf(targetGalleryId)
      if (insertAt < 0) return prev
      withoutDragging.splice(insertAt, 0, draggingGalleryId)
      return withoutDragging
    })
  }

  const handleDragEnd = () => {
    setDraggingGalleryId(null)
  }

  const galleryById = new Map(galleries.map((g) => [g.id, g]))
  const manualOrder = orderedGalleryIds.map((id) => galleryById.get(id)).filter(Boolean)
  const remaining = galleries.filter((g) => !orderedGalleryIds.includes(g.id))
  const baseList = [...manualOrder, ...remaining]

  const sortedGalleries = [...baseList].sort((a, b) => {
    if (sortBy === 'manual') return 0
    const aDate = new Date(a.updated_at || a.created_at || 0).getTime()
    const bDate = new Date(b.updated_at || b.created_at || 0).getTime()
    if (sortBy === 'date_asc') return aDate - bDate
    if (sortBy === 'title_asc') return (a.title || '').localeCompare(b.title || '')
    if (sortBy === 'title_desc') return (b.title || '').localeCompare(a.title || '')
    return bDate - aDate
  })

  const treeMap = sortedGalleries.reduce((acc, gallery) => {
    const key = gallery.parent_id || 'root'
    if (!acc[key]) acc[key] = []
    acc[key].push(gallery)
    return acc
  }, {})

  const renderTreeNodes = (parentId = 'root', depth = 0) => {
    const nodes = treeMap[parentId] || []
    return nodes.map((gallery) => (
      <div key={gallery.id}>
        <button
          onClick={() => setSelectedGalleryId(gallery.id)}
          className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition ${selectedGalleryId === gallery.id ? 'bg-emerald-300/10 text-emerald-200' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
          style={{ paddingLeft: `${10 + depth * 14}px` }}
        >
          <span className="text-xs text-slate-500">▸</span>
          <span className="text-xs">📁</span>
          <span className="truncate">{gallery.title}</span>
        </button>
        {renderTreeNodes(gallery.id, depth + 1)}
      </div>
    ))
  }

  const selectedGallery = sortedGalleries.find((g) => g.id === selectedGalleryId) || null
  const selectedSessions = selectedGalleryId
    ? sessions.filter((session) => session.gallery_id === selectedGalleryId)
    : sessions
  const activeCount = sessions.filter(s => s.is_active).length
  const gridClass = gridSize === 'small'
    ? 'grid-cols-3 md:grid-cols-5 lg:grid-cols-8'
    : gridSize === 'large'
      ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4'
      : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6'

  return (
    <DashboardLayout>
      <div className="mb-4 rounded-xl border border-white/10 bg-[#0a1020]/80 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Organize</h1>
            <p className="mt-1 text-sm text-slate-400">Site Homepage</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={handleShare} className="rounded-md border border-white/20 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10">Share</button>
            <button onClick={handleViewOnSite} className="rounded-md border border-white/20 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10">View On Site</button>
            <div className="relative">
              <button onClick={() => setShowPageActions((v) => !v)} className="rounded-md border border-white/20 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10">Page Actions</button>
              {showPageActions && (
                <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-white/10 bg-[#0b1020] p-1 shadow-xl">
                  <button onClick={() => { setShowCreate(true); setShowPageActions(false) }} className="block w-full rounded-md px-3 py-2 text-left text-xs text-slate-200 hover:bg-white/10">Create Session</button>
                  <button onClick={() => { handleShare(); setShowPageActions(false) }} className="block w-full rounded-md px-3 py-2 text-left text-xs text-slate-200 hover:bg-white/10">Copy Share Link</button>
                  <button onClick={() => { navigate('/dashboard/settings'); setShowPageActions(false) }} className="block w-full rounded-md px-3 py-2 text-left text-xs text-slate-200 hover:bg-white/10">Open Settings</button>
                </div>
              )}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md border border-white/20 bg-transparent px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
            >
              <option value="manual">Sort By Manual Order</option>
              <option value="date_desc">Sort By Date Modified</option>
              <option value="date_asc">Sort By Date Created</option>
              <option value="title_asc">Sort By Title A-Z</option>
              <option value="title_desc">Sort By Title Z-A</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-md border border-white/20 px-3 py-2 font-semibold text-slate-200 transition hover:bg-white/10"
            disabled={galleries.length === 0}
          >
            + Create
          </button>
          <button onClick={() => navigate('/dashboard/settings')} className="rounded-md border border-white/20 px-3 py-2 font-semibold text-slate-200 transition hover:bg-white/10">Settings</button>
          <button onClick={handleSelectAll} className="rounded-md border border-white/20 px-3 py-2 font-semibold text-slate-200 transition hover:bg-white/10">Select All</button>
          <button onClick={handleMoveSelected} className="rounded-md border border-white/20 px-3 py-2 font-semibold text-slate-200 transition hover:bg-white/10">Move To Folder</button>
          <button onClick={handleSaveOrder} disabled={savingOrder} className="rounded-md border border-white/20 px-3 py-2 font-semibold text-slate-200 transition hover:bg-white/10 disabled:opacity-60">{savingOrder ? 'Saving...' : 'Save Order'}</button>
          <button onClick={handleIconClearSelection} title="Clear selection" className="rounded-md border border-white/20 px-2.5 py-2 font-semibold text-slate-200 transition hover:bg-white/10">◻</button>
          <button onClick={handleIconInvertSelection} title="Invert selection" className="rounded-md border border-white/20 px-2.5 py-2 font-semibold text-slate-200 transition hover:bg-white/10">✎</button>
          <button onClick={handleShare} title="Share selected" className="rounded-md border border-white/20 px-2.5 py-2 font-semibold text-slate-200 transition hover:bg-white/10">⇪</button>
          <button onClick={handleDeleteSelectedSessions} title="Delete sessions in selected galleries" className="rounded-md border border-white/20 px-2.5 py-2 font-semibold text-slate-200 transition hover:bg-white/10">📋</button>
          <button
            onClick={load}
            className="rounded-md border border-white/20 px-3 py-2 font-semibold text-slate-200 transition hover:bg-white/10"
          >
            Refresh
          </button>
          <span className="ml-auto rounded-full bg-emerald-500/20 px-2.5 py-1 text-emerald-200 ring-1 ring-emerald-300/30">Active {activeCount}</span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-slate-300 ring-1 ring-white/20">Total {sessions.length}</span>
          <div className="ml-2 flex items-center gap-1">
            <button
              onClick={() => setGridSize('small')}
              className={`rounded-md border px-2.5 py-2 font-semibold transition ${gridSize === 'small' ? 'border-emerald-300/40 bg-emerald-300/10 text-emerald-200' : 'border-white/20 text-slate-200 hover:bg-white/10'}`}
            >
              ◧
            </button>
            <button
              onClick={() => setGridSize('medium')}
              className={`rounded-md border px-2.5 py-2 font-semibold transition ${gridSize === 'medium' ? 'border-emerald-300/40 bg-emerald-300/10 text-emerald-200' : 'border-white/20 text-slate-200 hover:bg-white/10'}`}
            >
              ◨
            </button>
            <button
              onClick={() => setGridSize('large')}
              className={`rounded-md border px-2.5 py-2 font-semibold transition ${gridSize === 'large' ? 'border-emerald-300/40 bg-emerald-300/10 text-emerald-200' : 'border-white/20 text-slate-200 hover:bg-white/10'}`}
            >
              ⬜
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px,minmax(0,1fr)]">
        <aside className="rounded-xl border border-white/10 bg-[#0a1020]/80 p-3">
          <button onClick={() => toggleTree('homepage')} className="mb-2 flex w-full items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            <span>Site Homepage</span>
            <span>{treeOpen.homepage ? '−' : '+'}</span>
          </button>
          {treeOpen.homepage && (
            <div className="space-y-0.5">{renderTreeNodes('root', 0)}</div>
          )}

          <button onClick={() => toggleTree('events')} className="mb-2 mt-4 flex w-full items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            <span>Events</span>
            <span>{treeOpen.events ? '−' : '+'}</span>
          </button>
          {treeOpen.events && (
            <div className="space-y-0.5">
              <div className="rounded-md px-2.5 py-2 text-left text-sm text-slate-400">No events yet</div>
            </div>
          )}
        </aside>

        <section>
          {loading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : galleries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/20 bg-white/5 py-16 text-center">
              <h3 className="text-lg font-semibold text-white">No galleries yet</h3>
              <p className="mt-2 text-sm text-slate-400">Create a gallery first, then organize it here.</p>
            </div>
          ) : (
            <>
              <div className={`mb-4 grid gap-2 ${gridClass}`}>
                {sortedGalleries.map((gallery) => (
                  <div
                    key={gallery.id}
                    onClick={() => setSelectedGalleryId(gallery.id)}
                    draggable={sortBy === 'manual'}
                    onDragStart={() => handleDragStart(gallery.id)}
                    onDragOver={(e) => {
                      e.preventDefault()
                      handleDragOver(gallery.id)
                    }}
                    onDragEnd={handleDragEnd}
                    className={`group overflow-hidden rounded-sm border text-left transition ${selectedGalleryId === gallery.id ? 'border-emerald-300/50 ring-1 ring-emerald-300/40' : 'border-white/10 hover:border-white/25'}`}
                  >
                    <div className="aspect-[4/3] bg-[#111827]">
                      <img
                        src={gallery.cover_url || `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=70&sig=${gallery.id}`}
                        alt={gallery.title}
                        className="h-full w-full object-cover"
                        onError={(e) => { e.target.src = `https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=70&sig=${gallery.id}` }}
                      />
                    </div>
                    <div className="bg-[#0b1020] p-2">
                      <div className="flex items-center justify-between gap-1">
                        <p className="truncate text-xs font-semibold text-white">{gallery.title}</p>
                        <input
                          type="checkbox"
                          checked={selectedGalleryIds.includes(gallery.id)}
                          onChange={(e) => {
                            e.stopPropagation()
                            toggleGallerySelection(gallery.id)
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="h-3.5 w-3.5 rounded border-white/30 bg-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">Proofing Sessions · {selectedGallery?.title || 'All'}</p>
                  {selectedGallery && (
                    <button
                      onClick={() => copyGalleryLink(selectedGallery)}
                      className="text-xs font-semibold text-emerald-300 hover:text-emerald-200"
                    >
                      Copy Gallery Link
                    </button>
                  )}
                </div>

                {selectedSessions.length === 0 ? (
                  <div className="py-6 text-sm text-slate-400">No sessions for this gallery yet.</div>
                ) : (
                  <div className="space-y-3">
                    {selectedSessions.map((s) => (
                      <div key={s.id} className="rounded-lg border border-white/10 bg-[#0a0f19]/70 p-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-white">{s.client_name || 'Unnamed Client'}</p>
                            <p className="mt-0.5 text-xs text-slate-400">Created {formatDate(s.created_at)}</p>
                            {s.include_subfolders && (
                              <p className="mt-0.5 text-xs text-emerald-300">Includes subfolders</p>
                            )}
                            <p className="mt-0.5 text-xs text-slate-400">
                              Downloads: {s.download_count || 0}
                              {s.max_download_count ? ` / ${s.max_download_count}` : ''}
                              {s.last_download_at ? ` · Last ${formatDate(s.last_download_at)}` : ''}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <button onClick={() => copyLink(s.share_token)} className="text-xs text-emerald-300 hover:underline">Copy Link</button>
                              {s.client_email && (
                                <button onClick={() => handleSendInvite(s.id)} className="text-xs text-slate-300 hover:text-white">Send Email</button>
                              )}
                              <button onClick={() => openDownloads(s)} className="text-xs text-slate-300 hover:text-white">Downloads</button>
                            </div>
                          </div>
                          <button onClick={() => handleDelete(s.id)} className="text-xs font-semibold text-red-400 hover:text-red-300">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Proofing Session">
        <form onSubmit={handleCreate} className="space-y-4">
          {galleries.length === 0 && (
            <div className="rounded-lg border border-amber-300/30 bg-amber-500/10 p-3 text-sm text-amber-100">
              You need at least one gallery before creating a proofing session.
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Gallery *</label>
            <select
              value={form.gallery_id}
              onChange={e => setForm(f => ({ ...f, gallery_id: e.target.value }))}
              className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300/50 text-sm bg-white/5 text-white"
              disabled={galleries.length === 0}
            >
              <option value="">Select a gallery...</option>
              {galleries.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Client Name</label>
            <input
              value={form.client_name}
              onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
              placeholder="e.g. Sarah & Mike"
              className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300/50 text-sm bg-white/5 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Client Email</label>
            <input
              type="email"
              value={form.client_email}
              onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))}
              placeholder="client@example.com"
              className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300/50 text-sm bg-white/5 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Message to Client</label>
            <textarea
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Please review and select your favorites..."
              rows={3}
              className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300/50 text-sm resize-none bg-white/5 text-white"
            />
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <label className="flex items-center justify-between gap-3 text-sm text-slate-200">
              <span>Include subfolders (all photos/videos in this folder tree)</span>
              <input
                type="checkbox"
                checked={!!form.include_subfolders}
                onChange={(e) => setForm((f) => ({ ...f, include_subfolders: e.target.checked }))}
                className="h-4 w-4"
              />
            </label>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-3">
            <label className="flex items-center justify-between gap-3 text-sm text-slate-200">
              <span>Allow client downloads</span>
              <input
                type="checkbox"
                checked={!!form.allow_downloads}
                onChange={(e) => setForm((f) => ({ ...f, allow_downloads: e.target.checked }))}
                className="h-4 w-4"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Download Mode</label>
                <select
                  value={form.download_mode}
                  onChange={(e) => setForm((f) => ({ ...f, download_mode: e.target.value }))}
                  disabled={!form.allow_downloads}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-sm bg-white/5 text-white disabled:opacity-50"
                >
                  <option value="original">Original</option>
                  <option value="watermarked">Watermarked (images)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Max Downloads (optional)</label>
                <input
                  type="number"
                  min="1"
                  value={form.max_download_count}
                  onChange={(e) => setForm((f) => ({ ...f, max_download_count: e.target.value }))}
                  disabled={!form.allow_downloads}
                  placeholder="Unlimited"
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-sm bg-white/5 text-white disabled:opacity-50"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={creating} disabled={galleries.length === 0}>Create Session</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showMoveModal} onClose={() => setShowMoveModal(false)} title="Move Selected To Folder" size="sm">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Target Folder</label>
            <select
              value={moveTargetParentId}
              onChange={(e) => setMoveTargetParentId(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-300/50"
            >
              <option value="">Root (no parent)</option>
              {sortedGalleries
                .filter((g) => !selectedGalleryIds.includes(g.id))
                .map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowMoveModal(false)}>Cancel</Button>
            <Button type="button" loading={moving} onClick={submitMoveSelected}>Move</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDownloadsModal} onClose={() => setShowDownloadsModal(false)} title={`Download History · ${downloadsSessionTitle}`}>
        {downloadsLoading ? (
          <div className="py-8 flex justify-center"><Spinner /></div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
              <p>Total downloads: <span className="font-semibold text-white">{downloadsMeta.total}</span></p>
              <p>
                Limit: <span className="font-semibold text-white">{downloadsMeta.max_download_count || 'Unlimited'}</span>
              </p>
              <p>
                Last: <span className="font-semibold text-white">{downloadsMeta.last_download_at ? formatDate(downloadsMeta.last_download_at) : 'No downloads yet'}</span>
              </p>
            </div>

            {downloadsList.length === 0 ? (
              <div className="py-4 text-sm text-slate-400">No download activity yet.</div>
            ) : (
              <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                {downloadsList.map((d) => (
                  <div key={d.id} className="rounded-lg border border-white/10 bg-[#0a0f19]/70 p-3 text-xs">
                    <p className="font-semibold text-white">{d.Photo?.title || d.file_name || 'File'}</p>
                    <p className="mt-1 text-slate-400">Mode: {d.mode}</p>
                    <p className="text-slate-400">At: {formatDate(d.created_at)}</p>
                    {d.ip_address && <p className="text-slate-500">IP: {d.ip_address}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}

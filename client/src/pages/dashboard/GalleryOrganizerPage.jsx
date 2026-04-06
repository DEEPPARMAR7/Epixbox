import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Spinner from '../../components/common/Spinner'
import { getGalleries, createGallery, deleteGallery, updateGallery } from '../../api/galleryApi'
import { createSession } from '../../api/proofingApi'

const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=70',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=70',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=70',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=70',
  'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=70',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=70',
  'https://images.unsplash.com/photo-1502657877623-f66bf489d236?w=400&q=70',
  'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=70',
]

const VISIBILITY_CONFIG = {
  public: { label: 'Public', color: 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-300/30', dot: 'bg-emerald-300' },
  private: { label: 'Private', color: 'bg-red-500/20 text-red-200 ring-1 ring-red-300/30', dot: 'bg-red-300' },
  unlisted: { label: 'Unlisted', color: 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-300/30', dot: 'bg-amber-300' },
}

const CREATE_TABS = [
  { id: 'basics', label: 'Basics' },
  { id: 'security', label: 'Security & Sharing' },
  { id: 'protection', label: 'Photo Protection' },
  { id: 'social', label: 'Social' },
  { id: 'selling', label: 'Selling' },
  { id: 'appearance', label: 'Appearance' },
]

const makeInitialForm = () => ({
  kind: 'gallery',
  title: '',
  description: '',
  visibility: 'private',
  parent_id: '',
  preset: 'smugmug_settings',
  meta_keywords: '',
  custom_url: '',
  security: {
    display_on_site: 'private',
    access: 'anyone',
    guest_uploading_key: '',
    web_searchable: 'site_searching',
    smugmug_searchable: 'site_searching',
  },
  protection: {
    watermark_mode: 'none',
    max_display_size: 'all_but_original',
    right_click_message: true,
    allow_free_downloads: false,
  },
  social: {
    show_sharing_options: true,
    allow_comments: true,
  },
  selling: {
    visitor_shopping_cart: true,
    price_list_id: 'inherit',
    shop_view: true,
    proof_delay: 'off',
    boutique_packaging: 'update_credit_card',
    personal_delivery: 'setup',
  },
  appearance: {
    gallery_style: 'collage_landscape',
    gallery_cover_image: true,
    sort_by: 'date_taken',
    sort_direction: 'ascending',
    show_keywords: false,
    show_filenames: false,
    slideshow: false,
    map_features: false,
  },
})

export default function GalleryOrganizerPage() {
  const navigate = useNavigate()
  const [galleries, setGalleries] = useState([])
  const [activeGalleryId, setActiveGalleryId] = useState('')
  const [draggedGalleryId, setDraggedGalleryId] = useState(null)
  const [visibilityFilter, setVisibilityFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('date_desc')
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const [activeCreateTab, setActiveCreateTab] = useState('basics')
  const [editingGalleryId, setEditingGalleryId] = useState('')
  const [form, setForm] = useState(makeInitialForm)
  const [creating, setCreating] = useState(false)
  const [reordering, setReordering] = useState(false)
  const [creatingLink, setCreatingLink] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const mapGalleryToForm = (gallery) => {
    const defaults = makeInitialForm()
    const settings = gallery?.settings || {}
    const basics = settings.basics || {}

    return {
      ...defaults,
      kind: basics.kind || 'gallery',
      title: gallery?.title || '',
      description: gallery?.description || '',
      visibility: gallery?.visibility || defaults.visibility,
      parent_id: gallery?.parent_id || '',
      preset: settings.preset || defaults.preset,
      meta_keywords: basics.meta_keywords || '',
      custom_url: basics.custom_url || '',
      security: { ...defaults.security, ...(settings.security_sharing || {}) },
      protection: { ...defaults.protection, ...(settings.photo_protection || {}) },
      social: { ...defaults.social, ...(settings.social || {}) },
      selling: { ...defaults.selling, ...(settings.selling || {}) },
      appearance: { ...defaults.appearance, ...(settings.appearance || {}) },
    }
  }

  const openCreateDialog = (kind = 'gallery', parentId = '') => {
    setShowCreateMenu(false)
    setEditingGalleryId('')
    setActiveCreateTab('basics')
    setForm({ ...makeInitialForm(), kind, parent_id: parentId || '' })
    setShowCreate(true)
  }

  const openEditDialog = (gallery) => {
    if (!gallery) return toast.error('Select a folder first')
    setShowCreateMenu(false)
    setEditingGalleryId(gallery.id)
    setActiveCreateTab('basics')
    setForm(mapGalleryToForm(gallery))
    setShowCreate(true)
  }

  const closeCreateDialog = () => {
    setShowCreate(false)
    setEditingGalleryId('')
    setActiveCreateTab('basics')
    setForm(makeInitialForm())
  }

  const fetchGalleries = () => {
    setLoading(true)
    getGalleries()
      .then((items) => {
        setGalleries(items)
        setActiveGalleryId((prev) => {
          if (prev && items.some((g) => g.id === prev)) return prev
          return items[0]?.id || ''
        })
      })
      .catch(() => toast.error('Failed to load galleries'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchGalleries() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title is required')
    setReordering(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description,
        visibility: form.visibility,
        parent_id: form.parent_id || null,
        settings: {
          preset: form.preset,
          basics: {
            kind: form.kind,
            meta_keywords: form.meta_keywords,
            custom_url: form.custom_url,
          },
          security_sharing: form.security,
          photo_protection: form.protection,
          social: form.social,
          selling: form.selling,
          appearance: form.appearance,
        },
      }

      if (editingGalleryId) {
        await updateGallery(editingGalleryId, payload)
        toast.success('Gallery settings updated!')
      } else {
        await createGallery(payload)
        toast.success(form.kind === 'folder' ? 'Folder created!' : 'Gallery created!')
      }

      closeCreateDialog()
      fetchGalleries()
    } catch (err) {
      toast.error(err.response?.data?.error || (editingGalleryId ? 'Failed to update gallery settings' : 'Failed to create gallery'))
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteGallery(deleteId)
      toast.success('Gallery deleted')
      setDeleteId(null)
      fetchGalleries()
    } catch {
      toast.error('Failed to delete gallery')
    } finally {
      setDeleting(false)
    }
  }

  const activeGallery = galleries.find((g) => g.id === activeGalleryId) || null

  const parentKey = (gallery) => gallery?.parent_id || 'root'

  const getSiblingsInOrder = (parentId) => galleries
    .filter((gallery) => parentKey(gallery) === parentId)
    .sort((a, b) => {
      const aOrder = Number(a.sort_order ?? 0)
      const bOrder = Number(b.sort_order ?? 0)
      if (aOrder !== bOrder) return aOrder - bOrder
      const aTime = new Date(a.created_at || 0).getTime()
      const bTime = new Date(b.created_at || 0).getTime()
      return aTime - bTime
    })

  const persistSiblingOrder = async (parentId, orderedGalleries) => {
    await Promise.all(orderedGalleries.map((gallery, index) => updateGallery(gallery.id, {
      title: gallery.title,
      description: gallery.description || '',
      visibility: gallery.visibility || 'public',
      parent_id: parentId === 'root' ? null : parentId,
      sort_order: index,
    })))
  }

  const handleDropMove = async (targetGalleryId, position) => {
    if (!draggedGalleryId || draggedGalleryId === targetGalleryId) return

    const draggedGallery = galleries.find((gallery) => gallery.id === draggedGalleryId)
    const targetGallery = galleries.find((gallery) => gallery.id === targetGalleryId)
    if (!draggedGallery || !targetGallery) return

    setCreating(true)
    try {
      const sourceParentId = parentKey(draggedGallery)
      const targetParentId = parentKey(targetGallery)

      if (position === 'inside') {
        const oldParentSiblings = getSiblingsInOrder(sourceParentId).filter((gallery) => gallery.id !== draggedGalleryId)
        const newParentSiblings = [...getSiblingsInOrder(targetGallery.id), draggedGallery]

        await persistSiblingOrder(sourceParentId, oldParentSiblings)
        await persistSiblingOrder(targetGallery.id, newParentSiblings)
      } else {
        const destinationParentId = targetParentId
        const sourceSiblings = getSiblingsInOrder(sourceParentId).filter((gallery) => gallery.id !== draggedGalleryId)
        const destinationSiblings = getSiblingsInOrder(destinationParentId).filter((gallery) => gallery.id !== draggedGalleryId)
        const insertAt = destinationSiblings.findIndex((gallery) => gallery.id === targetGalleryId)
        const nextOrder = [...destinationSiblings]
        nextOrder.splice(position === 'before' ? insertAt : insertAt + 1, 0, draggedGallery)

        await persistSiblingOrder(sourceParentId, sourceSiblings)
        await persistSiblingOrder(destinationParentId, nextOrder)
      }

      toast.success('Folder order updated')
      fetchGalleries()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reorder folders')
    } finally {
      setDraggedGalleryId(null)
      setReordering(false)
    }
  }

  const openUploadForFolder = () => {
    if (!activeGallery) return toast.error('Select a folder first')
    navigate(`/dashboard/galleries/${activeGallery.id}/upload`)
  }

  const createReviewLink = async () => {
    if (!activeGallery) return toast.error('Select a folder first')
    setCreatingLink(true)
    try {
      const session = await createSession({
        gallery_id: activeGallery.id,
        client_name: activeGallery.title,
        client_email: '',
        message: '',
        include_subfolders: true,
        allow_downloads: true,
        download_mode: 'original',
        max_download_count: '',
      })
      const link = `${window.location.origin}/proof/${session.share_token}`
      await navigator.clipboard.writeText(link)
      toast.success('Review link copied')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create review link')
    } finally {
      setCreatingLink(false)
    }
  }

  const INPUT = 'w-full px-3 py-2.5 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300/50 focus:border-transparent text-sm bg-white/5 text-white transition'
  const publicCount = galleries.filter(g => g.visibility === 'public').length
  const privateCount = galleries.filter(g => g.visibility === 'private').length
  const unlistedCount = galleries.filter(g => g.visibility === 'unlisted').length

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const visibilityFiltered = visibilityFilter === 'all'
    ? galleries
    : galleries.filter(g => g.visibility === visibilityFilter)
  const queriedGalleries = normalizedQuery
    ? visibilityFiltered.filter(g => {
      const haystack = `${g.title || ''} ${g.description || ''}`.toLowerCase()
      return haystack.includes(normalizedQuery)
    })
    : visibilityFiltered

  const filteredGalleries = [...queriedGalleries].sort((a, b) => {
    if (sortBy === 'title_asc') return (a.title || '').localeCompare(b.title || '')
    if (sortBy === 'title_desc') return (b.title || '').localeCompare(a.title || '')
    if (sortBy === 'photos_desc') return (b.photos_count || 0) - (a.photos_count || 0)

    const aTime = new Date(a.created_at || 0).getTime()
    const bTime = new Date(b.created_at || 0).getTime()
    if (sortBy === 'date_asc') return aTime - bTime
    return bTime - aTime
  })

  const totalPhotos = filteredGalleries.reduce((sum, gallery) => sum + (gallery.photos_count || 0), 0)
  const treeMap = filteredGalleries.reduce((acc, gallery) => {
    const parentKey = gallery.parent_id || 'root'
    if (!acc[parentKey]) acc[parentKey] = []
    acc[parentKey].push(gallery)
    return acc
  }, {})

  const renderFolderTree = (parentId = 'root', depth = 0) => {
    const nodes = treeMap[parentId] || []
    return nodes.map((gallery, index) => {
      const vis = VISIBILITY_CONFIG[gallery.visibility] || VISIBILITY_CONFIG.public
      const childCount = (treeMap[gallery.id] || []).length
      const isDragging = draggedGalleryId === gallery.id

      return (
        <div key={gallery.id} className="space-y-2">
          {sortBy === 'manual' && (
            <div
              onDragOver={(e) => {
                if (!draggedGalleryId || draggedGalleryId === gallery.id) return
                e.preventDefault()
              }}
              onDrop={(e) => {
                e.preventDefault()
                handleDropMove(gallery.id, 'before')
              }}
              className={`h-2 rounded-full transition ${draggedGalleryId ? 'bg-emerald-300/10' : 'bg-transparent'}`}
            />
          )}
          <div
            onClick={() => setActiveGalleryId(gallery.id)}
            draggable={sortBy === 'manual'}
            onDragStart={() => setDraggedGalleryId(gallery.id)}
            onDragEnd={() => setDraggedGalleryId(null)}
            onDragOver={(e) => {
              if (!draggedGalleryId || draggedGalleryId === gallery.id) return
              if (sortBy !== 'manual') return
              e.preventDefault()
            }}
            onDrop={(e) => {
              e.preventDefault()
              handleDropMove(gallery.id, 'inside')
            }}
            className={`group relative cursor-pointer overflow-hidden rounded-lg border bg-[#0b1020] transition hover:border-white/25 ${activeGalleryId === gallery.id ? 'border-emerald-300/50 ring-1 ring-emerald-300/30' : 'border-white/10'}`}
            style={{ marginLeft: `${depth * 18}px`, opacity: isDragging ? 0.45 : 1 }}
          >
            <div className="relative aspect-[4/3] bg-[#111827]">
              <img
                src={gallery.cover_url || COVER_IMAGES[index % COVER_IMAGES.length]}
                alt={gallery.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                onError={(e) => { e.target.src = COVER_IMAGES[index % COVER_IMAGES.length] }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

              <span className={`absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${vis.color}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${vis.dot}`} />
                {vis.label}
              </span>

              <div className="absolute right-1.5 top-1.5 rounded-full border border-white/15 bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white">
                {childCount} {childCount === 1 ? 'folder' : 'folders'}
              </div>

              {sortBy === 'manual' && draggedGalleryId && draggedGalleryId !== gallery.id && (
                <div className="absolute inset-x-0 bottom-0 bg-black/40 px-2 py-1 text-center text-[10px] font-semibold text-white/80">
                  Drop here to move inside
                </div>
              )}

              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/55 opacity-0 transition duration-200 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/dashboard/galleries/${gallery.id}/upload`)
                  }}
                  className="rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-gray-900 transition hover:bg-gray-100"
                >
                  Upload Files
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveGalleryId(gallery.id)
                    openEditDialog(gallery)
                  }}
                  className="rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-gray-900 transition hover:bg-gray-100"
                >
                  Settings
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveGalleryId(gallery.id)
                    openCreateDialog('folder', gallery.id)
                  }}
                  className="rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-gray-900 transition hover:bg-gray-100"
                >
                  New Folder
                </button>
              </div>
            </div>

            <div className="p-2.5">
              <h3 className="truncate text-xs font-semibold text-white">{gallery.title}</h3>
              <div className="mt-0.5 flex items-center justify-between gap-2">
                <p className="text-[10px] text-slate-400">{gallery.photos_count || 0} files</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteId(gallery.id)
                  }}
                  className="text-[10px] font-semibold text-red-400 transition hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          {sortBy === 'manual' && (
            <div
              onDragOver={(e) => {
                if (!draggedGalleryId || draggedGalleryId === gallery.id) return
                e.preventDefault()
              }}
              onDrop={(e) => {
                e.preventDefault()
                handleDropMove(gallery.id, 'after')
              }}
              className={`h-2 rounded-full transition ${draggedGalleryId ? 'bg-emerald-300/10' : 'bg-transparent'}`}
            />
          )}

          {renderFolderTree(gallery.id, depth + 1)}
        </div>
      )
    })
  }

  return (
    <DashboardLayout>
      <div className="grid gap-4 lg:grid-cols-[220px,minmax(0,1fr)]">
        <aside className="rounded-xl border border-white/10 bg-[#0a1020]/80 p-3">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">AI Media</p>
          <div className="space-y-0.5">
            <button
              onClick={() => setVisibilityFilter('all')}
              className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm transition ${visibilityFilter === 'all' ? 'bg-emerald-300/10 text-emerald-200' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
            >
              <span>All Galleries</span>
              <span className="text-xs text-slate-500">{galleries.length}</span>
            </button>
            <button
              onClick={() => setVisibilityFilter('public')}
              className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm transition ${visibilityFilter === 'public' ? 'bg-emerald-300/10 text-emerald-200' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
            >
              <span>Public</span>
              <span className="text-xs text-slate-500">{publicCount}</span>
            </button>
            <button
              onClick={() => setVisibilityFilter('unlisted')}
              className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm transition ${visibilityFilter === 'unlisted' ? 'bg-emerald-300/10 text-emerald-200' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
            >
              <span>By Date</span>
              <span className="text-xs text-slate-500">{unlistedCount}</span>
            </button>
            <button
              onClick={() => setVisibilityFilter('private')}
              className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm transition ${visibilityFilter === 'private' ? 'bg-emerald-300/10 text-emerald-200' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
            >
              <span>Trash</span>
              <span className="text-xs text-slate-500">{privateCount}</span>
            </button>
          </div>

          <div className="mt-4 border-t border-white/10 pt-3">
            <div className="relative">
              <button
                onClick={() => setShowCreateMenu((v) => !v)}
                className="w-full rounded-md border border-white/20 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
              >
                + Create
              </button>
              {showCreateMenu && (
                <div className="absolute left-0 top-full z-20 mt-2 w-full rounded-lg border border-white/15 bg-[#0b1220] p-1.5 shadow-xl">
                  <button onClick={() => openCreateDialog('gallery')} className="block w-full rounded-md px-2 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-white/10">Gallery</button>
                  <button onClick={() => openCreateDialog('folder', activeGallery?.id || '')} className="block w-full rounded-md px-2 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-white/10">Folder</button>
                  <button onClick={() => { setShowCreateMenu(false); toast('Web Page creation is coming soon') }} className="block w-full rounded-md px-2 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-white/10">Web Page</button>
                </div>
              )}
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-4 rounded-xl border border-white/10 bg-[#0a1020]/80 p-4">
            <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-white">All Media</h1>
                <p className="mt-1 text-sm text-slate-400">{filteredGalleries.length} items · {totalPhotos} photos</p>
              </div>

              <div className="relative w-full lg:w-[280px]">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search all media"
                  className="w-full rounded-full border border-white/15 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-300/40"
                />
              </div>
            </div>

            <div className="mb-2 flex flex-wrap items-center gap-2">
              <button className="rounded-md border border-white/20 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10">Media Type</button>
              <button className="rounded-md border border-white/20 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10">Date</button>
              <button
                onClick={() => openCreateDialog('folder')}
                className="rounded-md border border-white/20 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
              >
                + Folder
              </button>
              <button
                onClick={fetchGalleries}
                className="rounded-md border border-white/20 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
              >
                Refresh
              </button>
              {reordering && (
                <span className="rounded-md border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-200">
                  Reordering...
                </span>
              )}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="ml-auto rounded-md border border-white/15 bg-black/30 px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-300/40"
              >
                <option value="date_desc">Sort: Newest</option>
                <option value="date_asc">Sort: Oldest</option>
                <option value="title_asc">Sort: Title A-Z</option>
                <option value="title_desc">Sort: Title Z-A</option>
                <option value="photos_desc">Sort: Most Photos</option>
              </select>
            </div>

            <div className="grid gap-3 md:grid-cols-[1.5fr,1fr]">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Selected Folder</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-white">{activeGallery?.title || 'None selected'}</h2>
                    <p className="text-sm text-slate-400">
                      {activeGallery ? `${activeGallery.photos_count || 0} files inside this folder` : 'Click a folder card below to manage it'}
                    </p>
                  </div>
                  {activeGallery && (
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${VISIBILITY_CONFIG[activeGallery.visibility]?.color || VISIBILITY_CONFIG.public.color}`}>
                      {VISIBILITY_CONFIG[activeGallery.visibility]?.label || 'Public'}
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Folder Actions</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      openCreateDialog('folder', activeGallery?.id || '')
                    }}
                    className="rounded-md border border-white/20 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
                  >
                    Create Subfolder
                  </button>
                  <button
                    onClick={openUploadForFolder}
                    className="rounded-md border border-white/20 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
                  >
                    Upload Files
                  </button>
                  <button
                    onClick={() => openEditDialog(activeGallery)}
                    disabled={!activeGallery}
                    className="rounded-md border border-white/20 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10 disabled:opacity-50"
                  >
                    Edit Settings
                  </button>
                  <button
                    onClick={createReviewLink}
                    disabled={!activeGallery || creatingLink}
                    className="rounded-md border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-300/20 disabled:opacity-50"
                  >
                    {creatingLink ? 'Creating Link...' : 'Share Review Link'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Spinner /></div>
          ) : galleries.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-white/20 bg-white/5 py-24 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-300/10 text-3xl">🖼️</div>
              <h3 className="mb-2 text-lg font-bold text-white">No galleries yet</h3>
              <p className="mb-6 text-sm text-slate-400">Create your first gallery to organize your photos.</p>
              <button
                onClick={() => openCreateDialog('gallery')}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-[#06210f] transition hover:bg-emerald-200"
              >
                + Create Gallery
              </button>
            </div>
          ) : filteredGalleries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 py-16 text-center">
              <p className="text-base font-semibold text-white">No folders in this view</p>
              <p className="mt-2 text-sm text-slate-400">Try a different filter or search query.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {renderFolderTree('root', 0)}
            </div>
          )}
        </section>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={closeCreateDialog} />
          <form onSubmit={handleCreate} className="relative z-10 w-full max-w-5xl overflow-hidden rounded-sm border border-white/30 bg-[#10141d] text-white shadow-[0_40px_100px_rgba(0,0,0,0.65)]">
            <div className="border-b border-white/15 px-6 py-4 text-center">
              <h2 className="text-4xl font-black tracking-tight">{editingGalleryId ? 'Edit Gallery Settings' : `Create ${form.kind === 'folder' ? 'Folder' : 'Gallery'}`}</h2>
            </div>

            <div className="grid min-h-[520px] grid-cols-[240px,minmax(0,1fr)]">
              <aside className="border-r border-white/15 bg-[#161b25] p-0">
                {CREATE_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCreateTab(tab.id)}
                    className={`block w-full border-l-4 px-5 py-4 text-left text-2xl font-semibold transition ${activeCreateTab === tab.id ? 'border-emerald-300 bg-[#232a36] text-white' : 'border-transparent text-slate-300 hover:bg-white/5 hover:text-white'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </aside>

              <section className="bg-[#151b25] p-8">
                {activeCreateTab === 'basics' && (
                  <div className="space-y-5">
                    <label className="block text-sm font-semibold text-slate-300">Gallery Preset</label>
                    <select value={form.preset} onChange={(e) => setForm((f) => ({ ...f, preset: e.target.value }))} className="w-full border-b border-white/25 bg-transparent px-1 py-2 text-lg outline-none focus:border-emerald-300">
                      <option value="smugmug_settings">SmugMug Settings</option>
                      <option value="portfolio_clean">Portfolio Clean</option>
                      <option value="proofing_fast">Proofing Fast</option>
                    </select>

                    <label className="block text-sm font-semibold text-slate-300">Title</label>
                    <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full border-b border-white/25 bg-transparent px-1 py-2 text-lg outline-none focus:border-emerald-300" required />

                    <label className="block text-sm font-semibold text-slate-300">Description</label>
                    <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="w-full border-b border-white/25 bg-transparent px-1 py-2 text-base outline-none focus:border-emerald-300" />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-semibold text-slate-300">Meta Keywords</label>
                        <input value={form.meta_keywords} onChange={(e) => setForm((f) => ({ ...f, meta_keywords: e.target.value }))} placeholder="keyword1, keyword2" className="w-full border-b border-white/25 bg-transparent px-1 py-2 text-base outline-none focus:border-emerald-300" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-300">Custom URL</label>
                        <input value={form.custom_url} onChange={(e) => setForm((f) => ({ ...f, custom_url: e.target.value }))} placeholder="my-gallery-url" className="w-full border-b border-white/25 bg-transparent px-1 py-2 text-base outline-none focus:border-emerald-300" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-300">Parent Folder</label>
                      <select value={form.parent_id} onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))} className="w-full border-b border-white/25 bg-transparent px-1 py-2 text-base outline-none focus:border-emerald-300">
                        <option value="">Root folder</option>
                        {galleries.map((gallery) => (
                          <option key={gallery.id} value={gallery.id}>{gallery.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {activeCreateTab === 'security' && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300">Display on Site</label>
                      <select value={form.security.display_on_site} onChange={(e) => setForm((f) => ({ ...f, security: { ...f.security, display_on_site: e.target.value }, visibility: e.target.value === 'public' ? 'public' : e.target.value === 'unlisted' ? 'unlisted' : 'private' }))} className="w-full border-b border-white/25 bg-transparent px-1 py-2 text-base outline-none focus:border-emerald-300">
                        <option value="private">Display on Site (Private)</option>
                        <option value="public">Display on Site (Public)</option>
                        <option value="unlisted">Display on Site (Unlisted)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300">Access</label>
                      <select value={form.security.access} onChange={(e) => setForm((f) => ({ ...f, security: { ...f.security, access: e.target.value } }))} className="w-full border-b border-white/25 bg-transparent px-1 py-2 text-base outline-none focus:border-emerald-300">
                        <option value="anyone">Anyone</option>
                        <option value="password">Password Required</option>
                        <option value="invite_only">Invite Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300">Guest Uploading Key</label>
                      <input value={form.security.guest_uploading_key} onChange={(e) => setForm((f) => ({ ...f, security: { ...f.security, guest_uploading_key: e.target.value } }))} placeholder="Type a key to generate upload URL" className="w-full border-b border-white/25 bg-transparent px-1 py-2 text-base outline-none focus:border-emerald-300" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-semibold text-slate-300">Web Searchable</label>
                        <select value={form.security.web_searchable} onChange={(e) => setForm((f) => ({ ...f, security: { ...f.security, web_searchable: e.target.value } }))} className="w-full border-b border-white/25 bg-transparent px-1 py-2 text-base outline-none focus:border-emerald-300">
                          <option value="site_searching">Site-Searching</option>
                          <option value="public_search">Public Search</option>
                          <option value="off">Off</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-300">SmugMug Searchable</label>
                        <select value={form.security.smugmug_searchable} onChange={(e) => setForm((f) => ({ ...f, security: { ...f.security, smugmug_searchable: e.target.value } }))} className="w-full border-b border-white/25 bg-transparent px-1 py-2 text-base outline-none focus:border-emerald-300">
                          <option value="site_searching">Site-Searching</option>
                          <option value="public_search">Public Search</option>
                          <option value="off">Off</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeCreateTab === 'protection' && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300">Watermark Photos</label>
                      <select value={form.protection.watermark_mode} onChange={(e) => setForm((f) => ({ ...f, protection: { ...f.protection, watermark_mode: e.target.value } }))} className="w-full border-b border-white/25 bg-transparent px-1 py-2 text-base outline-none focus:border-emerald-300">
                        <option value="none">No Watermarks</option>
                        <option value="light">Light Watermark</option>
                        <option value="strong">Strong Watermark</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300">Maximum Display Size</label>
                      <select value={form.protection.max_display_size} onChange={(e) => setForm((f) => ({ ...f, protection: { ...f.protection, max_display_size: e.target.value } }))} className="w-full border-b border-white/25 bg-transparent px-1 py-2 text-base outline-none focus:border-emerald-300">
                        <option value="all_but_original">All but Original</option>
                        <option value="large">Large</option>
                        <option value="medium">Medium</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between border-b border-white/20 py-2 text-base font-semibold text-slate-200">
                        <span>Right-Click Message</span>
                        <button type="button" onClick={() => setForm((f) => ({ ...f, protection: { ...f.protection, right_click_message: !f.protection.right_click_message } }))} className={`rounded-full px-3 py-1 text-xs font-bold ${form.protection.right_click_message ? 'bg-emerald-300/20 text-emerald-200' : 'bg-white/10 text-slate-300'}`}>{form.protection.right_click_message ? 'ON' : 'OFF'}</button>
                      </label>
                      <label className="flex items-center justify-between border-b border-white/20 py-2 text-base font-semibold text-slate-200">
                        <span>Allow Free Downloads</span>
                        <button type="button" onClick={() => setForm((f) => ({ ...f, protection: { ...f.protection, allow_free_downloads: !f.protection.allow_free_downloads } }))} className={`rounded-full px-3 py-1 text-xs font-bold ${form.protection.allow_free_downloads ? 'bg-emerald-300/20 text-emerald-200' : 'bg-white/10 text-slate-300'}`}>{form.protection.allow_free_downloads ? 'ON' : 'OFF'}</button>
                      </label>
                    </div>
                  </div>
                )}

                {activeCreateTab === 'social' && (
                  <div className="space-y-4">
                    <label className="flex items-center justify-between border-b border-white/20 py-2 text-base font-semibold text-slate-200">
                      <span>Show Sharing Options</span>
                      <button type="button" onClick={() => setForm((f) => ({ ...f, social: { ...f.social, show_sharing_options: !f.social.show_sharing_options } }))} className={`rounded-full px-3 py-1 text-xs font-bold ${form.social.show_sharing_options ? 'bg-emerald-300/20 text-emerald-200' : 'bg-white/10 text-slate-300'}`}>{form.social.show_sharing_options ? 'ON' : 'OFF'}</button>
                    </label>
                    <label className="flex items-center justify-between border-b border-white/20 py-2 text-base font-semibold text-slate-200">
                      <span>Allow Comments</span>
                      <button type="button" onClick={() => setForm((f) => ({ ...f, social: { ...f.social, allow_comments: !f.social.allow_comments } }))} className={`rounded-full px-3 py-1 text-xs font-bold ${form.social.allow_comments ? 'bg-emerald-300/20 text-emerald-200' : 'bg-white/10 text-slate-300'}`}>{form.social.allow_comments ? 'ON' : 'OFF'}</button>
                    </label>
                  </div>
                )}

                {activeCreateTab === 'selling' && (
                  <div className="space-y-5">
                    <label className="flex items-center justify-between border-b border-white/20 py-2 text-base font-semibold text-slate-200">
                      <span>Visitor Shopping Cart</span>
                      <button type="button" onClick={() => setForm((f) => ({ ...f, selling: { ...f.selling, visitor_shopping_cart: !f.selling.visitor_shopping_cart } }))} className={`rounded-full px-3 py-1 text-xs font-bold ${form.selling.visitor_shopping_cart ? 'bg-emerald-300/20 text-emerald-200' : 'bg-white/10 text-slate-300'}`}>{form.selling.visitor_shopping_cart ? 'ON' : 'OFF'}</button>
                    </label>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300">Price List</label>
                      <select value={form.selling.price_list_id} onChange={(e) => setForm((f) => ({ ...f, selling: { ...f.selling, price_list_id: e.target.value } }))} className="w-full border-b border-white/25 bg-transparent px-1 py-2 text-base outline-none focus:border-emerald-300">
                        <option value="inherit">Inherit from site</option>
                        <option value="none">No price list</option>
                      </select>
                    </div>
                    <label className="flex items-center justify-between border-b border-white/20 py-2 text-base font-semibold text-slate-200">
                      <span>Shop View</span>
                      <button type="button" onClick={() => setForm((f) => ({ ...f, selling: { ...f.selling, shop_view: !f.selling.shop_view } }))} className={`rounded-full px-3 py-1 text-xs font-bold ${form.selling.shop_view ? 'bg-emerald-300/20 text-emerald-200' : 'bg-white/10 text-slate-300'}`}>{form.selling.shop_view ? 'ON' : 'OFF'}</button>
                    </label>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300">Proof Delay</label>
                      <select value={form.selling.proof_delay} onChange={(e) => setForm((f) => ({ ...f, selling: { ...f.selling, proof_delay: e.target.value } }))} className="w-full border-b border-white/25 bg-transparent px-1 py-2 text-base outline-none focus:border-emerald-300">
                        <option value="off">Off</option>
                        <option value="15m">15 Minutes</option>
                        <option value="1h">1 Hour</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeCreateTab === 'appearance' && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300">Gallery Style</label>
                      <select value={form.appearance.gallery_style} onChange={(e) => setForm((f) => ({ ...f, appearance: { ...f.appearance, gallery_style: e.target.value } }))} className="w-full border-b border-white/25 bg-transparent px-1 py-2 text-base outline-none focus:border-emerald-300">
                        <option value="collage_landscape">Collage Landscape</option>
                        <option value="collage_portrait">Collage Portrait</option>
                        <option value="grid">Grid</option>
                      </select>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-semibold text-slate-300">Sort By</label>
                        <select value={form.appearance.sort_by} onChange={(e) => setForm((f) => ({ ...f, appearance: { ...f.appearance, sort_by: e.target.value } }))} className="w-full border-b border-white/25 bg-transparent px-1 py-2 text-base outline-none focus:border-emerald-300">
                          <option value="date_taken">Date Taken</option>
                          <option value="date_uploaded">Date Uploaded</option>
                          <option value="filename">Filename</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-300">Sort Direction</label>
                        <select value={form.appearance.sort_direction} onChange={(e) => setForm((f) => ({ ...f, appearance: { ...f.appearance, sort_direction: e.target.value } }))} className="w-full border-b border-white/25 bg-transparent px-1 py-2 text-base outline-none focus:border-emerald-300">
                          <option value="ascending">Ascending</option>
                          <option value="descending">Descending</option>
                        </select>
                      </div>
                    </div>
                    {[
                      ['gallery_cover_image', 'Gallery Cover Image'],
                      ['show_keywords', 'Show Keywords'],
                      ['show_filenames', 'Show Filenames'],
                      ['slideshow', 'Slideshow'],
                      ['map_features', 'Enable Map Features'],
                    ].map(([key, label]) => (
                      <label key={key} className="flex items-center justify-between border-b border-white/20 py-2 text-base font-semibold text-slate-200">
                        <span>{label}</span>
                        <button type="button" onClick={() => setForm((f) => ({ ...f, appearance: { ...f.appearance, [key]: !f.appearance[key] } }))} className={`rounded-full px-3 py-1 text-xs font-bold ${form.appearance[key] ? 'bg-emerald-300/20 text-emerald-200' : 'bg-white/10 text-slate-300'}`}>{form.appearance[key] ? 'ON' : 'OFF'}</button>
                      </label>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="grid grid-cols-2 border-t border-white/15">
              <button type="button" onClick={closeCreateDialog} className="px-6 py-4 text-center text-xl font-bold text-white transition hover:bg-white/5">CANCEL</button>
              <button type="submit" disabled={creating || !form.title.trim()} className="bg-[#d5fce8] px-6 py-4 text-center text-xl font-bold tracking-[0.12em] text-[#0d2c1e] transition hover:bg-[#b5f1d2] disabled:cursor-not-allowed disabled:opacity-60">{creating ? (editingGalleryId ? 'SAVING...' : 'CREATING...') : (editingGalleryId ? 'SAVE' : 'CREATE')}</button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Gallery" size="sm">
        <p className="text-sm text-slate-300 mb-6">
          This will permanently delete the gallery and all its photos. This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete Gallery</Button>
        </div>
      </Modal>
    </DashboardLayout>
  )
}

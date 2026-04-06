import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Spinner from '../../components/common/Spinner'
import { getGalleries, createGallery, deleteGallery, updateGallery } from '../../api/galleryApi'
import { getPhotos, bulkMove } from '../../api/photoApi'
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
  preset: 'epicbox_default',
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
  const location = useLocation()
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
  const [selectedGalleryIds, setSelectedGalleryIds] = useState([])
  const [mediaItems, setMediaItems] = useState([])
  const [mediaLoading, setMediaLoading] = useState(false)
  const [mediaFilter, setMediaFilter] = useState('all')
  const [mediaSort, setMediaSort] = useState('date_desc')
  const [libraryDateRange, setLibraryDateRange] = useState('all')
  const [librarySection, setLibrarySection] = useState('all_media')
  const [lightboxMediaId, setLightboxMediaId] = useState(null)
  const [lightboxZoom, setLightboxZoom] = useState(1)
  const [selectedMediaIds, setSelectedMediaIds] = useState([])
  const [moveTargetGalleryId, setMoveTargetGalleryId] = useState('')
  const [movingMedia, setMovingMedia] = useState(false)
  const [creating, setCreating] = useState(false)
  const [reordering, setReordering] = useState(false)
  const [creatingLink, setCreatingLink] = useState(false)
  const [lastReviewLink, setLastReviewLink] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const isLibraryMode = location.pathname.startsWith('/dashboard/galleries')

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
        setSelectedGalleryIds((prev) => prev.filter((id) => items.some((g) => g.id === id)))
      })
      .catch(() => toast.error('Failed to load galleries'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchGalleries() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title is required')
    setCreating(true)
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

    setReordering(true)
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

  const fetchMedia = async (galleryId, allMedia = false) => {
    if (!allMedia && !galleryId) {
      setMediaItems([])
      return
    }
    setMediaLoading(true)
    try {
      const items = await getPhotos(allMedia ? { limit: 400 } : { galleryId, limit: 200 })
      setMediaItems(items || [])
    } catch {
      toast.error('Failed to load media')
      setMediaItems([])
    } finally {
      setMediaLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia(activeGalleryId, isLibraryMode)
  }, [activeGalleryId, isLibraryMode])

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
      setLastReviewLink(link)
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
  const selectedCount = selectedGalleryIds.length
  const filteredMedia = mediaItems.filter((item) => {
    if (librarySection === 'recent') {
      const ageMs = Date.now() - new Date(item.created_at || Date.now()).getTime()
      if (ageMs > 1000 * 60 * 60 * 24 * 14) return false
    }
    if (librarySection === 'trash') return false

    if (libraryDateRange !== 'all') {
      const createdAt = new Date(item.created_at || Date.now()).getTime()
      const now = Date.now()
      if (libraryDateRange === 'today') {
        const start = new Date()
        start.setHours(0, 0, 0, 0)
        if (createdAt < start.getTime()) return false
      }
      if (libraryDateRange === '7d' && now - createdAt > 1000 * 60 * 60 * 24 * 7) return false
      if (libraryDateRange === '30d' && now - createdAt > 1000 * 60 * 60 * 24 * 30) return false
    }

    const q = searchQuery.trim().toLowerCase()
    if (q) {
      const hay = `${item.title || ''} ${item.filename_original || ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }

    if (mediaFilter === 'photos') return (item.mime_type || '').startsWith('image/')
    if (mediaFilter === 'videos') return (item.mime_type || '').startsWith('video/')
    return true
  })

  const sortedMedia = [...filteredMedia].sort((a, b) => {
    if (mediaSort === 'name_asc') return (a.filename_original || '').localeCompare(b.filename_original || '')
    if (mediaSort === 'name_desc') return (b.filename_original || '').localeCompare(a.filename_original || '')
    const aTime = new Date(a.created_at || 0).getTime()
    const bTime = new Date(b.created_at || 0).getTime()
    return mediaSort === 'date_asc' ? aTime - bTime : bTime - aTime
  })

  const mediaGroups = sortedMedia.reduce((acc, item) => {
    const label = new Date(item.created_at || Date.now()).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
    if (!acc[label]) acc[label] = []
    acc[label].push(item)
    return acc
  }, {})

  const lightboxIndex = sortedMedia.findIndex((item) => item.id === lightboxMediaId)
  const lightboxMedia = lightboxIndex >= 0 ? sortedMedia[lightboxIndex] : null

  const getMediaSource = (item) => item?.display_url || item?.thumb_url || item?.medium_url || item?.large_url || item?.original_url

  const openLightbox = (id) => {
    setLightboxMediaId(id)
    setLightboxZoom(1)
  }
  const closeLightbox = () => {
    setLightboxMediaId(null)
    setLightboxZoom(1)
  }
  const showPrevMedia = () => {
    if (!sortedMedia.length || lightboxIndex < 0) return
    const prevIndex = lightboxIndex <= 0 ? sortedMedia.length - 1 : lightboxIndex - 1
    setLightboxMediaId(sortedMedia[prevIndex].id)
    setLightboxZoom(1)
  }
  const showNextMedia = () => {
    if (!sortedMedia.length || lightboxIndex < 0) return
    const nextIndex = lightboxIndex >= sortedMedia.length - 1 ? 0 : lightboxIndex + 1
    setLightboxMediaId(sortedMedia[nextIndex].id)
    setLightboxZoom(1)
  }

  const handleZoomIn = () => setLightboxZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))))
  const handleZoomOut = () => setLightboxZoom((z) => Math.max(1, Number((z - 0.25).toFixed(2))))
  const handleZoomReset = () => setLightboxZoom(1)

  const toggleMediaSelection = (id) => {
    setSelectedMediaIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
  }

  const downloadMedia = (item) => {
    const source = getMediaSource(item)
    if (!source) return toast.error('No media URL available for download')

    const a = document.createElement('a')
    a.href = source
    a.target = '_blank'
    a.rel = 'noreferrer'
    a.download = item.filename_original || item.title || 'media'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const moveLightboxMedia = async () => {
    if (!lightboxMedia?.id) return
    if (!moveTargetGalleryId) return toast.error('Select a destination folder')

    setMovingMedia(true)
    try {
      await bulkMove([lightboxMedia.id], moveTargetGalleryId)
      toast.success('Media moved')
      fetchMedia(activeGalleryId, isLibraryMode)
      fetchGalleries()
      closeLightbox()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to move media')
    } finally {
      setMovingMedia(false)
    }
  }

  useEffect(() => {
    if (!lightboxMediaId) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') showPrevMedia()
      if (e.key === 'ArrowRight') showNextMedia()
      if (e.key === '+' || e.key === '=') handleZoomIn()
      if (e.key === '-') handleZoomOut()
      if (e.key === '0') handleZoomReset()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lightboxMediaId, lightboxIndex, sortedMedia])

  useEffect(() => {
    if (!lightboxMedia) return
    setMoveTargetGalleryId(lightboxMedia.gallery_id || activeGalleryId || '')
  }, [lightboxMediaId, lightboxMedia, activeGalleryId])

  useEffect(() => {
    if (!lightboxMediaId) return
    const thumb = document.querySelector(`[data-lightbox-thumb="${lightboxMediaId}"]`)
    if (thumb?.scrollIntoView) {
      thumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [lightboxMediaId])

  const handleSelectAll = () => {
    const ids = filteredGalleries.map((g) => g.id)
    setSelectedGalleryIds((prev) => (prev.length === ids.length ? [] : ids))
  }

  const renderSidebarTree = (parentId = 'root', depth = 0) => {
    const nodes = treeMap[parentId] || []
    return nodes.map((gallery) => (
      <div key={`tree-${gallery.id}`}>
        <button
          type="button"
          onClick={() => setActiveGalleryId(gallery.id)}
          className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition ${activeGalleryId === gallery.id ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
          style={{ paddingLeft: `${8 + depth * 14}px` }}
        >
          <span className="text-xs">▸</span>
          <span className="truncate">{gallery.title}</span>
        </button>
        {renderSidebarTree(gallery.id, depth + 1)}
      </div>
    ))
  }

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
            className={`group relative w-full cursor-pointer overflow-hidden rounded-xl border bg-[#0b1020] transition hover:-translate-y-0.5 hover:border-white/25 ${activeGalleryId === gallery.id ? 'border-emerald-300/50 ring-1 ring-emerald-300/30' : 'border-white/10'}`}
            style={{ opacity: isDragging ? 0.45 : 1 }}
          >
            <div className="relative aspect-[4/5] bg-[#111827]">
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
                  className="rounded-md bg-white px-2 py-1 text-[9px] font-semibold text-gray-900 transition hover:bg-gray-100"
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
                  className="rounded-md bg-white px-2 py-1 text-[9px] font-semibold text-gray-900 transition hover:bg-gray-100"
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
                  className="rounded-md bg-white px-2 py-1 text-[9px] font-semibold text-gray-900 transition hover:bg-gray-100"
                >
                  New Folder
                </button>
              </div>
            </div>

            <div className="p-3">
              {depth > 0 && (
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-300/80">Subfolder</p>
              )}
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

          {(treeMap[gallery.id] || []).length > 0 && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {renderFolderTree(gallery.id, depth + 1)}
            </div>
          )}
        </div>
      )
    })
  }

  return (
    <DashboardLayout>
      {isLibraryMode ? (
        <section className="rounded-xl border border-white/10 bg-[#090e18]">
          <div className="grid min-h-[640px] grid-cols-1 lg:grid-cols-[220px,minmax(0,1fr)]">
            <aside className="border-b border-white/10 p-4 lg:border-b-0 lg:border-r lg:p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">EpicBox Media</p>
              <div className="space-y-1 text-sm">
                <button onClick={() => setLibrarySection('all_media')} className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left ${librarySection === 'all_media' ? 'bg-white/10 font-semibold text-white' : 'text-slate-300 hover:bg-white/5'}`}>◉ All Media</button>
                <button onClick={() => setLibrarySection('recent')} className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left ${librarySection === 'recent' ? 'bg-white/10 font-semibold text-white' : 'text-slate-300 hover:bg-white/5'}`}>◉ Recently Added</button>
                <button onClick={() => setLibrarySection('by_date')} className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left ${librarySection === 'by_date' ? 'bg-white/10 font-semibold text-white' : 'text-slate-300 hover:bg-white/5'}`}>▸ By Date</button>
                <button onClick={() => setLibrarySection('trash')} className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left ${librarySection === 'trash' ? 'bg-white/10 font-semibold text-white' : 'text-slate-300 hover:bg-white/5'}`}>◉ Trash</button>
              </div>
            </aside>

            <section className="p-4">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-5xl font-black tracking-tight text-white">All Media</h1>
                  <p className="mt-1 text-sm font-semibold text-slate-400">{sortedMedia.length.toLocaleString()} items</p>
                </div>
                <div className="w-full max-w-sm">
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search all media"
                    className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                <select value={mediaFilter} onChange={(e) => setMediaFilter(e.target.value)} className="rounded-sm border border-white/20 bg-black/40 px-3 py-2 text-xs font-semibold text-slate-200">
                  <option value="all">Media Type: All</option>
                  <option value="photos">Media Type: Photos</option>
                  <option value="videos">Media Type: Videos</option>
                </select>
                <select value={libraryDateRange} onChange={(e) => setLibraryDateRange(e.target.value)} className="rounded-sm border border-white/20 bg-black/40 px-3 py-2 text-xs font-semibold text-slate-200">
                  <option value="all">Date: All</option>
                  <option value="today">Date: Today</option>
                  <option value="7d">Date: Last 7 Days</option>
                  <option value="30d">Date: Last 30 Days</option>
                </select>
                <select value={mediaSort} onChange={(e) => setMediaSort(e.target.value)} className="ml-auto rounded-sm border border-white/20 bg-black/40 px-3 py-2 text-xs font-semibold text-slate-200">
                  <option value="date_desc">Sort</option>
                  <option value="date_desc">Newest</option>
                  <option value="date_asc">Oldest</option>
                  <option value="name_asc">Name A-Z</option>
                  <option value="name_desc">Name Z-A</option>
                </select>
              </div>

              {mediaLoading ? (
                <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={`lib-skeleton-${i}`} className="overflow-hidden rounded-sm border border-white/10 bg-[#0d1422]">
                      <div className="aspect-square animate-pulse bg-white/10" />
                    </div>
                  ))}
                </div>
              ) : sortedMedia.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-10 text-center text-slate-400">No media found in your library.</div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(mediaGroups).map(([label, items]) => (
                    <div key={label}>
                      <h3 className="mb-3 text-4xl font-black tracking-tight text-white">{label}</h3>
                      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                        {items.map((item) => {
                          const isVideo = (item.mime_type || '').startsWith('video/')
                          const thumb = item.display_url || item.thumb_url || item.medium_url || item.large_url || item.original_url
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => openLightbox(item.id)}
                              className="group relative overflow-hidden rounded-sm border border-white/10 bg-[#0d1422] text-left hover:border-white/25"
                            >
                              <div className="relative aspect-square bg-black/35">
                                {thumb ? (
                                  <img src={thumb} alt={item.title || item.filename_original || 'Media'} className="h-full w-full object-cover transition group-hover:scale-105" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-xl text-slate-400">{isVideo ? '🎬' : '🖼️'}</div>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>
      ) : (
      <section className="rounded-xl border border-white/10 bg-[#0a0f1a]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Organize</h1>
            <p className="text-sm text-slate-400">Site Homepage</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={createReviewLink} disabled={!activeGallery || creatingLink} className="rounded-sm border border-white/25 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-50">{creatingLink ? 'CREATING...' : 'SHARE'}</button>
            <button onClick={() => navigate('/dashboard/settings')} className="rounded-sm border border-white/25 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10">VIEW ON SITE</button>
            <button onClick={() => openEditDialog(activeGallery)} disabled={!activeGallery} className="rounded-sm border border-white/25 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-50">SETTINGS</button>
          </div>
        </div>

        {lastReviewLink && (
          <div className="flex flex-wrap items-center gap-2 border-b border-emerald-300/20 bg-emerald-300/10 px-4 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">Client Link</span>
            <a
              href={lastReviewLink}
              target="_blank"
              rel="noreferrer"
              className="max-w-[560px] truncate text-sm text-emerald-100 underline underline-offset-2"
              title={lastReviewLink}
            >
              {lastReviewLink}
            </a>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(lastReviewLink).then(() => toast.success('Link copied'))}
              className="rounded-sm border border-emerald-200/40 px-2.5 py-1 text-xs font-semibold text-emerald-100 hover:bg-emerald-200/20"
            >
              Copy
            </button>
            <button
              type="button"
              onClick={() => window.open(lastReviewLink, '_blank', 'noopener,noreferrer')}
              className="rounded-sm border border-emerald-200/40 px-2.5 py-1 text-xs font-semibold text-emerald-100 hover:bg-emerald-200/20"
            >
              Open
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-4 py-3">
          <div className="relative">
            <button onClick={() => setShowCreateMenu((v) => !v)} className="rounded-sm border border-white/25 px-3 py-2 text-xs font-bold text-white hover:bg-white/10">+ CREATE</button>
            {showCreateMenu && (
              <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-sm border border-white/15 bg-[#0b1220] p-1.5 shadow-xl">
                <button onClick={() => openCreateDialog('gallery')} className="block w-full rounded-md px-2 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-white/10">Gallery</button>
                <button onClick={() => openCreateDialog('folder', activeGallery?.id || '')} className="block w-full rounded-md px-2 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-white/10">Folder</button>
                <button onClick={() => { setShowCreateMenu(false); toast('Web Page creation is coming soon') }} className="block w-full rounded-md px-2 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-white/10">Web Page</button>
              </div>
            )}
          </div>
          <button onClick={handleSelectAll} className="rounded-sm border border-white/25 px-3 py-2 text-xs font-bold text-white hover:bg-white/10">SELECT ALL</button>
          <button onClick={fetchGalleries} className="rounded-sm border border-white/25 px-3 py-2 text-xs font-bold text-white hover:bg-white/10">REFRESH</button>
          <button onClick={openUploadForFolder} className="rounded-sm border border-white/25 px-3 py-2 text-xs font-bold text-white hover:bg-white/10">UPLOAD</button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="ml-auto rounded-sm border border-white/20 bg-black/40 px-3 py-2 text-xs font-semibold text-slate-200"
          >
            <option value="date_desc">Sort: Newest</option>
            <option value="date_asc">Sort: Oldest</option>
            <option value="title_asc">Sort: Title A-Z</option>
            <option value="title_desc">Sort: Title Z-A</option>
            <option value="photos_desc">Sort: Most Photos</option>
          </select>
          <span className="text-sm font-semibold text-slate-300">{filteredGalleries.length} items</span>
        </div>

        <div className="grid min-h-[520px] grid-cols-1 lg:grid-cols-[280px,minmax(0,1fr)]">
          <aside className="border-b border-white/10 p-3 lg:border-b-0 lg:border-r">
            <div className="mb-3 rounded-md border border-white/10 bg-black/20 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Folders</p>
              <p className="mt-1 text-xs text-slate-400">{galleries.length} total · {totalPhotos} files</p>
            </div>

            <div className="max-h-[420px] overflow-auto pr-1">
              {renderSidebarTree('root', 0)}
            </div>

            <div className="mt-3 border-t border-white/10 pt-3">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                <span>Selected</span>
                <span>{selectedCount}</span>
              </div>
              <div className="space-y-1 text-xs">
                <button onClick={() => setVisibilityFilter('all')} className={`w-full rounded px-2 py-1.5 text-left ${visibilityFilter === 'all' ? 'bg-emerald-300/10 text-emerald-200' : 'text-slate-300 hover:bg-white/5'}`}>All</button>
                <button onClick={() => setVisibilityFilter('public')} className={`w-full rounded px-2 py-1.5 text-left ${visibilityFilter === 'public' ? 'bg-emerald-300/10 text-emerald-200' : 'text-slate-300 hover:bg-white/5'}`}>Public ({publicCount})</button>
                <button onClick={() => setVisibilityFilter('unlisted')} className={`w-full rounded px-2 py-1.5 text-left ${visibilityFilter === 'unlisted' ? 'bg-emerald-300/10 text-emerald-200' : 'text-slate-300 hover:bg-white/5'}`}>Unlisted ({unlistedCount})</button>
                <button onClick={() => setVisibilityFilter('private')} className={`w-full rounded px-2 py-1.5 text-left ${visibilityFilter === 'private' ? 'bg-emerald-300/10 text-emerald-200' : 'text-slate-300 hover:bg-white/5'}`}>Private ({privateCount})</button>
              </div>
            </div>
          </aside>

          <section className="p-4">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="relative w-full max-w-sm">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search folders"
                  className="w-full rounded-sm border border-white/15 bg-black/30 px-4 py-2 text-sm text-white placeholder:text-slate-500"
                />
              </div>
              {activeGallery && (
                <div className="rounded-md border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-200">
                  Active: {activeGallery.title}
                </div>
              )}
              {reordering && (
                <span className="rounded-md border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-200">
                  Reordering...
                </span>
              )}
            </div>

            <div className="mb-4 rounded-lg border border-white/10 bg-black/20 p-3">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Media Browser</p>
                <span className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-[11px] font-semibold text-slate-300">{sortedMedia.length} files</span>
                <button onClick={() => setMediaFilter('all')} className={`rounded-sm px-2.5 py-1 text-xs font-semibold ${mediaFilter === 'all' ? 'bg-emerald-300/20 text-emerald-200' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>All</button>
                <button onClick={() => setMediaFilter('photos')} className={`rounded-sm px-2.5 py-1 text-xs font-semibold ${mediaFilter === 'photos' ? 'bg-emerald-300/20 text-emerald-200' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>Photos</button>
                <button onClick={() => setMediaFilter('videos')} className={`rounded-sm px-2.5 py-1 text-xs font-semibold ${mediaFilter === 'videos' ? 'bg-emerald-300/20 text-emerald-200' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>Videos</button>
                <select value={mediaSort} onChange={(e) => setMediaSort(e.target.value)} className="ml-auto rounded-sm border border-white/20 bg-black/30 px-2 py-1 text-xs text-slate-200">
                  <option value="date_desc">Newest</option>
                  <option value="date_asc">Oldest</option>
                  <option value="name_asc">Name A-Z</option>
                  <option value="name_desc">Name Z-A</option>
                </select>
              </div>

              {mediaLoading ? (
                <div className="py-8"><Spinner /></div>
              ) : sortedMedia.length === 0 ? (
                <div className="rounded-md border border-dashed border-white/15 bg-black/20 p-6 text-center text-sm text-slate-400">
                  {activeGallery ? 'No photos or videos in this folder yet.' : 'Select a folder to view media.'}
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                  {sortedMedia.map((item) => {
                    const isVideo = (item.mime_type || '').startsWith('video/')
                    const thumb = item.display_url || item.thumb_url || item.medium_url || item.large_url || item.original_url
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigate(`/dashboard/photos/${item.id}`)}
                        className="group relative overflow-hidden rounded-md border border-white/10 bg-[#0d1422] text-left hover:border-white/25"
                        title={item.filename_original || item.title || 'Media file'}
                      >
                        <div className="relative aspect-square bg-black/35">
                          {thumb ? (
                            <img src={thumb} alt={item.title || item.filename_original || 'Media'} className="h-full w-full object-cover transition group-hover:scale-105" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xl text-slate-400">{isVideo ? '🎬' : '🖼️'}</div>
                          )}
                          <span className={`absolute left-1 top-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${isVideo ? 'bg-amber-400/80 text-black' : 'bg-emerald-300/80 text-black'}`}>{isVideo ? 'VIDEO' : 'PHOTO'}</span>
                        </div>
                        <div className="p-2">
                          <p className="truncate text-[11px] font-semibold text-white">{item.title || item.filename_original || 'Untitled'}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
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
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {renderFolderTree('root', 0)}
            </div>
          )}
          </section>
        </div>
      </section>
      )}

      {isLibraryMode && lightboxMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85" onClick={closeLightbox} />
          <div className="relative z-10 grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-xl border border-white/20 bg-[#0b1320] lg:grid-cols-[minmax(0,1fr),320px]">
            <div className="relative flex min-h-[62vh] flex-col bg-black/30">
              <div className="relative flex flex-1 items-center justify-center px-14 py-5">
                <button
                  type="button"
                  onClick={showPrevMedia}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-sm font-semibold text-white hover:bg-black/65"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={showNextMedia}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-sm font-semibold text-white hover:bg-black/65"
                >
                  →
                </button>

                <div className="absolute right-3 top-3 flex items-center gap-1 rounded-md border border-white/15 bg-black/55 p-1">
                  <button type="button" onClick={handleZoomOut} className="rounded px-2 py-1 text-xs font-semibold text-slate-200 hover:bg-white/10" disabled={lightboxZoom <= 1}>−</button>
                  <button type="button" onClick={handleZoomReset} className="rounded px-2 py-1 text-xs font-semibold text-slate-200 hover:bg-white/10">{Math.round(lightboxZoom * 100)}%</button>
                  <button type="button" onClick={handleZoomIn} className="rounded px-2 py-1 text-xs font-semibold text-slate-200 hover:bg-white/10" disabled={lightboxZoom >= 3}>+</button>
                </div>

                {getMediaSource(lightboxMedia) ? (
                  (lightboxMedia.mime_type || '').startsWith('video/') ? (
                    <video
                      src={getMediaSource(lightboxMedia)}
                      controls
                      className="max-h-[74vh] w-auto rounded-md"
                    />
                  ) : (
                    <img
                      src={getMediaSource(lightboxMedia)}
                      alt={lightboxMedia.title || lightboxMedia.filename_original || 'Media'}
                      className="max-h-[74vh] w-auto rounded-sm object-contain transition"
                      style={{ transform: `scale(${lightboxZoom})` }}
                    />
                  )
                ) : (
                  <div className="text-5xl text-slate-500">🖼️</div>
                )}
              </div>

              <div className="border-t border-white/10 bg-[#0b1320]/90 px-3 py-2">
                <div className="mb-2 flex items-center justify-between px-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Filmstrip</p>
                  <p className="text-[10px] text-slate-400">{lightboxIndex + 1} / {sortedMedia.length}</p>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {sortedMedia.map((item) => {
                    const thumb = getMediaSource(item)
                    const isActive = item.id === lightboxMediaId
                    const isSelected = selectedMediaIds.includes(item.id)
                    return (
                      <button
                        key={`thumb-${item.id}`}
                        type="button"
                        onClick={() => openLightbox(item.id)}
                        data-lightbox-thumb={item.id}
                        className={`relative h-14 w-20 shrink-0 overflow-hidden rounded border ${isActive ? 'border-emerald-300 ring-1 ring-emerald-300/60' : 'border-white/15 hover:border-white/35'}`}
                        title={item.filename_original || item.title || 'Media'}
                      >
                        {thumb ? (
                          <img src={thumb} alt={item.title || item.filename_original || 'Media'} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-black/40 text-xs text-slate-400">?</div>
                        )}
                        {isSelected && <span className="absolute right-0.5 top-0.5 rounded bg-emerald-300 px-1 text-[9px] font-bold text-[#04210f]">✓</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <aside className="space-y-4 border-t border-white/10 bg-[#0e1726] p-4 lg:border-l lg:border-t-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Media Browser</p>
                  <h3 className="mt-1 line-clamp-2 text-lg font-black tracking-tight text-white">{lightboxMedia.title || lightboxMedia.filename_original || 'Untitled'}</h3>
                </div>
                <button onClick={closeLightbox} className="rounded-md border border-white/20 px-2 py-1 text-xs font-semibold text-slate-300 hover:bg-white/10">Close</button>
              </div>

              <p className="text-[11px] text-slate-400">Use arrow keys to browse, + / - to zoom, and 0 to reset.</p>

              <div className="space-y-2 rounded-lg border border-white/10 bg-black/20 p-3 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Type</span><span className="text-slate-200">{(lightboxMedia.mime_type || '').startsWith('video/') ? 'Video' : 'Photo'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Name</span><span className="max-w-[180px] truncate text-right text-slate-200">{lightboxMedia.filename_original || '—'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Captured</span><span className="text-slate-200">{new Date(lightboxMedia.created_at || Date.now()).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Selected</span><span className="text-slate-200">{selectedMediaIds.length}</span></div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => toggleMediaSelection(lightboxMedia.id)}
                  className={`rounded-md border px-3 py-2 text-xs font-semibold ${selectedMediaIds.includes(lightboxMedia.id) ? 'border-emerald-300/40 bg-emerald-300/15 text-emerald-200' : 'border-white/20 text-slate-200 hover:bg-white/10'}`}
                >
                  {selectedMediaIds.includes(lightboxMedia.id) ? 'Selected' : 'Select'}
                </button>
                <button onClick={() => downloadMedia(lightboxMedia)} className="rounded-md border border-white/20 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10">Download</button>
              </div>

              <div className="space-y-2 rounded-lg border border-white/10 bg-black/20 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Move To Folder</p>
                <select
                  value={moveTargetGalleryId}
                  onChange={(e) => setMoveTargetGalleryId(e.target.value)}
                  className="w-full rounded-md border border-white/20 bg-black/30 px-2 py-2 text-xs text-slate-200"
                >
                  <option value="">Select folder</option>
                  {galleries.map((gallery) => (
                    <option key={`mv-${gallery.id}`} value={gallery.id}>{gallery.title}</option>
                  ))}
                </select>
                <button onClick={moveLightboxMedia} disabled={movingMedia || !moveTargetGalleryId} className="w-full rounded-md border border-white/20 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-50">
                  {movingMedia ? 'Moving...' : 'Move'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => navigate(`/dashboard/photos/${lightboxMedia.id}`)} className="rounded-md border border-white/20 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10">Open Details</button>
                <button onClick={closeLightbox} className="rounded-md border border-white/20 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10">Done</button>
              </div>
            </aside>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={closeCreateDialog} />
          <form onSubmit={handleCreate} className="relative z-10 w-full max-w-4xl overflow-hidden rounded-sm border border-white/25 bg-[#0f1622] text-white shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
            <div className="border-b border-white/15 px-6 py-4 text-center">
              <h2 className="text-3xl font-black tracking-tight">{editingGalleryId ? 'Edit Gallery Settings' : `Create ${form.kind === 'folder' ? 'Folder' : 'Gallery'}`}</h2>
            </div>

            <div className="grid min-h-[440px] grid-cols-[200px,minmax(0,1fr)]">
              <aside className="border-r border-white/15 bg-[#131b28] p-0">
                {CREATE_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCreateTab(tab.id)}
                    className={`block w-full border-l-4 px-4 py-3 text-left text-base font-semibold transition ${activeCreateTab === tab.id ? 'border-cyan-300 bg-[#1f2a3a] text-white' : 'border-transparent text-slate-300 hover:bg-white/5 hover:text-white'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </aside>

              <section className="bg-[#101826] p-6">
                {activeCreateTab === 'basics' && (
                  <div className="space-y-5">
                    <label className="block text-sm font-semibold text-slate-300">Gallery Preset</label>
                    <select value={form.preset} onChange={(e) => setForm((f) => ({ ...f, preset: e.target.value }))} className="w-full border-b border-white/25 bg-transparent px-1 py-2 text-lg outline-none focus:border-emerald-300">
                      <option value="epicbox_default">EpicBox Default</option>
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
                        <label className="block text-sm font-semibold text-slate-300">Platform Searchable</label>
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

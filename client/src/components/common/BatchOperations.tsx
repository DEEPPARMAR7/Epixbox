import React, { useState } from 'react';
import { Checkbox, Trash2, Copy, Download, Tag, Eye, EyeOff } from 'lucide-react';
import Button from './Button';
import Modal from './Modal';
import toast from 'react-hot-toast';

interface Photo {
  id: string | number;
  title?: string;
  gallery_id?: string | number;
  tags?: string[];
}

interface BatchOperationsProps {
  photos: Photo[];
  onUpdate?: (photoIds: (string | number)[], updates: any) => Promise<void>;
  onDelete?: (photoIds: (string | number)[]) => Promise<void>;
  onDownload?: (photoIds: (string | number)[]) => void;
  onMove?: (photoIds: (string | number)[], targetGalleryId: string | number) => Promise<void>;
}

export default function BatchOperations({
  photos,
  onUpdate,
  onDelete,
  onDownload,
  onMove,
}: BatchOperationsProps) {
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedArray = Array.from(selected);

  const togglePhoto = (id: string | number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const toggleAll = () => {
    if (selected.size === photos.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(photos.map(p => p.id)));
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    try {
      setLoading(true);
      await onDelete(selectedArray);
      setSelected(new Set());
      setShowDeleteModal(false);
      toast.success(`Deleted ${selectedArray.length} photos`);
    } catch (error) {
      toast.error('Failed to delete photos');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!onDownload) return;
    onDownload(selectedArray);
    toast.success('Download started for ' + selectedArray.length + ' photos');
  };

  const handleAddTag = async () => {
    if (!onUpdate || !newTag.trim()) return;
    try {
      setLoading(true);
      const selectedPhotos = photos.filter(p => selected.has(p.id));
      const updates = {
        tags: selectedPhotos
          .reduce((acc, p) => {
            const tags = new Set(p.tags || []);
            tags.add(newTag.trim());
            return { ...acc, [p.id]: Array.from(tags) };
          }, {}),
      };
      await onUpdate(selectedArray, updates);
      setNewTag('');
      setShowTagModal(false);
      toast.success(`Added tag to ${selectedArray.length} photos`);
    } catch (error) {
      toast.error('Failed to add tag');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (visible: boolean) => {
    if (!onUpdate) return;
    try {
      setLoading(true);
      const updates = selectedArray.reduce(
        (acc, id) => ({ ...acc, [id]: { is_public: visible } }),
        {}
      );
      await onUpdate(selectedArray, updates);
      toast.success(
        `${selectedArray.length} photos are now ${visible ? 'public' : 'private'}`
      );
    } catch (error) {
      toast.error('Failed to update visibility');
    } finally {
      setLoading(false);
    }
  };

  if (selected.size === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={selected.size === photos.length}
              onChange={toggleAll}
              className="w-5 h-5 rounded border-gray-300"
            />
            <span className="font-semibold">
              {selected.size} photo{selected.size !== 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowTagModal(true)}
              disabled={loading}
            >
              <Tag size={16} />
              Add Tags
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleToggleVisibility(true)}
              disabled={loading}
            >
              <Eye size={16} />
              Make Public
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleToggleVisibility(false)}
              disabled={loading}
            >
              <EyeOff size={16} />
              Make Private
            </Button>

            {onDownload && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownload}
                disabled={loading}
              >
                <Download size={16} />
                Download
              </Button>
            )}

            {onMove && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowMoveModal(true)}
                disabled={loading}
              >
                <Copy size={16} />
                Move
              </Button>
            )}

            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              disabled={loading}
            >
              <Trash2 size={16} />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Photos">
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete {selectedArray.length} photo{selectedArray.length !== 1 ? 's' : ''}?
            This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={loading}
            >
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showTagModal} onClose={() => setShowTagModal(false)} title="Add Tag">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter tag name"
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={e => e.key === 'Enter' && handleAddTag()}
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setNewTag('');
                setShowTagModal(false);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTag}
              loading={loading}
              disabled={!newTag.trim()}
            >
              Add Tag
            </Button>
          </div>
        </div>
      </Modal>

      {onMove && (
        <Modal isOpen={showMoveModal} onClose={() => setShowMoveModal(false)} title="Move Photos">
          <div className="space-y-4">
            <p className="text-gray-600">
              Move {selectedArray.length} photo{selectedArray.length !== 1 ? 's' : ''} to another gallery.
            </p>
            {/* Gallery selector would go here - integrate with your gallery list */}
            <div className="flex gap-2 justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowMoveModal(false)}
              >
                Cancel
              </Button>
              <Button disabled>Select Gallery</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Photo card with selection checkbox
export function SelectablePhotoCard({
  photo,
  selected,
  onSelect,
  onClick,
}: {
  photo: Photo;
  selected: boolean;
  onSelect: (id: string | number) => void;
  onClick?: () => void;
}) {
  return (
    <div
      className="relative group cursor-pointer"
      onClick={onClick}
    >
      <div className="absolute top-2 left-2 z-10">
        <input
          type="checkbox"
          checked={selected}
          onChange={e => {
            e.stopPropagation();
            onSelect(photo.id);
          }}
          className="w-5 h-5 rounded border-gray-300 cursor-pointer"
        />
      </div>
      {/* Your photo card content here */}
      <div
        className={`rounded-lg overflow-hidden bg-gray-200 h-64 transition ${
          selected ? 'ring-2 ring-blue-500' : ''
        }`}
      >
        <img
          src={photo.s3_key_thumb}
          alt={photo.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
      </div>
    </div>
  );
}

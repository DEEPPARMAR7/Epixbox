import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, Download, Tag, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const axiosClient = axios.create({ baseURL: API_BASE });

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('epixbox-auth');
  if (token) {
    config.headers.Authorization = `Bearer ${JSON.parse(token).token}`;
  }
  return config;
});

/**
 * Checkbox for bulk selection
 */
export function BulkSelectCheckbox({ isChecked, onToggle, label = '' }) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox checked={isChecked} onCheckedChange={onToggle} />
      {label && <span className="text-sm text-gray-600">{label}</span>}
    </div>
  );
}

/**
 * Toolbar for batch actions
 */
export function BatchActionsToolbar({ selectedCount, selectedIds, onComplete }) {
  const [loading, setLoading] = React.useState(false);

  if (!selectedCount) return null;

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedCount} photo(s)? This cannot be undone.`)) return;

    setLoading(true);
    try {
      await axiosClient.post('/photos/bulk-delete', { ids: selectedIds });
      toast.success(`Deleted ${selectedCount} photos`);
      onComplete?.();
    } catch (error) {
      toast.error('Failed to delete photos');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDownload = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.post('/photos/bulk-download', { ids: selectedIds });
      // Download ZIP file
      const url = res.data.download_url;
      window.open(url, '_blank');
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to prepare download');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white rounded-lg shadow-lg border p-4 flex items-center gap-4">
      <span className="font-medium text-sm">{selectedCount} selected</span>

      <div className="h-6 w-px bg-gray-200" />

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleBulkDownload}
          disabled={loading}
        >
          <Download className="w-4 h-4 mr-2" />
          Download ZIP
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleBulkDelete}
          disabled={loading}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
}

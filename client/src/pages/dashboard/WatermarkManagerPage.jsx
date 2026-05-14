import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Plus, Eye } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const axiosClient = axios.create({ baseURL: API_BASE });

// Add auth token to requests
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('epixbox-auth');
  if (token) {
    try {
      const parsed = JSON.parse(token);
      const accessToken = parsed?.accessToken || parsed?.token;
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch {
      // Ignore malformed local storage payload and continue unauthenticated.
    }
  }
  return config;
});

/**
 * Component to preview watermark
 */function WatermarkPreview({ template, photoWidth = 600, photoHeight = 400 }) {
  if (!template) return null;

  const previewWidth = photoWidth;
  const previewHeight = photoHeight;
  const watermarkWidth = (previewWidth * template.size_percentage) / 100;
  const fontSize = Math.max(12, Math.floor(previewWidth * 0.02));

  const getPosition = () => {
    const positions = {
      'top-left': { x: 10, y: Math.max(fontSize, 20) },
      'top-center': { x: (previewWidth - watermarkWidth) / 2, y: Math.max(fontSize, 20) },
      'top-right': { x: previewWidth - watermarkWidth - 10, y: Math.max(fontSize, 20) },
      'center-left': { x: 10, y: previewHeight / 2 },
      'center': { x: (previewWidth - watermarkWidth) / 2, y: previewHeight / 2 },
      'center-right': { x: previewWidth - watermarkWidth - 10, y: previewHeight / 2 },
      'bottom-left': { x: 10, y: previewHeight - fontSize - 10 },
      'bottom-center': { x: (previewWidth - watermarkWidth) / 2, y: previewHeight - fontSize - 10 },
      'bottom-right': { x: previewWidth - watermarkWidth - 10, y: previewHeight - fontSize - 10 },
    };
    return positions[template.position] || positions['bottom-right'];
  };

  const pos = getPosition();

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden" style={{ width: previewWidth, height: previewHeight }}>
      <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
        Preview
      </div>
      {template.is_text_watermark ? (
        <div
          className="absolute text-white font-bold pointer-events-none select-none"
          style={{
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            fontSize: `${fontSize}px`,
            opacity: template.opacity,
            fontFamily: template.font_family,
            color: template.color,
            transform: `rotate(${template.rotation}deg)`,
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          {template.text}
        </div>
      ) : (
        <div
          className="absolute bg-gray-300 rounded flex items-center justify-center text-xs text-gray-600"
          style={{
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            width: `${watermarkWidth}px`,
            height: `${watermarkWidth}px`,
            opacity: template.opacity,
          }}
        >
          Image
        </div>
      )}
    </div>
  );
}

/**
 * Create/Edit Watermark Dialog
 */
function WatermarkDialog({ template, onSave, trigger }) {
  const [formData, setFormData] = useState(
    template || {
      name: '',
      text: '',
      position: 'bottom-right',
      opacity: 0.5,
      size_percentage: 20,
      font_family: 'Arial',
      color: '#FFFFFF',
      rotation: -45,
      is_text_watermark: true,
    }
  );

  const [open, setOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSave(formData);
      setOpen(false);
      toast.success(template ? 'Watermark updated' : 'Watermark created');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save watermark');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit Watermark' : 'Create Watermark'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Watermark Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Copyright 2024"
              required
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="is_text">Type</Label>
              <select
                name="is_text_watermark"
                value={formData.is_text_watermark}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value={true}>Text</option>
                <option value={false}>Image</option>
              </select>
            </div>
          </div>

          {formData.is_text_watermark && (
            <>
              <div>
                <Label htmlFor="text">Watermark Text *</Label>
                <Input
                  id="text"
                  name="text"
                  value={formData.text}
                  onChange={handleChange}
                  placeholder="© Your Name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="font">Font Family</Label>
                  <select
                    id="font"
                    name="font_family"
                    value={formData.font_family}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option>Arial</option>
                    <option>Times New Roman</option>
                    <option>Courier New</option>
                    <option>Georgia</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="color">Color</Label>
                  <input
                    id="color"
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="w-full h-10 border rounded-md cursor-pointer"
                  />
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="position">Position</Label>
              <Select value={formData.position} onValueChange={(val) => setFormData({...formData, position: val})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top-left">Top Left</SelectItem>
                  <SelectItem value="top-center">Top Center</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="center-left">Center Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="center-right">Center Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="bottom-center">Bottom Center</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="opacity">Opacity ({(formData.opacity * 100).toFixed(0)}%)</Label>
              <input
                id="opacity"
                type="range"
                name="opacity"
                min="0.1"
                max="1"
                step="0.1"
                value={formData.opacity}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="size">Size ({formData.size_percentage}%)</Label>
              <input
                id="size"
                type="range"
                name="size_percentage"
                min="5"
                max="100"
                step="5"
                value={formData.size_percentage}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>

          {formData.is_text_watermark && (
            <div>
              <Label htmlFor="rotation">Rotation ({formData.rotation}°)</Label>
              <input
                id="rotation"
                type="range"
                name="rotation"
                min="-180"
                max="180"
                step="15"
                value={formData.rotation}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          )}

          <div className="py-4 border-t">
            <Label className="mb-3 block">Preview</Label>
            <WatermarkPreview template={formData} />
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button type="submit" className="flex-1">
              Save Watermark
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Main Watermark Manager Page
 */
export default function WatermarkManagerPage() {
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['watermarks'],
    queryFn: async () => {
      const res = await axiosClient.get('/watermarks');
      return res.data;
    },
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => axiosClient.post('/watermarks', data),
    onSuccess: () => queryClient.invalidateQueries(['watermarks']),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => axiosClient.put(`/watermarks/${data.id}`, data),
    onSuccess: () => queryClient.invalidateQueries(['watermarks']),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosClient.delete(`/watermarks/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['watermarks']),
  });

  const handleDelete = (id) => {
    if (window.confirm('Delete this watermark?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success('Watermark deleted'),
        onError: (error) => toast.error(error.response?.data?.error || 'Delete failed'),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Watermarks</h1>
        <WatermarkDialog
          onSave={(data) => createMutation.mutateAsync(data)}
          trigger={<Button><Plus className="w-4 h-4 mr-2" /> Create Watermark</Button>}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            No watermarks yet. Create one to protect your photos!
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{template.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-center">
                  <WatermarkPreview template={template} photoWidth={250} photoHeight={180} />
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-semibold">Type:</span> {template.is_text_watermark ? 'Text' : 'Image'}</p>
                  <p><span className="font-semibold">Position:</span> {template.position}</p>
                  <p><span className="font-semibold">Opacity:</span> {(template.opacity * 100).toFixed(0)}%</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <WatermarkDialog
                    template={template}
                    onSave={(data) => updateMutation.mutateAsync({ id: template.id, ...data })}
                    trigger={<Button size="sm" variant="outline" className="flex-1"><Eye className="w-4 h-4 mr-1" /> Edit</Button>}
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(template.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

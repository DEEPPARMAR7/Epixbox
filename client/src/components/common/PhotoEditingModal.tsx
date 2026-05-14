import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Edit, RotateCw, Crop as CropIcon } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const axiosClient = axios.create({ baseURL: API_BASE });

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

export function PhotoEditingModal({ photoId, photoUrl, onPhotoUpdated }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('adjust'); // adjust, crop, rotate
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(photoUrl);

  const adjustMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosClient.post(`/photos/${photoId}/adjust`, {
        brightness,
        contrast,
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success('Photo adjusted successfully');
      onPhotoUpdated(data.photo);
      setOpen(false);
      resetValues();
    },
    onError: () => toast.error('Failed to adjust photo'),
  });

  const rotateMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosClient.post(`/photos/${photoId}/rotate`, {
        degrees: rotationDegrees,
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success('Photo rotated successfully');
      onPhotoUpdated(data.photo);
      setOpen(false);
      resetValues();
    },
    onError: () => toast.error('Failed to rotate photo'),
  });

  const resetValues = () => {
    setBrightness(0);
    setContrast(0);
    setRotationDegrees(0);
    setMode('adjust');
    setPreviewUrl(photoUrl);
  };

  const handleAdjustmentChange = () => {
    // Here you could implement real-time preview with canvas
    // For now, just show when submitted
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Photo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Preview */}
          <div className="bg-gray-100 rounded-lg overflow-hidden flex justify-center items-center" style={{ height: '300px' }}>
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                maxHeight: '100%',
                maxWidth: '100%',
                transform: `rotate(${rotationDegrees}deg) brightness(${1 + brightness / 100}) contrast(${1 + contrast / 100})`,
              }}
            />
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-2 border-b">
            <Button
              variant={mode === 'adjust' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('adjust')}
            >
              Brightness & Contrast
            </Button>
            <Button
              variant={mode === 'rotate' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('rotate')}
            >
              <RotateCw className="w-4 h-4 mr-2" />
              Rotate
            </Button>
          </div>

          {/* Adjust Mode */}
          {mode === 'adjust' && (
            <div className="space-y-4">
              <div>
                <Label className="flex justify-between mb-2">
                  <span>Brightness</span>
                  <span className="text-sm text-gray-600">{brightness > 0 ? '+' : ''}{brightness}</span>
                </Label>
                <Slider
                  value={[brightness]}
                  onValueChange={(val) => setBrightness(val[0])}
                  min={-100}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <Label className="flex justify-between mb-2">
                  <span>Contrast</span>
                  <span className="text-sm text-gray-600">{contrast > 0 ? '+' : ''}{contrast}</span>
                </Label>
                <Slider
                  value={[contrast]}
                  onValueChange={(val) => setContrast(val[0])}
                  min={-100}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => adjustMutation.mutate()}
                  disabled={adjustMutation.isPending || (brightness === 0 && contrast === 0)}
                  className="flex-1"
                >
                  {adjustMutation.isPending ? 'Applying...' : 'Apply Changes'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetValues();
                    setOpen(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Rotate Mode */}
          {mode === 'rotate' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={rotationDegrees === 90 ? 'default' : 'outline'}
                  onClick={() => setRotationDegrees(90)}
                >
                  90°
                </Button>
                <Button
                  variant={rotationDegrees === 180 ? 'default' : 'outline'}
                  onClick={() => setRotationDegrees(180)}
                >
                  180°
                </Button>
                <Button
                  variant={rotationDegrees === 270 ? 'default' : 'outline'}
                  onClick={() => setRotationDegrees(270)}
                >
                  270°
                </Button>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => rotateMutation.mutate()}
                  disabled={rotateMutation.isPending || rotationDegrees === 0}
                  className="flex-1"
                >
                  {rotateMutation.isPending ? 'Rotating...' : 'Apply Rotation'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetValues();
                    setOpen(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

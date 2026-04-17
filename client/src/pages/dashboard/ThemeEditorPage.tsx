import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Check } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const axiosClient = axios.create({ baseURL: API_BASE });

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('epixbox-auth');
  if (token) {
    config.headers.Authorization = `Bearer ${JSON.parse(token).token}`;
  }
  return config;
});

function ThemeCard({ theme, isSelected, onSelect }) {
  return (
    <Card
      className={`cursor-pointer transition ${isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'}`}
      onClick={onSelect}
    >
      <CardContent className="pt-6">
        <div className="space-y-3">
          {/* Color Preview */}
          <div className="flex gap-1 h-8 rounded overflow-hidden">
            {['primary', 'secondary', 'accent'].map(key => (
              <div
                key={key}
                className="flex-1"
                style={{ backgroundColor: theme.css_variables?.[key] || '#ccc' }}
              />
            ))}
          </div>

          {/* Theme Info */}
          <div>
            <h3 className="font-semibold text-sm">{theme.name}</h3>
            <p className="text-xs text-gray-600 mt-1">{theme.category}</p>
          </div>

          {/* Selected Badge */}
          {isSelected && (
            <div className="flex items-center gap-1 text-blue-600 text-xs font-medium">
              <Check className="w-3 h-3" />
              Selected
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ThemeEditorPage() {
  const [selectedGallery, setSelectedGallery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [customCSS, setCustomCSS] = useState('');
  const queryClient = useQueryClient();

  // Fetch themes
  const { data: themes = [] } = useQuery({
    queryKey: ['themes'],
    queryFn: async () => {
      const res = await axiosClient.get('/themes');
      return res.data;
    },
  });

  // Fetch user galleries
  const { data: galleries = [] } = useQuery({
    queryKey: ['galleries'],
    queryFn: async () => {
      const res = await axiosClient.get('/galleries');
      return res.data;
    },
  });

  // Apply theme mutation
  const applyThemeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedGallery || !selectedTheme) {
        throw new Error('Please select both gallery and theme');
      }
      const res = await axiosClient.post(`/galleries/${selectedGallery}/apply-theme`, {
        theme_id: selectedTheme,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Theme applied successfully!');
      queryClient.invalidateQueries(['galleries']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to apply theme');
    },
  });

  // Save custom CSS mutation
  const saveCSSMutation = useMutation({
    mutationFn: async () => {
      if (!selectedGallery) {
        throw new Error('Please select a gallery');
      }
      const res = await axiosClient.put(`/galleries/${selectedGallery}/custom-css`, {
        css: customCSS,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Custom CSS saved!');
    },
    onError: () => {
      toast.error('Failed to save CSS');
    },
  });

  // Group themes by category
  const themes_by_category = themes.reduce((acc, theme) => {
    if (!acc[theme.category]) acc[theme.category] = [];
    acc[theme.category].push(theme);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Portfolio Themes</h1>
        <p className="text-gray-600 mt-1">Customize how your portfolio looks with beautiful pre-designed themes.</p>
      </div>

      {/* Gallery Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={selectedGallery}
            onChange={(e) => setSelectedGallery(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Choose a gallery to customize...</option>
            {galleries.map(gallery => (
              <option key={gallery.id} value={gallery.id}>
                {gallery.title}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Themes by Category */}
      {Object.entries(themes_by_category).map(([category, categoryThemes]) => (
        <div key={category}>
          <h2 className="text-2xl font-bold mb-4 capitalize">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryThemes.map(theme => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isSelected={selectedTheme === theme.id}
                onSelect={() => setSelectedTheme(theme.id)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Apply Theme Button */}
      {selectedTheme && selectedGallery && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <Button
              onClick={() => applyThemeMutation.mutate()}
              disabled={applyThemeMutation.isPending}
              className="w-full"
            >
              {applyThemeMutation.isPending ? 'Applying theme...' : 'Apply Selected Theme'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Custom CSS Section */}
      {selectedGallery && (
        <Card>
          <CardHeader>
            <CardTitle>Custom CSS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Add custom CSS to override theme styles. Changes apply only to this gallery.
            </p>
            <Textarea
              placeholder=".portfolio-header { background-color: #000; }"
              value={customCSS}
              onChange={(e) => setCustomCSS(e.target.value)}
              className="font-mono text-sm"
              rows={8}
            />
            <Button
              onClick={() => saveCSSMutation.mutate()}
              disabled={saveCSSMutation.isPending}
              variant="outline"
              className="w-full"
            >
              {saveCSSMutation.isPending ? 'Saving...' : 'Save Custom CSS'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {selectedGallery && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded border p-6 space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold">{galleries.find(g => g.id === selectedGallery)?.title}</h2>
                <p className="text-gray-600 text-sm mt-2">Your gallery will appear with the selected theme</p>
              </div>
              {selectedTheme && (
                <div className="text-center text-sm text-gray-500">
                  Theme: {themes.find(t => t.id === selectedTheme)?.name || 'Preview'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X } from 'lucide-react';

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

export function AdvancedPhotoSearch({ onSearchResults }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    camera: '',
    lens: '',
    iso: '',
    aperture: '',
    focal_length: '',
    dateFrom: '',
    dateTo: '',
    sort: 'created_at',
  });

  // Get available metadata for dropdowns
  const { data: metadata = {} } = useQuery({
    queryKey: ['photo-metadata'],
    queryFn: async () => {
      const res = await axiosClient.get('/photos/filters/metadata');
      return res.data;
    },
  });

  // Search photos
  const { data: searchResults, isFetching } = useQuery({
    queryKey: ['photos-search', searchQuery, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: searchQuery,
        ...filters,
      });
      const res = await axiosClient.get(`/photos/search?${params}`);
      return res.data;
    },
    enabled: searchQuery.length > 0 || Object.values(filters).some(v => v),
  });

  useEffect(() => {
    if (searchResults && onSearchResults) {
      onSearchResults(searchResults);
    }
  }, [searchResults, onSearchResults]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      camera: '',
      lens: '',
      iso: '',
      aperture: '',
      focal_length: '',
      dateFrom: '',
      dateTo: '',
      sort: 'created_at',
    });
  };

  const hasActiveFilters = searchQuery || Object.values(filters).some(v => v);

  return (
    <div className="space-y-4">
      {/* Main Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Section */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Camera Filter */}
            <div>
              <label className="text-sm font-medium mb-1 block">Camera</label>
              <Select value={filters.camera} onValueChange={(val) => handleFilterChange('camera', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="All cameras" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All cameras</SelectItem>
                  {metadata.cameras?.map(camera => (
                    <SelectItem key={camera} value={camera}>
                      {camera}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lens Filter */}
            <div>
              <label className="text-sm font-medium mb-1 block">Lens</label>
              <Select value={filters.lens} onValueChange={(val) => handleFilterChange('lens', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="All lenses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All lenses</SelectItem>
                  {metadata.lenses?.map(lens => (
                    <SelectItem key={lens} value={lens}>
                      {lens}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ISO Filter */}
            <div>
              <label className="text-sm font-medium mb-1 block">ISO</label>
              <Select value={filters.iso} onValueChange={(val) => handleFilterChange('iso', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="All ISOs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All ISOs</SelectItem>
                  {metadata.isos?.map(iso => (
                    <SelectItem key={iso} value={String(iso)}>
                      {iso}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Aperture Filter */}
            <div>
              <label className="text-sm font-medium mb-1 block">Aperture</label>
              <Select value={filters.aperture} onValueChange={(val) => handleFilterChange('aperture', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="All apertures" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All apertures</SelectItem>
                  {metadata.apertures?.map(aperture => (
                    <SelectItem key={aperture} value={aperture}>
                      ƒ/{aperture}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Focal Length Filter */}
            <div>
              <label className="text-sm font-medium mb-1 block">Focal Length</label>
              <Select value={filters.focal_length} onValueChange={(val) => handleFilterChange('focal_length', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="All focal lengths" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All focal lengths</SelectItem>
                  {metadata.focalLengths?.map(focal => (
                    <SelectItem key={focal} value={focal}>
                      {focal}mm
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div>
              <label className="text-sm font-medium mb-1 block">Sort By</label>
              <Select value={filters.sort} onValueChange={(val) => handleFilterChange('sort', val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Newest First</SelectItem>
                  <SelectItem value="created_at">Oldest First</SelectItem>
                  <SelectItem value="title">Name (A-Z)</SelectItem>
                  <SelectItem value="file_size_bytes">Largest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Results Info */}
      {searchResults && (
        <div className="text-sm text-gray-600">
          Found {searchResults.total} photo{searchResults.total !== 1 ? 's' : ''}
          {searchResults.pages > 1 && ` (Page ${searchResults.page} of ${searchResults.pages})`}
        </div>
      )}

      {isFetching && (
        <div className="text-center text-gray-600 py-4">Searching...</div>
      )}
    </div>
  );
}

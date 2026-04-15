import React from 'react';
import Masonry from 'react-masonry-css';
import { GridLayout } from './GridLayout';
import { SlideshowLayout } from './SlideshowLayout';
import { ThumbnailLayout } from './ThumbnailLayout';

interface Photo {
  id: string | number;
  title?: string;
  description?: string;
  s3_key_original?: string;
  s3_key_large?: string;
  s3_key_medium?: string;
  s3_key_thumb: string;
}

interface GalleryLayoutRouterProps {
  layout?: 'grid' | 'masonry' | 'slideshow' | 'thumbnail' | 'collage' | 'justified';
  photos?: Photo[];
  galleryId?: string | number;
}

export function GalleryLayoutRouter({ layout = 'grid', photos = [], galleryId }: GalleryLayoutRouterProps) {
  switch (layout) {
    case 'slideshow':
      return <SlideshowLayout photos={photos} />;
    case 'thumbnail':
      return <ThumbnailLayout photos={photos} />;
    case 'masonry':
      return <MasonryLayout photos={photos} />;
    case 'collage':
      return <CollageLayout photos={photos} />;
    case 'justified':
    case 'grid':
    default:
      return <GridLayout photos={photos} layout={layout} />;
  }
}

// Standard Grid Layout
export function GridLayout({ photos, layout = 'grid' }: { photos: Photo[]; layout?: string }) {
  if (!photos.length) return <div className="text-center py-12 text-gray-500">No photos</div>;

  return (
    <div className={`grid gap-4 ${layout === 'justified' ? 'auto-rows-max' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
      {photos.map(photo => (
        <div key={photo.id} className="group cursor-pointer overflow-hidden rounded-lg bg-gray-200 relative h-64">
          <img
            src={photo.s3_key_medium || photo.s3_key_thumb}
            alt={photo.title || 'Photo'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {photo.title && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <h3 className="text-white font-semibold text-sm">{photo.title}</h3>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Masonry Layout - Professional masonry grid
export function MasonryLayout({ photos }: { photos: Photo[] }) {
  if (!photos.length) return <div className="text-center py-12 text-gray-500">No photos</div>;

  const breakpoints = {
    default: 3,
    1100: 2,
    700: 1,
  };

  return (
    <Masonry
      breakpointCols={breakpoints}
      className="masonry-grid"
      columnClassName="masonry-grid-column"
    >
      {photos.map(photo => (
        <div
          key={photo.id}
          className="group cursor-pointer overflow-hidden rounded-lg bg-gray-200 relative break-inside-avoid mb-4 hover:shadow-lg transition-shadow"
        >
          <img
            src={photo.s3_key_medium || photo.s3_key_thumb}
            alt={photo.title || 'Photo'}
            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {photo.title && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <h3 className="text-white font-semibold text-sm">{photo.title}</h3>
            </div>
          )}
        </div>
      ))}
    </Masonry>
  );
}

// Collage Layout - Creative collage grid with varying sizes
export function CollageLayout({ photos }: { photos: Photo[] }) {
  if (!photos.length) return <div className="text-center py-12 text-gray-500">No photos</div>;

  const getCollageClass = (index: number) => {
    const patterns = [
      'col-span-2 row-span-2', // Large
      'col-span-1 row-span-1', // Small
      'col-span-1 row-span-1', // Small
      'col-span-1 row-span-2', // Tall
      'col-span-2 row-span-1', // Wide
      'col-span-1 row-span-1', // Small
      'col-span-1 row-span-1', // Small
      'col-span-2 row-span-2', // Large
    ];
    return patterns[index % patterns.length];
  };

  return (
    <div className="grid grid-cols-4 gap-4 auto-rows-[200px]">
      {photos.map((photo, index) => (
        <div
          key={photo.id}
          className={`group cursor-pointer overflow-hidden rounded-lg bg-gray-200 relative ${getCollageClass(index)} hover:shadow-lg transition-shadow`}
        >
          <img
            src={photo.s3_key_large || photo.s3_key_medium || photo.s3_key_thumb}
            alt={photo.title || 'Photo'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {photo.title && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <h3 className="text-white font-semibold text-sm line-clamp-2">{photo.title}</h3>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Slideshow Layout - Full-screen carousel
export function SlideshowLayout({ photos }: { photos: Photo[] }) {
  const [current, setCurrent] = React.useState(0);
  const [autoPlay, setAutoPlay] = React.useState(true);

  React.useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setCurrent(c => (c === photos.length - 1 ? 0 : c + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [autoPlay, photos.length]);

  if (!photos.length) return <div className="text-center py-12">No photos</div>;

  const photo = photos[current];

  return (
    <div className="space-y-4">
      <div className="bg-black rounded-lg overflow-hidden flex items-center justify-center relative" style={{ height: '500px' }}>
        <img
          src={photo.s3_key_original || photo.s3_key_large}
          alt={photo.title || 'Photo'}
          className="max-h-full max-w-full"
        />
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
          {current + 1} / {photos.length}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setCurrent(c => (c === 0 ? photos.length - 1 : c - 1))}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          ← Previous
        </button>

        <button
          onClick={() => setAutoPlay(!autoPlay)}
          className={`px-4 py-2 rounded transition ${
            autoPlay ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          {autoPlay ? '⏸ Pause' : '▶ Play'}
        </button>

        <button
          onClick={() => setCurrent(c => (c === photos.length - 1 ? 0 : c + 1))}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          Next →
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {photos.map((p, idx) => (
          <img
            key={p.id}
            src={p.s3_key_thumb}
            alt=""
            onClick={() => {
              setCurrent(idx);
              setAutoPlay(false);
            }}
            className={`h-16 w-16 object-cover rounded cursor-pointer flex-shrink-0 border-2 transition ${
              idx === current ? 'border-blue-500 scale-110' : 'border-gray-300 opacity-70 hover:opacity-100'
            }`}
          />
        ))}
      </div>

      {photo.title && <p className="text-center text-lg font-semibold">{photo.title}</p>}
    </div>
  );
}

// Thumbnail Layout - Small thumbnails with expanded view
export function ThumbnailLayout({ photos }: { photos: Photo[] }) {
  const [selected, setSelected] = React.useState(photos[0]?.id);

  if (!photos.length) return <div className="text-center py-12">No photos</div>;

  const selectedPhoto = photos.find(p => p.id === selected);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center" style={{ height: '500px' }}>
        <img
          src={selectedPhoto?.s3_key_large}
          alt={selectedPhoto?.title || 'Photo'}
          className="max-h-full max-w-full"
        />
      </div>

      <div className="space-y-4">
        {selectedPhoto?.title && (
          <div>
            <h3 className="text-xl font-bold">{selectedPhoto.title}</h3>
            {selectedPhoto.description && (
              <p className="text-gray-600 text-sm mt-1">{selectedPhoto.description}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <p className="font-semibold text-sm">Gallery</p>
          <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
            {photos.map(photo => (
              <div
                key={photo.id}
                onClick={() => setSelected(photo.id)}
                className={`cursor-pointer rounded overflow-hidden border-2 transition hover:shadow-md ${
                  photo.id === selected ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <img src={photo.s3_key_thumb} alt="" className="w-full h-20 object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


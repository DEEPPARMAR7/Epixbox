import React from 'react';
import { GridLayout } from './GridLayout';
import { SlideshowLayout } from './SlideshowLayout';
import { ThumbnailLayout } from './ThumbnailLayout';

export function GalleryLayoutRouter({ layout = 'grid', photos = [], galleryId }) {
  switch (layout) {
    case 'slideshow':
      return <SlideshowLayout photos={photos} />;
    case 'thumbnail':
      return <ThumbnailLayout photos={photos} />;
    case 'justified':
    case 'grid':
    default:
      return <GridLayout photos={photos} layout={layout} />;
  }
}

// GridLayout - Masonry grid
export function GridLayout({ photos, layout = 'grid' }) {
  if (!photos.length) return <div className="text-center py-12 text-gray-500">No photos</div>;

  return (
    <div className={`grid gap-4 ${layout === 'justified' ? '' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
      {photos.map(photo => (
        <div key={photo.id} className="group cursor-pointer overflow-hidden rounded-lg bg-gray-200 relative h-64">
          <img
            src={photo.s3_key_medium || photo.s3_key_thumb}
            alt={photo.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {photo.title && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <h3 className="text-white font-semibold">{photo.title}</h3>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// SlideshowLayout - Full-screen carousel
export function SlideshowLayout({ photos }) {
  const [current, setCurrent] = React.useState(0);

  if (!photos.length) return <div className="text-center py-12">No photos</div>;

  const photo = photos[current];

  return (
    <div className="space-y-4">
      <div className="bg-black rounded-lg overflow-hidden flex items-center justify-center" style={{ height: '500px' }}>
        <img
          src={photo.s3_key_original || photo.s3_key_large}
          alt={photo.title}
          className="max-h-full max-w-full"
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrent(c => (c === 0 ? photos.length - 1 : c - 1))}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ← Previous
        </button>

        <span className="text-sm text-gray-600">
          {current + 1} / {photos.length}
        </span>

        <button
          onClick={() => setCurrent(c => (c === photos.length - 1 ? 0 : c + 1))}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Next →
        </button>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-2">
        {photos.map((p, idx) => (
          <img
            key={p.id}
            src={p.s3_key_thumb}
            alt=""
            onClick={() => setCurrent(idx)}
            className={`h-16 w-16 object-cover rounded cursor-pointer flex-shrink-0 border-2 ${
              idx === current ? 'border-blue-500' : 'border-gray-300'
            }`}
          />
        ))}
      </div>

      {photo.title && <p className="text-center text-lg font-semibold">{photo.title}</p>}
    </div>
  );
}

// ThumbnailLayout - Small thumbnails with expanded view
export function ThumbnailLayout({ photos }) {
  const [selected, setSelected] = React.useState(photos[0]?.id);

  if (!photos.length) return <div className="text-center py-12">No photos</div>;

  const selectedPhoto = photos.find(p => p.id === selected);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center" style={{ height: '500px' }}>
        <img
          src={selectedPhoto?.s3_key_large}
          alt={selectedPhoto?.title}
          className="max-h-full max-w-full"
        />
      </div>

      <div className="space-y-4">
        {selectedPhoto?.title && (
          <div>
            <h3 className="text-xl font-bold">{selectedPhoto.title}</h3>
            <p className="text-gray-600 text-sm mt-1">{selectedPhoto.description}</p>
          </div>
        )}

        <div className="space-y-2">
          <p className="font-semibold text-sm">Gallery</p>
          <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
            {photos.map(photo => (
              <div
                key={photo.id}
                onClick={() => setSelected(photo.id)}
                className={`cursor-pointer rounded overflow-hidden border-2 transition ${
                  photo.id === selected ? 'border-blue-500' : 'border-gray-300 hover:border-gray-400'
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

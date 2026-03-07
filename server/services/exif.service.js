async function extractExif(buffer) {
  try {
    const exifr = require('exifr');
    const exif = await exifr.parse(buffer, {
      pick: ['Make', 'Model', 'LensModel', 'FocalLength', 'FNumber', 'ExposureTime', 'ISO',
             'DateTimeOriginal', 'latitude', 'longitude'],
    });
    if (!exif) return {};
    return {
      make: exif.Make || null,
      model: exif.Model || null,
      lens: exif.LensModel || null,
      focalLength: exif.FocalLength ? `${Math.round(exif.FocalLength)}mm` : null,
      aperture: exif.FNumber ? `f/${exif.FNumber}` : null,
      shutterSpeed: exif.ExposureTime
        ? exif.ExposureTime < 1
          ? `1/${Math.round(1 / exif.ExposureTime)}s`
          : `${exif.ExposureTime}s`
        : null,
      iso: exif.ISO || null,
      takenAt: exif.DateTimeOriginal || null,
      gpsLat: exif.latitude || null,
      gpsLng: exif.longitude || null,
    };
  } catch {
    return {};
  }
}

module.exports = { extractExif };

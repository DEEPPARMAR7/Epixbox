export const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
  { value: 'unlisted', label: 'Unlisted' },
]

export const PRODUCT_CATEGORIES = ['print', 'digital', 'canvas', 'metal']

export const ORDER_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'cancelled']

export const CLOUDFRONT_DOMAIN = import.meta.env.VITE_CLOUDFRONT_DOMAIN || ''

export function photoUrl(key) {
  if (!key) return null
  if (CLOUDFRONT_DOMAIN) return `${CLOUDFRONT_DOMAIN}/${key}`
  return null
}

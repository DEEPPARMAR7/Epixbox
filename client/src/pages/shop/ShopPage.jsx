import { useState, useEffect } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import PublicLayout from '../../components/layout/PublicLayout'
import Spinner from '../../components/common/Spinner'
import { getPricingForPhoto } from '../../api/pricingApi'
import { useCart } from '../../hooks/useCart'
import { formatCurrency } from '../../utils/formatters'
import { PRODUCT_CATEGORIES } from '../../utils/constants'
import toast from 'react-hot-toast'

const DEMO_PRODUCTS = [
  { id: 'demo-print-1', category: 'prints', size: '8x10', paper_type: 'Lustre', price_cents: 1800, variants: [
    { id: 'var-1', name: '8x10 Lustre', price_multiplier: 1.0, specifications: { size: '8x10', finish: 'Lustre' } },
    { id: 'var-2', name: '8x10 Matte', price_multiplier: 1.0, specifications: { size: '8x10', finish: 'Matte' } },
  ] },
  { id: 'demo-print-2', category: 'prints', size: '11x14', paper_type: 'Fine Art', price_cents: 3200, variants: [
    { id: 'var-3', name: '11x14 Fine Art', price_multiplier: 1.0, specifications: { size: '11x14', finish: 'Fine Art' } },
  ] },
  { id: 'demo-digital-1', category: 'digital', size: 'Web Download', paper_type: '', price_cents: 2500, variants: [
    { id: 'var-4', name: 'Full Resolution JPEG', price_multiplier: 1.0, specifications: { format: 'JPEG' } },
    { id: 'var-5', name: 'Full Resolution RAW', price_multiplier: 1.5, specifications: { format: 'RAW' } },
  ] },
  { id: 'demo-album-1', category: 'albums', size: '10x10 Album', paper_type: 'Premium Layflat', price_cents: 7500, variants: [
    { id: 'var-6', name: '10x10 Premium Layflat', price_multiplier: 1.0, specifications: { size: '10x10', binding: 'Layflat' } },
  ] },
]

export default function ShopPage() {
  const { photoId } = useParams()
  const location = useLocation()
  const photoTitle = location.state?.photoTitle || 'Photo'
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const { addItem } = useCart()
  const [buyNowLoading, setBuyNowLoading] = useState(false)

  useEffect(() => {
    if (String(photoId || '').startsWith('demo-')) {
      setProducts(DEMO_PRODUCTS)
      setSelectedCategory(DEMO_PRODUCTS[0].category)
      setLoading(false)
      return
    }

    getPricingForPhoto(photoId)
      .then((prods) => {
        setProducts(prods)
        if (prods.length > 0) setSelectedCategory(prods[0].category)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [photoId])

  const categories = [...new Set(products.map((p) => p.category))]
  const filteredProducts = products.filter((p) => p.category === selectedCategory)

  const handleProductSelect = (product) => {
    setSelectedProduct(product)
    setSelectedVariant(null)
    if (product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0])
    }
  }

  const getDisplayPrice = () => {
    if (!selectedProduct) return 0
    if (!selectedVariant) return selectedProduct.price_cents
    const basePrice = selectedProduct.price_cents
    const multiplier = selectedVariant.price_multiplier || 1.0
    return Math.round(basePrice * multiplier)
  }

  const handleAddToCart = () => {
    if (String(photoId || '').startsWith('demo-')) {
      toast('This is a preview store. Start a trial to activate real selling.', { icon: '✨' })
      return
    }

    if (!selectedProduct) return
    const displayPrice = getDisplayPrice()
    addItem({
      id: selectedVariant ? `${selectedProduct.id}-${selectedVariant.id}` : `${selectedProduct.id}-${photoId}`,
      productId: selectedProduct.id,
      variant_id: selectedVariant?.id,
      photoId,
      photoTitle,
      productName: selectedVariant?.name || `${selectedProduct.size} ${selectedProduct.category}`,
      unit_price_cents: displayPrice,
      price_cents: displayPrice,
      paperType: selectedProduct.paper_type,
      quantity: 1,
    })
    toast.success('Added to cart!')
  }

  const handleBuyNow = async () => {
    if (String(photoId || '').startsWith('demo-')) {
      toast('This is a preview store. Start a trial to activate real selling.', { icon: '✨' })
      return
    }

    if (!selectedProduct) return

    setBuyNowLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/checkout/create-product-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          variantId: selectedVariant?.id,
          quantity: 1,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error(error.message || 'Failed to start checkout')
    } finally {
      setBuyNowLoading(false)
    }
  }

  const displayPrice = getDisplayPrice()

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <Helmet>
        <title>Buy Print — {photoTitle}</title>
      </Helmet>

      <div className="relative overflow-hidden px-4 py-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_hsl(var(--accent)/0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_hsl(205_70%_50%/0.08),_transparent_30%)]" />

        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <p className="font-heading text-[11px] uppercase tracking-[0.32em] text-muted-foreground mb-3">
              Shop
            </p>
            <h1 className="heading-lg text-foreground max-w-2xl">
              Order prints and digital products with a clean, studio-style checkout.
            </h1>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr),minmax(420px,0.92fr)]">
            <div className="premium-card overflow-hidden p-3 md:p-4">
              <div className="aspect-square overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white/15 text-8xl shadow-sm">
                📷
              </div>
              <div className="mt-5 px-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-muted-foreground">Selected photo</p>
                <h2 className="mt-2 text-2xl font-black text-foreground">{photoTitle}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Choose a product, add it to your cart, then finish payment through Stripe.
                </p>
              </div>
            </div>

            <div className="premium-card p-5 md:p-6">
              <h1 className="text-2xl md:text-3xl font-black text-foreground mb-3">
                {String(photoId || '').startsWith('demo-') ? 'Shop Preview' : 'Order a Print'}
              </h1>

              <p className="text-sm text-muted-foreground mb-6 max-w-xl">
                {String(photoId || '').startsWith('demo-')
                  ? 'This preview demonstrates the storefront and checkout flow before your account is activated.'
                  : 'Select the print or digital format you want, then proceed to secure payment.'}
              </p>

              {String(photoId || '').startsWith('demo-') && (
                <div className="mb-6 rounded-2xl border border-border/70 bg-accent/10 p-4 text-sm text-foreground">
                  This preview shows how print sales look before signup. Create an account to activate real products, checkout, and fulfillment.
                </div>
              )}

              {products.length === 0 ? (
                <p className="text-muted-foreground">No products available for this photo.</p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => { setSelectedCategory(cat); setSelectedProduct(null); setSelectedVariant(null) }}
                        className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] transition ${
                          selectedCategory === cat
                            ? 'bg-foreground text-background'
                            : 'bg-background text-foreground border border-border/70 hover:bg-muted'
                        }`}
                      >
                        {PRODUCT_CATEGORIES[cat] || cat}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3 mb-6">
                    {filteredProducts.map((product) => (
                      <label
                        key={product.id}
                        className={`flex items-center justify-between gap-4 p-4 rounded-2xl border cursor-pointer transition ${
                          selectedProduct?.id === product.id
                            ? 'border-foreground bg-foreground text-background shadow-[0_18px_50px_rgba(15,23,42,0.18)]'
                            : 'border-border/70 bg-background/80 hover:border-foreground/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="product"
                            checked={selectedProduct?.id === product.id}
                            onChange={() => handleProductSelect(product)}
                            className="text-indigo-600"
                          />
                          <div>
                            <p className="font-semibold text-sm md:text-base">{product.size}</p>
                            {product.paper_type && (
                              <p className={`text-xs md:text-sm ${selectedProduct?.id === product.id ? 'text-background/75' : 'text-muted-foreground'}`}>{product.paper_type}</p>
                            )}
                          </div>
                        </div>
                        <span className={`font-black ${selectedProduct?.id === product.id ? 'text-background' : 'text-foreground'}`}>
                          {formatCurrency(product.price_cents)}
                        </span>
                      </label>
                    ))}
                  </div>

                  {selectedProduct && selectedProduct.variants && selectedProduct.variants.length > 1 && (
                    <div className="mb-6">
                      <label className="text-sm font-semibold text-foreground mb-2 block">
                        Options
                      </label>
                      <div className="space-y-2">
                        {selectedProduct.variants.map((variant) => (
                          <label key={variant.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                            selectedVariant?.id === variant.id
                              ? 'border-foreground bg-foreground/5'
                              : 'border-border/50 bg-background/50 hover:border-foreground/30'
                          }`}>
                            <input
                              type="radio"
                              name="variant"
                              checked={selectedVariant?.id === variant.id}
                              onChange={() => setSelectedVariant(variant)}
                              className="text-indigo-600"
                            />
                            <span className="flex-1 text-sm font-medium">{variant.name}</span>
                            {variant.price_multiplier && variant.price_multiplier !== 1.0 && (
                              <span className="text-xs text-muted-foreground">
                                {variant.price_multiplier > 1 ? '+' : ''}{((variant.price_multiplier - 1) * 100).toFixed(0)}%
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <button
                      onClick={handleBuyNow}
                      disabled={!selectedProduct || buyNowLoading}
                      className="btn-cta w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {buyNowLoading
                        ? 'Loading...'
                        : String(photoId || '').startsWith('demo-')
                          ? 'Start Free Trial to Sell Prints'
                          : selectedProduct
                            ? `Buy Now — ${formatCurrency(displayPrice)}`
                            : 'Select a product'}
                    </button>
                    <button
                      onClick={handleAddToCart}
                      disabled={!selectedProduct}
                      className="btn-secondary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {selectedProduct
                        ? `Add to Cart — ${formatCurrency(displayPrice)}`
                        : 'Select a product'}
                    </button>
                  </div>

                  {String(photoId || '').startsWith('demo-') && (
                    <Link to="/signup" className="mt-3 block text-center text-sm text-foreground/70 hover:text-foreground">
                      Start Free Trial
                    </Link>
                  )}

                  <Link to="/cart" className="mt-3 block text-center text-sm text-foreground/70 hover:text-foreground">
                    View Cart
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

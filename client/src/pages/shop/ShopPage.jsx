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
  { id: 'demo-print-1', category: 'prints', size: '8x10', paper_type: 'Lustre', price_cents: 1800 },
  { id: 'demo-print-2', category: 'prints', size: '11x14', paper_type: 'Fine Art', price_cents: 3200 },
  { id: 'demo-digital-1', category: 'digital', size: 'Web Download', paper_type: '', price_cents: 2500 },
  { id: 'demo-album-1', category: 'albums', size: '10x10 Album', paper_type: 'Premium Layflat', price_cents: 7500 },
]

export default function ShopPage() {
  const { photoId } = useParams()
  const location = useLocation()
  const photoTitle = location.state?.photoTitle || 'Photo'
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const { addItem } = useCart()

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

  const handleAddToCart = () => {
    if (String(photoId || '').startsWith('demo-')) {
      toast('This is a preview store. Start a trial to activate real selling.', { icon: '✨' })
      return
    }

    if (!selectedProduct) return
    addItem({
      id: `${selectedProduct.id}-${photoId}`,
      productId: selectedProduct.id,
      photoId,
      photoTitle,
      productName: `${selectedProduct.size} ${selectedProduct.category}`,
      price_cents: selectedProduct.price_cents,
      paperType: selectedProduct.paper_type,
      quantity: 1,
    })
    toast.success('Added to cart!')
  }

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

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Photo Preview */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center text-gray-300 text-8xl shadow-sm">
              📷
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-900">{photoTitle}</h2>
          </div>

          {/* Product Selector */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              {String(photoId || '').startsWith('demo-') ? 'Shop Preview' : 'Order a Print'}
            </h1>

            {String(photoId || '').startsWith('demo-') && (
              <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
                This preview shows how print sales look before signup. Create an account to activate real products, checkout, and fulfillment.
              </div>
            )}

            {products.length === 0 ? (
              <p className="text-gray-500">No products available for this photo.</p>
            ) : (
              <>
                {/* Category tabs */}
                <div className="flex gap-2 mb-6 flex-wrap">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setSelectedProduct(null) }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        selectedCategory === cat
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {PRODUCT_CATEGORIES[cat] || cat}
                    </button>
                  ))}
                </div>

                {/* Products */}
                <div className="space-y-3 mb-8">
                  {filteredProducts.map((product) => (
                    <label
                      key={product.id}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${
                        selectedProduct?.id === product.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="product"
                          checked={selectedProduct?.id === product.id}
                          onChange={() => setSelectedProduct(product)}
                          className="text-indigo-600"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{product.size}</p>
                          {product.paper_type && (
                            <p className="text-sm text-gray-500">{product.paper_type}</p>
                          )}
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(product.price_cents)}
                      </span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!selectedProduct}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {String(photoId || '').startsWith('demo-')
                    ? 'Start Free Trial to Sell Prints'
                    : selectedProduct
                      ? `Add to Cart — ${formatCurrency(selectedProduct.price_cents)}`
                      : 'Select a product'}
                </button>

                {String(photoId || '').startsWith('demo-') && (
                  <Link to="/signup" className="block text-center mt-3 text-sm text-indigo-600 hover:underline">
                    Start Free Trial
                  </Link>
                )}

                <Link to="/cart" className="block text-center mt-3 text-sm text-indigo-600 hover:underline">
                  View Cart
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

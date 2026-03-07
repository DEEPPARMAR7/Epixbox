import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Spinner from '../../components/common/Spinner'
import { getPriceLists, createPriceList, deletePriceList, getProducts, createProduct, deleteProduct } from '../../api/pricingApi'
import { formatCurrency } from '../../utils/formatters'

const CATEGORIES = ['print', 'digital', 'canvas', 'metal']

export default function PricingEditorPage() {
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeList, setActiveList] = useState(null)
  const [products, setProducts] = useState([])
  const [showCreateList, setShowCreateList] = useState(false)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [listName, setListName] = useState('')
  const [productForm, setProductForm] = useState({ category: 'print', name: '', width_in: '', height_in: '', paper_type: '', price_cents: '' })

  const loadLists = async () => {
    try {
      const data = await getPriceLists()
      setLists(data)
      if (data.length && !activeList) {
        setActiveList(data[0])
        setProducts(data[0].Products || [])
      }
    } catch { toast.error('Failed to load price lists') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadLists() }, [])

  const selectList = (list) => {
    setActiveList(list)
    setProducts(list.Products || [])
  }

  const handleCreateList = async (e) => {
    e.preventDefault()
    if (!listName.trim()) return
    try {
      const newList = await createPriceList({ name: listName })
      setLists(l => [...l, { ...newList, Products: [] }])
      setListName('')
      setShowCreateList(false)
      toast.success('Price list created')
    } catch { toast.error('Failed to create price list') }
  }

  const handleDeleteList = async (id) => {
    if (!confirm('Delete this price list and all its products?')) return
    try {
      await deletePriceList(id)
      setLists(l => l.filter(x => x.id !== id))
      if (activeList?.id === id) { setActiveList(null); setProducts([]) }
      toast.success('Price list deleted')
    } catch { toast.error('Failed to delete') }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    if (!activeList) return
    const priceCents = Math.round(parseFloat(productForm.price_cents) * 100)
    if (isNaN(priceCents) || priceCents <= 0) return toast.error('Enter a valid price')
    try {
      const p = await createProduct(activeList.id, { ...productForm, price_cents: priceCents, width_in: productForm.width_in || null, height_in: productForm.height_in || null })
      setProducts(prev => [...prev, p])
      setShowAddProduct(false)
      setProductForm({ category: 'print', name: '', width_in: '', height_in: '', paper_type: '', price_cents: '' })
      toast.success('Product added')
    } catch { toast.error('Failed to add product') }
  }

  const handleDeleteProduct = async (pid) => {
    if (!confirm('Delete this product?') || !activeList) return
    try {
      await deleteProduct(activeList.id, pid)
      setProducts(p => p.filter(x => x.id !== pid))
      toast.success('Product deleted')
    } catch { toast.error('Failed to delete product') }
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Print Pricing</h1>
        <Button onClick={() => setShowCreateList(true)}>+ New Price List</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <div className="flex gap-6">
          {/* List sidebar */}
          <div className="w-52 flex-shrink-0">
            <div className="space-y-1">
              {lists.map(list => (
                <button
                  key={list.id}
                  onClick={() => selectList(list)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${activeList?.id === list.id ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  {list.name}
                </button>
              ))}
              {lists.length === 0 && (
                <p className="text-sm text-gray-400 px-3">No price lists yet.</p>
              )}
            </div>
          </div>

          {/* Products */}
          <div className="flex-1">
            {activeList ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-gray-900">{activeList.name}</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleDeleteList(activeList.id)}>Delete List</Button>
                    <Button size="sm" onClick={() => setShowAddProduct(true)}>+ Add Product</Button>
                  </div>
                </div>
                {products.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <p>No products yet. Add your first print option.</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-gray-500 font-medium pb-3 pr-4">Product</th>
                        <th className="text-left text-gray-500 font-medium pb-3 pr-4">Category</th>
                        <th className="text-left text-gray-500 font-medium pb-3 pr-4">Size</th>
                        <th className="text-left text-gray-500 font-medium pb-3 pr-4">Price</th>
                        <th className="pb-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id} className="border-b border-gray-50">
                          <td className="py-3 pr-4 font-medium">{p.name}</td>
                          <td className="py-3 pr-4 capitalize text-gray-500">{p.category}</td>
                          <td className="py-3 pr-4 text-gray-500">
                            {p.width_in && p.height_in ? `${p.width_in}" × ${p.height_in}"` : '—'}
                          </td>
                          <td className="py-3 pr-4 font-semibold">{formatCurrency(p.price_cents)}</td>
                          <td className="py-3 text-right">
                            <button onClick={() => handleDeleteProduct(p.id)} className="text-xs text-red-500 hover:underline">Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">Select a price list or create one to get started.</div>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={showCreateList} onClose={() => setShowCreateList(false)} title="New Price List" size="sm">
        <form onSubmit={handleCreateList} className="space-y-4">
          <input value={listName} onChange={e => setListName(e.target.value)} placeholder="e.g. Standard Prints" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowCreateList(false)}>Cancel</Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showAddProduct} onClose={() => setShowAddProduct(false)} title="Add Product">
        <form onSubmit={handleAddProduct} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={productForm.category} onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. 5x7 Print" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Width (inches)</label>
              <input type="number" step="0.5" value={productForm.width_in} onChange={e => setProductForm(f => ({ ...f, width_in: e.target.value }))} placeholder="5" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (inches)</label>
              <input type="number" step="0.5" value={productForm.height_in} onChange={e => setProductForm(f => ({ ...f, height_in: e.target.value }))} placeholder="7" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paper Type</label>
              <input value={productForm.paper_type} onChange={e => setProductForm(f => ({ ...f, paper_type: e.target.value }))} placeholder="Lustre" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
              <input type="number" step="0.01" min="0" value={productForm.price_cents} onChange={e => setProductForm(f => ({ ...f, price_cents: e.target.value }))} placeholder="12.99" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowAddProduct(false)}>Cancel</Button>
            <Button type="submit">Add Product</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}

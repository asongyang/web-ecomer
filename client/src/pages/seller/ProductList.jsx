import React, { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { categories, assets } from '../../assets/assets'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

const ProductList = () => {
  const { t } = useTranslation();

  const { products, currency, axios, fetchProducts, searchQuery } = useAppContext()
  const [deleteModal, setDeleteModal] = useState(null)

  const [editModal, setEditModal] = useState(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    category: '',
    barcode: '',
    price: '',
    offerPrice: '',
    stock: ''
  })
  const [newFiles, setNewFiles] = useState([null, null, null, null])

  const handleEditClick = (product) => {
    setEditModal(product)
    setNewFiles([null, null, null, null])
    setEditFormData({
      name: product.name || '',
      description: Array.isArray(product.description) ? product.description.join('\n') : (product.description || ''),
      category: Array.isArray(product.category) ? product.category[0] : (product.category || ''),
      barcode: product.barcode || '',
      price: product.price || '',
      offerPrice: product.offerPrice || '',
      stock: product.stock || ''
    })
  }

  const handleNewFile = (index, file) => {
    if (!file) return
    setNewFiles(prev => {
      const updated = [...prev]
      updated[index] = file
      return updated
    })
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditFormData(prev => ({ ...prev, [name]: value }))
  }

  const submitEdit = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('id', editModal._id)
      Object.entries(editFormData).forEach(([key, value]) => {
        formData.append(key, value)
      })
      // Attach any new image files
      newFiles.forEach((file, i) => {
        if (file) formData.append(`image${i}`, file)
      })

      const { data } = await axios.post('/api/product/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if(data.success) { 
        toast.success(data.message || t('manager.productUpdated', "Product Updated"))
        await fetchProducts()
        setEditModal(null)
        setNewFiles([null, null, null, null])
      } else {
        toast.error(data.message)
      }
    } catch(err) { 
      toast.error(err.message)
    }
  }

  const handleDeleteClick = (product) => {
    setDeleteModal(product)
  }

  const removeImage = async (imageUrl) => {
    try {
      const { data } = await axios.post('/api/product/delete-image', { id: editModal._id, imageUrl })
      if (data.success) {
        toast.success(t('manager.imageDeleted', "Image deleted"))
        // Update local modal state so UI reflects the removal immediately
        setEditModal(prev => ({ ...prev, image: data.images }))
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  const confirmDelete = async () => {
    if (!deleteModal) return
    try {
      const { data } = await axios.post('/api/product/delete', { id: deleteModal._id })
      if (data.success) {
        toast.success(data.message || t('manager.productDeleted', "Product Deleted"))
        await fetchProducts()
        setDeleteModal(null)
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  const toggleStock = async (id, currentStock) => {
    try {
      const { data } = await axios.post('/api/product/stock', { id, inStock: !currentStock })
      if (data.success) {
        toast.success(t('manager.stockUpdated', "Stock status updated"))
        await fetchProducts()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const filteredProducts = products.filter(product => {
    if (!searchQuery || typeof searchQuery !== 'string') return true
    return product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (product.barcode && product.barcode.toLowerCase().includes(searchQuery.toLowerCase()))
  })

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <h2 className="pb-4 text-lg font-medium">{t('manager.allProducts', 'All Products')}</h2>

      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" />
          </svg>
          <p className="text-base">{searchQuery ? t('manager.noProductsFound', "No products found matching your search.") : t('manager.noProductsYet', "No products yet. Add your first product!")}</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-md bg-white border border-gray-500/20">
          <table className="w-full table-auto text-sm">
            <thead className="text-gray-700 bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">{t('manager.product', 'Product')}</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">{t('manager.category', 'Category')}</th>
                <th className="px-4 py-3 font-semibold hidden lg:table-cell">{t('manager.barcode', 'Barcode')}</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">{t('manager.price', 'Price')}</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">{t('manager.offer', 'Offer')}</th>
                <th className="px-4 py-3 font-semibold hidden lg:table-cell">{t('manager.stock', 'Stock')}</th>
                <th className="px-4 py-3 font-semibold">{t('manager.inStock', 'In Stock')}</th>
                <th className="px-4 py-3 font-semibold text-center">{t('manager.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="text-gray-500 divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                  {/* Product image + name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="border border-gray-200 rounded p-1.5 flex-shrink-0">
                        <img
                          src={product.image?.[0]}
                          alt={product.name}
                          className="w-12 h-12 object-cover"
                        />
                      </div>
                      <span className="font-medium text-gray-700 truncate max-w-[120px] md:max-w-xs">
                        {product.name}
                      </span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    {Array.isArray(product.category) ? product.category.join(', ') : product.category}
                  </td>

                  {/* Barcode */}
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-400 font-mono text-xs">
                    {product.barcode || <span className="italic">—</span>}
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    {currency}{product.price}
                  </td>

                  {/* Offer Price */}
                  <td className="px-4 py-3 hidden md:table-cell text-primary font-medium">
                    {currency}{product.offerPrice}
                  </td>

                  {/* Stock Qty */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${(product.stock ?? 0) > 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600'
                      }`}>
                      {product.stock ?? 0}
                    </span>
                  </td>

                  {/* In Stock toggle */}
                  <td className="px-4 py-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={product.inStock}
                        onChange={() => toggleStock(product._id, product.inStock)}
                      />
                      <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-primary transition-colors duration-200"></div>
                      <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                    </label>
                  </td>

                  {/* Actions (Edit / Delete) */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleEditClick(product)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Edit Product"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete Product"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2px] shadow-2xl w-[380px] max-w-[90%] p-8 text-center animate-fadeIn transform transition-all">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full  border-[3px] border-red-100 mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-2">{t('manager.areYouSure', 'Are you sure?')}</h3>

            <p className="text-gray-500 mb-1 text-sm">
              {t('manager.deleteConfirmProduct', 'Are you sure you want to delete this product?')} "<span className="font-semibold text-gray-800">{deleteModal.name}</span>"
            </p>
            <p className="text-gray-400 text-xs mb-8">{t('manager.permanentAction', 'This action cannot be undone.')}</p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium shadow-sm"
              >
                {t('manager.cancel', 'Cancel')}
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-[#e60000] rounded-md text-white flex items-center justify-center gap-2 hover:bg-red-700 transition-colors font-medium shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {t('manager.deleteItem', 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2px] shadow-2xl w-[500px] max-w-[95%] p-5 animate-fadeIn transform transition-all max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-800 text-center w-full mb-4 mt-1">{t('manager.editProduct', 'Edit Product')}</h3>

            <form onSubmit={submitEdit} className="space-y-3 text-left">

              {/* Image Preview */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">{t('manager.productImage', 'Product Image')}</label>
                <div className="flex gap-3 flex-wrap">
                  {Array(4).fill('').map((_, index) => {
                    const existingImg = editModal.image && editModal.image[index]
                    const newFile = newFiles[index]
                    const previewSrc = newFile ? URL.createObjectURL(newFile) : existingImg
                    return (
                      <div key={index} className="relative border border-gray-200 rounded-md p-1 bg-white shadow-sm flex-shrink-0 w-[60px] h-[60px] flex items-center justify-center overflow-hidden">
                        {previewSrc ? (
                          <label className="cursor-pointer w-full h-full flex items-center justify-center">
                            <img
                              src={previewSrc}
                              alt={`Product Preview ${index + 1}`}
                              className="w-[48px] h-[48px] object-cover rounded"
                            />
                            <input
                              type="file"
                              hidden
                              accept="image/*"
                              onChange={(e) => handleNewFile(index, e.target.files[0])}
                            />
                          </label>
                        ) : (
                          <label className="cursor-pointer w-12 h-12 flex items-center justify-center rounded overflow-hidden">
                            <img src={assets.upload_area} alt="Upload Template" className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity" />
                            <input 
                              type="file" 
                              hidden 
                              accept="image/*"
                              onChange={(e) => handleNewFile(index, e.target.files[0])}
                            />
                          </label>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t('manager.productNameLabel', 'Product Name')}</label>
                <input type="text" name="name" value={editFormData.name} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-primary" required />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t('manager.productDescription', 'Product Description')}</label>
                <textarea name="description" value={editFormData.description} onChange={handleEditChange} rows={2} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-primary resize-none" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t('manager.category', 'Category')}</label>
                  <select name="category" value={editFormData.category} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-primary">
                    <option value="">{t('manager.selectCategory', 'Select Category')}</option>
                    {categories.map((item, idx) => (
                      <option key={idx} value={item.path}>{item.path}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t('manager.barcode', 'Barcode')}</label>
                  <input type="text" name="barcode" value={editFormData.barcode} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-primary" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t('manager.productPrice', 'Product Price')}</label>
                  <input type="number" name="price" value={editFormData.price} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-primary" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t('manager.offerPrice', 'Offer Price')}</label>
                  <input type="number" name="offerPrice" value={editFormData.offerPrice} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-primary" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t('manager.stockQty', 'Stock Qty')}</label>
                  <input type="number" name="stock" value={editFormData.stock} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-primary" required />
                </div>
              </div>

              <div className="flex gap-4 mt-5 pt-3">
                <button type="button" onClick={() => setEditModal(null)} className="flex-1 px-4 py-2 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">
                  {t('manager.cancel', 'Cancel')}
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-[#0F172A] text-white rounded hover:bg-gray-800 transition-colors text-sm font-medium flex items-center justify-center gap-2 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-[16px] w-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('manager.save', 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductList

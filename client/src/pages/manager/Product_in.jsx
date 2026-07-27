import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

function Product_in() {
  const { t } = useTranslation();
  const { productIns, currency, axios, fetchProductIns, convertPrice } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    costPrice: '',
    company: '',
    country: ''
  });
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [importToDelete, setImportToDelete] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();

      const submitData = { ...formData };
      if (editingId) submitData.id = editingId;

      payload.append('productData', JSON.stringify(submitData));
      for (let i = 0; i < files.length; i++) {
        if (files[i]) {
          payload.append(`image${i}`, files[i]);
        }
      }

      const endpoint = editingId ? '/api/product-in/update' : '/api/product-in/add';
      const { data } = await axios.post(endpoint, payload);
      if (data.success) {
        toast.success(editingId ? t('manager.importUpdated', "Product import updated successfully!") : t('manager.importAdded', "Product import added successfully!"));
        setFormData({ productName: '', quantity: '', costPrice: '', company: '', country: '' });
        setFiles([]);
        setExistingImages([]);
        setEditingId(null);
        setIsModalOpen(false);
        fetchProductIns(); // refresh the list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    if (!importToDelete) return;
    try {
      const { data } = await axios.post('/api/product-in/delete', { id: importToDelete });
      if (data.success) {
        toast.success(t('manager.importDeleted', "Product import deleted."));
        fetchProductIns();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setImportToDelete(null);
    }
  };

  const openEditModal = (item) => {
    setEditingId(item._id);
    setFormData({
      productName: item.productName,
      quantity: item.quantity,
      costPrice: item.costPrice,
      company: item.company || '',
      country: item.country || ''
    });
    // Cloudinary images can't easily be converted back to File objects in standard form files
    // We show them via existingImages state
    setExistingImages(item.images || []);
    setFiles([]);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ productName: '', quantity: '', costPrice: '', company: '', country: '' });
    setFiles([]);
    setExistingImages([]);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10 relative">

      {/* Delete Confirmation Modal */}
      {importToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2px] shadow-2xl w-[380px] max-w-full p-8 text-center animate-in fade-in zoom-in duration-200">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full border-[3px] border-red-100 mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-2">{t('manager.areYouSure', 'Are you sure?')}</h3>

            <p className="text-gray-500 mb-1 text-sm">
              {t('manager.deleteConfirmText1', 'Do you really want to delete this import record?')}
            </p>
            <p className="text-gray-400 text-xs mb-8">{t('manager.deleteConfirmText2', 'This action cannot be undone.')}</p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setImportToDelete(null)}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium shadow-sm cursor-pointer"
              >
                {t('manager.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-[#e60000] rounded-md text-white flex items-center justify-center gap-2 hover:bg-red-700 transition-colors font-medium shadow-sm cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {t('manager.delete', 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-gray-800 uppercase inline-block relative pb-2">
          {t('manager.productImports', 'Product Imports')}
          <span className="absolute bottom-0 left-0 w-16 h-1 bg-primary"></span>
        </h2>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ productName: '', quantity: '', costPrice: '', company: '', country: '' });
            setFiles([]);
            setExistingImages([]);
            setIsModalOpen(true);
          }}
          className="bg-primary hover:bg-primary-dull text-white text-sm px-4 py-2 rounded-[30px] font-medium transition-colors shadow-sm cursor-pointer"
        >
          {t('manager.addImport', '+ Add Import')}
        </button>
      </div>

      {/* Table Section */}
      {!productIns || productIns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
          <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
          <p className="text-base">{t('manager.noImports', 'No imported products recorded yet.')}</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-md bg-white border border-gray-200 shadow-sm">
          <table className="w-full table-auto text-sm text-left">
            <thead className="text-gray-700 bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">{t('manager.date', 'Date')}</th>
                <th className="px-6 py-4 font-semibold">{t('manager.productName', 'Product Name')}</th>
                <th className="px-6 py-4 font-semibold">{t('manager.company', 'Company')}</th>
                <th className="px-6 py-4 font-semibold">{t('manager.country', 'Country')}</th>
                <th className="px-6 py-4 font-semibold text-right">{t('manager.quantity', 'Quantity')}</th>
                <th className="px-6 py-4 font-semibold text-right">{t('manager.costPrice', 'Cost Price')}</th>
                <th className="px-6 py-4 font-semibold text-right">{t('manager.total', 'Total')}</th>
                <th className="px-6 py-4 font-semibold text-center">{t('manager.action', 'Action')}</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 divide-y divide-gray-100">
              {productIns.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    <div className="flex items-center gap-3">
                      {item.images && item.images.length > 0 && (
                        <img src={item.images[0]} alt="" className="w-10 h-10 object-cover rounded border border-gray-200" />
                      )}
                      <span>{item.productName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.company || '-'}
                  </td>
                  <td className="px-6 py-4">
                    {item.country || '-'}
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {currency}{convertPrice(item.costPrice).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-primary">
                    {currency}{convertPrice(item.quantity * item.costPrice).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEditModal(item)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors cursor-pointer" title="Edit">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                      </button>
                      <button onClick={() => setImportToDelete(item._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer" title="Delete">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-lg text-gray-800">{editingId ? t('manager.editProductImport', "Edit Product Import") : t('manager.addProductImport', "Add Product Import")}</h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto no-scrollbar">

              {/* Image Upload Section */}
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">{t('manager.productImages', 'Product Images')}</p>
                <div className="flex flex-wrap items-center gap-3">
                  {Array(4).fill('').map((_, index) => (
                    <label key={index} htmlFor={`image${index}`} className="flex-shrink-0">
                      <input
                        onChange={(e) => {
                          const updatedFiles = [...files];
                          updatedFiles[index] = e.target.files[0];
                          setFiles(updatedFiles);
                        }}
                        accept="image/*"
                        type="file"
                        id={`image${index}`}
                        hidden
                      />
                      <img
                        className="w-16 h-16 object-cover border border-dashed border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition-colors"
                        src={files[index] ? URL.createObjectURL(files[index]) : (existingImages[index] || assets.upload_area)}
                        alt="uploadArea"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('manager.productNameLabel', 'Product Name *')}</label>
                <input
                  type="text"
                  name="productName"
                  required
                  value={formData.productName}
                  onChange={handleInputChange}
                  placeholder="e.g. iPhone 15 Pro"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-shadow"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('manager.quantityLabel', 'Quantity *')}</label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('manager.costPerUnit', 'Cost / Unit')} ({currency}) *</label>
                  <input
                    type="number"
                    name="costPrice"
                    min="0"
                    step="0.01"
                    required
                    value={formData.costPrice}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-shadow"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('manager.companyLabel', 'Company *')}</label>
                  <input
                    type="text"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="e.g. Apple Inc."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('manager.countryLabel', 'Country *')}</label>
                  <input
                    type="text"
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="e.g. USA"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none transition-shadow"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium cursor-pointer"
                >
                  {t('manager.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dull text-white rounded-md transition-colors font-medium shadow-sm cursor-pointer"
                >
                  {editingId ? t('manager.updateImport', "Update Import") : t('manager.saveImport', "Save Import")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Product_in;
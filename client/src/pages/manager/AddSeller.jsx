import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const AddSeller = () => {
  const { t } = useTranslation();
  const [sellers, setSellers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sellerToDelete, setSellerToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    email: '',
    password: ''
  });

  const fetchSellers = async () => {
    try {
      const { data } = await axios.get('/api/manager/seller/all');
      if (data.success) {
        setSellers(data.sellers);
      }
    } catch (error) {
      console.error(error);
      toast.error(t('manager.fetchSellersError', 'Cannot fetch sellers data'));
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSeller = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/manager/seller/add', formData);
      if (data.success) {
        toast.success(t('manager.addSellerSuccess', 'Seller added successfully'));
        setIsModalOpen(false);
        setFormData({ name: '', email: '', password: '' });
        fetchSellers();
      } else {
        toast.error(data.message || t('manager.errorOccurred', 'An error occurred'));
      }
    } catch (error) {
      console.error(error);
      toast.error(t('manager.addSellerError', 'Error adding seller'));
    }
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSeller = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/manager/seller/edit', editFormData);
      if (data.success) {
        toast.success(t('manager.editSellerSuccess', 'Seller updated successfully'));
        setIsEditModalOpen(false);
        setEditFormData({ id: '', name: '', email: '', password: '' });
        fetchSellers();
      } else {
        toast.error(data.message || t('manager.errorOccurred', 'An error occurred'));
      }
    } catch (error) {
      console.error(error);
      toast.error(t('manager.editSellerError', 'Error updating seller'));
    }
  };

  const openEditModal = (seller) => {
    setEditFormData({
      id: seller._id,
      name: seller.name,
      email: seller.email,
      password: ''
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sellerToDelete) return;
    try {
      const { data } = await axios.post('/api/manager/seller/delete', { id: sellerToDelete });
      if (data.success) {
        toast.success(t('manager.deleteSellerSuccess', 'Seller deleted successfully'));
        fetchSellers();
      } else {
        toast.error(data.message || t('manager.errorOccurred', 'An error occurred'));
      }
    } catch (error) {
      console.error(error);
      toast.error(t('manager.deleteSellerError', 'Error deleting seller'));
    } finally {
      setSellerToDelete(null);
    }
  };

  return (
    <div className="no-screellbar flex-1 h-[95vh] overflow-y-screell p-4 md:p-10 bg-gray-50/30">
      {/* Delete Confirmation Modal */}
      {sellerToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2px] shadow-2xl w-[380px] max-w-full p-8 text-center animate-in fade-in zoom-in duration-200">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full border-[3px] border-red-100 mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-2">{t('manager.areYouSure', 'Are you sure?')}</h3>

            <p className="text-gray-500 mb-1 text-sm">
              {t('manager.deleteConfirmSeller', 'Are you sure you want to delete this seller account?')}
            </p>
            <p className="text-gray-400 text-xs mb-8">{t('manager.deleteConfirmText2', 'This action cannot be undone.')}</p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setSellerToDelete(null)}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium shadow-sm cursor-pointer"
              >
                {t('manager.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleDeleteConfirm}
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
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t('manager.sellersTitle', 'Sellers')}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('manager.sellersDesc', 'Manage all seller accounts in the system')}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-black text-white px-5 py-2.5 rounded-[30px] font-medium hover:bg-gray-800 transition shadow-md flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          {t('manager.addNewSeller', 'Add New Seller')}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                <th className="p-4 font-medium whitespace-nowrap">{t('manager.sellerName', 'Name')}</th>
                <th className="p-4 font-medium whitespace-nowrap">{t('manager.sellerEmail', 'Email')}</th>
                <th className="p-4 font-medium whitespace-nowrap">{t('manager.addedDate', 'Added Date')}</th>
                <th className="p-4 font-medium whitespace-nowrap text-center">{t('manager.action', 'Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sellers.length > 0 ? (
                sellers.map((seller, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-800 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold border border-pink-200">
                        {seller.name.charAt(0).toUpperCase()}
                      </div>
                      {seller.name}
                    </td>
                    <td className="p-4 text-gray-600">{seller.email}</td>
                    <td className="p-4 text-gray-600 text-sm">
                      {new Date(seller.createdAt).toLocaleDateString('lo-LA', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => openEditModal(seller)}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded transition-colors mr-2"
                        title={t('manager.edit', 'Edit')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setSellerToDelete(seller._id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                        title={t('manager.delete', 'Delete')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-lg font-medium">{t('manager.noSellersFound', 'No Sellers Found')}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Seller Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">{t('manager.addNewSeller', 'Add New Seller')}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition p-1 rounded hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddSeller}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('manager.sellerName', 'Name')}</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                    placeholder={t('manager.enterSellerName', 'Enter seller name')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('manager.sellerEmail', 'Email')}</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                    placeholder="example@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('manager.password', 'Password')}</label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  {t('manager.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition shadow-sm"
                >
                  {t('manager.save', 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Seller Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">{t('manager.editSeller', 'Edit Seller')}</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition p-1 rounded hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSeller}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('manager.sellerName', 'Name')}</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={editFormData.name}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                    placeholder={t('manager.enterSellerName', 'Enter seller name')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('manager.sellerEmail', 'Email')}</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={editFormData.email}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                    placeholder="example@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('manager.password', 'Password')} <span className="text-gray-400 font-normal text-xs">({t('manager.leaveBlankToKeep', 'Leave blank to keep current')})</span></label>
                  <input
                    type="password"
                    name="password"
                    value={editFormData.password}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  {t('manager.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition shadow-sm"
                >
                  {t('manager.save', 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddSeller;
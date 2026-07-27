import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const Member = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('/api/user/all');
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.log(error);
      toast.error(t('manager.fetchUsersError', 'Failed to fetch users'));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="no-screellbar flex-1 h-[95vh] overflow-y-screell p-4 md:p-10 bg-gray-50/30">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t('manager.membersTitle', 'Members')}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('manager.membersDesc', 'All users in the system')}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                <th className="p-4 font-medium whitespace-nowrap">{t('manager.profile', 'Profile')}</th>
                <th className="p-4 font-medium whitespace-nowrap">{t('manager.name', 'Name')}</th>
                <th className="p-4 font-medium whitespace-nowrap">{t('manager.email', 'Email')}</th>
                <th className="p-4 font-medium whitespace-nowrap">{t('manager.cartItems', 'Cart Items')}</th>
                <th className="p-4 font-medium whitespace-nowrap">{t('manager.joinedDate', 'Joined Date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length > 0 ? (
                users.map((user, index) => {
                  // Calculate total items in cart
                  let cartCount = 0;
                  if (user.cartItems) {
                    for (const item in user.cartItems) {
                      if (user.cartItems[item] > 0) {
                        cartCount++;
                      }
                    }
                  }

                  return (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                          {user.profileImage ? (
                            <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-medium text-gray-800">{user.name}</td>
                      <td className="p-4 text-gray-600">{user.email}</td>
                      <td className="p-4 text-gray-600">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {cartCount} {t('manager.items', 'items')}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 text-sm">
                        {new Date(user.createdAt).toLocaleDateString('lo-LA', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="text-lg font-medium">{t('manager.noUsersFound', 'No Users Found')}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Member;
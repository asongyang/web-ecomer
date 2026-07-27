import React, { useEffect, useState, useRef } from 'react'
import { useAppContext } from '../context/AppContext'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

const Icons = {
  User: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Mail: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Lock: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  Box: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  Cart: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  MapPin: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  ShoppingBag: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
}

const Profile = () => {
  const { t } = useTranslation()
  const { user, setUser, axios, navigate, getUserData } = useAppContext()
  const [addresses, setAddresses] = useState([])
  const [orders, setOrders] = useState([])
  const [loadingAddr, setLoadingAddr] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [activeTab, setActiveTab] = useState('info')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  // Handle profile image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('profileImage', file)

      const { data } = await axios.post('/api/user/update-profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (data.success) {
        setUser(prev => ({ ...prev, profileImage: data.profileImage }))
        toast.success('Profile image updated!')
      } else {
        toast.error(data.message || 'Upload failed')
      }
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      const { data } = await axios.post('/api/address/get')
      if (data.success) setAddresses(data.addresses)
    } catch (err) {
      console.log(err)
    } finally {
      setLoadingAddr(false)
    }
  }

  // Fetch recent orders
  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/api/order/user')
      if (data.success) setOrders(data.orders.slice(0, 3))
    } catch (err) {
      console.log(err)
    } finally {
      setLoadingOrders(false)
    }
  }

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }
    fetchAddresses()
    fetchOrders()
  }, [user])

  const logout = async () => {
    try {
      const { data } = await axios.get('/api/user/logout')
      if (data.success) {
        setUser(null)
        toast.success('Logged out successfully')
        navigate('/')
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (!user) return null

  // Get initials from user name
  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const tabs = [
    { id: 'info', label: t('profile.accountInfo', 'Account Info'), icon: <Icons.User className="w-4 h-4" /> },
    { id: 'addresses', label: t('profile.addresses', 'Addresses'), icon: <Icons.MapPin className="w-4 h-4" /> },
    { id: 'orders', label: t('profile.recentOrders', 'Recent Orders'), icon: <Icons.Box className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen  py-10 pb-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden mb-8 mx-6 md:mx-16 lg:mx-24 xl:mx-32 rounded-[2px]"
        style={{ background: 'linear-gradient(135deg, #4fbf8b 0%, #2d9e6e 60%, #1a7a52 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative px-8 py-10 flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar - clickable to upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className="flex-shrink-0 w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40 flex items-center justify-center shadow-xl cursor-pointer relative group overflow-hidden"
            title="Click to change profile picture"
          >
            {user.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover rounded-full" />
            ) : (
              <span className="text-white text-3xl font-bold">{initials}</span>
            )}
            {/* Camera overlay on hover */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
              {uploading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </div>
            {/* Always show spinner when uploading */}
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          {/* User info */}
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{user.name}</h1>
            <p className="text-green-100 mt-1">{user.email}</p>
            <div className="flex flex-wrap gap-3 mt-4 justify-center sm:justify-start">
              <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full border border-white/30">
                {orders.length} {t('profile.recentOrders', 'Recent Orders')}
              </span>
              <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full border border-white/30">
                {addresses.length} {t('profile.savedAddresses', 'Saved Addresses')}
              </span>
            </div>
          </div>
          {/* Logout btn */}
          <button
            onClick={logout}
            className="flex-shrink-0 flex items-center gap-2 bg-white/10 hover:bg-white/25 border border-white/30 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer backdrop-blur-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {t('profile.logout', 'Logout')}
          </button>
        </div>
      </div>

      <div className="px-6 md:px-16 lg:px-24 xl:px-32">
        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1.5 mb-8 shadow-sm w-full sm:w-auto sm:inline-flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer flex-1 sm:flex-none justify-center
                ${activeTab === tab.id
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Tab: Account Info ─── */}
        {activeTab === 'info' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Info Card */}
            <div className="bg-white rounded-[2px] border border-gray-300 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="font-semibold text-gray-800">{t('profile.personalInfo', 'Personal Information')}</h2>
              </div>
              <div className="p-6 space-y-4">
                <InfoRow icon={<Icons.User />} label={t('profile.fullName', 'Full Name')} value={user.name} />
                <InfoRow icon={<Icons.Mail />} label={t('profile.emailAddress', 'Email Address')} value={user.email} />
                <InfoRow icon={<Icons.Lock />} label={t('profile.password', 'Password')} value="••••••••••" />
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-[2px] border border-gray-300 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="font-semibold text-gray-800">{t('profile.quickActions', 'Quick Actions')}</h2>
              </div>
              <div className="p-4 space-y-2">
                <QuickAction
                  icon={<Icons.Box />}
                  title={t('profile.myOrders', 'My Orders')}
                  subtitle={t('profile.myOrdersDesc', 'Track and manage your orders')}
                  onClick={() => navigate('/my-order')}
                />
                <QuickAction
                  icon={<Icons.Cart />}
                  title={t('profile.viewCart', 'View Cart')}
                  subtitle={t('profile.viewCartDesc', 'See items in your cart')}
                  onClick={() => navigate('/cart')}
                />
                <QuickAction
                  icon={<Icons.MapPin />}
                  title={t('profile.addNewAddress', 'Add New Address')}
                  subtitle={t('profile.addNewAddressDesc', 'Save a delivery address')}
                  onClick={() => navigate('/add-address')}
                />
                <QuickAction
                  icon={<Icons.ShoppingBag />}
                  title={t('profile.browseProducts', 'Browse Products')}
                  subtitle={t('profile.browseProductsDesc', 'Explore our collection')}
                  onClick={() => navigate('/products')}
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── Tab: Addresses ─── */}
        {activeTab === 'addresses' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">{t('profile.savedAddressesTitle', 'Saved Addresses')}</h2>
              <button
                onClick={() => navigate('/add-address')}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dull text-white px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('profile.addAddressBtn', 'Add Address')}
              </button>
            </div>

            {loadingAddr ? (
              <LoadingCards count={2} />
            ) : addresses.length === 0 ? (
              <EmptyState
                icon={<Icons.MapPin className="w-16 h-16 text-gray-300" />}
                title={t('profile.noAddress', 'No addresses saved')}
                subtitle={t('profile.noAddressDesc', 'Add a delivery address to speed up your checkout')}
                btnLabel={t('profile.addAddressBtn', 'Add Address')}
                onClick={() => navigate('/add-address')}
              />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {addresses.map((addr, idx) => (
                  <div key={idx} className="bg-white rounded-[2px] border border-gray-300 shadow-sm p-5 hover:shadow-md hover:border-primary/30 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{t('profile.addressText', 'Address')} {idx + 1}</span>
                    </div>
                    <p className="font-semibold text-gray-800">{addr.firstName} {addr.lastName}</p>
                    <p className="text-sm text-gray-500 mt-1">{addr.street}</p>
                    <p className="text-sm text-gray-500">{addr.city}, {addr.state} {addr.zipCode}</p>
                    <p className="text-sm text-gray-500">{addr.country}</p>
                    <div className="mt-3 pt-3 border-t border-gray-100 flex gap-3 text-xs text-gray-500 items-center">
                      <Icons.Mail className="w-4 h-4" /> <span>{addr.email}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      <span>{addr.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Tab: Recent Orders ─── */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">{t('profile.recentOrdersTitle', 'Recent Orders')}</h2>
              <button
                onClick={() => navigate('/my-order')}
                className="text-primary hover:text-primary-dull text-sm font-medium transition-colors cursor-pointer"
              >
                {t('profile.viewAll', 'View All')} →
              </button>
            </div>

            {loadingOrders ? (
              <LoadingCards count={3} />
            ) : orders.length === 0 ? (
              <EmptyState
                icon={<Icons.Box className="w-16 h-16 text-gray-300" />}
                title={t('profile.noOrders', 'No orders yet')}
                subtitle={t('profile.noOrdersDesc', 'Start shopping to see your orders here')}
                btnLabel={t('profile.browseProducts', 'Browse Products')}
                onClick={() => navigate('/products')}
              />
            ) : (
              <div className="space-y-4">
                {orders.map((order, idx) => (
                  <div key={idx} className="bg-white rounded-[2px] border border-gray-300 shadow-sm overflow-hidden hover:shadow-md transition-all">
                    {/* Order header */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-3 justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{t('myOrders.orderId', 'Order ID')}</p>
                        <p className="text-sm font-mono text-gray-600 mt-0.5">{order._id}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`text-xs px-3 py-1.5 rounded-full font-medium
                          ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                              'bg-yellow-100 text-yellow-700'}`}>
                          {t(`myOrders.status.${order.status}`, order.status)}
                        </span>
                        <span className="text-sm font-semibold text-gray-800">฿{order.amount}</span>
                      </div>
                    </div>
                    {/* Order items */}
                    <div className="px-6 py-4">
                      {order.items?.slice(0, 2).map((item, i) => (
                        <div key={i} className="flex items-center gap-4 py-2">
                          <img src={item.product?.image?.[0]} alt={item.product?.name} className="w-12 h-12 object-cover rounded-lg bg-gray-100" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{item.product?.name}</p>
                            <p className="text-xs text-gray-400">{t('myOrders.qty', 'Qty:')} {item.quantity || 1}</p>
                          </div>
                          <p className="text-sm font-semibold text-primary">฿{item.product?.offerPrice * (item.quantity || 1)}</p>
                        </div>
                      ))}
                      {order.items?.length > 2 && (
                        <p className="text-xs text-gray-400 mt-1">+{order.items.length - 2} {t('profile.moreItems', 'more items')}</p>
                      )}
                    </div>
                    <div className="px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-xs text-gray-400">{order.paymentType}</span>
                    </div>
                  </div>
                ))}
                {/* <button
                  onClick={() => navigate('/my-order')}
                  className="w-full py-3 border-2 border-dashed border-gray-200 hover:border-primary/40 text-gray-400 hover:text-primary rounded-2xl text-sm font-medium transition-all cursor-pointer"
                >
                  View All Orders →
                </button> */}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Helper Components ───

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-primary/5 transition-colors">
    <span className="w-8 flex items-center justify-center text-primary/70">{icon}</span>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-gray-800 mt-0.5 truncate">{value}</p>
    </div>
  </div>
)

const QuickAction = ({ icon, title, subtitle, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all cursor-pointer text-left group"
  >
    <span className="w-10 h-10 bg-gray-100 group-hover:bg-primary/10 text-gray-500 group-hover:text-primary rounded-xl flex items-center justify-center transition-colors">{icon}</span>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-800">{title}</p>
      <p className="text-xs text-gray-400">{subtitle}</p>
    </div>
    <svg className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </button>
)

const EmptyState = ({ icon, title, subtitle, btnLabel, onClick }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
    <p className="text-sm text-gray-400 mt-1 mb-6">{subtitle}</p>
    <button
      onClick={onClick}
      className="bg-primary hover:bg-primary-dull text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer"
    >
      {btnLabel}
    </button>
  </div>
)

const LoadingCards = ({ count }) => (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
        <div className="w-9 h-9 bg-gray-200 rounded-xl mb-3" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-full mb-1" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    ))}
  </div>
)

export default Profile
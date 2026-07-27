import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import toast from 'react-hot-toast';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { t } = useTranslation();
  const { currency, axios, convertPrice } = useAppContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'weekly', 'summary'
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/seller/dashboard?timeFilter=${timeFilter}`);
        if (data.success) {
          setStats(data.stats);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeFilter]);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto">


        {/* Modern Tabs Navigation */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 mb-8 inline-flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md transform scale-105'
                : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            {t('dashboard.dashboard', 'Dashboard')}
          </button>

          <button
            onClick={() => setActiveTab('weekly')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'weekly'
                ? 'bg-blue-600 text-white shadow-md transform scale-105'
                : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {t('dashboard.onlineSalesChart', 'ยอดขายออนไลน์ (กราฟเส้น)')}
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'summary'
                ? 'bg-blue-600 text-white shadow-md transform scale-105'
                : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {t('dashboard.summary', 'รายสรุปรวม (Summary)')}
          </button>
        </div>

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-300">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Total Revenue */}
              <div className="bg-white rounded-[2px] shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-gray-500 font-medium text-sm md:text-base">{t('dashboard.todaySales', "Today's Sales")}</h3>
                  <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">{currency}{convertPrice(stats.totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
                </div>
              </div>

              {/* Total Products */}
              <div className="bg-white rounded-[2px] shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 text-green-600">
                    <rect x="3" y="4" width="18" height="4" strokeLinecap="square" strokeLinejoin="miter" />
                    <path d="M4.5 8v12h15V8" strokeLinecap="square" strokeLinejoin="miter" />
                    <rect x="9" y="11" width="6" height="2" rx="1" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6.5 17h.01 M8.5 17h.01 M10.5 17h.01 M12.5 17h.01 M14.5 17h.01 M16.5 17h.01 M18.5 17h.01" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('dashboard.totalProducts', 'Total Products')}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalProducts} <span className="text-sm font-normal text-gray-500">{t('dashboard.items', 'รายการ')}</span></p>
                </div>
              </div>

              {/* POS Sales */}
              <div className="bg-white rounded-[2px] shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('dashboard.posSales', 'POS Sales')}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalPosSales} <span className="text-sm font-normal text-gray-500">{t('dashboard.bills', 'บิล')}</span></p>
                  <p className="text-sm font-semibold text-purple-600 mt-1">{currency}{convertPrice(stats.posRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
                </div>
              </div>

              {/* Online Orders */}
              <div className="bg-white rounded-[2px] shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('dashboard.onlineOrders', 'Online Orders')}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalOnlineOrders} <span className="text-sm font-normal text-gray-500">{t('dashboard.orders', 'ออเดอร์')}</span></p>
                  <p className="text-sm font-semibold text-orange-600 mt-1">{currency}{convertPrice(stats.onlineRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
                </div>
              </div>

              {/* Pending Orders */}
              <div className="bg-white rounded-[2px] shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-7 w-7 text-yellow-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('dashboard.pendingOrders', 'ยังไม่ได้จัดส่ง (Pending)')}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.pendingOrdersCount || 0} <span className="text-sm font-normal text-gray-500">{t('dashboard.orders', 'ออเดอร์')}</span></p>
                </div>
              </div>

              {/* Shipped Orders */}
              <div className="bg-white rounded-[2px] shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-7 w-7 text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('dashboard.shippedOrders', 'จัดส่งแล้ว (Shipped)')}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.shippedOrdersCount || 0} <span className="text-sm font-normal text-gray-500">{t('dashboard.orders', 'ออเดอร์')}</span></p>
                </div>
              </div>
            </div>

            {/* Sales Charts Section (CSS Based) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                {t('dashboard.salesComparison', 'Sales Comparison')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Revenue Comparison Chart */}
                <div className="flex flex-col items-center">
                  <h3 className="text-sm font-medium text-gray-500 mb-2 w-full text-left">{t('dashboard.revenueShare', 'Revenue Share')}</h3>
                  
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: t('dashboard.online', 'Online'), value: stats.onlineRevenue },
                            { name: t('dashboard.pos', 'POS'), value: stats.posRevenue }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          <Cell fill="#3b82f6" />
                          <Cell fill="#a855f7" />
                        </Pie>
                        <Tooltip formatter={(value) => `${value.toLocaleString()} ${currency}`} />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full flex justify-between px-4 mt-2">
                    <div className="text-center">
                      <p className="text-xl font-bold text-blue-600">{currency}{convertPrice(stats.onlineRevenue).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
                      <p className="text-xs text-gray-500">{t('dashboard.online', 'Online')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-purple-600">{currency}{convertPrice(stats.posRevenue).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
                      <p className="text-xs text-gray-500">{t('dashboard.pos', 'POS')}</p>
                    </div>
                  </div>
                </div>

                {/* Orders Comparison Chart */}
                <div className="flex flex-col items-center">
                  <h3 className="text-sm font-medium text-gray-500 mb-2 w-full text-left">{t('dashboard.ordersShare', 'Orders Share')}</h3>
                  
                  <div className="h-[250px] w-full">
                    {stats.graphData?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={stats.graphData}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorOnline" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="date" stroke="#9ca3af" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                          <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                          <Tooltip 
                            formatter={(value) => `${value} ${t('dashboard.items', 'รายการ')}`} 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                          <Area type="monotone" dataKey="Online Orders" name={t('dashboard.online', 'Online')} stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorOnline)" activeDot={{ r: 6, strokeWidth: 0 }} />
                          <Area type="monotone" dataKey="POS Orders" name={t('dashboard.pos', 'POS')} stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorPos)" activeDot={{ r: 6, strokeWidth: 0 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        {t('dashboard.noData', 'No data available')}
                      </div>
                    )}
                  </div>
                  <div className="w-full flex justify-between px-4 mt-2">
                    <div className="text-center">
                      <p className="text-xl font-bold text-orange-600">{stats.totalOnlineOrders} <span className="text-sm font-normal text-gray-500">{t('dashboard.orders', 'ออเดอร์')}</span></p>
                      <p className="text-xs text-gray-500">{t('dashboard.online', 'Online')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-green-600">{stats.totalPosSales} <span className="text-sm font-normal text-gray-500">{t('dashboard.bills', 'บิล')}</span></p>
                      <p className="text-xs text-gray-500">{t('dashboard.pos', 'POS')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* TAB 2: ONLINE ORDERS CHART */}
        {activeTab === 'weekly' && (
          <div className="animate-in fade-in duration-300">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{t('dashboard.onlineSalesTitle', 'Online Sales (COD vs BCEL ONE)')}</h2>
                  <p className="text-gray-500">{t('dashboard.onlineSalesDesc', 'Summary of online sales by payment method')}</p>
                </div>
                
                {/* Time Filter Buttons */}
                <div className="mt-4 md:mt-0 flex flex-wrap gap-2 bg-gray-50 p-1 rounded-lg">
                  {[
                    { id: '1h', label: t('dashboard.filter1h', '1 Hour') },
                    { id: '1d', label: t('dashboard.filter1d', '1 Day') },
                    { id: '1w', label: t('dashboard.filter1w', '1 Week') },
                    { id: '1m', label: t('dashboard.filter1m', '1 Month') },
                    { id: 'all', label: t('dashboard.filterAll', 'All') }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setTimeFilter(filter.id)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        timeFilter === filter.id 
                          ? 'bg-white text-blue-600 shadow-sm border border-gray-200' 
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[400px] w-full mt-4">
                {stats.graphData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={stats.graphData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="colorCod" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorBcel" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#9ca3af" axisLine={false} tickLine={false} />
                      <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} />
                      <Tooltip 
                        formatter={(value) => `${value.toLocaleString()} ${currency}`} 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Area type="monotone" dataKey="COD" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorCod)" activeDot={{ r: 6, strokeWidth: 0 }} />
                      <Area type="monotone" dataKey="BCEL ONE" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorBcel)" activeDot={{ r: 6, strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    {t('dashboard.noData', 'No data available')}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-800">{t('dashboard.recentOrders', 'Recent Orders')}</h3>
              </div>
              {stats.recentOnlineOrders?.length === 0 ? (
                <div className="p-8 text-center text-gray-500">{t('dashboard.noOrders', 'No orders')}</div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                  {stats.recentOnlineOrders?.map(order => (
                    <div key={order._id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-800">{new Date(order.createdAt).toLocaleDateString('en-GB')} {new Date(order.createdAt).toLocaleTimeString()}</p>
                        <p className="text-sm text-gray-500">{t('dashboard.customer', 'Customer')}: {order.address?.firstName} {order.address?.lastName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{currency}{convertPrice(order.amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
                        <p className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full mt-1 inline-block">{order.paymentType}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SUMMARY */}
        {activeTab === 'summary' && (
          <div className="animate-in fade-in duration-300">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-800">{t('dashboard.totalSummary', 'Total Summary')}</h2>
                <p className="text-sm text-gray-500 mt-1">{t('dashboard.summaryDesc', 'Overall system summary')}</p>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <span className="text-gray-600 font-medium text-lg">{t('dashboard.totalRevenue', 'Total Revenue')}</span>
                    <span className="text-2xl font-bold text-gray-900">{currency}{convertPrice(stats.totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                  </div>

                  <div className="pl-4 border-l-4 border-blue-500 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t('dashboard.onlineRevenue', 'Online Revenue')}</span>
                      <span className="font-bold text-blue-600 text-lg">{currency}{convertPrice(stats.onlineRevenue).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t('dashboard.onlineOrderCount', 'Online Order Count')}</span>
                      <span className="font-bold text-gray-800">{stats.totalOnlineOrders} <span className="text-sm font-normal text-gray-500">{t('dashboard.items', 'รายการ')}</span></span>
                    </div>
                  </div>

                  <div className="pl-4 border-l-4 border-purple-500 space-y-4 mt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t('dashboard.posSales', 'POS Sales')}</span>
                      <span className="font-bold text-purple-600 text-lg">{currency}{convertPrice(stats.posRevenue).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t('dashboard.posOrderCount', 'POS Order Count')}</span>
                      <span className="font-bold text-gray-800">{stats.totalPosSales} <span className="text-sm font-normal text-gray-500">{t('dashboard.items', 'รายการ')}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
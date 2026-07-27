import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import toast from 'react-hot-toast';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useTranslation } from 'react-i18next';

const DashboardManager = () => {
  const { t } = useTranslation();
  const { axios, currency, convertPrice } = useAppContext();
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

  const productInGraphData = React.useMemo(() => {
    if (!stats?.recentProductInList) return [];

    const grouped = {};
    [...stats.recentProductInList].reverse().forEach(item => {
      const dateObj = new Date(item.date || item.createdAt);
      const dateStr = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;
      const timeStr = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
      const exactTimeKey = `${dateStr} ${timeStr}`;

      if (!grouped[exactTimeKey]) {
        grouped[exactTimeKey] = { date: exactTimeKey, cost: 0, quantity: 0 };
      }
      grouped[exactTimeKey].cost += ((item.costPrice || 0) * (item.quantity || 1));
      grouped[exactTimeKey].quantity += (item.quantity || 0);
    });

    return Object.values(grouped);
  }, [stats?.recentProductInList]);

  const financeGraphData = React.useMemo(() => {
    if (!stats?.graphData) return [];
    return stats.graphData.map(d => ({
      date: d.date,
      income: (d.COD || 0) + (d['BCEL ONE'] || 0) + (d.posAmount || 0),
      expense: d.expense || 0
    }));
  }, [stats?.graphData]);

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
        <div className="bg-gray-100 p-1.5 rounded-[6px] shadow-sm border border-gray-100 mb-8 inline-flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-[6px] text-sm font-semibold transition-all duration-300 ${activeTab === 'dashboard'
              ? 'bg-white text-green-600 shadow-md transform scale-105'
              : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('weekly')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-[6px] text-sm font-semibold transition-all duration-300 ${activeTab === 'weekly'
              ? 'bg-white text-green-600 shadow-md transform scale-105'
              : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {t('manager.onlineSales', 'Online Sales')}
          </button>

          <button
            onClick={() => setActiveTab('combined_graph')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-[6px] text-sm font-semibold transition-all duration-300 ${activeTab === 'combined_graph'
              ? 'bg-white text-blue-600 shadow-md transform scale-105'
              : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            {t('manager.combinedGraph', 'Combined Graph')}
          </button>

          <button
            onClick={() => setActiveTab('pos_sales')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-[6px] text-sm font-semibold transition-all duration-300 ${activeTab === 'pos_sales'
              ? 'bg-white text-green-600 shadow-md transform scale-105'
              : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
            </svg>
            {t('manager.posSales', 'POS Sales')}
          </button>


          <button
            onClick={() => setActiveTab('product_in')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-[6px] text-sm font-semibold transition-all duration-300 ${activeTab === 'product_in'
              ? 'bg-white text-green-600 shadow-md transform scale-105'
              : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            {t('manager.productIn', 'Product In')}
          </button>

          <button
            onClick={() => setActiveTab('finance')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-[6px] text-sm font-semibold transition-all duration-300 ${activeTab === 'finance'
              ? 'bg-white text-green-600 shadow-md transform scale-105'
              : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('manager.finance', 'Finance')}
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-[6px] text-sm font-semibold transition-all duration-300 ${activeTab === 'summary'
              ? 'bg-white text-green-600 shadow-md transform scale-105'
              : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {t('manager.summary', 'Summary')}
          </button>

        </div>

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-300">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
              {/* Total Revenue */}
              <div className="bg-white rounded-[2px] shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{currency}{convertPrice(stats.totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
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
                  <p className="text-sm font-medium text-gray-500">{t('manager.totalProducts', 'Total Products')}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalProducts} {t('manager.items', 'items')}</p>
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
                  <p className="text-sm font-medium text-gray-500">{t('manager.posSales', 'POS Sales')}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalPosSales} <span className="text-sm font-normal text-gray-500">{t('manager.receipts', 'receipts')}</span></p>
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
                  <p className="text-sm font-medium text-gray-500">{t('manager.onlineOrders', 'Online Orders')}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalOnlineOrders} <span className="text-sm font-normal text-gray-500">{t('manager.orders', 'orders')}</span></p>
                  <p className="text-sm font-semibold text-orange-600 mt-1">{currency}{convertPrice(stats.onlineRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
                </div>
              </div>

              {/* Product In */}
              <div className="bg-white rounded-[2px] shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('manager.productIn', 'Product In')}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalProductIn || 0} <span className="text-sm font-normal text-gray-500">{t('manager.items', 'items')}</span></p>
                  <p className="text-sm font-semibold text-teal-600 mt-1">{currency}{convertPrice(stats.totalExpense || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
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
                  <p className="text-sm font-medium text-gray-500">{t('manager.pendingOrders', 'Pending Orders')}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.pendingOrdersCount || 0} <span className="text-sm font-normal text-gray-500">{t('manager.orders', 'orders')}</span></p>
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
                  <p className="text-sm font-medium text-gray-500">{t('manager.shippedOrders', 'Shipped Orders')}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.shippedOrdersCount || 0} <span className="text-sm font-normal text-gray-500">{t('manager.orders', 'orders')}</span></p>
                </div>
              </div>

              {/* Total Users */}
              <div className="bg-white rounded-[2px] shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('manager.totalUsers', 'Total Users')}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalUsers || 0} <span className="text-sm font-normal text-gray-500">{t('manager.people', 'people')}</span></p>
                </div>
              </div>

              {/* Total Sellers */}
              <div className="bg-white rounded-[2px] shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 text-pink-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('manager.totalSellers', 'Total Sellers')}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalSellers || 0} <span className="text-sm font-normal text-gray-500">{t('manager.people', 'people')}</span></p>
                </div>
              </div>
            </div>

            {/* Sales Charts Section (CSS Based) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                {t('manager.salesComparison', 'Sales Comparison')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Revenue Comparison Chart */}
                <div className="flex flex-col items-center">
                  <h3 className="text-sm font-medium text-gray-500 mb-2 w-full text-left">{t('manager.revenueShare', 'Revenue Share')}</h3>

                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: t('manager.online', 'Online'), value: stats.onlineRevenue },
                            { name: t('manager.pos', 'POS'), value: stats.posRevenue }
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
                        <Tooltip formatter={(value) => `${currency}${convertPrice(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`} />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full flex justify-between px-4 mt-2">
                    <div className="text-center">
                      <p className="text-xl font-bold text-blue-600">{currency}{convertPrice(stats.onlineRevenue).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
                      <p className="text-xs text-gray-500">{t('manager.online', 'Online')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-purple-600">{currency}{convertPrice(stats.posRevenue).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
                      <p className="text-xs text-gray-500">{t('manager.pos', 'POS')}</p>
                    </div>
                  </div>
                </div>

                {/* Orders Comparison Chart */}
                <div className="flex flex-col items-center">
                  <h3 className="text-sm font-medium text-gray-500 mb-2 w-full text-left">{t('manager.ordersShare', 'Orders Share')}</h3>

                  <div className="h-[250px] w-full">
                    {stats.graphData?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={stats.graphData}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorOnline" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="date" stroke="#9ca3af" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                          <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                          <Tooltip
                            formatter={(value) => `${value} ${t('manager.items', 'items')}`}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                          <Area type="monotone" dataKey="Online Orders" name={t('manager.online', 'Online')} stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorOnline)" activeDot={{ r: 6, strokeWidth: 0 }} />
                          <Area type="monotone" dataKey="POS Orders" name={t('manager.pos', 'POS')} stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorPos)" activeDot={{ r: 6, strokeWidth: 0 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        {t('manager.noGraphData', 'No graph data')}
                      </div>
                    )}
                  </div>
                  <div className="w-full flex justify-between px-4 mt-2">
                    <div className="text-center">
                      <p className="text-xl font-bold text-orange-600">{stats.totalOnlineOrders} {t('manager.orders', 'Orders')}</p>
                      <p className="text-xs text-gray-500">{t('manager.online', 'Online')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-green-600">{stats.totalPosSales} {t('manager.bills', 'Bills')}</p>
                      <p className="text-xs text-gray-500">{t('manager.pos', 'POS')}</p>
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
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{t('manager.onlineSalesComparison', 'Online Sales (COD vs BCEL ONE)')}</h2>
                  <p className="text-gray-500">{t('manager.onlineSalesSubDesc', 'Summary of online sales by payment method')}</p>
                </div>

                {/* Time Filter Buttons */}
                <div className="mt-4 md:mt-0 flex flex-wrap gap-2 bg-gray-50 p-1 rounded-lg">
                  {[
                    { id: '1h', label: t('manager.1h', '1 hour') },
                    { id: '1d', label: t('manager.1d', '1 day') },
                    { id: '1w', label: t('manager.1w', '1 week') },
                    { id: '1m', label: t('manager.1m', '1 month') },
                    { id: 'all', label: t('manager.all', 'All') }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setTimeFilter(filter.id)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${timeFilter === filter.id
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
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorBcel" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#9ca3af" axisLine={false} tickLine={false} />
                      <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(value) => `${currency}${convertPrice(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Area type="monotone" dataKey="COD" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorCod)" activeDot={{ r: 6, strokeWidth: 0 }} />
                      <Area type="monotone" dataKey="BCEL ONE" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorBcel)" activeDot={{ r: 6, strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    {t('manager.noGraphData', 'No graph data')}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-800">{t('manager.recentOrders', 'Recent Orders')}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-y border-gray-100 text-gray-500 text-sm">
                    <tr>
                      <th className="px-6 py-4 font-medium">{t('manager.orderDate', 'Order Date')}</th>
                      <th className="px-6 py-4 font-medium">{t('manager.customer', 'Customer')}</th>
                      <th className="px-6 py-4 font-medium">{t('manager.product', 'Product')}</th>
                      <th className="px-6 py-4 font-medium text-center">{t('manager.paymentMethod', 'Payment Method')}</th>
                      <th className="px-6 py-4 font-medium text-right">{t('manager.amount', 'Amount')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {stats.recentOnlineOrders?.length > 0 ? (
                      stats.recentOnlineOrders.map((order, index) => (
                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {new Date(order.createdAt).toLocaleDateString('en-GB')} {new Date(order.createdAt).toLocaleTimeString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-800">{order.address?.firstName} {order.address?.lastName}</span>
                          </td>
                          <td className="px-6 py-4">
                            {order.items && order.items.length > 0 && order.items[0].product ? (
                              <div className="flex items-center gap-3">
                                {order.items[0].product.image && order.items[0].product.image.length > 0 ? (
                                  <img src={order.items[0].product.image[0]} alt="product" className="w-10 h-10 rounded object-cover border border-gray-100" />
                                ) : (
                                  <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-800 text-sm line-clamp-1">{order.items[0].product.name}</span>
                                  {order.items.length > 1 && (
                                    <span className="text-xs text-blue-500 mt-0.5">+ อีก {order.items.length - 1} รายการ</span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-center">
                            <span className="px-3 py-1 bg-green-50 border border-green-100 text-green-700 rounded-full inline-block whitespace-nowrap">
                              {order.paymentType}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-primary text-right whitespace-nowrap">
                            {currency}{convertPrice(order.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          {t('manager.noOrders', 'No Orders')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SUMMARY */}
        {activeTab === 'summary' && (
          <div className="animate-in fade-in duration-300">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-800">{t('manager.totalSummary', 'Total Summary')}</h2>
                <p className="text-sm text-gray-500 mt-1"></p>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <span className="text-gray-600 font-medium text-lg">{t('manager.totalRevenueDesc', 'Total Revenue')}</span>
                    <span className="text-2xl font-bold text-gray-900">{currency}{convertPrice(stats.totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                  </div>

                  <div className="pl-4 border-l-4 border-blue-500 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t('manager.onlineRevenueDesc', 'Online Revenue')}</span>
                      <span className="font-bold text-blue-600 text-lg">{currency}{convertPrice(stats.onlineRevenue).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t('manager.onlineOrdersDesc', 'Online Orders Count')}</span>
                      <span className="font-bold text-gray-800">{stats.totalOnlineOrders} {t('manager.items', 'items')}</span>
                    </div>
                  </div>

                  <div className="pl-4 border-l-4 border-purple-500 space-y-4 mt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t('manager.posRevenueDesc', 'POS Revenue')}</span>
                      <span className="font-bold text-purple-600 text-lg">{currency}{convertPrice(stats.posRevenue).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t('manager.posOrdersDesc', 'POS Orders Count')}</span>
                      <span className="font-bold text-gray-800">{stats.totalPosSales} {t('manager.items', 'items')}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                    <span className="text-gray-600 font-medium text-lg">{t('manager.totalExpenses', 'Total Expenses')}</span>
                    <span className="text-2xl font-bold text-red-500">{currency}{convertPrice(stats.totalExpense || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between items-center bg-green-50 p-4 rounded-lg mt-4 border border-green-100 shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-green-800 font-bold text-lg">{t('manager.netProfit', 'Net Profit')}</span>
                      <span className="text-green-600 text-sm"></span>
                    </div>
                    <span className="text-3xl font-bold text-green-700">{currency}{convertPrice((stats.totalRevenue || 0) - (stats.totalExpense || 0)).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <p className="text-sm text-gray-500 mb-1">{t('manager.totalProductsDesc', 'Total Products')}</p>
                      <p className="text-2xl font-bold text-gray-800">{stats.totalProducts} <span className="text-sm font-normal text-gray-500">{t('manager.items', 'items')}</span></p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <p className="text-sm text-gray-500 mb-1">{t('manager.productInDesc', 'Product In')}</p>
                      <p className="text-2xl font-bold text-teal-600">{stats.totalProductIn || 0} <span className="text-sm font-normal text-teal-600/70">{t('manager.items', 'items')}</span></p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                      <p className="text-sm text-red-500 mb-1">{t('manager.lowStockDesc', 'Low Stock')}</p>
                      <p className="text-2xl font-bold text-red-600">{stats.lowStockProducts?.length || 0} <span className="text-sm font-normal text-red-500/70">{t('manager.items', 'items')}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PRODUCT IN */}
        {activeTab === 'product_in' && (
          <div className="animate-in fade-in duration-300">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{t('manager.recentProductIn', 'Recent Product In')}</h2>
                  <p className="text-sm text-gray-500 mt-1"></p>
                </div>
                <div className="bg-teal-50 text-teal-600 px-4 py-2 rounded-lg font-bold">
                  {t('manager.totalProducts', 'Total Products')}: {stats.totalProductIn || 0} {t('manager.items', 'items')}
                </div>
              </div>

              {/* Product In Chart */}
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-500 mb-4">{t('manager.productInGraph', 'Product In Graph')}</h3>
                <div className="h-[300px] w-full">
                  {productInGraphData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={productInGraphData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="date" stroke="#9ca3af" axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" stroke="#9ca3af" axisLine={false} tickLine={false} tickFormatter={(value) => `${value.toLocaleString()}`} />
                        <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value, name) => [value.toLocaleString(), name === 'cost' ? `${t('manager.cost', 'Cost')} (${currency})` : t('manager.quantity', 'Quantity')]}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        <Area yAxisId="left" type="monotone" dataKey="cost" name={t('manager.cost', 'Cost')} stroke="#0d9488" fillOpacity={1} fill="url(#colorCost)" />
                        <Line yAxisId="right" type="monotone" dataKey="quantity" name={t('manager.quantity', 'Quantity')} stroke="#f59e0b" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      ยังไม่มีข้อมูลกราฟ
                    </div>
                  )}
                </div>
              </div>

              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                      <th className="px-6 py-4 font-medium">{t('manager.orderDate', 'Order Date')}</th>
                      <th className="px-6 py-4 font-medium">{t('manager.product', 'Product')}</th>
                      <th className="px-6 py-4 font-medium">{t('manager.supplier', 'Supplier')}</th>
                      <th className="px-6 py-4 font-medium text-right">{t('manager.quantity', 'Quantity')}</th>
                      <th className="px-6 py-4 font-medium text-right">{t('manager.cost', 'Cost')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {stats.recentProductInList?.length > 0 ? (
                      stats.recentProductInList.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(item.date || item.createdAt).toLocaleDateString('en-GB')} {new Date(item.date || item.createdAt).toLocaleTimeString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {item.images && item.images.length > 0 ? (
                                <img src={item.images[0]} alt={item.productName} className="w-10 h-10 rounded object-cover border border-gray-100" />
                              ) : (
                                <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                              <span className="font-medium text-gray-800">{item.productName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{item.company || '-'} {item.country ? `(${item.country})` : ''}</td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-800 text-right">{item.quantity}</td>
                          <td className="px-6 py-4 text-sm font-bold text-teal-600 text-right">{currency}{convertPrice(item.costPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          {t('manager.noProductInHistory', 'No Product In History')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: FINANCE */}
        {activeTab === 'finance' && (
          <div className="animate-in fade-in duration-300">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-[6px] shadow-sm border border-gray-100 p-6 flex flex-col justify-center items-center text-center">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-gray-500 font-medium mb-1">{t('manager.totalIncome', 'Total Income')}</h3>
                <p className="text-2xl font-bold text-gray-800">{currency}{convertPrice(stats.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
              </div>

              <div className="bg-white rounded-[6px] shadow-sm border border-gray-100 p-6 flex flex-col justify-center items-center text-center">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <h3 className="text-gray-500 font-medium mb-1">{t('manager.totalExpense', 'Total Expense')}</h3>
                <p className="text-2xl font-bold text-gray-800">{currency}{convertPrice(stats.totalExpense || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
              </div>

              <div className="bg-white rounded-[6px] shadow-sm border border-gray-100 p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
                <div className={`absolute inset-0 opacity-10 ${stats.totalRevenue - (stats.totalExpense || 0) >= 0 ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 relative z-10 ${stats.totalRevenue - (stats.totalExpense || 0) >= 0 ? 'bg-blue-50 text-blue-500' : 'bg-red-50 text-red-500'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-gray-500 font-medium mb-1 relative z-10">{t('manager.netProfit', 'Net Profit')}</h3>
                <p className={`text-3xl font-bold relative z-10 ${stats.totalRevenue - (stats.totalExpense || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {currency}{convertPrice((stats.totalRevenue || 0) - (stats.totalExpense || 0)).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Income vs Expense Chart */}
            <div className="bg-white rounded-[6px] shadow-sm border border-gray-100 overflow-hidden p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6">{t('manager.incomeVsExpense', 'Income vs Expense')}</h3>
              <div className="h-[400px] w-full">
                {financeGraphData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={financeGraphData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#9ca3af" axisLine={false} tickLine={false} />
                      <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value, name) => [value.toLocaleString() + ' ' + currency, name]}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Area type="monotone" dataKey="income" name={t('manager.income', 'Income')} stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                      <Area type="monotone" dataKey="expense" name={t('manager.expense', 'Expense')} stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    {t('manager.noFinanceData', 'No finance data')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: POS SALES */}
        {activeTab === 'pos_sales' && (
          <div className="animate-in fade-in duration-300">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{t('manager.posSales', 'POS Sales')}</h2>
                  <p className="text-gray-500">{t('manager.posSalesDesc', 'Summary of all POS sales')}</p>
                </div>

                <div className="mt-4 md:mt-0 flex flex-wrap gap-2 bg-gray-50 p-1 rounded-lg">
                  {[
                    { id: '1h', label: t('manager.1h', '1 hour') },
                    { id: '1d', label: t('manager.1d', '1 day') },
                    { id: '1w', label: t('manager.1w', '1 week') },
                    { id: '1m', label: t('manager.1m', '1 month') },
                    { id: 'all', label: t('manager.all', 'All') }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setTimeFilter(filter.id)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${timeFilter === filter.id
                        ? 'bg-white text-purple-600 shadow-sm border border-gray-200'
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
                        <linearGradient id="colorPosAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#9ca3af" axisLine={false} tickLine={false} />
                      <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(value, name) => [value.toLocaleString() + ' ' + currency, t('manager.posSalesLegend', 'POS Sales')]}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Area type="monotone" dataKey="posAmount" name={t('manager.posSalesLegend', 'POS Sales')} stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorPosAmount)" activeDot={{ r: 6, strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    ยังไม่มีข้อมูลยอดขาย
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-800">{t('manager.recentPosSales', 'Recent POS Sales')}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-y border-gray-100 text-gray-500 text-sm">
                    <tr>
                      <th className="px-6 py-4 font-medium">{t('manager.saleDate', 'Sale Date')}</th>
                      <th className="px-6 py-4 font-medium">{t('manager.product', 'Product')}</th>
                      <th className="px-6 py-4 font-medium text-center">{t('manager.paymentMethod', 'Payment Method')}</th>
                      <th className="px-6 py-4 font-medium text-right">{t('manager.amount', 'Amount')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {stats.recentPosSales?.length > 0 ? (
                      stats.recentPosSales.map((sale, index) => (
                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {new Date(sale.createdAt).toLocaleDateString('en-GB')} {new Date(sale.createdAt).toLocaleTimeString()}
                          </td>
                          <td className="px-6 py-4">
                            {sale.items && sale.items.length > 0 ? (
                              <div className="flex items-center gap-3">
                                {sale.items[0].product?.image && sale.items[0].product.image.length > 0 ? (
                                  <img src={sale.items[0].product.image[0]} alt="product" className="w-10 h-10 rounded object-cover border border-gray-100" />
                                ) : (
                                  <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-800 text-sm line-clamp-1">{sale.items[0].name || sale.items[0].product?.name}</span>
                                  {sale.items.length > 1 && (
                                    <span className="text-xs text-purple-500 mt-0.5">+ อีก {sale.items.length - 1} รายการ</span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-center">
                            <span className="px-3 py-1 bg-purple-50 border border-purple-100 text-purple-700 rounded-full inline-block whitespace-nowrap">
                              {sale.paymentType || 'POS'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-primary text-right whitespace-nowrap">
                            {currency}{convertPrice(sale.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                          {t('manager.noPosSales', 'No POS sales')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: COMBINED GRAPH */}
        {activeTab === 'combined_graph' && (
          <div className="animate-in fade-in duration-300">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{t('manager.combinedGraphDesc', 'Combined Graph')}</h2>
                  <p className="text-gray-500">{t('manager.combinedGraphSubDesc', 'Compare online sales, POS, and Product In')}</p>
                </div>

                <div className="mt-4 md:mt-0 flex flex-wrap gap-2 bg-gray-50 p-1 rounded-lg">
                  {[
                    { id: '1h', label: t('manager.1h', '1 hour') },
                    { id: '1d', label: t('manager.1d', '1 day') },
                    { id: '1w', label: t('manager.1w', '1 week') },
                    { id: '1m', label: t('manager.1m', '1 month') },
                    { id: 'all', label: t('manager.all', 'All') }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setTimeFilter(filter.id)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${timeFilter === filter.id
                        ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                        }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[450px] w-full mt-4">
                {stats.graphData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={stats.graphData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="colorBcelCombined" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorCodCombined" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorPosCombined" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorProductInCombined" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#9ca3af" axisLine={false} tickLine={false} />
                      <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                      <Tooltip
                        formatter={(value, name) => [value.toLocaleString() + ' ' + currency, name]}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Area type="monotone" dataKey="BCEL ONE" name={t('manager.onlineSalesBcel', 'Online Sales (BCEL ONE)')} stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorBcelCombined)" activeDot={{ r: 4 }} />
                      <Area type="monotone" dataKey="COD" name={t('manager.onlineSalesCod', 'Online Sales (COD)')} stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorCodCombined)" activeDot={{ r: 4 }} />
                      <Area type="monotone" dataKey="posAmount" name={t('manager.posSalesLegend', 'POS Sales')} stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorPosCombined)" activeDot={{ r: 4 }} />
                      <Area type="monotone" dataKey="expense" name={t('manager.productInLegend', 'Product In')} stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorProductInCombined)" activeDot={{ r: 4 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    {t('manager.noGraphData', 'No graph data')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DashboardManager;
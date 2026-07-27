import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { dummyOrders } from '../assets/assets'
import { useTranslation } from 'react-i18next'

const MyOrders = () => {
  const { t } = useTranslation()

  const [myOrders, setMyOrder] = useState([])
  const [selectedSlip, setSelectedSlip] = useState(null)
  const { currency, axios, convertPrice } = useAppContext()

  const fetchMyOrder = async () => {
    try {
      const { data } = await axios.get('/api/order/user')
      if (data.success) {
        setMyOrder(data.orders)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchMyOrder()
  }, [])



  return (
    <div className='mt-16 pb-16 '>
      <div className='flex flex-col items-end w-max mb-8'>
        <p className=' text-2xl font-medium uppercase'> {t('myOrders.title', 'My Orders')} </p>
        <div className='w-16 h-0.5 bg-primary rounded-full'>

        </div>
      </div>

      {myOrders.map((order, index) => (
        <div key={index} className='bg-white border border-gray-200 rounded-[2px] mb-8 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow'>

          {/* Header: Order Info */}
          <div className='bg-gray-50 border-b border-gray-200 p-4 md:px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
            <div className='flex flex-wrap gap-x-8 gap-y-3 text-sm'>
              <div>
                <p className='text-gray-500 font-medium uppercase text-xs mb-1'>{t('myOrders.orderId', 'Order ID')}</p>
                <p className='text-gray-900 font-semibold'>{order._id}</p>
              </div>
              <div>
                <p className='text-gray-500 font-medium uppercase text-xs mb-1'>{t('myOrders.datePlaced', 'Date Placed')}</p>
                <p className='text-gray-900 font-semibold'>{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className='text-gray-500 font-medium uppercase text-xs mb-1'>{t('myOrders.totalAmount', 'Total Amount')}</p>
                <p className='text-gray-900 font-semibold'>{currency}{convertPrice(order.amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${order.isPaid ? 'border-green-500 text-green-700 bg-green-50' : 'border-orange-300 text-orange-700 bg-orange-50'}`}>
                {order.paymentType} {order.isPaid ? `✓ ${t('myOrders.paid', 'Paid')}` : t('myOrders.pending', '(Pending)')}
              </span>
              <span className='px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200'>
                {t(`myOrders.status.${order.status}`, order.status)}
              </span>
            </div>
          </div>

          {/* Body: Items and Slip */}
          <div className='flex flex-col md:flex-row'>

            {/* Left: Product Items */}
            <div className='flex-1 p-4 md:p-6 flex flex-col gap-4'>
              {order.items.map((item, idx) => {
                const categoryStr = Array.isArray(item.product.category) ? item.product.category[0] : item.product.category;
                return (
                <div key={idx} className={`flex items-center gap-4 ${idx !== order.items.length - 1 ? 'border-b border-gray-100 pb-4' : ''}`}>
                  <div className='shrink-0  p-2 rounded-lg border border-gray-100'>
                    <img src={item.product.image[0]} alt={item.product.name} className='w-16 h-16 object-cover ' />
                  </div>
                  <div className='flex-1'>
                    <h4 className='text-base font-bold text-gray-800 line-clamp-1'>{item.product.name}</h4>
                    <p className='text-sm text-gray-500'>{t('myOrders.category', 'Category:')} {t(`categoryNames.${categoryStr.toLowerCase()}`, categoryStr)}</p>
                  </div>
                  <div className='text-right'>
                    <p className='text-gray-900 font-semibold'>{currency}{convertPrice(item.product.offerPrice * (item.quantity || 1)).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
                    <p className='text-sm text-gray-500 font-medium'>{t('myOrders.qty', 'Qty:')} {item.quantity || 1}</p>
                  </div>
                </div>
              )})}
            </div>

            {/* Right: Payment Verification (Slip) */}
            {order.paymentType === "BCEL ONE" && order.paymentSlip && (
              <div className='md:w-48 bg-gray-50/50 border-t md:border-t-0 md:border-l border-gray-200 p-6 flex flex-col items-center justify-center'>
                <div onClick={() => setSelectedSlip(order.paymentSlip)} className='group relative block w-16 h-16 mx-auto rounded-lg overflow-hidden border border-gray-300 shadow-sm cursor-pointer'>
                  <img src={order.paymentSlip} alt="Slip" className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300' />
                  <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                    <svg className="w-6 h-6 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      ))}

      {/* Slip Image Modal */}
      {selectedSlip && (
        <div 
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setSelectedSlip(null)}
        >
            <div className="relative max-w-3xl max-h-[90vh] w-full flex justify-center animate-in fade-in zoom-in duration-200">
                <button 
                    onClick={() => setSelectedSlip(null)}
                    className="absolute -top-10 right-0 md:-right-10 text-white hover:text-gray-300 p-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <img 
                    src={selectedSlip} 
                    alt="Payment Slip Full" 
                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                    onClick={(e) => e.stopPropagation()} 
                />
            </div>
        </div>
      )}

    </div>
  )
}

export default MyOrders

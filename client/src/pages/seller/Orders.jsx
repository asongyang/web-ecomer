import React, { useState, useEffect } from 'react';

import { useAppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next';

const Orders = () => {
  const { t } = useTranslation();
  const { currency, axios, convertPrice } = useAppContext()
  const [orders, setOrders] = useState([])
  const [orderToDelete, setOrderToDelete] = useState(null)
  const [selectedSlip, setSelectedSlip] = useState(null)

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/api/order/seller')
      if (data.success) {
        setOrders(data.orders)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleDelete = async () => {
    if (!orderToDelete) return;
    try {
      const { data } = await axios.post('/api/order/delete', { orderId: orderToDelete })
      if (data.success) {
        toast.success(data.message)
        fetchOrders()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setOrderToDelete(null)
    }
  }

  const handlePrint = (order) => {
    const receiptContent = `
      <html>
        <head>
          <title>Receipt</title>
          <style>
            @page { margin: 0; }
            body { 
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
              width: 58mm;
              margin: 0 auto; 
              padding: 5px;
              color: #000;
            }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .text-xl { font-size: 18px; }
            .text-sm { font-size: 14px; }
            .text-xs { font-size: 12px; }
            .my-2 { margin: 8px 0; }
            .mb-2 { margin-bottom: 8px; }
            .mt-4 { margin-top: 12px; }
            .flex-between { display: flex; justify-content: space-between; }
            .divider { border-bottom: 1px dashed #000; margin: 8px 0; }
            .item-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px; }
            .item-name { width: 65%; text-align: left; }
            .item-price { width: 35%; text-align: right; }
          </style>
        </head>
        <body>
          <div class="text-center font-bold text-xl">P-Students Shop</div>
          <div class="text-center text-sm my-2">ໃບບິນຮັບເງິນ / Receipt (Online)</div>
          <div class="text-center text-xs mb-2">ວັນທີ: ${new Date(order.createdAt).toLocaleString('en-GB')}</div>
          
          <div class="divider"></div>
          
          <div class="flex-between text-xs font-bold mb-2">
            <span>ລາຍການ (Item)</span>
            <span>ລວມ (Total)</span>
          </div>
          
          ${order.items.map(item => {
            const price = convertPrice(item.product?.offerPrice || 0);
            return `
            <div class="item-row">
              <div class="item-name">
                <div>${item.product?.name || "Unknown Product"}</div>
                <div>${item.quantity} x ${price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</div>
              </div>
              <div class="item-price">${(price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</div>
            </div>
            `;
          }).join('')}
          
          <div class="divider"></div>
          
          <div class="flex-between font-bold text-sm">
            <span>ຍອດລວມ (Total):</span>
            <span>${convertPrice(order.amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency}</span>
          </div>
          
          <div class="divider"></div>
          <div class="text-xs mb-2 mt-4" style="line-height: 1.5;">
            <strong>ລູກຄ້າ:</strong> ${order.address?.firstName || ''} ${order.address?.lastName || ''}<br/>
            <strong>ເບີໂທ:</strong> ${order.address?.phone || ''}<br/>
            <strong>ທີ່ຢູ່:</strong> ${order.address?.street || ''}, ${order.address?.city || ''}, ${order.address?.state || ''}
          </div>

          <div class="divider"></div>
          <div class="text-center text-xs mt-4">
            ຂອບໃຈທີ່ໃຊ້ບໍລິການ!<br/>
            Thank you for your purchase!
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }

  useEffect(() => {
    fetchOrders();
  }, []);


  return (
    <div className="no-screellbar flex-1 h-[95vh] overflow-y-screell" >

      <div className="md:p-10 p-4 space-y-4">
        {/* Delete Confirmation Modal */}
        {orderToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-[2px] shadow-2xl w-[380px] max-w-[90%] p-8 text-center animate-fadeIn transform transition-all">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full  border-[3px] border-red-100 mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2">{t('orders.areYouSure', 'Are you sure?')}</h3>

              <p className="text-gray-500 mb-1 text-sm">
                {t('orders.confirmDelete', 'Are you sure you want to delete this order?')} <br />
                <span className="font-semibold text-gray-800 text-xs tracking-wider">ID: {orderToDelete}</span>
              </p>
              <p className="text-gray-400 text-xs mb-8">{t('orders.cannotUndo', 'This action cannot be undone')}</p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setOrderToDelete(null)}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium shadow-sm"
                >
                  {t('orders.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 bg-[#e60000] rounded-md text-white flex items-center justify-center gap-2 hover:bg-red-700 transition-colors font-medium shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {t('orders.deleteOrder', 'Delete Order')}
                </button>
              </div>
            </div>
          </div>
        )}

        <h2 className="text-lg font-medium">{t('orders.title', 'Orders List')}</h2>
        {orders.map((order, index) => (
          <div key={index} className="flex flex-col md:items-center md:flex-row  gap-5 justify-between  p-5 w-full rounded-md border border-gray-300 ">
            <div className="flex flex-col gap-3 max-w-80">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <img
                    className="w-12 h-12 object-cover rounded border border-gray-200"
                    src={item.product?.image?.[0] || assets.box_icon}
                    alt={item.product?.name || "Product"}
                  />
                  <div className="flex flex-col">
                    <p className="font-medium text-sm md:text-base line-clamp-2 leading-tight">
                      {item.product?.name || t('orders.unknownProduct', "Unknown Product")}
                    </p>
                    <p className="text-primary font-medium text-sm mt-0.5">
                      {t('orders.qty', 'Qty')}: {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-sm md:text-base text-black/60">
              <p className='font-medium mb-1'>
                {order.address.firstName}
                {order.address.lastName}</p>
              <p>{order.address.street},
                {order.address.city}, </p>
              <p>
                {order.address.state},
                {order.address.zipcode}, {order.address.country}</p>
              <p>

              </p>

              <p>
                {order.address.phone}
              </p>




            </div>

            <div className="flex items-center gap-3 my-auto">
              {order.paymentType === "BCEL ONE" && order.paymentSlip ? (
                <div onClick={() => setSelectedSlip(order.paymentSlip)}>
                  <img src={order.paymentSlip} alt="slip" title="Click to view slip" className="w-12 h-12 object-cover rounded border border-gray-200 hover:opacity-80 transition-opacity cursor-pointer shadow-sm" />
                </div>
              ) : (
                <div title={t('orders.cod', 'Cash on Delivery')} className="w-12 h-12 flex items-center justify-center  rounded border  shadow-sm">
                  <span className="text-[11px] font-bold text-gray-400 tracking-wider">COD</span>
                </div>
              )}
              <p className="font-medium text-lg">
                {currency}{convertPrice(order.amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="flex flex-col text-sm md:text-base text-black/60">
              <p>{t('orders.method', 'Method:')} {order.paymentType}</p>
              <p>{t('orders.date', 'Date:')} {new Date(order.createdAt).toLocaleDateString()}</p>
              <p>{t('orders.payment', 'Payment:')} {order.isPaid ? t('orders.paid', "Paid") : t('orders.pending', "Pending")}</p>
            </div>

            <div className="flex md:flex-col gap-2 mt-4 md:mt-0 justify-center">
              <button onClick={() => handlePrint(order)} className="flex items-center justify-center gap-1 bg-green-500 hover:bg-green-800 text-white px-3 py-1.5 rounded transition text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0v-2.94a2.25 2.25 0 0 1 2.25-2.25h6a2.25 2.25 0 0 1 2.25 2.25v2.94ZM15 12h.008v.008H15V12Zm-3 0h.008v.008H12V12Zm-3 0h.008v.008H9V12Z" />
                </svg>

              </button>
              <button onClick={() => setOrderToDelete(order._id)} className="flex items-center justify-center gap-1 bg-[#0F172A]  text-white px-3 py-1.5 rounded transition text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>

              </button>
            </div>
          </div>
        ))}
      </div>

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

export default Orders

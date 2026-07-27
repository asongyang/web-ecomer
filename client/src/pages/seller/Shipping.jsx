import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

function Shipping() {
    const { t } = useTranslation();
    const { axios, currency, convertPrice } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/order/seller');
            if (data.success) {
                setOrders(data.orders);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (orderId) => {
        setSelectedOrderId(orderId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedOrderId(null);
        setIsModalOpen(false);
    };

    const handleConfirmShipping = async () => {
        if (!selectedOrderId) return;

        try {
            const { data } = await axios.post('/api/order/status', {
                orderId: selectedOrderId,
                status: 'จัดส่งแล้ว'
            });

            if (data.success) {
                toast.success(t('shipping.successToast', 'Status updated to Shipped successfully!'));
                fetchOrders(); // Refresh the list
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            handleCloseModal();
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 md:p-8 bg-gray-50 min-h-screen overflow-y-auto">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{t('shipping.title', 'Shipping Management')}</h1>
                        <p className="text-gray-500">{t('shipping.desc', 'Check orders and update shipping status')}</p>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
                        <div className="text-gray-400 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">{t('shipping.noOrders', 'No Orders')}</h3>
                        <p className="text-gray-500">{t('shipping.noOrdersDesc', 'No pending orders for shipping at this time')}</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {orders.map((order, index) => (
                            <div key={index} className="bg-white rounded-[2px] shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6">
                                {/* Order Info */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-sm text-gray-500">{t('shipping.orderId', 'Order ID:')} <span className="text-gray-800 font-mono">{order._id.slice(-8).toUpperCase()}</span></p>
                                            <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('en-GB')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-blue-600 text-lg">{currency}{convertPrice(order.amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${order.paymentType.includes('COD') ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                                {order.paymentType}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm items-center bg-gray-50 p-2 rounded">
                                                <div className="flex items-center gap-3">
                                                    <img src={item.product?.image[0]} alt="" className="w-10 h-10 object-cover rounded bg-white" />
                                                    <span className="font-medium text-gray-700">{item.product?.name || t('shipping.productFallback', 'Product')}</span>
                                                </div>
                                                <div className="text-gray-600">
                                                    {item.quantity} x {currency}{convertPrice(item.product?.offerPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="text-sm bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                                        <div className="text-gray-600 leading-relaxed">
                                            <span className="font-medium text-gray-800 mr-2">{t('shipping.address', 'Shipping Address:')}</span>
                                            {typeof order.address === 'object' ? (
                                                <span>
                                                    <span className="font-medium text-gray-700 mr-2">{order.address?.firstName} {order.address?.lastName}</span>
                                                    <span className="mr-2">| {t('shipping.phone', 'Phone')}: {order.address?.phone} |</span>
                                                    <span>{order.address?.street}, {order.address?.city}, {order.address?.state}, {order.address?.country} {order.address?.zipCode}</span>
                                                </span>
                                            ) : (
                                                <span>{order.address}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Area */}
                                <div className="md:w-64 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">{t('shipping.currentStatus', 'Current Status:')}</p>
                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${order.status === 'จัดส่งแล้ว'
                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                            : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                            }`}>
                                            <span className={`w-2 h-2 rounded-full mr-2 ${order.status === 'จัดส่งแล้ว' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                            {order.status === 'จัดส่งแล้ว' ? t('shipping.shipped', 'Shipped') : t('shipping.pending', 'Pending')}
                                        </span>
                                    </div>

                                    <div className="mt-6 md:mt-0">
                                        <button
                                            onClick={() => handleOpenModal(order._id)}
                                            disabled={order.status === 'จัดส่งแล้ว'}
                                            className={`w-full py-2 px-4 text-sm rounded-lg font-semibold transition-all ${order.status === 'จัดส่งแล้ว'
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transform hover:-translate-y-0.5'
                                                }`}
                                        >
                                            {order.status === 'จัดส่งแล้ว' ? t('shipping.shipped', 'Shipped') : t('shipping.shipBtn', 'Ship Item')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-[2px] shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('shipping.confirmTitle', 'Confirm Shipping?')}</h3>
                            <p className="text-gray-500">
                                {t('shipping.confirmDesc1', 'You are about to change the status of this order to "Shipped".')}
                                <br />{t('shipping.confirmDesc2', 'This action cannot be undone.')}
                            </p>
                        </div>
                        <div className="bg-gray-50 p-4 flex gap-3 justify-end border-t border-gray-100">
                            <button
                                onClick={handleCloseModal}
                                className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                            >
                                {t('shipping.cancel', 'Cancel')}
                            </button>
                            <button
                                onClick={handleConfirmShipping}
                                className="px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-colors"
                            >
                                {t('shipping.confirmBtn', 'Confirm Shipping')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Shipping;
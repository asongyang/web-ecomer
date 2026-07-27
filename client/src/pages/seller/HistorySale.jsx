import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

function HistorySale() {
    const { t } = useTranslation();
    const { axios, currency, convertPrice } = useAppContext();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSale, setSelectedSale] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/sale/history');
            if (data.success) {
                setSales(data.sales);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        if (!selectedSale) return;

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
          <div class="text-center text-sm my-2">ໃບບິນຮັບເງິນ / Receipt (Reprint)</div>
          <div class="text-center text-xs mb-2">ວັນທີ: ${new Date(selectedSale.createdAt).toLocaleString('en-GB')}</div>
          
          <div class="divider"></div>
          
          <div class="flex-between text-xs font-bold mb-2">
            <span>ລາຍການ (Item)</span>
            <span>ລວມ (Total)</span>
          </div>
          
          ${selectedSale.items.map(item => {
            const price = convertPrice(item.price || 0);
            return `
            <div class="item-row">
              <div class="item-name">
                <div>${item.name}</div>
                <div>${item.quantity} x ${price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</div>
              </div>
              <div class="item-price">${(price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</div>
            </div>
            `;
          }).join('')}
          
          <div class="divider"></div>
          
          <div class="flex-between font-bold text-sm">
            <span>ຍອດລວມ (Total):</span>
            <span>${convertPrice(selectedSale.amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency}</span>
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

        // Slight delay to ensure HTML is rendered before printing
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
            setSelectedSale(null);
        }, 250);
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/30">
            <h2 className="pb-4 text-xl font-bold text-gray-800">{t('history.title', 'Sales History')}</h2>

            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : sales.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-lg border border-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-base font-medium">{t('history.noData', 'No sales history yet')}</p>
                </div>
            ) : (
                <div className="w-full overflow-x-auto rounded-[2px] bg-white border border-gray-200 shadow-sm">
                    <table className="w-full table-auto text-sm">
                        <thead className="text-gray-700 bg-gray-50 text-left border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold">{t('history.dateTime', 'Date & Time')}</th>
                                <th className="px-6 py-4 font-semibold">{t('history.totalItems', 'Total Items')}</th>
                                <th className="px-6 py-4 font-semibold">{t('history.totalAmount', 'Total Amount')}</th>
                                <th className="px-6 py-4 font-semibold">{t('history.payment', 'Payment')}</th>
                                <th className="px-6 py-4 font-semibold text-center">{t('history.action', 'Action')}</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 divide-y divide-gray-100">
                            {sales.map((sale) => (
                                <tr key={sale._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-800">{new Date(sale.createdAt).toLocaleDateString('en-GB')}</div>
                                        <div className="text-xs text-gray-400">{new Date(sale.createdAt).toLocaleTimeString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-medium text-xs">
                                            {sale.items.reduce((sum, item) => sum + item.quantity, 0)} {t('history.items', 'items')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-primary">{currency}{convertPrice(sale.amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded text-xs font-medium border border-green-100">
                                            {sale.paymentType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => setSelectedSale(sale)}
                                            className="text-primary hover:text-blue-800 font-medium text-sm transition-colors hover:underline"
                                        >
                                            {t('history.viewDetails', 'View Details')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Details Modal */}
            {selectedSale && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2px] shadow-xl w-[500px] max-w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="text-gray-800 font-bold text-lg">{t('history.receiptDetails', 'Receipt Details')}</h3>
                                <p className="text-xs text-gray-500 mt-1">{new Date(selectedSale.createdAt).toLocaleString('en-GB')}</p>
                            </div>
                            <button
                                onClick={() => setSelectedSale(null)}
                                className="text-gray-400 hover:text-gray-600 p-1   transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-4">
                                {selectedSale.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{item.quantity} x {currency}{convertPrice(item.price).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
                                        </div>
                                        <div className="font-bold text-gray-700">
                                            {currency}{convertPrice(item.quantity * item.price).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-semibold text-gray-600">{t('history.totalLabel', 'Total:')}</span>
                                <span className="text-xl font-bold text-primary">{currency}{convertPrice(selectedSale.amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setSelectedSale(null)}
                                    className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-[2px] font-medium hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                    {t('history.close', 'Close')}
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="flex-1 py-2.5 bg-[#1a56db] text-white rounded-[2px] font-medium hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    {t('history.print', 'Print')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default HistorySale;
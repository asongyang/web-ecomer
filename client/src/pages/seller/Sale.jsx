import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { categories } from '../../assets/assets';
import { useTranslation } from 'react-i18next';

function Sale() {
  const { t } = useTranslation();
  const { products, currency, axios, fetchProducts, convertPrice } = useAppContext();
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastOrderTotal, setLastOrderTotal] = useState(0);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.barcode && product.barcode.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' ||
        (Array.isArray(product.category) ? product.category.includes(selectedCategory) : product.category === selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const addToCart = (product) => {
    if (!product.inStock || product.stock <= 0) {
      toast.error(t('sale.outOfStock', 'Product is out of stock'));
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item._id === product._id);
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          toast.error(t('sale.exceedStock', 'Cannot add more than available stock'));
          return prevCart;
        }
        return prevCart.map(item =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item._id === productId) {
          const newQty = item.quantity + delta;
          if (newQty > item.stock) {
            toast.error(t('sale.exceedStock', 'Cannot exceed available stock'));
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, item) => sum + (item.offerPrice * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error(t('sale.cartEmptyToast', 'Cart is empty'));
      return;
    }

    try {
      const saleData = {
        items: cart.map(item => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.offerPrice
        })),
        amount: total,
        paymentType: 'POS'
      };

      const { data } = await axios.post('/api/sale/place', saleData);

      if (data.success) {
        setLastOrderTotal(total);
        setShowSuccessModal(true);
        if (fetchProducts) {
          await fetchProducts(); // Refresh products to update stock quantities
        }
      } else {
        toast.error(data.message || t('sale.checkoutFailed', 'Checkout failed'));
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setCart([]);
  };

  const handlePrint = () => {
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
          <div class="text-center text-sm my-2">ໃບບິນຮັບເງິນ / Receipt</div>
          <div class="text-center text-xs mb-2">ວັນທີ: ${new Date().toLocaleString('en-GB')}</div>
          
          <div class="divider"></div>
          
          <div class="flex-between text-xs font-bold mb-2">
            <span>ລາຍການ (Item)</span>
            <span>ລວມ (Total)</span>
          </div>
          
          ${cart.map(item => {
            const price = convertPrice(item.offerPrice || 0);
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
            <span>${convertPrice(lastOrderTotal).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency}</span>
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
      handleCloseModal();
    }, 250);
  };

  return (
    <div className="flex h-[90vh] w-full overflow-hidden rounded-lg ">

      {/* Left Panel: Products */}
      <div className="flex-1 flex flex-col h-full bg-white border-r border-gray-200">
        {/* Categories */}
        <div className="h-[73px] px-6 border-b border-gray-200 bg-white flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === 'All' ? 'bg-primary text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}`}
          >
            {t('sale.allItems', 'All Items')}
          </button>
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat.text)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat.text ? 'bg-primary text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}`}
            >
              {cat.text}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 bg-white custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map(product => (
              <div
                key={product._id}
                onClick={() => addToCart(product)}
                className={`bg-white rounded-[2px] border border-gray-200 overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 flex flex-col ${(!product.inStock || product.stock <= 0) ? 'opacity-50 grayscale' : ''}`}
              >
                <div className="aspect-[4/3] bg-white p-2 border-b border-gray-100">
                  <img src={product.image?.[0]} alt={product.name} className="w-full h-full object-contain" />
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight mb-1">{product.name}</p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-primary font-bold text-base">{currency}{convertPrice(product.offerPrice).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-medium border border-gray-200">{t('sale.stock', 'Stock')}: {product.stock || 0}</span>
                  </div>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" />
                </svg>
                <p className="font-medium">{t('sale.noProductsFound', 'No products found')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel: Cart */}
      <div className="w-[380px] bg-white flex flex-col h-full shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10">

        {/* Cart Header */}
        <div className="h-[73px] px-6 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">

            <h2 className="text-lg font-bold text-gray-800">{t('sale.currentOrder', 'Current Order')}</h2>
          </div>
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors bg-red-50 px-2 py-1 rounded">
              {t('sale.clearAll', 'Clear All')}
            </button>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-gray-50/50 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="font-medium text-gray-500">{t('sale.cartEmpty', 'Cart is empty')}</p>
              <p className="text-xs mt-1">{t('sale.cartEmptyDesc', 'Click products to add them to the cart')}</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item._id} className="flex gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                <img src={item.image?.[0]} alt={item.name} className="w-12 h-12 object-contain rounded bg-gray-50 border border-gray-100" />
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-semibold text-gray-800 line-clamp-1 mr-2">{item.name}</h4>
                    <span className="text-sm font-bold text-gray-800">{currency}{convertPrice(item.offerPrice * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="mt-auto flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-medium">{currency}{convertPrice(item.offerPrice).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} / {t('sale.unit', 'unit')}</span>

                    {/* Quantity Controls */}
                    <div className="flex items-center bg-gray-50 rounded border border-gray-200">
                      <button
                        onClick={() => updateQuantity(item._id, -1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-l transition-colors"
                      >-</button>
                      <span className="text-xs font-bold w-6 text-center text-gray-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, 1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-r transition-colors"
                      >+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Summary */}
        <div className="p-4 border-t border-gray-200 bg-white space-y-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0">
          <div className="flex justify-between items-end">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{t('sale.total', 'Total')}</span>
            <span className="text-2xl font-black text-primary">{currency}{convertPrice(total).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-2.5 rounded-[2px] text-white font-semibold text-base transition-all flex items-center justify-center gap-2 ${cart.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary hover:bg-opacity-90 shadow-md hover:-translate-y-0.5'}`}
          >
            <span>{t('sale.checkout', 'Checkout')}</span>
          </button>
        </div>

      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2px] shadow-xl w-[400px] max-w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-gray-800 font-semibold">{t('sale.paymentSuccess', 'Payment Successful!')}</h3>
            </div>

            {/* Modal Body */}
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#eafbf0] rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#00c853]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">{t('sale.paymentSuccess', 'Payment Successful!')}</h2>
              <p className="text-gray-500 text-sm">
                {t('sale.totalAmount', 'Total Amount')} <span className="text-[#00c853] font-bold">{convertPrice(lastOrderTotal).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {currency}</span> {t('sale.success', 'Success')}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 flex gap-3 border-t border-gray-100">
              <button
                onClick={handleCloseModal}
                className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-[2px] font-medium hover:bg-gray-50 transition-colors shadow-sm"
              >
                {t('sale.noPrint', "Don't Print")}
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 py-2.5 bg-[#1a56db] text-white rounded-[2px] font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                {t('sale.printReceipt', 'Print Receipt')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Sale;
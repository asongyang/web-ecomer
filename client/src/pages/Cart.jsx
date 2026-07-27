import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets, dummyAddress } from "../assets/assets";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

const Cart = () => {
    const { t } = useTranslation();

    const { products, currency, cartItems, removeFromCart, getCartCount, updateCartItem, navigate, getCartAmount, axios, user, setCartItems, convertPrice } = useAppContext()

    const [cartArray, setCartArray] = useState([])
    const [addresses, setAddresses] = useState([])

    const [showAddress, setShowAddress] = useState(false)
    const [selectedAddress, setSelectedAddress] = useState(null)
    const [paymentOption, setPaymentOption] = useState("COD")
    const [showBcelModal, setShowBcelModal] = useState(false)
    const [slipFile, setSlipFile] = useState(null)

    const fetchAddresses = async () => {
        try {
            const { data } = await axios.post('/api/address/get')
            if (data.success && data.addresses.length > 0) {
                setAddresses(data.addresses)
                setSelectedAddress(data.addresses[0])
            }
        } catch (error) {
            console.log(error)
        }
    }

    const getCart = () => {
        let tempArray = []
        for (const key in cartItems) {
            const product = products.find((item) => item._id == key)
            if (product) {
                tempArray.push({ ...product, quantity: cartItems[key] })
            }
        }
        setCartArray(tempArray)
    }
    const placeOder = async () => {
        try {
            if (!selectedAddress) {
                return toast.error("Please select a delivery address")
            }

            const items = []
            for (const key in cartItems) {
                if (cartItems[key] > 0) {
                    items.push({
                        product: key,
                        quantity: cartItems[key]
                    })
                }
            }

            if (items.length === 0) {
                return toast.error("Your cart is empty")
            }

            if (paymentOption === "COD") {
                const { data } = await axios.post('/api/order/cod', {
                    items,
                    address: selectedAddress._id
                })
                if (data.success) {
                    toast.success("Order Placed Successfully")
                    setCartItems({}) // Clear the cart
                    navigate('/my-order') // Navigate to orders page
                } else {
                    toast.error(data.message)
                }
            } else if (paymentOption === "bcel") {
                setShowBcelModal(true)
            } else if (paymentOption === "Online") {
                const { data } = await axios.post('/api/order/stripe', {
                    items,
                    address: selectedAddress._id
                })
                if (data.success) {
                    window.location.replace(data.session_url)
                } else {
                    toast.error(data.message)
                }
            } else {
                toast.error("Invalid payment method")
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const submitBcelOrder = async () => {
        if (!slipFile) {
            return toast.error("Please upload payment slip")
        }
        try {
            const items = []
            for (const key in cartItems) {
                if (cartItems[key] > 0) {
                    items.push({
                        product: key,
                        quantity: cartItems[key]
                    })
                }
            }

            const payload = new FormData();
            payload.append('orderData', JSON.stringify({
                items,
                address: selectedAddress._id
            }));
            payload.append('slip', slipFile);

            const { data } = await axios.post('/api/order/bcel', payload);
            if (data.success) {
                toast.success("Order Placed Successfully via BCEL ONE")
                setCartItems({}) // Clear the cart
                setShowBcelModal(false)
                setSlipFile(null)
                navigate('/my-order') // Navigate to orders page
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }
    useEffect(() => {
        if (products.length > 0 && cartItems) {
            getCart()
        }
    }, [products, cartItems])

    useEffect(() => {
        if (user) {
            fetchAddresses()
        }
    }, [user])


    return products.length > 0 && cartItems ? (
        <div className="flex flex-col md:flex-row mt-16 relative">

            {/* BCEL ONE Payment Modal */}
            {showBcelModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-[450px] max-w-full overflow-hidden animate-in fade-in zoom-in duration-200 p-5">

                        <div className="text-center mb-2">
                            <h3 className="text-xl font-bold text-gray-800">{t('cart.bcelTitle', 'ຊຳລະເງິນຜ່ານ BCEL One')}</h3>
                        </div>

                        <div className="flex flex-col items-center">

                            {/* becel logo */}
                            <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center mb-2 relative overflow-hidden">
                                <img src={assets.be} alt="BCEL Logo" className="w-full h-full object-contain" />
                            </div>

                            {/* QR Code */}
                            <div className="w-32 h-32 md:w-40 md:h-40 border border-gray-200 rounded-xl flex items-center justify-center bg-white mb-3 relative overflow-hidden shadow-sm p-2">
                                <img src={assets.qr} alt="BCEL QR Code" className="w-full h-full object-contain" />
                            </div>

                            {/* Amount */}
                            <div className="text-center mb-1">
                                <p className="font-bold text-gray-800 text-lg">{t('cart.bcelAmount', 'ຍອດຊຳລະ:')} {currency}{convertPrice(getCartAmount() + getCartAmount() * 2 / 100).toLocaleString()}</p>
                            </div>
                            <p className="text-gray-500 text-sm mb-3 text-center">
                                {t('cart.bcelScanDesc', 'ສະແກນ QR Code ເພື່ອທຳການຊຳລະເງິນ')}
                            </p>

                            {/* Upload Slip Box */}
                            <div className="w-full bg-[#f4f7fc] rounded-lg p-3 mb-4">
                                <p className="text-[#0056b3] text-sm font-medium mb-2">{t('cart.bcelUploadSlip', 'ແນບສະລິບການໂອນເງິນ')}</p>
                                <input
                                    type="file"
                                    id="slipUpload"
                                    accept="image/*"
                                    className="text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-[#0056b3] file:text-white hover:file:bg-blue-700 cursor-pointer"
                                    onChange={(e) => setSlipFile(e.target.files[0])}
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 w-full">
                                <button
                                    onClick={() => {
                                        setShowBcelModal(false);
                                        setSlipFile(null);
                                    }}
                                    className="px-6 py-2 bg-[#9e9e9e] text-white rounded text-sm font-medium hover:bg-gray-500 transition-colors cursor-pointer"
                                >
                                    {t('cart.cancel', 'ຍົກເລີກ')}
                                </button>
                                <button
                                    onClick={submitBcelOrder}
                                    className="px-6 py-2 bg-[#00a651] text-white rounded text-sm font-medium hover:bg-green-700 transition-colors shadow-sm cursor-pointer"
                                >
                                    {t('cart.confirmPayment', 'ຢືນຢັນການຊຳລະເງິນ')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className='flex-1 max-w-4xl'>
                <h1 className="text-3xl font-medium mb-6">
                    {t('cart.shoppingCart', 'Shopping Cart')} <span className="text-sm text-primary"> {getCartCount()} {t('cart.items', 'Items')}</span>
                </h1>

                <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3">
                    <p className="text-left">{t('cart.productDetails', 'Product Details')}</p>
                    <p className="text-center">{t('cart.subtotal', 'Subtotal')}</p>
                    <p className="text-center">{t('cart.action', 'Action')}</p>
                </div>

                {cartArray.map((product, index) => (
                    <div key={index} className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3">
                        <div className="flex items-center md:gap-6 gap-3">
                            <div onClick={() => {
                                navigate(`/product/${product._id}`); scrollTo(0, 0)
                            }} className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded">
                                <img className="max-w-full h-full object-cover" src={product.image[0]} alt={product.name} />
                            </div>
                            <div>
                                <p className="hidden md:block font-semibold">{product.name}</p>
                                <div className="font-normal text-gray-500/70">
                                    <p>{t('cart.weight', 'Weight:')} <span>{product.weight || "N/A"}</span></p>
                                    <div className='flex items-center'>
                                        <p>{t('cart.qty', 'Qty:')}</p>
                                        <select onChange={e => updateCartItem(product._id, Number(e.target.value))}
                                            value={cartItems[product._id]} className='outline-none'>
                                            {Array(10).fill('').map((_, index) => (
                                                <option key={index} value={index + 1}>{index + 1}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-center">{currency}{convertPrice(product.offerPrice * product.quantity).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
                        <button onClick={() => removeFromCart(product._id)} className="cursor-pointer mx-auto">
                            <img src={assets.remove_icon} alt="remove"
                                className="inline-block w-6 h-6 " />
                        </button>
                    </div>)
                )}

                <button onClick={() => { navigate("/products"); scrollTo(0, 0) }} className="group cursor-pointer flex items-center mt-8 gap-2 text-primary font-medium">
                    <img className="group-hover:-translate-x-1 transition" src={assets.arrow_right_icon_colored} alt="arrow" />
                    {t('cart.continueShopping', 'Continue Shopping')}
                </button>

            </div>

            <div className="max-w-[360px] w-full bg-gray-100/40 p-5 max-md:mt-16 border border-gray-300/70">
                <h2 className="text-xl md:text-xl font-medium">{t('cart.orderSummary', 'Order Summary')}</h2>
                <hr className="border-gray-300 my-5" />

                <div className="mb-6">
                    <p className="text-sm font-medium uppercase">{t('cart.deliveryAddress', 'Delivery Address')}</p>
                    <div className="relative flex justify-between items-start mt-2">
                        <p className="text-gray-500">{selectedAddress ? ` ${selectedAddress.street}, 
                        ${selectedAddress.city} ,
                         ${selectedAddress.state} ,${selectedAddress.country}` : t('cart.noAddressFound', 'No address found')}</p>
                        <button onClick={() => setShowAddress(!showAddress)} className="text-primary hover:underline cursor-pointer">
                            {t('cart.change', 'Change')}
                        </button>
                        {showAddress && (
                            <div className="absolute top-12 py-1 bg-white border
                             border-gray-300 text-sm w-full">
                                {addresses.map((address, index) => (
                                    <p key={index} onClick={() => {
                                        setSelectedAddress(address);
                                        setShowAddress(false)
                                    }} className="text-gray-500
                                  p-2 hover:bg-gray-100 cursor-pointer">
                                        {address.street}, {address.city},{address.state}
                                        ,{address.country}
                                    </p>
                                ))}
                                <p onClick={() => navigate("/add-address")} className="text-primary text-center cursor-pointer p-2 hover:bg-primary-dull">
                                    {t('cart.addAddress', 'Add address')}
                                </p>
                            </div>
                        )}
                    </div>

                    <p className="text-sm font-medium uppercase mt-6">{t('cart.paymentMethod', 'Payment Method')}</p>

                    <select onChange={e => setPaymentOption(e.target.value)} className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 outline-none ">
                        <option value="COD">{t('cart.cod', 'Cash On Delivery')}</option>
                        <option value="bcel">{t('cart.bcelOne', 'Bcel ONE')}</option>
                        <option value="Online">{t('cart.onlinePayment', 'Online Payment')}</option>
                    </select>
                </div>

                <hr className="border-gray-300" />

                <div className="text-gray-500 mt-4 space-y-2">
                    <p className="flex justify-between">
                        <span>{t('cart.price', 'Price')}</span><span>{currency}{convertPrice(getCartAmount()).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                    </p>
                    <p className="flex justify-between">
                        <span>{t('cart.shippingFee', 'Shipping Fee')}</span><span className="text-green-600">{t('cart.free', 'Free')}</span>
                    </p>
                    <p className="flex justify-between">
                        <span>{t('cart.tax', 'Tax (2%)')}</span><span>{currency}{convertPrice(getCartAmount() * 2 / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                    </p>
                    <p className="flex justify-between text-lg font-medium mt-3">
                        <span>{t('cart.totalAmount', 'Total Amount:')}</span><span>
                            {currency}{convertPrice(getCartAmount() + getCartAmount() * 2 / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                    </p>
                </div>

                <button onClick={placeOder} className="w-full py-3 mt-6 cursor-pointer bg-primary text-white font-medium hover:bg-primary-dull transition">
                    {paymentOption === "COD" ? t('cart.placeOrder', 'Place Order') : t('cart.proceedToCheckout', 'Proceed to Checkout')}
                </button>
            </div>
        </div>
    ) : null
}
export default Cart;


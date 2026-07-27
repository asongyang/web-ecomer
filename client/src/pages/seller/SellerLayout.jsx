
import React from "react";


import { Link, NavLink, Outlet } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import { useTranslation } from "react-i18next";

const SellerLayout = () => {
    const { t, i18n } = useTranslation();




    const { setIsSeller, searchQuery, setSearchQuery, navigate, currency, setCurrency } = useAppContext();
    const [isCurrencyModalOpen, setIsCurrencyModalOpen] = React.useState(false);



    const sidebarLinks = [
        { name: t('seller.dashboard', 'Dashboard'), path: "/seller/dashboard", icon: assets.dashboard_seller },
        { name: t('seller.addProduct', 'Add Product'), path: "/seller", icon: assets.add_icon },
        { name: t('seller.productList', 'Product List'), path: "/seller/product-list", icon: assets.product_list_icon },
        { name: t('seller.sale', 'Sale'), path: "/seller/sale", icon: assets.product_list_icon },
        { name: t('seller.history', 'History'), path: "/seller/history", icon: assets.product_list_icon },
        { name: t('seller.shipping', 'Shipping'), path: "/seller/shipping", icon: assets.product_list_icon },
        { name: t('seller.exchange', 'Exchange'), path: "/seller/exchange", icon: assets.product_list_icon },
        { name: t('seller.order', 'Order'), path: "/seller/orders", icon: assets.order_icon },
    ];


    const logout = async () => {
        setIsSeller(false);
    }

    return (
        <div className="flex flex-col min-h-screen">
            {/* Sticky Navbar */}
            <div className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white">
                <Link to='/'>
                    <img src={assets.logo1} alt="logo1" className="cursor-pointer w-6 md:w-10" />
                </Link>
                <div className="flex items-center gap-6">
                    <div className="hidden lg:flex items-center text-sm border border-gray-300 overflow-hidden">
                        <input
                            onChange={(e) => setSearchQuery(e.target.value)}
                            value={searchQuery}
                            className="py-2 px-4 w-72 bg-transparent outline-none placeholder-gray-400 text-base"
                            type="text"
                            placeholder={t('nav.enterKeywords', 'Enter keywords')}
                        />
                        <button
                            onClick={() => searchQuery.length > 0 && navigate('/seller/product-list')}
                            className="bg-primary hover:bg-primary-dull transition text-white text-base font-medium px-5 py-2 whitespace-nowrap cursor-pointer"
                        >
                            {t('nav.search', 'Search')}
                        </button>
                    </div>

                    {/* Currency Switcher Button */}
                    <div
                        onClick={() => setIsCurrencyModalOpen(true)}
                        className="flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 bg-white hover:bg-gray-50 transition shadow-sm cursor-pointer"
                    >
                        <span className="text-sm font-bold text-gray-700">{currency}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    </div>

                    {/* Language Switcher */}
                    <div className="relative group cursor-pointer z-50">
                        <div className="flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 bg-white hover:bg-gray-50 transition shadow-sm">
                            <img
                                src={`https://flagcdn.com/w40/${i18n.language === 'en' ? 'us' : i18n.language === 'th' ? 'th' : 'la'}.png`}
                                alt="flag"
                                className="w-7 h-5 object-cover rounded-[2px]"
                            />
                            <span className="text-sm font-medium uppercase text-gray-700">{i18n.language || 'en'}</span>
                        </div>
                        <ul className="hidden group-hover:block absolute top-full mt-1 right-0 bg-white shadow-lg border border-gray-100 rounded-lg w-36 py-1.5 z-50 overflow-hidden">
                            <li onClick={() => i18n.changeLanguage('en')} className="flex items-center gap-3 px-4 py-2 hover:bg-primary/10 hover:text-primary transition-colors text-sm cursor-pointer font-medium text-gray-600">
                                <img src="https://flagcdn.com/w40/us.png" alt="English" className="w-7 h-5 object-cover rounded-[1px] shadow-sm" /> English
                            </li>
                            <li onClick={() => i18n.changeLanguage('th')} className="flex items-center gap-3 px-4 py-2 hover:bg-primary/10 hover:text-primary transition-colors text-sm cursor-pointer font-medium text-gray-600">
                                <img src="https://flagcdn.com/w40/th.png" alt="Thai" className="w-7 h-5 object-cover rounded-[1px] shadow-sm" /> ภาษาไทย
                            </li>
                            <li onClick={() => i18n.changeLanguage('lo')} className="flex items-center gap-3 px-4 py-2 hover:bg-primary/10 hover:text-primary transition-colors text-sm cursor-pointer font-medium text-gray-600">
                                <img src="https://flagcdn.com/w40/la.png" alt="Lao" className="w-7 h-5 object-cover rounded-[1px] shadow-sm" /> ພາສາລາວ
                            </li>
                        </ul>
                    </div>

                    <div className="flex items-center gap-4 text-gray-500">
                        <p className="hidden sm:block text-base">{t('seller.hiAdmin', 'Hi! Admin')}</p>
                        <button onClick={logout} className='border border-gray-300 hover:bg-gray-50 transition rounded-full text-base font-medium px-5 py-1.5'>{t('seller.logout', 'Logout')}</button>
                    </div>
                </div>
            </div>

            {/* Sidebar + Content */}
            <div className="flex flex-1 overflow-hidden">
                <div className="md:w-64 w-16 border-r border-gray-300 flex flex-col flex-shrink-0 overflow-y-auto">
                    {sidebarLinks.map((item) => (
                        <NavLink to={item.path} key={item.name} end={item.path === "/seller"}
                            className={({ isActive }) => `flex items-center py-3 px-4 gap-3 
                            ${isActive ? "border-r-4 md:border-r-[6px] bg-primary/10 border-primary text-primary-dull"
                                    : "hover:bg-gray-100/90 border-white "
                                }`
                            }
                        >
                            <img src={item.icon} alt={`${item.name} icon`} className="w-7 h-7" />
                            <p className="md:block hidden text-center">{item.name}</p>
                        </NavLink>
                    ))}
                </div>
                <div className="flex-1 overflow-y-auto">
                    <Outlet />
                </div>
            </div>

            {/* Currency Modal */}
            {isCurrencyModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-[2px] shadow-2xl w-full max-w-[430px] overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">{t('seller.selectCurrency', 'Select Currency')}</h3>
                            <button onClick={() => setIsCurrencyModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-4 space-y-2">
                            {['THB', 'LAK', 'USD'].map((cur) => (
                                <div
                                    key={cur}
                                    onClick={() => {
                                        setCurrency(cur);
                                        setIsCurrencyModalOpen(false);
                                    }}
                                    className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border-2 transition-all ${
                                        currency === cur 
                                        ? 'border-primary bg-primary/5' 
                                        : 'border-transparent hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                                            currency === cur ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {cur === 'THB' ? '฿' : cur === 'LAK' ? '₭' : '$'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{cur}</p>
                                            <p className="text-sm text-gray-500">
                                                {cur === 'THB' ? 'Thai Baht' : cur === 'LAK' ? 'Lao Kip' : 'US Dollar'}
                                            </p>
                                        </div>
                                    </div>
                                    {currency === cur && (
                                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 text-white">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SellerLayout;
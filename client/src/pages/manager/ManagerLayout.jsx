
import React, { useState } from "react";


import { Link, NavLink, Outlet } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import { useTranslation } from "react-i18next";

const ManagerLayout = () => {
    const { t, i18n } = useTranslation();
    const { setIsManager, axios, navigate, searchQuery, setSearchQuery, currency, setCurrency } = useAppContext();
    const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);

    const sidebarLinks = [
        { name: t('manager.dashboard', 'Dashboard'), path: "/manager/dashboard", icon: assets.dashboard_seller },
        { name: t('manager.addProduct', 'Add Product'), path: "/manager", icon: assets.add_icon },
        { name: t('manager.productList', 'Product List'), path: "/manager/product-list", icon: assets.product_list_icon },
        { name: t('manager.allProduct', 'All Product'), path: "/manager/all-product", icon: assets.product_list_icon },
        { name: t('manager.productIn', 'Product In'), path: "/manager/product-in", icon: assets.product_list_icon },
        { name: t('manager.order', 'Order'), path: "/manager/orders", icon: assets.order_icon },
        { name: t('manager.member', 'Member'), path: "/manager/member", icon: assets.order_icon },
        { name: t('manager.seller', 'Seller'), path: "/manager/seller", icon: assets.order_icon },
        { name: t('manager.setting', 'Setting'), path: "/manager/currecy", icon: assets.order_icon },
    ];

    const logout = async () => {
        try {
            const { data } = await axios.post('/api/manager/logout');
            if (data.success) {
                setIsManager(false);
                navigate('/manager');
            }
        } catch (error) {
            console.log(error.message);
        }
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
                            onClick={() => searchQuery.length > 0 && navigate('/manager/product-list')}
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
                        <p className="hidden sm:block text-base">{t('manager.hiManager', 'Hi! Manager')}</p>
                        <button onClick={logout} className='border border-gray-300 hover:bg-gray-50 transition rounded-full text-base font-medium px-5 py-1.5'>{t('manager.logout', 'Logout')}</button>
                    </div>
                </div>
            </div>

            {/* Sidebar + Content */}
            <div className="flex flex-1 overflow-hidden">
                <div className="md:w-64 w-16 border-r border-gray-300 flex flex-col flex-shrink-0 overflow-y-auto">
                    {sidebarLinks.map((item) => (
                        <NavLink to={item.path} key={item.name} end={item.path === "/manager"}
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
                            <h3 className="text-lg font-bold text-gray-900">{t('manager.selectCurrency', 'Select Currency')}</h3>
                            <button onClick={() => setIsCurrencyModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
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
                                    className={`p-4 rounded-lg border cursor-pointer transition-all flex justify-between items-center ${currency === cur ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'}`}
                                >
                                    <span className="font-semibold text-gray-800">{cur}</span>
                                    {currency === cur && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
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

export default ManagerLayout;
import React, { useEffect } from 'react'
import { NavLink } from 'react-router-dom';
import { assets, categories } from '../assets/assets' // Adjust the path as necessary
import { useAppContext } from '../context/AppContext' // Make sure to import your context
import { toast } from 'react-hot-toast';
import Contact from './Contact';
import { useTranslation } from 'react-i18next';




const Navbar = () => {
    const [open, setOpen] = React.useState(false)
    const [showContact, setShowContact] = React.useState(false)
    const { t, i18n } = useTranslation();

    const { user, setUser, setShowUserLogin, navigate, setSearchQuery, searchQuery, getCartCount, axios, currency, setCurrency } = useAppContext();
    const [isCurrencyModalOpen, setIsCurrencyModalOpen] = React.useState(false);

    const logout = async () => {
        try {
            const { data } = await axios.get('/api/user/logout');
            if (data.success) {
                setUser(null);
                toast.success("Logged out successfully");
                navigate('/');
            } else {
                toast.error(data.message || "Logout failed");
            }
        } catch (error) {
            toast.error(error.message || "Logout failed");
        }
    }
    useEffect(() => {
        if (searchQuery.length > 0) {
            navigate("/products");
        }
    }, [searchQuery]);

    return (
        <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white sticky top-0 z-50 transition-all">
            <NavLink to="/" onClick={() => setOpen(false)} >
                <img className="h-9" src={assets.logo1} alt="logo" />
            </NavLink>

            {/* Desktop Menu */}
            <div className="hidden sm:flex items-center gap-8">
                <NavLink to='/'>{t('nav.home')}</NavLink>

                <div className="relative group flex items-center h-full py-2">
                    <NavLink to='/products'>{t('nav.products')}</NavLink>
                    <div className="hidden group-hover:block absolute top-full left-[-50px] bg-white shadow-xl border border-gray-100 py-5 px-6 w-[400px] rounded-lg z-50 transition-all duration-300">
                        <h4 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">{t('nav.shopByCategory', 'Shop by Category')}</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {categories.map((cat, index) => (
                                <div
                                    key={index}
                                    onClick={() => navigate(`/products?category=${cat.path}`)}
                                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                                >
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: cat.bgColor }}>
                                        <img src={cat.image} alt={cat.text} className="w-6 h-6 object-contain" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{cat.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <button onClick={() => setShowContact(true)} className="hover:text-primary transition-colors cursor-pointer">{t('nav.contact', 'Contact')}</button>

                <div className="hidden lg:flex items-center text-sm border border-gray-300 overflow-hidden">
                    <input
                        onChange={(e) => setSearchQuery(e.target.value)}
                        value={searchQuery}
                        className="py-2 px-3 w-64 bg-transparent outline-none placeholder-gray-400 text-sm"
                        type="text"
                        placeholder={t('nav.enterKeywords', 'Enter keywords')}
                    />
                    <button
                        onClick={() => searchQuery.length > 0 && navigate('/products')}
                        className="bg-primary hover:bg-primary-dull transition text-white text-sm font-medium px-5 py-2 whitespace-nowrap cursor-pointer"
                    >
                        {t('nav.search', 'Search')}
                    </button>
                </div>

                <div onClick={() => navigate("/cart")} className="relative cursor-pointer">
                    <img src={assets.cart_icon} alt="cart" className="w-6 opacity-80" />
                    <button className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full">{getCartCount()}</button>
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

                {/* Custom Language Switcher with Flags */}
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

                {!user ? (
                    <button
                        onClick={() => setShowUserLogin(true)}
                        className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition text-white rounded-full"
                    >
                        {t('nav.login')}
                    </button>
                ) : (
                    <div className='relative group'>
                        {user.profileImage ? (
                            <img src={user.profileImage} className='w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-primary/30' alt="Profile" />
                        ) : (
                            <img src={assets.profile_icon} className='w-10' alt="" />
                        )}
                        <ul className='hidden group-hover:block absolute top-10 right-0 bg-white shadow 
                        border border-gray-200  py-2.5 w-30 rounded-md text-sm z-40'>

                            <li onClick={() => navigate("my-order")} className='p-1.5 pl-3 hover:bg-primary/10 cursor-pointer'> {t('nav.myOrders')}</li>
                            <li onClick={() => navigate("myprofile")} className='p-1.5 pl-3 hover:bg-primary/10 cursor-pointer'> {t('nav.profile', 'Profile')}</li>
                            <li onClick={logout} className='p-1.5 pl-3 hover:bg-primary/10 cursor-pointer'> {t('nav.logout')}</li>
                        </ul>
                    </div>
                    // <button 
                    //     onClick={logout} 
                    //     className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary transition text-white rounded-full"
                    // >
                    //     Logout
                    // </button>
                )}
            </div>

            <div className=' flex items-center gap-6 sm:hidden '>
                <div onClick={() => navigate("/cart")} className="relative cursor-pointer">
                    <img src={assets.cart_icon} alt="cart" className="w-6 opacity-80" />
                    <button className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full">{getCartCount()}</button>
                </div>
                <button onClick={() => open ? setOpen(false) : setOpen(true)} aria-label="Menu" className="">
                    <img src={assets.menu_icon} alt='menu' />
                </button>
            </div>

            {open && (
                <div className={`${open ? 'flex' : 'hidden'} absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex-col items-start gap-2 px-5 text-sm md:hidden`}>
                    <NavLink to="/" onClick={() => setOpen(false)}>{t('nav.home', 'Home')}</NavLink>
                    <NavLink to="/products" onClick={() => setOpen(false)}>{t('nav.products', 'All Products')}</NavLink>
                    {user && (
                        <NavLink to="/orders" onClick={() => setOpen(false)}>{t('nav.myOrders', 'My Orders')}</NavLink>
                    )}
                    <button onClick={() => { setOpen(false); setShowContact(true); }} className="hover:text-primary transition-colors text-left w-full cursor-pointer">{t('nav.contact', 'Contact')}</button>
                    {!user ? (
                        <button
                            onClick={() => {
                                setOpen(false);
                                setShowUserLogin(true);
                            }}
                            className="cursor-pointer px-6 py-2 mt-2 bg-primary hover:bg-primary transition text-white rounded-full text-sm"
                        >
                            {t('nav.login', 'Login')}
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                setOpen(false);
                                logout();
                            }}
                            className="cursor-pointer px-6 py-2 mt-2 bg-primary hover:bg-primary transition text-white rounded-full text-sm"
                        >
                            {t('nav.logout', 'Logout')}
                        </button>
                    )}
                </div>
            )}

            {/* Draggable Contact Modal */}
            <Contact showContact={showContact} setShowContact={setShowContact} />

            {/* Currency Modal */}
            {isCurrencyModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-[2px] shadow-2xl w-full max-w-[430px] overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">{t('manager.selectCurrency', 'Select Currency')}</h3>
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
        </nav>
    )
}

export default Navbar
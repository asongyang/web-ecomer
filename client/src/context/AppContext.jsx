import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import { toast } from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

function AppContextProvider({ children }) {
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || import.meta.env.VITE_CURRENCY || 'THB');
  const [exchangeRates, setExchangeRates] = useState({ THB_LAK: 610, USD_LAK: 22000, USD_THB: 36 });
  
  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [productIns, setProductIns] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const fetchExchangeRates = async () => {
    try {
      const { data } = await axios.get('/api/currency');
      if (data.success && data.rates) {
        setExchangeRates(data.rates);
      }
    } catch (error) {
      console.log("Error fetching exchange rates", error);
    }
  };

  const convertPrice = (priceInTHB) => {
    if (!priceInTHB) return 0;
    if (currency === 'LAK') return priceInTHB * exchangeRates.THB_LAK;
    if (currency === 'USD') return priceInTHB / exchangeRates.USD_THB;
    return priceInTHB; // Assuming base is THB
  };
  
   // Fetch Seller Status 
   const fetchSeller = async ()=>{
    try {
     const {data} = await axios.get('/api/seller/is-auth', { withCredentials: true });

      if(data.success){
        setIsSeller(true)
      }else{
        setIsSeller(false)
      }
    } catch (error) {
      setIsSeller(false)
      
    }
   }

   // Fetch Manager Status
   const fetchManager = async () => {
    try {
     const {data} = await axios.get('/api/manager/is-auth', { withCredentials: true });

      if(data.success){
        setIsManager(true)
      }else{
        setIsManager(false)
      }
    } catch (error) {
      setIsManager(false)
    }
   }

   // Fetch All Product
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/api/product/list');
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // Fetch Product In
  const fetchProductIns = async () => {
    try {
      const { data } = await axios.get('/api/product-in/list');
      if (data.success) {
        setProductIns(data.productIns);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // Fetch User Data
  const getUserData = async () => {
    try {
      const { data } = await axios.get('/api/user/is-auth');
      if (data.success) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    }
  };

   // Add Product to Cart
  const addToCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
    toast.success("Add to cart successfully");
  };

  const updateCartItem = (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId] = quantity;
    setCartItems(cartData);
    toast.success("Cart updated successfully");
  };

  const removeFromCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] -= 1;
      if (cartData[itemId] === 0) {
        delete cartData[itemId];
      }
    }
    toast.success("Product removed from cart");
    setCartItems(cartData);
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const item in cartItems) {
      totalCount += cartItems[item];
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id == items);
      if (cartItems[items] > 0 && itemInfo) {
        totalAmount += itemInfo.offerPrice * cartItems[items];
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };

  useEffect(() => {
    const checkAllAuth = async () => {
      await Promise.all([
        fetchSeller(),
        fetchManager(),
        fetchProducts(),
        fetchProductIns(),
        fetchExchangeRates(),
        getUserData()
      ]);
      setIsCheckingAuth(false);
    };
    checkAllAuth();
  }, []);

  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    isManager,
    setIsManager,
    showUserLogin,
    setShowUserLogin,
    products,
    currency,
    setCurrency,
    convertPrice,
    exchangeRates,
    addToCart,
    updateCartItem,
    removeFromCart,
    cartItems,
    setCartItems,
    searchQuery,
    setSearchQuery,
    getCartAmount,
    getCartCount,
    axios,
    getUserData,
    fetchProducts,
    productIns,
    fetchProductIns,
    isCheckingAuth,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

function useAppContext() {
  return useContext(AppContext);
}

export { AppContext, AppContextProvider, useAppContext };

import React from 'react';
import Navbar from './components/Navbar';
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import { Toaster } from 'react-hot-toast';
import Footer from './components/Footer';
import { useAppContext } from './context/AppContext';
import Login from './components/Login';
import AllProducts from './pages/AllProducts';
import ProductCategory from './pages/ProductCategory';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import AddAddress from './pages/AddAddress';
import Verify from './pages/Verify';

import SellerLogin from './components/seller/SellerLogin';
import SellerLayout from './pages/seller/SellerLayout';
import AddProduct from './pages/seller/AddProduct';
import ProductList from './pages/seller/ProductList';
import Orders from './pages/seller/Orders';
import ManagerAddProduct from './pages/manager/AddProduct';
import ManagerProductList from './pages/manager/ProductList';
import ManagerOrders from './pages/manager/Orders';
import Dashboard from './pages/seller/Dashboard';
import ManagerLogin from './components/manager/ManagerLogin';
import ManagerLayout from './pages/manager/ManagerLayout';
import Profile from './pages/Profile';
import AllProduct from './pages/manager/AllProduct';
import Product_in from './pages/manager/Product_in';
import Sale from './pages/seller/Sale';
import HistorySale from './pages/seller/HistorySale';
import Shipping from './pages/seller/Shipping';
import Exchange from './pages/seller/Exchange';
import Setting from './pages/manager/Setting';
import DashboardManager from './pages/manager/DashboardManager';
import Member from './pages/manager/Member';
import AddSeller from './pages/manager/AddSeller';



const App = () => {
  const isSellerPath = useLocation().pathname.includes("seller");
  const isManagerPath = useLocation().pathname.includes("manager");
  const { showUserLogin, isSeller, isManager, isCheckingAuth } = useAppContext();

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className='text-default min-h-screen text-gray-700 bg-white'>
      {isSellerPath || isManagerPath ? null : <Navbar />}
      {showUserLogin ? <Login /> : null}
      <Toaster />

      <div className={`${isSellerPath || isManagerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/products' element={<AllProducts />} />
          <Route path='/products/:category' element={<ProductCategory />} />
          <Route path='/products/:category/:id' element={<ProductDetails />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/add-address' element={<AddAddress />} />
          <Route path='/my-order' element={<MyOrders />} />
          <Route path='/verify' element={<Verify />} />
          <Route path='/myprofile' element={<Profile />} />

          <Route path='/seller' element={isSeller ? <SellerLayout /> : <SellerLogin />} >
            <Route index element={isSeller ? <AddProduct /> : null} />
            <Route path='product-list' element={<ProductList />} />
            <Route path='orders' element={<Orders />} />
            <Route path='dashboard' element={<Dashboard />} />
            <Route path='sale' element={<Sale />} />
            <Route path='history' element={<HistorySale />} />
            <Route path='shipping' element={<Shipping />} />
             <Route path='exchange' element={<Exchange />} />
          </Route>

          <Route path='/manager' element={isManager ? <ManagerLayout /> : <ManagerLogin />} >
            <Route index element={isManager ? <ManagerAddProduct /> : null} />
            <Route path='product-list' element={<ManagerProductList />} />
            <Route path='all-product' element={<AllProduct/>} />
            <Route path='product-in' element={<Product_in/>} />
            <Route path='orders' element={<ManagerOrders />} />
            <Route path='dashboard' element={<DashboardManager/>} />
            <Route path='currecy' element={<Setting />} />
            <Route path='member' element={<Member />} />
             <Route path='seller' element={<AddSeller />} />
          </Route>

        </Routes>
      </div>
      {!(isSellerPath || isManagerPath) && <Footer />}
    </div>
  );
};

export default App;

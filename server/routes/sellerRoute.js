



import express from 'express';
import { isSellerAuth, sellerLogin, sellerlogout, getDashboardStats } from '../controllers/sellerController.js';
import authSeller from '../middlewares/authSeller.js';


const sellerRouter = express.Router();



sellerRouter.post('/login',sellerLogin );
sellerRouter.get('/is-auth', authSeller,   isSellerAuth );
sellerRouter.post('/logout',sellerlogout );
sellerRouter.get('/dashboard', authSeller, getDashboardStats);

export default sellerRouter;
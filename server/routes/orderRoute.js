import express from 'express';
import authUser from '../middlewares/authUser.js';
import { getAllOrders, getUserOrder, placeOrderCOD, placeOrderBcel, deleteOrder, updateOrderStatus, placeOrderStripe, verifyStripe } from '../controllers/orderController.js';
import { upload } from '../configs/multer.js';
import authSeller from '../middlewares/authSeller.js';
import authManager from '../middlewares/authManager.js';

const orderRouter = express.Router();

orderRouter.post('/cod', authUser , placeOrderCOD)
orderRouter.post('/bcel', upload.single('slip'), authUser, placeOrderBcel)
orderRouter.post('/stripe', authUser, placeOrderStripe)
orderRouter.post('/verifyStripe', authUser, verifyStripe)
orderRouter.get('/user', authUser , getUserOrder)
orderRouter.get('/seller', authSeller , getAllOrders)
orderRouter.get('/manager', authManager , getAllOrders)
orderRouter.post('/delete', authSeller , deleteOrder)
orderRouter.post('/delete-manager', authManager , deleteOrder)
orderRouter.post('/status', authSeller, updateOrderStatus)

export default orderRouter;
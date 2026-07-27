import express from 'express';
import { placeSale, getSaleHistory } from '../controllers/saleController.js';
import authSeller from '../middlewares/authSeller.js';

const saleRouter = express.Router();

saleRouter.post('/place', authSeller, placeSale);
saleRouter.get('/history', authSeller, getSaleHistory);

export default saleRouter;

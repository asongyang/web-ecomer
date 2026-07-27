import express from 'express';
import { getCurrencyRates, updateCurrencyRates } from '../controllers/currencyController.js';
import authManager from '../middlewares/authManager.js';

const currencyRouter = express.Router();

currencyRouter.get('/', getCurrencyRates);
currencyRouter.post('/', authManager, updateCurrencyRates);

export default currencyRouter;

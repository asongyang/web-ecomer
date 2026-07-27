import express from 'express';
import { managerLogin, isManagerAuth, managerLogout, addSeller, getSellers, deleteSeller, editSeller } from '../controllers/managerController.js';
import authManager from '../middlewares/authManager.js';

const managerRouter = express.Router();

managerRouter.post('/login', managerLogin);
managerRouter.get('/is-auth', authManager, isManagerAuth);
managerRouter.post('/logout', managerLogout);

// Seller management
managerRouter.post('/seller/add', authManager, addSeller);
managerRouter.get('/seller/all', authManager, getSellers);
managerRouter.post('/seller/delete', authManager, deleteSeller);
managerRouter.post('/seller/edit', authManager, editSeller);

export default managerRouter;

import express from 'express';
import { addProductIn, getProductIns, updateProductIn, deleteProductIn } from '../controllers/productInController.js';
import { upload } from '../configs/multer.js';

const productInRouter = express.Router();

productInRouter.post('/add', upload.fields([
    { name: 'image0', maxCount: 1 },
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
]), addProductIn);

productInRouter.post('/update', upload.fields([
    { name: 'image0', maxCount: 1 },
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
]), updateProductIn);

productInRouter.post('/delete', deleteProductIn);
productInRouter.get('/list', getProductIns);

export default productInRouter;

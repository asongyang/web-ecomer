
import express from 'express'
import { upload } from '../configs/multer.js';
import authSeller from '../middlewares/authSeller.js';
import { addProduct, changStock, productById, productList, updateProduct, deleteImage, deleteProduct } from '../controllers/productController.js';


const productRouter = express.Router();

// Frontend sends files as image0, image1, image2, image3 — must match field names exactly
productRouter.post('/add', upload.fields([
    { name: 'image0', maxCount: 1 },
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
]), authSeller, addProduct);

productRouter.get('/list',productList)
productRouter.get('/id',productById)
productRouter.post('/stock',authSeller, changStock)
productRouter.post('/update', upload.fields([
    { name: 'image0', maxCount: 1 },
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
]), authSeller, updateProduct)
productRouter.post('/delete-image', authSeller, deleteImage)
productRouter.post('/delete', authSeller, deleteProduct)

export default productRouter ;

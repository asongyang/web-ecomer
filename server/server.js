import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';


import 'dotenv/config'; // เปิดการใช้งาน dotenv เพื่อโหลด environment variables
import userRouter from './routes/userRoute.js';
import sellerRouter from './routes/sellerRoute.js';
import connectCloudinary from './configs/cloudinary.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import addressRoute from './routes/addressRoute.js';
import orderRouter from './routes/orderRoute.js';
import productInRouter from './routes/productInRoute.js';
import saleRouter from './routes/saleRoute.js';
import currencyRouter from './routes/currencyRoute.js';




const app = express();
const port = process.env.PORT || 4000;

await connectDB();
await connectCloudinary();


// Allow multiple origins
const allowedOrigins = ['http://localhost:5173'];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));


import managerRouter from './routes/managerRoute.js';

// Test route
app.get('/', (req, res) => res.send("API is working"));
app.use('/api/user', userRouter)
app.use('/api/seller', sellerRouter)
app.use('/api/manager', managerRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/address', addressRoute)
app.use('/api/order', orderRouter )
app.use('/api/product-in', productInRouter)
app.use('/api/sale', saleRouter)
app.use('/api/currency', currencyRouter)


// Start server
app.listen(port, () => {
   
        console.log(`Server is running on http://localhost:${port}`);
    
});
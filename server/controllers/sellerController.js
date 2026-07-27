import jwt from 'jsonwebtoken';
import productModel from '../models/Product.js';
import orderModel from '../models/Order.js';
import Sale from '../models/Sale.js';
import Product_in from '../models/Product_in.js';
import userModel from '../models/User.js';
import User_Seller from '../models/User_Seller.js';
import bcrypt from 'bcryptjs';


// Login Seller: /api/seller/login
export const sellerLogin = async(req, res)=>{
   try {
    const { email, password } = req.body;

    // Check .env Default Seller first
    if (password === process.env.SELLER_PASSWORD && email === process.env.SELLER_EMAIL) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.cookie('sellerToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        success: true,
        message: "Logged In",
        email, 
      });
    }

    // If not default seller, check database
    const dbSeller = await User_Seller.findOne({ email });
    if (dbSeller) {
      const isMatch = await bcrypt.compare(password, dbSeller.password);
      if (isMatch) {
        const token = jwt.sign({ email: dbSeller.email, id: dbSeller._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('sellerToken', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({
          success: true,
          message: "Logged In",
          email: dbSeller.email, 
        });
      }
    }

    // Invalid credentials
    return res.json({ success: false, message: "Invalid credentials" });
   } catch (error) {
     console.log(error.message);
     res.json({ success: false, message: error.message });
   }
}


// Check isAuth : /api/seller/is-auth
export const isSellerAuth =async (req, res)=>{
  
     try{
         return res.json({success: true})
     } catch(error){
         console.log(error.message);
         res.json({ success: false,message:error.message });

     }

}

 // Loguot seller : /api/seller/logout
 export const sellerlogout = async (req, res)=>{
    try {
       res.clearCookie('sellerToken', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict"
          
       } )
        return res.json({success: true, message:" Logged out"})

    } catch(error) {

        console.log(error.message);
         res.json({ success: false,message:error.message });


    } }


// Get Dashboard Stats : /api/seller/dashboard
export const getDashboardStats = async (req, res) => {
    try {
        // 1. Total Products
        const totalProducts = await productModel.countDocuments();
        
        // 1.5 Total Product In
        const totalProductIn = await Product_in.countDocuments();
        const recentProductInList = await Product_in.find({}).sort({ createdAt: -1 }).limit(20);
        
        // 2. Low/Out of stock products (stock < 5)
        const lowStockProducts = await productModel.find({ stock: { $lt: 5 } }).select('name stock image');
        
        // 3. Online Orders
        const onlineOrders = await orderModel.find({}).populate('items.product address');
        const totalOnlineOrders = onlineOrders.length;
        const onlineRevenue = onlineOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
        
        const shippedOrdersCount = onlineOrders.filter(order => order.status === 'จัดส่งแล้ว' || order.status === 'Delivered').length;
        const pendingOrdersCount = totalOnlineOrders - shippedOrdersCount;

        // 4. POS Sales
        const posSales = await Sale.find({}).populate('items.product');
        const totalPosSales = posSales.length;
        const posRevenue = posSales.reduce((sum, sale) => sum + (sale.amount || 0), 0);

        // 5. Total Revenue
        const totalRevenue = onlineRevenue + posRevenue;

        const { timeFilter } = req.query; // '1h', '1d', '1w', '1m', 'all'

        // --- Filter for Graph Data ---
        const now = new Date();
        let startDate = new Date(0); // default to all time
        
        if (timeFilter === '1h') {
            startDate = new Date(now.getTime() - 60 * 60 * 1000);
        } else if (timeFilter === '1d') {
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        } else if (timeFilter === '1w') {
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (timeFilter === '1m') {
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        const filteredOnlineOrders = onlineOrders.filter(o => new Date(o.createdAt) >= startDate);
        const filteredPosSales = posSales.filter(s => new Date(s.createdAt) >= startDate);

        // 6. Time Series Data (Revenue & Counts)
        const timeSeriesMap = {};

        const getFormatKey = (dateObj) => {
            const dateStr = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;
            const timeStr = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
            
            if (timeFilter === '1h' || timeFilter === '1d') {
                return timeStr; // HH:mm
            } else {
                return `${dateStr} ${timeStr}`; // DD/MM HH:mm
            }
        };

        const getSortDate = (dateObj) => {
            // Sort by exact time so the graph reflects the precise chronological order
            return dateObj.getTime();
        };
        
        // Ensure recent orders are available
        const recentOrders = [...onlineOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10); // get last 10 for table
        const recentPosSales = [...posSales].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);

        filteredOnlineOrders.forEach(order => {
            const dateObj = new Date(order.createdAt);
            const dateStr = getFormatKey(dateObj);
            
            if (!timeSeriesMap[dateStr]) {
                timeSeriesMap[dateStr] = { date: dateStr, sortDate: getSortDate(dateObj), cod: 0, bcelOne: 0, onlineCount: 0, posCount: 0, posAmount: 0, expense: 0 };
            }

            timeSeriesMap[dateStr].onlineCount += 1;

            const pt = (order.paymentType || '').toLowerCase();
            if (pt.includes('cod')) {
                timeSeriesMap[dateStr].cod += order.amount || 0;
            } else if (pt.includes('bcel')) {
                timeSeriesMap[dateStr].bcelOne += order.amount || 0;
            } else {
                timeSeriesMap[dateStr].cod += order.amount || 0;
            }
        });

        filteredPosSales.forEach(sale => {
            const dateObj = new Date(sale.createdAt);
            const dateStr = getFormatKey(dateObj);
            
            if (!timeSeriesMap[dateStr]) {
                timeSeriesMap[dateStr] = { date: dateStr, sortDate: getSortDate(dateObj), cod: 0, bcelOne: 0, onlineCount: 0, posCount: 0, posAmount: 0, expense: 0 };
            }

            timeSeriesMap[dateStr].posCount += 1;
            timeSeriesMap[dateStr].posAmount += (sale.amount || 0);
        });

        // Add Expense (Product In) to timeSeries
        const productInList = await Product_in.find({});
        const filteredProductIn = productInList.filter(p => new Date(p.createdAt || p.date) >= startDate);
        const totalExpense = filteredProductIn.reduce((sum, p) => sum + ((p.costPrice || 0) * (p.quantity || 1)), 0);

        filteredProductIn.forEach(p => {
            const dateObj = new Date(p.createdAt || p.date);
            const dateStr = getFormatKey(dateObj);
            
            if (!timeSeriesMap[dateStr]) {
                timeSeriesMap[dateStr] = { date: dateStr, sortDate: getSortDate(dateObj), cod: 0, bcelOne: 0, onlineCount: 0, posCount: 0, posAmount: 0, expense: 0 };
            }

            timeSeriesMap[dateStr].expense += ((p.costPrice || 0) * (p.quantity || 1));
        });

        const graphData = Object.values(timeSeriesMap).sort((a, b) => a.sortDate - b.sortDate).map(d => ({
            date: d.date,
            COD: d.cod || 0,
            'BCEL ONE': d.bcelOne || 0,
            posAmount: d.posAmount || 0,
            expense: d.expense || 0,
            'Online Orders': d.onlineCount || 0,
            'POS Orders': d.posCount || 0
        }));

        return res.json({
            success: true,
            stats: {
                totalRevenue,
                totalOnlineOrders,
                totalPosSales,
                totalProducts,
                totalProductIn,
                totalExpense,
                onlineRevenue,
                posRevenue,
                shippedOrdersCount,
                pendingOrdersCount,
                totalUsers: await userModel.countDocuments({}),
                totalSellers: 1 + await User_Seller.countDocuments({}),
                graphData,
                recentOnlineOrders: recentOrders,
                recentPosSales,
                lowStockProducts,
                recentProductInList
            }
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

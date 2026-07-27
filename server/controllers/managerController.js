import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User_Seller from '../models/User_Seller.js';

// Login Manager: /api/manager/login
export const managerLogin = async (req, res) => {
   try {
    const { email, password } = req.body;

    if (password === process.env.MANAGER_PASSWORD && email === process.env.MANAGER_EMAIL) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.cookie('managerToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        success: true,
        message: "Logged In as Manager",
        email,
      });
    } else {
      return res.json({ success: false, message: "Invalid credentials" });
    }
   } catch (error) {
     console.log(error.message);
     res.json({ success: false, message: error.message });
   }
}

// Check isAuth : /api/manager/is-auth
export const isManagerAuth = async (req, res) => {
     try {
         return res.json({ success: true });
     } catch(error) {
         console.log(error.message);
         res.json({ success: false, message: error.message });
     }
}

// Logout manager : /api/manager/logout
export const managerLogout = async (req, res) => {
    try {
       res.clearCookie('managerToken', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict"
       });
       return res.json({ success: true, message: "Logged out" });
    } catch(error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Add dynamic seller: /api/manager/seller/add
export const addSeller = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.json({ success: false, message: 'All fields are required' });
        }
        
        const existingSeller = await User_Seller.findOne({ email });
        if (existingSeller || email === process.env.SELLER_EMAIL) {
            return res.json({ success: false, message: 'Seller email already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const seller = await User_Seller.create({ name, email, password: hashedPassword });
        
        return res.json({ success: true, message: 'Seller added successfully', seller });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Get all dynamic sellers: /api/manager/seller/all
export const getSellers = async (req, res) => {
    try {
        const sellers = await User_Seller.find({}).select('-password').sort({ createdAt: -1 });
        return res.json({ success: true, sellers });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Delete dynamic seller: /api/manager/seller/delete
export const deleteSeller = async (req, res) => {
    try {
        const { id } = req.body;
        await User_Seller.findByIdAndDelete(id);
        return res.json({ success: true, message: 'Seller deleted successfully' });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Edit dynamic seller: /api/manager/seller/edit
export const editSeller = async (req, res) => {
    try {
        const { id, name, email, password } = req.body;
        
        if (!id || !name || !email) {
            return res.json({ success: false, message: 'ID, name and email are required' });
        }
        
        const existingSeller = await User_Seller.findOne({ email, _id: { $ne: id } });
        if (existingSeller || email === process.env.SELLER_EMAIL) {
            return res.json({ success: false, message: 'Seller email already exists' });
        }
        
        const updateData = { name, email };
        
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }
        
        await User_Seller.findByIdAndUpdate(id, updateData);
        
        return res.json({ success: true, message: 'Seller updated successfully' });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

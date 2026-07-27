import { v2 as cloudinary } from "cloudinary";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Stripe from "stripe";
// Place Order:/api/order/cod
export const placeOrderCOD = async (req, res)=>{
    try {
        const {userId, items, address} = req.body;
        if(!address || items.length === 0){
          return res.json({ success: false, message:" Invalid data"})  
        }
        let amount = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (product) {
                if (product.stock < item.quantity) {
                    return res.json({ success: false, message: `Insufficient stock for ${product.name}` });
                }
                amount += product.offerPrice * item.quantity;
            }
        }
        // Add tax Change(2%)
        amount += Math.floor(amount*0.02);
        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType:"COD"

        });

        // Deduct stock for each item
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock -= item.quantity;
                if (product.stock <= 0) {
                    product.inStock = false;
                }
                await product.save();
            }
        }


        return res.json({success: true, message: " Oder Place Successfully "})
    } catch (error) {
         return res.json({success: false, message: error.message})
        
    }

}

// Place Order via BCEL ONE
export const placeOrderBcel = async (req, res) => {
    try {
        let orderData = JSON.parse(req.body.orderData);
        const {items, address} = orderData;
        const userId = req.body.userId; // added by authUser middleware
        
        if(!address || items.length === 0){
          return res.json({ success: false, message:" Invalid data"})  
        }
        
        let amount = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (product) {
                if (product.stock < item.quantity) {
                    return res.json({ success: false, message: `Insufficient stock for ${product.name}` });
                }
                amount += product.offerPrice * item.quantity;
            }
        }
        // Add tax (2%)
        amount += Math.floor(amount * 0.02);

        // Handle Image Upload
        const imageFile = req.file;
        let paymentSlip = "";
        if (imageFile) {
            const base64 = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString('base64')}`;
            const result = await cloudinary.uploader.upload(base64, { resource_type: 'image' });
            paymentSlip = result.secure_url;
        }

        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "BCEL ONE",
            paymentSlip,
            isPaid: true
        });

        // Deduct stock for each item
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock -= item.quantity;
                if (product.stock <= 0) {
                    product.inStock = false;
                }
                await product.save();
            }
        }

        return res.json({success: true, message: "Order Placed Successfully via BCEL ONE"})
    } catch (error) {
         console.log(error);
         return res.json({success: false, message: error.message})
    }
}

// Place Order via Stripe Online Payment
export const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, address } = req.body;

        if (!address || items.length === 0) {
            return res.json({ success: false, message: " Invalid data" });
        }
        
        let amount = 0;
        const line_items = [];

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (product) {
                if (product.stock < item.quantity) {
                    return res.json({ success: false, message: `Insufficient stock for ${product.name}` });
                }
                amount += product.offerPrice * item.quantity;
                
                line_items.push({
                    price_data: {
                        currency: 'thb',
                        product_data: {
                            name: product.name
                        },
                        unit_amount: product.offerPrice * 100
                    },
                    quantity: item.quantity
                });
            }
        }
        
        // Add tax (2%)
        const tax = Math.floor(amount * 0.02);
        amount += tax;
        
        line_items.push({
            price_data: {
                currency: 'thb',
                product_data: {
                    name: 'Tax (2%)'
                },
                unit_amount: tax * 100
            },
            quantity: 1
        });

        const newOrder = await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "Online",
            isPaid: false
        });

        // Initialize Stripe
        const stripe = new Stripe(process.env.STRIPE_PRIVATEKEY);
        const frontend_url = "http://localhost:5173"; // Using default local url
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
        });

        return res.json({ success: true, session_url: session.url });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
}

// Verify Stripe Payment
export const verifyStripe = async (req, res) => {
    try {
        const { orderId, success } = req.body;
        
        if (success === "true") {
            const order = await Order.findById(orderId);
            if (order && !order.isPaid) {
                order.isPaid = true;
                await order.save();
                
                // Deduct stock for each item
                for (const item of order.items) {
                    const product = await Product.findById(item.product);
                    if (product) {
                        product.stock -= item.quantity;
                        if (product.stock <= 0) {
                            product.inStock = false;
                        }
                        await product.save();
                    }
                }
                return res.json({ success: true, message: "Payment successful" });
            } else if (order && order.isPaid) {
                return res.json({ success: true, message: "Order is already paid" });
            }
        } else {
            await Order.findByIdAndDelete(orderId);
            return res.json({ success: false, message: "Payment cancelled" });
        }
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
}

// get Order by user ID: /api/order/user
export const getUserOrder =async(req, res)=>{
   try {
    const{ userId} = req.body;
    const orders = await Order.find({
        userId,
        $or:[{paymentType:"COD"}, { isPaid: true}]
    }).populate("items.product address").sort({createAt:-1});
    res.json({success: true , orders});
    
   } catch(error){
    res.json({success: false, message: error.message})
   }
}

// Get All Order( for seller / admin ): /api/order/seller


export const getAllOrders =async(req, res)=>{
   try {
    
    const orders = await Order.find({
        
        $or:[{paymentType:"COD"}, { isPaid: true}]
    }).populate("items.product address").sort({createAt:-1});
    res.json({success: true , orders});
    
   } catch(error){
    res.json({success: false, message: error.message})
   }
}

// Delete Order: /api/order/delete
export const deleteOrder = async(req, res)=>{
    try {
        const { orderId } = req.body;
        await Order.findByIdAndDelete(orderId);
        res.json({success: true, message: "Order deleted successfully"});
    } catch(error) {
        res.json({success: false, message: error.message});
    }
}

// Update Order Status: /api/order/status
export const updateOrderStatus = async(req, res)=>{
    try {
        const { orderId, status } = req.body;
        await Order.findByIdAndUpdate(orderId, { status });
        res.json({success: true, message: "Order status updated successfully"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}


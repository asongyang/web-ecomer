import Sale from '../models/Sale.js';
import productModel from '../models/Product.js';

export const placeSale = async (req, res) => {
    try {
        const { items, amount, paymentType } = req.body;
        
        if (!items || items.length === 0) {
            return res.json({ success: false, message: "Cart is empty" });
        }

        // Create new sale
        const sale = new Sale({
            items,
            amount,
            paymentType: paymentType || 'POS'
        });
        
        await sale.save();

        // Update product stock
        for (const item of items) {
            const product = await productModel.findById(item.product);
            if (product) {
                product.stock = Math.max(0, product.stock - item.quantity); // Deduct stock, prevent negative
                if(product.stock === 0) {
                    product.inStock = false;
                }
                await product.save();
            }
        }

        res.json({ success: true, message: "Sale completed successfully", sale });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export const getSaleHistory = async (req, res) => {
    try {
        const sales = await Sale.find({}).sort({ createdAt: -1 });
        res.json({ success: true, sales });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

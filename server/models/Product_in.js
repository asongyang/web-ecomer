import mongoose from "mongoose";

const productInSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    company: { type: String },
    country: { type: String },
    images: { type: Array, default: [] },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

const Product_in = mongoose.models.product_in || mongoose.model('product_in', productInSchema);

export default Product_in;

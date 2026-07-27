import mongoose from "mongoose";

const saleSchema = new mongoose.Schema({
    items: [{
        product: {type: String, required:true, ref:'product' },
        name: {type: String, required:true },
        quantity: {type: Number, required:true },
        price: {type: Number, required:true }
    }],
    amount: {type: Number, required:true },
    paymentType:  {type: String, required:true, default: 'POS'},
}, { timestamps:true} )

const Sale = mongoose.models.sale || mongoose.model('sale' , saleSchema) 

export default Sale;

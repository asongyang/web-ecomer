import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, { timestamps: true });

const User_Seller = mongoose.models.User_Seller || mongoose.model('User_Seller', sellerSchema);

export default User_Seller;

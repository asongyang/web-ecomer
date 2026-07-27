import { v2 as cloudinary } from "cloudinary";
import Product_in from "../models/Product_in.js";

// Add new product import
export const addProductIn = async (req, res) => {
    try {
        let productData = JSON.parse(req.body.productData);
        const { productName, quantity, costPrice, company, country, date } = productData;
        
        if (!productName || !quantity || !costPrice) {
            return res.json({ success: false, message: "Missing required fields" });
        }

        const filesObj = req.files || {};
        const images = ['image0','image1','image2','image3']
            .map(key => filesObj[key]?.[0])
            .filter(Boolean);

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                const base64 = `data:${item.mimetype};base64,${item.buffer.toString('base64')}`;
                let result = await cloudinary.uploader.upload(base64, { resource_type: 'image' });
                return result.secure_url;
            })
        );

        const productIn = new Product_in({
            productName,
            quantity: Number(quantity),
            costPrice: Number(costPrice),
            company,
            country,
            images: imagesUrl,
            date: date || Date.now()
        });

        await productIn.save();

        res.json({ success: true, message: "Product import recorded successfully", productIn });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get all product imports
export const getProductIns = async (req, res) => {
    try {
        const productIns = await Product_in.find({}).sort({ createdAt: -1 });
        res.json({ success: true, productIns });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Update product import
export const updateProductIn = async (req, res) => {
    try {
        let productData = JSON.parse(req.body.productData);
        const { id, productName, quantity, costPrice, company, country, date } = productData;
        
        const productIn = await Product_in.findById(id);
        if (!productIn) return res.json({ success: false, message: "Product In record not found" });

        // Handle Images
        let images = [...(productIn.images || [])];
        const filesObj = req.files || {};
        
        const newImages = await Promise.all(
            ['image0','image1','image2','image3'].map(async (key, idx) => {
                const file = filesObj[key]?.[0];
                if (!file) return null;
                const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
                const result = await cloudinary.uploader.upload(base64, { resource_type: 'image' });
                return { idx, url: result.secure_url };
            })
        );

        newImages.forEach(item => {
            if (!item) return;
            if (images[item.idx]) {
                images[item.idx] = item.url;
            } else {
                images.push(item.url);
            }
        });

        const updateData = {
            productName,
            quantity: Number(quantity),
            costPrice: Number(costPrice),
            company,
            country,
            images,
            date: date || Date.now()
        };

        await Product_in.findByIdAndUpdate(id, updateData);
        res.json({ success: true, message: "Product import updated successfully" });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Delete product import
export const deleteProductIn = async (req, res) => {
    try {
        const { id } = req.body;
        const productIn = await Product_in.findById(id);
        if (!productIn) return res.json({ success: false, message: "Product In record not found" });

        // Delete images from Cloudinary
        for (const imageUrl of productIn.images) {
            try {
                if (imageUrl) {
                    const parts = imageUrl.split('/');
                    const fileWithExt = parts[parts.length - 1];
                    const publicId = fileWithExt.split('.')[0];
                    const folder = parts[parts.length - 2];
                    await cloudinary.uploader.destroy(`${folder}/${publicId}`);
                }
            } catch (cloudErr) {
                console.log("Cloudinary delete failed:", cloudErr.message);
            }
        }

        await Product_in.findByIdAndDelete(id);
        res.json({ success: true, message: "Product import deleted successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

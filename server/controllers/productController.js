
import { v2 as cloudinary} from "cloudinary"
import Product from "../models/Product.js"


// Add product: /api/product/add
export const addProduct = async (req, res)=>{
    try {
        let productData = JSON.parse(req.body.productData)

        // upload.fields() gives req.files as { image0:[file], image1:[file], ... }
        // Flatten into a single array, filtering out any undefined slots
        const filesObj = req.files || {};
        const images = ['image0','image1','image2','image3']
            .map(key => filesObj[key]?.[0])
            .filter(Boolean);

        // Upload each file buffer to Cloudinary as base64 data URI
        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                const base64 = `data:${item.mimetype};base64,${item.buffer.toString('base64')}`;
                let result = await cloudinary.uploader.upload(base64, { resource_type: 'image' });
                return result.secure_url;
            })
        );

        await Product.create({ ...productData, image: imagesUrl });
        res.json({ success: true, message: "Product Added" });

    } catch(error){
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Update product: /api/product/update
export const updateProduct = async (req, res) => {
    try {
        const { id, name, description, category, barcode, price, offerPrice, stock } = req.body;
        
        const product = await Product.findById(id);
        if (!product) return res.json({ success: false, message: "Product not found" });

        // Start with existing images
        let images = [...(product.image || [])];

        // Upload any new files sent as image0..image3
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

        // Replace or append new images at their slot
        newImages.forEach(item => {
            if (!item) return;
            if (images[item.idx]) {
                images[item.idx] = item.url; // replace existing
            } else {
                images.push(item.url); // append if slot was empty
            }
        });

        const updateData = {
            name,
            description: Array.isArray(description) ? description : (typeof description === 'string' ? description.split('\n') : []),
            category,
            barcode,
            price: Number(price),
            offerPrice: Number(offerPrice),
            stock: Number(stock),
            image: images
        };

        await Product.findByIdAndUpdate(id, updateData);
        res.json({ success: true, message: "Product Updated" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Delete product: /api/product/delete
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.body;
        const product = await Product.findById(id);
        if (!product) return res.json({ success: false, message: "Product not found" });

        // Delete all images from Cloudinary
        for (const imageUrl of product.image) {
            try {
                const parts = imageUrl.split('/');
                const fileWithExt = parts[parts.length - 1];
                const publicId = fileWithExt.split('.')[0];
                const folder = parts[parts.length - 2];
                await cloudinary.uploader.destroy(`${folder}/${publicId}`);
            } catch (cloudErr) {
                console.log("Cloudinary delete failed:", cloudErr.message);
            }
        }

        await Product.findByIdAndDelete(id);
        res.json({ success: true, message: "Product Deleted" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Delete one image from product: /api/product/delete-image
export const deleteImage = async (req, res) => {
    try {
        const { id, imageUrl } = req.body;
        const product = await Product.findById(id);
        if (!product) return res.json({ success: false, message: "Product not found" });

        // Remove image URL from the array
        const newImages = product.image.filter(img => img !== imageUrl);
        await Product.findByIdAndUpdate(id, { image: newImages });

        // Also delete from Cloudinary
        try {
            const parts = imageUrl.split('/');
            const fileWithExt = parts[parts.length - 1];
            const publicId = fileWithExt.split('.')[0];
            const folder = parts[parts.length - 2];
            await cloudinary.uploader.destroy(`${folder}/${publicId}`);
        } catch (cloudErr) {
            console.log("Cloudinary delete failed:", cloudErr.message);
        }

        res.json({ success: true, message: "Image deleted", images: newImages });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Get product: /api/product/list
export const productList = async (req, res)=>{
    try {
        const products = await Product.find({})
        res.json({success:true, products }) 
    } catch (error) {

        console.log(error.message);
       res.json({ success: false,message:error.message });
        
    }

}

// Get sigle product: /api/product/id
export const productById = async (req, res)=>{
    try {
        const { id} = req.body
        const product =await Product.findById(id)
        res.json({success:true, product }) 
    } catch (error) {
        console.log(error.message);
       res.json({ success: false,message:error.message });
        
    }

}

// Change product inStock: /api/product/stock
export const changStock = async (req, res)=>{

    try {
        const {id, inStock} = req.body 
        await Product.findByIdAndUpdate(id, {inStock}) // ✅ was findByIdAndDelete (wrong method!)
         res.json({success:true,message:"Stock Updated" }) 
    } catch (error) {
       console.log(error.message);
       res.json({ success: false,message:error.message });
        
    }

}
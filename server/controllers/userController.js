

import User from "../models/User.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';

// Register and User: /api/user/ trsgister

export const register = async (req, res) => {
    try{
       const { name, email ,password }=  req.body ;
        if ( !name || !email || !password) {
            return res.json({ success: false,message: ' missing Details' })
        }
         
         const existingUser = await User.findOne({email})
         if(existingUser)
            return res.json({ success: false,message: ' User already exists' })
            const hashedPassword = await bcrypt.hash(password,10)
            const user = await User.create( {name, email, password: hashedPassword})
            const token = jwt.sign({id: user._id}, process.env.JWT_SECRET,{expiresIn: '7d'});

             res.cookie('token', token, {
             httpOnly: true,
             secure: process.env.NODE_ENV === 'production',
             sameSite: process.env.NODE_ENV === "production" ? "none" : 'strict',
             maxAge: 7 * 24 * 60 * 60 * 1000,
    });
     return res.json({ success: true, user:{ email: user.email, name: user.name, profileImage: user.profileImage } })

    } catch ( error){

    console.log(error.message);
         res.json({ success: false,message:error.message });

     }
}


// login user : /api/user/login

export const login= async (req, res)=> {
     try {
          const {email, password} = req.body;

          if( !email || !password)
           return res.json({success: false, message: 'Eamil and password are required' });

          const user =await User.findOne({email});
          if(!user){ 
            return res.json({success: false, message: 'Invalid eamil and password ' });
          }

          const isMatch = await bcrypt.compare(password, user.password)
          if(!isMatch)
            return res.json({success: false, message: 'Invalid eamil and password ' });
           const token = jwt.sign({id: user._id}, process.env.JWT_SECRET,{expiresIn: '7d'});

             res.cookie('token', token, {
             httpOnly: true,
             secure: process.env.NODE_ENV === 'production',
             sameSite: process.env.NODE_ENV === "production" ? "none" : 'strict',
             maxAge: 7 * 24 * 60 * 60 * 1000,
    });
     return res.json({ success: true, user:{ email: user.email, name: user.name, profileImage: user.profileImage } })

           
     }  catch(error){

         console.log(error.message);
         res.json({ success: false,message:error.message });


     }
    
}

// Check Auth : /api/user/is-auth

export const isAuth =async (req, res)=>{
  
     try{
         const {userId}=req.body;
         const user =await User.findById(userId).select("-password")
         return res.json({success: true, user})
     } catch(error){

         console.log(error.message);
         res.json({ success: false,message:error.message });

     }

}
// Update Profile Image: /api/user/update-profile-image
export const updateProfileImage = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!req.file) {
      return res.json({ success: false, message: 'No image file provided' });
    }

    // Upload to Cloudinary from memory buffer
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'profile_images', resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // Save URL to MongoDB
    await User.findByIdAndUpdate(userId, { profileImage: result.secure_url });

    return res.json({ success: true, profileImage: result.secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

 // Loguot user : /api/user/logout
 export const logout = async (req, res)=>{
    try {
       res.clearCookie('token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict"
          
       } )
        return res.json({success: true, messsage:" Logged out"})

    } catch(error) {

        console.log(error.message);
         res.json({ success: false,message:error.message });


    } }

// Get all users: /api/user/all
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    return res.json({ success: true, users });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

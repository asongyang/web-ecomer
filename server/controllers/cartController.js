
import User from "../models/User.js"
// udete user cartDate: /api/cart/update

export const updateCart = async()=>{
   try {
    const { userId, cartItem }=req.body
    await User.findByIdAndUpdate(userId,{ cartItem})
    resizeBy.json({ success: true, message: " Cart update"})
   } catch (error) {
      console.log(error.message);
       res.json({ success: false,message:error.message });
    
   } 
}
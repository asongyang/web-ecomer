import jwt from 'jsonwebtoken';

const authSeller = async(req, res, next) =>{
  const { sellerToken } = req.cookies;

  if (!sellerToken) {
     return res.json({success: false, message: 'not Authorized' });
  }

  try {
      const tokenDecode = jwt.verify(sellerToken, process.env.JWT_SECRET)
      if (tokenDecode.email ===process.env.SELLER_EMAIL) {
      // Handle non-existent body
    //   if (!req.body) {
    //       req.body = {};
    //   }
    //   req.body.userId = tokenDecode.id; 
     next();
  } else {
      return res.json({ success: false, message: "Not Authorized. Login Again" });
  }
     } catch(error) {
  
       res.json({success: false, message:error.message});
  
     }
}
export default  authSeller;
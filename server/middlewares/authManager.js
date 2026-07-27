import jwt from 'jsonwebtoken';

const authManager = async (req, res, next) => {
  const { managerToken } = req.cookies;

  if (!managerToken) {
     return res.json({ success: false, message: 'Not Authorized' });
  }

  try {
      const tokenDecode = jwt.verify(managerToken, process.env.JWT_SECRET);
      if (tokenDecode.email === process.env.MANAGER_EMAIL) {
         next();
      } else {
          return res.json({ success: false, message: "Not Authorized. Login Again" });
      }
  } catch(error) {
      res.json({ success: false, message: error.message });
  }
}

export default authManager;

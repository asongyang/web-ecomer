import express from 'express';
import { isAuth, login, logout, register, updateProfileImage, getAllUsers } from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';
import { upload } from '../configs/multer.js';

const userRouter = express.Router();

userRouter.post('/register', register);
userRouter.post('/login', login);
userRouter.get('/is-auth', authUser,  isAuth);
userRouter.get('/logout', authUser , logout);
userRouter.post('/update-profile-image', upload.single('profileImage'), authUser, updateProfileImage);
userRouter.get('/all', getAllUsers);

export default userRouter;

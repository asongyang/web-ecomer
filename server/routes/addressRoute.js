
import express from 'express';
import authUser from '../middlewares/authUser.js';
import { addAddress, getAddress } from '../controllers/addressController.js';
const addressRoute = express.Router();


addressRoute.post('/add', authUser, addAddress);
addressRoute.post('/get', authUser, getAddress);


export default addressRoute;
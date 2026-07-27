import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // ເຊື່ອມ MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'pstudent', // ຊື່ດາຕ້າເບ້
        });
        console.log('Database Connected');
    } catch (error) {
        console.error('Database Connection Error:', error.message);
        throw error; // ຍົກ error 
    }
};
export default connectDB;
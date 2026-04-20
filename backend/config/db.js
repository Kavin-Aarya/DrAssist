import mongoose from "mongoose";
import 'dotenv/config';

const dbURI=process.env.MONGODB_URI;

const connectDB = async () => {
    try{
        await mongoose.connect(dbURI);
        console.log("Connected to mongoDB successfully");
    }
    catch(err){
        console.error("Database connection failed:", err.message);
        process.exit(1);
    }

}
// Listen for connection events
mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected! Attempting to reconnect...');
});

export default connectDB;
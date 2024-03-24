import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export const connectDB = async()=>{
    try {
        const {connection} = await mongoose.connect(`${process.env.DB_URI}/${DB_NAME}`);
        console.log(`DB connected!!\nDB Host: ${connection.host}`);
        
    } catch (error) {
        console.error("ERROR in DB Connection", error);
        process.exit(1);
    }
}
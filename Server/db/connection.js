import mongoose from "mongoose";
import { VITE_DB_NAME, VITE_MONGODB_URI } from "../Constants";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${VITE_MONGODB_URI}/${VITE_DB_NAME}`);
        console.log(`\nMongoDB connected !! DB Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("MongoDB Connection Failed: ", error);
        process.exit(1);
    }
}

export default connectDB;
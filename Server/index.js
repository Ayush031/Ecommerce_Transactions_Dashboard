import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import router from "./routes/routes.js";
import connectDB from "./db/connection.js";

dotenv.config({ path: './.env' });
connectDB(); // modify .env and then Uncomment this line to connect to the database

const PORT = 3000 || 5000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: ['https://ecommerce-transactions-backend.vercel.app', 'http://localhost:3000'],
}));
app.use('/api', router);

app.get('/', (req, res) => res.send('Server Started'));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
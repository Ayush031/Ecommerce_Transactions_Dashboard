import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import router from "./routes/routes.js";
import connectDB from "./db/connection.js";

dotenv.config({ path: './.env' });
// connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
// app.use(cors());
app.use(cors({
    origin: ['https://ecom-vercel-test-client.vercel.app'],
}));
app.use(express.urlencoded({ extended: true }));
app.use('/api', router);

app.get('/', (req, res) => res.send('Server Started'));

app.listen(PORT);
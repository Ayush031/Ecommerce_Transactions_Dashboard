import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import router from "./routes/routes.js";
import connectDB from "./db/connection.js";
import { VITE_PORT } from "./Constants.js";

dotenv.config({ path: './.env' });
connectDB(); // modify .env and then Uncomment this line to connect to the database

const app = express();
const PORT = VITE_PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use('/api', router);
// app.use(cors({
//     origin: ['https://ecom-vercel-test-client.vercel.app/api', 'http://localhost:3000'],
// }));
app.get('/', (req, res) => res.send('Server Started'));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
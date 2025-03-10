import express from 'express';
import bodyParser from 'body-parser';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/authRoute.js';
import cors from 'cors';
import { connectDB } from "./model/db.mjs";

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());
connectDB();

app.use('/admin', adminRoutes);
app.use('/api/auth', authRoutes);


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
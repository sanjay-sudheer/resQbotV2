import express from 'express';
import bodyParser from 'body-parser';
import adminRoutes from './routes/admin.js';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

app.use('/admin', adminRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
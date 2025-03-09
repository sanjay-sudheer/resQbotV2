require("dotenv").config(); // Load environment variables
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');

const connectDB = require("./config/dbConfig");
const authRoutes = require('./routes/authRoute');

const app = express();

// Connect to MongoDB
connectDB();

app.use(bodyParser.json());
app.use(cors());

app.use('/api/auth', authRoutes); 

app.get("/", (res) => {
  res.send("MongoDB Connected!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

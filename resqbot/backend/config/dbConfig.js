const mongoose = require('mongoose');  // CommonJS syntax for importing mongoose
const dotenv = require('dotenv');      // CommonJS syntax for importing dotenv

dotenv.config();  // Load environment variables from .env file

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    // Connect to MongoDB using the connection string from the environment variables
    await mongoose.connect(process.env.MONGO_URI, {});

    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error(err.message);
    process.exit(1);  // Exit process with failure
  }
};

// Export the function to be used in other files
module.exports = connectDB;
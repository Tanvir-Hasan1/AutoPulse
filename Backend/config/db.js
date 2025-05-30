// config/db.js
const mongoose = require("mongoose");
require("dotenv").config(); // Load .env variables

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI); // use correct key
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit app if DB fails
  }
};

module.exports = connectDB;

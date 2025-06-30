const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { specs, swaggerUi } = require("./swagger");
require("dotenv").config(); // to access MONGODB_URI from .env

const authRoutes = require("./routes/authRoutes");
const bikeRoutes = require("./routes/bikeRoutes");
const fuelRoutes = require("./routes/fuelRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const licenseRoutes = require("./routes/licenseRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const taxTokenRoutes = require("./routes/taxTokenRoutes");
const productRoutes = require("./routes/productRoutes");
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customSiteTitle: "AutoPulse API Docs",
}));
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/bikes", bikeRoutes);
app.use("/api/fuel", fuelRoutes);
app.use("/api/service", serviceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/license", licenseRoutes);
app.use("/api/registration", registrationRoutes);
app.use("/api/tax-token", taxTokenRoutes);
app.use("/api/marketplace", productRoutes);

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

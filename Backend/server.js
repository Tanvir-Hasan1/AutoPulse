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
const productRoutes = require("./routes/productRoutes"); // Import product routes
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// API Request Logger
app.use((req, res, next) => {
  const start = Date.now();

  // Intercept res.json to capture the response body
  const originalJson = res.json;
  let responseBody;
  res.json = function (body) {
    responseBody = body;
    return originalJson.call(this, body);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    let logMessage = `[API] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${duration}ms)`;

    // Append error message if status is 4xx or 5xx
    if (res.statusCode >= 400 && responseBody && responseBody.message) {
      logMessage += ` | Error: ${responseBody.message}`;
    } else if (res.statusCode >= 400 && responseBody && responseBody.error) {
      logMessage += ` | Error: ${responseBody.error}`;
    }

    console.log(logMessage);
  });
  next();
});

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
// Routes
app.get("/api/debug-env", (req, res) => {
  const getMasked = (val) => {
    if (!val) return "undefined/empty";
    return val.replace(/:([^@]+)@/, ":******@");
  };
  res.json({
    MONGO_URI: getMasked(process.env.MONGO_URI),
    MONGODB_URI: getMasked(process.env.MONGODB_URI),
    VERCEL: process.env.VERCEL || "false",
    NODE_ENV: process.env.NODE_ENV || "development",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/bikes", bikeRoutes);
app.use("/api/fuel", fuelRoutes);
app.use("/api/service", serviceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/license", licenseRoutes);
app.use("/api/registration", registrationRoutes);
app.use("/api/tax-token", taxTokenRoutes);
app.use("/api/marketplace", productRoutes); // Use product routes

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => console.error("❌ MongoDB connection failed:", err));


// Start server locally (only when not running in Vercel serverless environment)
if (!process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () =>
    console.log(`🚀 Server running on port ${PORT}`)
  );
}

// Export app for Vercel Serverless Function deployment
module.exports = app;

const mongoose = require("mongoose");
const serviceLogSchema = new mongoose.Schema(
  {
    bike: { type: mongoose.Schema.Types.ObjectId, ref: "Bike", required: true },
    date: { type: Date, required: true },
    serviceType: { type: String, required: true }, // e.g., "Oil Change", "Tire Replacement"
    cost: { type: Number, required: true }, // Cost of the service
    odometer: { type: Number, required: true }, // km
    nextService: { type: Number }, // km for next service, optional
    Description: { type: String }, // optional
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceLogSchema);

const mongoose = require("mongoose");

const fuelLogSchema = new mongoose.Schema(
  {
    bike: { type: mongoose.Schema.Types.ObjectId, ref: "Bike", required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true }, // Litres
    unitCost: { type: Number, required: true }, // Cost per litre
    totalCost: { type: Number, required: true }, // Computed = amount * unitCost
    odometer: { type: Number, required: true }, // km
    note: { type: String }, // optional
  },
  { timestamps: true }
);

module.exports = mongoose.model("Fuel", fuelLogSchema);

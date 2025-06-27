const mongoose = require("mongoose");

const bikeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    registrationNumber: {
      type: String,
      required: true,
    },
    odometer: {
      type: Number,
      default: 0,
    },
    lastServiceDate: {
      type: Date,
    },
    lastServiceOdometer: {
      type: Number,
    },
    registrationDoc: {
      fileId: { type: mongoose.Schema.Types.ObjectId },
      filename: { type: String },
      originalName: { type: String },
      uploadDate: { type: Date },
      fileSize: { type: Number },
      contentType: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bike", bikeSchema);

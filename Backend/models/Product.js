const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    productImage: {
      fileId: { type: mongoose.Schema.Types.ObjectId },
      filename: { type: String },
      originalName: { type: String },
      uploadDate: { type: Date },
      fileSize: { type: Number },
      contentType: { type: String },
    },
    category: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    details: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);

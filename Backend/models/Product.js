const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  category: String,
  address: String,
  phone: String,
  details: String,
});

module.exports = mongoose.model("Product", productSchema);
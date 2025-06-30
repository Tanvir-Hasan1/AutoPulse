const Product = require("../models/Product");

// Get all products (with optional category and search query)
const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    let filter = {};
    if (category && category !== "all") filter.category = category;
    if (search)
      filter.name = { $regex: search, $options: "i" };
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a new product
const addProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  getProducts,
  addProduct,
};
const Product = require("../models/Product");

// Post a new product
const postProduct = async (req, res) => {
  try {
    const { productName, price, category, phoneNumber, address, details } =
      req.body;
    const userId = req.params.userId;
    if (!req.file) {
      return res.status(400).json({ message: "Product image is required" });
    }
    const productImage = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    };
    const product = new Product({
      productName,
      price,
      productImage,
      category,
      phoneNumber,
      address,
      details,
      user: userId || null,
    });
    await product.save();
    res.status(201).json({ message: "Product posted successfully", product });
  } catch (error) {
    console.error("Post product error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a product by ID
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const deleted = await Product.findByIdAndDelete(productId);
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({
      message: "Product deleted successfully",
      deletedProduct: {
        _id: deleted._id,
        productName: deleted.productName,
        price: deleted.price,
        category: deleted.category,
        phoneNumber: deleted.phoneNumber,
        address: deleted.address,
        details: deleted.details,
        user: deleted.user,
        createdAt: deleted.createdAt,
        updatedAt: deleted.updatedAt,
      },
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Edit a product by ID
const editProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const updateFields = {};
    const allowedFields = [
      "productName",
      "price",
      "category",
      "phoneNumber",
      "address",
      "details",
      "productImage",
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });
    if (req.file) {
      updateFields.productImage = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }
    const updated = await Product.findByIdAndUpdate(
      productId,
      { $set: updateFields },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product updated successfully", product: updated });
  } catch (error) {
    console.error("Edit product error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all product posts
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    console.error("Get all products error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Serve product image by productId
const getProductImage = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (!product || !product.productImage || !product.productImage.data) {
      return res.status(404).json({ message: "Product image not found" });
    }
    res.set("Content-Type", product.productImage.contentType || "image/jpeg");
    res.send(product.productImage.data);
  } catch (error) {
    console.error("Get product image error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  postProduct,
  deleteProduct,
  editProduct,
  getAllProducts,
  getProductImage,
};

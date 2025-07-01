const mongoose = require("mongoose");
const Product = require("../models/Product");
const multer = require("multer");
const GridFSBucket = require("mongodb").GridFSBucket;

// GridFS bucket for product images
let gfsProductBucket;
const initProductGridFS = () => {
  gfsProductBucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: "productImages",
  });
  console.log("✅ GridFS bucket initialized for product images");
};
mongoose.connection.once("open", () => {
  initProductGridFS();
});

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/webp",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};
const uploadMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}).single("productImage");

// Post a new product with GridFS image
const postProduct = async (req, res) => {
  try {
    const { productName, price, category, phoneNumber, address, details } =
      req.body;
    const userId = req.params.userId;
    if (!req.file) {
      return res.status(400).json({ message: "Product image is required" });
    }
    if (!gfsProductBucket) {
      return res.status(500).json({ message: "File storage not initialized" });
    }
    const { buffer, originalname, mimetype, size } = req.file;
    const timestamp = Date.now();
    const filename = `product_${userId}_${timestamp}_${originalname}`;
    const uploadStream = gfsProductBucket.openUploadStream(filename, {
      metadata: {
        userId: userId,
        uploadDate: new Date(),
        originalName: originalname,
      },
    });
    uploadStream.on("finish", async () => {
      try {
        const productImage = {
          fileId: uploadStream.id,
          filename: filename,
          originalName: originalname,
          uploadDate: new Date(),
          fileSize: size,
          contentType: mimetype,
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
        res
          .status(201)
          .json({ message: "Product posted successfully", product });
      } catch (error) {
        console.error("Error saving product:", error);
        res
          .status(500)
          .json({ message: "Error saving product", error: error.message });
      }
    });
    uploadStream.on("error", (error) => {
      console.error("GridFS upload error:", error);
      res
        .status(500)
        .json({ message: "Error uploading image", error: error.message });
    });
    uploadStream.end(buffer);
  } catch (error) {
    console.error("Post product error:", error);
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "File size too large. Maximum 10MB allowed." });
    }
    if (error.message === "Only image files are allowed") {
      return res.status(400).json({ message: "Only image files are allowed" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get product image from GridFS
const getProductImage = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (!product || !product.productImage || !product.productImage.fileId) {
      return res.status(404).json({ message: "Product image not found" });
    }
    if (!gfsProductBucket) {
      return res.status(500).json({ message: "File storage not initialized" });
    }
    const downloadStream = gfsProductBucket.openDownloadStream(
      product.productImage.fileId
    );
    res.set({
      "Content-Type": product.productImage.contentType || "image/jpeg",
      "Content-Disposition": `inline; filename=\"${
        product.productImage.originalName || product.productImage.filename
      }\"`,
      "Content-Length": product.productImage.fileSize,
    });
    downloadStream.on("error", (error) => {
      console.error("Download error:", error);
      if (!res.headersSent) {
        res.status(404).json({ message: "File not found" });
      }
    });
    downloadStream.pipe(res);
  } catch (error) {
    console.error("Get product image error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
};

// Delete product and image from GridFS
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const deleted = await Product.findByIdAndDelete(productId);
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (
      deleted.productImage &&
      deleted.productImage.fileId &&
      gfsProductBucket
    ) {
      try {
        await gfsProductBucket.delete(deleted.productImage.fileId);
      } catch (deleteError) {
        console.log("Product image not found in GridFS:", deleteError.message);
      }
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

// Edit a product by ID (with image update in GridFS)
const editProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const allowedFields = [
      "productName",
      "price",
      "category",
      "phoneNumber",
      "address",
      "details",
    ];
    const updateFields = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    let updatedProduct;
    // If a new image is uploaded, replace the old one in GridFS
    if (req.file) {
      if (!gfsProductBucket) {
        return res
          .status(500)
          .json({ message: "File storage not initialized" });
      }
      // Find the product to get the old image fileId
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      // Delete old image from GridFS if exists
      if (product.productImage && product.productImage.fileId) {
        try {
          await gfsProductBucket.delete(product.productImage.fileId);
        } catch (err) {
          // Ignore if not found
        }
      }
      // Upload new image to GridFS
      const { buffer, originalname, mimetype, size } = req.file;
      const timestamp = Date.now();
      const filename = `product_${product.user}_${timestamp}_${originalname}`;
      const uploadStream = gfsProductBucket.openUploadStream(filename, {
        metadata: {
          userId: product.user,
          uploadDate: new Date(),
          originalName: originalname,
        },
      });
      uploadStream.end(buffer);
      await new Promise((resolve, reject) => {
        uploadStream.on("finish", resolve);
        uploadStream.on("error", reject);
      });
      updateFields.productImage = {
        fileId: uploadStream.id,
        filename: filename,
        originalName: originalname,
        uploadDate: new Date(),
        fileSize: size,
        contentType: mimetype,
      };
    }

    updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updateFields },
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
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

// Get all products posted by a specific user
const getMyProducts = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const products = await Product.find({ user: userId }).sort({
      createdAt: -1,
    });
    res.json({ products });
  } catch (error) {
    console.error("Get my products error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  postProduct,
  deleteProduct,
  editProduct,
  getAllProducts,
  getProductImage,
  getMyProducts,
  uploadMiddleware,
  initProductGridFS,
};

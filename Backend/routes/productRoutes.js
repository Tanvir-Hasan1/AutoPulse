const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const multer = require("multer");

// Multer config for image upload (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * @swagger
 * /api/marketplace/post-product/{userId}:
 *   post:
 *     summary: Post a new bike-related product (userId as URL param)
 *     tags: [Marketplace]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB user ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - productName
 *               - price
 *               - productImage
 *               - category
 *               - phoneNumber
 *               - address
 *             properties:
 *               productName:
 *                 type: string
 *                 example: "Helmet"
 *               price:
 *                 type: number
 *                 example: 1200
 *               productImage:
 *                 type: string
 *                 format: binary
 *               category:
 *                 type: string
 *                 example: "Accessories"
 *               phoneNumber:
 *                 type: string
 *                 example: "01700000000"
 *               address:
 *                 type: string
 *                 example: "Dhaka, Bangladesh"
 *               details:
 *                 type: string
 *                 example: "High quality helmet for bikers."
 *     responses:
 *       201:
 *         description: Product posted successfully
 *       400:
 *         description: Product image is required
 *       500:
 *         description: Server error
 */
router.post(
  "/post-product/:userId",
  upload.single("productImage"),
  productController.postProduct
);

/**
 * @swagger
 * /api/marketplace/delete-product/{productId}:
 *   delete:
 *     summary: Delete a product by its ID
 *     tags: [Marketplace]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.delete("/delete-product/:productId", productController.deleteProduct);

/**
 * @swagger
 * /api/marketplace/edit-product/{productId}:
 *   patch:
 *     summary: Edit a product by its ID
 *     tags: [Marketplace]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *                 example: "Helmet"
 *               price:
 *                 type: number
 *                 example: 1200
 *               productImage:
 *                 type: string
 *                 format: binary
 *               category:
 *                 type: string
 *                 example: "Accessories"
 *               phoneNumber:
 *                 type: string
 *                 example: "01700000000"
 *               address:
 *                 type: string
 *                 example: "Dhaka, Bangladesh"
 *               details:
 *                 type: string
 *                 example: "High quality helmet for bikers."
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.patch(
  "/edit-product/:productId",
  upload.single("productImage"),
  productController.editProduct
);

/**
 * @swagger
 * /api/marketplace/products:
 *   get:
 *     summary: Get all product posts
 *     tags: [Marketplace]
 *     responses:
 *       200:
 *         description: List of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 */
router.get("/products", productController.getAllProducts);

/**
 * @swagger
 * /api/marketplace/product-image/{productId}:
 *   get:
 *     summary: Get product image by productId
 *     tags: [Marketplace]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB product ID
 *     responses:
 *       200:
 *         description: The product image file
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Product image not found
 *       500:
 *         description: Server error
 */
router.get("/product-image/:productId", productController.getProductImage);

module.exports = router;

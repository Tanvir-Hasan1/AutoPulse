const express = require("express");
const router = express.Router();
const bike = require("../controllers/bikeController");

/**
 * @swagger
 * /api/bikes/registerBike:
 *   post:
 *     summary: Register a new bike
 *     tags: [Bike]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *               - brand
 *               - model
 *               - year
 *               - registrationNumber
 *             properties:
 *               user:
 *                 type: string
 *                 description: User ID
 *                 example: 685d4cabcc39dcbd6a017198
 *               brand:
 *                 type: string
 *                 example: Suzuki
 *               model:
 *                 type: string
 *                 example: Gixxer
 *               year:
 *                 type: string
 *                 example: "2025"
 *               registrationNumber:
 *                 type: string
 *                 example: DH-LA-65-9421
 *               odometer:
 *                 type: number
 *                 example: 9500
 *     responses:
 *       201:
 *         description: Bike created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bike created successfully
 *                 bike:
 *                   $ref: '#/components/schemas/Bike'
 *       400:
 *         description: All required fields must be provided
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post("/registerBike", bike.registerBike);

/**
 * @swagger
 * /api/bikes/getAllBikes:
 *   get:
 *     summary: Get all bikes
 *     tags: [Bike]
 *     responses:
 *       200:
 *         description: List of all bikes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bike'
 *       500:
 *         description: Server error
 */
router.get("/getAllBikes", bike.getAllBikes);

/**
 * @swagger
 * /api/bikes/update:
 *   put:
 *     summary: Update bike information
 *     tags: [Bike]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 description: Bike ID
 *                 example: 685d4cabcc39dcbd6a017198
 *               brand:
 *                 type: string
 *                 example: Yamaha
 *               model:
 *                 type: string
 *                 example: MT-15
 *               year:
 *                 type: string
 *                 example: "2024"
 *               registrationNumber:
 *                 type: string
 *                 example: DHK-123-456
 *     responses:
 *       200:
 *         description: Bike updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bike updated successfully
 *                 bike:
 *                   $ref: '#/components/schemas/Bike'
 *       404:
 *         description: Bike not found
 *       500:
 *         description: Server error
 */
router.put("/update", bike.updateBike);

/**
 * @swagger
 * /api/bikes/delete:
 *   delete:
 *     summary: Delete a bike
 *     tags: [Bike]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 description: Bike ID
 *                 example: 685d4cabcc39dcbd6a017198
 *     responses:
 *       200:
 *         description: Bike deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bike deleted successfully
 *       404:
 *         description: Bike not found
 *       500:
 *         description: Server error
 */
router.delete("/delete", bike.deleteBike);

module.exports = router;

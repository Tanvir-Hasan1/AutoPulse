const express = require("express");
const router = express.Router();
const fuel = require("../controllers/fuelController");

/**
 * @swagger
 * /api/fuel:
 *   post:
 *     summary: Create a new fuel log
 *     tags: [Fuel]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bike
 *               - date
 *               - amount
 *               - unitCost
 *               - odometer
 *             properties:
 *               bike:
 *                 type: string
 *                 description: Bike ID
 *                 example: 685d4f07cc39dcbd6a0171a0
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2025-06-27
 *               amount:
 *                 type: number
 *                 example: 10
 *               unitCost:
 *                 type: number
 *                 example: 120
 *               odometer:
 *                 type: number
 *                 example: 9600
 *               note:
 *                 type: string
 *                 example: Full tank
 *     responses:
 *       201:
 *         description: Fuel log saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Fuel log saved successfully
 *                 fuelLog:
 *                   $ref: '#/components/schemas/FuelLog'
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Bike not found
 *       500:
 *         description: Server error
 */
router.post("/", fuel.createFuelLog);

/**
 * @swagger
 * /api/fuel/{bikeId}:
 *   get:
 *     summary: Get all fuel logs for a specific bike
 *     tags: [Fuel]
 *     parameters:
 *       - in: path
 *         name: bikeId
 *         schema:
 *           type: string
 *         required: true
 *         description: Bike ID
 *     responses:
 *       200:
 *         description: List of fuel logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FuelLog'
 *       500:
 *         description: Server error
 */
router.get("/:bikeId", fuel.getFuelLogsByBike);

/**
 * @swagger
 * /api/fuel/{fuelLogId}:
 *   delete:
 *     summary: Delete a fuel log by ID
 *     tags: [Fuel]
 *     parameters:
 *       - in: path
 *         name: fuelLogId
 *         schema:
 *           type: string
 *         required: true
 *         description: Fuel log ID
 *     responses:
 *       200:
 *         description: Fuel log deleted
 *       404:
 *         description: Fuel log not found
 *       500:
 *         description: Server error
 */
router.delete("/:fuelLogId", fuel.deleteFuelLog);

/**
 * @swagger
 * /api/fuel/{fuelLogId}:
 *   put:
 *     summary: Update a fuel log by ID
 *     tags: [Fuel]
 *     parameters:
 *       - in: path
 *         name: fuelLogId
 *         schema:
 *           type: string
 *         required: true
 *         description: Fuel log ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 12
 *               unitCost:
 *                 type: number
 *                 example: 125
 *               odometer:
 *                 type: number
 *                 example: 9700
 *               note:
 *                 type: string
 *                 example: Partial fill
 *     responses:
 *       200:
 *         description: Fuel log updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FuelLog'
 *       404:
 *         description: Fuel log not found
 *       500:
 *         description: Server error
 */
router.put("/:fuelLogId", fuel.updateFuelLog);

/**
 * @swagger
 * /api/fuel/test:
 *   get:
 *     summary: Test route for fuel
 *     tags: [Fuel]
 *     responses:
 *       200:
 *         description: Fuel route is working
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Fuel route is working ✅
 */
router.get("/test", async (req, res) => {
  try {
    res.status(200).json({ message: "Fuel route is working ✅" });
  } catch (error) {
    console.error("Test route error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;

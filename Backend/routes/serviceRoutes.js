const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");

/**
 * @swagger
 * tags:
 *   - name: Service
 *     description: Bike service log management
 */

/**
 * @swagger
 * /api/service:
 *   post:
 *     summary: Create a new service log
 *     tags: [Service]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bike
 *               - date
 *               - serviceType
 *               - cost
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
 *               serviceType:
 *                 type: string
 *                 example: Oil Change
 *               cost:
 *                 type: number
 *                 example: 500
 *               odometer:
 *                 type: number
 *                 example: 12000
 *               nextService:
 *                 type: number
 *                 example: 13000
 *               description:
 *                 type: string
 *                 example: Changed oil and filter
 *     responses:
 *       201:
 *         description: Service log saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Service log saved successfully
 *                 serviceLog:
 *                   $ref: '#/components/schemas/ServiceLog'
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Bike not found
 *       500:
 *         description: Server error
 */
router.post("/", serviceController.createServiceLog);

/**
 * @swagger
 * /api/service/{bikeId}:
 *   get:
 *     summary: Get all service logs for a specific bike
 *     tags: [Service]
 *     parameters:
 *       - in: path
 *         name: bikeId
 *         schema:
 *           type: string
 *         required: true
 *         description: Bike ID
 *     responses:
 *       200:
 *         description: List of service logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ServiceLog'
 *       500:
 *         description: Server error
 */
router.get("/:bikeId", serviceController.getServiceLogsByBike);

/**
 * @swagger
 * /api/service/{serviceLogId}:
 *   delete:
 *     summary: Delete a service log by ID
 *     tags: [Service]
 *     parameters:
 *       - in: path
 *         name: serviceLogId
 *         schema:
 *           type: string
 *         required: true
 *         description: Service log ID
 *     responses:
 *       200:
 *         description: Service log deleted
 *       404:
 *         description: Service log not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a service log by ID
 *     tags: [Service]
 *     parameters:
 *       - in: path
 *         name: serviceLogId
 *         schema:
 *           type: string
 *         required: true
 *         description: Service log ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serviceType:
 *                 type: string
 *                 example: Oil Change
 *               cost:
 *                 type: number
 *                 example: 600
 *               odometer:
 *                 type: number
 *                 example: 12500
 *               nextService:
 *                 type: number
 *                 example: 13500
 *               description:
 *                 type: string
 *                 example: Changed oil, filter, and spark plug
 *     responses:
 *       200:
 *         description: Service log updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceLog'
 *       404:
 *         description: Service log not found
 *       500:
 *         description: Server error
 */
router.delete("/:serviceLogId", serviceController.deleteServiceLog);
router.put("/:serviceLogId", serviceController.updateServiceLog);

module.exports = router;

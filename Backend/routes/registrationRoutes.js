const express = require("express");
const router = express.Router();
const registration = require("../controllers/registrationController");

/**
 * @swagger
 * /api/registration/upload/{bikeId}:
 *   post:
 *     summary: Upload a bike registration document
 *     tags: [Registration]
 *     parameters:
 *       - in: path
 *         name: bikeId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the bike
 *         example: '685d4f07cc39dcbd6a0171a0'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               registration:
 *                 type: string
 *                 format: binary
 *                 description: PDF or image file (max 10MB)
 *     responses:
 *       201:
 *         description: Registration document uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Bike registration document uploaded successfully'
 *                 registration:
 *                   $ref: '#/components/schemas/UploadRegistration'
 *             example:
 *               message: 'Bike registration document uploaded successfully'
 *               registration:
 *                 bikeId: '685d4f07cc39dcbd6a0171a0'
 *                 fileId: '685e0e3e16972f595709fe94'
 *                 filename: 'registration_685d4f07cc39dcbd6a0171a0_1750994494636.pdf'
 *                 originalName: 'Bike registration.pdf'
 *                 uploadDate: '2025-06-27T03:21:34.718Z'
 *                 fileSize: 361395
 *                 contentType: 'application/pdf'
 *       400:
 *         description: Bad request (invalid file type, size, or missing file)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Bike not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/upload/:bikeId",
  registration.uploadMiddleware,
  registration.uploadRegistration
);

/**
 * @swagger
 * /api/registration/info/{bikeId}:
 *   get:
 *     summary: Get registration information
 *     tags: [Registration]
 *     parameters:
 *       - in: path
 *         name: bikeId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the bike
 *         example: '685d4f07cc39dcbd6a0171a0'
 *     responses:
 *       200:
 *         description: Registration information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Registration information retrieved successfully'
 *                 bike:
 *                   $ref: '#/components/schemas/BikeInfo'
 *                 registration:
 *                   $ref: '#/components/schemas/Registration'
 *             example:
 *               message: 'Registration information retrieved successfully'
 *               bike:
 *                 bikeId: '685d4f07cc39dcbd6a0171a0'
 *                 brand: 'Honda'
 *                 model: 'CBR600RR'
 *                 year: 2023
 *                 plateNumber: 'ABC-1234'
 *                 owner:
 *                   _id: '685d4cabcc39dcbd6a017198'
 *                   name: 'John Doe'
 *                   email: 'john@example.com'
 *               registration:
 *                 fileId: '685e0e3e16972f595709fe94'
 *                 filename: 'registration_685d4f07cc39dcbd6a0171a0_1750994494636.pdf'
 *                 originalName: 'Bike registration.pdf'
 *                 uploadDate: '2025-06-27T03:21:34.718Z'
 *                 fileSize: 361395
 *                 contentType: 'application/pdf'
 *       400:
 *         description: Invalid bike ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Bike or registration not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/info/:bikeId", registration.getRegistrationInfo);

/**
 * @swagger
 * /api/registration/download/{bikeId}:
 *   get:
 *     summary: Download registration file
 *     tags: [Registration]
 *     parameters:
 *       - in: path
 *         name: bikeId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the bike
 *         example: '685d4f07cc39dcbd6a0171a0'
 *     responses:
 *       200:
 *         description: File download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             schema:
 *               type: string
 *             description: attachment; filename="filename.ext"
 *           Content-Type:
 *             schema:
 *               type: string
 *             description: MIME type of the file
 *       400:
 *         description: Invalid bike ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Bike or registration not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/download/:bikeId", registration.downloadRegistration);

/**
 * @swagger
 * /api/registration/status/{bikeId}:
 *   get:
 *     summary: Check registration status
 *     tags: [Registration]
 *     parameters:
 *       - in: path
 *         name: bikeId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the bike
 *         example: '685d4f07cc39dcbd6a0171a0'
 *     responses:
 *       200:
 *         description: Registration status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Registration status retrieved successfully'
 *                 bike:
 *                   $ref: '#/components/schemas/BikeInfo'
 *                 registrationStatus:
 *                   $ref: '#/components/schemas/RegistrationStatus'
 *             example:
 *               message: 'Registration status retrieved successfully'
 *               bike:
 *                 bikeId: '685d4f07cc39dcbd6a0171a0'
 *                 brand: 'Honda'
 *                 model: 'CBR600RR'
 *                 year: 2023
 *                 plateNumber: 'ABC-1234'
 *                 owner:
 *                   _id: '685d4cabcc39dcbd6a017198'
 *                   name: 'John Doe'
 *                   email: 'john@example.com'
 *               registrationStatus:
 *                 hasRegistration: true
 *                 uploadDate: '2025-06-27T03:21:34.718Z'
 *                 filename: 'Bike registration.pdf'
 *       400:
 *         description: Invalid bike ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Bike not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/status/:bikeId", registration.checkRegistrationStatus);

/**
 * @swagger
 * /api/registration/delete/{bikeId}:
 *   delete:
 *     summary: Delete registration
 *     tags: [Registration]
 *     parameters:
 *       - in: path
 *         name: bikeId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the bike
 *         example: '685d4f07cc39dcbd6a0171a0'
 *     responses:
 *       200:
 *         description: Registration deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Bike registration document deleted successfully'
 *                 deletedRegistration:
 *                   $ref: '#/components/schemas/DeletedRegistration'
 *             example:
 *               message: 'Bike registration document deleted successfully'
 *               deletedRegistration:
 *                 fileId: '685e0e3e16972f595709fe94'
 *                 filename: 'registration_685d4f07cc39dcbd6a0171a0_1750994494636.pdf'
 *                 originalName: 'Bike registration.pdf'
 *                 uploadDate: '2025-06-27T03:21:34.718Z'
 *       400:
 *         description: Invalid bike ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Bike or registration not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/delete/:bikeId", registration.deleteRegistration);

module.exports = router;

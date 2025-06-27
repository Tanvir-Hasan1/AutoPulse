const express = require("express");
const router = express.Router();
const taxToken = require("../controllers/taxTokenController");

/**
 * @swagger
 * /api/tax-tokens/upload/{bikeId}:
 *   post:
 *     summary: Upload a bike tax token document
 *     tags: [Tax Tokens]
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
 *               taxToken:
 *                 type: string
 *                 format: binary
 *                 description: PDF or image file (max 10MB)
 *               expiryDate:
 *                 type: string
 *                 format: date
 *                 description: Tax token expiry date
 *                 example: '2025-12-31'
 *     responses:
 *       201:
 *         description: Tax token document uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Bike tax token document uploaded successfully'
 *                 taxToken:
 *                   $ref: '#/components/schemas/UploadTaxToken'
 *             example:
 *               message: 'Bike tax token document uploaded successfully'
 *               taxToken:
 *                 bikeId: '685d4f07cc39dcbd6a0171a0'
 *                 fileId: '685e0e3e16972f595709fe94'
 *                 filename: 'taxtoken_685d4f07cc39dcbd6a0171a0_1750994494636.pdf'
 *                 originalName: 'Tax token.pdf'
 *                 uploadDate: '2025-06-27T03:21:34.718Z'
 *                 fileSize: 361395
 *                 contentType: 'application/pdf'
 *                 expiryDate: '2025-12-31T00:00:00.000Z'
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
  taxToken.uploadMiddleware,
  taxToken.uploadTaxToken
);

/**
 * @swagger
 * /api/tax-tokens/info/{bikeId}:
 *   get:
 *     summary: Get tax token information
 *     tags: [Tax Tokens]
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
 *         description: Tax token information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Tax token information retrieved successfully'
 *                 bike:
 *                   $ref: '#/components/schemas/BikeInfo'
 *                 taxToken:
 *                   $ref: '#/components/schemas/TaxToken'
 *             example:
 *               message: 'Tax token information retrieved successfully'
 *               bike:
 *                 bikeId: '685d4f07cc39dcbd6a0171a0'
 *                 brand: 'Honda'
 *                 model: 'CBR600RR'
 *                 year: 2023
 *                 registrationNumber: 'ABC-1234'
 *                 owner:
 *                   _id: '685d4cabcc39dcbd6a017198'
 *                   name: 'John Doe'
 *                   email: 'john@example.com'
 *               taxToken:
 *                 fileId: '685e0e3e16972f595709fe94'
 *                 filename: 'taxtoken_685d4f07cc39dcbd6a0171a0_1750994494636.pdf'
 *                 originalName: 'Tax token.pdf'
 *                 uploadDate: '2025-06-27T03:21:34.718Z'
 *                 fileSize: 361395
 *                 contentType: 'application/pdf'
 *                 expiryDate: '2025-12-31T00:00:00.000Z'
 *                 isExpired: false
 *       400:
 *         description: Invalid bike ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Bike or tax token not found
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
router.get("/info/:bikeId", taxToken.getTaxTokenInfo);

/**
 * @swagger
 * /api/tax-tokens/download/{bikeId}:
 *   get:
 *     summary: Download tax token file
 *     tags: [Tax Tokens]
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
 *           image/gif:
 *             schema:
 *               type: string
 *               format: binary
 *           image/bmp:
 *             schema:
 *               type: string
 *               format: binary
 *           image/webp:
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
 *         description: Bike or tax token not found
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
router.get("/download/:bikeId", taxToken.downloadTaxToken);

/**
 * @swagger
 * /api/tax-tokens/status/{bikeId}:
 *   get:
 *     summary: Check tax token status
 *     tags: [Tax Tokens]
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
 *         description: Tax token status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Tax token status retrieved successfully'
 *                 bike:
 *                   $ref: '#/components/schemas/BikeInfo'
 *                 taxTokenStatus:
 *                   $ref: '#/components/schemas/TaxTokenStatus'
 *             example:
 *               message: 'Tax token status retrieved successfully'
 *               bike:
 *                 bikeId: '685d4f07cc39dcbd6a0171a0'
 *                 brand: 'Honda'
 *                 model: 'CBR600RR'
 *                 year: 2023
 *                 registrationNumber: 'ABC-1234'
 *                 owner:
 *                   _id: '685d4cabcc39dcbd6a017198'
 *                   name: 'John Doe'
 *                   email: 'john@example.com'
 *               taxTokenStatus:
 *                 hasTaxToken: true
 *                 uploadDate: '2025-06-27T03:21:34.718Z'
 *                 filename: 'Tax token.pdf'
 *                 expiryDate: '2025-12-31T00:00:00.000Z'
 *                 isExpired: false
 *                 daysUntilExpiry: 187
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
router.get("/status/:bikeId", taxToken.checkTaxTokenStatus);

/**
 * @swagger
 * /api/tax-tokens/delete/{bikeId}:
 *   delete:
 *     summary: Delete tax token
 *     tags: [Tax Tokens]
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
 *         description: Tax token deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Bike tax token document deleted successfully'
 *                 deletedTaxToken:
 *                   $ref: '#/components/schemas/DeletedTaxToken'
 *             example:
 *               message: 'Bike tax token document deleted successfully'
 *               deletedTaxToken:
 *                 fileId: '685e0e3e16972f595709fe94'
 *                 filename: 'taxtoken_685d4f07cc39dcbd6a0171a0_1750994494636.pdf'
 *                 originalName: 'Tax token.pdf'
 *                 uploadDate: '2025-06-27T03:21:34.718Z'
 *                 expiryDate: '2025-12-31T00:00:00.000Z'
 *       400:
 *         description: Invalid bike ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Bike or tax token not found
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
router.delete("/delete/:bikeId", taxToken.deleteTaxToken);

module.exports = router;

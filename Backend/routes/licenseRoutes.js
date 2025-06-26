const express = require("express");
const router = express.Router();
const license = require("../controllers/licenseController");

/**
 * @swagger
 * /api/license/upload/{userId}:
 *   post:
 *     summary: Upload a driving license
 *     tags: [License]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user
 *         example: '685d4cabcc39dcbd6a017198'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               license:
 *                 type: string
 *                 format: binary
 *                 description: PDF or image file (max 10MB)
 *     responses:
 *       201:
 *         description: License uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Driving license uploaded successfully'
 *                 license:
 *                   $ref: '#/components/schemas/UploadLicense'
 *             example:
 *               message: 'Driving license uploaded successfully'
 *               license:
 *                 userId: '685d4cabcc39dcbd6a017198'
 *                 fileId: '685dac080cbde4aba4fb7fd6'
 *                 filename: 'license_685d4cabcc39dcbd6a017198_1750969352190.pdf'
 *                 originalName: 'Screenshot 2025-06-26 232810.png'
 *                 uploadDate: '2025-06-26T20:22:32.225Z'
 *                 fileSize: 28310
 *                 contentType: 'image/png'
 *                 isVerified: false
 *       400:
 *         description: Bad request (invalid file type, size, or missing file)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
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
router.post("/upload/:userId", license.uploadMiddleware, license.uploadLicense);

/**
 * @swagger
 * /api/license/info/{userId}:
 *   get:
 *     summary: Get license information
 *     tags: [License]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user
 *         example: '685d4cabcc39dcbd6a017198'
 *     responses:
 *       200:
 *         description: License information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'License information retrieved successfully'
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 license:
 *                   $ref: '#/components/schemas/License'
 *             example:
 *               message: 'License information retrieved successfully'
 *               user:
 *                 userId: '685d4cabcc39dcbd6a017198'
 *                 name: 'Tanvir Hasan'
 *                 email: 't@gmail.com'
 *               license:
 *                 fileId: '685da8f69b99ef0301fb275d'
 *                 filename: 'license_685d4cabcc39dcbd6a017198_1750968566045.pdf'
 *                 originalName: 'linux commands.pdf'
 *                 uploadDate: '2025-06-26T20:09:26.066Z'
 *                 fileSize: 992116
 *                 contentType: 'application/pdf'
 *                 isVerified: false
 *       400:
 *         description: Invalid user ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User or license not found
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
router.get("/info/:userId", license.getLicenseInfo);

/**
 * @swagger
 * /api/license/download/{userId}:
 *   get:
 *     summary: Download license file
 *     tags: [License]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user
 *         example: '685d4cabcc39dcbd6a017198'
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
 *         description: Invalid user ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User or license not found
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
router.get("/download/:userId", license.downloadLicense);

/**
 * @swagger
 * /api/license/verify/{userId}:
 *   get:
 *     summary: Verify license status
 *     tags: [License]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user
 *         example: '685d4cabcc39dcbd6a017198'
 *     responses:
 *       200:
 *         description: License verification status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'License verification status retrieved'
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 licenseStatus:
 *                   $ref: '#/components/schemas/LicenseStatus'
 *             example:
 *               message: 'License verification status retrieved'
 *               user:
 *                 userId: '685d4cabcc39dcbd6a017198'
 *                 name: 'Tanvir Hasan'
 *                 email: 't@gmail.com'
 *               licenseStatus:
 *                 hasLicense: '685da8349b99ef0301fb2757'
 *                 isVerified: false
 *                 uploadDate: '2025-06-26T20:06:12.732Z'
 *                 filename: 'driving licence.pdf'
 *       400:
 *         description: Invalid user ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
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
router.get("/verify/:userId", license.verifyLicense);

/**
 * @swagger
 * /api/license/delete/{userId}:
 *   delete:
 *     summary: Delete license
 *     tags: [License]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user
 *         example: '685d4cabcc39dcbd6a017198'
 *     responses:
 *       200:
 *         description: License deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Driving license deleted successfully'
 *                 deletedLicense:
 *                   $ref: '#/components/schemas/DeletedLicense'
 *             example:
 *               message: 'Driving license deleted successfully'
 *               deletedLicense:
 *                 fileId: '685da7c39b99ef0301fb274f'
 *                 filename: 'license_685d4cabcc39dcbd6a017198_1750968259421.pdf'
 *                 originalName: 'driving licence.pdf'
 *                 uploadDate: '2025-06-26T20:04:19.584Z'
 *       400:
 *         description: Invalid user ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User or license not found
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
router.delete("/delete/:userId", license.deleteLicense);

module.exports = router;

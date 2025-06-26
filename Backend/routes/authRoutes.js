const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Tanvir Hasan
 *               email:
 *                 type: string
 *                 example: t@gmail.com
 *               password:
 *                 type: string
 *                 example: 00000000
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthRegisterResponse'
 *       400:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
router.post("/register", auth.registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: t@gmail.com
 *               password:
 *                 type: string
 *                 example: 00000000
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthLoginResponse'
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post("/login", auth.loginUser);

/**
 * @swagger
 * /api/auth/user/{email}:
 *   get:
 *     summary: Get user by email (for testing)
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: User email
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/user/:email", auth.getUserByEmail);

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: Get all users (for testing)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthUsersList'
 *       500:
 *         description: Server error
 */
router.get("/users", auth.getAllUsers);

module.exports = router;

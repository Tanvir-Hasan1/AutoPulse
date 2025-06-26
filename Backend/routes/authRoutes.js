const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");

// @route   POST /api/auth/register
router.post("/register", auth.registerUser);

// @route   POST /api/auth/login
router.post("/login", auth.loginUser);

router.get("/user/:email", auth.getUserByEmail);
// @route   GET /api/auth/users (for testing only)
router.get("/users", auth.getAllUsers);

module.exports = router;

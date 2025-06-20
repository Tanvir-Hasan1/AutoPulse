const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

// GET dashboard data by user ID
router.get("/:userId", dashboardController.getUserAndBikes);

module.exports = router;

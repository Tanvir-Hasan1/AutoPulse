const express = require("express");
const router = express.Router();
const bike = require("../controllers/bikeController");

// POST /api/bikes/registerBike
router.post("/registerBike", bike.registerBike);
// GET /api/bikes/getAllBikes
router.get("/getAllBikes", bike.getAllBikes);

module.exports = router;

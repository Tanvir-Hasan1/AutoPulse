const express = require("express");
const router = express.Router();
const fuel = require("../controllers/fuelController");

router.post("/", fuel.createFuelLog);
router.get("/:bikeId", fuel.getFuelLogsByBike);
router.get("/test", async (req, res) => {
  try {
    res.status(200).json({ message: "Fuel route is working ✅" });
  } catch (error) {
    console.error("Test route error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;

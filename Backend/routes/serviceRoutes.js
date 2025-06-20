const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");

router.post("/", serviceController.createServiceLog);
router.get("/:bikeId", serviceController.getServiceLogsByBike);
router.delete("/:serviceLogId", serviceController.deleteServiceLog);
router.put("/:serviceLogId", serviceController.updateServiceLog);

module.exports = router;

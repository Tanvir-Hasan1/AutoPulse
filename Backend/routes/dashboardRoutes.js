const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

router.get("/bikes/:bikeId/status", dashboardController.getBikeStatus);
router.get(
  "/bikes/:bikeId/upcoming-tasks",
  dashboardController.getUpcomingTasks
);
router.get(
  "/bikes/:bikeId/recent-activities",
  dashboardController.getRecentActivities
);
router.get("/bikes/:bikeId/report", dashboardController.getBikeReport);

module.exports = router;

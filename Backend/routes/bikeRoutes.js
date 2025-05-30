// const express = require("express");
// const Bike = require("../models/Bike");
// const authenticateToken = require("../middleware/authMiddleware");

// const router = express.Router();

// // All routes require authentication
// router.use(authenticateToken);

// // Create a new bike
// router.post("/", async (req, res) => {
//   try {
//     const userId = req.user;
//     const { brand, model, year, registrationNumber, odometer, lastService } = req.body;

//     const newBike = new Bike({
//       user: userId,
//       brand,
//       model,
//       year,
//       registrationNumber,
//       odometer,
//       lastService,
//     });

//     await newBike.save();
//     res.status(201).json({ message: "Bike created successfully", bike: newBike });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

// // Get all bikes for the logged-in user
// router.get("/", async (req, res) => {
//   try {
//     const userId = req.user;
//     const bikes = await Bike.find({ user: userId });
//     res.status(200).json({ bikes });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

// // Get a bike by ID
// router.get("/:id", async (req, res) => {
//   try {
//     const userId = req.user;
//     const bike = await Bike.findOne({ _id: req.params.id, user: userId });
//     if (!bike) return res.status(404).json({ message: "Bike not found" });

//     res.status(200).json({ bike });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

// // Update a bike
// router.put("/:id", async (req, res) => {
//   try {
//     const userId = req.user;
//     const updates = req.body;

//     const bike = await Bike.findOneAndUpdate(
//       { _id: req.params.id, user: userId },
//       updates,
//       { new: true }
//     );

//     if (!bike) return res.status(404).json({ message: "Bike not found" });

//     res.status(200).json({ message: "Bike updated", bike });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

// // Delete a bike
// router.delete("/:id", async (req, res) => {
//   try {
//     const userId = req.user;

//     const bike = await Bike.findOneAndDelete({ _id: req.params.id, user: userId });

//     if (!bike) return res.status(404).json({ message: "Bike not found" });

//     res.status(200).json({ message: "Bike deleted" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

// module.exports = router;

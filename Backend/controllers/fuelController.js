const FuelLog = require("../models/fuel");
const Bike = require("../models/bike");

// Create a new fuel log
const createFuelLog = async (req, res) => {
  try {
    const { bike, date, amount, unitCost, odometer, note } = req.body;

    if (!bike || !date || !amount || !unitCost || !odometer) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const bikeExists = await Bike.findById(bike);
    if (!bikeExists) {
      return res.status(404).json({ message: "Bike not found" });
    }

    const totalCost = parseFloat((amount * unitCost).toFixed(2));

    const newFuelLog = new FuelLog({
      bike,
      date,
      amount,
      unitCost,
      totalCost,
      odometer,
      note, // Optional
    });

    await newFuelLog.save();

    res.status(201).json({
      message: "Fuel log saved successfully",
      fuelLog: newFuelLog,
    });
  } catch (error) {
    console.error("Error saving fuel log:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all fuel logs for a specific bike
const getFuelLogsByBike = async (req, res) => {
  try {
    const { bikeId } = req.params;

    const logs = await FuelLog.find({ bike: bikeId })
      .sort({ date: -1 })
      .populate("bike", "brand model registrationNumber");

    res.status(200).json(logs);
  } catch (error) {
    console.error("Error fetching fuel logs:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  createFuelLog,
  getFuelLogsByBike,
};

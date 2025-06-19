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
//delete fuel log by id
const deleteFuelLog = async (req, res) => {
  try {
    const { fuelLogId } = req.params;

    // Check if fuel log exists
    const fuelLog = await FuelLog.findById(fuelLogId);
    if (!fuelLog) {
      return res.status(404).json({ message: "Fuel log not found" });
    }

    // Delete the fuel log
    await FuelLog.findByIdAndDelete(fuelLogId);

    res.status(200).json({
      message: "Fuel log deleted successfully",
      deletedFuelLog: {
        id: fuelLog._id,
        date: fuelLog.date,
        amount: fuelLog.amount,
        totalCost: fuelLog.totalCost,
      },
    });
  } catch (error) {
    console.error("Error deleting fuel log:", error);

    // Handle invalid ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid fuel log ID format" });
    }

    res.status(500).json({ message: "Server error", error });
  }
};
// update/edit fuelLog

const updateFuelLog = async (req, res) => {
  try {
    const { fuelLogId } = req.params;
    const { date, amount, unitCost, odometer, note } = req.body;

    // Find the fuel log by ID
    const fuelLog = await FuelLog.findById(fuelLogId);
    if (!fuelLog) {
      return res.status(404).json({ message: "Fuel log not found" });
    }

    // Update fields if provided
    if (date) fuelLog.date = date;
    if (amount) fuelLog.amount = amount;
    if (unitCost) fuelLog.unitCost = unitCost;
    if (odometer) fuelLog.odometer = odometer;
    if (note !== undefined) fuelLog.note = note;

    // Recalculate totalCost if amount or unitCost changed
    if (amount || unitCost) {
      fuelLog.totalCost = parseFloat(
        (fuelLog.amount * fuelLog.unitCost).toFixed(2)
      );
    }

    await fuelLog.save();

    res.status(200).json({
      message: "Fuel log updated successfully",
      updatedFuelLog: fuelLog,
    });
  } catch (error) {
    console.error("Error updating fuel log:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid fuel log ID format" });
    }

    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  createFuelLog,
  getFuelLogsByBike,
  deleteFuelLog,
  updateFuelLog,
};

const ServiceLog = require("../models/Service");
const Bike = require("../models/Bike");

// Create a new service log
const createServiceLog = async (req, res) => {
  try {
    const {
      bike,
      date,
      serviceType,
      cost,
      odometer,
      nextService,
      description,
    } = req.body;

    if (!bike || !date || !serviceType || !cost || !odometer) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const bikeExists = await Bike.findById(bike);
    if (!bikeExists) {
      return res.status(404).json({ message: "Bike not found" });
    }

    const newServiceLog = new ServiceLog({
      bike,
      date,
      serviceType,
      cost,
      odometer,
      nextService, // Optional
      description, // Optional
    });

    await newServiceLog.save();

    res.status(201).json({
      message: "Service log saved successfully",
      serviceLog: newServiceLog,
    });
  } catch (error) {
    console.error("Error saving service log:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all service logs for a specific bike
const getServiceLogsByBike = async (req, res) => {
  try {
    const { bikeId } = req.params;

    const logs = await ServiceLog.find({ bike: bikeId })
      .sort({ date: -1 })
      .populate("bike", "brand model registrationNumber");

    res.status(200).json(logs);
  } catch (error) {
    console.error("Error fetching service logs:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
// Delete service log by ID
const deleteServiceLog = async (req, res) => {
  try {
    const { serviceLogId } = req.params;

    const deletedLog = await ServiceLog.findByIdAndDelete(serviceLogId);
    if (!deletedLog) {
      return res.status(404).json({ message: "Service log not found" });
    }

    res.status(200).json({
      message: "Service log deleted successfully",
      serviceLog: deletedLog,
    });
  } catch (error) {
    console.error("Error deleting service log:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Update service log by ID
const updateServiceLog = async (req, res) => {
  try {
    const { serviceLogId } = req.params;
    const updateData = req.body;

    const updatedLog = await ServiceLog.findByIdAndUpdate(
      serviceLogId,
      updateData,
      { new: true }
    );

    if (!updatedLog) {
      return res.status(404).json({ message: "Service log not found" });
    }

    res.status(200).json({
      message: "Service log updated successfully",
      serviceLog: updatedLog,
    });
  } catch (error) {
    console.error("Error updating service log:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  createServiceLog,
  getServiceLogsByBike,
  deleteServiceLog,
  updateServiceLog,
};

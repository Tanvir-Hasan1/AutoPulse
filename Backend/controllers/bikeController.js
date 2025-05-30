const Bike = require("../models/bike");
const User = require("../models/user"); // Assuming this exists

// Register a new bike
const registerBike = async (req, res) => {
  try {
    const { user, brand, model, year, registrationNumber, odometer } = req.body;

    if (!user || !brand || !model || !year || !registrationNumber) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    const fullUser = await User.findById(user); // Get full user object
    if (!fullUser) return res.status(404).json({ message: "User not found" });

    const newBike = new Bike({
      user: fullUser._id,
      brand,
      model,
      year,
      registrationNumber,
      odometer,
    });

    await newBike.save();

    // Optionally update the user with this bike reference
    fullUser.bikes.push(newBike._id);
    await fullUser.save();

    // Only populate name and email
    const populatedBike = await newBike.populate({
      path: "user",
      select: "name email",
    }); // Show full user, exclude password
    res
      .status(201)
      .json({ message: "Bike created successfully", bike: populatedBike });
  } catch (error) {
    console.error("Error creating bike:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all bikes
const getAllBikes = async (req, res) => {
  try {
    const bikes = await Bike.find().populate("user", "name email");
    res.status(200).json(bikes);
  } catch (error) {
    console.error("Error fetching bikes:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  registerBike,
  getAllBikes,
};

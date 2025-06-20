const User = require("../models/User");
const Bike = require("../models/Bike");

const getUserAndBikes = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate("bikes");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const formattedBikes = user.bikes.map((bike, index) => ({
      id: bike._id,
      brand: bike.brand,
      model: bike.model,
      year: bike.year,
      registrationNumber: bike.registrationNumber,
    }));

    const dashboardData = {
      name: user.name,
      bikes: formattedBikes,
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Dashboard data error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { getUserAndBikes };

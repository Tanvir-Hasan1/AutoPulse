const User = require("../models/user");
const bcrypt = require("bcrypt");

// Register User
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user and populate bikes
    const user = await User.findOne({ email })
      .select("-password") // Exclude password
      .populate({
        path: "bikes",
        select:
          "brand model year registrationNumber odometer createdAt updatedAt", // Include bike timestamps
      });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password (query again for password verification)
    const userWithPassword = await User.findOne({ email }).select("+password");
    const isMatch = await bcrypt.compare(password, userWithPassword.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Prepare response data with timestamps
    const responseData = {
      _id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      bikes: (user.bikes || []).map((bike) => ({
        brand: bike.brand,
        model: bike.model,
        year: bike.year,
        registrationNumber: bike.registrationNumber,
        odometer: bike.odometer,
        createdAt: bike.createdAt,
        updatedAt: bike.updatedAt,
      })),
    };

    res.status(200).json({
      message: "Login successful",
      user: responseData,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Get specific Users (for testing only)
const getUserByEmail = async (req, res) => {
  try {
    const userEmail = req.params.email;
    const user = await User.findOne({ email: userEmail })
      .select("-password") // exclude password
      .populate("bikes"); // include full bike info

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Users (for testing only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserByEmail,
};

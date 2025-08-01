const User = require("../models/User");
const bcrypt = require("bcrypt");
const { sendMail } = require("../utils/mailer");

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
        _id: bike._id,
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

// Update Password without JWT or middleware
const updatePassword = async (req, res) => {
  const { id, currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    user.password = newPassword;
    await user.save();

    // Get client IP address
    const clientIP = req.ip || req.connection.remoteAddress;

    // Send password change notification email
    await sendMail({
      to: user.email,
      subject: "Password Changed - AutoPulse Security Alert",
      text: `Dear ${
        user.name
      },\n\nYour AutoPulse account password was changed.\n\nChange Details:\nTime: ${new Date().toLocaleString()}\nIP Address: ${clientIP}\n\nIf you did not make this change, please:\n1. Change your password immediately\n2. Contact support\n\nStay secure,\nAutoPulse Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #4F46E5; text-align: center;">AutoPulse Security Alert</h2>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="font-size: 16px; color: #1f2937;">Dear ${user.name},</p>
            <p style="font-size: 16px; color: #1f2937;">Your account password was recently changed.</p>
          </div>
          <div style="margin: 20px 0;">
            <h3 style="color: #374151;">Change Details:</h3>
            <p style="color: #4b5563; margin: 5px 0;">Time: ${new Date().toLocaleString()}</p>
            <p style="color: #4b5563; margin: 5px 0;">IP Address: ${clientIP}</p>
          </div>
          <div style="background-color: #fee2e2; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #991b1b; font-weight: bold;">If you did not make this change:</p>
            <ol style="color: #991b1b;">
              <li>Change your password immediately</li>
              <li>Contact our support team</li>
            </ol>
          </div>
          <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px;">
            <p>Stay secure,<br>AutoPulse Team</p>
          </div>
        </div>
      `,
    });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Forgot Password - send OTP
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.passwordResetOTP = otp;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    // Send OTP via email
    await sendMail({
      to: user.email,
      subject: "Your Password Reset Code",
      text: `Your password reset code is: ${otp}`,
    });
    res.json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Reset Password with OTP
const resetPasswordWithOTP = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.passwordResetOTP || !user.passwordResetExpires) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    if (
      user.passwordResetOTP !== otp ||
      user.passwordResetExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    user.password = newPassword;
    user.passwordResetOTP = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Change Name (by user ID only)
const changeName = async (req, res) => {
  const { id, newName } = req.body;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.name = newName;
    await user.save();
    res
      .status(200)
      .json({ message: "Name updated successfully", name: user.name });
  } catch (error) {
    console.error("Change name error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserByEmail,
  updatePassword,
  forgotPassword,
  resetPasswordWithOTP,
  changeName,
};

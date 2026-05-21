const jwt = require("jsonwebtoken");

/**
 * Generate a short-lived access token containing user metadata.
 * Expires in 15 minutes.
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

/**
 * Generate a longer-lived refresh token containing user ID.
 * Expires in 7 days.
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || `${process.env.JWT_SECRET}_refresh`,
    { expiresIn: "7d" }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};

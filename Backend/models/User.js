const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    // phone: { type: String, required: true },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    avatar: { type: String, default: "" },
    bikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bike" }],
    drivingLicense: {
      fileId: { type: mongoose.Schema.Types.ObjectId },
      filename: { type: String },
      originalName: { type: String },
      uploadDate: { type: Date },
      fileSize: { type: Number },
      contentType: { type: String },
      isVerified: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);

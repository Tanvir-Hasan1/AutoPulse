const mongoose = require("mongoose");
const User = require("../models/User");
const multer = require("multer");
const GridFSBucket = require("mongodb").GridFSBucket;
const { sendMail } = require("../utils/mailer");

// GridFS bucket - will be initialized when DB connects
let gfsBucket;

// Initialize GridFS bucket
const initGridFS = () => {
  gfsBucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: "licenses",
  });
  console.log("✅ GridFS bucket initialized for licenses");
};

// Initialize when connection opens
mongoose.connection.once("open", () => {
  initGridFS();
});

// Multer configuration for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow PDF files and image files
  const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/webp",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Upload license function
const uploadLicense = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Check if GridFS bucket is initialized
    if (!gfsBucket) {
      return res.status(500).json({ message: "File storage not initialized" });
    }

    // Check if user already has a license - delete old one if exists
    if (user.drivingLicense && user.drivingLicense.fileId) {
      try {
        await gfsBucket.delete(user.drivingLicense.fileId);
        console.log("Old license file deleted");
      } catch (deleteError) {
        console.log(
          "Old file not found or already deleted:",
          deleteError.message
        );
      }
    }

    // Create a readable stream from buffer
    const { buffer, originalname, mimetype, size } = req.file;

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `license_${userId}_${timestamp}.pdf`;

    // Create upload stream to GridFS
    const uploadStream = gfsBucket.openUploadStream(filename, {
      metadata: {
        userId: userId,
        uploadedBy: user.name,
        uploadDate: new Date(),
        originalName: originalname,
      },
    });

    // Handle upload completion
    uploadStream.on("finish", async () => {
      try {
        // Update user with license info
        const licenseData = {
          fileId: uploadStream.id,
          filename: filename,
          originalName: originalname,
          uploadDate: new Date(),
          fileSize: size,
          contentType: mimetype,
          isVerified: false,
        };

        user.drivingLicense = licenseData;
        await user.save();

        // Send email notification
        sendLicenseUploadEmail(user, licenseData);

        res.status(201).json({
          message: "Driving license uploaded successfully",
          license: {
            userId: userId,
            fileId: uploadStream.id,
            filename: filename,
            originalName: originalname,
            uploadDate: licenseData.uploadDate,
            fileSize: size,
            contentType: mimetype,
            isVerified: false,
          },
        });
      } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({
          message: "Error saving license info",
          error: error.message,
        });
      }
    });

    // Handle upload errors
    uploadStream.on("error", (error) => {
      console.error("GridFS upload error:", error);
      res.status(500).json({
        message: "Error uploading file",
        error: error.message,
      });
    });

    // Write buffer to GridFS
    uploadStream.end(buffer);
  } catch (error) {
    console.error("License upload error:", error);

    // Handle multer errors
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File size too large. Maximum 10MB allowed.",
      });
    }

    if (error.message === "Only PDF files are allowed") {
      return res.status(400).json({
        message: "Only PDF files are allowed",
      });
    }

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get license information
const getLicenseInfo = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Find user with license info
    const user = await User.findById(userId).select(
      "name email drivingLicense"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has a license
    if (!user.drivingLicense || !user.drivingLicense.fileId) {
      return res
        .status(404)
        .json({ message: "No driving license found for this user" });
    }

    res.status(200).json({
      message: "License information retrieved successfully",
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
      },
      license: {
        fileId: user.drivingLicense.fileId,
        filename: user.drivingLicense.filename,
        originalName: user.drivingLicense.originalName,
        uploadDate: user.drivingLicense.uploadDate,
        fileSize: user.drivingLicense.fileSize,
        contentType: user.drivingLicense.contentType,
        isVerified: user.drivingLicense.isVerified,
      },
    });
  } catch (error) {
    console.error("Error getting license info:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Download license file
const downloadLicense = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Find user with license info
    const user = await User.findById(userId).select("drivingLicense");
    if (!user || !user.drivingLicense || !user.drivingLicense.fileId) {
      return res
        .status(404)
        .json({ message: "No driving license found for this user" });
    }

    // Check if GridFS bucket is initialized
    if (!gfsBucket) {
      return res.status(500).json({ message: "File storage not initialized" });
    }

    // Create download stream
    const downloadStream = gfsBucket.openDownloadStream(
      user.drivingLicense.fileId
    );

    // Set response headers
    res.set({
      "Content-Type": user.drivingLicense.contentType || "application/pdf",
      "Content-Disposition": `attachment; filename="${
        user.drivingLicense.originalName || user.drivingLicense.filename
      }"`,
      "Content-Length": user.drivingLicense.fileSize,
    });

    // Handle download errors
    downloadStream.on("error", (error) => {
      console.error("Download error:", error);
      if (!res.headersSent) {
        res.status(404).json({ message: "File not found" });
      }
    });

    // Pipe the file to response
    downloadStream.pipe(res);
  } catch (error) {
    console.error("Error downloading license:", error);
    if (!res.headersSent) {
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
};

// Delete license
const deleteLicense = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has a license
    if (!user.drivingLicense || !user.drivingLicense.fileId) {
      return res
        .status(404)
        .json({ message: "No driving license found for this user" });
    }

    // Check if GridFS bucket is initialized
    if (!gfsBucket) {
      return res.status(500).json({ message: "File storage not initialized" });
    }

    // Store license info for response
    const deletedLicenseInfo = {
      fileId: user.drivingLicense.fileId,
      filename: user.drivingLicense.filename,
      originalName: user.drivingLicense.originalName,
      uploadDate: user.drivingLicense.uploadDate,
    };

    // Delete file from GridFS
    try {
      await gfsBucket.delete(user.drivingLicense.fileId);
    } catch (deleteError) {
      console.log("File not found in GridFS:", deleteError.message);
    }

    // Remove license info from user
    user.drivingLicense = undefined;
    await user.save();

    // Send email notification
    sendLicenseDeleteEmail(user);

    res.status(200).json({
      message: "Driving license deleted successfully",
      deletedLicense: deletedLicenseInfo,
    });
  } catch (error) {
    console.error("Error deleting license:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Verify license status
const verifyLicense = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Find user
    const user = await User.findById(userId).select(
      "name email drivingLicense"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check license status
    const hasLicense = user.drivingLicense && user.drivingLicense.fileId;
    const isVerified = hasLicense ? user.drivingLicense.isVerified : false;

    res.status(200).json({
      message: "License verification status retrieved",
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
      },
      licenseStatus: {
        hasLicense: hasLicense,
        isVerified: isVerified,
        uploadDate: hasLicense ? user.drivingLicense.uploadDate : null,
        filename: hasLicense ? user.drivingLicense.originalName : null,
      },
    });
  } catch (error) {
    console.error("Error verifying license:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Middleware to handle multer upload
const uploadMiddleware = upload.single("license");

// Send license upload email
const sendLicenseUploadEmail = (user, licenseData) => {
  sendMail({
    to: user.email,
    subject: "License Document Uploaded Successfully! 🏍️ - AutoPulse",
    text: `Dear ${
      user.name
    },\n\nYour driving license has been successfully uploaded to AutoPulse.\n\nFile Name: ${
      licenseData.originalName
    }\nUpload Date: ${new Date(
      licenseData.uploadDate
    ).toLocaleString()}\n\nImportant Reminders:\n- Keep your original license document in a safe place\n- Ensure the uploaded document is clear and readable\n- Update the document when it's renewed\n- Set reminders for license renewal\n\nAccess your license document anytime in the Documents section of the AutoPulse app.\n\nRide safe! 🏍️\nAutoPulse Team`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <h2 style="color: #4F46E5; text-align: center;">License Document Updated ✅</h2>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="font-size: 16px; color: #1f2937;">Dear ${user.name},</p>
        <p style="font-size: 16px; color: #1f2937;">Your driving license has been successfully uploaded to AutoPulse.</p>
      </div>
      <div style="margin: 20px 0;">
        <h3 style="color: #374151;">Document Details:</h3>
        <div style="background-color: #eef2ff; padding: 15px; border-radius: 5px;">
          <p style="color: #4b5563; margin: 5px 0;"><strong>File Name:</strong> ${
            licenseData.originalName
          }</p>
          <p style="color: #4b5563; margin: 5px 0;"><strong>Upload Date:</strong> ${new Date(
            licenseData.uploadDate
          ).toLocaleString()}</p>
        </div>
      </div>
      <div style="background-color: #e0f2fe; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="color: #0369a1; font-weight: bold;">Important Reminders:</p>
        <ul style="color: #0369a1;">
          <li>Keep your original license document in a safe place</li>
          <li>Ensure the uploaded document is clear and readable</li>
          <li>Update the document when it's renewed</li>
          <li>Set reminders for license renewal</li>
        </ul>
      </div>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="color: #374151;">Access your license document anytime in the Documents section of the AutoPulse app.</p>
      </div>
      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #6b7280; font-size: 14px;">Ride safe! 🏍️<br>AutoPulse Team</p>
      </div>
    </div>`,
  });
};

// Send license deletion email
const sendLicenseDeleteEmail = (user) => {
  sendMail({
    to: user.email,
    subject: "License Document Deleted - AutoPulse Alert",
    text: `Dear ${
      user.name
    },\n\nYour driving license has been deleted from AutoPulse.\n\nDeletion Time: ${new Date().toLocaleString()}\n\nIf you did not request this deletion, please contact support immediately.\n\nRide safe! 🏍️\nAutoPulse Team`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <h2 style="color: #DC2626; text-align: center;">License Document Deleted</h2>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="font-size: 16px; color: #1f2937;">Dear ${user.name},</p>
        <p style="font-size: 16px; color: #1f2937;">Your driving license has been deleted from AutoPulse.</p>
      </div>
      <div style="margin: 20px 0;">
        <div style="background-color: #fee2e2; padding: 15px; border-radius: 5px;">
          <p style="color: #4b5563; margin: 5px 0;"><strong>Deletion Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
      </div>
      <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="color: #b45309; font-weight: bold;">If you did not request this deletion:</p>
        <ul style="color: #b45309;">
          <li>Contact AutoPulse support immediately</li>
          <li>Check your account security</li>
        </ul>
      </div>
      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #6b7280; font-size: 14px;">Ride safe! 🏍️<br>AutoPulse Team</p>
      </div>
    </div>`,
  });
};

module.exports = {
  uploadLicense,
  getLicenseInfo,
  downloadLicense,
  deleteLicense,
  verifyLicense,
  uploadMiddleware,
  initGridFS,
};

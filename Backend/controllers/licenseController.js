const mongoose = require("mongoose");
const User = require("../models/User");
const multer = require("multer");
const GridFSBucket = require("mongodb").GridFSBucket;

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

module.exports = {
  uploadLicense,
  getLicenseInfo,
  downloadLicense,
  deleteLicense,
  verifyLicense,
  uploadMiddleware,
  initGridFS,
};

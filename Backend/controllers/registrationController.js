const mongoose = require("mongoose");
const Bike = require("../models/Bike");
const multer = require("multer");
const GridFSBucket = require("mongodb").GridFSBucket;

// GridFS bucket for bike registrations
let gfsBucket;

const initGridFS = () => {
  gfsBucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: "bikeRegistrations",
  });
  console.log("✅ GridFS bucket initialized for bike registrations");
};

mongoose.connection.once("open", () => {
  initGridFS();
});

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  // Allow PDF and image files
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
    cb(new Error("Only PDF or image files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Upload registration document for a bike
const uploadRegistration = async (req, res) => {
  try {
    const { bikeId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(bikeId)) {
      return res.status(400).json({ message: "Invalid bike ID format" });
    }

    // Check if bike exists
    const bike = await Bike.findById(bikeId);
    if (!bike) {
      return res.status(404).json({ message: "Bike not found" });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Check if GridFS bucket is initialized
    if (!gfsBucket) {
      return res.status(500).json({ message: "File storage not initialized" });
    }

    // Check if bike already has a registration - delete old one if exists
    if (bike.registrationDoc && bike.registrationDoc.fileId) {
      try {
        await gfsBucket.delete(bike.registrationDoc.fileId);
        console.log("Old registration file deleted");
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
    const filename = `registration_${bikeId}_${timestamp}.pdf`;

    // Create upload stream to GridFS
    const uploadStream = gfsBucket.openUploadStream(filename, {
      metadata: {
        bikeId: bikeId,
        uploadedBy: bike.user,
        uploadDate: new Date(),
        originalName: originalname,
      },
    });

    // Handle upload completion
    uploadStream.on("finish", async () => {
      try {
        // Update bike with registration info
        const registrationData = {
          fileId: uploadStream.id,
          filename: filename,
          originalName: originalname,
          uploadDate: new Date(),
          fileSize: size,
          contentType: mimetype,
        };

        bike.registrationDoc = registrationData;
        await bike.save();

        res.status(201).json({
          message: "Bike registration document uploaded successfully",
          registration: {
            bikeId: bikeId,
            fileId: uploadStream.id,
            filename: filename,
            originalName: originalname,
            uploadDate: registrationData.uploadDate,
            fileSize: size,
            contentType: mimetype,
          },
        });
      } catch (error) {
        console.error("Error updating bike:", error);
        res.status(500).json({
          message: "Error saving registration info",
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
    console.error("Registration upload error:", error);

    // Handle multer errors
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File size too large. Maximum 10MB allowed.",
      });
    }

    if (error.message === "Only PDF or image files are allowed") {
      return res.status(400).json({
        message: "Only PDF or image files are allowed",
      });
    }

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get registration information
const getRegistrationInfo = async (req, res) => {
  try {
    const { bikeId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(bikeId)) {
      return res.status(400).json({ message: "Invalid bike ID format" });
    }

    // Find bike with registration info
    const bike = await Bike.findById(bikeId)
      .select("brand model year plateNumber registrationDoc user")
      .populate("user", "name email");

    if (!bike) {
      return res.status(404).json({ message: "Bike not found" });
    }

    // Check if bike has a registration document
    if (!bike.registrationDoc || !bike.registrationDoc.fileId) {
      return res
        .status(404)
        .json({ message: "No registration document found for this bike" });
    }

    res.status(200).json({
      message: "Registration information retrieved successfully",
      bike: {
        bikeId: bike._id,
        brand: bike.brand,
        model: bike.model,
        year: bike.year,
        plateNumber: bike.plateNumber,
        owner: bike.user,
      },
      registration: {
        fileId: bike.registrationDoc.fileId,
        filename: bike.registrationDoc.filename,
        originalName: bike.registrationDoc.originalName,
        uploadDate: bike.registrationDoc.uploadDate,
        fileSize: bike.registrationDoc.fileSize,
        contentType: bike.registrationDoc.contentType,
      },
    });
  } catch (error) {
    console.error("Error getting registration info:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Download registration file
const downloadRegistration = async (req, res) => {
  try {
    const { bikeId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(bikeId)) {
      return res.status(400).json({ message: "Invalid bike ID format" });
    }

    // Find bike with registration info
    const bike = await Bike.findById(bikeId).select("registrationDoc");
    if (!bike || !bike.registrationDoc || !bike.registrationDoc.fileId) {
      return res
        .status(404)
        .json({ message: "No registration document found for this bike" });
    }

    // Check if GridFS bucket is initialized
    if (!gfsBucket) {
      return res.status(500).json({ message: "File storage not initialized" });
    }

    // Create download stream
    const downloadStream = gfsBucket.openDownloadStream(
      bike.registrationDoc.fileId
    );

    // Set response headers
    res.set({
      "Content-Type": bike.registrationDoc.contentType || "application/pdf",
      "Content-Disposition": `attachment; filename="${
        bike.registrationDoc.originalName || bike.registrationDoc.filename
      }"`,
      "Content-Length": bike.registrationDoc.fileSize,
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
    console.error("Error downloading registration:", error);
    if (!res.headersSent) {
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
};

// Delete registration
const deleteRegistration = async (req, res) => {
  try {
    const { bikeId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(bikeId)) {
      return res.status(400).json({ message: "Invalid bike ID format" });
    }

    // Find bike
    const bike = await Bike.findById(bikeId);
    if (!bike) {
      return res.status(404).json({ message: "Bike not found" });
    }

    // Check if bike has a registration
    if (!bike.registrationDoc || !bike.registrationDoc.fileId) {
      return res
        .status(404)
        .json({ message: "No registration document found for this bike" });
    }

    // Check if GridFS bucket is initialized
    if (!gfsBucket) {
      return res.status(500).json({ message: "File storage not initialized" });
    }

    // Store registration info for response
    const deletedRegistrationInfo = {
      fileId: bike.registrationDoc.fileId,
      filename: bike.registrationDoc.filename,
      originalName: bike.registrationDoc.originalName,
      uploadDate: bike.registrationDoc.uploadDate,
    };

    // Delete file from GridFS
    try {
      await gfsBucket.delete(bike.registrationDoc.fileId);
    } catch (deleteError) {
      console.log("File not found in GridFS:", deleteError.message);
    }

    // Remove registration info from bike
    bike.registrationDoc = undefined;
    await bike.save();

    res.status(200).json({
      message: "Bike registration document deleted successfully",
      deletedRegistration: deletedRegistrationInfo,
    });
  } catch (error) {
    console.error("Error deleting registration:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Check registration status
const checkRegistrationStatus = async (req, res) => {
  try {
    const { bikeId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(bikeId)) {
      return res.status(400).json({ message: "Invalid bike ID format" });
    }

    // Find bike
    const bike = await Bike.findById(bikeId)
      .select("brand model year plateNumber registrationDoc user")
      .populate("user", "name email");

    if (!bike) {
      return res.status(404).json({ message: "Bike not found" });
    }

    // Check registration status
    const hasRegistration = bike.registrationDoc && bike.registrationDoc.fileId;

    res.status(200).json({
      message: "Registration status retrieved successfully",
      bike: {
        bikeId: bike._id,
        brand: bike.brand,
        model: bike.model,
        year: bike.year,
        plateNumber: bike.plateNumber,
        owner: bike.user,
      },
      registrationStatus: {
        hasRegistration: hasRegistration,
        uploadDate: hasRegistration ? bike.registrationDoc.uploadDate : null,
        filename: hasRegistration ? bike.registrationDoc.originalName : null,
      },
    });
  } catch (error) {
    console.error("Error checking registration status:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Middleware to handle multer upload
const uploadMiddleware = upload.single("registration");

module.exports = {
  uploadRegistration,
  getRegistrationInfo,
  downloadRegistration,
  deleteRegistration,
  checkRegistrationStatus,
  uploadMiddleware,
  upload,
  initGridFS,
};

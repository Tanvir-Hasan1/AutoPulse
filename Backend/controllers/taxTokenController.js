const mongoose = require("mongoose");
const Bike = require("../models/Bike");
const multer = require("multer");
const GridFSBucket = require("mongodb").GridFSBucket;

// GridFS bucket for tax tokens
let gfsBucket;

const initGridFS = () => {
  gfsBucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: "taxTokens",
  });
  console.log("✅ GridFS bucket initialized for tax tokens");
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

// Upload tax token document for a bike
const uploadTaxToken = async (req, res) => {
  try {
    const { bikeId } = req.params;
    const { expiryDate } = req.body;

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

    // Check if bike already has a tax token - delete old one if exists
    if (bike.taxToken && bike.taxToken.fileId) {
      try {
        await gfsBucket.delete(bike.taxToken.fileId);
        console.log("Old tax token file deleted");
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
    const filename = `taxtoken_${bikeId}_${timestamp}.pdf`;

    // Create upload stream to GridFS
    const uploadStream = gfsBucket.openUploadStream(filename, {
      metadata: {
        bikeId: bikeId,
        uploadedBy: bike.user,
        uploadDate: new Date(),
        originalName: originalname,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      },
    });

    // Handle upload completion
    uploadStream.on("finish", async () => {
      try {
        // Update bike with tax token info
        const taxTokenData = {
          fileId: uploadStream.id,
          filename: filename,
          originalName: originalname,
          uploadDate: new Date(),
          fileSize: size,
          contentType: mimetype,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
        };

        bike.taxToken = taxTokenData;
        await bike.save();

        res.status(201).json({
          message: "Bike tax token document uploaded successfully",
          taxToken: {
            bikeId: bikeId,
            fileId: uploadStream.id,
            filename: filename,
            originalName: originalname,
            uploadDate: taxTokenData.uploadDate,
            fileSize: size,
            contentType: mimetype,
            expiryDate: taxTokenData.expiryDate,
          },
        });
      } catch (error) {
        console.error("Error updating bike:", error);
        res.status(500).json({
          message: "Error saving tax token info",
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
    console.error("Tax token upload error:", error);

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

// Get tax token information
const getTaxTokenInfo = async (req, res) => {
  try {
    const { bikeId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(bikeId)) {
      return res.status(400).json({ message: "Invalid bike ID format" });
    }

    // Find bike with tax token info
    const bike = await Bike.findById(bikeId)
      .select("brand model year registrationNumber taxToken user")
      .populate("user", "name email");

    if (!bike) {
      return res.status(404).json({ message: "Bike not found" });
    }

    // Check if bike has a tax token document
    if (!bike.taxToken || !bike.taxToken.fileId) {
      return res
        .status(404)
        .json({ message: "No tax token document found for this bike" });
    }

    // Check if tax token is expired
    const isExpired = bike.taxToken.expiryDate
      ? new Date() > new Date(bike.taxToken.expiryDate)
      : false;

    res.status(200).json({
      message: "Tax token information retrieved successfully",
      bike: {
        bikeId: bike._id,
        brand: bike.brand,
        model: bike.model,
        year: bike.year,
        registrationNumber: bike.registrationNumber,
        owner: bike.user,
      },
      taxToken: {
        fileId: bike.taxToken.fileId,
        filename: bike.taxToken.filename,
        originalName: bike.taxToken.originalName,
        uploadDate: bike.taxToken.uploadDate,
        fileSize: bike.taxToken.fileSize,
        contentType: bike.taxToken.contentType,
        expiryDate: bike.taxToken.expiryDate,
        isExpired: isExpired,
      },
    });
  } catch (error) {
    console.error("Error getting tax token info:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Download tax token file
const downloadTaxToken = async (req, res) => {
  try {
    const { bikeId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(bikeId)) {
      return res.status(400).json({ message: "Invalid bike ID format" });
    }

    // Find bike with tax token info
    const bike = await Bike.findById(bikeId).select("taxToken");
    if (!bike || !bike.taxToken || !bike.taxToken.fileId) {
      return res
        .status(404)
        .json({ message: "No tax token document found for this bike" });
    }

    // Check if GridFS bucket is initialized
    if (!gfsBucket) {
      return res.status(500).json({ message: "File storage not initialized" });
    }

    // Create download stream
    const downloadStream = gfsBucket.openDownloadStream(bike.taxToken.fileId);

    // Set response headers
    res.set({
      "Content-Type": bike.taxToken.contentType || "application/pdf",
      "Content-Disposition": `attachment; filename="${
        bike.taxToken.originalName || bike.taxToken.filename
      }"`,
      "Content-Length": bike.taxToken.fileSize,
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
    console.error("Error downloading tax token:", error);
    if (!res.headersSent) {
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
};

// Delete tax token
const deleteTaxToken = async (req, res) => {
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

    // Check if bike has a tax token
    if (!bike.taxToken || !bike.taxToken.fileId) {
      return res
        .status(404)
        .json({ message: "No tax token document found for this bike" });
    }

    // Check if GridFS bucket is initialized
    if (!gfsBucket) {
      return res.status(500).json({ message: "File storage not initialized" });
    }

    // Store tax token info for response
    const deletedTaxTokenInfo = {
      fileId: bike.taxToken.fileId,
      filename: bike.taxToken.filename,
      originalName: bike.taxToken.originalName,
      uploadDate: bike.taxToken.uploadDate,
      expiryDate: bike.taxToken.expiryDate,
    };

    // Delete file from GridFS
    try {
      await gfsBucket.delete(bike.taxToken.fileId);
    } catch (deleteError) {
      console.log("File not found in GridFS:", deleteError.message);
    }

    // Remove tax token info from bike
    bike.taxToken = undefined;
    await bike.save();

    res.status(200).json({
      message: "Bike tax token document deleted successfully",
      deletedTaxToken: deletedTaxTokenInfo,
    });
  } catch (error) {
    console.error("Error deleting tax token:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Check tax token status
const checkTaxTokenStatus = async (req, res) => {
  try {
    const { bikeId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(bikeId)) {
      return res.status(400).json({ message: "Invalid bike ID format" });
    }

    // Find bike
    const bike = await Bike.findById(bikeId)
      .select("brand model year registrationNumber taxToken user")
      .populate("user", "name email");

    if (!bike) {
      return res.status(404).json({ message: "Bike not found" });
    }

    // Check tax token status
    const hasTaxToken = bike.taxToken && bike.taxToken.fileId;
    const isExpired =
      hasTaxToken && bike.taxToken.expiryDate
        ? new Date() > new Date(bike.taxToken.expiryDate)
        : false;

    // Calculate days until expiry
    let daysUntilExpiry = null;
    if (hasTaxToken && bike.taxToken.expiryDate) {
      const today = new Date();
      const expiry = new Date(bike.taxToken.expiryDate);
      const timeDiff = expiry.getTime() - today.getTime();
      daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));
    }

    res.status(200).json({
      message: "Tax token status retrieved successfully",
      bike: {
        bikeId: bike._id,
        brand: bike.brand,
        model: bike.model,
        year: bike.year,
        registrationNumber: bike.registrationNumber,
        owner: bike.user,
      },
      taxTokenStatus: {
        hasTaxToken: hasTaxToken,
        uploadDate: hasTaxToken ? bike.taxToken.uploadDate : null,
        filename: hasTaxToken ? bike.taxToken.originalName : null,
        expiryDate: hasTaxToken ? bike.taxToken.expiryDate : null,
        isExpired: isExpired,
        daysUntilExpiry: daysUntilExpiry,
      },
    });
  } catch (error) {
    console.error("Error checking tax token status:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Middleware to handle multer upload
const uploadMiddleware = upload.single("taxToken");

module.exports = {
  uploadTaxToken,
  getTaxTokenInfo,
  downloadTaxToken,
  deleteTaxToken,
  checkTaxTokenStatus,
  uploadMiddleware,
  upload,
  initGridFS,
};

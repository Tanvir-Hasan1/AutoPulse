const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "License Management API",
      version: "1.0.0",
      description: "API for managing driving license uploads and operations",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        User: {
          type: "object",
          properties: {
            userId: {
              type: "string",
              description: "MongoDB ObjectId of the user",
              example: "685d4cabcc39dcbd6a017198",
            },
            name: {
              type: "string",
              description: "User full name",
              example: "Tanvir Hasan",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
              example: "t@gmail.com",
            },
          },
        },
        License: {
          type: "object",
          properties: {
            fileId: {
              type: "string",
              description: "GridFS file ID",
              example: "685da8f69b99ef0301fb275d",
            },
            filename: {
              type: "string",
              description: "Generated filename",
              example: "license_685d4cabcc39dcbd6a017198_1750968566045.pdf",
            },
            originalName: {
              type: "string",
              description: "Original uploaded filename",
              example: "linux commands.pdf",
            },
            uploadDate: {
              type: "string",
              format: "date-time",
              description: "Upload timestamp",
              example: "2025-06-26T20:09:26.066Z",
            },
            fileSize: {
              type: "integer",
              description: "File size in bytes",
              example: 992116,
            },
            contentType: {
              type: "string",
              description: "MIME type of the file",
              example: "application/pdf",
            },
            isVerified: {
              type: "boolean",
              description: "Verification status",
              example: false,
            },
          },
        },
        UploadLicense: {
          type: "object",
          properties: {
            userId: {
              type: "string",
              description: "MongoDB ObjectId of the user",
              example: "685d4cabcc39dcbd6a017198",
            },
            fileId: {
              type: "string",
              description: "GridFS file ID",
              example: "685dac080cbde4aba4fb7fd6",
            },
            filename: {
              type: "string",
              description: "Generated filename",
              example: "license_685d4cabcc39dcbd6a017198_1750969352190.pdf",
            },
            originalName: {
              type: "string",
              description: "Original uploaded filename",
              example: "Screenshot 2025-06-26 232810.png",
            },
            uploadDate: {
              type: "string",
              format: "date-time",
              description: "Upload timestamp",
              example: "2025-06-26T20:22:32.225Z",
            },
            fileSize: {
              type: "integer",
              description: "File size in bytes",
              example: 28310,
            },
            contentType: {
              type: "string",
              description: "MIME type of the file",
              example: "image/png",
            },
            isVerified: {
              type: "boolean",
              description: "Verification status",
              example: false,
            },
          },
        },
        LicenseStatus: {
          type: "object",
          properties: {
            hasLicense: {
              type: "string",
              description:
                "License ID if exists, or boolean false if no license",
              example: "685da8349b99ef0301fb2757",
            },
            isVerified: {
              type: "boolean",
              description: "Verification status",
              example: false,
            },
            uploadDate: {
              type: "string",
              format: "date-time",
              description: "Upload timestamp",
              example: "2025-06-26T20:06:12.732Z",
            },
            filename: {
              type: "string",
              description: "Original filename",
              example: "driving licence.pdf",
            },
          },
        },
        DeletedLicense: {
          type: "object",
          properties: {
            fileId: {
              type: "string",
              description: "GridFS file ID",
              example: "685da7c39b99ef0301fb274f",
            },
            filename: {
              type: "string",
              description: "Generated filename",
              example: "license_685d4cabcc39dcbd6a017198_1750968259421.pdf",
            },
            originalName: {
              type: "string",
              description: "Original uploaded filename",
              example: "driving licence.pdf",
            },
            uploadDate: {
              type: "string",
              format: "date-time",
              description: "Upload timestamp",
              example: "2025-06-26T20:04:19.584Z",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Error message",
            },
            error: {
              type: "string",
              description: "Detailed error information",
            },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"], // Path to the API routes
};

const specs = swaggerJSDoc(options);

module.exports = {
  specs,
  swaggerUi,
};

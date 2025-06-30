const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AutoPulse API",
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
            _id: {
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
            avatar: {
              type: "string",
              description: "Avatar URL or path",
              example: "",
            },
            bikes: {
              type: "array",
              items: { $ref: "#/components/schemas/Bike" },
              description: "List of user's bikes",
            },
            drivingLicense: {
              type: "object",
              properties: {
                fileId: {
                  type: "string",
                  description: "GridFS file ID",
                  example: "685db385b85dc63148492c3d",
                },
                filename: {
                  type: "string",
                  description: "Generated filename",
                  example: "license_685d4cabcc39dcbd6a017198_1750971269305.pdf",
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
                  example: "2025-06-26T20:54:29.325Z",
                },
                fileSize: {
                  type: "integer",
                  description: "File size in bytes",
                  example: 101977,
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
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2025-06-26T13:35:39.965Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2025-06-26T20:54:29.330Z",
            },
          },
        },
        Bike: {
          type: "object",
          properties: {
            _id: { type: "string", example: "685d4f07cc39dcbd6a0171a0" },
            user: { type: "string", example: "685d4cabcc39dcbd6a017198" },
            brand: { type: "string", example: "Suzuki" },
            model: { type: "string", example: "Gixxer" },
            year: { type: "string", example: "2025" },
            registrationNumber: { type: "string", example: "DH-LA-65-9421" },
            odometer: { type: "integer", example: 9500 },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2025-06-26T13:45:43.514Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2025-06-26T13:45:43.514Z",
            },
          },
        },
        AuthRegisterResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "User registered successfully",
            },
            user: { $ref: "#/components/schemas/User" },
          },
        },
        AuthLoginResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Login successful" },
            user: { $ref: "#/components/schemas/User" },
          },
        },
        AuthUsersList: {
          type: "object",
          properties: {
            users: {
              type: "array",
              items: { $ref: "#/components/schemas/User" },
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
        RegistrationDoc: {
          type: "object",
          properties: {
            bikeId: { type: "string", example: "685d4f07cc39dcbd6a0171a0" },
            fileId: { type: "string", example: "685dac080cbde4aba4fb7fd6" },
            filename: {
              type: "string",
              example:
                "registration_685d4f07cc39dcbd6a0171a0_1750969352190.pdf",
            },
            originalName: { type: "string", example: "bike_registration.pdf" },
            uploadDate: {
              type: "string",
              format: "date-time",
              example: "2025-06-27T20:22:32.225Z",
            },
            fileSize: { type: "integer", example: 28310 },
            contentType: { type: "string", example: "application/pdf" },
          },
        },
        UploadRegistration: {
          type: "object",
          properties: {
            bikeId: { type: "string", example: "685d4f07cc39dcbd6a0171a0" },
            fileId: { type: "string", example: "685dac080cbde4aba4fb7fd6" },
            filename: {
              type: "string",
              example:
                "registration_685d4f07cc39dcbd6a0171a0_1750969352190.pdf",
            },
            originalName: { type: "string", example: "bike_registration.pdf" },
            uploadDate: {
              type: "string",
              format: "date-time",
              example: "2025-06-27T20:22:32.225Z",
            },
            fileSize: { type: "integer", example: 28310 },
            contentType: { type: "string", example: "application/pdf" },
          },
        },
        BikeInfo: {
          type: "object",
          properties: {
            _id: { type: "string", example: "685d4f07cc39dcbd6a0171a0" },
            brand: { type: "string", example: "Suzuki" },
            model: { type: "string", example: "Gixxer" },
            year: { type: "string", example: "2025" },
            registrationNumber: { type: "string", example: "DH-LA-65-9421" },
            odometer: { type: "integer", example: 9500 },
          },
        },
        Registration: {
          type: "object",
          properties: {
            fileId: { type: "string", example: "685dac080cbde4aba4fb7fd6" },
            filename: {
              type: "string",
              example:
                "registration_685d4f07cc39dcbd6a0171a0_1750969352190.pdf",
            },
            originalName: { type: "string", example: "bike_registration.pdf" },
            uploadDate: {
              type: "string",
              format: "date-time",
              example: "2025-06-27T20:22:32.225Z",
            },
            fileSize: { type: "integer", example: 28310 },
            contentType: { type: "string", example: "application/pdf" },
          },
        },
        RegistrationStatus: {
          type: "object",
          properties: {
            hasRegistration: {
              type: "string",
              description:
                "Registration file ID if exists, or boolean false if no registration",
              example: "685dac080cbde4aba4fb7fd6",
            },
            uploadDate: {
              type: "string",
              format: "date-time",
              example: "2025-06-27T20:22:32.225Z",
            },
            filename: {
              type: "string",
              example: "bike_registration.pdf",
            },
          },
        },
        DeletedRegistration: {
          type: "object",
          properties: {
            fileId: { type: "string", example: "685dac080cbde4aba4fb7fd6" },
            filename: {
              type: "string",
              example:
                "registration_685d4f07cc39dcbd6a0171a0_1750969352190.pdf",
            },
            originalName: { type: "string", example: "bike_registration.pdf" },
            uploadDate: {
              type: "string",
              format: "date-time",
              example: "2025-06-27T20:22:32.225Z",
            },
          },
        },
        ServiceLog: {
          type: "object",
          properties: {
            _id: { type: "string", example: "6860a1b2c3d4e5f678901234" },
            bike: { type: "string", example: "685d4f07cc39dcbd6a0171a0" },
            date: { type: "string", format: "date", example: "2025-06-27" },
            serviceType: { type: "string", example: "Oil Change" },
            cost: { type: "number", example: 500 },
            odometer: { type: "number", example: 12000 },
            nextService: { type: "number", example: 13000 },
            description: { type: "string", example: "Changed oil and filter" },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2025-06-27T10:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2025-06-27T10:00:00.000Z",
            },
          },
        },
        Product: {
          type: "object",
          properties: {
            _id: { type: "string", example: "60d21b4667d0d8992e610c85" },
            productName: { type: "string", example: "Helmet" },
            price: { type: "number", example: 1200 },
            productImage: {
              type: "object",
              properties: {
                fileId: { type: "string", example: "60d21b4667d0d8992e610c99" },
                filename: { type: "string", example: "helmet.jpg" },
                originalName: { type: "string", example: "helmet.jpg" },
                uploadDate: {
                  type: "string",
                  format: "date-time",
                  example: "2025-07-01T10:00:00.000Z",
                },
                fileSize: { type: "number", example: 204800 },
                contentType: { type: "string", example: "image/jpeg" },
              },
            },
            category: { type: "string", example: "Accessories" },
            phoneNumber: { type: "string", example: "01700000000" },
            address: { type: "string", example: "Dhaka, Bangladesh" },
            details: {
              type: "string",
              example: "High quality helmet for bikers.",
            },
            user: { type: "string", example: "685d4cabcc39dcbd6a017198" },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2025-07-01T10:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2025-07-01T10:00:00.000Z",
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

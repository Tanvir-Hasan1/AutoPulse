# AutoPulse — Vehicle Management Mobile Application

AutoPulse is a cross-platform mobile app for managing bikes and vehicles. Built with React Native, Expo, Node.js, Express, and MongoDB, it combines vehicle document storage, fuel and mileage tracking, and a marketplace for parts in a single, user-friendly platform.

The frontend offers a fast, responsive interface for Android and iOS, using Context API for state management and React Navigation for smooth navigation. Users can upload documents, track fuel and mileage, and manage marketplace listings.

The backend is a RESTful API with Node.js and Express, using MongoDB and GridFS for data and file storage. JWT provides secure authentication, while Nodemailer handles email notifications. All APIs are documented and testable via Swagger UI.

Developers can run the frontend with Expo and the backend with Node.js. Both connect through environment variables, and all features can be tested using Swagger and the app interface.

Key features of AutoPulse include:  
- 🚀 Fast, responsive UI with React Native and Expo  
- 📱 Cross-platform support for Android and iOS  
- 🗂️ Vehicle documentation management for registration, insurance, and important documents  
- ⛽ Fuel consumption logging and trend analysis  
- 🛣️ Mileage tracking for trips and maintenance planning  
- 🛒 Marketplace for browsing and listing vehicle parts  
- 🔐 Authentication and authorization with JWT  
- 📧 Email notifications and password reset via Nodemailer  
- 📝 Profile management and updates  
- 📊 Interactive API documentation using Swagger  

The project uses a modular architecture with a clear separation between frontend and backend components. The frontend directory contains assets, reusable components, context providers, navigation setup, screen components, and service modules for API calls. The backend directory includes configuration files, controllers for request handling, middleware for authentication and validation, Mongoose models, API routes, utility functions, Swagger documentation, and the server entry point.

Environment variables such as server port, MongoDB connection URI, SMTP configuration for email services, and JWT secret are used to configure the application securely. The system ensures smooth communication between the frontend and backend while maintaining data integrity and user security.

AutoPulse demonstrates professional-grade full-stack development practices, combining modern frontend and backend technologies to deliver a scalable, maintainable, and user-centric mobile application. It is suitable for deployment on real devices and can be extended with additional features or integrated with other systems as needed.

---

**Tech Stack Overview:**  
- **Frontend:** React Native, Expo, Context API, React Navigation  
- **Backend:** Node.js, Express.js, MongoDB, GridFS, JWT, Nodemailer, Swagger  
- **Utilities & Tools:** bcrypt, cors, dotenv, multer, Nodemon  

**Running & Testing Overview:**  
The application runs by installing all dependencies with `npm install` in both the frontend and backend directories. The frontend is launched using Expo, which enables running the app on Android or iOS devices. The backend server connects to MongoDB using environment variables for configuration, handling all RESTful API requests. Developers can test all API endpoints via **Swagger UI**, providing an interactive interface to verify authentication, vehicle management, fuel tracking, mileage calculation, marketplace operations, and profile management. This setup allows developers to quickly test features, verify integration between frontend and backend, and debug any issues efficiently.

## install and setup 
npm install


## Creating .env file in root dir
PORT=5000
MONGO_URI=mongodb+srv://general:xhCCXVagqsgqh3rK@autopulse.xxstsz2.mongodb.net/

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=autopulse.services.app@gmail.com
SMTP_PASS=eewa pefe zwdm jtnn
SMTP_FROM=autopulse.services.app@gmail.com


## run
npm run dev

## Folder Structure

AutoPulse/
├── Frontend/
│   ├── assets/                # Images and static assets
│   ├── components/            # Reusable UI components
│   ├── context/               # Context API providers
│   ├── navigation/            # Navigation setup
│   ├── screens/               # Screen components
│   ├── services/              # API calls and business logic
│   ├── App.js                 # App entry point
│   └── package.json           # Project dependencies
│
├── Backend/
│   ├── config/               # Configuration files
│   ├── controllers/          # Request handlers (documents, mail)
│   ├── middlewares/          # Auth and validation middleware
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API routes
│   ├── utils/                # Utilities (password reset, profile updates)
│   ├── swagger.js            # Swagger documentation config
│   ├── server.js             # Backend entry point
│   └── package.json          # Backend dependencies



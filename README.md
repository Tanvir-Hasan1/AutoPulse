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



AutoPulse demonstrates professional-grade full-stack development practices, combining modern frontend and backend technologies to deliver a scalable, maintainable, and user-centric mobile application. It is suitable for deployment on real devices and can be extended with additional features or integrated with other systems as needed.

---

**Tech Stack Overview:**  
- **Frontend:** React Native, Expo, Context API, React Navigation
- 
- **Backend:** Node.js, Express.js, MongoDB, GridFS, JWT, Nodemailer, Swagger
- 
- **Utilities & Tools:** bcrypt, cors, dotenv, multer, Nodemon  

## install and setup 
npm install


## Creating .env file in root dir
PORT=** your specified port **
MONGO_URI=**your - mongodb altus url
RESEND_API= ** Your resend Api **
From = "" your custom domain **

## run
npm run dev

## Folder Structure

AutoPulse/
├── Frontend/
│ ├── assets/ # Images and other static assets
│ ├── components/ # Reusable UI components
│ ├── context/ # Context API providers for state management
│ ├── navigation/ # App navigation setup
│ ├── screens/ # Screen components for different pages
│ ├── services/ # API calls and business logic
│ ├── App.js # Entry point of the React Native app
│ └── package.json # Frontend dependencies
│
├── Backend/
│ ├── config/ # Configuration files for frontend/backend integration
│ ├── controllers/ # Request handlers (documents, email, etc.)
│ ├── middlewares/ # Middleware for authentication and validation
│ ├── models/ # Mongoose schemas (users, vehicles, marketplace)
│ ├── routes/ # API route definitions
│ ├── utils/ # Utility functions (password reset, profile updates)
│ ├── swagger.js # Swagger API documentation setup
│ ├── server.js # Backend entry point
│ ├── package.json # Backend dependencies
│ └── package-lock.json # Lock file for backend dependencies


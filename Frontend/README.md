# AutoPulse Frontend

Welcome to the **AutoPulse Frontend** repository! This project is the mobile and web client for AutoPulse, built with Expo and React Native, following modern industry standards and best practices.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Development](#development)
- [Project Structure](#project-structure)
- [Usage Guide](#usage-guide)
- [Contributing](#contributing)
- [License](#license)
- [Community & Support](#community--support)

---

## Project Overview

AutoPulse is a comprehensive cross-platform mobile application developed using React Native and Expo that helps bike and vehicle owners efficiently manage their vehicles. The app consolidates multiple vehicle-related tasks into a single, user-friendly platform, providing convenience, organization, and real-time tracking. Comprihensive OTP and MAIL service available.

---

## Features

🚀 Fast, responsive UI with React Native and Expo
📱 Runs on Android and iOS devices
🗂️ Vehicle Documentation Management – store and organize registration, insurance, and other important documents
⛽ Fuel Consumption Tracking – log fuel usage and monitor trends
🛣️ Mileage Tracking – track odometer readings and calculate distances for trips and maintenance planning
🛒 Marketplace for Vehicle Parts – browse, discover, and list parts for sale
🧩 Easy navigation using Context API and intuitive screens
⚡ Clean and maintainable codebase using React Native best practices

---

## Tech Stack

- **React Native** (v0.79.2)
- **Expo** (v53.x)
- **TypeScript**
- **Expo Router**
- **React Navigation**
- **Various Expo SDKs** (Camera, File System, Image Picker, etc.)
- **Supporting libraries** (charting, calendars, PDF, toast notifications)

---

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Tanvir-Hasan1/AutoPulse.git
   cd AutoPulse/Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

---

## Development

### Running the App

You can start the project in multiple environments:

- **Expo Go app** (quickest for testing)
- **Android emulator**
- **iOS simulator**
- **Web browser**

Start the development server:
```bash
npx expo start
```
Follow the on-screen instructions to open the app in your preferred environment.

### Other Scripts

- `npm run android` — Launches Android emulator
- `npm run ios` — Launches iOS simulator
- `npm run web` — Runs the app in your browser
- `npm run lint` — Runs linter for code quality
- `npm run reset-project` — Resets starter code, see below for details

---

## Project Structure

```
Frontend/
├── app/                # Main app screens & routes
├── components/         # Reusable UI components
├── constants/          # Application constants
├── assets/             # Static assets (images, fonts)
├── hooks/              # Custom React hooks
├── scripts/            # Helper scripts (e.g., reset-project.js)
├── .expo/              # Expo internals
├── package.json        # Project manifest
├── app.json            # Expo configuration
├── tsconfig.json       # TypeScript configuration
├── eslint.config.js    # ESLint configuration
├── README.md           # This file
└── ...                 # Additional configuration files
```

---

## Usage Guide

- Start development by editing files in the `app/` directory.
- Routing is **file-based** using [expo-router](https://docs.expo.dev/router/introduction/).
- Reusable logic (hooks, constants) is organized for easy access and scalability.
- Use the scripts to reset or lint your project as needed.


## Contributing

We welcome contributions from the community!

1. Fork the repo and create your branch from `main`.
2. Make your changes and commit with clear messages.
3. Ensure code passes all linting and tests.
4. Submit a pull request and describe your changes.

## License

_This project currently does not specify a license._

**Happy coding with AutoPulse Frontend!**

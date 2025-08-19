// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add TypeScript extensions to sourceExts
config.resolver.sourceExts.push("ts", "tsx");

module.exports = config;

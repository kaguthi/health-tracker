module.exports = {
  preset: "jest-expo",
  setupFiles: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-health-connect|react-native-base64))",
  ],
  collectCoverageFrom: [
    "api/**/*.{ts,tsx}",
    "hooks/**/*.{ts,tsx}",
    "constants/**/*.{ts,tsx}",
    "!**/node_modules/**",
  ],
  testPathIgnorePatterns: ["/node_modules/", "/.expo/"],
};

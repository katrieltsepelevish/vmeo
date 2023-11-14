module.exports = {
  testMatch: ["**/__tests__/**/*.+(ts|tsx|js)"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  roots: ["./src"],
};

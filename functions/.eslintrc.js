module.exports = {
  root: false,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "quotes": ["off", "double"],
    "linebreak-style": 0,
  },
};

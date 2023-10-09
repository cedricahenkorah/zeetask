const jwt = require("jsonwebtoken");

// function to generate a unique reset token
const generateResetToken = () => {
  return jwt.sign({}, process.env.RESET_TOKEN_SECRET, { expiresIn: "1hr" });
};

module.exports = { generateResetToken };

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validatePassword = (password) => {
  if (!password) {
    return "Password is required.";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/;
  if (!passwordRegex.test(password)) {
    return "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.";
  }
  return null;
};

const generateHashPassword = async (pass) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(pass, salt);
};

const comparePassword = async (pass, hashedPassword) => {
  return await bcrypt.compare(pass, hashedPassword);
};

const generateToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
};

module.exports = {
  validatePassword,
  generateHashPassword,
  comparePassword,
  generateToken,
  verifyToken,
};

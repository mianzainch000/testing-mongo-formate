require("dotenv").config();
const nodemailer = require("nodemailer");
const ForgetPasswordEmail = require("../emailTemplate");
const User = require("../model/userSchema");
const {
  verifyToken,
  generateToken,
  comparePassword,
  validatePassword,
  generateHashPassword,
} = require("../helper/helperFunction");

exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check for duplicate email
    let existingUserEmail = await User.findOne({ email });
    if (existingUserEmail) {
      return res.status(400).send({ message: "Email already in use" });
    }

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).send({ message: passwordError });
    }

    // Hash the password
    const hashedPassword = await generateHashPassword(password);

    // Create new user
    let user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // Save user to the database
    let result = await user.save();

    // Remove password from the response
    result = result.toObject();
    delete result.password;

    res
      .status(201)
      .send({ message: "Account created successfully", user: result });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).send({ message: errors.join(", ") }); // Send validation errors to the client
    }

    res.status(500).send({ message: "Internal Server Error." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send({ message: "Invalid email" });
    }

    // Compare password with hashed password stored in the database
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ message: "Invalid password" });
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    // Get the expiration time from environment variable or use a default value
    const expiresIn = process.env.JWT_EXPIRATION;

    // Use generateToken function to create JWT token
    const token = generateToken(
      { user: userResponse },
      process.env.JWT_SECRET,
      expiresIn
    );

    // Send response with user data and token
    return res.status(201).send({
      message: "Login successful",
      user: userResponse,
      token: token,
    });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error." });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({ message: "Please provide an email." });
    }

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    // Generate JWT token using helper function
    const tokenEmail = generateToken(
      { email },
      process.env.JWT_SECRET,
      process.env.JWT_EXPIRATION_EMAIL
    );

    // Prepare email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      auth: {
        user: process.env.OWNER_EMAIL, // Use environment variables
        pass: process.env.OWNER_PASS,
      },
    });

    // Email content
    const html = ForgetPasswordEmail.email(
      "http://localhost:3000/auth/resetPassword",
      tokenEmail
    );
    const emailOptions = {
      from: process.env.OWNER_EMAIL,
      to: email,
      subject: "Here's your password reset link!",
      text: "click on Button to Reset ",
      html: html,
    };

    // Send the email
    await transporter.sendMail(emailOptions);

    return res
      .status(201)
      .send({ message: "Password reset email sent successfully." });
  } catch (error) {
    return res.status(500).send({ message: "Internal server error." });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { tokenEmail: token } = req.params;
    const { newPassword } = req.body;

    // Validate inputs
    if (!token || !newPassword) {
      return res
        .status(400)
        .send({ message: "Token and new password are required" });
    }

    // Validate the new password using helper function
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).send({ message: passwordError });
    }

    // Verify the token using the helper function
    let decoded;
    try {
      decoded = verifyToken(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).send({ message: err.message });
    }

    // Extract email from the token
    const { email } = decoded;

    // // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Hash the new password using helper function
    const hashedPassword = await generateHashPassword(newPassword);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.status(201).send({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error in ResetPassword:", error.message);
    res.status(500).send({ message: "Internal server error" });
  }
};

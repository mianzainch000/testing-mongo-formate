require("dotenv").config();
const User = require("../model/userSchema");
const {
  validatePassword,
  generateHashPassword,
  generateToken,
  comparePassword,
} = require("../helper/helperFunction");

exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check for duplicate email
    let existingUserEmail = await User.findOne({ email });
    if (existingUserEmail) {
      return res.status(409).send({ message: "Email already in use" });
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

    res
      .status(500)
      .send({ message: "Something went wrong, please try again." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    console.log("user=============",user)
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
    res
      .status(500)
      .send({ message: "Something went wrong, please try again." });
  }
};

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required."],
    minlength: [2, "First name must be at least 2 characters long."],
    maxlength: [50, "First name cannot exceed 50 characters."],
    match: [/^[A-Za-z]+$/, "First name must contain only alphabets."],
  },
  lastName: {
    type: String,
    required: [true, "Last name is required."],
    minlength: [2, "Last name must be at least 2 characters long."],
    maxlength: [50, "Last name cannot exceed 50 characters."],
    match: [/^[A-Za-z]+$/, "Last name must contain only alphabets."],
  },
  email: {
    type: String,
    required: [true, "Email is required."],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address."],
  },
  password: {
    type: String,
   

  },
});

module.exports = mongoose.model("users", userSchema);

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Routes
const userRoutes = require("./src/route/userRoute");
const productRoutes = require("./src/route/productRoute");
// const addressRoutes = require("./routes/address");

// Use routes
app.use("/", userRoutes);
app.use("/", productRoutes);
// app.use("/", addressRoutes);

// Get the port from environment variables
const PORT = process.env.PORT  // Default to 4000 if not specified in .env

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const express = require("express");
const router = express.Router();
const userController = require('../controller/userController');
router.post("/signup", userController.signup);
// router.post("/login", Login);
// router.post("/forgotPassword", ForgotPassword);
// router.post("/resetPassword/:tokenEmail", ResetPassword);

module.exports = router;

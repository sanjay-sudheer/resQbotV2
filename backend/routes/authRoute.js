// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

// Define the login route
router.post('/login', authController.login);

module.exports = router;
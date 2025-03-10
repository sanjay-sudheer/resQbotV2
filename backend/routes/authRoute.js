// routes/authRoutes.mjs

import express from 'express';
import authController from '../controller/authController.js';

const router = express.Router();

// Define the login route
router.post('/login', authController.login);

export default router;

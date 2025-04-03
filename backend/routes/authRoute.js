// routes/authRoutes.mjs

import express from 'express';
import {login,amblogin} from '../controller/authController.js';

const router = express.Router();

// Define the login route
router.post('/login', login);
router.post('/amblogin', amblogin);

export default router;

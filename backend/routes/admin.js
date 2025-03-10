import express from 'express';
import {getAllEmergencies} from '../controller/admin.js';

const router = express.Router();

router.get('/getAllEmergencies', getAllEmergencies);

export default router;

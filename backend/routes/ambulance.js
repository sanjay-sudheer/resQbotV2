import express from 'express';
import { getAssignedEmergency, updateEmergencyStatus } from '../controller/ambulance.js';


const router = express.Router();

router.get('/getAssigned/:id', getAssignedEmergency);
router.post('/updateStatus/:id', updateEmergencyStatus);

export default router;
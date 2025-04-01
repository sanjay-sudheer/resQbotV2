import express from 'express';
import { getAssignedEmergency, updateAmbulanceStatus, completeEmergency } from '../controller/ambulance.js';


const router = express.Router();

router.get('/getAssigned/:id', getAssignedEmergency);
router.post('/updateStatus', updateAmbulanceStatus);
router.post('/complete', completeEmergency);

export default router;
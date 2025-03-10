import express from 'express';
import {getAllEmergencies,updateEmergencyStatus} from '../controller/admin.js';

const router = express.Router();

router.get('/getAll', getAllEmergencies);
router.post('/updateStatus', (req, res) => {
    const { id, status } = req.body;
    updateEmergencyStatus(id, status);
    res.status(200).json({
        success: true,
        message: 'Emergency status updated'
    });
});

export default router;

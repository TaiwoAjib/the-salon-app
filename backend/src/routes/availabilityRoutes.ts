import express from 'express';
import { getAvailability, setAvailability } from '../controllers/availabilityController';

const router = express.Router();

router.get('/', getAvailability);
router.post('/', setAvailability); // Admin only

export default router;

import express from 'express';
import { getDashboardStats, getPeakHours, getStaffPerformance, getRecentActivity } from '../controllers/analyticsController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', auth, getDashboardStats);
router.get('/peak-hours', auth, getPeakHours);
router.get('/staff-performance', auth, getStaffPerformance);
router.get('/recent-activity', auth, getRecentActivity);

export default router;

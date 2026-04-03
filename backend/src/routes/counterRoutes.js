import express from 'express';
import { callNext, toggleCounterStatus, getCounters, getCounterStatus, getMyCounter, assignStaff, createCounter } from '../controllers/counterController.js';
import { auth, adminAuth, staffAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-counter', auth, getMyCounter);
router.post('/assign-staff', auth, adminAuth, assignStaff);
router.post('/', auth, adminAuth, createCounter);
router.get('/', getCounters);
router.post('/call-next', auth, staffAuth, callNext);
router.post('/toggle-status', auth, staffAuth, toggleCounterStatus);
router.get('/:counterId', getCounterStatus);

export default router;

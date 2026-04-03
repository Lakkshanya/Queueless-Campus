import express from 'express';
import { bookToken, getStudentStatus, getHistory, getTokenStats } from '../controllers/tokenController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/book', auth, bookToken);
router.get(['/status', '/status/:id'], auth, getStudentStatus);
router.get('/history', auth, getHistory);
router.get('/stats', auth, getTokenStats);

export default router;

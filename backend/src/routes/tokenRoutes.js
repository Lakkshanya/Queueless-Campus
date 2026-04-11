import express from 'express';
import { 
    bookToken, 
    startToken, 
    completeToken, 
    getStudentStatus, 
    getHistory, 
    getTokenStats,
    getAdminTokenStats 
} from '../controllers/tokenController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', auth, bookToken);
router.put('/start', auth, startToken);
router.put('/complete', auth, completeToken);
router.get('/status', auth, getStudentStatus);
router.get('/status/:id', auth, getStudentStatus);
router.get('/history', auth, getHistory);
router.get('/stats', auth, getTokenStats);
router.get('/admin/stats', auth, getAdminTokenStats);

export default router;

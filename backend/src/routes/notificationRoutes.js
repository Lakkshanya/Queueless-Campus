import express from 'express';
import { getNotifications, markAsRead, broadcastNotification } from '../controllers/notificationController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getNotifications);
router.put('/:id/read', auth, markAsRead);
router.post('/broadcast', auth, broadcastNotification);

export default router;

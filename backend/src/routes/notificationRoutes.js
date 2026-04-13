import express from 'express';
import { 
    getNotifications, 
    markAsRead, 
    broadcastNotification, 
    notifyAdmin,
    staffTargetedBroadcast 
} from '../controllers/notificationController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getNotifications);
router.put('/:id/read', auth, markAsRead);
router.post('/send', auth, authorize('admin'), broadcastNotification);
router.post('/admin/notify', auth, authorize('staff'), notifyAdmin);
router.post('/staff/broadcast', auth, authorize('staff'), staffTargetedBroadcast);

export default router;

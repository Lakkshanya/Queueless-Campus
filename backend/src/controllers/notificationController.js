import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendNotification } from '../utils/notificationService.js';

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const broadcastNotification = async (req, res) => {
  try {
    const { title, message, targetRole } = req.body; // targetRole: 'student', 'staff', or 'all'
    
    const query = targetRole === 'all' ? {} : { role: targetRole };
    const users = await User.find(query).select('_id');

    const notifications = users.map(u => ({
      user: u._id,
      title,
      message,
      type: 'broadcast'
    }));

    await Notification.insertMany(notifications);

    // Send push notifications (async)
    users.forEach(u => {
      sendNotification(u._id.toString(), title, message, { type: 'broadcast' });
    });

    res.json({ message: `Broadcast sent to ${users.length} users` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

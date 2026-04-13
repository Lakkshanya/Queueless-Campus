import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Token from '../models/Token.js';
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
    const { title, message, targetRole } = req.body; 
    
    const query = (targetRole === 'all' || !targetRole) ? {} : { role: targetRole };
    const users = await User.find(query).select('_id');

    const notifications = users.map(u => ({
      user: u._id,
      title,
      message,
      type: 'broadcast'
    }));

    await Notification.insertMany(notifications);

    users.forEach(u => {
      sendNotification(u._id.toString(), title, message, { type: 'broadcast' });
    });

    res.json({ message: `Broadcast sent to ${users.length} users` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const notifyAdmin = async (req, res) => {
  try {
    const { message } = req.body;
    const admins = await User.find({ role: 'admin' }).select('_id');
    
    if (admins.length === 0) return res.status(404).json({ message: 'No admins found' });

    const notifications = admins.map(a => ({
      user: a._id,
      title: `Staff Alert: ${req.user.name}`,
      message,
      type: 'staff_alert'
    }));

    await Notification.insertMany(notifications);

    admins.forEach(a => {
      sendNotification(a._id.toString(), `Staff Alert: ${req.user.name}`, message, { type: 'staff_alert' });
    });

    res.json({ message: 'Admin notified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const staffTargetedBroadcast = async (req, res) => {
  try {
    const { serviceId, message } = req.body;
    
    // Find all users who have an active or waiting token for this service
    const activeTokens = await Token.find({ 
      service: serviceId, 
      status: { $in: ['waiting', 'serving'] } 
    }).populate('student');

    if (activeTokens.length === 0) {
      return res.status(404).json({ message: 'No active students found for this service' });
    }

    const uniqueStudentIds = [...new Set(activeTokens.map(t => t.student._id.toString()))];
    
    const notifications = uniqueStudentIds.map(sid => ({
      user: sid,
      title: `Update from ${req.user.name}`,
      message,
      type: 'staff_broadcast'
    }));

    await Notification.insertMany(notifications);

    uniqueStudentIds.forEach(sid => {
      sendNotification(sid, `Update from ${req.user.name}`, message, { type: 'staff_broadcast' });
    });

    res.json({ message: `Message dispatched to ${uniqueStudentIds.length} students` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

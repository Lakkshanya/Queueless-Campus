import Token from '../models/Token.js';
import Counter from '../models/Counter.js';
import Service from '../models/Service.js';
import Sequence from '../models/Sequence.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendNotification } from '../utils/notificationService.js';

export const createCounter = async (req, res) => {
  try {
    const { number, services } = req.body;
    
    // Check if counter number exists
    const existing = await Counter.findOne({ number });
    if (existing) {
      return res.status(400).json({ message: 'Counter number already defined in the registry.' });
    }

    const counter = new Counter({
      number,
      services: services || [],
      status: 'inactive',
      workload: 0
    });

    await counter.save();
    res.status(201).json(counter);
  } catch (error) {
    res.status(500).json({ message: 'Failed to initialize terminal.', error: error.message });
  }
};

export const assignStaff = async (req, res) => {
  try {
    const { counterId, staffId } = req.body;

    // Check if staff is already assigned elsewhere
    const existingCounter = await Counter.findOne({ staff: staffId });
    if (existingCounter && existingCounter._id.toString() !== counterId) {
      return res.status(400).json({ message: 'Staff member is already assigned to another counter' });
    }

    const counter = await Counter.findById(counterId);
    if (!counter) return res.status(404).json({ message: 'Counter not found' });

    // Update Counter
    counter.staff = staffId;
    await counter.save();

    // Update User
    await User.findByIdAndUpdate(staffId, { assignedCounter: counterId });

    res.json({ message: 'Staff assigned successfully', counter });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCounters = async (req, res) => {
  try {
    const counters = await Counter.find().populate('staff', 'name').populate('services', 'name');
    res.json(counters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const callNext = async (req, res) => {
  try {
    const { counterId } = req.body;
    const counter = await Counter.findById(counterId);

    if (!counter) return res.status(404).json({ message: 'Counter not found' });

    // Mark current token as processing or complete
    if (counter.currentToken) {
      await Token.findByIdAndUpdate(counter.currentToken, { status: 'completed', completedAt: new Date() });
    }

    // Find next token in queue for this counter
    const nextToken = await Token.findOne({ 
      counter: counterId, 
      status: 'waiting' 
    }).sort({ bookedAt: 1 });

    if (!nextToken) {
      counter.currentToken = null;
      counter.workload = 0;
      await counter.save();
      return res.json({ message: 'Queue empty', counter });
    }

    nextToken.status = 'processing';
    await nextToken.save();

    counter.currentToken = nextToken._id;
    if (counter.workload > 0) counter.workload -= 1;
    await counter.save();

    // Notify Socket
    const io = req.app.get('io');
    io.emit('queueUpdated', { counterId });
    
    if (nextToken) {
      const msg = "It's your turn! Please proceed to the counter.";
      io.to(nextToken.student.toString()).emit('turnApproaching', { 
        token: nextToken,
        message: msg
      });
      // Save to DB
      await Notification.create({
        user: nextToken.student,
        title: "Your Turn!",
        message: msg,
        type: 'turn'
      });

      // Send Push Notification
      await sendNotification(nextToken.student, "Your Turn!", msg, { type: 'turn' });
    }

    // Notify top 5 waiting students
    const topWaiting = await Token.find({ counter: counterId, status: 'waiting' })
      .sort({ bookedAt: 1 })
      .limit(5);

    for (const [idx, t] of topWaiting.entries()) {
      const position = idx + 1;
      const msg = position === 1 ? "Your turn is next!" : `Only ${position} tokens left ahead of you.`;
      
      io.to(t.student.toString()).emit('turnApproaching', {
        position,
        message: msg
      });

      // Save to DB
      await Notification.create({
        user: t.student,
        title: "Queue Update",
        message: msg,
        type: 'alert'
      });

      // Send Push Notification
      await sendNotification(t.student, "Queue Update", msg, { type: 'alert', position: position.toString() });
    }

    res.json({ message: 'Next token called', token: nextToken, counter });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleCounterStatus = async (req, res) => {
  try {
    const { counterId, status } = req.body;
    const counter = await Counter.findByIdAndUpdate(counterId, { status }, { new: true });
    res.json(counter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyCounter = async (req, res) => {
  try {
    const staffId = req.user.id;
    const counter = await Counter.findOne({ staff: staffId })
      .populate({
        path: 'currentToken',
        populate: [
          { path: 'service' },
          { path: 'student', select: 'name' }
        ]
      })
      .populate('service');
    
    if (!counter) return res.status(404).json({ message: 'No counter assigned to this staff member' });

    const waitingTokens = await Token.find({ counter: counter._id, status: 'waiting' })
      .sort({ bookedAt: 1 })
      .populate('service')
      .populate('student', 'name');

    // Calculate Today's Stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStats = await Token.aggregate([
      { 
        $match: { 
          counter: counter._id, 
          status: 'completed',
          completedAt: { $gte: today }
        } 
      },
      {
        $group: {
          _id: null,
          totalServed: { $sum: 1 },
          totalProcessingTime: { $sum: { $subtract: ["$completedAt", "$bookedAt"] } }
        }
      }
    ]);

    const statsData = todayStats[0] || { totalServed: 0, totalProcessingTime: 0 };
    const avgPulse = statsData.totalServed > 0 
      ? (statsData.totalProcessingTime / statsData.totalServed / 60000).toFixed(1) 
      : 0;
    
    res.json({ 
      counter, 
      waitingTokens,
      stats: {
        todayTotal: statsData.totalServed,
        avgPulse: `${avgPulse}m`
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCounterStatus = async (req, res) => {
  try {
    const { counterId } = req.params;
    const counter = await Counter.findById(counterId)
      .populate('staff', 'name')
      .populate({
        path: 'currentToken',
        populate: { path: 'service' }
      })
      .populate('services');
    
    const waitingTokens = await Token.find({ counter: counterId, status: 'waiting' }).sort({ bookedAt: 1 }).populate('service').populate('student', 'name');
    
    res.json({ counter, waitingTokens });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

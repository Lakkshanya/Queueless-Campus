import Token from '../models/Token.js';
import Counter from '../models/Counter.js';
import Service from '../models/Service.js';
import Sequence from '../models/Sequence.js';
import redisClient from '../config/redis.js';
import Notification from '../models/Notification.js';

export const bookToken = async (req, res) => {
  try {
    const { serviceId } = req.body;
    const studentId = req.user.id;

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    // Find the counter with the least workload for this service
    const counters = await Counter.find({ 
      status: 'active', 
      services: serviceId 
    }).sort({ workload: 1 });

    if (counters.length === 0) {
      return res.status(404).json({ message: 'No active counters for this service' });
    }

    const assignedCounter = counters[0];

    // Generate Sequential Token Number
    const sequence = await Sequence.findOneAndUpdate(
      { serviceId },
      { $inc: { sequence_value: 1 } },
      { upsert: true, new: true }
    );

    const tokenNumber = `${service.prefix}-${sequence.sequence_value.toString().padStart(3, '0')}`;

    const newToken = new Token({
      number: tokenNumber,
      student: studentId,
      service: serviceId,
      counter: assignedCounter._id,
      status: 'waiting',
      queuePosition: assignedCounter.workload + 1,
      estimatedWaitTime: assignedCounter.workload * (service.estimatedTimePerToken || 10)
    });

    await newToken.save();

    // Invalidate Redis cache
    await redisClient.del(`active_token:${studentId}`);

    // Update Counter workload
    assignedCounter.workload += 1;
    await assignedCounter.save();

    // Notify Socket
    const io = req.app.get('io');
    io.emit('tokenBooked', newToken);
    io.to(assignedCounter._id.toString()).emit('queueUpdated', { counterId: assignedCounter._id });

    // Auto-generate Notification
    await Notification.create({
      user: studentId,
      title: 'Token Booked',
      message: `Token ${tokenNumber} has been successfully booked for ${service.name}.`,
      type: 'info'
    });

    res.status(201).json(newToken);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const startToken = async (req, res) => {
  try {
    const { tokenId } = req.body;
    const token = await Token.findById(tokenId).populate('student').populate('service');
    if (!token) return res.status(404).json({ message: 'Token not found' });

    token.status = 'serving';
    await token.save();

    // Notify Socket
    const io = req.app.get('io');
    io.to(token.student._id.toString()).emit('tokenStarted', { 
        tokenId: token._id, 
        message: 'Your turn has arrived! Please proceed to the counter.' 
    });

    // Auto-generate Notification
    await Notification.create({
      user: token.student._id,
      title: 'Now Serving',
      message: `Your turn for ${token.service.name} has started. Please proceed to the counter.`,
      type: 'alert'
    });

    res.json({ message: 'Service started', token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const completeToken = async (req, res) => {
  try {
    const { tokenId } = req.body;
    const token = await Token.findById(tokenId).populate('student').populate('service').populate('counter');
    if (!token) return res.status(404).json({ message: 'Token not found' });

    token.status = 'completed';
    await token.save();

    // Update Counter workload
    if (token.counter) {
        const counter = await Counter.findById(token.counter._id);
        if (counter && counter.workload > 0) {
            counter.workload -= 1;
            await counter.save();
        }
    }

    // Notify Socket
    const io = req.app.get('io');
    io.to(token.student._id.toString()).emit('tokenCompleted', { tokenId: token._id });

    // Auto-generate Notification
    await Notification.create({
      user: token.student._id,
      title: 'Service Completed',
      message: `Thank you. Your session for ${token.service.name} is complete.`,
      type: 'success'
    });

    res.json({ message: 'Service completed', token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudentStatus = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;
    
    const query = id ? { _id: id } : { student: studentId, status: { $in: ['waiting', 'serving'] } };
    const token = await Token.findOne(query)
      .populate('service', 'name prefix estimatedTimePerToken')
      .populate({
        path: 'counter',
        select: 'number status',
        populate: { path: 'staff', select: 'name' }
      })
      .sort({ bookedAt: -1 });
    
    if (!token) return res.json(null);

    // Calculate queue metrics
    const ahead = await Token.countDocuments({
      counter: token.counter?._id,
      status: 'waiting',
      bookedAt: { $lt: token.bookedAt }
    });

    res.json({
      token,
      ahead,
      wait: ahead * (token.service?.estimatedTimePerToken || 10)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHistory = async (req, res) => {
  try {
    const tokens = await Token.find({ 
      student: req.user.id, 
      status: { $in: ['completed', 'cancelled'] } 
    })
    .populate('service', 'name prefix')
    .sort({ bookedAt: -1 });
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTokenStats = async (req, res) => {
  try {
    const studentId = req.user.id;
    const served = await Token.countDocuments({ student: studentId, status: 'completed' });
    const missed = await Token.countDocuments({ student: studentId, status: 'cancelled' });
    res.json({ served, missed });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminTokenStats = async (req, res) => {
  try {
    const totalTokens = await Token.countDocuments();
    const servedTokens = await Token.countDocuments({ status: 'completed' });
    const waitingTokens = await Token.countDocuments({ status: 'waiting' });
    const servingTokens = await Token.countDocuments({ status: 'serving' });
    const missedTokens = await Token.countDocuments({ status: 'cancelled' });
    
    // Recent 10 tokens
    const recentTokens = await Token.find()
      .populate('service', 'name prefix')
      .populate('student', 'name')
      .populate('counter', 'number')
      .sort({ bookedAt: -1 })
      .limit(10);

    res.json({ totalTokens, servedTokens, waitingTokens, servingTokens, missedTokens, recentTokens });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

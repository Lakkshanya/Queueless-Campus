import Token from '../models/Token.js';
import Counter from '../models/Counter.js';
import Service from '../models/Service.js';
import Sequence from '../models/Sequence.js';
import redisClient from '../config/redis.js';

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

    // Invalidate Redis cache for this student's active token
    await redisClient.del(`active_token:${studentId}`);

    // Update Counter workload
    assignedCounter.workload += 1;
    await assignedCounter.save();

    // Notify Socket
    const io = req.app.get('io');
    io.emit('tokenBooked', newToken);
    io.to(assignedCounter._id.toString()).emit('queueUpdated', { counterId: assignedCounter._id });

    res.status(201).json(newToken);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudentStatus = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;
    
    // Try to get from Redis first (only for active session check)
    if (!id) {
      const cachedToken = await redisClient.get(`active_token:${studentId}`);
      if (cachedToken) {
        return res.json(JSON.parse(cachedToken));
      }
    }

    const query = id ? { _id: id } : { student: studentId, status: { $in: ['waiting', 'serving'] } };
    const token = await Token.findOne(query)
      .populate('service', 'name prefix')
      .populate({
        path: 'counter',
        select: 'number status',
        populate: { path: 'services' }
      })
      .sort({ bookedAt: -1 });
    
    if (!token) return res.json(null);

    // Calculate queue metrics
    const ahead = await Token.countDocuments({
      counter: token.counter._id,
      status: 'waiting',
      bookedAt: { $lt: token.bookedAt }
    });

    const servingNow = await Token.findOne({
      counter: token.counter._id,
      status: 'processing'
    }).select('number');

    const result = {
      token,
      ahead,
      wait: ahead * (token.service?.estimatedTimePerToken || 10),
      servingNow: servingNow || { number: 'None' }
    };

    // Cache for 1 minute
    await redisClient.setEx(`active_token:${studentId}`, 60, JSON.stringify(result));

    res.json(result);
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

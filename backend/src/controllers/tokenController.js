import Token from '../models/Token.js';
import Counter from '../models/Counter.js';
import Service from '../models/Service.js';
import Sequence from '../models/Sequence.js';
import redisClient from '../config/redis.js';
import Notification from '../models/Notification.js';
import { sendNotification } from '../utils/notificationService.js';

export const bookToken = async (req, res) => {
  try {
    const { serviceId } = req.body;
    const studentId = req.user.id;

    console.log(`[DEBUG] Attempting to book token for Service: ${serviceId}, Student: ${studentId}`);

    const service = await Service.findById(serviceId);
    if (!service) {
      console.error(`[ERROR] Service not found: ${serviceId}`);
      return res.status(404).json({ message: 'Service not found' });
    }

    // Find the assigned counter attached to this service
    if (!service.assignedCounter) {
      console.error(`[ERROR] No counters found for Service: ${serviceId}`);
      return res.status(404).json({ message: 'No counters have been assigned to this service node yet.' });
    }

    const assignedCounter = await Counter.findById(service.assignedCounter);
    if (!assignedCounter) {
      return res.status(404).json({ message: 'The assigned counter could not be located in the operational grid.' });
    }
    console.log(`[DEBUG] Assigned to Counter: ${assignedCounter.number} (ID: ${assignedCounter._id})`);

    // Generate Sequential Token Number
    let sequence;
    try {
      sequence = await Sequence.findOneAndUpdate(
        { serviceId },
        { $inc: { sequence_value: 1 } },
        { upsert: true, new: true }
      );
      console.log(`[DEBUG] Sequence generated: ${sequence.sequence_value}`);
    } catch (seqError) {
      console.error(`[ERROR] Sequence generation failed: ${seqError.message}`);
      throw seqError;
    }

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
    console.log(`[DEBUG] Token saved successfully: ${tokenNumber}`);

    // Invalidate Redis cache
    await redisClient.del(`active_token:${studentId}`);

    // Update Counter workload
    assignedCounter.workload += 1;
    await assignedCounter.save();

    // Notify Socket
    const io = req.app.get('io');
    io.emit('tokenBooked', newToken);
    io.to(assignedCounter._id.toString()).emit('queueUpdated', { counterId: assignedCounter._id });

    await Notification.create({
      user: studentId,
      title: 'Token Booked',
      message: `Token ${tokenNumber} has been successfully booked for ${service.name}.`,
      type: 'info'
    });

    // FCM Notification
    sendNotification(studentId, 'Token Booked', `Your token ${tokenNumber} is ready. Track your position in the Live Queue.`, { type: 'token_booked' });

    console.log(`[DEBUG] Booking flow complete for Token: ${tokenNumber}`);
    res.status(201).json({ token: newToken });
  } catch (error) {
    console.error(`[FATAL ERROR] Booking failed: ${error.stack}`);
    res.status(500).json({ message: error.message });
  }
};

export const startToken = async (req, res) => {
  try {
    const { tokenId } = req.body;
    const token = await Token.findById(tokenId).populate('student').populate('service');
    if (!token) return res.status(404).json({ message: 'Token not found' });

    token.status = 'serving';
    token.startTime = new Date();
    await token.save();

    // Update Counter currentToken
    if (token.counter) {
        await Counter.findByIdAndUpdate(token.counter, { currentToken: token._id });
    }

    // 🎯 3-LEVEL LOOP NOTIFICATION LOGIC
    // Notify the current student
    const io = req.app.get('io');
    io.to(token.student._id.toString()).emit('tokenStarted', { 
        tokenId: token._id, 
        message: 'Your turn has arrived! Please proceed to the counter.' 
    });

    await Notification.create({
      user: token.student._id,
      title: 'Now Serving',
      message: `Your turn for ${token.service.name} has started. Please proceed to the counter.`,
      type: 'alert'
    });
    sendNotification(token.student._id.toString(), 'Now Serving', 'Your turn! Please proceed to the counter immediately.', { type: 'token_started' });

    // Notify the next 2 students in the waiting grid for this specific counter
    const nextTokens = await Token.find({
      counter: token.counter,
      status: 'waiting'
    }).sort({ bookedAt: 1 }).limit(2).populate('student');

    if (nextTokens.length > 0) {
      // 2nd Position: "You are Next"
      const t2 = nextTokens[0];
      sendNotification(t2.student._id.toString(), 'You are Next', 'Please be ready, you are the next person in line.', { type: 'token_next' });
      
      if (nextTokens.length > 1) {
        // 3rd Position: "2 people before you"
        const t3 = nextTokens[1];
        sendNotification(t3.student._id.toString(), 'Prepare Yourself', 'There are 2 people before you. Please stay close to the counter.', { type: 'token_prepare' });
      }
    }

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

    // Update Counter: Clear currentToken and decrement workload
    if (token.counter) {
        await Counter.findByIdAndUpdate(token.counter._id, { 
            currentToken: null,
            $inc: { workload: -1 }
        });
    }

    // Notify Socket
    const io = req.app.get('io');
    io.to(token.student._id.toString()).emit('tokenCompleted', { tokenId: token._id });

    await Notification.create({
      user: token.student._id,
      title: 'Service Completed',
      message: `Thank you. Your session for ${token.service.name} is complete.`,
      type: 'success'
    });

    // FCM Notification
    sendNotification(token.student._id.toString(), 'Service Completed', `Your session for ${token.service.name} is complete. Thank you!`, { type: 'token_completed' });

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

    // Fetch Preview Queue (Top 3 tokens for this counter)
    const preview = await Token.find({
      counter: token.counter?._id,
      status: { $in: ['serving', 'waiting'] }
    })
    .sort({ status: -1, bookedAt: 1 }) // 'serving' first, then 'waiting' by time
    .limit(3)
    .select('number status');

    res.json({
      token,
      ahead,
      wait: ahead * (token.service?.timePerStudent || 10),
      preview
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

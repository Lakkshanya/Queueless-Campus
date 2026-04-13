import Service from '../models/Service.js';
import Counter from '../models/Counter.js';
import Token from '../models/Token.js';
import { sendNotification } from '../utils/notificationService.js';

export const createService = async (req, res) => {
  try {
    const { name, prefix, description, estimatedTimePerToken, estimatedTimePerStudent, maxTokens, assignedCounter, venue } = req.body;
    const serviceData = { name, prefix, description, estimatedTimePerToken, estimatedTimePerStudent, maxTokens, venue };
    if (assignedCounter) serviceData.assignedCounter = assignedCounter;

    const newService = new Service(serviceData);
    await newService.save();
    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getServices = async (req, res) => {
  try {
    const services = await Service.find()
      .populate({
        path: 'assignedCounter',
        populate: { path: 'staff', select: 'name email department' }
      })
      .lean();
    
    // Import User model dynamically
    const mongoose = (await import('mongoose')).default;
    const Token = mongoose.models.Token;
    const User = mongoose.models.User;

    const enrichedServices = await Promise.all(services.map(async (s) => {
      const inQueue = Token ? await Token.countDocuments({ service: s._id, status: 'waiting' }) : 0;
      
      // Resolve Staff Name: 
      // 1. Try to get it from the linked counter's active staff
      // 2. Fallback: Search for any staff member who has this service assigned directly
      let resolvedStaffName = s.assignedCounter?.staff?.name;
      
      if (!resolvedStaffName && User) {
        const directStaff = await User.findOne({ 
          assignedServices: s._id, 
          role: 'staff' 
        }).select('name').lean();
        if (directStaff) resolvedStaffName = directStaff.name;
      }
      
      return {
        ...s,
        count: inQueue,
        // Fallback fields for legacy UI if needed
        counterAssigned: s.assignedCounter ? `Station ${s.assignedCounter.number}` : 'No Station',
        staffAssigned: resolvedStaffName || 'NIL'
      };
    }));

    res.json(enrichedServices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const oldService = await Service.findById(req.params.id);
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // Check if assignedCounter changed and notify the staff
    if (req.body.assignedCounter && String(oldService.assignedCounter) !== String(req.body.assignedCounter)) {
      const counter = await Counter.findById(req.body.assignedCounter).populate('staff');
      if (counter && counter.staff) {
        await sendNotification(
          counter.staff._id.toString(),
          'New Service Assignment',
          `You have been assigned to the service: ${service.name}.`,
          { type: 'assignment' }
        );
      }
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

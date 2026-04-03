import Service from '../models/Service.js';
import Counter from '../models/Counter.js';
import Token from '../models/Token.js';

export const createService = async (req, res) => {
  try {
    const { name, prefix, description, estimatedTimePerToken } = req.body;
    const newService = new Service({ name, prefix, description, estimatedTimePerToken });
    await newService.save();
    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getServices = async (req, res) => {
  try {
    const services = await Service.find().lean();
    
    const enrichedServices = await Promise.all(services.map(async (s) => {
      const counters = await Counter.find({ services: s._id });
      const activeCount = counters.filter(c => c.status === 'active').length;
      const maintenanceCount = counters.filter(c => c.status === 'maintenance').length;
      
      const inQueue = await Token.countDocuments({ service: s._id, status: 'waiting' });
      
      return {
        ...s,
        count: inQueue,
        status: activeCount > 0 ? 'active' : (maintenanceCount > 0 ? 'maintenance' : 'inactive'),
        activeCounters: activeCount
      };
    }));

    res.json(enrichedServices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
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

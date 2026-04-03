import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  prefix: { type: String, required: true }, // e.g., 'ADM', 'SCH'
  description: { type: String },
  estimatedTimePerToken: { type: Number, default: 10 }, // in minutes
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Service = mongoose.model('Service', serviceSchema);
export default Service;

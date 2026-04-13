import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  prefix: { type: String, required: true }, // e.g., 'ADM', 'SCH'
  description: { type: String },
  estimatedTimePerToken: { type: Number, default: 10 }, // total time for the service
  estimatedTimePerStudent: { type: Number, default: 5 }, // time per student
  venue: { type: String, default: 'Main Hall' },
  maxTokens: { type: Number, default: 50 },
  assignedCounter: { type: mongoose.Schema.Types.ObjectId, ref: 'Counter' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Service = mongoose.model('Service', serviceSchema);
export default Service;

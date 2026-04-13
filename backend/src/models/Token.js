import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  number: { type: String, required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  counter: { type: mongoose.Schema.Types.ObjectId, ref: 'Counter' },
  status: { type: String, enum: ['waiting', 'serving', 'completed', 'cancelled'], default: 'waiting', index: true },
  queuePosition: { type: Number },
  estimatedWaitTime: { type: Number }, // in minutes
  bookedAt: { type: Date, default: Date.now, index: true },
  startTime: { type: Date },
  completedAt: { type: Date }
});

tokenSchema.index({ service: 1, bookedAt: -1 });
tokenSchema.index({ counter: 1, status: 1 });

const Token = mongoose.model('Token', tokenSchema);
export default Token;

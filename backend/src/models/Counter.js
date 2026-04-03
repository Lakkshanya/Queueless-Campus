import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true },
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['active', 'paused', 'inactive', 'maintenance'], default: 'inactive' },
  currentToken: { type: mongoose.Schema.Types.ObjectId, ref: 'Token' },
  workload: { type: Number, default: 0 },
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  lastUpdated: { type: Date, default: Date.now }
});

const Counter = mongoose.model('Counter', counterSchema);
export default Counter;

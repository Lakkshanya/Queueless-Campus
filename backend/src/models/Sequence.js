import mongoose from 'mongoose';

const sequenceSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true, unique: true },
  sequence_value: { type: Number, default: 0 }
});

const Sequence = mongoose.model('Sequence', sequenceSchema);
export default Sequence;

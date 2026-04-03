import mongoose from 'mongoose';

const requirementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, required: true }, // unique identifier e.g. "bonafide_cert"
  isRequired: { type: Boolean, default: true },
  allowedTypes: [{ type: String, default: 'image/*' }],
  
  // Targeted Assignment Logic
  scope: { type: String, enum: ['global', 'targeted'], default: 'global' },
  targetDepartment: { type: String }, // e.g. "CSE"
  targetSection: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
  targetYear: { type: String }, // e.g. "3rd Year"
  deadline: { type: Date },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Requirement = mongoose.model('Requirement', requirementSchema);
export default Requirement;

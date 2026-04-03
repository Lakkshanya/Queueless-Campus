import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  year: { type: String, required: true }, // e.g. '1st Year', '2nd Year'
  name: { type: String, required: true }, // e.g. 'Section A', 'Section B'
  facultyAdvisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

// Compound unique index for year and section name
sectionSchema.index({ year: 1, name: 1 }, { unique: true });

const Section = mongoose.model('Section', sectionSchema);
export default Section;

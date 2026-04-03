import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'staff', 'admin'], default: 'student' },
  collegeId: { type: String },
  phone: { type: String },
  department: { type: String },
  yearOfStudy: { type: String },
  profilePhoto: { type: String }, // URL or Base64
  designation: { type: String },
  workingHours: { type: String },
  adminRoleType: { type: String, enum: ['super', 'sub'] },
  permissions: [{ type: String }],
  isFA: { type: Boolean, default: false }, // Staff specific: Is Faculty Advisor
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' }, // Student specific: Assigned section
  documents: [{
    requirement: { type: mongoose.Schema.Types.ObjectId, ref: 'Requirement', required: true },
    url: { type: String, required: true },
    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    comments: { type: String },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  isVerified: { type: Boolean, default: false },
  profileCompleted: { type: Boolean, default: false },
  otp: {
    code: String,
    expiry: Date
  },
  academicRecords: {
    enrollmentStatus: { type: String, default: 'Pending' },
    academicProgress: { type: String, default: 'No data available' },
    batch: { type: String },
    cgpa: { type: Number, default: 0 }
  },
  assignedCounter: { type: mongoose.Schema.Types.ObjectId, ref: 'Counter' },
  fcmToken: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
export default User;

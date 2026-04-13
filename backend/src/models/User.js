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
  semester: { type: String },
  specialization: { type: String },
  profilePhoto: { type: String }, // URL or Base64
  designation: { type: String },
  workingHours: { type: String },
  adminRoleType: { type: String, enum: ['super', 'sub'] },
  permissions: [{ type: String }],
  isFA: { type: Boolean, default: false }, // Staff specific: Is Faculty Advisor
  cgpa: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  profileCompleted: { type: Boolean, default: false },
  otp: {
    code: String,
    expiry: Date
  },
  assignedCounter: { type: mongoose.Schema.Types.ObjectId, ref: 'Counter' },
  assignedServices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  fcmToken: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
export default User;

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { generateOTP, sendOTPEmail, sendSuccessEmail } from '../utils/otpService.js';
import { sendNotification } from '../utils/notificationService.js';
import { auth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import Section from '../models/Section.js';
import * as userDocController from '../controllers/userDocumentController.js';

import fs from 'fs';

const logError = (msg) => {
  const timestamp = new Date().toISOString();
  fs.appendFileSync('error.log', `[${timestamp}] ${msg}\n`);
};

const router = express.Router();

// Signup - Initial step
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log(`[DEBUG] Signup started for: ${email}`);
    
    const existingUser = await User.findOne({ email });
    console.log(`[DEBUG] Existing user check: ${existingUser ? 'Found' : 'Not found'}`);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    console.log(`[DEBUG] Password hashed`);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    console.log(`[DEBUG] OTP generated: ${otp}`);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      otp: { code: otp, expiry: otpExpiry },
      isVerified: false,
    });

    await user.save();
    console.log(`[DEBUG] User saved to MongoDB`);
    
    console.log(`[DEBUG] Sending OTP email...`);
    const emailSent = await sendOTPEmail(email, otp);
    console.log(`[DEBUG] Email sent status: ${emailSent}`);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

    res.status(201).json({ message: 'User registered. Please verify your email.', email });
  } catch (error) {
    console.error('SIGNUP CRITICAL ERROR:', error);
    logError(`SIGNUP ERROR: ${error.message}\n${error.stack}`);
    res.status(500).json({ 
      message: 'Signup failed', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

    if (user.otp.code !== otp || user.otp.expiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '7d' }
    );

    await sendSuccessEmail(email, 'Your account has been successfully verified!');

    res.status(200).json({ 
      message: 'Email verified successfully',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        profileCompleted: user.profileCompleted 
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, captcha } = req.body;

    // Basic Captcha check (placeholder for now as frontend will generate it)
    if (!captcha) {
      return res.status(400).json({ message: 'Captcha is required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email first' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        profileCompleted: user.profileCompleted,
        assignedCounter: user.assignedCounter 
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Get Current User Profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -otp')
      .populate({
        path: 'section',
        populate: { path: 'facultyAdvisor', select: 'name' }
      });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
});

// Complete Profile
router.post('/complete-profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Remove sensitive fields if any
    delete updates.password;
    delete updates.role;
    delete updates.isVerified;
    delete updates.email; // Email should not be changed here

    updates.profileCompleted = true;

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password -otp');
    
    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Profile update failed', error: error.message });
  }
});

// Forgot Password - Request OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = { code: otp, expiry: otpExpiry };
    await user.save();

    await sendOTPEmail(email, otp);
    res.status(200).json({ message: 'Password reset OTP sent to email', email });
  } catch (error) {
    res.status(500).json({ message: 'Request failed', error: error.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.otp.code !== otp || user.otp.expiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.otp = undefined;
    await user.save();

    await sendSuccessEmail(email, 'Your password has been successfully reset.');

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Reset failed', error: error.message });
  }
});

// Update Student Academic Records (Admin & Staff)
router.put('/student/:id/records', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Access denied. Authorized personnel only.' });
    }
    
    const { academicRecords } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { academicRecords },
      { new: true }
    ).select('-password');
    
    res.status(200).json({ message: 'Student records updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update records', error: error.message });
  }
});

// Get all staff members
router.get('/staff', auth, async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' }, 'name email _id isVerified');
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch staff', error: error.message });
  }
});


// Update FCM Token
router.post('/fcm-token', auth, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    await User.findByIdAndUpdate(req.user.id, { fcmToken });
    res.status(200).json({ message: 'FCM token updated' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update FCM token', error: error.message });
  }
});

// Get all students (Admin only)
router.get('/students', auth, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password -otp');
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students', error: error.message });
  }
});

// Upload Document (Student only)
router.post('/upload-document', auth, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { name } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Store local path (serving it via static middleware later)
    const fileUrl = `/uploads/${req.file.filename}`;
    
    user.documents.push({ name, url: fileUrl, status: 'pending' });
    await user.save();

    res.status(200).json({ 
      message: 'Document added to vault', 
      documents: user.documents,
      fileUrl
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// --- New Document Control Routes ---

// Student: Get my targeted and global requirements
router.get('/documents/requirements', auth, userDocController.getMyRequirements);

// Student: Upload a document for a specific requirement
router.post('/documents/upload', auth, userDocController.uploadDocument);

// Staff: Get pending documents for sections/departments
router.get('/documents/pending', auth, userDocController.getPendingDocuments);

// Staff: Verify or Reject a student document
router.post('/documents/verify', auth, userDocController.verifyDocument);

export default router;

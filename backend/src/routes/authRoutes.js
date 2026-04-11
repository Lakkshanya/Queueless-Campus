import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Service from '../models/Service.js';
import { generateOTP, sendOTPEmail, sendSuccessEmail } from '../utils/otpService.js';
import { auth } from '../middleware/auth.js';

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
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); 

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      otp: { code: otp, expiry: otpExpiry },
      isVerified: false,
    });

    await user.save();
    
    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

    res.status(201).json({ message: 'User registered. Please verify your email.', email });
  } catch (error) {
    console.error('SIGNUP CRITICAL ERROR:', error);
    logError(`SIGNUP ERROR: ${error.message}\n${error.stack}`);
    res.status(500).json({ message: 'Signup failed', error: error.message });
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

// GET /profile alias for /me
router.get(['/me', '/profile'], auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
});

// PUT /profile/update alias for complete-profile
router.put('/profile/update', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;
    delete updates.password;
    delete updates.role;
    delete updates.isVerified;
    delete updates.email;
    updates.profileCompleted = true;
    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password -otp');
    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Profile update failed', error: error.message });
  }
});

// Legacy POST alias for backward compatibility
router.post('/complete-profile', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;
        delete updates.password;
        updates.profileCompleted = true;
        const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password -otp');
        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Profile update failed', error: error.message });
    }
});

// Forgot Password
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

// GET /staff (Admin/Core requirement)
router.get('/staff', auth, async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' }, 'name email _id isVerified department position assignedServices assignedCounter')
      .populate('assignedServices', 'name prefix description')
      .populate('assignedCounter', 'number status');
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch staff', error: error.message });
  }
});

// POST /assign-services (Admin assigns services to staff)
router.post('/assign-services', auth, async (req, res) => {
  try {
    const { staffId, serviceIds } = req.body;
    const staffMember = await User.findById(staffId);
    if (!staffMember || staffMember.role !== 'staff') {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    staffMember.assignedServices = serviceIds;
    await staffMember.save();
    const updated = await User.findById(staffId)
      .populate('assignedServices', 'name prefix description')
      .populate('assignedCounter', 'number status');
    res.status(200).json({ message: 'Services assigned successfully', staff: updated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to assign services', error: error.message });
  }
});

router.post('/fcm-token', auth, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    await User.findByIdAndUpdate(req.user.id, { fcmToken });
    res.status(200).json({ message: 'FCM token updated' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update FCM token', error: error.message });
  }
});

// POST /create-staff (Admin registers a new staff)
router.post('/create-staff', auth, async (req, res) => {
  try {
    const { name, email, department, role } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash('staff123', 12);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      department,
      role: role || 'staff',
      isVerified: false,
    });

    await user.save();
    
    res.status(201).json({ message: 'Staff created successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Staff creation failed', error: error.message });
  }
});

// POST /verify-staff (Admin verify/unverify staff)
router.post('/verify-staff', auth, async (req, res) => {
  try {
    const { staffId, isVerified } = req.body;
    const staffMember = await User.findById(staffId);
    if (!staffMember) {
       return res.status(404).json({ message: 'Staff not found' });
    }
    
    staffMember.isVerified = isVerified;
    await staffMember.save();

    res.status(200).json({ message: 'Staff verification updated', isVerified });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
});

// DELETE /staff/:id (Admin deletes staff)
router.delete('/staff/:id', auth, async (req, res) => {
  try {
    const staffId = req.params.id;
    await User.findByIdAndDelete(staffId);
    res.status(200).json({ message: 'Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Deletion failed', error: error.message });
  }
});

// POST /assign-counter (Admin assigns a terminal/counter to staff)
router.post('/assign-counter', auth, async (req, res) => {
  try {
    const { staffId, counterId } = req.body;
    const staffMember = await User.findById(staffId);
    if (!staffMember || staffMember.role !== 'staff') {
       return res.status(404).json({ message: 'Staff not found' });
    }
    
    staffMember.assignedCounter = counterId;
    await staffMember.save();

    res.status(200).json({ message: 'Counter assignment updated' });
  } catch (error) {
    res.status(500).json({ message: 'Counter assignment failed', error: error.message });
  }
});

export default router;

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Service from '../models/Service.js';
import Counter from '../models/Counter.js';
import { generateOTP, sendOTPEmail, sendSuccessEmail } from '../utils/otpService.js';
import { auth } from '../middleware/auth.js';
import { sendNotification } from '../utils/notificationService.js';

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
      if (existingUser.isVerified) {
        return res.status(400).json({ message: 'Email already registered' });
      } else {
        // User exists but not verified - update info and resend OTP
        const hashedPassword = await bcrypt.hash(password, 12);
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        existingUser.name = name;
        existingUser.password = hashedPassword;
        existingUser.role = role || 'student';
        existingUser.otp = { code: otp, expiry: otpExpiry };
        
        await existingUser.save();
        await sendOTPEmail(email, otp);
        return res.status(200).json({ message: 'User already registered but unverified. New OTP sent.', email });
      }
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

    const populatedUser = await User.findById(user._id)
      .populate('assignedServices', 'name prefix description timePerStudent')
      .populate('assignedCounter', 'number status');

    res.status(200).json({
      token,
      user: populatedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// GET /profile alias for /me
router.get(['/me', '/profile'], auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -otp')
      .populate('assignedServices', 'name prefix description timePerStudent')
      .populate('assignedCounter', 'number status');
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

// GET /users (Admin Only - used for promoting to staff)
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({}, 'name email role department isVerified').sort({ name: 1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
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

    // Ensure all assigned services are linked to the staff member's current counter
    if (staffMember.assignedCounter) {
      await Service.updateMany(
        { _id: { $in: serviceIds } },
        { assignedCounter: staffMember.assignedCounter }
      );
      
      // Also update the counter's service list for consistency
      await Counter.findByIdAndUpdate(staffMember.assignedCounter, {
        $addToSet: { services: { $each: serviceIds } }
      });
    } else if (serviceIds && serviceIds.length > 0) {
      // Auto-assign staff to the counter of the first service if they don't have one
      const firstService = await Service.findById(serviceIds[0]);
      if (firstService && firstService.assignedCounter) {
         staffMember.assignedCounter = firstService.assignedCounter;
         await staffMember.save();
         await Counter.findByIdAndUpdate(firstService.assignedCounter, { staff: staffId });
      }
    }

    // Trigger automated notification (Specific Requirement)
    const service = await Service.findById(serviceIds[0]);
    const serviceName = service ? service.name : 'a new service';
    
    await sendNotification(
      staffId,
      'Operational Assignment',
      `${staffMember.name}, you have been assigned to ${serviceName}`
    );

    const updated = await User.findById(staffId)
      .populate('assignedServices', 'name prefix description timePerStudent')
      .populate('assignedCounter', 'number status');

    // [REAL-TIME] Emit socket events for instant update
    const io = req.app.get('io');
    if (io) {
      io.to(staffId).emit('profileUpdated', updated);
      io.emit('staffAssignmentChanged', { staffId, role: 'staff' });
    }

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
      if (existingUser.role === 'staff') {
        return res.status(400).json({ message: 'User is already a staff member' });
      }
      existingUser.role = 'staff';
      existingUser.isVerified = true; // Auto-verify administrative promotions
      if (department) existingUser.department = department;
      await existingUser.save();
      return res.status(200).json({ message: 'User promoted to staff successfully', user: existingUser });
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
    
    const oldCounterId = staffMember.assignedCounter;
    if (oldCounterId && oldCounterId.toString() !== counterId) {
       await Counter.findByIdAndUpdate(oldCounterId, { staff: null });
    }

    staffMember.assignedCounter = counterId;
    await staffMember.save();

    if (counterId) {
      await Counter.findByIdAndUpdate(counterId, { staff: staffId });
      
      // Synchronize all assigned services to point to this new counter
      if (staffMember.assignedServices && staffMember.assignedServices.length > 0) {
        await Service.updateMany(
          { _id: { $in: staffMember.assignedServices } },
          { assignedCounter: counterId }
        );
        
        // Ensure the new counter knows about these services
        await Counter.findByIdAndUpdate(counterId, {
          $addToSet: { services: { $each: staffMember.assignedServices } }
        });
      }

      await sendNotification(
        staffId,
        'Counter Unit Assigned',
        'You have been allocated to a new Counter Unit. Please report to your terminal.'
      );
    }

    const updatedUser = await User.findById(staffId)
      .populate('assignedServices', 'name prefix description timePerStudent')
      .populate('assignedCounter', 'number status');

    // [REAL-TIME] Emit socket events for instant update
    const io = req.app.get('io');
    if (io) {
      io.to(staffId).emit('profileUpdated', updatedUser);
      io.emit('staffAssignmentChanged', { staffId, counterId: updatedUser.assignedCounter });
    }

    res.status(200).json({ message: 'Counter assignment updated', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Counter assignment failed', error: error.message });
  }
});

export default router;

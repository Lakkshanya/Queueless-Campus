import User from '../models/User.js';
import Section from '../models/Section.js';
import Notification from '../models/Notification.js';
import { sendNotification } from '../utils/notificationService.js';

export const searchStudents = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

    const students = await User.find({
      role: 'student',
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { collegeId: { $regex: query, $options: 'i' } }
      ]
    }).select('-password -otp').limit(20);

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStudentAcademic = async (req, res) => {
  try {
    const { studentId, enrollmentStatus, academicProgress, cgpa } = req.body;
    
    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (enrollmentStatus) student.academicRecords.enrollmentStatus = enrollmentStatus;
    if (academicProgress) student.academicRecords.academicProgress = academicProgress;
    if (cgpa !== undefined) student.academicRecords.cgpa = cgpa;

    await student.save();

    // Notify Student
    const msg = `Your academic record has been updated by ${req.user.name}.`;
    await Notification.create({
      user: studentId,
      title: "Academic Update",
      message: msg,
      type: 'academic'
    });

    await sendNotification(studentId, "Academic Update", msg, { type: 'academic' });

    res.json({ message: 'Academic record updated successfully', student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyDocument = async (req, res) => {
  try {
    const { studentId, documentId, status, comments } = req.body;
    
    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Permission check: Staff must be FA of this student's section OR Admin
    if (req.user.role !== 'admin') {
      const section = await Section.findById(student.section);
      if (!section || section.facultyAdvisor?.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized: You are not the Faculty Advisor for this section' });
      }
    }

    const docIndex = student.documents.findIndex(d => d._id.toString() === documentId);
    if (docIndex === -1) return res.status(404).json({ message: 'Document not found' });

    student.documents[docIndex].status = status;
    if (comments) student.documents[docIndex].comments = comments;
    
    await student.save();

    const msg = `Your ${student.documents[docIndex].name} has been ${status === 'verified' ? 'Approved' : 'Rejected'}.`;
    await Notification.create({
      user: studentId,
      title: "Document Verification",
      message: msg,
      type: 'document'
    });

    await sendNotification(studentId, "Document Verification", msg, { type: 'document' });

    res.json({ message: 'Document status updated', student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

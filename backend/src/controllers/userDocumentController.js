import User from '../models/User.js';
import Requirement from '../models/Requirement.js';
import Notification from '../models/Notification.js';
import { sendPushNotification } from '../services/notificationService.js';

// --- Student Controllers ---

/**
 * Fetch all requirements that a student needs to fulfill.
 * Includes 'global' requirements and 'targeted' ones matching their profile.
 */
export const getMyRequirements = async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await User.findById(studentId).populate('section');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // 1. Fetch requirements
    const requirements = await Requirement.find({
      $or: [
        { scope: 'global' },
        { 
          scope: 'targeted',
          $or: [
            { targetDepartment: student.department },
            { targetYear: student.yearOfStudy },
            { targetSection: student.section?._id }
          ]
        }
      ]
    }).sort({ createdAt: -1 });

    // 2. Combine with student's current document status
    const requirementsWithStatus = requirements.map(reqObj => {
      const existingDoc = student.documents.find(d => 
        d.requirement?.toString() === reqObj._id.toString()
      );
      
      return {
        ...reqObj.toObject(),
        submissionStatus: existingDoc ? existingDoc.status : 'not_started',
        submissionUrl: existingDoc ? existingDoc.url : null,
        submissionComments: existingDoc ? existingDoc.comments : null,
        uploadedAt: existingDoc ? existingDoc.uploadedAt : null
      };
    });

    res.status(200).json(requirementsWithStatus);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch requirements', error: error.message });
  }
};

/**
 * Student uploads a document for a specific requirement.
 */
export const uploadDocument = async (req, res) => {
  try {
    const { requirementId, url } = req.body;
    const studentId = req.user.id;

    if (!requirementId || !url) {
      return res.status(400).json({ message: 'Requirement ID and URL are required' });
    }

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Check if document already exists for this requirement
    const existingDocIndex = student.documents.findIndex(d => 
      d.requirement?.toString() === requirementId
    );

    if (existingDocIndex > -1) {
      student.documents[existingDocIndex].url = url;
      student.documents[existingDocIndex].status = 'pending';
      student.documents[existingDocIndex].uploadedAt = Date.now();
    } else {
      student.documents.push({
        requirement: requirementId,
        url,
        status: 'pending'
      });
    }

    await student.save();

    // Notify staff (Optional: Notify FAs if they exist for this section)
    // For now, we can create a notification for the system
    res.status(200).json({ message: 'Document uploaded successfully', documents: student.documents });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

// --- Staff Controllers ---

/**
 * Staff fetches all pending documents for verification.
 */
export const getPendingDocuments = async (req, res) => {
  try {
    const staffId = req.user.id;
    const staff = await User.findById(staffId).populate('section');

    // Fetch all students who have 'pending' documents
    // Optionally filter by staff's department or assigned section
    const query = { 'documents.status': 'pending' };
    
    // If staff is an FA, maybe they only care about their section
    if (staff.isFA && staff.section) {
      query.section = staff.section._id;
    }

    const students = await User.find(query)
      .select('name collegeId department yearOfStudy section documents')
      .populate('section')
      .populate('documents.requirement');

    // Flatten logic: find students with pending docs
    const pendingRequests = [];
    students.forEach(student => {
      student.documents.forEach(doc => {
        if (doc.status === 'pending') {
          pendingRequests.push({
            studentId: student._id,
            studentName: student.name,
            collegeId: student.collegeId,
            dept: student.department,
            year: student.yearOfStudy,
            section: student.section?.name,
            document: doc
          });
        }
      });
    });

    res.status(200).json(pendingRequests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pending documents', error: error.message });
  }
};

/**
 * Staff verifies or rejects a document.
 */
export const verifyDocument = async (req, res) => {
  try {
    const { studentId, documentId, status, comments } = req.body;
    const staffId = req.user.id;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const student = await User.findById(studentId).populate('documents.requirement');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const doc = student.documents.id(documentId);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    doc.status = status;
    doc.comments = comments;
    doc.verifiedBy = staffId;
    doc.uploadedAt = Date.now();

    // -- AUTO-VERIFICATION LOGIC --
    // If we just verified a document, check if ALL mandatory documents for this student are now verified
    if (status === 'verified') {
      // 1. Fetch all requirements applicable to this student
      const allRequirements = await Requirement.find({
        $or: [
          { scope: 'global' },
          { 
            $and: [
              { scope: 'targeted' },
              { 
                $or: [
                  { targetDepartment: student.department },
                  { targetYear: student.yearOfStudy },
                  { targetSection: student.section }
                ]
              }
            ]
          }
        ]
      });

      const mandatoryReqIds = allRequirements.filter(r => r.isRequired).map(r => r._id.toString());
      
      const verifiedMandatoryDocIds = student.documents
        .filter(d => d.status === 'verified' && mandatoryReqIds.includes(d.requirement?._id?.toString() || d.requirement?.toString()))
        .map(d => (d.requirement?._id || d.requirement).toString());

      // Check if every mandatory requirement has a verified document
      const isFullyVerified = mandatoryReqIds.every(id => verifiedMandatoryDocIds.includes(id));
      
      if (isFullyVerified && mandatoryReqIds.length > 0) {
        student.isVerified = true;
        console.log(`[VERIFICATION] Student ${student.name} fully verified.`);
      }
    } else if (status === 'rejected') {
      // If a document is rejected, they might lose their verified status if it was mandatory
      // For now, we could conservatively keep it or reset it. Let's keep it simple.
    }

    await student.save();

    // -- REAL-TIME UPDATES --
    const io = req.app.get('io');
    if (io) {
      io.to(studentId).emit('DOCUMENT_STATUS_UPDATED', {
        requirementId: doc.requirement?._id || doc.requirement,
        status,
        comments
      });
      console.log(`[SOCKET] Emitted status update to user: ${studentId}`);
    }

    // Create Notification and Send Push
    const reqTitle = doc.requirement?.title || 'Document Protocol';
    const notification = new Notification({
      recipient: studentId,
      title: `Document ${status === 'verified' ? 'Verified' : 'Rejected'}`,
      message: status === 'verified' 
        ? `Your document submission for "${reqTitle}" has been verified.` 
        : `Your document was rejected. Reason: ${comments}`,
      type: 'document_status'
    });
    await notification.save();

    // -- PUSH NOTIFICATION (FCM) --
    if (student.fcmToken) {
      await sendPushNotification(
        student.fcmToken,
        notification.title,
        notification.message,
        { type: 'document_status', requirementId: (doc.requirement?._id || doc.requirement).toString() }
      );
      console.log(`[FCM] Push dispatched to user: ${studentId}`);
    }

    res.status(200).json({ 
      message: `Document ${status} successfully`,
      studentVerified: student.isVerified 
    });
  } catch (error) {
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
};

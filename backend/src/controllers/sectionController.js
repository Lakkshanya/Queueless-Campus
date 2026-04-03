import Section from '../models/Section.js';
import User from '../models/User.js';

// Admin: Create a new section
export const createSection = async (req, res) => {
  try {
    const { year, name } = req.body;
    const existing = await Section.findOne({ year, name });
    if (existing) return res.status(400).json({ message: 'Section already exists for this year' });

    const section = new Section({ year, name });
    await section.save();
    res.status(201).json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Assign Faculty Advisor to a section
export const assignFA = async (req, res) => {
  try {
    const { sectionId, staffId } = req.body;
    
    // 1. Verify staff exists and is 'staff'
    const staff = await User.findOne({ _id: staffId, role: 'staff' });
    if (!staff) return res.status(404).json({ message: 'Staff user not found' });

    // 2. Update section
    const section = await Section.findByIdAndUpdate(
      sectionId, 
      { facultyAdvisor: staffId }, 
      { new: true }
    );
    if (!section) return res.status(404).json({ message: 'Section not found' });

    // 3. Update staff user record
    await User.findByIdAndUpdate(staffId, { isFA: true, section: sectionId });

    res.json({ message: 'Faculty Advisor assigned successfully', section });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Allocate students to a section
export const allocateStudents = async (req, res) => {
  try {
    const { sectionId, studentIds } = req.body; // Array of IDs

    // 1. Bulk update students
    await User.updateMany(
      { _id: { $in: studentIds }, role: 'student' },
      { section: sectionId }
    );

    // 2. Update section's student list
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { $addToSet: { students: { $each: studentIds } } },
      { new: true }
    );

    res.json({ message: 'Students allocated successfully', section });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Staff (FA): Get details of my assigned section
export const getMySection = async (req, res) => {
  try {
    const section = await Section.findOne({ facultyAdvisor: req.user.id })
      .populate('students', 'name email collegeId academicRecords documents');
    
    if (!section) return res.status(404).json({ message: 'No section assigned to you' });
    
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin/Staff: Get all sections
export const getAllSections = async (req, res) => {
    try {
        const sections = await Section.find().populate('facultyAdvisor', 'name email');
        res.json(sections);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

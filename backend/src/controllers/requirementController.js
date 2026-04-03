import Requirement from '../models/Requirement.js';

export const createRequirement = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      type, 
      isRequired, 
      allowedTypes,
      scope,
      targetDepartment,
      targetSection,
      targetYear,
      deadline 
    } = req.body;

    const requirement = new Requirement({ 
      title, 
      description, 
      type, 
      isRequired, 
      allowedTypes,
      scope,
      targetDepartment,
      targetSection,
      targetYear,
      deadline
    });

    await requirement.save();
    res.status(201).json(requirement);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create requirement', error: error.message });
  }
};

export const getRequirements = async (req, res) => {
  try {
    const requirements = await Requirement.find().sort({ createdAt: -1 });
    res.status(200).json(requirements);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch requirements', error: error.message });
  }
};

export const updateRequirement = async (req, res) => {
  try {
    const { id } = req.params;
    const requirement = await Requirement.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(requirement);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update requirement', error: error.message });
  }
};

export const deleteRequirement = async (req, res) => {
  try {
    const { id } = req.params;
    await Requirement.findByIdAndDelete(id);
    res.status(200).json({ message: 'Requirement deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete requirement', error: error.message });
  }
};

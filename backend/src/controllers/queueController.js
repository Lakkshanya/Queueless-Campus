import Token from '../models/Token.js';

export const getFullQueue = async (req, res) => {
  try {
    const tokens = await Token.find({ status: { $in: ['waiting', 'serving'] } })
      .populate('service', 'name prefix')
      .populate('student', 'name')
      .populate('counter', 'number')
      .sort({ bookedAt: 1 });
    
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

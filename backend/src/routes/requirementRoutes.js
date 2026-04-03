import express from 'express';
import { createRequirement, getRequirements, updateRequirement, deleteRequirement } from '../controllers/requirementController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, createRequirement);
router.get('/', getRequirements);
router.put('/:id', auth, updateRequirement);
router.delete('/:id', auth, deleteRequirement);

export default router;

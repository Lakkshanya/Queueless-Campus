import express from 'express';
import { getFullQueue } from '../controllers/queueController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// GET /queue functionality
router.get('/', auth, getFullQueue);

export default router;

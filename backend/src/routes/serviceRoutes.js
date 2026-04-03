import express from 'express';
import { getServices, createService, updateService, deleteService } from '../controllers/serviceController.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getServices);
router.post('/', auth, adminAuth, createService);
router.put('/:id', auth, adminAuth, updateService);
router.delete('/:id', auth, adminAuth, deleteService);

export default router;

import express from 'express';
import { createService, getServices, updateService, deleteService } from '../controllers/serviceController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', auth, authorize('admin'), createService);
router.get('/', auth, getServices);
router.put('/:id', auth, authorize('admin'), updateService);
router.delete('/:id', auth, authorize('admin'), deleteService);

export default router;

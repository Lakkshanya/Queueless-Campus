import express from 'express';
import { searchStudents, updateStudentAcademic, verifyDocument } from '../controllers/staffController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Only staff and admin can access these routes
router.use(auth);
router.use(authorize('staff', 'admin'));

router.get('/students', searchStudents);
router.put('/students/academic', updateStudentAcademic);
router.post('/students/verify-document', verifyDocument);

export default router;

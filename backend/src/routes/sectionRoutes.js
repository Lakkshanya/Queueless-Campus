import express from 'express';
import { createSection, assignFA, allocateStudents, getMySection, getAllSections } from '../controllers/sectionController.js';
import { verifyToken, isAdmin, isStaff } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, getAllSections);
router.post('/create', verifyToken, isAdmin, createSection);
router.post('/assign-fa', verifyToken, isAdmin, assignFA);
router.post('/allocate-students', verifyToken, isAdmin, allocateStudents);
router.get('/my-section', verifyToken, isStaff, getMySection);

export default router;

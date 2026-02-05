import express from 'express';
import { getCompany, updateCompany } from '../controllers/companyController.js';
import { authenticate, authorize } from '../utils/auth.js';

const router = express.Router();

router.get('/', authenticate, getCompany);
router.put('/', authenticate, authorize('admin'), updateCompany);

export default router;

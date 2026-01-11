import express from 'express';
import { getCompany, updateCompany } from '../controllers/companyController.js';
import { authenticate, authorize } from '../utils/auth.js';

const router = express.Router();

// GET company - requires authentication
router.get('/', authenticate, getCompany);

// UPDATE company - requires authentication and admin role
router.put('/', authenticate, authorize('admin'), updateCompany);

export default router;

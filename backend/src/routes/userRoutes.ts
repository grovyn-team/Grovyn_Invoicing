import express from 'express';
import { updateProfile, changePassword, uploadAvatar, resetPassword, upload } from '../controllers/userController.js';
import { authenticate } from '../utils/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.put('/profile', updateProfile);
router.put('/password', changePassword);
router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.post('/reset-password', resetPassword);

export default router;

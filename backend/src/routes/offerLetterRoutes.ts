import express from 'express';
import {
  createOfferLetter,
  getOfferLetters,
  getOfferLetterById,
  updateOfferLetter,
  deleteOfferLetter,
  sendOfferLetter,
} from '../controllers/offerLetterController.js';
import { authenticate } from '../utils/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/', createOfferLetter);
router.get('/', getOfferLetters);
router.get('/:id', getOfferLetterById);
router.put('/:id', updateOfferLetter);
router.delete('/:id', deleteOfferLetter);
router.post('/:id/send', sendOfferLetter);

export default router;

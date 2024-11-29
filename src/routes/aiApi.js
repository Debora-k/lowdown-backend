import express from 'express';
import { commentAI } from '../services/commentService.js';
import { authenticate } from '../controllers/authController.js';
const router = express.Router();

router.post('/', authenticate, commentAI);
export default router;

import { Router } from 'express';
import { generateComponentCode } from '../controllers/codeController.js';

const router = Router();

// POST /api/code/generate
router.post('/generate', generateComponentCode);

export default router;

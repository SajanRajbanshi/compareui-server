import express from 'express';
import { generateComponentConfig } from '../controllers/configController.js';

const router = express.Router();

/**
 * POST /api/config/generate
 * Generate custom component configuration using AI
 * 
 * Request body:
 * {
 *   componentName: string,  // e.g., "button", "iconButton"
 *   prompt: string,         // e.g., "make it blue with rounded corners"
 *   currentConfig: object   // Current configuration to modify
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   config?: object,        // Generated configuration
 *   attempts?: number,      // Number of attempts made
 *   error?: string,         // Error message if failed
 *   lastError?: string      // Last validation error if failed
 * }
 */
router.post('/generate', generateComponentConfig);

export default router;

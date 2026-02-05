import { Request, Response } from 'express';
import { generateConfig } from '../services/aiService.js';
import Prompt from '../models/prompt.model.js';
/**
 * POST /api/config/generate
 * Generate custom component configuration using AI
 */
export async function generateComponentConfig(req: Request, res: Response) {
  try {
    const { componentName, prompt, currentConfig } = req.body;
    
    // Validate request body
    if (!componentName || typeof componentName !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'componentName is required and must be a string'
      });
    }
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'prompt is required and must be a string'
      });
    }
    
    if (!currentConfig || typeof currentConfig !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'currentConfig is required and must be an object'
      });
    }
    
    // Generate configuration using AI service
    const result = await generateConfig({
      componentName,
      prompt,
      currentConfig
    });
    
    // Return result
    if (result.success) {
      const newPrompt = new Prompt({
        prompt,
        responseConfig: JSON.stringify(result.config),
        currentConfig: JSON.stringify(currentConfig)
      });
      newPrompt.save();
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
    
  } catch (error) {
    console.error('Error in generateComponentConfig:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

import { Request, Response } from 'express';
import { generateConfig } from '../services/aiService.js';
import { validateCode } from '../utils/codeValidator.js';

/**
 * Generate full React component code (Playground)
 * POST /api/code/generate
 */
export async function generateComponentCode(req: Request, res: Response) {
  try {
    const { prompt, prevCode } = req.body;
    
    // Validate request body
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Prompt is required and must be a string' 
      });
    }

    let lastError = '';
    let currentCode = prevCode;
    const MAX_CODE_RETRIES = 5;

    for (let i = 0; i < MAX_CODE_RETRIES; i++) {
        // Call AI service with componentName='playground'
        console.log('Generating code for component: playground attempt', i + 1);
        const result = await generateConfig({
          prompt: i === 0 ? prompt : `The previous code generated had compilation errors. Please fix them. Error: ${lastError}`,
          prevCode: currentCode,
          componentName: 'playground'
        } as any);
        
        if (!result.success) {
          return res.status(500).json(result);
        }
        
        const generatedConfig = result.config; // Reverted: use raw config
        let allValid = true;
        let validationError = '';

        if (typeof generatedConfig === 'object') {
            for (const provider in generatedConfig) {
                const validation = validateCode(generatedConfig[provider], provider);
                if (!validation.success) {
                    allValid = false;
                    validationError = `Provider ${provider}: ${validation.error}`;
                    break;
                }
            }
        } else if (typeof generatedConfig === 'string') {
            const validation = validateCode(generatedConfig);
            if (!validation.success) {
                allValid = false;
                validationError = validation.error || 'Unknown compilation error';
            }
        }

        if (allValid) {
            return res.status(200).json({
                success: true,
                config: generatedConfig,
                attempts: i + 1
            });
        }

        lastError = validationError;
        currentCode = generatedConfig;
    }
    
    return res.status(422).json({
      success: false,
      error: 'Failed to generate valid code after 5 attempts',
      lastError
    });
    
  } catch (error) {
    console.error('Code generation controller error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during code generation'
    });
  }
}

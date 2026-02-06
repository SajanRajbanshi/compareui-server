import { z } from 'zod';

// Zod schema for progress configuration
const ProgressConfigSchema = z.object({
  value: z.number().min(0).optional()
    .describe('Current progress value'),
  max: z.number().min(1).optional()
    .describe('Maximum progress value'),
  size: z.enum(['small', 'medium', 'large']).optional()
    .describe('Physical size of the progress bar'),
  label: z.string().optional()
    .describe('Optional label text to show above progress bar'),
  styles: z.object({
    indicatorColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
      .describe('Color of the active progress indicator in hex format (#RRGGBB)'),
    trackColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
      .describe('Color of the background track in hex format (#RRGGBB)'),
    height: z.number().min(1).max(100).optional()
      .describe('Height of the progress bar in pixels (1-100)'),
    borderRadius: z.number().min(0).max(100).optional()
      .describe('Border radius in pixels (0-100)'),
  }).optional()
});

export type ProgressConfig = z.infer<typeof ProgressConfigSchema>;

export interface ValidationResult {
  success: boolean;
  data?: ProgressConfig;
  error?: string;
  details?: string[];
}

/**
 * Validates progress configuration against the schema
 * Returns detailed error messages for AI feedback
 */
export function validateProgressConfig(config: unknown): ValidationResult {
  try {
    const result = ProgressConfigSchema.safeParse(config);
    
    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    }
    
    // Format Zod errors into detailed feedback
    const errorDetails = result.error.issues.map((err) => {
      const path = err.path.join('.');
      return `${path}: ${err.message}`;
    });
    
    return {
      success: false,
      error: 'Configuration validation failed',
      details: errorDetails
    };
  } catch (error) {
    return {
      success: false,
      error: 'Invalid JSON structure',
      details: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

/**
 * Get a human-readable description of the progress config schema
 * Used in system prompts for AI
 */
export function getProgressConfigSchemaDescription(): string {
  return `
Progress Configuration Schema:
{
  value: number (optional, current progress),
  max: number (optional, max value, default 100),
  size: "small" | "medium" | "large" (optional),
  label: string (optional, text to show with progress),
  styles?: {
    indicatorColor?: string (hex format: #RRGGBB),
    trackColor?: string (hex format: #RRGGBB),
    height?: number (1-100, in pixels),
    borderRadius?: number (0-100, in pixels)
  }
}

IMPORTANT RULES:
- All color values MUST be in hex format (#RRGGBB)
- Use undefined or omit properties that should remain unchanged
- value should be between 0 and max
- indicatorColor is the active part, trackColor is the background
`;
}

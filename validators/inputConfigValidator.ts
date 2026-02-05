import { z } from 'zod';

// Zod schema for input configuration
const InputConfigSchema = z.object({
  label: z.string(),
  placeholder: z.string(),
  variant: z.enum(['outlined', 'standard']),
  size: z.enum(['small', 'medium', 'large']),
  styles: z.object({
    borderRadius: z.number().min(0).max(100).optional()
      .describe('Border radius in pixels (0-100)'),
    borderColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
      .describe('Border color in hex format (#RRGGBB)'),
    focusColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
      .describe('Focus border color in hex format (#RRGGBB)'),
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
      .describe('Background color in hex format (#RRGGBB)'),
    fontColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
      .describe('Font color (text color) in hex format (#RRGGBB)'),
    padding: z.object({
      px: z.number().positive().describe('Horizontal padding in pixels'),
      py: z.number().positive().describe('Vertical padding in pixels')
    }).optional()
  }).optional()
});

export type InputConfig = z.infer<typeof InputConfigSchema>;

export interface ValidationResult {
  success: boolean;
  data?: InputConfig;
  error?: string;
  details?: string[];
}

/**
 * Validates input configuration against the schema
 * Returns detailed error messages for AI feedback
 */
export function validateInputConfig(config: unknown): ValidationResult {
  try {
    const result = InputConfigSchema.safeParse(config);
    
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
 * Get a human-readable description of the input config schema
 * Used in system prompts for AI
 */
export function getInputConfigSchemaDescription(): string {
  return `
Input Configuration Schema:
{
  label: string (input label),
  placeholder: string (input placeholder),
  variant: "outlined" | "standard",
  size: "small" | "medium" | "large",
  styles?: {
    borderRadius?: number (0-100, in pixels),
    borderColor?: string (hex format: #RRGGBB),
    focusColor?: string (hex format: #RRGGBB),
    backgroundColor?: string (hex format: #RRGGBB),
    fontColor?: string (hex format: #RRGGBB, applied to text),
    padding?: {
      px: number (horizontal padding),
      py: number (vertical padding)
    }
  }
}

IMPORTANT RULES:
- All color values MUST be in hex format (#RRGGBB)
- Use undefined or omit properties that should remain unchanged
- borderRadius must be between 0 and 100
- variants must be either "outlined" or "standard"
`;
}

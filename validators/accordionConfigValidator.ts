import { z } from 'zod';

// Zod schema for accordion configuration
const AccordionConfigSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  size: z.enum(['small', 'medium', 'large']).optional(),
  styles: z.object({
    borderRadius: z.number().min(0).max(100).optional()
      .describe('Border radius in pixels (0-100)'),
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
      .describe('Background color in hex format (#RRGGBB)'),
    borderColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
      .describe('Border color in hex format (#RRGGBB)'),
    titleColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
      .describe('Title text color in hex format (#RRGGBB)'),
    answerColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
      .describe('Answer/Content text color in hex format (#RRGGBB)'),
  }).optional()
});

export type AccordionConfig = z.infer<typeof AccordionConfigSchema>;

export interface ValidationResult {
  success: boolean;
  data?: AccordionConfig;
  error?: string;
  details?: string[];
}

/**
 * Validates accordion configuration against the schema
 * Returns detailed error messages for AI feedback
 */
export function validateAccordionConfig(config: unknown): ValidationResult {
  try {
    const result = AccordionConfigSchema.safeParse(config);
    
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
 * Get a human-readable description of the accordion config schema
 * Used in system prompts for AI
 */
export function getAccordionConfigSchemaDescription(): string {
  return `
Accordion Configuration Schema:
{
  title: string (optional, title text),
  content: string (optional, content text),
  size: "small" | "medium" | "large" (optional),
  styles?: {
    borderRadius?: number (0-100, in pixels),
    backgroundColor?: string (hex format: #RRGGBB),
    borderColor?: string (hex format: #RRGGBB),
    titleColor?: string (hex format: #RRGGBB),
    answerColor?: string (hex format: #RRGGBB)
  }
}

IMPORTANT RULES:
- All color values MUST be in hex format (#RRGGBB)
- Use undefined or omit properties that should remain unchanged
- borderRadius must be between 0 and 100
- size defaults to "medium" if not specified
`;
}

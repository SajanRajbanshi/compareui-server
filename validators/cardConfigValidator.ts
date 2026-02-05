import { z } from 'zod';

// Zod schema for card configuration
const CardConfigSchema = z.object({
  title: z.string().describe('Card title'),
  description: z.string().describe('Card body text'),
  image: z.boolean().optional().describe('Whether to show a random image'),
  styles: z.object({
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
      .describe('Background color in hex format (#RRGGBB)'),
    borderColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
      .describe('Border color in hex format (#RRGGBB)'),
    borderWidth: z.number().min(0).max(10).optional()
      .describe('Border width in pixels'),
    borderRadius: z.number().min(0).max(50).optional()
      .describe('Border radius in pixels'),
    titleColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
      .describe('Title text color in hex format (#RRGGBB)'),
    fontColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
      .describe('Body text color in hex format (#RRGGBB)'),
    padding: z.object({
      px: z.number().positive().describe('Horizontal padding'),
      py: z.number().positive().describe('Vertical padding')
    }).optional(),
    shadow: z.enum(['none', 'sm', 'md', 'lg']).optional().describe('Shadow intensity')
  }).optional()
});

export type CardConfig = z.infer<typeof CardConfigSchema>;

export interface ValidationResult {
  success: boolean;
  data?: CardConfig;
  error?: string;
  details?: string[];
}

/**
 * Validates card configuration against the schema
 */
export function validateCardConfig(config: unknown): ValidationResult {
  try {
    const result = CardConfigSchema.safeParse(config);
    
    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    }
    
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
 * Get schema description for AI
 */
export function getCardConfigSchemaDescription(): string {
  return `
Card Configuration Schema:
{
  title: string,
  description: string,
  image?: boolean,
  styles?: {
    backgroundColor?: string (hex format: #RRGGBB),
    borderColor?: string (hex format: #RRGGBB),
    borderWidth?: number (pixels),
    borderRadius?: number (pixels),
    titleColor?: string (hex format: #RRGGBB),
    fontColor?: string (hex format: #RRGGBB),
    padding?: { px: number, py: number },
    shadow?: "none" | "sm" | "md" | "lg"
  }
}

RULES:
- All colors MUST be in hex format (#RRGGBB).
- borderRadius between 0-50.
- image defaults to true if omitted.
`;
}

import { z } from 'zod';

// Zod schema for icon button configuration
const IconButtonConfigSchema = z.object({
  label: z.string().optional(),
  showLabel: z.boolean().optional(),
  variant: z.enum(['contained', 'outlined']),
  size: z.enum(['small', 'medium', 'large']),
  styles: z.object({
    borderRadius: z.number().min(0).max(100).optional()
      .describe('Border radius in pixels (0-100)'),
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
      .describe('Background color in hex format (#RRGGBB)'),
    fontColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
      .describe('Font color in hex format (#RRGGBB)'),
    borderColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
      .describe('Border color in hex format (#RRGGBB)'),
    borderStyle: z.enum(['solid', 'dashed', 'dotted']).optional()
      .describe('Border style'),
    borderWidth: z.number().min(0).max(20).optional()
      .describe('Border width in pixels (0-20)'),
    padding: z.object({
      px: z.number().positive().describe('Horizontal padding in pixels'),
      py: z.number().positive().describe('Vertical padding in pixels')
    }).optional()
  }).optional()
});

export type IconButtonConfig = z.infer<typeof IconButtonConfigSchema>;

export interface ValidationResult {
  success: boolean;
  data?: IconButtonConfig;
  error?: string;
  details?: string[];
}

/**
 * Validates icon button configuration against the schema
 * Returns detailed error messages for AI feedback
 */
export function validateIconButtonConfig(config: unknown): ValidationResult {
  try {
    const result = IconButtonConfigSchema.safeParse(config);
    
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
 * Get a human-readable description of the icon button config schema
 * Used in system prompts for AI
 */
export function getIconButtonConfigSchemaDescription(): string {
  return `
Icon Button Configuration Schema:
{
  label: string (optional button text),
  showLabel: boolean (whether to show label text),
  variant: "contained" | "outlined",
  size: "small" | "medium" | "large",
  styles?: {
    borderRadius?: number (0-100, in pixels),
    backgroundColor?: string (hex format: #RRGGBB),
    fontColor?: string (hex format: #RRGGBB),
    borderColor?: string (hex format: #RRGGBB),
    borderStyle?: "solid" | "dashed" | "dotted",
    borderWidth?: number (0-20, in pixels),
    padding?: {
      px: number (positive, horizontal padding in pixels),
      py: number (positive, vertical padding in pixels)
    }
  }
}

IMPORTANT RULES:
- All color values MUST be in hex format (#RRGGBB)
- Use undefined or omit properties that should remain unchanged
- If showLabel is true, ensure label has a value
- borderRadius must be between 0 and 100
`;
}

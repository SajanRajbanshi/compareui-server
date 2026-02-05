import { z } from 'zod';

// Zod schema for radio options (simpler than select, usually just strings)
// If you need complex options (value/label), you can adapt it, but RadioWrapper currently takes string[]
const RadioConfigSchema = z.object({
  options: z.array(z.string()).min(1),
  selectedValue: z.string(),
  size: z.enum(['small', 'medium', 'large']).optional(),
  disabled: z.boolean().optional(),
  color: z.string().optional().describe('Main color (e.g. checked state)'),
  styles: z.object({
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
      .describe('Text/Main color in hex format (#RRGGBB)'),
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
      .describe('Background color in hex format (#RRGGBB)'),
    borderColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
      .describe('Border color in hex format (#RRGGBB)')
  }).optional()
});

export type RadioConfig = z.infer<typeof RadioConfigSchema>;

export interface ValidationResult {
  success: boolean;
  data?: RadioConfig;
  error?: string;
  details?: string[];
}

/**
 * Validates radio configuration against the schema
 */
export function validateRadioConfig(config: unknown): ValidationResult {
  try {
    const result = RadioConfigSchema.safeParse(config);
    
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
export function getRadioConfigSchemaDescription(): string {
  return `
Radio Configuration Schema:
{
  options: string[],
  selectedValue: string (must be one of the options),
  size?: "small" | "medium" | "large",
  disabled?: boolean,
  color?: string (legacy color prop),
  styles?: {
    color?: string (hex format: #RRGGBB),
    backgroundColor?: string (hex format: #RRGGBB),
    borderColor?: string (hex format: #RRGGBB)
  }
}

RULES:
- All colors in styles MUST be in hex format (#RRGGBB).
- options must have at least one item.
- selectedValue must match one of the options.
`;
}

import { z } from 'zod';

// Zod schema for select option
const SelectOptionSchema = z.object({
  value: z.string(),
  label: z.string()
});

// Zod schema for select configuration
const SelectConfigSchema = z.object({
  options: z.array(z.union([z.string(), SelectOptionSchema])).min(1),
  value: z.string(),
  placeholder: z.string().optional(),
  label: z.string().optional(),
  size: z.enum(['small', 'medium', 'large']).optional(),
  disabled: z.boolean().optional(),
  styles: z.object({
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
      .describe('Text or primary color in hex format (#RRGGBB)'),
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
      .describe('Background color in hex format (#RRGGBB)'),
    borderRadius: z.number().min(0).max(100).optional()
      .describe('Border radius in pixels (0-100)'),
    borderColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
      .describe('Border color in hex format (#RRGGBB)')
  }).optional()
});

export type SelectConfig = z.infer<typeof SelectConfigSchema>;

export interface ValidationResult {
  success: boolean;
  data?: SelectConfig;
  error?: string;
  details?: string[];
}

/**
 * Validates select configuration against the schema
 */
export function validateSelectConfig(config: unknown): ValidationResult {
  try {
    const result = SelectConfigSchema.safeParse(config);
    
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
export function getSelectConfigSchemaDescription(): string {
  return `
Select Configuration Schema:
{
  options: (string | { value: string, label: string })[],
  value: string (current selected value),
  placeholder?: string,
  label?: string,
  size?: "small" | "medium" | "large",
  disabled?: boolean,
  styles?: {
    color?: string (hex format: #RRGGBB),
    backgroundColor?: string (hex format: #RRGGBB),
    borderRadius?: number (0-100),
    borderColor?: string (hex format: #RRGGBB)
  }
}

RULES:
- All colors MUST be in hex format (#RRGGBB).
- options must have at least one item.
- value must match one of the option values.
`;
}

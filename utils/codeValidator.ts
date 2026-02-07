import { transform } from '@babel/core';

export interface ValidationResult {
  success: boolean;
  error?: string;
}

/**
 * Validates if the provided code compiles successfully using Babel.
 * @param code The string of React/TypeScript code to validate.
 * @param provider Optional provider ID for provider-specific validation
 * @returns An object containing the success status and any error message.
 */
export function validateCode(code: string, provider?: string): ValidationResult {
  // Babel compilation validation
  try {
    transform(code, {
      presets: [
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript'
      ],
      filename: 'generated.tsx'
    });
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

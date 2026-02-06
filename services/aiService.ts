import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  validateButtonConfig,
  getButtonConfigSchemaDescription,
  ValidationResult,
} from "../validators/buttonConfigValidator.js";

import {
  validateIconButtonConfig,
  getIconButtonConfigSchemaDescription,
} from "../validators/iconButtonConfigValidator.js";

import {
  validateAccordionConfig,
  getAccordionConfigSchemaDescription,
} from "../validators/accordionConfigValidator.js";

import {
  validateInputConfig,
  getInputConfigSchemaDescription,
} from "../validators/inputConfigValidator.js";

import {
  validateSelectConfig,
  getSelectConfigSchemaDescription,
} from "../validators/selectConfigValidator.js";

import {
  validateRadioConfig,
  getRadioConfigSchemaDescription,
} from "../validators/radioConfigValidator.js";

import {
  validateCardConfig,
  getCardConfigSchemaDescription,
} from "../validators/cardConfigValidator.js";

import {
  validateModalConfig,
  getModalConfigSchemaDescription,
} from "../validators/modalConfigValidator.js";

import {
  validateTabsConfig,
  getTabsConfigSchemaDescription,
} from "../validators/tabsConfigValidator.js";

import {
  validateProgressConfig,
  getProgressConfigSchemaDescription,
} from "../validators/progressConfigValidator.js";

// Initialize Gemini AI lazily to ensure env vars are loaded
let model: any = null;

function getModel() {
  if (!model) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
  }
  return model;
}

interface GenerateConfigRequest {
  componentName: string;
  prompt: string;
  currentConfig: any;
}

interface GenerateConfigResponse {
  success: boolean;
  config?: any;
  attempts?: number;
  error?: string;
  lastError?: string;
}

const MAX_RETRIES = 5;

/**
 * Generate system prompt for button config generation
 */
function generateSystemPrompt(currentConfig: any, userPrompt: string): string {
  return `You are a UI configuration generator. Your task is to modify the current button configuration based on the user's request.

${getButtonConfigSchemaDescription()}

CURRENT CONFIGURATION:
${JSON.stringify(currentConfig, null, 2)}

USER REQUEST: "${userPrompt}"

INSTRUCTIONS:
1. Analyze the user's request carefully.
2. Modify ONLY the properties mentioned in the request.
3. Keep all other properties unchanged from the current config.
4. Return ONLY valid JSON matching the schema above.
5. Do NOT include any explanations, markdown formatting, or code blocks.
6. Return raw JSON only.
7. Ensure all colors are 6-character HEX codes (e.g. #FF0000). Names like "red" are NOT allowed.

Example: If user says "make it blue", change backgroundColor to "#0000FF", and keep other properties.

Generate the modified configuration JSON now:`;
}

/**
 * Extract JSON from AI response (handles cases where AI adds markdown or text)
 */
function extractJSON(text: string): any {
  let cleaned = text.trim();
  
  // Find the first '{' and the last '}'
  const firstOpen = cleaned.indexOf('{');
  const lastClose = cleaned.lastIndexOf('}');
  
  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    cleaned = cleaned.substring(firstOpen, lastClose + 1);
  } else {
    // Fallback cleanup if braces not found (unlikely for valid JSON)
    cleaned = cleaned
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/, "")
      .replace(/```\s*$/, "");
  }

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parse Error. Raw text:", text);
    throw new Error("Failed to parse JSON response");
  }
}

/**
 * Generate button configuration using Gemini AI with retry logic
 */
export async function generateButtonConfig(
  request: GenerateConfigRequest,
): Promise<GenerateConfigResponse> {
  const { componentName, prompt, currentConfig } = request;

  let lastValidationError: string = "";
  let attempts = 0;

  for (let i = 0; i < MAX_RETRIES; i++) {
    attempts++;

    try {
      // Build system prompt
      let systemPrompt = generateSystemPrompt(currentConfig, prompt);

      // Add validation feedback if this is a retry
      if (i > 0 && lastValidationError) {
        console.log(`Retry ${i + 1} due to: ${lastValidationError}`);
        systemPrompt += `\n\nPREVIOUS ATTEMPT FAILED WITH ERRORS:\n${lastValidationError}\n\nPlease fix these errors and try again. Return ONLY the corrected JSON.`;
      }

      // Call Gemini API
      console.log(`Generating config (attempt ${attempts})...`);
      const result = await getModel().generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();
      
      console.log("AI Response snippet:", text.substring(0, 100) + "...");

      // Extract and parse JSON
      const generatedConfig = extractJSON(text);

      // Validate the generated config
      const validation = validateButtonConfig(generatedConfig);

      if (validation.success) {
        console.log("Validation successful!");
        return {
          success: true,
          config: validation.data,
          attempts,
        };
      }

      // Validation failed, prepare feedback for retry
      lastValidationError =
        validation.details?.join("\n") ||
        validation.error ||
        "Unknown validation error";

      console.log(
        `Attempt ${attempts} failed validation:`,
        lastValidationError,
      );
    } catch (error) {
      lastValidationError =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error(`Attempt ${attempts} failed:`, error);
    }
  }

  // All retries exhausted
  return {
    success: false,
    error: `Failed to generate valid configuration after ${MAX_RETRIES} attempts`,
    lastError: lastValidationError,
    attempts,
  };
}



/**
 * Generate system prompt for icon button config generation
 */
function generateIconButtonSystemPrompt(currentConfig: any, userPrompt: string): string {
  return `You are a UI configuration generator. Your task is to modify the current icon button configuration based on the user's request.

${getIconButtonConfigSchemaDescription()}

CURRENT CONFIGURATION:
${JSON.stringify(currentConfig, null, 2)}

USER REQUEST: "${userPrompt}"

INSTRUCTIONS:
1. Analyze the user's request carefully.
2. Modify ONLY the properties mentioned in the request.
3. Keep all other properties unchanged from the current config.
4. Return ONLY valid JSON matching the schema above.
5. Do NOT include any explanations, markdown formatting, or code blocks.
6. Return raw JSON only.
7. Ensure all colors are 6-character HEX codes (e.g. #FF0000). Names like "red" are NOT allowed.

Example: If user says "make it blue", change backgroundColor to "#0000FF", and keep other properties.

Generate the modified configuration JSON now:`;
}

/**
 * Generate icon button configuration using Gemini AI with retry logic
 */
export async function generateIconButtonConfig(
  request: GenerateConfigRequest,
): Promise<GenerateConfigResponse> {
  const { prompt, currentConfig } = request;

  let lastValidationError: string = "";
  let attempts = 0;

  for (let i = 0; i < MAX_RETRIES; i++) {
    attempts++;

    try {
      // Build system prompt
      let systemPrompt = generateIconButtonSystemPrompt(currentConfig, prompt);

      // Add validation feedback if this is a retry
      if (i > 0 && lastValidationError) {
        console.log(`Retry ${i + 1} due to: ${lastValidationError}`);
        systemPrompt += `\n\nPREVIOUS ATTEMPT FAILED WITH ERRORS:\n${lastValidationError}\n\nPlease fix these errors and try again. Return ONLY the corrected JSON.`;
      }

      // Call Gemini API
      console.log(`Generating icon button config (attempt ${attempts})...`);
      const result = await getModel().generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();
      
      console.log("AI Response snippet:", text.substring(0, 100) + "...");

      // Extract and parse JSON
      const generatedConfig = extractJSON(text);

      // Validate the generated config
      const validation = validateIconButtonConfig(generatedConfig);

      if (validation.success) {
        console.log("Validation successful!");
        return {
          success: true,
          config: validation.data,
          attempts,
        };
      }

      // Validation failed, prepare feedback for retry
      lastValidationError =
        validation.details?.join("\n") ||
        validation.error ||
        "Unknown validation error";

      console.log(
        `Attempt ${attempts} failed validation:`,
        lastValidationError,
      );
    } catch (error) {
      lastValidationError =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error(`Attempt ${attempts} failed:`, error);
    }
  }

  // All retries exhausted
  return {
    success: false,
    error: `Failed to generate valid configuration after ${MAX_RETRIES} attempts`,
    lastError: lastValidationError,
    attempts,
  };
}

/**
 * Generate system prompt for accordion config generation
 */
function generateAccordionSystemPrompt(currentConfig: any, userPrompt: string): string {
  return `You are a UI configuration generator. Your task is to modify the current accordion configuration based on the user's request.

${getAccordionConfigSchemaDescription()}

CURRENT CONFIGURATION:
${JSON.stringify(currentConfig, null, 2)}

USER REQUEST: "${userPrompt}"

INSTRUCTIONS:
1. Analyze the user's request carefully.
2. Modify ONLY the properties mentioned in the request.
3. Keep all other properties unchanged from the current config.
4. Return ONLY valid JSON matching the schema above.
5. Do NOT include any explanations, markdown formatting, or code blocks.
6. Return raw JSON only.
7. Ensure all colors are 6-character HEX codes (e.g. #FF0000). Names like "red" are NOT allowed.

Example: If user says "make it blue", change backgroundColor to "#0000FF", and keep other properties.

Generate the modified configuration JSON now:`;
}

/**
 * Generate accordion configuration using Gemini AI with retry logic
 */
export async function generateAccordionConfig(
  request: GenerateConfigRequest,
): Promise<GenerateConfigResponse> {
  const { prompt, currentConfig } = request;

  let lastValidationError: string = "";
  let attempts = 0;

  for (let i = 0; i < MAX_RETRIES; i++) {
    attempts++;

    try {
      // Build system prompt
      let systemPrompt = generateAccordionSystemPrompt(currentConfig, prompt);

      // Add validation feedback if this is a retry
      if (i > 0 && lastValidationError) {
        console.log(`Retry ${i + 1} due to: ${lastValidationError}`);
        systemPrompt += `\n\nPREVIOUS ATTEMPT FAILED WITH ERRORS:\n${lastValidationError}\n\nPlease fix these errors and try again. Return ONLY the corrected JSON.`;
      }

      // Call Gemini API
      console.log(`Generating accordion config (attempt ${attempts})...`);
      const result = await getModel().generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();
      
      console.log("AI Response snippet:", text.substring(0, 100) + "...");

      // Extract and parse JSON
      const generatedConfig = extractJSON(text);

      // Validate the generated config
      const validation = validateAccordionConfig(generatedConfig);

      if (validation.success) {
        console.log("Validation successful!");
        return {
          success: true,
          config: validation.data,
          attempts,
        };
      }

      // Validation failed, prepare feedback for retry
      lastValidationError =
        validation.details?.join("\n") ||
        validation.error ||
        "Unknown validation error";

      console.log(
        `Attempt ${attempts} failed validation:`,
        lastValidationError,
      );
    } catch (error) {
      lastValidationError =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error(`Attempt ${attempts} failed:`, error);
    }
  }

  // All retries exhausted
  return {
    success: false,
    error: `Failed to generate valid configuration after ${MAX_RETRIES} attempts`,
    lastError: lastValidationError,
    attempts,
  };
}

/**
 * Generate system prompt for input config generation
 */
function generateInputSystemPrompt(currentConfig: any, userPrompt: string): string {
  return `You are a UI configuration generator. Your task is to modify the current input configuration based on the user's request.

${getInputConfigSchemaDescription()}

CURRENT CONFIGURATION:
${JSON.stringify(currentConfig, null, 2)}

USER REQUEST: "${userPrompt}"

INSTRUCTIONS:
1. Analyze the user's request carefully.
2. Modify ONLY the properties mentioned in the request.
3. Keep all other properties unchanged from the current config.
4. Return ONLY valid JSON matching the schema above.
5. Do NOT include any explanations, markdown formatting, or code blocks.
6. Return raw JSON only.
7. Ensure all colors are 6-character HEX codes (e.g. #FF0000). Names like "red" are NOT allowed.

Example: If user says "change background to blue", change backgroundColor to "#0000FF", and keep other properties.

Generate the modified configuration JSON now:`;
}

/**
 * Generate input configuration using Gemini AI with retry logic
 */
export async function generateInputConfig(
  request: GenerateConfigRequest,
): Promise<GenerateConfigResponse> {
  const { prompt, currentConfig } = request;

  let lastValidationError: string = "";
  let attempts = 0;

  for (let i = 0; i < MAX_RETRIES; i++) {
    attempts++;

    try {
      // Build system prompt
      let systemPrompt = generateInputSystemPrompt(currentConfig, prompt);

      // Add validation feedback if this is a retry
      if (i > 0 && lastValidationError) {
        console.log(`Retry ${i + 1} due to: ${lastValidationError}`);
        systemPrompt += `\n\nPREVIOUS ATTEMPT FAILED WITH ERRORS:\n${lastValidationError}\n\nPlease fix these errors and try again. Return ONLY the corrected JSON.`;
      }

      // Call Gemini API
      console.log(`Generating input config (attempt ${attempts})...`);
      const result = await getModel().generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();
      
      console.log("AI Response snippet:", text.substring(0, 100) + "...");

      // Extract and parse JSON
      const generatedConfig = extractJSON(text);

      // Validate the generated config
      const validation = validateInputConfig(generatedConfig);

      if (validation.success) {
        console.log("Validation successful!");
        return {
          success: true,
          config: validation.data,
          attempts,
        };
      }

      // Validation failed, prepare feedback for retry
      lastValidationError =
        validation.details?.join("\n") ||
        validation.error ||
        "Unknown validation error";

      console.log(
        `Attempt ${attempts} failed validation:`,
        lastValidationError,
      );
    } catch (error) {
      lastValidationError =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error(`Attempt ${attempts} failed:`, error);
    }
  }

  // All retries exhausted
  return {
    success: false,
    error: `Failed to generate valid configuration after ${MAX_RETRIES} attempts`,
    lastError: lastValidationError,
    attempts,
  };
}

/**
 * Generate system prompt for select config generation
 */
function generateSelectSystemPrompt(currentConfig: any, userPrompt: string): string {
  return `You are a UI configuration generator. Your task is to modify the current select configuration based on the user's request.

${getSelectConfigSchemaDescription()}

CURRENT CONFIGURATION:
${JSON.stringify(currentConfig, null, 2)}

USER REQUEST: "${userPrompt}"

INSTRUCTIONS:
1. Analyze the user's request carefully.
2. Modify ONLY the properties mentioned in the request.
3. Keep all other properties unchanged from the current config.
4. Return ONLY valid JSON matching the schema above.
5. Do NOT include any explanations, markdown formatting, or code blocks.
6. Return raw JSON only.
7. Ensure all colors are 6-character HEX codes (e.g. #FF0000).

Generate the modified configuration JSON now:`;
}

/**
 * Generate select configuration using Gemini AI with retry logic
 */
export async function generateSelectConfig(
  request: GenerateConfigRequest,
): Promise<GenerateConfigResponse> {
  const { prompt, currentConfig } = request;

  let lastValidationError: string = "";
  let attempts = 0;

  for (let i = 0; i < MAX_RETRIES; i++) {
    attempts++;

    try {
      let systemPrompt = generateSelectSystemPrompt(currentConfig, prompt);

      if (i > 0 && lastValidationError) {
        systemPrompt += `\n\nPREVIOUS ATTEMPT FAILED WITH ERRORS:\n${lastValidationError}\n\nPlease fix these errors and try again.`;
      }

      console.log(`Generating select config (attempt ${attempts})...`);
      const result = await getModel().generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();
      
      const generatedConfig = extractJSON(text);
      const validation = validateSelectConfig(generatedConfig);

      if (validation.success) {
        return {
          success: true,
          config: validation.data,
          attempts,
        };
      }

      lastValidationError = validation.details?.join("\n") || validation.error || "Unknown validation error";
    } catch (error) {
      lastValidationError = error instanceof Error ? error.message : "Unknown error occurred";
    }
  }

  return {
    success: false,
    error: `Failed to generate valid configuration after ${MAX_RETRIES} attempts`,
    lastError: lastValidationError,
    attempts,
  };
}

/**
 * Generate system prompt for radio config generation
 */
function generateRadioSystemPrompt(currentConfig: any, userPrompt: string): string {
  return `You are a UI configuration generator. Your task is to modify the current radio configuration based on the user's request.

${getRadioConfigSchemaDescription()}

CURRENT CONFIGURATION:
${JSON.stringify(currentConfig, null, 2)}

USER REQUEST: "${userPrompt}"

INSTRUCTIONS:
1. Analyze the user's request carefully.
2. Modify ONLY the properties mentioned in the request.
3. Keep all other properties unchanged from the current config.
4. Return ONLY valid JSON matching the schema above.
5. Do NOT include any explanations, markdown formatting, or code blocks.
6. Return raw JSON only.
7. Ensure all colors are 6-character HEX codes (e.g. #FF0000).

Generate the modified configuration JSON now:`;
}

/**
 * Generate radio configuration using Gemini AI with retry logic
 */
export async function generateRadioConfig(
  request: GenerateConfigRequest,
): Promise<GenerateConfigResponse> {
  const { prompt, currentConfig } = request;

  let lastValidationError: string = "";
  let attempts = 0;

  for (let i = 0; i < MAX_RETRIES; i++) {
    attempts++;

    try {
      let systemPrompt = generateRadioSystemPrompt(currentConfig, prompt);

      if (i > 0 && lastValidationError) {
        systemPrompt += `\n\nPREVIOUS ATTEMPT FAILED WITH ERRORS:\n${lastValidationError}\n\nPlease fix these errors and try again.`;
      }

      console.log(`Generating radio config (attempt ${attempts})...`);
      const result = await getModel().generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();
      
      const generatedConfig = extractJSON(text);
      const validation = validateRadioConfig(generatedConfig);

      if (validation.success) {
        return {
          success: true,
          config: validation.data,
          attempts,
        };
      }

      lastValidationError = validation.details?.join("\n") || validation.error || "Unknown validation error";
    } catch (error) {
      lastValidationError = error instanceof Error ? error.message : "Unknown error occurred";
    }
  }

  return {
    success: false,
    error: `Failed to generate valid configuration after ${MAX_RETRIES} attempts`,
    lastError: lastValidationError,
    attempts,
  };
}

/**
 * Generate system prompt for card config generation
 */
function generateCardSystemPrompt(currentConfig: any, userPrompt: string): string {
  return `You are a UI configuration generator. Your task is to modify the current card configuration based on the user's request.

${getCardConfigSchemaDescription()}

CURRENT CONFIGURATION:
${JSON.stringify(currentConfig, null, 2)}

USER REQUEST: "${userPrompt}"

INSTRUCTIONS:
1. Analyze the user's request carefully.
2. Modify ONLY the properties mentioned in the request.
3. Keep all other properties unchanged from the current config.
4. Return ONLY valid JSON matching the schema above.
5. Do NOT include any explanations, markdown formatting, or code blocks.
6. Return raw JSON only.
7. Ensure all colors are 6-character HEX codes (e.g. #FF0000).

Generate the modified configuration JSON now:`;
}

/**
 * Generate card configuration using Gemini AI
 */
export async function generateCardConfig(
  request: GenerateConfigRequest,
): Promise<GenerateConfigResponse> {
  const { prompt, currentConfig } = request;

  let lastValidationError: string = "";
  let attempts = 0;

  for (let i = 0; i < MAX_RETRIES; i++) {
    attempts++;

    try {
      let systemPrompt = generateCardSystemPrompt(currentConfig, prompt);

      if (i > 0 && lastValidationError) {
        systemPrompt += `\n\nPREVIOUS ATTEMPT FAILED WITH ERRORS:\n${lastValidationError}\n\nPlease fix these errors and try again.`;
      }

      console.log(`Generating card config (attempt ${attempts})...`);
      const result = await getModel().generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();
      
      const generatedConfig = extractJSON(text);
      const validation = validateCardConfig(generatedConfig);

      if (validation.success) {
        return {
          success: true,
          config: validation.data,
          attempts,
        };
      }

      lastValidationError = validation.details?.join("\n") || validation.error || "Unknown validation error";
    } catch (error) {
      lastValidationError = error instanceof Error ? error.message : "Unknown error occurred";
    }
  }

  return {
    success: false,
    error: `Failed to generate valid configuration after ${MAX_RETRIES} attempts`,
    lastError: lastValidationError,
    attempts,
  };
}

/**
 * Generate system prompt for modal config generation
 */
function generateModalSystemPrompt(currentConfig: any, userPrompt: string): string {
  return `You are a UI configuration generator. Your task is to modify the current modal configuration based on the user's request.

${getModalConfigSchemaDescription()}

CURRENT CONFIGURATION:
${JSON.stringify(currentConfig, null, 2)}

USER REQUEST: "${userPrompt}"

INSTRUCTIONS:
1. Analyze the user's request carefully.
2. Modify ONLY the properties mentioned in the request.
3. Keep all other properties unchanged from the current config.
4. Return ONLY valid JSON matching the schema above.
5. Do NOT include any explanations, markdown formatting, or code blocks.
6. Return raw JSON only.
7. Ensure all colors are 6-character HEX codes (e.g. #FF0000).

Generate the modified configuration JSON now:`;
}

/**
 * Generate modal configuration using Gemini AI
 */
export async function generateModalConfig(
  request: GenerateConfigRequest,
): Promise<GenerateConfigResponse> {
  const { prompt, currentConfig } = request;

  let lastValidationError: string = "";
  let attempts = 0;

  for (let i = 0; i < MAX_RETRIES; i++) {
    attempts++;

    try {
      let systemPrompt = generateModalSystemPrompt(currentConfig, prompt);

      if (i > 0 && lastValidationError) {
        systemPrompt += `\n\nPREVIOUS ATTEMPT FAILED WITH ERRORS:\n${lastValidationError}\n\nPlease fix these errors and try again.`;
      }

      console.log(`Generating modal config (attempt ${attempts})...`);
      const result = await getModel().generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();
      
      const generatedConfig = extractJSON(text);
      const validation = validateModalConfig(generatedConfig);

      if (validation.success) {
        return {
          success: true,
          config: validation.data,
          attempts,
        };
      }

      lastValidationError = validation.details?.join("\n") || validation.error || "Unknown validation error";
    } catch (error) {
      lastValidationError = error instanceof Error ? error.message : "Unknown error occurred";
    }
  }

  return {
    success: false,
    error: `Failed to generate valid configuration after ${MAX_RETRIES} attempts`,
    lastError: lastValidationError,
    attempts,
  };
}

/**
 * Generate system prompt for tabs config generation
 */
function generateTabsSystemPrompt(currentConfig: any, userPrompt: string): string {
  return `You are a UI configuration generator. Your task is to modify the current tabs configuration based on the user's request.

${getTabsConfigSchemaDescription()}

CURRENT CONFIGURATION:
${JSON.stringify(currentConfig, null, 2)}

USER REQUEST: "${userPrompt}"

INSTRUCTIONS:
1. Analyze the user's request carefully.
2. Modify ONLY the properties mentioned in the request.
3. Keep all other properties unchanged from the current config.
4. Return ONLY valid JSON matching the schema above.
5. Do NOT include any explanations, markdown formatting, or code blocks.
6. Return raw JSON only.
7. Ensure all colors are 6-character HEX codes (e.g. #FF0000).

Generate the modified configuration JSON now:`;
}

/**
 * Generate tabs configuration using Gemini AI
 */
export async function generateTabsConfig(
  request: GenerateConfigRequest,
): Promise<GenerateConfigResponse> {
  const { prompt, currentConfig } = request;

  let lastValidationError: string = "";
  let attempts = 0;

  for (let i = 0; i < MAX_RETRIES; i++) {
    attempts++;

    try {
      let systemPrompt = generateTabsSystemPrompt(currentConfig, prompt);

      if (i > 0 && lastValidationError) {
        systemPrompt += `\n\nPREVIOUS ATTEMPT FAILED WITH ERRORS:\n${lastValidationError}\n\nPlease fix these errors and try again.`;
      }

      console.log(`Generating tabs config (attempt ${attempts})...`);
      const result = await getModel().generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();
      
      const generatedConfig = extractJSON(text);
      const validation = validateTabsConfig(generatedConfig);

      if (validation.success) {
        return {
          success: true,
          config: validation.data,
          attempts,
        };
      }

      lastValidationError = validation.details?.join("\n") || validation.error || "Unknown validation error";
    } catch (error) {
      lastValidationError = error instanceof Error ? error.message : "Unknown error occurred";
    }
  }

  return {
    success: false,
    error: `Failed to generate valid configuration after ${MAX_RETRIES} attempts`,
    lastError: lastValidationError,
    attempts,
  };
}

/**
 * Generate system prompt for progress config generation
 */
function generateProgressSystemPrompt(currentConfig: any, userPrompt: string): string {
  return `You are a UI configuration generator. Your task is to modify the current progress component configuration based on the user's request.

${getProgressConfigSchemaDescription()}

CURRENT CONFIGURATION:
${JSON.stringify(currentConfig, null, 2)}

USER REQUEST: "${userPrompt}"

INSTRUCTIONS:
1. Analyze the user's request carefully.
2. Modify ONLY the properties mentioned in the request.
3. Keep all other properties unchanged from the current config.
4. Return ONLY valid JSON matching the schema above.
5. Do NOT include any explanations, markdown formatting, or code blocks.
6. Return raw JSON only.
7. Ensure all colors are 6-character HEX codes (e.g. #FF0000). Names like "red" are NOT allowed.

Example: If user says "make the bar green", change indicatorColor to "#00FF00", and keep other properties.

Generate the modified configuration JSON now:`;
}

/**
 * Generate progress configuration using Gemini AI
 */
export async function generateProgressConfig(
  request: GenerateConfigRequest,
): Promise<GenerateConfigResponse> {
  const { prompt, currentConfig } = request;

  let lastValidationError: string = "";
  let attempts = 0;

  for (let i = 0; i < MAX_RETRIES; i++) {
    attempts++;

    try {
      let systemPrompt = generateProgressSystemPrompt(currentConfig, prompt);

      if (i > 0 && lastValidationError) {
        systemPrompt += `\n\nPREVIOUS ATTEMPT FAILED WITH ERRORS:\n${lastValidationError}\n\nPlease fix these errors and try again.`;
      }

      console.log(`Generating progress config (attempt ${attempts})...`);
      const result = await getModel().generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();
      
      const generatedConfig = extractJSON(text);
      const validation = validateProgressConfig(generatedConfig);

      if (validation.success) {
        return {
          success: true,
          config: validation.data,
          attempts,
        };
      }

      lastValidationError = validation.details?.join("\n") || validation.error || "Unknown validation error";
    } catch (error) {
      lastValidationError = error instanceof Error ? error.message : "Unknown error occurred";
    }
  }

  return {
    success: false,
    error: `Failed to generate valid configuration after ${MAX_RETRIES} attempts`,
    lastError: lastValidationError,
    attempts,
  };
}

/**
 * Generate configuration for any supported component
 * Routes to appropriate generator based on componentName
 */
export async function generateConfig(
  request: GenerateConfigRequest,
): Promise<GenerateConfigResponse> {
  switch (request.componentName) {
    case "button":
      return generateButtonConfig(request);

    case 'icon-button':
      return generateIconButtonConfig(request);

    case 'accordion':
      return generateAccordionConfig(request);

    case 'input':
      return generateInputConfig(request);

    case 'select':
      return generateSelectConfig(request);

    case 'radio':
      return generateRadioConfig(request);

    case 'card':
      return generateCardConfig(request);

    case 'modal':
      return generateModalConfig(request);

    case 'tabs':
      return generateTabsConfig(request);

    case 'progress':
      return generateProgressConfig(request);

    default:
      return {
        success: false,
        error: `Component "${request.componentName}" is not supported`,
      };
  }
}


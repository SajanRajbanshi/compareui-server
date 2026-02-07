import { callGemini, extractJSON } from "./geminiEngine.js";
import { promptBuilder } from "./promptBuilder.js";
import { validateButtonConfig } from "../validators/buttonConfigValidator.js";
import { validateIconButtonConfig } from "../validators/iconButtonConfigValidator.js";
import { validateAccordionConfig } from "../validators/accordionConfigValidator.js";
import { validateInputConfig } from "../validators/inputConfigValidator.js";
import { validateSelectConfig } from "../validators/selectConfigValidator.js";
import { validateRadioConfig } from "../validators/radioConfigValidator.js";
import { validateCardConfig } from "../validators/cardConfigValidator.js";
import { validateModalConfig } from "../validators/modalConfigValidator.js";
import { validateTabsConfig } from "../validators/tabsConfigValidator.js";
import { validateProgressConfig } from "../validators/progressConfigValidator.js";

interface GenerateConfigRequest {
  componentName?: string;
  prompt: string;
  currentConfig?: any;
  prevCode?: any;
  providers?: string[]; // Optional for playground
}

interface GenerateConfigResponse {
  success: boolean;
  config?: any;
  attempts?: number;
  error?: string;
  lastError?: string;
}

const MAX_RETRIES = 3;

/**
 * Generic generator with validation
 */
async function generateWithValidation(
  request: GenerateConfigRequest,
  validator: (config: any) => any
): Promise<GenerateConfigResponse> {
  const { componentName, prompt, currentConfig } = request;
  let lastValidationError = "";
  let attempts = 0;

  for (let i = 0; i < MAX_RETRIES; i++) {
    attempts++;
    try {
      let systemPrompt = promptBuilder.getSystemPrompt(componentName || 'unknown', currentConfig, prompt);
      if (i > 0 && lastValidationError) {
        systemPrompt += `\n\nPREVIOUS ATTEMPT FAILED WITH ERRORS:\n${lastValidationError}\n\nPlease fix these errors and try again.`;
      }

      const text = await callGemini(systemPrompt);
      const generatedConfig = extractJSON(text);
      const validation = validator(generatedConfig);

      if (validation.success) {
        return { success: true, config: validation.data, attempts };
      }
      lastValidationError = validation.details?.join("\n") || validation.error || "Validation failed";
    } catch (error: any) {
      lastValidationError = error.message;
    }
  }

  return { success: false, error: "Retries exhausted", lastError: lastValidationError, attempts };
}

export async function generateConfig(request: GenerateConfigRequest): Promise<GenerateConfigResponse> {
  const { componentName, prompt, currentConfig, prevCode, providers } = request;
  const isPlayground = componentName === 'playground' || !componentName;

  if (isPlayground) {
    try {
      const pPrompt = promptBuilder.getPlaygroundPrompt(prompt, prevCode || currentConfig, providers || ['mui', 'chakra', 'antd', 'shadcn', 'aceternity']);
      const text = await callGemini(pPrompt);
      const generated = extractJSON(text);
      return { success: true, config: generated };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  switch (componentName) {
    case "button": return generateWithValidation(request, validateButtonConfig);
    case 'icon-button': return generateWithValidation(request, validateIconButtonConfig);
    case 'accordion': return generateWithValidation(request, validateAccordionConfig);
    case 'input': return generateWithValidation(request, validateInputConfig);
    case 'select': return generateWithValidation(request, validateSelectConfig);
    case 'radio': return generateWithValidation(request, validateRadioConfig);
    case 'card': return generateWithValidation(request, validateCardConfig);
    case 'modal': return generateWithValidation(request, validateModalConfig);
    case 'tabs': return generateWithValidation(request, validateTabsConfig);
    case 'progress': return generateWithValidation(request, validateProgressConfig);
    default:
      return { success: false, error: `Component "${componentName}" is not supported` };
  }
}

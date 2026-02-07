import { getButtonConfigSchemaDescription } from "../validators/buttonConfigValidator.js";
import { getIconButtonConfigSchemaDescription } from "../validators/iconButtonConfigValidator.js";
import { getAccordionConfigSchemaDescription } from "../validators/accordionConfigValidator.js";
import { getInputConfigSchemaDescription } from "../validators/inputConfigValidator.js";
import { getSelectConfigSchemaDescription } from "../validators/selectConfigValidator.js";
import { getRadioConfigSchemaDescription } from "../validators/radioConfigValidator.js";
import { getCardConfigSchemaDescription } from "../validators/cardConfigValidator.js";
import { getModalConfigSchemaDescription } from "../validators/modalConfigValidator.js";
import { getTabsConfigSchemaDescription } from "../validators/tabsConfigValidator.js";
import { getProgressConfigSchemaDescription } from "../validators/progressConfigValidator.js";

import { providerRegistry } from "../constants/providerRegistry.js";

export const promptBuilder = {
  getSystemPrompt(componentName: string, currentConfig: any, userPrompt: string): string {
    let schemaDescription = "";
    
    switch (componentName) {
      case "button": schemaDescription = getButtonConfigSchemaDescription(); break;
      case "icon-button": schemaDescription = getIconButtonConfigSchemaDescription(); break;
      case "accordion": schemaDescription = getAccordionConfigSchemaDescription(); break;
      case "input": schemaDescription = getInputConfigSchemaDescription(); break;
      case "select": schemaDescription = getSelectConfigSchemaDescription(); break;
      case "radio": schemaDescription = getRadioConfigSchemaDescription(); break;
      case "card": schemaDescription = getCardConfigSchemaDescription(); break;
      case "modal": schemaDescription = getModalConfigSchemaDescription(); break;
      case "tabs": schemaDescription = getTabsConfigSchemaDescription(); break;
      case "progress": schemaDescription = getProgressConfigSchemaDescription(); break;
    }

    return `You are a UI configuration generator. Your task is to modify the current ${componentName} configuration based on the user's request.

${schemaDescription}

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
  },

  getPlaygroundPrompt(userPrompt: string, prevCode: any, providers: string[]): string {
    const allowedComponentsText = providers.map(p => {
      const entry = providerRegistry[p];
      if (!entry) return '';
      return `- ${p.toUpperCase()}: ${entry.allowedComponents.join(', ')}`;
    }).filter(Boolean).join('\n');

    return `You are an expert React developer. Your task is to generate React component code for MULTIPLE UI libraries based on the user's request.
    
    USER REQUEST: "${userPrompt}"
    
    PROVIDERS TO GENERATE FOR:
    ${providers.join(', ')}
    
    CURRENT CODE STATE:
    ${typeof prevCode === 'string' ? prevCode : JSON.stringify(prevCode)}
    
    CORE INSTRUCTIONS:
    1. **FIRST RESEARCH**: Thoroughly research and analyze the requirements for the requested component. Brainstorm how it should be implemented across different UI libraries to ensure compatibility and visual consistency.
    2. **CHAKRA UI V2**:
       - The sandbox is using Chakra UI v2.
       - Use components directly as per v2 syntax.
       - **EXAMPLE (Tabs)**:
         \`\`\`jsx
         <Tabs>
           <TabList>
             <Tab>Tab 1</Tab>
           </TabList>
           <TabPanels>
             <TabPanel>Content 1</TabPanel>
           </TabPanels>
         </Tabs>
         \`\`\`
    3. **MUI IMPORTS (CRITICAL)**:
       - **NEVER** use sub-path imports like \`import Box from '@mui/material/Box'\`
       - **ALWAYS** use root-level named imports: \`import { Box, Button, Card } from '@mui/material'\`
       - Example: \`import { Box, Typography, Button, Card, CardContent } from '@mui/material';\`
    4. **IMPORTS**: You MUST include all necessary import statements in your code. 
       - Import from "${providers.map(p => providerRegistry[p]?.importPath).filter(Boolean).join('", "')}" as appropriate.
       - Always include: import React from 'react';
       - For icons, import from 'lucide-react'.
    5. **COMPONENT RESTRICTION**: For EACH provider, you can ONLY use the components listed in the "ALLOWED COMPONENTS" section below. Using any other component from these libraries will cause a build failure.
    6. **CODE STRUCTURE**: Each output must be a standalone "default export" functional component: export default () => { ... }.
    7. **VALIDATION**: Ensure the generated code is valid React/JSX and follows the specific syntax/patterns of the respective UI library.
    8. **COMMENTS**: Never use any comments in the generated code.
    
    ALLOWED COMPONENTS PER PROVIDER:
    ${allowedComponentsText}
    
    OUTPUT FORMAT:
    Return a SINGLE JSON object where keys are the provider IDs (matching those above) and values are the code strings. No markdown, no triple backticks, no explanations.
    
    Example Output Format:
    {
      "mui": "export default () => ( <Box><Button>Hello</Button></Box> )",
      "chakra": "export default () => ( <Box><Button>Hello</Button></Box> )"
    }
    
    Generate the JSON now:`;
  }
};

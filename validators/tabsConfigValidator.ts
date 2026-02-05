import { z } from "zod";

const TabItemSchema = z.object({
  label: z.string().describe("Label of the tab"),
  value: z.string().describe("Unique value/id of the tab"),
  content: z.string().describe("Content to display when tab is active")
});

export const TabsConfigSchema = z.object({
  tabs: z.array(TabItemSchema).min(1).describe("List of tabs"),
  defaultValue: z.string().describe("Value of the initially active tab"),
  orientation: z.enum(['horizontal', 'vertical']).optional().describe("Orientation of the tabs"),
  variant: z.enum(['standard', 'enclosed', 'outline', 'soft', 'solid']).optional().describe("Visual variant (framework dependent)"),
  styles: z.object({
    activeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
      .describe("Color of the active tab text/indicator (#RRGGBB)"),
    inactiveColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
      .describe("Color of inactive tabs (#RRGGBB)"),
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
      .describe("Background color of the tab list container (#RRGGBB)"),
    borderRadius: z.number().min(0).max(50).optional()
      .describe("Border radius of the tab list or tabs"),
    padding: z.number().optional()
      .describe("Padding around tabs")
  }).optional()
});

export type TabsConfig = z.infer<typeof TabsConfigSchema>;

export function validateTabsConfig(config: any) {
  const result = TabsConfigSchema.safeParse(config);
  if (!result.success) {
    return {
      success: false,
      error: "Invalid configuration",
      details: result.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`)
    };
  }
  return {
    success: true,
    data: result.data
  };
}

export function getTabsConfigSchemaDescription(): string {
  return `
GENERATE A JSON OBJECT for a Tabs component configuration.
SCHEMA:
{
  "tabs": [
    { "label": "string", "value": "string", "content": "string" }
  ] (required, min 1),
  "defaultValue": "string (should match one of the tab values)",
  "orientation": "horizontal" | "vertical" (optional),
  "variant": "standard" | "enclosed" | "outline" | "soft" | "solid" (optional),
  "styles": {
    "activeColor": "hex string (#RRGGBB)",
    "inactiveColor": "hex string (#RRGGBB)",
    "backgroundColor": "hex string (#RRGGBB)",
    "borderRadius": "number",
    "padding": "number"
  }
}
`;
}

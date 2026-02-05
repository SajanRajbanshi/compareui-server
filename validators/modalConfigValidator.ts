import { z } from "zod";

export const ModalConfigSchema = z.object({
  title: z.string().describe("The title of the modal"),
  content: z.string().describe("The content/body text of the modal"),
  styles: z.object({
    borderRadius: z.number().min(0).max(50).optional()
      .describe("Border radius in pixels (0-50)"),
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
      .describe("Background color of the modal content in hex format (#RRGGBB)"),
    titleColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
      .describe("Color of the modal title in hex format (#RRGGBB)"),
    textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
      .describe("Color of the modal content text in hex format (#RRGGBB)"),
    overlayColor: z.string().optional()
      .describe("Color of the overlay/backdrop (optional)"),
  }).optional()
});

export type ModalConfig = z.infer<typeof ModalConfigSchema>;

export function validateModalConfig(config: any) {
  const result = ModalConfigSchema.safeParse(config);
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

export function getModalConfigSchemaDescription(): string {
  return `
GENERATE A JSON OBJECT for a Modal component configuration.
SCHEMA:
{
  "title": "string (required)",
  "content": "string (required)",
  "styles": {
    "borderRadius": "number (0-50, optional)",
    "backgroundColor": "hex string (#RRGGBB, optional)",
    "titleColor": "hex string (#RRGGBB, optional)",
    "textColor": "hex string (#RRGGBB, optional)",
    "overlayColor": "string (optional)"
  }
}
`;
}

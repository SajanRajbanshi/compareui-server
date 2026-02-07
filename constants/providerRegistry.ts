export interface ProviderRegistryEntry {
  id: string;
  importPath: string;
  allowedComponents: string[];
}

export const providerRegistry: Record<string, ProviderRegistryEntry> = {
  mui: {
    id: 'mui',
    importPath: '@mui/material',
    allowedComponents: ['Box', 'Typography', 'Button', 'Stack', 'Paper', 'Grid', 'Card', 'CardContent', 'CircularProgress', 'IconButton', 'TextField', 'Switch', 'Checkbox', 'Select', 'MenuItem', 'Slider', 'Alert', 'Avatar', 'Tooltip']
  },
  chakra: {
    id: 'chakra',
    importPath: '@chakra-ui/react',
    allowedComponents: ['Box', 'Text', 'Button', 'Stack', 'VStack', 'HStack', 'Heading', 'Card', 'CardHeader', 'CardBody', 'CardFooter', 'CircularProgress', 'IconButton', 'Input', 'Switch', 'Checkbox', 'Select', 'Slider', 'Alert', 'AlertIcon', 'AlertTitle', 'AlertDescription', 'Avatar', 'Tooltip', 'Tabs', 'TabList', 'TabPanels', 'Tab', 'TabPanel', 'Modal', 'ModalOverlay', 'ModalContent', 'ModalHeader', 'ModalFooter', 'ModalBody', 'ModalCloseButton']
  },
  antd: {
    id: 'antd',
    importPath: 'antd',
    allowedComponents: ['Button', 'Divider', 'Typography', 'Space', 'Card', 'Progress', 'Flex', 'Input', 'Switch', 'Checkbox', 'Select', 'Slider', 'Alert', 'Avatar', 'Tooltip', 'Tabs', 'Modal']
  },
  shadcn: {
    id: 'shadcn',
    importPath: '@/components/ui',
    allowedComponents: ['Card', 'CardHeader', 'CardTitle', 'CardContent', 'Button', 'Input', 'Slider', 'Accordion', 'AccordionItem', 'AccordionTrigger', 'AccordionContent', 'Tabs', 'TabsList', 'TabsTrigger', 'TabsContent', 'Dialog', 'DialogContent', 'DialogHeader', 'DialogTitle', 'DialogTrigger', 'Select', 'SelectTrigger', 'SelectValue', 'SelectContent', 'SelectItem', 'RadioGroup', 'RadioGroupItem', 'Switch', 'Checkbox', 'Avatar', 'AvatarImage', 'AvatarFallback', 'Tooltip', 'TooltipProvider', 'TooltipTrigger', 'TooltipContent', 'Alert', 'AlertTitle', 'AlertDescription', 'Label', 'Separator', 'Badge']
  }
};

import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  theme: {
    semanticTokens: {
      colors: {
        'header-bar': {
          bg: {
            value: { base: '{colors.gray.100}', _dark: '{colors.gray.900}' },
          },
          fg: {
            value: { base: '{colors.gray.700}', _dark: '{colors.gray.300}' },
          },
        },
      },
    },
  },
});

const theme = createSystem(defaultConfig, config);

export default theme;

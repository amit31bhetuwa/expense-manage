
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.48fa7e36b49849dca2916d7751ffe898',
  appName: 'pocket-wise-manage',
  webDir: 'dist',
  server: {
    url: 'https://48fa7e36-b498-49dc-a291-6d7751ffe898.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  // Add Android-specific configuration
  android: {
    buildOptions: {
      keystorePath: null,
      keystoreAlias: null,
      keystorePassword: null,
      keystoreAliasPassword: null
    }
  }
};

export default config;

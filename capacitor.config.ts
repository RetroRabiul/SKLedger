import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.skledger.app',
  appName: 'SKLedger',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;

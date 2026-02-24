import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.candra.monitoring',
  appName: 'Candra Monitoring',
  webDir: 'dist-monitoring',
  server: {
    androidScheme: 'https'
  }
};

export default config;

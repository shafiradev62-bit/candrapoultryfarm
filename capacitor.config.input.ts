import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.candra.input',
  appName: 'Candra Input Data',
  webDir: 'dist-input',
  server: {
    androidScheme: 'https'
  }
};

export default config;

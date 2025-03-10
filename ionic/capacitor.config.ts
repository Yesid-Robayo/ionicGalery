import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'photoGallery',
  webDir: 'www',
  server:{
    url: "http://10.0.2.2:3000",
    cleartext: true
  }
};

export default config;

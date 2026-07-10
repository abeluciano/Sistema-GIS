import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.jlbr.reportes",
  appName: "Sistema GIS Ciudadano",
  webDir: "dist",
  server: {
    androidScheme: "https"
  },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"]
    }
  }
};

export default config;

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// import { componentTagger } from "lovable-tagger"; for now  the following code 6 to 12 work this instead fo this
//------------------
import { componentTagger } from '@nuxie/tagger';
export default defineConfig({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
});
//---------
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

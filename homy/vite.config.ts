import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import fs from 'fs'
import path from 'path'

// #region agent log
const tailwindConfigPath = path.resolve(__dirname, 'tailwind.config.js');
const postcssConfigPath = path.resolve(__dirname, 'postcss.config.js');
const tailwindConfigExists = fs.existsSync(tailwindConfigPath);
const postcssConfigExists = fs.existsSync(postcssConfigPath);
let tailwindConfigContent = '';
let postcssConfigContent = '';
if (tailwindConfigExists) {
  tailwindConfigContent = fs.readFileSync(tailwindConfigPath, 'utf-8');
}
if (postcssConfigExists) {
  postcssConfigContent = fs.readFileSync(postcssConfigPath, 'utf-8');
}

const debugPlugin = (): Plugin => {
  return {
    name: 'tailwind-debug',
    buildStart() {
      const logPath = path.resolve(__dirname, '../.cursor/debug.log');
      const logEntry = JSON.stringify({
        location: 'vite.config.ts:35',
        message: 'Vite config PostCSS setup',
        data: {
          tailwindConfigExists,
          postcssConfigExists,
          tailwindInViteConfig: true,
          autoprefixerInViteConfig: true,
          hasPostcssConfigFile: postcssConfigExists,
          tailwindConfigHasPrefix: tailwindConfigContent.includes('prefix'),
          tailwindConfigContentPaths: tailwindConfigContent.match(/content:\s*\[([^\]]+)\]/s)?.[1] || 'not found'
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'B'
      }) + '\n';
      fs.appendFileSync(logPath, logEntry);
    }
  };
};
// #endregion

export default defineConfig({
  plugins: [
    react({
      plugins: [
        ['@swc/plugin-styled-jsx', {}]
      ]
    }),
    // #region agent log
    debugPlugin(),
    // #endregion
  ],
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
})
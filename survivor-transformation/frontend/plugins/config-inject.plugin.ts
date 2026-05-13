import fs from 'fs';
import path from 'path';

import fse from 'fs-extra';
import { PluginOption } from 'vite';

/**
 * Recursively finds all JSON files in a directory.
 */
function findJsonFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) {
    return fileList;
  }

  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findJsonFiles(filePath, fileList);
    } else if (file.endsWith('.json')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Vite plugin that injects operator configs into the HTML.
 * 
 * Scans `operator/configs/` directory recursively for `.json` files,
 * parses them, and injects them as `window.APP_OPERATOR_CONFIGS` object
 * into the HTML head.
 * 
 * Example:
 * - File: operator/configs/app_config.json
 * - Result: window.APP_OPERATOR_CONFIGS = { app_config: { ... } }
 */
export default function ConfigInjectPlugin(): PluginOption {
  return {
    name: 'survivor:config-inject',
    transformIndexHtml(html) {
      const configsDir = path.join(process.cwd(), 'operator/configs');
      const operatorConfigs: Record<string, unknown> = {};

      // Check if configs directory exists
      if (!fse.pathExistsSync(configsDir)) {
        return html;
      }

      // Recursively find all JSON files
      const jsonFiles = findJsonFiles(configsDir);

      // Parse each JSON file and use filename as key
      jsonFiles.forEach((filePath) => {
        try {
          const content = fse.readJsonSync(filePath);
          const fileName = path.parse(filePath).name; // filename without extension
          operatorConfigs[fileName] = content;
        } catch (error) {
          // Log error but don't fail the build
          console.warn(`[survivor:config-inject] Failed to parse config file: ${filePath}`, error);
        }
      });

      // Inject configs if any were found
      if (Object.keys(operatorConfigs).length > 0) {
        // Use JSON.stringify with proper escaping for script injection
        const script = `<script>window.APP_OPERATOR_CONFIGS = ${JSON.stringify(operatorConfigs)};</script>`;
        html = html.replace('</head>', `${script}\n</head>`);
      }

      return html;
    },
  };
}

import fs from 'fs';
import path from 'path';

import fse from 'fs-extra';
import { PluginOption } from 'vite';

/**
 * Vite plugin that injects operator CSS overrides into the HTML.
 * 
 * Reads `operator/styles/global/overrides.css` and injects it as an inline
 * style tag in the HTML head. This allows operators to override any CSS
 * without modifying source code.
 * 
 * The CSS is injected before the closing </head> tag, ensuring it has
 * high specificity and can override default styles.
 */
export default function CssOverridePlugin(): PluginOption {
  return {
    name: 'survivor:css-override',
    transformIndexHtml(html) {
      const cssPath = path.join(process.cwd(), 'operator/styles/global/overrides.css');
      let cssOverride = '';

      // Check if override file exists
      if (fse.pathExistsSync(cssPath)) {
        try {
          cssOverride = fs.readFileSync(cssPath, 'utf-8');
        } catch (error) {
          // Log error but don't fail the build
          console.warn(`[survivor:css-override] Failed to read CSS override file: ${cssPath}`, error);
        }
      }

      // Inject CSS before closing </head> tag
      if (cssOverride.trim()) {
        const styleTag = `<style data-id="operatorCssOverride">\n${cssOverride}\n</style>`;
        html = html.replace('</body>', `${styleTag}\n</body>`);
      }

      return html;
    },
  };
}

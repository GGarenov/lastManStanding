import path from "node:path";

import { normalizePath } from "vite";

const APP_NAME = "survivor_fe";

const generateClassname = (
  appName: string,
  fileName: string | null,
  localName: string
) => `${appName}_${fileName ?? "unknown"}_${localName}`;

function getFileName(filePath: string): string | null {
  try {
    const match = /([\w-]+)(?:\.(module))?\.(?:less|css)/.exec(filePath);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Custom CSS Modules scoped name for readable class names in devtools.
 * Produces names like: survivor_fe_Home_highlightContent, survivor_fe_Card_card
 */
export function getViteScopedName(
  name: string,
  filename: string,
  _css: string
): string {
  const context = process.cwd();
  const resourcePath = path.resolve(filename);
  const relativePath = normalizePath(path.relative(context, resourcePath));
  const fileName = getFileName(relativePath);
  return generateClassname(APP_NAME, fileName, name);
}

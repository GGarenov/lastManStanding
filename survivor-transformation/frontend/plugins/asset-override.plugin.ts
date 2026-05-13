import path from 'node:path';

import fse from 'fs-extra';
import { createFilter, normalizePath, PluginOption, ResolvedConfig } from 'vite';

const IMAGE_EXTENSIONS = ['.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp'];

/**
 * Vite plugin that intercepts asset imports and replaces them with operator overrides
 * if they exist in the operator/assets_override directory.
 * 
 * Example:
 * - Source: src/assets/images/logo.svg
 * - Override: operator/assets_override/default-operator/images/logo.svg
 * 
 * The override will be used automatically if it exists.
 * Supports cross-format overrides: a .png file can override a .svg import, etc.
 */
export default function AssetOverridePlugin(): PluginOption {
  const filter = createFilter('**/src/assets/**/*.{svg,png,jpg,jpeg,gif,webp}*');
  let config: ResolvedConfig;
  
  return {
    name: 'survivor:asset-override',
    enforce: 'pre',
    configResolved(_config) {
      config = _config;
    },
    async resolveId(id, importer) {
      const importerPath = importer ? path.dirname(importer) : config.root;
      const resolvedId = path.isAbsolute(id) ? id : path.resolve(importerPath, id);
      const normalizedId = normalizePath(resolvedId);

      if (!filter(normalizedId)) {
        return null;
      }

      const assetsIndex = normalizedId.indexOf('src/assets');
      if (assetsIndex === -1) {
        return null;
      }

      const strippedPath = normalizedId.substring(assetsIndex + 'src/assets'.length);
      const ext = path.extname(strippedPath);
      const basePath = strippedPath.slice(0, -ext.length);

      const overrideDirs = [
        normalizePath(path.join(config.root, 'operator/assets_override')),
        normalizePath(path.join(config.root, 'operator/assets_override/default-operator')),
      ];

      for (const dir of overrideDirs) {
        // Exact extension match first, then try alternative extensions
        const extsToTry = [ext, ...IMAGE_EXTENSIONS.filter(e => e !== ext)];
        for (const tryExt of extsToTry) {
          const candidate = normalizePath(path.join(dir, basePath + tryExt));
          if (await fse.pathExists(candidate)) {
            config.logger.info(`[survivor:asset-override] Overriding asset: ${normalizedId} with ${candidate}`);
            return candidate;
          }
        }
      }

      return null;
    },
  };
}

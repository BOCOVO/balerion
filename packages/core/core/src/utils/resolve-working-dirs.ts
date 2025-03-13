import path from 'node:path';

/**
 * Resolve the working directories based on the instance options.
 *
 * Behavior:
 * - `appDir` is the directory where Balerion will write every file (schemas, generated APIs, controllers or services)
 * - `distDir` is the directory where Balerion will read configurations, schemas and any compiled code
 *
 * Default values:
 * - If `appDir` is `undefined`, it'll be set to `process.cwd()`
 * - If `distDir` is `undefined`, it'll be set to `appDir`
 */
export const resolveWorkingDirectories = (opts: { appDir?: string; distDir?: string }) => {
  const cwd = process.cwd();

  const appDir = opts.appDir ? path.resolve(cwd, opts.appDir) : cwd;
  const distDir = opts.distDir ? path.resolve(cwd, opts.distDir) : appDir;

  return { appDir, distDir };
};

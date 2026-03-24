/**
 * Build Verification Test
 * Verify production build completes and outputs expected artifacts.
 */

import { spawnSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

describe('Build System', () => {
  const projectRoot = join(__dirname, '..');
  const webpackCli = join(projectRoot, 'node_modules', 'webpack-cli', 'bin', 'cli.js');
  const webpackConfig = join(projectRoot, 'bundler', 'webpack.prod.js');

  test('生产构建成功完成', () => {
    const result = spawnSync(process.execPath, [webpackCli, '--config', webpackConfig], {
      cwd: projectRoot,
      stdio: 'pipe',
      timeout: 300000, // 5 minutes timeout
    });

    expect(result.status).toBe(0);

    // Verify build output exists
    const publicDir = join(projectRoot, 'public');
    expect(existsSync(publicDir)).toBe(true);
  });

  test('构建产物包含 index.html', () => {
    const indexPath = join(projectRoot, 'public', 'index.html');
    expect(existsSync(indexPath)).toBe(true);
  });

  test('构建产物包含 JS bundle', () => {
    const publicDir = join(projectRoot, 'public');
    const files = readdirSync(publicDir);
    const jsFiles = files.filter(f => f.endsWith('.js'));
    expect(jsFiles.length).toBeGreaterThan(0);
  });
});

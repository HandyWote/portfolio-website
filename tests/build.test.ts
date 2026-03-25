/**
 * Build Verification Test
 * Verify production build completes and outputs expected artifacts.
 */

import { spawnSync } from 'child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

describe('Build System', () => {
  const projectRoot = join(__dirname, '..');
  const viteCli = join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js');
  const publicDir = join(projectRoot, 'public');
  const assetsDir = join(publicDir, 'assets');

  test('Vite 生产构建成功完成', () => {
    const result = spawnSync(process.execPath, [viteCli, 'build'], {
      cwd: projectRoot,
      stdio: 'pipe',
      timeout: 300000, // 5 minutes timeout
    });

    expect(result.status).toBe(0);

    // Verify build output exists
    expect(existsSync(publicDir)).toBe(true);
  });

  test('构建产物包含 index.html', () => {
    const indexPath = join(publicDir, 'index.html');
    expect(existsSync(indexPath)).toBe(true);
  });

  test('构建产物包含 JS bundle', () => {
    const rootFiles = readdirSync(publicDir);
    const rootJsFiles = rootFiles.filter(f => f.endsWith('.js'));
    const assetJsFiles = existsSync(assetsDir)
      ? readdirSync(assetsDir).filter(f => f.endsWith('.js'))
      : [];
    const jsFiles = [...rootJsFiles, ...assetJsFiles];
    expect(jsFiles.length).toBeGreaterThan(0);
  });

  test('构建产物契约满足发布目录结构', () => {
    const hasIndexHtml = existsSync(join(publicDir, 'index.html'));
    const rootJsFiles = readdirSync(publicDir).filter(entry => entry.endsWith('.js'));
    const assetJsFiles = existsSync(assetsDir)
      ? readdirSync(assetsDir).filter(entry => entry.endsWith('.js'))
      : [];
    const hasJsBundle = [...rootJsFiles, ...assetJsFiles].length > 0;
    const expectedStaticDirs = ['models', 'images', 'draco'];

    expect(hasIndexHtml).toBe(true);
    expect(hasJsBundle).toBe(true);

    expectedStaticDirs.forEach(dirName => {
      const dirPath = join(publicDir, dirName);
      expect(existsSync(dirPath)).toBe(true);
      expect(statSync(dirPath).isDirectory()).toBe(true);
    });
  });

  test('默认脚本已切换到 Vite 且不保留 Webpack 回退脚本', () => {
    const pkg = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'));
    expect(pkg.scripts.build).toContain('vite build');
    expect(pkg.scripts.dev).toBe('vite');
    expect(pkg.scripts['webpack:build']).toBeUndefined();
    expect(pkg.scripts['webpack:dev']).toBeUndefined();
  });
});

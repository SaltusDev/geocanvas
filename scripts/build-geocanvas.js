import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { minify } from 'terser';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(scriptDir, '..');
const inputPath = path.join(packageDir, 'src', 'geocanvas.js');
const outputDir = path.join(packageDir, 'dist');
const outputPath = path.join(outputDir, 'geocanvas.min.js');

const source = await readFile(inputPath, 'utf8');
const result = await minify(source, {
  module: true,
  compress: true,
  mangle: true,
  format: {
    comments: false
  }
});

if (!result.code) {
  throw new Error('Build failed: terser returned no output.');
}

await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, `${result.code}\n`, 'utf8');

console.log(`Built ${path.relative(packageDir, outputPath)}`);

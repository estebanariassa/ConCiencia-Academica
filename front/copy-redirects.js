import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';

const redirectsPath = join(process.cwd(), 'public', '_redirects');
const distPath = join(process.cwd(), 'dist', '_redirects');

if (existsSync(redirectsPath)) {
  copyFileSync(redirectsPath, distPath);
  console.log('✅ _redirects copiado a dist/');
} else {
  console.log('⚠️  _redirects no encontrado en public/');
}


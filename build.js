import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(dirname, 'src');
const STATIC_DIR = path.resolve(dirname, 'static');
const DIST_DIR = path.resolve(dirname, 'dist');

const API_HOST_VALUE = process.env.API_HOST_VALUE;

if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true });

try {
    // 1 Build injector.js
    await esbuild.build({
        entryPoints: [path.join(SRC_DIR, 'injector.js')],
        bundle: true,
        outfile: path.join(DIST_DIR, 'injector.js'),
        minify: true,
        sourcemap: true,
        target: ['chrome110'],
        define: {
            'API_HOST': JSON.stringify(API_HOST_VALUE)
        }
    });
    console.log('[build] injector.js built');

    // 2 Build popup.js
    await esbuild.build({
        entryPoints: [path.join(SRC_DIR, 'popup.js')],
        bundle: true,
        outfile: path.join(DIST_DIR, 'popup.js'),
        minify: true,
        sourcemap: true,
        target: ['chrome110'],
        define: {
            'API_HOST': JSON.stringify(API_HOST_VALUE)
        }
    });
    console.log('[build] popup.js built');

    // 3 Copy files
    const filesToCopy = [
        'manifest.json',
        'styles.css',
        'popup.html',
        'page.html'
    ];

    filesToCopy.forEach(file => {
        fs.copyFileSync(path.join(SRC_DIR, file), path.join(DIST_DIR, file));
        console.log(`[build] ${file} copied`);
    });

    // 4 Copy icons
    const iconsSrc = path.join(STATIC_DIR, 'icons');
    const iconsDest = path.join(DIST_DIR, 'icons');
    fs.cpSync(iconsSrc, iconsDest, { recursive: true });
    console.log('[build] icons folder copied');

    console.log('[build] complete');
} catch (err) {
    console.error('[build] error:', err);
    process.exit(1);
}

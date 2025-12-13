import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(dirname, 'src');
const DIST_DIR = path.resolve(dirname, 'dist');

const API_HOST_VALUE = process.env.API_HOST_VALUE;

if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true });

try {
    // 1 Build injector.js
    await esbuild.build({
        entryPoints: [path.join(SRC_DIR, 'injector.js')],
        bundle: true,
        outfile: path.join(DIST_DIR, 'injector.js'),
        minify: false,
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
        minify: false,
        sourcemap: true,
        target: ['chrome110'],
        define: {
            'API_HOST': JSON.stringify(API_HOST_VALUE)
        }
    });
    console.log('[build] popup.js built');

    // 3 Copy manifest.json
    fs.copyFileSync(path.join(SRC_DIR, 'manifest.json'), path.join(DIST_DIR, 'manifest.json'));
    console.log('[build] manifest.json copied');

    // 4 Copy styles.css
    fs.copyFileSync(path.join(SRC_DIR, 'styles.css'), path.join(DIST_DIR, 'styles.css'));
    console.log('[build] styles.css copied');

    // 5 Copy popup.html
    fs.copyFileSync(path.join(SRC_DIR, 'popup.html'), path.join(DIST_DIR, 'popup.html'));
    console.log('[build] popup.html copied');

    // 6 Copy icons
    const iconsSrc = path.join(SRC_DIR, 'icons');
    const iconsDest = path.join(DIST_DIR, 'icons');
    fs.cpSync(iconsSrc, iconsDest, { recursive: true });
    console.log('[build] icons folder copied');

    console.log('[build] complete');
} catch (err) {
    console.error('[build] error:', err);
    process.exit(1);
}

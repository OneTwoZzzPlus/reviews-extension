import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(dirname, 'src');
const STATIC_DIR = path.resolve(dirname, 'static');
const PAGE_DIR = path.resolve(dirname, 'page');

const API_HOST_VALUE = process.env.API_HOST_VALUE;

if (!fs.existsSync(PAGE_DIR)) fs.mkdirSync(PAGE_DIR, { recursive: true });

try {
    // 1 Build page.js
    await esbuild.build({
        entryPoints: [path.join(SRC_DIR, 'page.js')],
        bundle: true,
        outfile: path.join(PAGE_DIR, 'page.js'),
        minify: true,
        sourcemap: true,
        target: ['chrome110'],
        define: {
            'API_HOST': JSON.stringify(API_HOST_VALUE)
        }
    });
    console.log('[build-page] page.js built');

    // 2 Copy page to index
    fs.copyFileSync(
        path.join(SRC_DIR, "page.html"),
        path.join(PAGE_DIR, "index.html")
    );

    console.log(`[build-page] page.html copied as index.html`);


    // 3 Copy files
    const filesToCopyPages = [
        'styles.css',
    ];

    filesToCopyPages.forEach(file => {
        fs.copyFileSync(path.join(SRC_DIR, file), path.join(PAGE_DIR, file));
        console.log(`[build-page] ${file} copied`);
    });

    // 4 Copy favicon
    fs.copyFileSync(
        path.join(STATIC_DIR, "favicon.ico"),
        path.join(PAGE_DIR, "favicon.ico")
    );

    console.log('[build-page] complete');
} catch (err) {
    console.error('[build-page] error:', err);
    process.exit(1);
}

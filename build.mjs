// Crea dist/index.html: la stessa pagina, ma con il codice del gioco offuscato.
// Uso:  npm install  &&  npm run build   → carica dist/index.html (o lo zip) su itch.io
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import JavaScriptObfuscator from 'javascript-obfuscator';

const src = readFileSync('index.html', 'utf8');
const OPEN = '<script type="module">', CLOSE = '</script>';
const a = src.indexOf(OPEN), b = src.lastIndexOf(CLOSE);
if (a < 0 || b < a) throw new Error('script del gioco non trovato');
const code = src.slice(a + OPEN.length, b);

const out = JavaScriptObfuscator.obfuscate(code, {
  target: 'browser',
  compact: true,
  identifierNamesGenerator: 'hexadecimal',
  renameGlobals: false,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 1,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  splitStrings: true,
  splitStringsChunkLength: 8,
  transformObjectKeys: false,
  controlFlowFlattening: false, // il gioco gira ogni frame: lasciamolo veloce
  deadCodeInjection: false,
  selfDefending: false,
  debugProtection: false,
  disableConsoleOutput: true,
  unicodeEscapeSequence: false
}).getObfuscatedCode();

const html = src.slice(0, a + OPEN.length) + '\n' + out + '\n' + src.slice(b)
  .replace(/\n\s*\n/g, '\n');
mkdirSync('dist', { recursive: true });
writeFileSync('dist/index.html', html);
mkdirSync('dist/icons', { recursive: true });
for (const f of ['manifest.webmanifest', 'icon.svg', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png']) copyFileSync(f, 'dist/' + f);
console.log('dist/index.html creato (' + Math.round(html.length / 1024) + ' KB)');

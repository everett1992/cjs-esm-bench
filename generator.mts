import fs from 'fs/promises';
import { join } from 'path';
import { EOL } from 'os';

const DEPTH = parseInt(process.argv[2]);
const WIDTH = parseInt(process.argv[3]);
const FILES = new Array(WIDTH).fill(0).map((_, idx) => idx.toString(16));
const BASE = `bench-${DEPTH}x${WIDTH}`;

console.log(`generating ${BASE}`)
await Promise.all([
  generate('mjs'),
  generate('cjs'),
])

async function generate(ext: Ext, depth=DEPTH, path=BASE): Promise<void> {
  await fs.mkdir(path, {recursive: true})
  if (depth === 1) return await writeLeaf(ext, path);

  await Promise.all([
    fs.writeFile(join(path, `index.${ext}`), load(ext)),
    FILES.map(f => generate(ext, depth-1, join(path, f))),
  ])
}

function load(ext: Ext): string {
  return FILES.map(f => ext === 'mjs'
    ? `import './${f}/index.${ext}';`
    : `require('./${f}/index.${ext}')`)
  .join(EOL) + EOL;
}

async function writeLeaf(ext: Ext, path: string) {
  return await fs.writeFile(join(path, `index.${ext}`), '/* leaf */')
}

type Ext = 'mjs' | 'cjs'

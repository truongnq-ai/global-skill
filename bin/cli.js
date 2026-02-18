#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkgRoot = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const cmd = args[0];

const help = () => {
  console.log(`global-skill CLI\n\nUsage:\n  global-skill init      # create skills/ + docs/ + examples/ in current project\n  global-skill install   # copy global-skill kit into current project\n`);
};

const copyDir = (src, dest) => {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
};

const run = () => {
  const cwd = process.cwd();
  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') return help();

  if (cmd === 'init' || cmd === 'install') {
    const dirs = ['skills', 'docs', 'examples'];
    for (const dir of dirs) {
      copyDir(path.join(pkgRoot, dir), path.join(cwd, dir));
    }
    // copy top-level docs
    for (const f of ['README.md', 'VERSION', 'CHANGELOG.md']) {
      fs.copyFileSync(path.join(pkgRoot, f), path.join(cwd, f));
    }
    console.log('global-skill: done');
    return;
  }

  help();
};

run();

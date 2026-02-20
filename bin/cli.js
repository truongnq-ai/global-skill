#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkgRoot = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const cmd = args[0];

const VERSION = fs.readFileSync(path.join(pkgRoot, 'VERSION'), 'utf8').trim();

const help = () => {
  console.log(`
global-skill CLI v${VERSION}

Usage:
  global-skill init      Tạo skeleton skills/ docs/ examples/ trong project mới
                         (chỉ tạo file chưa tồn tại, không overwrite)
  global-skill install   Copy và overwrite toàn bộ bộ skill vào project hiện tại
                         (dùng khi cần cập nhật lên phiên bản mới)
  global-skill --version Xem phiên bản
  global-skill help      Hiển thị trợ giúp này
`);
};

/**
 * Copy thư mục src → dest.
 * @param {boolean} overwrite - true: ghi đè file đã tồn tại, false: bỏ qua
 */
const copyDir = (src, dest, overwrite) => {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d, overwrite);
    } else {
      if (!overwrite && fs.existsSync(d)) {
        // skip — file đã tồn tại và không được phép overwrite
        continue;
      }
      fs.copyFileSync(s, d);
    }
  }
};

const run = () => {
  const cwd = process.cwd();

  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    return help();
  }

  if (cmd === '--version' || cmd === '-v') {
    console.log(`global-skill v${VERSION}`);
    return;
  }

  if (cmd === 'init') {
    // Chỉ tạo file chưa tồn tại — không overwrite
    const dirs = ['skills', 'docs', 'examples'];
    for (const dir of dirs) {
      copyDir(path.join(pkgRoot, dir), path.join(cwd, dir), false);
    }
    console.log('global-skill init: done (existing files were not overwritten)');
    console.log('Tip: Run "global-skill install" to overwrite with latest version.');
    return;
  }

  if (cmd === 'install') {
    // Copy toàn bộ, overwrite file đã có
    const dirs = ['skills', 'docs', 'examples'];
    for (const dir of dirs) {
      copyDir(path.join(pkgRoot, dir), path.join(cwd, dir), true);
    }
    console.log('global-skill install: done (existing files were overwritten)');
    console.log('Note: Run "git diff" to review what changed.');
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  help();
};

run();

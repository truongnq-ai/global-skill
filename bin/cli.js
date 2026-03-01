#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkgRoot = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const cmd = args.find(a => !a.startsWith('-'));
const flags = args.filter(a => a.startsWith('-'));

const VERSION = fs.readFileSync(path.join(pkgRoot, 'VERSION'), 'utf8').trim();

// --- Flag parsing ---
const hasFlag = (name) => flags.includes(`--${name}`) || flags.includes(`-${name[0]}`);
const getFlagValue = (name) => {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return null;
  return args[idx + 1] || null;
};

const dryRun = hasFlag('dry-run');
const targetOverride = getFlagValue('target');

// Default: skills → .agent/skills/, docs + examples → root
const DEFAULT_SKILL_TARGET = path.join('.agent', 'skills');

const help = () => {
  console.log(`
global-skill CLI v${VERSION}

Usage:
  global-skill init [options]       Scaffold skills + docs + examples trong project mới
                                    (chỉ tạo file chưa tồn tại, không overwrite)
  global-skill install [options]    Copy và overwrite toàn bộ bộ skill vào project hiện tại
                                    (dùng khi cần cập nhật lên phiên bản mới)
  global-skill update [options]     Alias cho install
  global-skill --version            Xem phiên bản
  global-skill help                 Hiển thị trợ giúp này

Options:
  --target <path>     Thư mục đích cho skills (mặc định: ${DEFAULT_SKILL_TARGET})
  --dry-run           Chỉ hiển thị danh sách file sẽ được tạo/ghi, không thực thi

Output structure:
  your-project/
  ├── ${DEFAULT_SKILL_TARGET}/    ← skills cho AI agent (auto-detected bởi IDE)
  ├── docs/                       ← documentation cho owner
  └── examples/                   ← prompt mẫu cho owner
`);
};

/**
 * Count files in a directory recursively.
 */
const countFiles = (dir) => {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      count += countFiles(path.join(dir, entry.name));
    } else {
      count++;
    }
  }
  return count;
};

/**
 * List files in a directory recursively (relative paths).
 */
const listFiles = (dir, base = dir) => {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(full, base));
    } else {
      files.push(path.relative(base, full));
    }
  }
  return files;
};

/**
 * Copy thư mục src → dest.
 * @param {string} src - source directory
 * @param {string} dest - destination directory
 * @param {boolean} overwrite - true: ghi đè file đã tồn tại, false: bỏ qua
 * @param {boolean} isDryRun - true: chỉ in, không copy
 * @returns {{ created: number, skipped: number, overwritten: number }}
 */
const copyDir = (src, dest, overwrite, isDryRun = false) => {
  const stats = { created: 0, skipped: 0, overwritten: 0 };

  if (!isDryRun && !fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      const sub = copyDir(s, d, overwrite, isDryRun);
      stats.created += sub.created;
      stats.skipped += sub.skipped;
      stats.overwritten += sub.overwritten;
    } else {
      const exists = fs.existsSync(d);
      if (!overwrite && exists) {
        if (isDryRun) console.log(`  [SKIP]      ${d}`);
        stats.skipped++;
        continue;
      }

      if (isDryRun) {
        const action = exists ? '[OVERWRITE]' : '[CREATE]   ';
        console.log(`  ${action} ${d}`);
      } else {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        fs.copyFileSync(s, d);
      }

      if (exists) stats.overwritten++;
      else stats.created++;
    }
  }

  return stats;
};

/**
 * Print summary of copy operation.
 */
const printSummary = (label, stats) => {
  const parts = [];
  if (stats.created > 0) parts.push(`${stats.created} created`);
  if (stats.overwritten > 0) parts.push(`${stats.overwritten} overwritten`);
  if (stats.skipped > 0) parts.push(`${stats.skipped} skipped`);
  console.log(`  ${label}: ${parts.join(', ') || 'no changes'}`);
};

const run = () => {
  const cwd = process.cwd();

  // Version flags — check trước cmd vì chúng không phải command
  if (hasFlag('version') || flags.includes('-v')) {
    console.log(`global-skill v${VERSION}`);
    return;
  }

  if (!cmd || cmd === 'help') {
    return help();
  }

  if (cmd === 'init' || cmd === 'install' || cmd === 'update') {
    const overwrite = cmd === 'install' || cmd === 'update';
    const skillTarget = targetOverride || DEFAULT_SKILL_TARGET;
    const skillDest = path.join(cwd, skillTarget);
    const action = overwrite ? 'install' : 'init';

    if (dryRun) {
      console.log(`\n[DRY RUN] global-skill ${action} (no files will be modified)\n`);
    } else {
      console.log(`\nglobal-skill ${action} v${VERSION}\n`);
    }

    // Skills → .agent/skills/ (or custom target)
    console.log(`Skills → ${skillTarget}/`);
    const skillStats = copyDir(
      path.join(pkgRoot, 'skills'),
      skillDest,
      overwrite,
      dryRun
    );
    if (!dryRun) printSummary('skills', skillStats);

    // Docs → docs/ (root)
    console.log(`Docs   → docs/`);
    const docStats = copyDir(
      path.join(pkgRoot, 'docs'),
      path.join(cwd, 'docs'),
      overwrite,
      dryRun
    );
    if (!dryRun) printSummary('docs', docStats);

    // Examples → examples/ (root)
    console.log(`Examples → examples/`);
    const exStats = copyDir(
      path.join(pkgRoot, 'examples'),
      path.join(cwd, 'examples'),
      overwrite,
      dryRun
    );
    if (!dryRun) printSummary('examples', exStats);

    console.log('');

    if (dryRun) {
      console.log('No files were modified (--dry-run mode).');
      console.log('Remove --dry-run to execute.\n');
    } else if (overwrite) {
      console.log('Done. Run "git diff" to review what changed.');
      console.log(`Skills installed at: ${skillTarget}/\n`);
    } else {
      console.log('Done (existing files were not overwritten).');
      console.log(`Skills installed at: ${skillTarget}/`);
      console.log('Tip: Run "global-skill install" to overwrite with latest version.\n');
    }

    return;
  }

  console.error(`Unknown command: ${cmd}`);
  help();
  process.exit(1);
};

run();

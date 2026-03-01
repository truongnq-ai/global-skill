import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLI_PATH = path.resolve(__dirname, '..', 'bin', 'cli.js');
const PKG_ROOT = path.resolve(__dirname, '..');
const VERSION = fs.readFileSync(path.join(PKG_ROOT, 'VERSION'), 'utf8').trim();

/** Run CLI in given cwd and return stdout */
const runCli = (args, cwd) => {
    try {
        return execSync(`node "${CLI_PATH}" ${args}`, {
            cwd,
            encoding: 'utf8',
            timeout: 10000,
        });
    } catch (err) {
        return (err.stdout || '') + (err.stderr || '');
    }
};

/** Create a temp directory for testing */
const createTempDir = () => {
    const tmpDir = path.join(PKG_ROOT, '.test-tmp-' + Date.now());
    fs.mkdirSync(tmpDir, { recursive: true });
    return tmpDir;
};

/** Remove a directory recursively */
const removeTempDir = (dir) => {
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
    }
};

describe('CLI', () => {
    let tmpDir;

    beforeEach(() => {
        tmpDir = createTempDir();
    });

    afterEach(() => {
        removeTempDir(tmpDir);
    });

    // ─── help & version ───

    describe('help', () => {
        it('should display help with no arguments', () => {
            const out = runCli('', tmpDir);
            expect(out).toContain('global-skill CLI');
            expect(out).toContain('init');
            expect(out).toContain('install');
            expect(out).toContain('.agent');
        });

        it('should display help with "help" command', () => {
            const out = runCli('help', tmpDir);
            expect(out).toContain('global-skill CLI');
        });

        it('should display help with "--help" flag', () => {
            const out = runCli('--help', tmpDir);
            expect(out).toContain('global-skill CLI');
        });
    });

    describe('--version', () => {
        it('should display correct version', () => {
            const out = runCli('--version', tmpDir);
            expect(out.trim()).toBe(`global-skill v${VERSION}`);
        });

        it('should display version with -v shorthand', () => {
            const out = runCli('-v', tmpDir);
            expect(out.trim()).toBe(`global-skill v${VERSION}`);
        });
    });

    // ─── init ───

    describe('init', () => {
        it('should create .agent/skills/ directory with all skills', () => {
            runCli('init', tmpDir);

            const skillsDir = path.join(tmpDir, '.agent', 'skills');
            expect(fs.existsSync(skillsDir)).toBe(true);

            const expectedSkills = [
                'clarification', 'file-safety', 'coding', 'browser',
                'research', 'github', 'ops', 'docker', 'ssh', '_templates',
            ];
            for (const skill of expectedSkills) {
                const skillPath = path.join(skillsDir, skill);
                expect(fs.existsSync(skillPath), `skill "${skill}" should exist`).toBe(true);
            }
        });

        it('should create docs/ at project root', () => {
            runCli('init', tmpDir);

            const docsDir = path.join(tmpDir, 'docs');
            expect(fs.existsSync(docsDir)).toBe(true);
            expect(fs.existsSync(path.join(docsDir, 'fsm.md'))).toBe(true);
            expect(fs.existsSync(path.join(docsDir, 'overview.md'))).toBe(true);
        });

        it('should create examples/ at project root', () => {
            runCli('init', tmpDir);

            const exDir = path.join(tmpDir, 'examples');
            expect(fs.existsSync(exDir)).toBe(true);
            expect(fs.existsSync(path.join(exDir, 'prompt_snippets.md'))).toBe(true);
            expect(fs.existsSync(path.join(exDir, 'use_cases.md'))).toBe(true);
        });

        it('should NOT overwrite existing files', () => {
            const skillsDir = path.join(tmpDir, '.agent', 'skills', 'clarification');
            fs.mkdirSync(skillsDir, { recursive: true });
            const existingFile = path.join(skillsDir, 'SKILL.md');
            fs.writeFileSync(existingFile, 'CUSTOM CONTENT');

            runCli('init', tmpDir);

            const content = fs.readFileSync(existingFile, 'utf8');
            expect(content).toBe('CUSTOM CONTENT');
        });

        it('should NOT create skills/ at project root (old behavior)', () => {
            runCli('init', tmpDir);
            expect(fs.existsSync(path.join(tmpDir, 'skills'))).toBe(false);
        });
    });

    // ─── install ───

    describe('install', () => {
        it('should overwrite existing files', () => {
            const skillsDir = path.join(tmpDir, '.agent', 'skills', 'clarification');
            fs.mkdirSync(skillsDir, { recursive: true });
            const existingFile = path.join(skillsDir, 'SKILL.md');
            fs.writeFileSync(existingFile, 'OLD CONTENT');

            runCli('install', tmpDir);

            const content = fs.readFileSync(existingFile, 'utf8');
            expect(content).not.toBe('OLD CONTENT');
            expect(content).toContain('clarification');
        });

        it('should show overwrite count in output', () => {
            runCli('init', tmpDir);
            const out = runCli('install', tmpDir);
            expect(out).toContain('overwritten');
        });
    });

    // ─── update (alias) ───

    describe('update', () => {
        it('should work the same as install', () => {
            runCli('init', tmpDir);
            const out = runCli('update', tmpDir);
            expect(out).toContain('overwritten');
            expect(fs.existsSync(path.join(tmpDir, '.agent', 'skills', 'coding', 'SKILL.md'))).toBe(true);
        });
    });

    // ─── --target flag ───

    describe('--target flag', () => {
        it('should install skills to custom target directory', () => {
            runCli('init --target .agents/skills', tmpDir);
            expect(fs.existsSync(path.join(tmpDir, '.agents', 'skills', 'coding', 'SKILL.md'))).toBe(true);
            expect(fs.existsSync(path.join(tmpDir, '.agent', 'skills'))).toBe(false);
        });

        it('should still create docs/ and examples/ at root', () => {
            runCli('init --target custom-skills', tmpDir);
            expect(fs.existsSync(path.join(tmpDir, 'docs', 'fsm.md'))).toBe(true);
            expect(fs.existsSync(path.join(tmpDir, 'examples', 'use_cases.md'))).toBe(true);
        });
    });

    // ─── --dry-run flag ───

    describe('--dry-run flag', () => {
        it('should NOT create any files', () => {
            const out = runCli('init --dry-run', tmpDir);
            expect(fs.existsSync(path.join(tmpDir, '.agent'))).toBe(false);
            expect(fs.existsSync(path.join(tmpDir, 'docs'))).toBe(false);
            expect(fs.existsSync(path.join(tmpDir, 'examples'))).toBe(false);
            expect(out).toContain('DRY RUN');
            expect(out).toContain('CREATE');
        });

        it('should show OVERWRITE for existing files', () => {
            runCli('init', tmpDir);
            const out = runCli('install --dry-run', tmpDir);
            expect(out).toContain('OVERWRITE');
            expect(out).toContain('DRY RUN');
        });

        it('should show SKIP for init with existing files', () => {
            runCli('init', tmpDir);
            const out = runCli('init --dry-run', tmpDir);
            expect(out).toContain('SKIP');
        });
    });

    // ─── diff command ───

    describe('diff', () => {
        it('should show no installation found when project is empty', () => {
            const out = runCli('diff', tmpDir);
            expect(out).toContain('No global-skill installation found');
        });

        it('should show all up-to-date after fresh init', () => {
            runCli('init', tmpDir);
            const out = runCli('diff', tmpDir);
            expect(out).toContain('up-to-date');
            expect(out).toContain('0 changed');
            expect(out).toContain('0 missing');
        });

        it('should detect changed files', () => {
            runCli('init', tmpDir);
            const skillFile = path.join(tmpDir, '.agent', 'skills', 'coding', 'SKILL.md');
            fs.writeFileSync(skillFile, 'MODIFIED CONTENT');

            const out = runCli('diff', tmpDir);
            expect(out).toContain('[CHANGED]');
            expect(out).toContain('1 changed');
        });

        it('should detect missing files', () => {
            runCli('init', tmpDir);
            const skillFile = path.join(tmpDir, '.agent', 'skills', 'coding', 'SKILL.md');
            fs.unlinkSync(skillFile);

            const out = runCli('diff', tmpDir);
            expect(out).toContain('[MISSING]');
            expect(out).toContain('1 missing');
        });
    });

    // ─── --only flag ───

    describe('--only flag', () => {
        it('should install only specified skills', () => {
            runCli('install --only coding,github', tmpDir);

            expect(fs.existsSync(path.join(tmpDir, '.agent', 'skills', 'coding', 'SKILL.md'))).toBe(true);
            expect(fs.existsSync(path.join(tmpDir, '.agent', 'skills', 'github', 'SKILL.md'))).toBe(true);
            expect(fs.existsSync(path.join(tmpDir, '.agent', 'skills', 'docker'))).toBe(false);
            expect(fs.existsSync(path.join(tmpDir, '.agent', 'skills', 'ssh'))).toBe(false);
        });

        it('should skip docs and examples when --only is used', () => {
            runCli('install --only coding', tmpDir);
            expect(fs.existsSync(path.join(tmpDir, 'docs'))).toBe(false);
            expect(fs.existsSync(path.join(tmpDir, 'examples'))).toBe(false);
        });

        it('should show error for invalid skill names', () => {
            const out = runCli('install --only nonexistent', tmpDir);
            expect(out).toContain('Unknown skill');
            expect(out).toContain('nonexistent');
        });

        it('should show selective install message', () => {
            const out = runCli('install --only coding,github', tmpDir);
            expect(out).toContain('Selective install');
            expect(out).toContain('coding');
            expect(out).toContain('github');
        });

        it('should always include _templates with --only', () => {
            runCli('install --only coding', tmpDir);
            expect(fs.existsSync(path.join(tmpDir, '.agent', 'skills', '_templates'))).toBe(true);
        });
    });

    // ─── SKILL.md integrity ───

    describe('SKILL.md files', () => {
        it('should have valid YAML frontmatter in all skills', () => {
            runCli('init', tmpDir);

            const skillsDir = path.join(tmpDir, '.agent', 'skills');
            const skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
                .filter(e => e.isDirectory() && e.name !== '_templates');

            for (const dir of skillDirs) {
                const skillFile = path.join(skillsDir, dir.name, 'SKILL.md');
                expect(fs.existsSync(skillFile), `${dir.name}/SKILL.md should exist`).toBe(true);

                const content = fs.readFileSync(skillFile, 'utf8');
                expect(content.startsWith('---'), `${dir.name}/SKILL.md should start with ---`).toBe(true);
                expect(content).toContain('name:');
                expect(content).toContain('description:');
            }
        });

        it('should have depends_on and related fields in all skills', () => {
            runCli('init', tmpDir);

            const skillsDir = path.join(tmpDir, '.agent', 'skills');
            const skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
                .filter(e => e.isDirectory() && e.name !== '_templates');

            for (const dir of skillDirs) {
                const skillFile = path.join(skillsDir, dir.name, 'SKILL.md');
                const content = fs.readFileSync(skillFile, 'utf8');
                expect(content, `${dir.name}/SKILL.md should have depends_on`).toContain('depends_on:');
                expect(content, `${dir.name}/SKILL.md should have related`).toContain('related:');
            }
        });
    });

    // ─── help enhancements ───

    describe('help enhancements', () => {
        it('should list available skills in help', () => {
            const out = runCli('help', tmpDir);
            expect(out).toContain('Available skills');
            expect(out).toContain('coding');
            expect(out).toContain('clarification');
        });

        it('should show diff command in help', () => {
            const out = runCli('help', tmpDir);
            expect(out).toContain('diff');
        });

        it('should show --only option in help', () => {
            const out = runCli('help', tmpDir);
            expect(out).toContain('--only');
        });
    });

    // ─── unknown command ───

    describe('unknown command', () => {
        it('should show error for unknown command', () => {
            const out = runCli('foobar', tmpDir);
            expect(out).toContain('Unknown command');
        });
    });
});

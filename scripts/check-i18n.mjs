/**
 * Checks that every translation key used in your pages exists in
 * lib/i18n/translations.ts, in BOTH English and Hausa.
 *
 * Run from the project root (the folder that contains `app` and `lib`):
 *
 *     node scripts/check-i18n.mjs
 *
 * It prints, per file, the keys the page asks for that the translation
 * file does not have. Those keys are exactly what appear as raw text
 * (like "home.hero.badge") in the browser.
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();
const TRANSLATIONS = path.join(ROOT, 'lib', 'i18n', 'translations.ts');
const SCAN_DIRS = ['app', 'components', 'src'];

/* ---------- load translations.ts without a build step ---------- */

if (!fs.existsSync(TRANSLATIONS)) {
  console.error(`Cannot find ${TRANSLATIONS}\nRun this from your project root.`);
  process.exit(2);
}

const source = fs
  .readFileSync(TRANSLATIONS, 'utf8')
  .replace(/^export type Language.*$/m, '')
  .replace(/^export const translations =/m, 'const translations =')
  .replace(/\}\s*as const;?\s*$/m, '};');

let translations;

try {
  translations = vm.runInNewContext(`${source}\n;translations`);
} catch (error) {
  console.error('translations.ts could not be read. It probably has a syntax error:');
  console.error(String(error));
  process.exit(2);
}

/* ---------- duplicate keys (these break `next build` on Vercel) ---------- */

let duplicateCount = 0;

try {
  const { createRequire } = await import('node:module');
  const ts = createRequire(path.join(ROOT, 'package.json'))('typescript');
  const text = fs.readFileSync(TRANSLATIONS, 'utf8');
  const sf = ts.createSourceFile('translations.ts', text, ts.ScriptTarget.Latest, true);

  const visit = (node, trail) => {
    if (ts.isObjectLiteralExpression(node)) {
      const seen = new Map();
      for (const prop of node.properties) {
        if (!prop.name) continue;
        const name = prop.name.getText(sf).replace(/^['"]|['"]$/g, '');
        const line = sf.getLineAndCharacterOfPosition(prop.getStart(sf)).line + 1;
        if (seen.has(name)) {
          duplicateCount += 1;
          console.error(
            `DUPLICATE key "${[...trail, name].join('.')}" at line ${line} (first at line ${seen.get(name)})`
          );
        } else {
          seen.set(name, line);
        }
        if (prop.initializer) visit(prop.initializer, [...trail, name]);
      }
      return;
    }
    ts.forEachChild(node, (child) => visit(child, trail));
  };

  visit(sf, []);
} catch {
  // TypeScript not available here: skip this check.
}

const LANGS = Object.keys(translations);

function resolve(obj, keyPath) {
  return keyPath
    .split('.')
    .reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), obj);
}

function flatten(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, value]) =>
    value && typeof value === 'object'
      ? flatten(value, `${prefix}${key}.`)
      : [`${prefix}${key}`]
  );
}

/* ---------- find every file ---------- */

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (['node_modules', '.next', '.git'].includes(entry.name)) return [];
      return walk(full);
    }

    return /\.(tsx|ts|jsx|js)$/.test(entry.name) ? [full] : [];
  });
}

const files = SCAN_DIRS.flatMap((dir) => walk(path.join(ROOT, dir)));

/* ---------- pull keys out of t('...') and tOr('...') ---------- */

const CALL = /(?<![\w.$])(?:t|tOr)\(\s*(['"`])((?:(?!\1).)*?)\1/g;

let problems = duplicateCount;
const unusedFiles = [];

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const relative = path.relative(ROOT, file);

  const missing = new Map(); // key -> languages missing it

  for (const match of text.matchAll(CALL)) {
    const key = match[2];

    // Dynamic keys like `catalog.${id}`: check the part before ${ exists.
    const dynamic = key.includes('${');
    const checkKey = dynamic ? key.split('${')[0].replace(/\.$/, '') : key;

    if (!checkKey) continue;

    for (const lang of LANGS) {
      const found = resolve(translations[lang], checkKey);

      const ok = dynamic
        ? found && typeof found === 'object'
        : typeof found === 'string';

      if (!ok) {
        const label = dynamic ? `${checkKey}.*  (dynamic)` : checkKey;
        missing.set(label, [...(missing.get(label) ?? []), lang]);
      }
    }
  }

  if (missing.size) {
    problems += missing.size;
    console.log(`\n${relative}`);

    for (const [key, langs] of missing) {
      console.log(`  missing in ${langs.join(', ')}:  ${key}`);
    }
  } else if (/useLanguage\(/.test(text)) {
    unusedFiles.push(relative);
  }
}

/* ---------- English vs Hausa parity ---------- */

if (LANGS.includes('en') && LANGS.includes('ha')) {
  const en = new Set(flatten(translations.en));
  const ha = new Set(flatten(translations.ha));

  const onlyEn = [...en].filter((key) => !ha.has(key));
  const onlyHa = [...ha].filter((key) => !en.has(key));

  if (onlyEn.length || onlyHa.length) {
    console.log('\nEnglish / Hausa mismatch in translations.ts');
    onlyEn.forEach((key) => console.log(`  only in en:  ${key}`));
    onlyHa.forEach((key) => console.log(`  only in ha:  ${key}`));
    problems += onlyEn.length + onlyHa.length;
  }
}

/* ---------- summary ---------- */

console.log('');

if (problems === 0) {
  console.log(`OK: every translation key used in ${files.length} files exists in en and ha.`);
  if (unusedFiles.length) {
    console.log(`Files using translations: ${unusedFiles.length}`);
  }
  process.exit(0);
}

console.log(`Found ${problems} problem(s). Fix them, then run this again.`);
process.exit(1);

import * as fs from 'fs';
import * as path from 'path';

const CONTROLLERS_DIR = path.resolve(__dirname, 'src', 'controllers');
const MD_PATH = path.resolve(__dirname, 'ALL_API_ENDPOINTS_COMPLETE.md');
const OUT_MD = path.resolve(process.cwd(), 'DOC_VS_ACTUAL_ROUTES.md');

function listControllerFiles(dir: string): string[] {
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.controller.ts'))
    .map(f => path.join(dir, f));
}

type Route = { method: string; fullPath: string; file: string };

function extractRoutesFromFile(filePath: string): Route[] {
  const src = fs.readFileSync(filePath, 'utf8');
  // Controller base
  const ctrlMatch = src.match(/@Controller\(([^\)]*)\)/);
  const base = ctrlMatch ? (ctrlMatch[1].replace(/[\'\"`]/g, '').trim()) : '';
  const basePath = base ? ('/' + base.replace(/^\//,'').replace(/\/$/,'') ) : '';
  const routes: Route[] = [];
  const rx = /@(Get|Post|Put|Delete|Patch)\(([^\)]*)\)/g;
  let m: RegExpExecArray | null;
  while ((m = rx.exec(src))) {
    const method = m[1].toUpperCase();
    const raw = (m[2] || '').replace(/[\'\"`]/g, '').trim();
    const rel = raw ? ('/' + raw.replace(/^\//,'').replace(/\/$/,'') ) : '';
    const fullPath = (basePath + rel) || basePath || '/';
    routes.push({ method, fullPath, file: path.basename(filePath) });
  }
  return routes;
}

function extractDocRoutes(md: string): Route[] {
  const entries: Route[] = [];
  const rowRe = /(GET|POST|PUT|DELETE|PATCH)[^\n]*?`(\/[\w\-:\/]+)`/gmi;
  let m: RegExpExecArray | null;
  while ((m = rowRe.exec(md))) {
    const method = m[1].toUpperCase();
    const p = m[2].trim();
    entries.push({ method, fullPath: p, file: 'DOC' });
  }
  return entries;
}

function main() {
  const files = listControllerFiles(CONTROLLERS_DIR);
  let actual: Route[] = [];
  files.forEach(f => { actual = actual.concat(extractRoutesFromFile(f)); });

  const md = fs.readFileSync(MD_PATH, 'utf8');
  const doc = extractDocRoutes(md);

  // Normalize: prefix /api/v1 to actual to compare with doc paths which already include it
  const actualWithBase = actual.map(r => ({ ...r, fullPath: ('/api/v1' + (r.fullPath==='/'?'':r.fullPath)) }))
    .map(r => ({ ...r, fullPath: r.fullPath.replace(/\/+$/,'') || '/' }));
  const docNorm = doc.map(r => ({ ...r, fullPath: ('/api/v1' + (r.fullPath==='/'?'':r.fullPath)).replace(/\/+$/,'') || '/' }));

  const actualKey = new Set(actualWithBase.map(r => r.method + ' ' + r.fullPath));
  const docKey = new Set(docNorm.map(r => r.method + ' ' + r.fullPath));

  const missing = docNorm.filter(r => !actualKey.has(r.method + ' ' + r.fullPath));
  const extra = actualWithBase.filter(r => !docKey.has(r.method + ' ' + r.fullPath));
  const common = docNorm.filter(r => actualKey.has(r.method + ' ' + r.fullPath));

  let out = '# Doc vs Actual Routes\n';
  out += `Actual controllers scanned: ${files.length}\n`;
  out += `Doc routes: ${docNorm.length}\n`;
  out += `Actual routes: ${actualWithBase.length}\n`;
  out += `Common: ${common.length}\n`;
  out += `Missing (in code, present in doc): ${missing.length}\n`;
  out += `Extra (in code, not in doc): ${extra.length}\n`;

  out += '\n## Missing (implement required)\n';
  missing.slice().sort((a,b)=> (a.fullPath+a.method).localeCompare(b.fullPath+b.method)).forEach(r => {
    out += `- ${r.method} ${r.fullPath}\n`;
  });

  out += '\n## Extra (consider documenting)\n';
  extra.slice().sort((a,b)=> (a.fullPath+a.method).localeCompare(b.fullPath+b.method)).forEach(r => {
    out += `- ${r.method} ${r.fullPath}  (from ${r.file})\n`;
  });

  fs.writeFileSync(OUT_MD, out);
  console.log('Wrote', OUT_MD);
}

main();

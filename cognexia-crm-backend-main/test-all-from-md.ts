import * as fs from 'fs';
import * as path from 'path';
import axios, { AxiosRequestConfig } from 'axios';

const BASE_DEFAULT = 'http://localhost:3003/api/v1';
const BASE_NOAPI = 'http://localhost:3003';
const MD_PATH = path.resolve(process.cwd(), 'ALL_API_ENDPOINTS_COMPLETE.md');

// Known test IDs
const testIds = {
  customerId: '00000000-0000-0000-0000-000000000456',
  productId: '00000000-0000-0000-0000-000000000123',
  contractId: 'last', // will resolve dynamically if possible
  id: 'last',
  sessionId: 'session-123',
  dashboardId: 'dash-123',
  catalogId: 'last',
  itemId: 'item-123',
  showroomId: 'last',
};

// Storage for created IDs by resource key
const resourceIds: Record<string, string> = {};

function getResourceKey(urlPath: string) {
  // Take the first segment after base, e.g., '/contracts/...' -> 'contracts'
  const seg = urlPath.replace(/^\//, '').split('/')[0];
  return seg || 'root';
}

function substitutePlaceholders(endpoint: string) {
  return endpoint
    .replace(/:customerId/g, testIds.customerId)
    .replace(/:productId/g, testIds.productId)
    .replace(/:dashboardId/g, testIds.dashboardId)
    .replace(/:sessionId/g, testIds.sessionId)
    .replace(/:catalogId/g, resourceIds['catalogs'] || '00000000-0000-0000-0000-00000000cafe')
    .replace(/:itemId/g, resourceIds['inventory'] || 'item-123')
    .replace(/:contractId/g, resourceIds['contracts'] || '00000000-0000-0000-0000-00000000beef')
    .replace(/:id/g, (m, offset, str) => {
      const key = getResourceKey(endpoint);
      return resourceIds[key] || resourceIds['contracts'] || '00000000-0000-0000-0000-00000000dead';
    });
}

function buildUrl(endpointPath: string) {
  if (/^https?:\/\//i.test(endpointPath)) return endpointPath;
  if (endpointPath.startsWith('/api/')) return BASE_NOAPI + endpointPath;
  return BASE_DEFAULT + endpointPath;
}

function extractBody(bodyField: string | undefined, method: string, endpoint: string): any {
  if (!/^(POST|PUT|PATCH)$/i.test(method)) return undefined;
  if (!bodyField) return {};
  const codeMatch = bodyField.match(/`([^`]+)`/);
  if (codeMatch) {
    const json = codeMatch[1]
      .replace(/\u201c|\u201d|”|“/g, '"')
      .replace(/\u2019|\u2018|’|‘/g, "'");
    try {
      return JSON.parse(json);
    } catch {}
  }
  // Minimal heuristics by resource
  const key = getResourceKey(endpoint);
  switch (key) {
    case 'contracts':
      return { name: 'Auto Test Contract', customerId: testIds.customerId, value: 10000 };
    case 'holographic':
      return { customerId: testIds.customerId, type: 'PRODUCT_DEMO' };
    case 'arvr':
      if (endpoint.includes('/showrooms')) return { name: 'Auto VR Showroom' };
      if (endpoint.includes('/meetings')) return { customerId: testIds.customerId, scheduledAt: new Date(Date.now()+3600000).toISOString() };
      if (endpoint.includes('/product-demos') || endpoint.includes('/configurator')) return { productId: testIds.productId };
      return {};
    case 'catalogs':
      return { name: 'Auto Test Catalog' };
    case 'llm':
      if (endpoint.includes('/chat')) return { customerId: testIds.customerId, context: 'sales' };
      if (endpoint.includes('/content-generation')) return { prompt: 'Hello', contentType: 'text' };
      if (endpoint.includes('/sentiment')) return { customerId: testIds.customerId };
      if (endpoint.includes('/summarize')) return { text: 'This is a long text to summarize.' };
      return {};
    case 'inventory':
      return {};
    case 'email':
      return { to: ['test@example.com'], subject: 'Hello', body: 'Test' };
    default:
      return {};
  }
}

async function obtainToken() {
  // Register, elevate role, then login
  const email = `mdtest.${Date.now()}@example.com`;
  const password = 'TestPassword123!';
  // Register
  await axios({
    url: BASE_DEFAULT + '/auth/register',
    method: 'POST',
    data: {
      email,
      password,
      firstName: 'MD',
      lastName: 'Tester',
      companyName: 'Doc Company',
      phone: '+10000000000',
    },
    validateStatus: () => true,
  });
  // Elevate role via local script (db update)
  const { execFile } = await import('child_process');
  await new Promise<void>((resolve) => {
    execFile('npx', ['ts-node', 'elevate-user-role.ts', email, 'super_admin'], { cwd: __dirname as any }, () => resolve());
  });
  // Login
  const resp = await axios({
    url: BASE_DEFAULT + '/auth/login',
    method: 'POST',
    data: { email, password },
    validateStatus: () => true,
  });
  if (resp.status >= 200 && resp.status < 300 && resp.data?.accessToken) {
    return resp.data.accessToken as string;
  }
  throw new Error('Failed to obtain JWT');
}

async function main() {
  const md = fs.readFileSync(MD_PATH, 'utf8');
const rowRe = /(GET|POST|PUT|DELETE|PATCH)[^\n]*?`(\/[\w\-:\/]+)`/gmi;
  const entries: { method: string; endpoint: string; bodyField: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = rowRe.exec(md))) {
    const method = m[1].toUpperCase();
    const endpoint = m[2].trim();
    const bodyField = '';
    entries.push({ method, endpoint, bodyField });
  }
  console.log(`Discovered ${entries.length} endpoints in MD`);

  const token = await obtainToken().catch(()=>null);
  const results: any[] = [];
  for (const [idx, e] of entries.entries()) {
    const epPath = substitutePlaceholders(e.endpoint);
    const url = buildUrl(epPath);
    const data = extractBody(e.bodyField, e.method, e.endpoint);

    const cfg: AxiosRequestConfig = {
      url,
      method: e.method as any,
      headers: { 'Content-Type': 'application/json', ...(token? { Authorization: `Bearer ${token}` } : {}) },
      validateStatus: () => true,
      data,
      timeout: 10000,
    };

    let status = 0; let ok = false; let preview = ''; let id: string | undefined;
    try {
      const resp = await axios(cfg);
      status = resp.status;
      ok = status >= 200 && status < 300;
      const j = typeof resp.data === 'object' ? resp.data : undefined;
      if (j) {
        preview = JSON.stringify(j).slice(0, 160);
        if (j.id && typeof j.id === 'string') {
          const key = getResourceKey(e.endpoint);
          resourceIds[key] = j.id;
        }
      } else if (typeof resp.data === 'string') {
        preview = resp.data.slice(0, 160);
      }
    } catch (err: any) {
      preview = err.message;
    }

    results.push({ idx: idx+1, method: e.method, endpoint: e.endpoint, url, status, ok, preview });
    const tag = ok ? 'OK' : 'FAIL';
    console.log(`[${idx+1}/${entries.length}] ${tag} ${e.method} ${url} (${status})`);
  }

  // Write CSV
  const csvLines = [
    'index,method,endpoint,url,status,ok,preview',
    ...results.map(r => `${r.idx},${r.method},"${r.endpoint}","${r.url}",${r.status},${r.ok},"${(r.preview||'').replace(/"/g,'\"')}"`)
  ];
  fs.writeFileSync(path.resolve(process.cwd(), 'api-test-results-from-md.csv'), csvLines.join('\n'));
  
  const okCount = results.filter(r=>r.ok).length;
  console.log(`\nSummary: ${okCount}/${results.length} OK`);
}

main().catch(e=>{ console.error(e); process.exit(1); });

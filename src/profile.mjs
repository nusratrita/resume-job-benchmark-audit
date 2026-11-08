// Table reader used by grid_perjob.mjs (csv/parquet). Run directly to profile a folder: node src/profile.mjs <dir>
import fs from 'fs';
import path from 'path';
import { parquetReadObjects } from 'hyparquet';
import { compressors } from 'hyparquet-compressors';

export async function readTable(f) {
  if (f.endsWith('.parquet')) {
    const buf = fs.readFileSync(f);
    const file = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    return await parquetReadObjects({ file, compressors });
  }
  return parseCsv(fs.readFileSync(f, 'utf8'));
}

export function parseCsv(s) {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (q) { if (ch === '"') { if (s[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; }
    else if (ch === '"') q = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n') { row.push(cell.replace(/\r$/, '')); rows.push(row); row = []; cell = ''; }
    else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [h, ...rest] = rows;
  return rest.filter(r => r.length > 1 || r[0]).map(r => Object.fromEntries(h.map((k, i) => [k, r[i]])));
}

function walk(d) { return fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]); }

if (process.argv[1].endsWith('profile.mjs')) {
  const root = process.argv[2];
  for (const f of walk(root).filter(f => /\.(csv|parquet)$/.test(f)).sort()) {
    let rows;
    try { rows = await readTable(f); } catch (e) { console.log('ERR', path.relative(root, f), e.message); continue; }
    const cols = rows.length ? Object.keys(rows[0]) : [];
    const flags = [];
    for (const c of cols) {
      const v = rows.map(r => r[c]).filter(x => typeof x === 'string');
      if (!v.length) continue;
      const max = Math.max(...v.map(x => x.length)), mean = v.reduce((a, x) => a + x.length, 0) / v.length;
      if (mean > 60 || max > 300) flags.push(`${c}(mean ${mean.toFixed(0)}, max ${max})`);
    }
    console.log((flags.length ? 'TEXT ' : 'ok   ') + path.relative(root, f), rows.length + 'r', '[' + cols.join(',') + ']', flags.join(' '));
  }
}

// Robustness check: per-job fit-vs-no AUC on the 6a 5x5 grid + test-list lengths.
// Usage (from the repository root): npm install hyparquet@1.13.6 hyparquet-compressors@1.1.1 && node src/grid_perjob.mjs
// Input: release/results/06a_cv_pair_scores.parquet (ids + scores only). Output: printed; saved copy in release/results/06a_per_job/.
import { readTable } from './profile.mjs';
const F = process.argv[2] || 'release/results/06a_cv_pair_scores.parquet';
const rows = await readTable(F);
const cols = Object.keys(rows[0]);
console.log('columns:', cols.join(' | '));
const methods = cols.filter(c => !['pair_key', 'job_id', 'resume_id', 'fold', 'relevance', 'label'].includes(c));

// group by (fold, job): in the grid a job is tested in one fold only, but keep fold in the key to be safe
const groups = new Map();
for (const r of rows) { const k = r.fold + '|' + r.job_id; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r); }
const lens = [...groups.values()].map(g => g.length).sort((a, b) => a - b);
const q = p => lens[Math.min(lens.length - 1, Math.floor(p * lens.length))];
console.log(`\ntest lists: ${lens.length} (fold,job) lists, ${new Set(rows.map(r => r.job_id)).size} jobs; candidates per list: min ${lens[0]}, q25 ${q(.25)}, median ${q(.5)}, q75 ${q(.75)}, max ${lens.at(-1)}; share with <=3: ${(lens.filter(x => x <= 3).length / lens.length).toFixed(2)}, <=5: ${(lens.filter(x => x <= 5).length / lens.length).toFixed(2)}`);

// AUC with ties = 0.5
function auc(pos, neg) { let s = 0; for (const p of pos) for (const n of neg) s += p > n ? 1 : p === n ? 0.5 : 0; return s / (pos.length * neg.length); }
const jobs = [...groups.values()].filter(g => g.some(r => Number(r.relevance) > 0) && g.some(r => Number(r.relevance) === 0));
console.log(`jobs with both fit and no-fit in the test list: ${jobs.length}`);
const per = {};
for (const m of methods) per[m] = jobs.map(g => auc(g.filter(r => Number(r.relevance) > 0).map(r => Number(r[m])), g.filter(r => Number(r.relevance) === 0).map(r => Number(r[m]))));
const mean = a => a.reduce((x, y) => x + y, 0) / a.length;

// seeded RNG
let seed = 42; const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
function boot(a, B = 5000) { const n = a.length, out = []; for (let b = 0; b < B; b++) { let s = 0; for (let i = 0; i < n; i++) s += a[Math.floor(rnd() * n)]; out.push(s / n); } out.sort((x, y) => x - y); return [out[Math.floor(.025 * B)], out[Math.floor(.975 * B)]]; }
function signflip(d, B = 20000) { const obs = Math.abs(mean(d)); let c = 0; for (let b = 0; b < B; b++) { let s = 0; for (const x of d) s += rnd() < .5 ? x : -x; if (Math.abs(s / d.length) >= obs - 1e-12) c++; } return (c + 1) / (B + 1); }

console.log('\nper-job fit-vs-no AUC (mean over jobs, 95% bootstrap CI over jobs):');
for (const m of methods) { const ci = boot(per[m]); console.log(`  ${m.padEnd(34)} ${mean(per[m]).toFixed(3)} [${ci[0].toFixed(3)}, ${ci[1].toFixed(3)}]`); }

const comps = [['FT standard', 'FT strict'], ['FT size-matched', 'FT strict'], ['FT standard', 'FT size-matched'],
  ['FT strict', 'BGE-base (zero-shot)'], ['FT strict', 'E5-base (zero-shot)'], ['FT strict', 'TF-IDF']];
console.log('\npaired differences over jobs (mean, CI, sign-flip p, Holm over these 6):');
const res = comps.filter(([a, b]) => per[a] && per[b]).map(([a, b]) => { const d = per[a].map((x, i) => x - per[b][i]); return { a, b, m: mean(d), ci: boot(d), p: signflip(d), better: d.filter(x => x > 0).length, worse: d.filter(x => x < 0).length }; });
const order = res.map((r, i) => [r.p, i]).sort((x, y) => x[0] - y[0]); let run = 0;
order.forEach(([p, i], k) => { run = Math.max(run, Math.min(1, p * (res.length - k))); res[i].holm = run; });
for (const r of res) console.log(`  ${(r.a + ' - ' + r.b).padEnd(44)} ${r.m >= 0 ? '+' : ''}${r.m.toFixed(3)} [${r.ci[0].toFixed(3)}, ${r.ci[1].toFixed(3)}]  p ${r.p.toFixed(4)}  Holm ${r.holm.toFixed(4)}  jobs better/worse ${r.better}/${r.worse}`);

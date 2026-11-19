// Rettina — webcam gaze / head pointer (MediaPipe Face Landmarker, runs fully in the browser).
// Video never leaves the device: frames go to an on-device model, only a screen point comes out.
const MP = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';
const MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
const LS_CAL = 'rettina.calib';
const t = (k, v) => (window.t ? window.t(k, v) : k);

const G = {
  mode: 'mouse',            // 'mouse' | 'gaze' | 'head'
  landmarker: null, video: null, stream: null, running: false,
  feat: null, lastFace: 0, lastVideoTime: -1,
  cal: load(),              // { gaze:{w,mean,std}, head:{w,mean,std}, err:{gaze,head} }
  pt: null,                 // smoothed screen point
  snapPx: 140, preview: false,
  collecting: null,         // array while calibrating
};
function load() { try { return JSON.parse(localStorage.getItem(LS_CAL)) || null; } catch { return null; } }
function save() { try { localStorage.setItem(LS_CAL, JSON.stringify(G.cal)); } catch {} }
const status = (s) => { const el = document.getElementById('gazeStat'); if (el) el.textContent = s; };

/* ---------------- camera + model ---------------- */
async function ensureRunning() {
  if (G.running) return;
  status(t('gz.loading'));
  const { FaceLandmarker, FilesetResolver } = await import(`${MP}/vision_bundle.mjs`);
  const files = await FilesetResolver.forVisionTasks(`${MP}/wasm`);
  G.landmarker = await FaceLandmarker.createFromOptions(files, {
    baseOptions: { modelAssetPath: MODEL, delegate: 'GPU' },
    runningMode: 'VIDEO', numFaces: 1,
  });
  status(t('gz.perm'));
  G.stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' }, audio: false });
  G.video = Object.assign(document.createElement('video'), { muted: true, playsInline: true, srcObject: G.stream });
  await G.video.play();
  G.running = true;
  status(t('gz.on'));
  requestAnimationFrame(tick);
}
function stopCamera() {
  G.running = false;
  G.stream?.getTracks().forEach(t => t.stop());
  G.stream = null;
}

/* ---------------- features from landmarks ---------------- */
function eyeFeat(lm, iris, c1, c2) {
  const [a, b] = lm[c1].x < lm[c2].x ? [lm[c1], lm[c2]] : [lm[c2], lm[c1]];
  const c = lm[iris], dx = b.x - a.x, dy = b.y - a.y, w2 = dx * dx + dy * dy;
  return [((c.x - a.x) * dx + (c.y - a.y) * dy) / w2,      // along the eye (horizontal gaze)
          ((c.x - a.x) * -dy + (c.y - a.y) * dx) / w2];    // across the eye (vertical gaze)
}
function features(lm) {
  const r = eyeFeat(lm, 468, 33, 133), l = eyeFeat(lm, 473, 362, 263);
  const ex = (r[0] + l[0]) / 2, ey = (r[1] + l[1]) / 2;
  const L = lm[234], R = lm[454], T = lm[10], B = lm[152], N = lm[1];
  const fw = Math.hypot(R.x - L.x, R.y - L.y), fh = Math.hypot(B.x - T.x, B.y - T.y);
  const yaw = (N.x - (L.x + R.x) / 2) / fw, pitch = (N.y - (T.y + B.y) / 2) / fh;
  return { ex, ey, yaw, pitch, nx: N.x, ny: N.y, iris: [lm[468], lm[473]] };
}
const design = {
  gaze: f => [f.ex, f.ey, f.ex * f.ex, f.ey * f.ey, f.yaw, f.pitch],
  head: f => [f.yaw, f.pitch, f.nx, f.ny],
};

/* ---------------- ridge regression (standardized, intercept unpenalized) ---------------- */
function fit(rows, ys, lambda = 1) {
  const k = rows[0].length, n = rows.length;
  const mean = Array(k).fill(0), std = Array(k).fill(0);
  rows.forEach(r => r.forEach((v, j) => mean[j] += v / n));
  rows.forEach(r => r.forEach((v, j) => std[j] += (v - mean[j]) ** 2 / n));
  std.forEach((v, j) => std[j] = Math.sqrt(v) || 1);
  const X = rows.map(r => [1, ...r.map((v, j) => (v - mean[j]) / std[j])]);
  const solve = y => {
    const m = k + 1, A = Array.from({ length: m }, () => Array(m + 1).fill(0));
    X.forEach((x, i) => { for (let a = 0; a < m; a++) { for (let b = 0; b < m; b++) A[a][b] += x[a] * x[b]; A[a][m] += x[a] * y[i]; } });
    for (let a = 1; a < m; a++) A[a][a] += lambda;
    for (let c = 0; c < m; c++) {                       // Gauss-Jordan
      let p = c; for (let r = c + 1; r < m; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
      [A[c], A[p]] = [A[p], A[c]];
      for (let r = 0; r < m; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let j = c; j <= m; j++) A[r][j] -= f * A[c][j]; }
    }
    return A.map((row, i) => row[m] / row[i]);
  };
  return { mean, std, wx: solve(ys.map(p => p[0])), wy: solve(ys.map(p => p[1])) };
}
function predict(m, row) {
  const x = [1, ...row.map((v, j) => (v - m.mean[j]) / m.std[j])];
  const dot = w => w.reduce((s, wi, i) => s + wi * x[i], 0);
  return [dot(m.wx), dot(m.wy)];
}

/* ---------------- main loop ---------------- */
const dot = () => document.getElementById('gazeDot');
function tick() {
  if (!G.running) return;
  const v = G.video;
  if (v.readyState >= 2 && v.currentTime !== G.lastVideoTime) {
    G.lastVideoTime = v.currentTime;
    const res = G.landmarker.detectForVideo(v, performance.now());
    const lm = res.faceLandmarks?.[0];
    if (lm) { G.feat = features(lm); G.lastFace = performance.now(); if (G.collecting) G.collecting.push(G.feat); }
    else G.feat = null;
    if (G.preview) drawPreview(lm);
  }
  steer();
  requestAnimationFrame(tick);
}
function steer() {
  const d = dot();
  if (G.mode === 'mouse' || G.collecting) { d.style.display = 'none'; return; }
  const m = G.cal?.[G.mode];
  if (!m) { status(t('gz.needCal')); d.style.display = 'none'; return; }
  if (!G.feat || performance.now() - G.lastFace > 400) {
    status(t('gz.noFace')); d.classList.add('lost'); window.Dwell.gazeTarget(null); return;
  }
  d.classList.remove('lost');
  let [x, y] = predict(m, design[G.mode](G.feat));
  x = Math.max(0, Math.min(innerWidth, x)); y = Math.max(0, Math.min(innerHeight, y));
  // adaptive smoothing: heavy when still (fixation), light on big jumps (saccades)
  if (!G.pt) G.pt = [x, y];
  const jump = Math.hypot(x - G.pt[0], y - G.pt[1]);
  const a = Math.min(.6, .08 + jump / 900);
  G.pt = [G.pt[0] + a * (x - G.pt[0]), G.pt[1] + a * (y - G.pt[1])];
  d.style.display = 'block';
  d.style.left = G.pt[0] + 'px'; d.style.top = G.pt[1] + 'px';
  window.Dwell.gazeTarget(snap(G.pt[0], G.pt[1]));
  status(`${t(G.mode === 'gaze' ? 'gz.eye' : 'gz.head')} · ±${G.cal.err?.[G.mode] ?? '?'}px`);
}

/* snap to the nearest selectable tile, with hysteresis so the target doesn't flicker */
let snapped = null;
function snap(x, y) {
  const modal = document.querySelector('#modal.on, #calib.on');
  const scope = modal || document;
  const dist = el => { const r = el.getBoundingClientRect(); if (!r.width) return Infinity;
    const dx = Math.max(r.left - x, 0, x - r.right), dy = Math.max(r.top - y, 0, y - r.bottom); return Math.hypot(dx, dy); };
  let best = null, bd = Infinity;
  scope.querySelectorAll('.dw').forEach(el => { const d = dist(el); if (d < bd) { bd = d; best = el; } });
  if (snapped && document.body.contains(snapped) && scope.contains(snapped)) {
    const ds = dist(snapped);
    if (ds < G.snapPx * .5 && !(bd === 0 && ds > 24)) return snapped;   // stay unless clearly inside another tile
  }
  snapped = bd <= G.snapPx ? best : null;
  return snapped;
}

/* ---------------- calibration ---------------- */
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function calibrate() {
  await ensureRunning();
  const ov = document.getElementById('calib'), pt = document.getElementById('calibDot'), msg = document.getElementById('calibMsg');
  ov.classList.add('on'); let cancelled = false;
  const onKey = e => { if (e.key === 'Escape') cancelled = true; };
  addEventListener('keydown', onKey);
  msg.innerHTML = t('cal.look');
  const W = innerWidth, H = innerHeight, mx = 70, my = 70;
  const grid = [[.5, .5], [0, 0], [.5, 0], [1, 0], [1, .5], [1, 1], [.5, 1], [0, 1], [0, .5]]
    .map(([u, v]) => [mx + u * (W - 2 * mx), my + v * (H - 2 * my)]);
  const samples = [];
  const showAt = async (p, settle, collect) => {
    pt.style.left = p[0] + 'px'; pt.style.top = p[1] + 'px';
    pt.classList.remove('shrink'); void pt.offsetWidth; pt.style.animationDuration = (settle + collect) + 'ms'; pt.classList.add('shrink');
    await sleep(settle); G.collecting = []; await sleep(collect);
    const got = G.collecting; G.collecting = null; return got;
  };
  await sleep(1200);
  for (const p of grid) {
    if (cancelled) break;
    const got = await showAt(p, 800, 1100);
    got.forEach(f => samples.push({ f, p }));
  }
  if (!cancelled && samples.length > 60) {
    G.cal = { err: {} };
    for (const mode of ['gaze', 'head']) G.cal[mode] = fit(samples.map(s => design[mode](s.f)), samples.map(s => s.p), mode === 'gaze' ? 2 : 1);
    // quick validation on 4 new points
    msg.innerHTML = t('cal.check');
    const test = [[.3, .3], [.7, .3], [.7, .7], [.3, .7]].map(([u, v]) => [u * W, v * H]);
    const errs = { gaze: [], head: [] };
    for (const p of test) {
      if (cancelled) break;
      const got = await showAt(p, 700, 800);
      for (const mode of ['gaze', 'head']) got.forEach(f => { const q = predict(G.cal[mode], design[mode](f)); errs[mode].push(Math.hypot(q[0] - p[0], q[1] - p[1])); });
    }
    const med = a => a.sort((x, y) => x - y)[Math.floor(a.length / 2)] ?? 0;
    G.cal.err = { gaze: Math.round(med(errs.gaze)), head: Math.round(med(errs.head)) };
    save();
    const deg = px => (Math.atan(px / 45 / 55) * 180 / Math.PI).toFixed(1);   // ≈45 css px/cm, 55 cm viewing distance
    window.rettinaLog?.('gaze.calibrate', `${samples.length} samples · median error eye ${G.cal.err.gaze}px (≈${deg(G.cal.err.gaze)}°) · head ${G.cal.err.head}px (≈${deg(G.cal.err.head)}°)`);
    msg.innerHTML = t('cal.done', { g:G.cal.err.gaze, gd:deg(G.cal.err.gaze), h:G.cal.err.head, hd:deg(G.cal.err.head) });
    await sleep(2600);
  } else if (!cancelled) { msg.textContent = t('cal.noFace'); await sleep(2200); }
  removeEventListener('keydown', onKey);
  ov.classList.remove('on'); pt.classList.remove('shrink');
}

/* ---------------- camera preview ---------------- */
function drawPreview(lm) {
  const c = document.getElementById('camPreview'), ctx = c.getContext('2d');
  ctx.save(); ctx.scale(-1, 1); ctx.drawImage(G.video, -c.width, 0, c.width, c.height); ctx.restore();
  if (!lm) { ctx.fillStyle = '#c23b3bcc'; ctx.fillRect(0, c.height - 22, c.width, 22); ctx.fillStyle = '#fff'; ctx.font = '12px sans-serif'; ctx.fillText('no face', 8, c.height - 7); return; }
  ctx.fillStyle = '#8b6cf0';
  for (const i of [468, 473, 33, 133, 362, 263, 1]) { const p = lm[i]; ctx.beginPath(); ctx.arc((1 - p.x) * c.width, p.y * c.height, i >= 468 ? 3 : 1.6, 0, 7); ctx.fill(); }
}

/* ---------------- public API ---------------- */
window.Gaze = {
  async setMode(mode) {
    G.mode = mode; G.pt = null;
    window.Dwell.source = mode;
    if (mode === 'mouse') { status(t('gz.off')); window.Dwell.gazeTarget(null); return; }
    try {
      await ensureRunning();
      if (!G.cal?.[mode]) await calibrate();
    } catch (e) {
      status(t('gz.err') + (e.name || e.message));
      window.rettinaLog?.('gaze.error', e.message || e.name);
      throw e;
    }
  },
  calibrate: () => calibrate().catch(e => status(t('gz.err') + (e.name || e.message))),
  setPreview(on) { G.preview = on; document.getElementById('camPreview').style.display = on ? 'block' : 'none'; if (on) ensureRunning().catch(() => {}); },
  setSnap(px) { G.snapPx = px; },
  stop: stopCamera,
};
window.dispatchEvent(new Event('gaze-ready'));

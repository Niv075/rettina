// Rettina — webcam gaze / head pointer (MediaPipe Face Landmarker, runs fully in the browser).
// Video never leaves the device: frames go to an on-device model, only a screen point comes out.
const MP = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';
const MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
const LS_CAL = 'rettina.calib';
const CAL_VERSION = 4;
const t = (k, v) => (window.t ? window.t(k, v) : k);

const G = {
  mode: 'mouse',            // 'mouse' | 'gaze' | 'head'
  landmarker: null, video: null, stream: null, running: false, initPromise: null,
  feat: null, lastFace: 0, lastVideoTime: -1, lastDetectTs: 0, lastGoodAt: 0,
  cal: load(),              // v4 normalized [0,1] models: { v:4, gaze, head, err, baseOpen, pts }
  pt: null,                 // smoothed screen point [x, y]
  rawBuf: [],               // 3-frame median pre-filter buffer
  euro: null,               // 1-Euro filter state
  snapPx: 140, preview: false,
  calibrating: false, verifying: false, verifyMode: 'gaze', collecting: null,
};

function load() {
  try {
    const c = JSON.parse(localStorage.getItem(LS_CAL));
    return (c && c.v === CAL_VERSION && c.gaze && c.head) ? c : null;
  } catch { return null; }
}
function save() { try { localStorage.setItem(LS_CAL, JSON.stringify(G.cal)); } catch {} }

const status = (s) => {
  const el = document.getElementById('gazeStat'); if (el) el.textContent = s;
  const st = document.getElementById('sGazeStat');
  if (st) { st.textContent = G.mode === 'mouse' ? '' : s; st.dataset.bad = /found|error|שגיאה|נמצאו|needs|צריך/i.test(s) ? '1' : ''; }
  const rb = document.getElementById('sRecal');
  if (rb) rb.style.display = G.mode === 'mouse' ? 'none' : '';
  const tb = document.getElementById('sTestGaze');
  if (tb) tb.style.display = G.mode === 'mouse' ? 'none' : '';
};

function resetFilter() {
  G.pt = null; G.rawBuf = []; G.euro = null; G.lastGoodAt = 0; snapped = null;
}

/* ---------------- camera + model ---------------- */
async function ensureRunning() {
  if (G.running) return;
  if (G.initPromise) return G.initPromise;
  G.initPromise = (async () => {
    try {
      status(t('gz.loading'));
      const { FaceLandmarker, FilesetResolver } = await import(`${MP}/vision_bundle.mjs`);
      const files = await FilesetResolver.forVisionTasks(`${MP}/wasm`);
      const opts = (delegate) => ({
        baseOptions: { modelAssetPath: MODEL, delegate },
        runningMode: 'VIDEO', numFaces: 1,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true,
      });
      try { G.landmarker = await FaceLandmarker.createFromOptions(files, opts('GPU')); }
      catch { G.landmarker = await FaceLandmarker.createFromOptions(files, opts('CPU')); }
      status(t('gz.perm'));
      G.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 }, facingMode: 'user' },
        audio: false,
      });
      G.video = Object.assign(document.createElement('video'), { muted: true, playsInline: true, srcObject: G.stream });
      await G.video.play();
      G.running = true;
      status(t('gz.on'));
      requestAnimationFrame(tick);
    } catch (e) {
      G.initPromise = null;
      throw e;
    }
  })();
  return G.initPromise;
}

function stopCamera() {
  G.running = false; G.initPromise = null;
  G.stream?.getTracks().forEach(tr => tr.stop());
  G.stream = null; G.video = null;
  resetFilter();
}

/* ---------------- isotropic multi-cue feature extraction ---------------- */
const BS_KEYS = [
  'eyeLookInLeft', 'eyeLookOutLeft', 'eyeLookUpLeft', 'eyeLookDownLeft',
  'eyeLookInRight', 'eyeLookOutRight', 'eyeLookUpRight', 'eyeLookDownRight',
  'eyeBlinkLeft', 'eyeBlinkRight',
];

function avg3(lm, ids, ar) {
  let x = 0, y = 0, z = 0;
  for (const i of ids) { x += lm[i].x; y += lm[i].y / ar; z += lm[i].z; }
  const n = ids.length;
  return [x / n, y / n, z / n];
}
function norm3(v) {
  const l = Math.hypot(v[0], v[1], v[2]) || 1e-6;
  return [v[0] / l, v[1] / l, v[2] / l];
}
function cross3(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function eyeMetrics(lm, iris, c1, c2, upIds, loIds, ar) {
  const p = i => [lm[i].x * ar, lm[i].y];
  const p1 = p(c1), p2 = p(c2);
  const [a, b] = p1[0] < p2[0] ? [p1, p2] : [p2, p1];
  const dx = b[0] - a[0], dy = b[1] - a[1], w = Math.hypot(dx, dy) || 1e-6;
  const ux = dx / w, uy = dy / w;       // along eye (image-left -> image-right)
  const vx = -uy, vy = ux;              // across eye (image-down)
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  const proj = pt => [
    ((pt[0] - mx) * ux + (pt[1] - my) * uy) / w,
    ((pt[0] - mx) * vx + (pt[1] - my) * vy) / w,
  ];
  // Stabilize iris center with the 4 iris ring landmarks when present (478-landmark model)
  let ix0 = lm[iris].x * ar, iy0 = lm[iris].y;
  if (lm.length >= iris + 5) {
    let rx = 0, ry = 0;
    for (let j = 1; j <= 4; j++) { rx += lm[iris + j].x * ar; ry += lm[iris + j].y; }
    ix0 = ix0 * 0.6 + (rx / 4) * 0.4;
    iy0 = iy0 * 0.6 + (ry / 4) * 0.4;
  }
  const irisPt = [ix0, iy0];
  const [ix, iy] = proj(irisPt);
  let upx = 0, upy = 0, lox = 0, loy = 0;
  for (const i of upIds) { upx += lm[i].x * ar; upy += lm[i].y; }
  for (const i of loIds) { lox += lm[i].x * ar; loy += lm[i].y; }
  const upY = proj([upx / upIds.length, upy / upIds.length])[1];
  const loY = proj([lox / loIds.length, loy / loIds.length])[1];
  return { ix, iy, upY, open: Math.max(0, loY - upY), w, irisPt };
}

function features(lm, bsList, matData, vw, vh) {
  const ar = (vw && vh) ? (vw / vh) : (4 / 3);
  const r = eyeMetrics(lm, 468, 33, 133, [158, 159, 160], [144, 145, 153], ar);
  const l = eyeMetrics(lm, 473, 362, 263, [385, 386, 387], [373, 374, 380], ar);
  const wSum = (r.w + l.w) || 1e-6;
  const wr = r.w / wSum, wl = l.w / wSum;

  // Negate horizontal so +ex = looking screen right (standard unmirrored webcam), +ey = looking down
  // Separate rx / lx preserve single-eye abduction near side edges; signed quadratic ex2/ey2 capture sin->tan edge expansion
  const rx = -r.ix;
  const lx = -l.ix;
  const ex = -(wr * r.ix + wl * l.ix);
  const ey = wr * r.iy + wl * l.iy;
  const ex2 = ex * Math.abs(ex);
  const ey2 = ey * Math.abs(ey);
  const lidUp = wr * r.upY + wl * l.upY;
  const open = Math.min(r.open, l.open);

  // Skull-anchored iris position relative to bone-fixed medial canthi (inner eye corners 133 & 362)
  const ic1 = [lm[133].x * ar, lm[133].y], ic2 = [lm[362].x * ar, lm[362].y];
  const [icA, icB] = ic1[0] < ic2[0] ? [ic1, ic2] : [ic2, ic1];
  const cdx = icB[0] - icA[0], cdy = icB[1] - icA[1], icd = Math.hypot(cdx, cdy) || 1e-6;
  const fux = cdx / icd, fuy = cdy / icd, fvx = -fuy, fvy = fux;
  const imX = (r.irisPt[0] + l.irisPt[0]) / 2 - (icA[0] + icB[0]) / 2;
  const imY = (r.irisPt[1] + l.irisPt[1]) / 2 - (icA[1] + icB[1]) / 2;
  const sx = -((imX * fux + imY * fuy) / icd);
  const sy = (imX * fvx + imY * fvy) / icd;

  // MediaPipe neural gaze & blink blendshapes (ARKit convention)
  let bx = 0, by = 0, blink = 0;
  if (bsList && bsList.length) {
    const bs = {};
    for (const c of bsList) if (BS_KEYS.includes(c.categoryName)) bs[c.categoryName] = c.score;
    bx = 0.5 * (((bs.eyeLookOutRight || 0) - (bs.eyeLookInRight || 0)) + ((bs.eyeLookInLeft || 0) - (bs.eyeLookOutLeft || 0)));
    by = 0.5 * (((bs.eyeLookDownRight || 0) - (bs.eyeLookUpRight || 0)) + ((bs.eyeLookDownLeft || 0) - (bs.eyeLookUpLeft || 0)));
    blink = Math.max(bs.eyeBlinkLeft || 0, bs.eyeBlinkRight || 0);
  }

  // True 3D rigid skull orientation in radians (+yaw = screen right, +pitch = screen down)
  const L3a = avg3(lm, [234, 127, 93, 132], ar);
  const R3a = avg3(lm, [454, 356, 323, 361], ar);
  const [L3, R3] = L3a[0] < R3a[0] ? [L3a, R3a] : [R3a, L3a];   // always image-left -> image-right (handles pre-mirrored cameras)
  const T3 = avg3(lm, [10, 151, 9, 107, 336], ar);
  const B3 = avg3(lm, [152, 175, 199, 148, 377], ar);
  const X3 = norm3([R3[0] - L3[0], R3[1] - L3[1], R3[2] - L3[2]]);
  const Y3 = norm3([B3[0] - T3[0], B3[1] - T3[1], B3[2] - T3[2]]);
  const Z3 = norm3(cross3(Y3, X3));
  const yaw = Math.atan2(-Z3[0], -Z3[2]);
  const pitch = Math.atan2(Z3[1], Math.hypot(Z3[0], Z3[2]));
  const roll = Math.atan2(X3[1], X3[0]);

  // Head translation (nose bridge 168: stable across yaw/pitch) and distance tz (cm)
  const nx = -(lm[168].x - 0.5);
  const ny = lm[168].y - 0.5;
  let tz = 55;
  if (matData && matData.length === 16) {
    const rawTz = Math.abs(matData[14]) > Math.abs(matData[11]) ? Math.abs(matData[14]) : Math.abs(matData[11]);
    if (rawTz >= 20 && rawTz <= 150) tz = rawTz;
  } else {
    tz = Math.max(25, Math.min(120, 2.87 / ((icd / ar) || 0.05)));
  }

  const openThr = G.cal?.baseOpen ? Math.min(0.115, G.cal.baseOpen * 0.52) : 0.095;
  const isBlink = blink > 0.48 || open < openThr;
  return { ex, ey, rx, lx, ex2, ey2, sx, sy, lidUp, bx, by, yaw, pitch, roll, nx, ny, open, blink, isBlink, tz, iris: [lm[468], lm[473]] };
}

/* ---------------- Bayesian LOOCV ridge regression (normalized [0, 1] screen coords) ---------------- */
const GAZE_KEYS = ['ex', 'ey', 'rx', 'lx', 'ex2', 'ey2', 'sx', 'sy', 'lidUp', 'bx', 'by', 'yaw', 'pitch', 'nx', 'ny'];
// Eye features (0..10): tiny numerical floor only so real webcam eye ranges are NEVER over-shrunk toward center!
// Head features (11..14): physical floors prevent 1/std explosions when the head is kept still during calibration.
const GAZE_FLOOR      = [0.004, 0.004, 0.004, 0.004, 0.001, 0.001, 0.004, 0.004, 0.004, 0.015, 0.015, 0.28, 0.24, 0.20, 0.20];
const GAZE_PEN_X      = [1.0,   6.0,   1.4,   1.4,   2.2,   8.0,   1.0,   6.0,   8.0,   1.0,   6.0,   0,    0,    0,    0];
const GAZE_PEN_Y      = [6.0,   1.0,   8.0,   8.0,   8.0,   2.2,   6.0,   1.0,   1.2,   6.0,   1.0,   0,    0,    0,    0];
const GAZE_HEAD_PEN_X = [0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0.9,  6.0,  1.2,  6.0];
const GAZE_HEAD_PEN_Y = [0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     0,     6.0,  0.9,  6.0,  1.2];

const HEAD_KEYS = ['yaw', 'pitch', 'nx', 'ny', 'roll'];
const HEAD_FLOOR = [0.01, 0.01, 0.01, 0.01, 0.05];
const HEAD_PEN_X = [1.0, 6.0, 1.5, 8.0, 8.0];
const HEAD_PEN_Y = [6.0, 1.0, 8.0, 1.5, 8.0];

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function solveLinear(A) {
  const m = A.length;
  const M = A.map(row => row.slice());
  for (let c = 0; c < m; c++) {
    let p = c;
    for (let r = c + 1; r < m; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    const diag = M[c][c] || 1e-12;
    for (let r = 0; r < m; r++) if (r !== c) {
      const f = M[r][c] / diag;
      for (let j = c; j <= m; j++) M[r][j] -= f * M[c][j];
    }
  }
  return M.map((row, i) => row[m] / (row[i] || 1e-12));
}

/* Robust per-dot aggregation: reject blinks, trim early saccade settle frames, keep tightest MAD cluster */
function cleanPoint(frames) {
  if (!frames.length) return null;
  let valid = frames.filter(f => !f.isBlink);
  if (valid.length < 4) {
    valid = [...frames].sort((a, b) => (a.blink - b.blink) || (b.open - a.open))
      .slice(0, Math.max(3, Math.ceil(frames.length * 0.5)));
  }
  if (valid.length >= 10) valid = valid.slice(Math.floor(valid.length * 0.15));
  const meds = GAZE_KEYS.map(k => median(valid.map(f => f[k])));
  const mads = GAZE_KEYS.map((k, j) => Math.max(1e-4, median(valid.map(f => Math.abs(f[k] - meds[j])))));
  const poseEnd = GAZE_KEYS.indexOf('nx');
  const scored = valid.map(f => {
    let d = 0;
    for (let j = 0; j < poseEnd; j++) {
      const z = (f[GAZE_KEYS[j]] - meds[j]) / (1.4826 * mads[j] + 0.004);
      d += z * z;
    }
    return { f, d };
  }).sort((a, b) => a.d - b.d);
  const keep = scored.slice(0, Math.max(3, Math.ceil(scored.length * 0.65))).map(x => x.f);
  const out = {};
  for (const k of [...GAZE_KEYS, 'roll', 'open']) out[k] = keep.reduce((s, f) => s + f[k], 0) / keep.length;
  out.tz = median(keep.map(f => f.tz || 55));
  return out;
}

function fitAxisLOOCV(X, y, weights, penMult, fixedPen, prior) {
  const n = X.length, m = X[0].length;
  const lambdas = [0.04, 0.12, 0.35, 1.0, 2.8, 7.0];
  const solveFor = (Xs, ys, ws, lam) => {
    const A = Array.from({ length: m }, () => Array(m + 1).fill(0));
    for (let i = 0; i < Xs.length; i++) {
      const x = Xs[i], yi = ys[i], wt = ws[i] || 1;
      for (let a = 0; a < m; a++) {
        const wxa = wt * x[a];
        for (let b = 0; b < m; b++) A[a][b] += wxa * x[b];
        A[a][m] += wxa * yi;
      }
    }
    for (let a = 1; a < m; a++) {
      const p = lam * penMult[a - 1] + fixedPen[a - 1];
      A[a][a] += p;
      A[a][m] += p * prior[a - 1];
    }
    return solveLinear(A);
  };
  let bestL = 0.35, bestErr = Infinity;
  for (const lam of lambdas) {
    let sq = 0;
    for (let i = 0; i < n; i++) {
      const w = solveFor(
        X.filter((_, j) => j !== i),
        y.filter((_, j) => j !== i),
        weights.filter((_, j) => j !== i),
        lam
      );
      const pred = w.reduce((s, wi, j) => s + wi * X[i][j], 0);
      sq += (weights[i] || 1) * (pred - y[i]) ** 2;
    }
    if (sq < bestErr) { bestErr = sq; bestL = lam; }
  }
  return { w: solveFor(X, y, weights, bestL), lam: bestL, loocv: Math.sqrt(bestErr / n) };
}

/* Center-anchored piecewise edge stretch: counters ridge shrinkage toward 0.5 on left/right/top/bottom edges */
function stretchAxis(rawPreds, targets) {
  const pairs = rawPreds.map((p, i) => ({ p, t: targets[i] }));
  const ctr = pairs.filter(x => x.t > 0.35 && x.t < 0.65);
  const lo = pairs.filter(x => x.t < 0.22);
  const hi = pairs.filter(x => x.t > 0.78);
  const cTarget = ctr.length ? median(ctr.map(x => x.t)) : 0.5;
  const cRaw = ctr.length ? median(ctr.map(x => x.p)) : 0.5;
  const clampScale = s => Math.max(0.85, Math.min(1.55, s));
  let loScale = 1, hiScale = 1;
  if (lo.length) {
    const loT = median(lo.map(x => x.t)), loP = median(lo.map(x => x.p));
    if (cRaw - loP > 0.08) loScale = clampScale((cTarget - loT) / (cRaw - loP));
  }
  if (hi.length) {
    const hiT = median(hi.map(x => x.t)), hiP = median(hi.map(x => x.p));
    if (hiP - cRaw > 0.08) hiScale = clampScale((hiT - cTarget) / (hiP - cRaw));
  }
  return { cRaw, cTarget, loScale, hiScale };
}
function applyStretch(val, st) {
  if (!st) return val;
  const d = val - st.cRaw;
  return st.cTarget + d * (d < 0 ? st.loScale : st.hiScale);
}

function fitMode(pts, mode, aspect) {
  const isGaze = mode === 'gaze';
  const keys = isGaze ? GAZE_KEYS : HEAD_KEYS;
  const floor = isGaze ? GAZE_FLOOR : HEAD_FLOOR;
  const penX = isGaze ? GAZE_PEN_X : HEAD_PEN_X;
  const penY = isGaze ? GAZE_PEN_Y : HEAD_PEN_Y;
  const fixX = isGaze ? GAZE_HEAD_PEN_X : Array(keys.length).fill(0);
  const fixY = isGaze ? GAZE_HEAD_PEN_Y : Array(keys.length).fill(0);
  const n = pts.length, k = keys.length;
  const rows = pts.map(pt => keys.map(key => pt.f[key] ?? 0));
  const weights = pts.map(pt => pt.w || 1);
  const mean = Array(k).fill(0), std = Array(k).fill(0);
  rows.forEach(r => r.forEach((v, j) => mean[j] += v / n));
  rows.forEach(r => r.forEach((v, j) => std[j] += (v - mean[j]) ** 2 / n));
  const scale = std.map((v, j) => Math.max(Math.sqrt(v), floor[j]));
  const X = rows.map(r => [1, ...r.map((v, j) => (v - mean[j]) / scale[j])]);
  const us = pts.map(pt => pt.u), vs = pts.map(pt => pt.v);

  const priorX = Array(k).fill(0), priorY = Array(k).fill(0);
  if (isGaze) {
    const cov = (xs, ys) => {
      const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
      return xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0);
    };
    const idxEx = keys.indexOf('ex'), idxSx = keys.indexOf('sx');
    const idxYaw = keys.indexOf('yaw'), idxPitch = keys.indexOf('pitch');
    const idxNx = keys.indexOf('nx'), idxNy = keys.indexOf('ny');
    const signX = (cov(rows.map(r => r[idxEx]), us) < 0 && cov(rows.map(r => r[idxSx]), us) < 0) ? -1 : 1;
    const signY = 1;
    const exSpan = Math.max(...rows.map(r => r[idxEx])) - Math.min(...rows.map(r => r[idxEx]));
    const yawSpan = Math.max(...rows.map(r => r[idxYaw])) - Math.min(...rows.map(r => r[idxYaw]));
    const estRadW = Math.max(0.42, Math.min(1.15, (exSpan / 0.31 + yawSpan) / 0.88));
    const dw = Math.max(0.9, Math.min(1.9, 0.85 / estRadW + 0.15 * 1.4));
    const dh = dw * aspect;
    priorX[idxYaw] = signX * 0.55 * dw * scale[idxYaw];     // 3D yaw compensation (parallax-adjusted)
    priorX[idxNx] = signX * 1.05 * dw * scale[idxNx];       // horizontal head translation
    priorY[idxPitch] = signY * 0.60 * dh * scale[idxPitch]; // 3D pitch compensation (parallax-adjusted)
    priorY[idxNy] = signY * 0.85 * dh * scale[idxNy];       // vertical head translation
  }
  const fx = fitAxisLOOCV(X, us, weights, penX, fixX, priorX);
  const fy = fitAxisLOOCV(X, vs, weights, penY, fixY, priorY);
  const rawU = X.map(x => fx.w.reduce((s, wi, i) => s + wi * x[i], 0));
  const rawV = X.map(x => fy.w.reduce((s, wi, i) => s + wi * x[i], 0));
  return {
    keys, mean, scale, wx: fx.w, wy: fy.w,
    stretchX: stretchAxis(rawU, us),
    stretchY: stretchAxis(rawV, vs),
  };
}

function predictNorm(m, f) {
  const x = [1, ...m.keys.map((k, j) => ((f[k] ?? 0) - m.mean[j]) / m.scale[j])];
  const dot = w => w.reduce((s, wi, i) => s + wi * x[i], 0);
  return [applyStretch(dot(m.wx), m.stretchX), applyStretch(dot(m.wy), m.stretchY)];
}

/* ---------------- 1-Euro adaptive velocity filter (framerate-independent) ---------------- */
function lowPassAlpha(dt, cutoff) {
  const tau = 1 / (2 * Math.PI * cutoff);
  return 1 / (1 + tau / dt);
}
function filterPoint(u, v, now) {
  // 3-frame rolling median eliminates 1-frame landmark glitches with minimal latency
  G.rawBuf.push([u, v]);
  if (G.rawBuf.length > 3) G.rawBuf.shift();
  const mu = median(G.rawBuf.map(p => p[0]));
  const mv = median(G.rawBuf.map(p => p[1]));

  if (!G.euro || now - G.euro.t > 500) {
    G.euro = { t: now, u: mu, v: mv, du: 0, dv: 0 };
    return [mu, mv];
  }
  const dt = Math.max(0.008, Math.min(0.15, (now - G.euro.t) / 1000));
  const dAlpha = lowPassAlpha(dt, 1.5);
  const du = G.euro.du + dAlpha * ((mu - G.euro.u) / dt - G.euro.du);
  const dv = G.euro.dv + dAlpha * ((mv - G.euro.v) / dt - G.euro.dv);
  const speed = Math.hypot(du, dv);
  // Head pointer is cleaner than eye gaze -> slightly higher baseline cutoff for extra snappiness
  const minCutoff = G.mode === 'head' ? 1.1 : 0.72;
  const beta = G.mode === 'head' ? 4.0 : 3.2;
  const cutoff = minCutoff + beta * speed;
  const alpha = lowPassAlpha(dt, cutoff);
  const nu = G.euro.u + alpha * (mu - G.euro.u);
  const nv = G.euro.v + alpha * (mv - G.euro.v);
  G.euro = { t: now, u: nu, v: nv, du, dv };
  return [nu, nv];
}

/* ---------------- main loop ---------------- */
const dot = () => document.getElementById('gazeDot');
function tick() {
  if (!G.running) return;
  const v = G.video;
  let newFrame = false;
  if (v && v.readyState >= 2 && v.videoWidth > 0 && v.videoHeight > 0 && v.currentTime !== G.lastVideoTime) {
    G.lastVideoTime = v.currentTime;
    newFrame = true;
    const now = performance.now();
    const ts = Math.max(Math.round(now), G.lastDetectTs + 1);
    G.lastDetectTs = ts;
    try {
      const res = G.landmarker.detectForVideo(v, ts);
      const lm = res.faceLandmarks?.[0];
      if (lm) {
        const bsList = res.faceBlendshapes?.[0]?.categories;
        const matData = res.facialTransformationMatrixes?.[0]?.data;
        G.feat = features(lm, bsList, matData, v.videoWidth, v.videoHeight);
        G.lastFace = now;
        if (G.collecting) G.collecting.push(G.feat);
        if (G.verifying) G.onVerifyFrame?.(G.feat, now);
      } else {
        G.feat = null;
      }
      if (G.preview) drawPreview(document.getElementById('camPreview'), lm);
      if (G.calibrating) drawCalibStatus(lm);
      const wc = document.getElementById('welcomeCam');
      if (wc && !G.calibrating) {
        drawPreview(wc, lm, true);
        window.onWelcomeCamFrame?.(!!lm);
      }
    } catch (_) {
      // Never let a transient MediaPipe/WebGL frame error kill the tracking loop
    }
  }
  steer(newFrame);
  requestAnimationFrame(tick);
}

function steer(newFrame) {
  const d = dot();
  const activeMode = G.verifying ? G.verifyMode : G.mode;
  if ((!G.verifying && G.mode === 'mouse') || (G.calibrating && !G.verifying)) {
    if (d) d.style.display = 'none';
    return;
  }
  const m = G.cal?.[activeMode];
  if (!m) { status(t('gz.needCal')); if (d) d.style.display = 'none'; return; }
  const now = performance.now();
  if (!G.feat || now - G.lastFace > 450) {
    status(t('gz.noFace'));
    if (d) d.classList.add('lost');
    if (!G.verifying) window.Dwell.gazeTarget(null);
    return;
  }
  if (d) d.classList.remove('lost');

  // Update gaze estimate ONLY when a fresh webcam frame arrives (consistent at 30/60/120 Hz!)
  if (newFrame) {
    if (G.feat.isBlink && G.pt && now - G.lastGoodAt < 380) {
      // Blink freeze: hold steady gaze point so blinking never kicks the dot off a tile or resets dwell
    } else if (G.feat.isBlink) {
      if (!G.verifying) window.Dwell.gazeTarget(null);
      return;
    } else {
      let [u, v] = predictNorm(m, G.feat);
      u = Math.max(-0.04, Math.min(1.04, u));
      v = Math.max(-0.04, Math.min(1.04, v));
      const [fu, fv] = filterPoint(u, v, now);
      G.pt = [
        Math.max(0, Math.min(innerWidth, fu * innerWidth)),
        Math.max(0, Math.min(innerHeight, fv * innerHeight)),
      ];
      G.lastGoodAt = now;
    }
  }
  if (!G.pt) return;
  if (d) {
    d.style.display = 'block';
    d.style.transform = `translate3d(${G.pt[0].toFixed(1)}px, ${G.pt[1].toFixed(1)}px, 0)`;
  }
  if (G.verifying) {
    G.onVerifyPoint?.(G.pt[0], G.pt[1], now);
    return;
  }
  window.Dwell.point = { x: G.pt[0], y: G.pt[1] };
  window.Dwell.gazeTarget(snap(G.pt[0], G.pt[1]));
  status(`${t(G.mode === 'gaze' ? 'gz.eye' : 'gz.head')} · ±${G.cal.err?.[G.mode] ?? '?'}px`);
}

/* snap to the nearest selectable tile, with Schmitt-trigger hysteresis and smart quiet zones */
let snapped = null;
function snap(x, y) {
  const modal = document.querySelector('#modal.on, #calib.on');
  const scope = modal || document;
  const vis = el => {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || cs.pointerEvents === 'none') return null;
    return r;
  };
  const distRect = r => {
    const dx = Math.max(r.left - x, 0, x - r.right);
    const dy = Math.max(r.top - y, 0, y - r.bottom);
    return Math.hypot(dx, dy);
  };

  /* Quiet zones (reading center): keep the reading text genuinely quiet — especially near the bottom
     where Ollie's latest question sits directly above the middle answer — while allowing a wider horizontal
     edge capture band so side-rail tiles stay easy to reach even with mild inward gaze drift. */
  if (!modal) {
    for (const q of document.querySelectorAll('.quiet')) {
      const r = vis(q);
      if (!r) continue;
      const bx = Math.min(G.snapPx * 0.75, r.width * 0.20, 105);
      const by = Math.min(G.snapPx * 0.30, r.height * 0.12, 42);
      if (x >= r.left + bx && x <= r.right - bx && y >= r.top + by && y <= r.bottom - by) {
        snapped = null; return null;
      }
    }
  }

  let best = null, bd = Infinity, bestCenter = Infinity;
  scope.querySelectorAll('.dw').forEach(el => {
    const r = vis(el);
    if (!r) return;
    const d = distRect(r);
    const cd = Math.hypot((r.left + r.right) / 2 - x, (r.top + r.bottom) / 2 - y);
    if (d < bd - 0.5 || (Math.abs(d - bd) <= 0.5 && cd < bestCenter)) {
      bd = d; best = el; bestCenter = cd;
    }
  });

  if (snapped && document.body.contains(snapped) && scope.contains(snapped)) {
    const sr = vis(snapped);
    if (sr) {
      const ds = distRect(sr);
      const insideOther = best && best !== snapped && bd === 0 && ds > 14;
      if (!insideOther && ds <= G.snapPx && ds <= bd + 22) return snapped;
    }
  }
  snapped = bd <= G.snapPx ? best : null;
  return snapped;
}

/* ---------------- calibration ---------------- */
const sleep = ms => new Promise(r => setTimeout(r, ms));
let setupFaceStreak = 0;
function drawCalibStatus(lm) {
  const c = document.getElementById('calibCam');
  if (c) drawPreview(c, lm, true);
  const camEl = document.getElementById('calibCamStat');
  const camOk = !!(G.video && G.video.readyState >= 2 && G.video.videoWidth > 0);
  if (camEl) {
    camEl.textContent = camOk ? `${t('cal.camOk')} (${G.video.videoWidth}×${G.video.videoHeight})` : t('cal.camWait');
    camEl.dataset.ok = camOk ? '1' : '0';
  }
  const f = document.getElementById('calibFace');
  const faceOk = !!(lm && G.feat);
  setupFaceStreak = faceOk ? Math.min(30, setupFaceStreak + 1) : 0;
  if (f) {
    f.textContent = faceOk ? t('cal.faceOk') : t('cal.faceWait');
    f.dataset.ok = faceOk ? '1' : '0';
  }
  const beginBtn = document.getElementById('calBegin');
  if (beginBtn) beginBtn.disabled = !(camOk && setupFaceStreak >= 10);
}

/* ---------------- closed-loop 6-target side & corner validation + auto-refinement ---------------- */
const RING_CIRC = 226;

async function runValidationLoop({ ov, msg, stepEl, finalPts, targetMode, aspect, refitAll, deg }) {
  const errVal = G.cal.err?.[targetMode] ?? G.cal.err?.gaze ?? 80;
  const qTxt = errVal <= 95 ? `<span style="color:var(--ok)">${t('cal.qGood')}</span>`
    : errVal <= 150 ? `<span style="color:var(--warn)">${t('cal.qFair')}</span>`
    : `<span style="color:var(--bad)">${t('cal.qLow')}</span>`;
  if (stepEl) stepEl.textContent = '';

  G.verifying = true; G.verifyMode = targetMode;
  resetFilter();
  ov.classList.add('verify');

  const rings = [...ov.querySelectorAll('.cal-ring')];
  const circles = rings.map(r => r.querySelector('circle'));
  const errEls = rings.map(r => r.querySelector('.cal-err'));
  const N = rings.length;
  const hits = Array(N).fill(false);
  const dwellMs = Array(N).fill(0);
  const errSamples = Array.from({ length: N }, () => []);
  const autoDone = Array(N).fill(false);
  const refinedFlags = Array(N).fill(false);
  const confirmedErr = Array(N).fill(0);
  let currentIdx = 0;
  let currentSetAt = performance.now();
  let lastAutoAt = 0;
  let fixBuf = [];

  rings.forEach((r, i) => {
    r.classList.remove('hit', 'active', 'current');
    if (circles[i]) circles[i].style.strokeDashoffset = String(RING_CIRC);
    if (errEls[i]) errEls[i].textContent = '';
  });

  const syncCurrent = () => {
    const nextIdx = hits.indexOf(false);
    if (nextIdx !== currentIdx) {
      currentIdx = nextIdx;
      currentSetAt = performance.now();
      fixBuf = [];
    }
    rings.forEach((r, i) => r.classList.toggle('current', !hits[i] && i === currentIdx));
  };
  syncCurrent();

  const okBtn = document.getElementById('calOk');
  const agBtn = document.getElementById('calAgain');
  const skipBtn = document.getElementById('calSkip');

  const updateOkBtn = () => {
    const nHit = hits.filter(Boolean).length;
    if (okBtn) {
      okBtn.disabled = nHit < N;
      okBtn.textContent = nHit >= N ? t('cal.okBtn') : t('cal.okWait', { n: nHit });
    }
    if (nHit >= N) {
      const avgErr = Math.round(confirmedErr.reduce((a, b) => a + b, 0) / N);
      if (G.cal?.err) { G.cal.err[targetMode] = avgErr; save(); }
      msg.innerHTML = t('cal.confirmed', { g: avgErr, gd: deg(avgErr) });
      window.rettinaLog?.('gaze.verified', `${N}/${N} side & corner targets confirmed · avg ±${avgErr}px (${targetMode})`);
    } else {
      msg.innerHTML = t('cal.done', { n: nHit, g: G.cal.err?.[targetMode] ?? errVal, gd: deg(G.cal.err?.[targetMode] ?? errVal), q: qTxt });
    }
  };
  updateOkBtn();

  G.onVerifyFrame = (feat, now) => {
    if (!feat || feat.isBlink) return;
    fixBuf.push({ ...feat, _ts: now });
    while (fixBuf.length > 28 || (fixBuf.length && now - fixBuf[0]._ts > 1100)) fixBuf.shift();
  };

  let lastVT = performance.now();
  let lastPx = null;
  let retry = false, cancelled = false;

  const isSteadyFixation = () => {
    if (fixBuf.length < 16) return false;
    const span = fixBuf[fixBuf.length - 1]._ts - fixBuf[0]._ts;
    if (span < 550) return false;
    const exs = fixBuf.map(f => f.ex), eys = fixBuf.map(f => f.ey), yaws = fixBuf.map(f => f.yaw);
    const rng = a => Math.max(...a) - Math.min(...a);
    return rng(exs) < 0.045 && rng(eys) < 0.045 && rng(yaws) < 0.025;
  };

  G.onVerifyPoint = (gx, gy, now) => {
    const dt = Math.min(80, Math.max(0, now - lastVT));
    lastVT = now;
    lastPx = [gx, gy];
    const hitR = Math.max(105, G.snapPx * 0.78);
    const needMs = 550;
    const W = innerWidth, H = innerHeight;

    rings.forEach((r, i) => {
      if (hits[i]) return;
      const b = r.getBoundingClientRect();
      const cx = (b.left + b.right) / 2, cy = (b.top + b.bottom) / 2;
      const dist = Math.hypot(gx - cx, gy - cy);
      const inside = dist <= hitR;
      r.classList.toggle('active', inside);
      if (inside) {
        dwellMs[i] += dt;
        errSamples[i].push(dist);
        if (dwellMs[i] >= needMs) {
          hits[i] = true;
          const medE = Math.round(median(errSamples[i]));
          confirmedErr[i] = medE;
          r.classList.remove('active', 'current');
          r.classList.add('hit');
          if (circles[i]) circles[i].style.strokeDashoffset = '0';
          if (errEls[i]) errEls[i].textContent = `±${medE}px${refinedFlags[i] ? ' · ' + t('cal.refinedTag') : ''}`;
          window.uiTick?.();
          syncCurrent();
          updateOkBtn();
          return;
        }
      } else {
        dwellMs[i] = Math.max(0, dwellMs[i] - dt * 0.45);
        if (dwellMs[i] === 0) errSamples[i] = [];
      }
      if (circles[i]) circles[i].style.strokeDashoffset = String(RING_CIRC * (1 - Math.min(1, dwellMs[i] / needMs)));
    });

    // Steady-fixation closed-loop auto-refinement for side/corner misses
    if (currentIdx >= 0 && !hits[currentIdx] && !autoDone[currentIdx] && finalPts &&
        now - currentSetAt > 1100 && now - lastAutoAt > 1200 && isSteadyFixation()) {
      const r = rings[currentIdx];
      const b = r.getBoundingClientRect();
      const cx = (b.left + b.right) / 2, cy = (b.top + b.bottom) / 2;
      const dist = Math.hypot(gx - cx, gy - cy);
      const sameSide = (cx < W / 2 && gx < W * 0.46) || (cx > W / 2 && gx > W * 0.54);
      const sameVert = Math.abs(gy - cy) < H * 0.36;
      if (dist > hitR && sameSide && sameVert) {
        const clean = cleanPoint(fixBuf);
        if (clean) {
          autoDone[currentIdx] = true;
          lastAutoAt = now;
          refinedFlags[currentIdx] = true;
          finalPts.push({ f: clean, u: cx / W, v: cy / H, w: 2 });
          refitAll();
          resetFilter();
          const ping = document.createElement('div');
          ping.className = 'cal-ping'; ping.style.left = cx + 'px'; ping.style.top = cy + 'px';
          ov.appendChild(ping); setTimeout(() => ping.remove(), 650);
          msg.innerHTML = t('cal.autoRefine', { idx: currentIdx + 1, n: hits.filter(Boolean).length });
          if (G.feat) steer(true);
        }
      }
    }
  };

  // Seed dot position immediately so it's visible on frame 1
  if (G.feat) steer(true);

  await new Promise(resolve => {
    let refined = 0, busy = false, done = false;
    const finish = (doRetry = false, didCancel = false) => {
      if (done) return;
      done = true; retry = doRetry; cancelled = didCancel;
      G.onVerifyPoint = null;
      G.onVerifyFrame = null;
      ov.removeEventListener('click', onClick);
      okBtn?.removeEventListener('click', onDone);
      agBtn?.removeEventListener('click', onRetry);
      skipBtn?.removeEventListener('click', onSkip);
      removeEventListener('keydown', onEsc);
      resolve();
    };
    const onDone = e => { e.stopPropagation(); if (!okBtn?.disabled) finish(false, false); };
    const onSkip = e => { e.stopPropagation(); finish(false, false); };
    const onRetry = e => { e.stopPropagation(); finish(true, false); };
    const onEsc = e => {
      if (e.key === 'Escape') finish(false, true);
      if (e.key === 'Enter' && !okBtn?.disabled) finish(false, false);
    };
    const onClick = async e => {
      if (busy || e.target.closest('#calibActs') || !finalPts) return;
      busy = true;
      const ping = document.createElement('div');
      ping.className = 'cal-ping'; ping.style.left = e.clientX + 'px'; ping.style.top = e.clientY + 'px';
      ov.appendChild(ping); setTimeout(() => ping.remove(), 650);
      G.collecting = [];
      const end = performance.now() + 500;
      while (G.collecting.filter(f => !f.isBlink).length < 10 && performance.now() < end) await sleep(40);
      const got = G.collecting || []; G.collecting = null;
      const clean = cleanPoint(got);
      if (clean) {
        finalPts.push({ f: clean, u: e.clientX / innerWidth, v: e.clientY / innerHeight, w: 2 });
        refitAll();
        resetFilter();
        refined++;
        if (hits.filter(Boolean).length < N) {
          msg.innerHTML = t('cal.refine', { n: refined, h: hits.filter(Boolean).length });
        }
        if (G.feat) steer(true);
      }
      busy = false;
    };
    okBtn?.addEventListener('click', onDone);
    agBtn?.addEventListener('click', onRetry);
    skipBtn?.addEventListener('click', onSkip);
    ov.addEventListener('click', onClick);
    addEventListener('keydown', onEsc);
  });

  G.verifying = false; G.onVerifyPoint = null; G.onVerifyFrame = null;
  ov.classList.remove('verify');
  return { retry, cancelled };
}

async function calibrate(forMode, opts) {
  await ensureRunning();
  G.calibrating = true; G.verifying = false;
  setupFaceStreak = 0;
  resetFilter();
  window.Dwell.reset?.();
  const d = dot(); if (d) d.style.display = 'none';

  const ov = document.getElementById('calib'), pt = document.getElementById('calibDot');
  const msg = document.getElementById('calibMsg'), stepEl = document.getElementById('calibStep');
  const progEl = document.getElementById('calibProg');
  const setProg = p => { if (progEl) progEl.style.strokeDashoffset = String(151 * (1 - Math.max(0, Math.min(1, p)))); };
  setProg(0);
  ov.classList.remove('verify');
  const skipGate = !!(opts?.skipGate && G.video && G.video.readyState >= 2 && G.video.videoWidth > 0 && G.feat && performance.now() - G.lastFace < 600);
  ov.classList.add('on', 'real');
  if (!skipGate) ov.classList.add('setup');
  if (stepEl) stepEl.textContent = '';
  let cancelled = false, ok = false, retry = false;
  const onKey = e => { if (e.key === 'Escape') cancelled = true; };
  addEventListener('keydown', onKey);

  // ---------- STEP 0: Mandatory camera & face lock gate (skipped only if already live-verified on Welcome mirror) ----------
  let ready = true;
  if (!skipGate) {
    msg.innerHTML = `<b>${t('cal.setupTitle')}</b><br><small>${t('cal.setupSub')}</small>`;
    const beginBtn = document.getElementById('calBegin'), cancelBtn = document.getElementById('calCancel');
    if (beginBtn) beginBtn.disabled = true;
    drawCalibStatus(null);
    ready = await new Promise(resolve => {
      const clean = (val) => {
        beginBtn?.removeEventListener('click', onGo);
        cancelBtn?.removeEventListener('click', onCan);
        removeEventListener('keydown', onSetupKey);
        resolve(val);
      };
      const onGo = () => { if (!beginBtn?.disabled) clean(true); };
      const onCan = () => { cancelled = true; clean(false); };
      const onSetupKey = e => {
        if (e.key === 'Escape') { cancelled = true; clean(false); }
        if ((e.key === 'Enter' || e.key === ' ') && !beginBtn?.disabled) { e.preventDefault(); clean(true); }
      };
      beginBtn?.addEventListener('click', onGo);
      cancelBtn?.addEventListener('click', onCan);
      addEventListener('keydown', onSetupKey);
    });
    ov.classList.remove('setup');
  }

  if (!ready || cancelled) {
    removeEventListener('keydown', onKey);
    ov.classList.remove('on', 'real', 'setup', 'verify'); pt.classList.remove('shrink', 'paused');
    G.calibrating = false; G.verifying = false;
    resetFilter();
    return false;
  }

  const W = innerWidth, H = innerHeight;
  const mx = Math.round(Math.min(64, W * 0.045)), my = Math.round(Math.min(64, H * 0.065));
  pt.style.transition = 'none';
  pt.style.left = (W / 2) + 'px'; pt.style.top = (H / 2) + 'px';
  void pt.offsetWidth;
  pt.style.transition = '';

  const targetMode = forMode || (G.mode === 'head' ? 'head' : 'gaze');
  const lookMsg = t(targetMode === 'head' ? 'cal.lookHead' : 'cal.look');
  msg.innerHTML = lookMsg;

  const wait = async (ms) => {
    const end = performance.now() + ms;
    while (!cancelled && performance.now() < end) await sleep(Math.min(50, end - performance.now()));
  };

  // ---------- STEP 1 & 2: Frame-locked dot collection (pauses if face lost!) ----------
  let stepNum = 0;
  const totalSteps = 13;
  const showAt = async (p, needFrames, activeMsg) => {
    stepNum++;
    if (stepEl) stepEl.textContent = `${stepNum} / ${totalSteps}`;
    setProg(0);
    pt.classList.remove('paused', 'shrink');
    pt.style.left = p[0] + 'px'; pt.style.top = p[1] + 'px';
    await wait(480);
    if (cancelled) return [];

    let earlyLock = false;
    const onDotClick = () => { earlyLock = true; };
    const onSpace = e => { if (e.key === ' ') { e.preventDefault(); earlyLock = true; } };
    pt.addEventListener('click', onDotClick);
    addEventListener('keydown', onSpace);

    G.collecting = [];
    while (!cancelled) {
      const faceLive = !!(G.feat && performance.now() - G.lastFace < 450);
      pt.classList.toggle('paused', !faceLive);
      if (!faceLive) {
        msg.innerHTML = `<b style="color:var(--bad)">${t('cal.faceLost')}</b>`;
      } else if (msg.innerHTML !== activeMsg) {
        msg.innerHTML = activeMsg;
      }
      const cleanN = G.collecting.filter(f => !f.isBlink).length;
      setProg(cleanN / needFrames);
      if (cleanN >= needFrames || (earlyLock && cleanN >= 8)) break;
      await sleep(40);
    }
    pt.removeEventListener('click', onDotClick);
    removeEventListener('keydown', onSpace);
    pt.classList.remove('paused');
    setProg(1);
    const got = G.collecting || []; G.collecting = null;
    await wait(120);
    return got;
  };

  const grid = [[.5, .5], [0, 0], [.5, 0], [1, 0], [1, .5], [1, 1], [.5, 1], [0, 1], [0, .5]]
    .map(([u, v]) => [mx + u * (W - 2 * mx), my + v * (H - 2 * my)]);

  const pts9 = [], allFrames = [];
  for (const p of grid) {
    if (cancelled) break;
    const got = await showAt(p, 18, lookMsg);
    const clean = cleanPoint(got);
    if (clean) {
      pts9.push({ f: clean, u: p[0] / W, v: p[1] / H, w: 1 });
      allFrames.push(...got);
    }
  }

  if (!cancelled && pts9.length >= 7) {
    const aspect = W / H;
    const m9 = {
      gaze: fitMode(pts9, 'gaze', aspect),
      head: fitMode(pts9, 'head', aspect),
    };

    // Out-of-sample validation right over the side-rail tile zones BEFORE 13-point refit
    const checkMsg = t('cal.check');
    msg.innerHTML = checkMsg;
    const test = [[.08, .32], [.92, .32], [.92, .68], [.08, .68]].map(([u, v]) => [u * W, v * H]);
    const errs = { gaze: [], head: [] };
    const pts13 = [...pts9];
    for (const p of test) {
      if (cancelled) break;
      const got = await showAt(p, 14, checkMsg);
      const nonBlink = got.filter(f => !f.isBlink);
      const evalFrames = nonBlink.length >= 3 ? nonBlink : got;
      for (const mode of ['gaze', 'head']) {
        evalFrames.forEach(f => {
          const [qu, qv] = predictNorm(m9[mode], f);
          errs[mode].push(Math.hypot(qu * W - p[0], qv * H - p[1]));
        });
      }
      const clean = cleanPoint(got);
      if (clean) pts13.push({ f: clean, u: p[0] / W, v: p[1] / H, w: 1 });
    }

    if (!cancelled) {
      const finalPts = pts13.length >= 10 ? pts13 : pts9;
      const refitAll = () => {
        const baseOpen = median(finalPts.map(x => x.f.open));
        G.cal = {
          v: CAL_VERSION,
          gaze: fitMode(finalPts, 'gaze', aspect),
          head: fitMode(finalPts, 'head', aspect),
          err: { gaze: Math.round(median(errs.gaze)), head: Math.round(median(errs.head)) },
          baseOpen,
          pts: finalPts,
        };
        save();
      };
      refitAll();
      ok = true;
      const deg = px => (Math.atan(px / 45 / 55) * 180 / Math.PI).toFixed(1);
      window.rettinaLog?.('gaze.calibrate', `${allFrames.length} frames (${finalPts.length} pts) · median error eye ${G.cal.err.gaze}px (≈${deg(G.cal.err.gaze)}°) · head ${G.cal.err.head}px (≈${deg(G.cal.err.head)}°)`);

      const res = await runValidationLoop({ ov, msg, stepEl, finalPts, targetMode, aspect, refitAll, deg });
      retry = res.retry;
      if (res.cancelled) { cancelled = true; ok = false; }
    }
  } else if (!cancelled) {
    msg.textContent = t('cal.noFace');
    await wait(2200);
  }

  removeEventListener('keydown', onKey);
  ov.classList.remove('on', 'real', 'setup', 'verify'); pt.classList.remove('shrink', 'paused');
  setProg(0);
  G.calibrating = false; G.verifying = false;
  resetFilter();
  if (retry) return calibrate(forMode);
  return ok;
}

async function validateCalibration(forMode) {
  const targetMode = forMode || (G.mode === 'head' ? 'head' : 'gaze');
  if (!G.cal?.[targetMode] || !G.cal?.pts?.length) return calibrate(targetMode);
  await ensureRunning();
  G.calibrating = true; G.verifying = false;
  resetFilter();
  window.Dwell.reset?.();
  const d = dot(); if (d) d.style.display = 'none';

  const ov = document.getElementById('calib');
  const msg = document.getElementById('calibMsg');
  const stepEl = document.getElementById('calibStep');
  ov.classList.remove('setup');
  ov.classList.add('on', 'real', 'verify');

  const aspect = innerWidth / innerHeight;
  const finalPts = [...G.cal.pts];
  const refitAll = () => {
    const baseOpen = median(finalPts.map(x => x.f.open));
    G.cal = {
      ...G.cal,
      v: CAL_VERSION,
      gaze: fitMode(finalPts, 'gaze', aspect),
      head: fitMode(finalPts, 'head', aspect),
      baseOpen,
      pts: finalPts,
    };
    save();
  };
  const deg = px => (Math.atan(px / 45 / 55) * 180 / Math.PI).toFixed(1);
  const res = await runValidationLoop({ ov, msg, stepEl, finalPts, targetMode, aspect, refitAll, deg });
  ov.classList.remove('on', 'real', 'setup', 'verify');
  G.calibrating = false; G.verifying = false;
  resetFilter();
  if (res.retry) return calibrate(targetMode);
  return !res.cancelled;
}

/* ---------------- camera preview ---------------- */
function drawPreview(c, lm, guide = false) {
  if (!c || !G.video) return;
  const ctx = c.getContext('2d');
  ctx.save(); ctx.scale(-1, 1); ctx.drawImage(G.video, -c.width, 0, c.width, c.height); ctx.restore();
  if (guide) {
    ctx.strokeStyle = lm ? '#1f8a6acc' : '#ffffff88';
    ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.ellipse(c.width / 2, c.height / 2, c.width * 0.24, c.height * 0.36, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
  }
  if (!lm) {
    ctx.fillStyle = '#c23b3bcc'; ctx.fillRect(0, c.height - 22, c.width, 22);
    ctx.fillStyle = '#fff'; ctx.font = '12px sans-serif'; ctx.fillText('no face', 8, c.height - 7);
    return;
  }
  for (const i of [468, 473, 33, 133, 362, 263, 159, 145, 386, 374, 168]) {
    const p = lm[i];
    const isIris = i === 468 || i === 473;
    ctx.fillStyle = isIris ? '#22c55e' : '#8b6cf0';
    ctx.beginPath();
    ctx.arc((1 - p.x) * c.width, p.y * c.height, isIris ? 3.5 : 1.5, 0, 7);
    ctx.fill();
  }
}

/* ---------------- public API ---------------- */
window.Gaze = {
  async setMode(mode) {
    G.mode = mode;
    resetFilter();
    window.Dwell.source = mode;
    window.Dwell.reset?.();
    if (mode === 'mouse') {
      status(t('gz.off'));
      const d = dot(); if (d) d.style.display = 'none';
      return;
    }
    try {
      await ensureRunning();
      if (!G.cal?.[mode]) await calibrate(mode);
    } catch (e) {
      status(t('gz.err') + (e.name || e.message));
      window.rettinaLog?.('gaze.error', e.message || e.name);
      throw e;
    }
  },
  async calibrate(mode, opts) {
    try {
      return await calibrate(mode, opts);
    } catch (e) {
      status(t('gz.err') + (e.name || e.message));
      window.rettinaLog?.('gaze.error', e.message || e.name);
      if (opts?.rethrow) throw e;
      return false;
    }
  },
  async validate(mode) {
    try {
      return await validateCalibration(mode);
    } catch (e) {
      status(t('gz.err') + (e.name || e.message));
      window.rettinaLog?.('gaze.error', e.message || e.name);
      return false;
    }
  },
  setPreview(on) { G.preview = on; document.getElementById('camPreview').style.display = on ? 'block' : 'none'; if (on) ensureRunning().catch(() => {}); },
  isCameraOn: () => !!(G.running && G.stream && G.stream.getVideoTracks().some(tr => tr.readyState === 'live')),
  enableCamera: () => ensureRunning(),
  setSnap(px) { G.snapPx = px; },
  snapAt: (x, y) => { window.Dwell.point = { x, y }; return snap(x, y); },
  getCalibration: () => G.cal,
  _internals: { features, cleanPoint, fitMode, predictNorm, filterPoint, resetFilter },
  stop: stopCamera,
};
window.dispatchEvent(new Event('gaze-ready'));

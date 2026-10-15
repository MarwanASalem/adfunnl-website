import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Ada in live 3D: a soft, round, puffy body in a dark cap with the AdFunnl F
// on the front, little noodle arms and short legs. Ported from the character
// draft (claude.ai artifact "Ada Character Concepts"); keep the two in step
// when her look changes. Plain three.js with no React, so the component that
// hosts it (AdaLive) owns sizing, visibility and teardown.

export type AdaMood = "idle" | "hi" | "happy" | "think" | "work" | "wow" | "sleep";

// "perch": she sits on a line with her legs dangling below it (Home, sitting
// on the message bar). The line is 25% up from the canvas's bottom edge
// (PERCH_FLOOR), so the host lines that up with the bar.
// "bubble": standing, her whole body centred in a small round button.
export type AdaFraming = "perch" | "bubble";
export const PERCH_FLOOR = 0.25;

export interface AdaScene {
  setMood(mood: AdaMood): void;
  // Where to look, -1..1 on each axis (screen space, +y up).
  setLook(x: number, y: number): void;
  resize(width: number, height: number): void;
  start(): void;
  stop(): void;
  dispose(): void;
}

// Body: a lumpy ellipsoid, like a cloud.
const PA = 1.2, PB = 1.08, PC = 0.98; // half-width, half-height, half-depth
const BOTTOM = -PB * 1.03, TOP = PB * 0.96;
const LEG = 0.45; // standing leg length below her body
const lumpAt = (x: number, y: number) => {
  const phi = Math.atan2(y / PB, x / PA);
  return 1 + 0.045 * Math.cos(5 * phi + 1.57) + 0.015 * Math.cos(7 * phi + 0.4);
};
function shape(x: number, y: number, z: number) {
  const l = lumpAt(x, y);
  return Math.hypot(x / (l * PA), y / (l * PB), z / PC) - 1;
}
const gradOut = new THREE.Vector3();
function grad(x: number, y: number, z: number) {
  const e = 0.003;
  return gradOut.set(
    shape(x + e, y, z) - shape(x - e, y, z),
    shape(x, y + e, z) - shape(x, y - e, z),
    shape(x, y, z + e) - shape(x, y, z - e),
  ).normalize();
}

type Triple = [number, number, number];
// Hand targets per mood, in body space.
const HANDS: Record<string, { L?: Triple; R?: Triple }> = {
  rest: { L: [-1.6, -0.6, 0.4], R: [1.6, -0.6, 0.4] },
  sitRest: { L: [-1.45, BOTTOM + 0.3, 0.6], R: [1.45, BOTTOM + 0.3, 0.6] },
  hi: { R: [1.75, 1.6, 0.2] },
  happy: { L: [-1.75, 1.45, 0.2], R: [1.75, 1.45, 0.2] },
  think: { R: [0.62, -0.32, 1.02] },
  work: { L: [-1.8, 0.45, 0.3], R: [1.8, 0.45, 0.3] },
  wow: { L: [-1.7, 0.95, 0.45], R: [1.7, 0.95, 0.45] },
  sleep: { L: [-1.45, -0.85, 0.45], R: [1.45, -0.85, 0.45] },
};

const MOODS: Record<AdaMood, { show: string[]; big?: Record<string, number>; look: [number, number] | null }> = {
  idle:  { show: ["eyeL", "eyeR", "smile", "cheekL", "cheekR"], look: null },
  hi:    { show: ["eyeL", "eyeR", "smile", "cheekL", "cheekR"], big: { smile: 1.5 }, look: [0.2, 0.15] },
  happy: { show: ["happyL", "happyR", "smile", "cheekL", "cheekR"], big: { smile: 1.7, cheekL: 1.2, cheekR: 1.2 }, look: [0, 0] },
  think: { show: ["eyeL", "eyeR", "flat", "cheekL", "cheekR"], look: [0.9, 1] },
  work:  { show: ["eyeL", "eyeR", "smile", "cheekL", "cheekR"], look: [0, 1.1] },
  wow:   { show: ["eyeL", "eyeR", "o"], big: { eyeL: 1.25, eyeR: 1.25 }, look: [0, 0.1] },
  sleep: { show: ["sleepL", "sleepR", "flat", "cheekL", "cheekR"], big: { flat: 0.6 }, look: [0, -0.4] },
};

export function createAdaScene(
  canvas: HTMLCanvasElement,
  { framing, calm = false }: { framing: AdaFraming; calm?: boolean },
): AdaScene {
  const sitting = framing === "perch";
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  scene.environment = envTex;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  const key = new THREE.DirectionalLight(0xfff4e6, 1.6); key.position.set(3, 5, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xc9bcff, 1.4); rim.position.set(-4, 3, -5); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x3a2f78, 0.2));

  const disposables: { dispose(): void }[] = [envTex];
  const track = <T extends { dispose(): void }>(x: T) => { disposables.push(x); return x; };

  // Soft clay grain
  const grain = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const g = c.getContext("2d")!; const d = g.createImageData(256, 256);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = 128 + (Math.random() - 0.5) * 90;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255;
    }
    g.putImageData(d, 0, 0); g.filter = "blur(1.2px)"; g.drawImage(c, 0, 0);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 2);
    return track(t);
  })();

  const bodyMat = track(new THREE.MeshPhysicalMaterial({
    color: 0x5a3fd6, roughness: 0.58, clearcoat: 0.18, clearcoatRoughness: 0.5,
    sheen: 0.35, sheenRoughness: 0.5, sheenColor: new THREE.Color(0x9d8cf0),
    bumpMap: grain, bumpScale: 0.35,
  }));
  const limbMat = track(bodyMat.clone());
  limbMat.color.copy(bodyMat.color).lerp(new THREE.Color(0xffffff), 0.05);
  const eyeMat = track(new THREE.MeshPhysicalMaterial({ color: 0x02020b, roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05 }));
  const shineMat = track(new THREE.MeshBasicMaterial({ color: 0xffffff }));
  const cheekMat = track(new THREE.MeshPhysicalMaterial({ color: 0xb7a6ff, roughness: 0.7, transparent: true, opacity: 0.75 }));
  const capMat = track(new THREE.MeshPhysicalMaterial({ color: 0x15131f, roughness: 0.6, sheen: 0.5, sheenRoughness: 0.6, sheenColor: new THREE.Color(0x6b5fa0) }));
  const logoMat = track(new THREE.MeshPhysicalMaterial({ color: 0x6549dd, roughness: 0.45, clearcoat: 0.3 }));
  const cubeMats = [0xf7f4ea, 0x9d8cf0, 0x02020b].map((c) => track(new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.5, clearcoat: 0.3 })));

  // Contact shadow
  const shTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const g = c.getContext("2d")!; const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(20,14,50,0.45)"); gr.addColorStop(0.5, "rgba(20,14,50,0.14)"); gr.addColorStop(1, "rgba(20,14,50,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    return track(new THREE.CanvasTexture(c));
  })();
  const shadowMat = track(new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false }));
  const shadow = new THREE.Mesh(track(new THREE.PlaneGeometry(1, 1)), shadowMat);
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.002;
  scene.add(shadow);

  const sphere = track(new THREE.SphereGeometry(1, 32, 24));
  function capsule(r: number, len: number, mat: THREE.Material) {
    const geo = track(new THREE.CapsuleGeometry(r, Math.max(len - 2 * r, 0.001), 16, 40));
    geo.rotateZ(Math.PI / 2);
    return new THREE.Mesh(geo, mat);
  }

  // ---------- Body ----------
  // A sphere whose vertices are pushed out along their direction to the
  // lumpy surface, with normals from the shape itself so it shades smooth.
  const bodyGeo = track((() => {
    const geo = new THREE.SphereGeometry(1, 112, 84);
    const pos = geo.attributes.position, nor = geo.attributes.normal;
    const dir = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      dir.fromBufferAttribute(pos, i).normalize();
      let lo = 0, hi = 2;
      for (let k = 0; k < 18; k++) { const m = (lo + hi) / 2; if (shape(dir.x * m, dir.y * m, dir.z * m) < 0) lo = m; else hi = m; }
      const x = dir.x * hi, y = dir.y * hi, z = dir.z * hi;
      pos.setXYZ(i, x, y, z);
      const n = grad(x, y, z); nor.setXYZ(i, n.x, n.y, n.z);
    }
    geo.computeBoundingSphere();
    return geo;
  })());
  function surfaceAt(x: number, y: number) {
    if (shape(x, y, 0) > 0) return { z: 0, n: new THREE.Vector3(0, 0, 1) };
    let lo = 0, hi = 2;
    for (let k = 0; k < 22; k++) { const m = (lo + hi) / 2; if (shape(x, y, m) < 0) lo = m; else hi = m; }
    return { z: hi, n: grad(x, y, hi).clone() };
  }

  const root = new THREE.Group(); scene.add(root);
  const squash = new THREE.Group(); root.add(squash);
  const body = new THREE.Group(); squash.add(body);
  body.position.y = sitting ? -BOTTOM - 0.06 : -BOTTOM + LEG;
  body.add(new THREE.Mesh(bodyGeo, bodyMat));

  // ---------- Cap, with the F on the front ----------
  // The crown is moulded on her actual head (each point sits a fixed distance
  // out from the head surface, domed a little on top), so it hugs her
  // everywhere: no head poking through, no gap under the edge.
  const cap = new THREE.Group();
  // Turned a little to her left so the brim always shows from the front.
  cap.position.set(0.02, TOP - 0.33, 0); cap.rotation.set(-0.06, 0.45, -0.1);
  {
    const THICK = 0.05, DOME = 0.12;
    const q = new THREE.Quaternion().setFromEuler(cap.rotation), P0 = cap.position, w = new THREE.Vector3();
    // How far from the cap's centre, along a direction in the cap's own
    // frame, her head surface is.
    const toHead = (dir: THREE.Vector3) => {
      w.copy(dir).applyQuaternion(q);
      let lo = 0, hi = 2.5;
      for (let k = 0; k < 26; k++) {
        const m = (lo + hi) / 2;
        if (shape(P0.x + w.x * m, P0.y + w.y * m, P0.z + w.z * m) < 0) lo = m; else hi = m;
      }
      return hi;
    };
    const d = new THREE.Vector3();
    let crownGeo: THREE.BufferGeometry = new THREE.SphereGeometry(1, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2);
    crownGeo.deleteAttribute("uv"); crownGeo.deleteAttribute("normal");
    crownGeo = track(mergeVertices(crownGeo));
    const cp = crownGeo.attributes.position;
    for (let i = 0; i < cp.count; i++) {
      d.fromBufferAttribute(cp, i).normalize();
      const r = toHead(d) + THICK + DOME * d.y * d.y;
      cp.setXYZ(i, d.x * r, d.y * r, d.z * r);
    }
    crownGeo.computeVertexNormals();
    cap.add(new THREE.Mesh(crownGeo, capMat));
    const top = toHead(d.set(0, 1, 0)) + THICK + DOME;
    const button = new THREE.Mesh(sphere, capMat);
    button.scale.set(0.07, 0.04, 0.07); button.position.y = top - 0.01; cap.add(button);
    // Brim: its inner edge follows the crown's front edge; its outer edge
    // sweeps forward, bent down at the sides and tipped down like a real cap.
    const brimGeo = track((() => {
      const s = new THREE.Shape(), N = 32, reach = 0.62, inner: number[] = [];
      for (let k = 0; k <= N; k++) { const a = (k / N) * Math.PI; inner.push(toHead(d.set(Math.cos(a), 0, Math.sin(a))) + THICK * 0.6); }
      const wide = inner[0] + 0.04;
      for (let k = 0; k <= N; k++) {
        const a = (k / N) * Math.PI, r = inner[k] + 0.04 + reach * Math.sin(a) ** 1.4;
        if (k) s.lineTo(r * Math.cos(a), r * Math.sin(a)); else s.moveTo(r * Math.cos(a), r * Math.sin(a));
      }
      for (let k = N; k >= 0; k--) { const a = (k / N) * Math.PI; s.lineTo(inner[k] * Math.cos(a), inner[k] * Math.sin(a)); }
      const g = new THREE.ExtrudeGeometry(s, { depth: 0.035, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.018, bevelSegments: 3, curveSegments: 8 });
      g.rotateX(Math.PI / 2);
      const p = g.attributes.position, far = inner[N / 2] + reach;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), z = p.getZ(i);
        // Bend down only past the crown's edge, so the brim stays flush
        // with the crown where they meet.
        const t = Math.min(N, Math.max(0, (Math.atan2(Math.max(z, 0), x) / Math.PI) * N));
        const k0 = Math.floor(t), k1 = Math.min(N, k0 + 1);
        const rin = inner[k0] + (inner[k1] - inner[k0]) * (t - k0);
        const past = Math.max(0, Math.hypot(x, z) - rin);
        p.setY(i, p.getY(i) - 0.16 * past - 0.2 * (x / wide) ** 2 * Math.max(0, z) / far);
      }
      g.computeVertexNormals();
      return g;
    })());
    const brim = new THREE.Mesh(brimGeo, capMat);
    brim.position.y = 0.012; cap.add(brim);
    // The F: the logo's three bars, left-aligned and shrinking, on the crown's front.
    const F = new THREE.Group();
    [0.32, 0.245, 0.17].forEach((L, i) => {
      const b = capsule(0.045, L, logoMat); b.scale.z = 0.55;
      b.position.set(-0.16 + L / 2, (1 - i) * 0.1, 0); F.add(b);
    });
    const E = 0.42; d.set(0, Math.sin(E), Math.cos(E));
    const fr = toHead(d) + THICK + DOME * d.y * d.y;
    F.position.set(0, d.y * fr, d.z * fr - 0.005); F.rotation.x = -E;
    cap.add(F);
  }
  body.add(cap);

  // ---------- Face ----------
  const FX = 0.18, FY = 0.12;
  const face = new THREE.Group(); body.add(face);
  type El = THREE.Object3D & { userData: { home: THREE.Vector3; base: THREE.Vector3; s: number } };
  const els: Record<string, El> = {};
  const Z = new THREE.Vector3(0, 0, 1);
  function addEl(name: string, obj: THREE.Object3D, x: number, y: number, lift: number) {
    const s = surfaceAt(FX + x, FY + y);
    obj.position.set(FX + x, FY + y, s.z + lift);
    obj.quaternion.setFromUnitVectors(Z, s.n);
    obj.userData = { home: obj.position.clone(), base: obj.scale.clone(), s: 0 };
    face.add(obj); els[name] = obj as El; return obj as El;
  }
  function eye() {
    const g = new THREE.Group();
    const p = new THREE.Mesh(sphere, eyeMat); p.scale.set(0.105, 0.145, 0.055); g.add(p);
    const s = new THREE.Mesh(sphere, shineMat); s.scale.setScalar(0.027); s.position.set(0.034, 0.055, 0.05); g.add(s);
    return g;
  }
  function arc(radius: number, tube: number, flip: boolean) {
    const m = new THREE.Mesh(track(new THREE.TorusGeometry(radius, tube, 12, 32, Math.PI)), eyeMat);
    if (flip) m.rotation.z = Math.PI;
    m.scale.z = 0.6;
    const g = new THREE.Group(); g.add(m); return g;
  }
  const EX = 0.25, EY = 0.08;
  const eyeL = addEl("eyeL", eye(), -EX, EY, -0.012);
  const eyeR = addEl("eyeR", eye(), EX, EY, -0.012);
  addEl("happyL", arc(0.088, 0.025, false), -EX, EY - 0.03, 0);
  addEl("happyR", arc(0.088, 0.025, false), EX, EY - 0.03, 0);
  addEl("sleepL", arc(0.078, 0.021, true), -EX, EY + 0.02, 0);
  addEl("sleepR", arc(0.078, 0.021, true), EX, EY + 0.02, 0);
  addEl("smile", arc(0.068, 0.021, true), 0, -0.12, 0);
  const oMouth = new THREE.Group(); const om = new THREE.Mesh(sphere, eyeMat); om.scale.set(0.044, 0.058, 0.025); oMouth.add(om);
  addEl("o", oMouth, 0, -0.15, -0.005);
  const flat = new THREE.Group(); flat.add(capsule(0.017, 0.095, eyeMat));
  addEl("flat", flat, 0.03, -0.14, 0);
  (["L", "R"] as const).forEach((s, k) => {
    const g = new THREE.Group(); const c = new THREE.Mesh(sphere, cheekMat); c.scale.set(0.09, 0.052, 0.012); g.add(c);
    addEl("cheek" + s, g, (k ? 1 : -1) * 0.46, -0.08, -0.004);
  });

  // Thinking dots
  const dots = [0, 1, 2].map(() => {
    const d = new THREE.Mesh(sphere, bodyMat); d.scale.setScalar(0.0001); body.add(d); return d;
  });

  // ---------- Arms and legs ----------
  function mitten(side: number) {
    const g = new THREE.Group();
    const palm = new THREE.Mesh(sphere, limbMat); palm.scale.set(0.24, 0.21, 0.16); g.add(palm);
    const thumb = new THREE.Mesh(sphere, limbMat); thumb.scale.set(0.08, 0.115, 0.085);
    thumb.position.set(side * 0.19, 0.06, 0.03); thumb.rotation.z = -side * 0.5; g.add(thumb);
    body.add(g); return g;
  }
  function foot() {
    const g = new THREE.Group();
    const f = new THREE.Mesh(sphere, limbMat); f.scale.set(0.21, 0.13, 0.27); f.position.z = 0.06; g.add(f);
    body.add(g); return g;
  }
  const hands = { L: mitten(1), R: mitten(-1) };
  const feet = { L: foot(), R: foot() };
  const tube = () => { const m = new THREE.Mesh(new THREE.BufferGeometry(), limbMat); body.add(m); return m; };
  const arms = { L: tube(), R: tube() }, legs = { L: tube(), R: tube() };
  function noodle(mesh: THREE.Mesh, a: THREE.Vector3, c: THREE.Vector3, b: THREE.Vector3, r: number) {
    mesh.geometry.dispose();
    mesh.geometry = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a.clone(), c.clone(), b.clone()), 16, r, 8, false);
  }
  const SHOULDER = { L: new THREE.Vector3(-PA * 0.9, -0.15, 0.15), R: new THREE.Vector3(PA * 0.9, -0.15, 0.15) };
  const HIP = { L: new THREE.Vector3(-0.42, BOTTOM + 0.22, 0.12), R: new THREE.Vector3(0.42, BOTTOM + 0.22, 0.12) };
  const restH = sitting ? HANDS.sitRest : HANDS.rest;
  (["L", "R"] as const).forEach((side) => hands[side].position.set(...restH[side]!));
  const ctrl = new THREE.Vector3(), ankle = new THREE.Vector3();
  function updateLimbs() {
    for (const side of ["L", "R"] as const) {
      const s = side === "L" ? -1 : 1;
      const sh = SHOULDER[side], h = hands[side].position;
      ctrl.set((sh.x + h.x) / 2 + s * (h.y > sh.y ? 0.45 : 0.2), (sh.y + h.y) / 2 - 0.08, (sh.z + h.z) / 2 + 0.05);
      noodle(arms[side], sh, ctrl, h, 0.055);
      const hip = HIP[side], f = feet[side].position;
      ankle.set(f.x, f.y + 0.06, f.z - 0.05);
      ctrl.set((hip.x + f.x) / 2, sitting ? hip.y - 0.02 : (hip.y + f.y) / 2, sitting ? f.z - 0.05 : (hip.z + f.z) / 2 + 0.12);
      noodle(legs[side], hip, ctrl, ankle, 0.075);
    }
  }

  // Data cubes for "work"
  const cubeGeo = track(new THREE.BoxGeometry(0.2, 0.2, 0.2));
  const cubes = Array.from({ length: 7 }, (_, i) => {
    const c = new THREE.Mesh(cubeGeo, cubeMats[i % 3]); c.visible = false; body.add(c);
    return { c, t0: i * 0.42, x: 0, fresh: true, hit: false };
  });

  // ---------- Framing ----------
  function frame(aspect: number) {
    camera.aspect = aspect;
    const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    if (sitting) {
      // Floor PERCH_FLOOR up from the bottom edge; headroom above for hops,
      // raised hands and thought dots.
      const halfH = 1.95, halfW = 2.05;
      const fit = Math.max(halfH, halfW / aspect);
      const cy = -2 * fit * PERCH_FLOOR + fit;
      camera.position.set(0, cy, fit / tanH);
      camera.lookAt(0, cy, 0);
    } else {
      const halfH = 1.75, halfW = 2.15;
      const fit = Math.max(halfH, halfW / aspect);
      camera.position.set(0, 1.5, fit / tanH);
      camera.lookAt(0, 1.5, 0);
    }
    camera.updateProjectionMatrix();
  }

  // ---------- Loop ----------
  let mood: AdaMood = "idle", moodStart = 0, raf = 0, running = false;
  let nextBlink = 2, blinkT = -1, lastT = 0, pulse = 0, lastDraw = 0;
  const look = new THREE.Vector2(), lookS = new THREE.Vector2(), lt = new THREE.Vector2();
  const HL = new THREE.Vector3(), HR = new THREE.Vector3(), FT = new THREE.Vector3();
  const clock = new THREE.Clock();
  const amp = calm ? 0.55 : 1;
  const minFrame = calm ? 1000 / 30 : 0; // calm (corner bubble) draws at 30fps

  function tick(now: number) {
    raf = requestAnimationFrame(tick);
    if (minFrame && now - lastDraw < minFrame) return;
    lastDraw = now;

    const t = clock.getElapsedTime(); const dt = Math.min(t - lastT, 0.05); lastT = t;
    const mt = t - moodStart;
    const M = MOODS[mood];
    let lift = 0.05 * amp * (Math.sin(t * 1.6) + 1) * (sitting ? 0.4 : 1);
    let sy = 1 + 0.018 * amp * Math.sin(t * 2.4);
    let rotZ = 0, rotY = 0, kick = 1;

    if (mood === "happy") {
      const cyc = sitting ? 0.6 : 0.95, p = (mt % cyc) / cyc;
      const hop = sitting ? 0.28 : 0.9;
      if (p < 0.18) { sy = 1 - 0.14 * Math.sin((p / 0.18) * Math.PI / 2); lift = 0; }
      else if (p < 0.78) { const q = (p - 0.18) / 0.6; lift = hop * amp * Math.sin(q * Math.PI); sy = 1 + 0.08 * Math.sin(q * Math.PI) * (1 - q); }
      else { const q = (p - 0.78) / 0.22; sy = 1 - 0.1 * Math.sin(q * Math.PI); lift = 0; }
      rotZ = 0.05 * Math.sin(mt * 6.6);
      kick = 2.2;
    } else if (mood === "hi") {
      rotZ = -0.05 * Math.min(mt * 3, 1);
    } else if (mood === "think") {
      rotZ = 0.12 * Math.min(mt * 2, 1);
      lift = 0.04 * amp * (Math.sin(t * 1.1) + 1) * (sitting ? 0.4 : 1);
      kick = 0.5;
    } else if (mood === "work") {
      lift = 0.02 * amp * (Math.sin(t * 3) + 1);
      sy = 1 - 0.08 * pulse;
      kick = 1.6;
    } else if (mood === "wow") {
      lift = (sitting ? 0.18 : 0.35) * Math.sin(Math.min(mt * 5, Math.PI)) * amp + 0.03;
      rotY = -0.1 * Math.min(mt * 6, 1);
      kick = 0;
    } else if (mood === "sleep") {
      lift = 0;
      sy = 0.97 + 0.03 * Math.sin(t * 1.2);
      rotZ = 0.07;
      kick = 0.15;
    }

    // Hands: each mood has its own pose
    const P = HANDS[mood] ?? {};
    HL.set(...(P.L ?? restH.L!)); HR.set(...(P.R ?? restH.R!));
    let rl = 0, rr = 0;
    if (mood === "hi") rr = 0.55 * Math.sin(mt * 10);
    else if (mood === "happy") { rl = 0.3; rr = -0.3; }
    else if (mood === "think") rr = 0.6;
    else if (mood === "work") { HL.y += 0.12 * Math.sin(t * 14); HR.y += 0.12 * Math.sin(t * 14 + Math.PI); }
    else if (mood === "wow") { rl = -0.4; rr = 0.4; }
    const hb = (mood === "sleep" ? 0.015 : 0.05) * amp;
    HL.y += hb * Math.sin(t * 2.4 + 0.6); HR.y += hb * Math.sin(t * 2.4 + 1.4);
    hands.L.position.lerp(HL, 0.15); hands.R.position.lerp(HR, 0.15);
    hands.L.rotation.z += (rl - hands.L.rotation.z) * 0.2;
    hands.R.rotation.z += (rr - hands.R.rotation.z) * 0.25;

    // Feet: dangling and swinging when sitting, planted when standing.
    for (const side of ["L", "R"] as const) {
      const hip = HIP[side];
      if (sitting) {
        const ph = t * 3.2 + (side === "L" ? 0 : Math.PI);
        FT.set(hip.x, BOTTOM - 0.5 + 0.06 * kick * amp * Math.sin(ph), 1.05 + 0.12 * kick * amp * Math.sin(ph));
      } else {
        FT.set(hip.x + (side === "L" ? -0.05 : 0.05), BOTTOM - LEG + 0.13, 0.15);
        if (mood === "happy" && lift > 0.05) FT.y += 0.18; // tuck while airborne
      }
      feet[side].position.lerp(FT, 0.18);
      feet[side].rotation.x = sitting ? -0.35 : 0;
    }
    updateLimbs();
    cap.rotation.z = -0.1 + 0.015 * amp * Math.sin(t * 2.4 - 0.8);

    dots.forEach((d, i) => {
      const on = mood === "think" ? Math.max(0, Math.sin(Math.min(Math.max(mt - 0.3 - i * 0.35, 0) * 3, Math.PI / 2))) : 0;
      const target = Math.max((0.07 + i * 0.03) * on, 0.0001);
      d.scale.setScalar(d.scale.x + (target - d.scale.x) * 0.2);
      d.position.set(0.95 + i * 0.32, TOP + 0.5 + i * 0.28 + 0.03 * Math.sin(t * 3 + i), 0);
    });

    pulse = Math.max(0, pulse - dt * 4);
    if (mood === "work") {
      cubes.forEach((k) => {
        const life = 1.6, p = ((mt - k.t0) % 3) / life;
        if (mt < k.t0 || p > 1) { k.c.visible = false; k.fresh = true; return; }
        if (k.fresh) { k.x = -0.8 + Math.random() * 1.6; k.fresh = false; k.hit = false; }
        k.c.visible = true;
        const y = TOP + 2.6 - 2.6 * p * p;
        k.c.position.set(k.x, Math.max(y, TOP - 0.3), 0);
        k.c.rotation.set(p * 4, p * 3, 0);
        k.c.scale.setScalar(Math.max(Math.min(1, Math.max(0, (y - (TOP - 0.3)) / 0.4)), 0.001));
        if (!k.hit && y < TOP + 0.05) { k.hit = true; pulse = 1; }
      });
    }

    // Face parts scale in and out
    const shown = new Set(M.show);
    for (const [name, o] of Object.entries(els)) {
      const want = shown.has(name) ? (M.big?.[name] ?? 1) : 0;
      o.userData.s += (want - o.userData.s) * 0.22;
      const s = Math.max(o.userData.s, 0.0001);
      o.scale.copy(o.userData.base).multiplyScalar(s);
      o.visible = s > 0.01;
    }

    // Eyes look and blink
    if (M.look) lt.set(M.look[0] * 0.8 + look.x * 0.2, M.look[1] * 0.8 + look.y * 0.2);
    else lt.set(look.x * 0.6, look.y * 0.5);
    lookS.lerp(lt, 0.08);
    if (t > nextBlink && blinkT < 0) blinkT = t;
    let bs = 1;
    if (blinkT >= 0) {
      const q = (t - blinkT) / 0.16;
      bs = q < 1 ? Math.abs(Math.cos(q * Math.PI)) * 0.92 + 0.08 : 1;
      if (q >= 1) { blinkT = -1; nextBlink = t + 2.2 + Math.random() * 2.8; }
    }
    [eyeL, eyeR].forEach((e) => {
      e.position.x = e.userData.home.x + lookS.x * 0.035;
      e.position.y = e.userData.home.y + lookS.y * 0.03;
      e.scale.y *= bs;
    });

    root.position.y = lift;
    root.rotation.y += ((lookS.x * 0.3 + rotY) - root.rotation.y) * 0.1;
    root.rotation.x += ((-lookS.y * 0.1) - root.rotation.x) * 0.1;
    root.rotation.z += (rotZ - root.rotation.z) * 0.12;
    squash.scale.set(1 / Math.sqrt(sy), sy, 1 / Math.sqrt(sy));

    const sh = 1 - Math.min(lift, 1) * 0.45;
    shadow.scale.set(2.9 * sh, 1.3 * sh, 1);
    shadowMat.opacity = (sitting ? 0.5 : 0.9) * sh;

    renderer.render(scene, camera);
  }

  return {
    setMood(m) {
      if (m === mood) return;
      mood = m; moodStart = clock.getElapsedTime();
      cubes.forEach((k) => { k.c.visible = false; k.fresh = true; });
    },
    setLook(x, y) { look.set(x, y).clampLength(0, 1.4); },
    resize(w, h) {
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      frame(w / h);
      if (!running) renderer.render(scene, camera);
    },
    start() {
      if (running) return;
      running = true; raf = requestAnimationFrame(tick);
    },
    stop() {
      running = false; cancelAnimationFrame(raf);
    },
    dispose() {
      this.stop();
      [arms.L, arms.R, legs.L, legs.R].forEach((m) => m.geometry.dispose());
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

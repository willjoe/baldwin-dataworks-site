import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// Facade pieces are Kenney's "Modular Buildings" kit (CC0) — see
// insights/assets/terminal-kit/SOURCE.txt. Each piece is a 2x2x2 unit
// module meant to be tiled edge-to-edge.
const KIT_BASE = "assets/terminal-kit/";
const KIT_FILES = {
  window: "building-window-large.glb",
  doorWindow: "building-door-window.glb",
  door: "building-door.glb",
  awning: "roof-flat-awning-a.glb",
  cornerWindow: "building-corner-window.glb",
  corner: "building-corner.glb",
};
const MODULE_SIZE = 2; // native size of every kit piece, per-axis

// ─────────────────────────────────────────────────────────────
// Sample terminal floor plan — synthetic data, not a real airport.
// Coordinates are in arbitrary "meters"; x/z are the floor plane, y is up.
// ─────────────────────────────────────────────────────────────
const ZONES = [
  { id: "checkin",  name: "Check-in Hall",          category: "Landside",  x: 0,    z: 15,  w: 60, d: 30, density: 65, dwell: 12 },
  { id: "arrivals", name: "Arrivals & Baggage",      category: "Landside",  x: -43.5,z: 12.5, w: 23, d: 25, density: 40, dwell: 10 },
  { id: "security", name: "Security Checkpoint",     category: "Screening", x: 0,    z: 36,  w: 30, d: 12, density: 90, dwell: 8  },
  { id: "retail",   name: "Retail & Duty-Free",      category: "Airside",   x: 0,    z: 50,  w: 50, d: 16, density: 55, dwell: 15 },
  { id: "food",     name: "Food Court",               category: "Airside",   x: 0,    z: 87.5,w: 30, d: 15, density: 60, dwell: 20 },
  { id: "domestic", name: "Domestic Concourse",       category: "Airside",   x: -45,  z: 69,  w: 90, d: 22, density: 70, dwell: 35 },
  { id: "intl",     name: "International Concourse",  category: "Airside",   x: 45,   z: 69,  w: 90, d: 22, density: 85, dwell: 55 },
];

const GATES_PER_CONCOURSE = 6;

const HEAT_STOPS = ["#ffffb2", "#fecc5c", "#fd8d3c", "#f03b20", "#bd0026"];
function hexToRgb(hex) { const n = parseInt(hex.slice(1), 16); return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }; }
function lerpColor(a, b, t) {
  const ca = hexToRgb(a), cb = hexToRgb(b);
  return { r: (ca.r + (cb.r - ca.r) * t) / 255, g: (ca.g + (cb.g - ca.g) * t) / 255, b: (ca.b + (cb.b - ca.b) * t) / 255 };
}
function colorForRatio(t) {
  t = Math.max(0, Math.min(1, t));
  const idx = t * (HEAT_STOPS.length - 1);
  const i0 = Math.floor(idx), i1 = Math.min(HEAT_STOPS.length - 1, i0 + 1);
  return lerpColor(HEAT_STOPS[i0], HEAT_STOPS[i1], idx - i0);
}

function renderLegendScale() {
  document.getElementById("legend-scale").innerHTML = HEAT_STOPS.map(c => `<span style="background:${c}"></span>`).join("");
}
renderLegendScale();

let activeMetric = "density";
const METRIC_RANGE = { density: [0, 100], dwell: [0, 60] };
const METRIC_LABEL = { density: "Passenger Density", dwell: "Avg. Dwell Time" };

function valueFor(zone) { return zone[activeMetric]; }
function ratioFor(zone) {
  const [lo, hi] = METRIC_RANGE[activeMetric];
  return (valueFor(zone) - lo) / (hi - lo);
}

// ─────────────────────────────────────────────────────────────
// Scene setup
// ─────────────────────────────────────────────────────────────
const canvas = document.getElementById("scene-canvas");
const scenePane = document.querySelector(".scene-pane");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdfe4ea);

const camera = new THREE.PerspectiveCamera(45, 1, 1, 2000);
const DEFAULT_CAM_POS = new THREE.Vector3(10, 150, 210);
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 45);
camera.position.copy(DEFAULT_CAM_POS);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(DEFAULT_TARGET);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI * 0.49;
controls.minDistance = 60;
controls.maxDistance = 400;
controls.update();

scene.add(new THREE.AmbientLight(0xffffff, 0.65));
const sun = new THREE.DirectionalLight(0xffffff, 0.9);
sun.position.set(120, 200, 80);
scene.add(sun);
const fill = new THREE.DirectionalLight(0xffffff, 0.3);
fill.position.set(-100, 120, -60);
scene.add(fill);

// Ground plane
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(500, 500),
  new THREE.MeshStandardMaterial({ color: 0xc7ccd3, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1;
scene.add(ground);

// ─────────────────────────────────────────────────────────────
// Build zones
// ─────────────────────────────────────────────────────────────
const ZONE_HEIGHT = 2.2;
const zoneMeshes = [];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hoveredZone = null;
let selectedZone = null;

function buildZoneFloors() {
  for (const zone of ZONES) {
    const geo = new THREE.BoxGeometry(zone.w, ZONE_HEIGHT, zone.d);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(zone.x, ZONE_HEIGHT / 2, zone.z);
    mesh.userData.zone = zone;
    scene.add(mesh);
    zoneMeshes.push(mesh);

    // crisp outline
    const edges = new THREE.EdgesGeometry(geo);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x2b2b3a, linewidth: 1 }));
    line.position.copy(mesh.position);
    scene.add(line);
  }

  // Gate markers along the outer (far-z) edge of each concourse
  const gateMat = new THREE.MeshStandardMaterial({ color: 0x3a3a4a });
  for (const id of ["domestic", "intl"]) {
    const zone = ZONES.find(z => z.id === id);
    const edgeZ = zone.z + zone.d / 2;
    for (let i = 0; i < GATES_PER_CONCOURSE; i++) {
      const t = (i + 0.5) / GATES_PER_CONCOURSE;
      const gx = zone.x - zone.w / 2 + t * zone.w;
      const gate = new THREE.Mesh(new THREE.BoxGeometry(3, 3.5, 4), gateMat);
      gate.position.set(gx, 1.75, edgeZ + 2);
      scene.add(gate);
    }
  }
}
buildZoneFloors();

// ─────────────────────────────────────────────────────────────
// Facades — real modeled glass/window/door/awning pieces tiled
// along the terminal's main public-facing edges.
// ─────────────────────────────────────────────────────────────
const loader = new GLTFLoader();
function loadKitPiece(file) {
  return new Promise((resolve, reject) => {
    loader.load(KIT_BASE + file, gltf => resolve(gltf.scene), undefined, reject);
  });
}

async function loadKit() {
  const entries = await Promise.all(
    Object.entries(KIT_FILES).map(async ([key, file]) => [key, await loadKitPiece(file)])
  );
  return Object.fromEntries(entries);
}

// Tiles `count` modules of width `scale*MODULE_SIZE` centered along an edge,
// facing outward (+facingSign on the local Z), with an awning strip on top.
function buildFacade(kit, { centerX, edgeZ, totalWidth, scale, facingSign, doorIndices = [] }) {
  const moduleW = MODULE_SIZE * scale;
  const count = Math.max(1, Math.round(totalWidth / moduleW));
  const startX = centerX - (count * moduleW) / 2 + moduleW / 2;
  const rotY = facingSign > 0 ? 0 : Math.PI;

  for (let i = 0; i < count; i++) {
    const template = doorIndices.includes(i) ? kit.doorWindow : kit.window;
    const piece = template.clone(true);
    piece.scale.setScalar(scale);
    piece.position.set(startX + i * moduleW, 0, edgeZ);
    piece.rotation.y = rotY;
    scene.add(piece);

    const awning = kit.awning.clone(true);
    awning.scale.set(scale, scale * 0.4, scale);
    awning.position.set(startX + i * moduleW, MODULE_SIZE * scale, edgeZ + facingSign * MODULE_SIZE * scale * 0.15);
    awning.rotation.y = rotY;
    scene.add(awning);
  }
}

async function buildKitFacades() {
  const kit = await loadKit();

  const checkin = ZONES.find(z => z.id === "checkin");
  buildFacade(kit, {
    centerX: checkin.x,
    edgeZ: checkin.z - checkin.d / 2,
    totalWidth: checkin.w,
    scale: 3,
    facingSign: -1,
    doorIndices: [4, 5],
  });

  const domestic = ZONES.find(z => z.id === "domestic");
  buildFacade(kit, {
    centerX: domestic.x,
    edgeZ: domestic.z + domestic.d / 2,
    totalWidth: domestic.w,
    scale: 3,
    facingSign: 1,
  });

  const intl = ZONES.find(z => z.id === "intl");
  buildFacade(kit, {
    centerX: intl.x,
    edgeZ: intl.z + intl.d / 2,
    totalWidth: intl.w,
    scale: 3,
    facingSign: 1,
  });
}

function updateZoneColors() {
  for (const mesh of zoneMeshes) {
    const zone = mesh.userData.zone;
    const c = colorForRatio(ratioFor(zone));
    mesh.material.color.setRGB(c.r, c.g, c.b);
    const boosted = mesh === hoveredZone || mesh === selectedZone;
    mesh.material.emissive = new THREE.Color(boosted ? 0x4b286d : 0x000000);
    mesh.material.emissiveIntensity = boosted ? 0.25 : 0;
  }
}
updateZoneColors();

// ─────────────────────────────────────────────────────────────
// Interaction
// ─────────────────────────────────────────────────────────────
function setPointerFromEvent(ev) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
}

function pickZone() {
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(zoneMeshes);
  return hits.length ? hits[0].object : null;
}

renderer.domElement.addEventListener("pointermove", ev => {
  setPointerFromEvent(ev);
  hoveredZone = pickZone();
  renderer.domElement.style.cursor = hoveredZone ? "pointer" : "grab";
  updateZoneColors();
});

renderer.domElement.addEventListener("click", ev => {
  setPointerFromEvent(ev);
  const picked = pickZone();
  if (picked) {
    selectedZone = picked;
    renderZoneDetail(picked.userData.zone);
    highlightZoneRow(picked.userData.zone.id);
    updateZoneColors();
  }
});

// ─────────────────────────────────────────────────────────────
// Side panel
// ─────────────────────────────────────────────────────────────
function renderZoneDetail(zone) {
  document.getElementById("zone-detail").innerHTML = `
    <div class="zname">${zone.name}</div>
    <div class="zcat">${zone.category}</div>
    <div class="zone-stat-grid">
      <div class="zone-stat-box"><div class="n">${zone.density}</div><div class="l">Density Index</div></div>
      <div class="zone-stat-box"><div class="n">${zone.dwell}m</div><div class="l">Avg Dwell Time</div></div>
    </div>
  `;
}

function highlightZoneRow(id) {
  document.querySelectorAll(".zone-row").forEach(row => row.classList.toggle("active", row.dataset.id === id));
}

function renderZoneList() {
  const unit = activeMetric === "density" ? "" : " min";
  document.getElementById("zone-list").innerHTML = ZONES
    .slice()
    .sort((a, b) => valueFor(b) - valueFor(a))
    .map(z => `
      <div class="zone-row" data-id="${z.id}">
        <span class="zn">${z.name}</span>
        <span class="zv">${valueFor(z)}${unit}</span>
      </div>
    `).join("");

  document.querySelectorAll(".zone-row").forEach(row => {
    row.addEventListener("click", () => {
      const zone = ZONES.find(z => z.id === row.dataset.id);
      selectedZone = zoneMeshes.find(m => m.userData.zone.id === zone.id);
      renderZoneDetail(zone);
      highlightZoneRow(zone.id);
      updateZoneColors();
    });
  });
}
renderZoneList();

document.querySelectorAll(".metric-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    activeMetric = btn.dataset.metric;
    document.querySelectorAll(".metric-btn").forEach(b => b.classList.toggle("active", b === btn));
    document.getElementById("legend-label").textContent = METRIC_LABEL[activeMetric];
    updateZoneColors();
    renderZoneList();
    if (selectedZone) highlightZoneRow(selectedZone.userData.zone.id);
  });
});

document.getElementById("reset-view-btn").addEventListener("click", () => {
  camera.position.copy(DEFAULT_CAM_POS);
  controls.target.copy(DEFAULT_TARGET);
  controls.update();
});

// ─────────────────────────────────────────────────────────────
// Resize + render loop
// ─────────────────────────────────────────────────────────────
function resize() {
  const w = scenePane.clientWidth, h = scenePane.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener("resize", resize);
resize();

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

buildKitFacades()
  .then(() => {
    document.getElementById("scene-loading").classList.add("hidden");
  })
  .catch(err => {
    console.error("Failed to load terminal facade kit:", err);
    document.getElementById("scene-loading").innerHTML = `<div style="color:var(--red)">Failed to load 3D assets: ${err.message}</div>`;
  });

document.getElementById("scene-loading").classList.add("hidden");

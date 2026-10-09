import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// A prepared example model, not camera tracking or a representation of a real product.
export function createViewer(container) {
  const colors = getComputedStyle(document.documentElement);
  const ink = colors.getPropertyValue('--ink').trim();
  const lime = colors.getPropertyValue('--lime').trim();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.append(renderer.domElement);
  const scene = new THREE.Scene();
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environmentMap = pmrem.fromScene(environment, .04);
  scene.environment = environmentMap.texture;
  environment.dispose(); pmrem.dispose();
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 30);
  const home = new THREE.Vector3(3.1, 2.6, 4.2);
  camera.position.copy(home);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, .65, 0);
  controls.enableDamping = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  controls.enablePan = false; controls.enableZoom = false;
  controls.minPolarAngle = .2; controls.maxPolarAngle = Math.PI / 2.1;
  const silver = new THREE.MeshStandardMaterial({ color: '#c5c9cd', metalness: .8, roughness: .25 });
  const cushion = new THREE.MeshStandardMaterial({ color: ink, metalness: .08, roughness: .83 });
  const paperSide = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .85 });
  const textureCanvas = document.createElement('canvas'); textureCanvas.width = 1200; textureCanvas.height = 800;
  const ctx = textureCanvas.getContext('2d');
  ctx.fillStyle = lime; ctx.fillRect(0, 0, 1200, 800);
  ctx.strokeStyle = ink; ctx.lineWidth = 125; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-120, 660); ctx.bezierCurveTo(350, 250, 720, 930, 610, 440); ctx.bezierCurveTo(470, 20, 150, 760, 1320, 100); ctx.stroke();
  ctx.fillStyle = ink; ctx.font = '700 90px Kontakt, Arial'; ctx.fillText('Hallo!', 75, 145);
  ctx.lineWidth = 10;
  for (let radius = 28; radius <= 76; radius += 24) { ctx.beginPath(); ctx.arc(1060, 100, radius, -.9, .9); ctx.stroke(); }
  const cardTexture = new THREE.CanvasTexture(textureCanvas); cardTexture.colorSpace = THREE.SRGBColorSpace;
  const printMaterial = new THREE.MeshStandardMaterial({ map: cardTexture, roughness: .72 });
  const card = new THREE.Mesh(new THREE.BoxGeometry(2.8, .035, 1.86), [paperSide, paperSide, printMaterial, paperSide, paperSide, paperSide]);
  card.receiveShadow = true; card.rotation.y = -.14; scene.add(card);
  const headphones = new THREE.Group(); scene.add(headphones);
  const points = Array.from({ length: 33 }, (_, i) => { const angle = i / 32 * Math.PI; return new THREE.Vector3(.72 * Math.cos(angle), .64 + .97 * Math.sin(angle), 0); });
  const band = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 64, .072, 12, false), cushion);
  band.scale.z = 1.5; band.castShadow = true; headphones.add(band);
  for (const sign of [-1, 1]) {
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .19, 48), silver);
    shell.rotation.z = Math.PI / 2; shell.position.set(sign * .74, .43, 0); shell.scale.x = 1.22; shell.castShadow = true; headphones.add(shell);
    const padding = new THREE.Mesh(new THREE.TorusGeometry(.265, .085, 16, 48), cushion);
    padding.rotation.y = Math.PI / 2; padding.position.set(sign * .61, .43, 0); padding.scale.y = 1.27; padding.castShadow = true; headphones.add(padding);
    const hinge = new THREE.Mesh(new THREE.BoxGeometry(.08, .33, .1), silver);
    hinge.position.set(sign * .72, .72, 0); hinge.castShadow = true; headphones.add(hinge);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(.275, .29, .018, 48), silver);
    cap.rotation.z = Math.PI / 2; cap.position.set(sign * .846, .43, 0); cap.scale.x = 1.22; headphones.add(cap);
  }
  headphones.position.y = .03; headphones.rotation.y = -.25;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ opacity: .12 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -.025; ground.receiveShadow = true; scene.add(ground);
  scene.add(new THREE.HemisphereLight('#ffffff', '#91948a', 2.1));
  const light = new THREE.DirectionalLight('#ffffff', 4);
  light.position.set(-3, 6, 4); light.castShadow = true; light.shadow.mapSize.set(1024, 1024); light.shadow.bias = -.0005;
  light.shadow.camera.left = -4; light.shadow.camera.right = 4; light.shadow.camera.top = 4; light.shadow.camera.bottom = -4;
  scene.add(light);
  let active = false; let disposed = false; let frame = 0;
  const render = () => { if (!disposed) renderer.render(scene, camera); };
  const resize = () => { const width = Math.max(container.clientWidth, 1); const height = Math.max(container.clientHeight, 1); renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); render(); };
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(container); resize();
  function tick() { if (!active || disposed) return; controls.update(); render(); frame = requestAnimationFrame(tick); }
  controls.addEventListener('change', render);
  return {
    rotate(direction) { headphones.rotation.y += direction * Math.PI / 8; render(); },
    reset() { headphones.rotation.y = -.25; camera.position.copy(home); controls.target.set(0, .65, 0); controls.update(); render(); },
    setActive(value) { if (active === value || disposed) return; active = value; cancelAnimationFrame(frame); if (active) tick(); },
    dispose() { disposed = true; active = false; cancelAnimationFrame(frame); resizeObserver.disconnect(); controls.dispose(); const geometries = new Set(); const materials = new Set(); scene.traverse(object => { if (object.geometry) geometries.add(object.geometry); if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material)); }); geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose()); cardTexture.dispose(); environmentMap.dispose(); renderer.dispose(); renderer.domElement.remove(); },
  };
}

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const stage = document.getElementById('scene-stage');
const canvas = document.getElementById('feedback-scene');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

try {
  const renderer = new THREE.WebGLRenderer({canvas, alpha: true, antialias: true, powerPreference: 'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 40);
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environmentMap = pmrem.fromScene(environment, .04);
  scene.environment = environmentMap.texture;
  environment.dispose();
  pmrem.dispose();

  const chrome = new THREE.MeshStandardMaterial({color: '#bdcce3', metalness: 1, roughness: .14, envMapIntensity: 1.9});
  const blue = new THREE.MeshPhysicalMaterial({color: '#3156ef', metalness: .67, roughness: .17, clearcoat: 1, clearcoatRoughness: .12, envMapIntensity: 1.5});
  const glass = new THREE.MeshPhysicalMaterial({color: '#c9dcff', metalness: .05, roughness: .12, transmission: .75, thickness: .3, ior: 1.4, envMapIntensity: 1.3});
  const steel = new THREE.MeshStandardMaterial({color: '#9db3d2', metalness: .8, roughness: .22});
  const signalMaterial = new THREE.MeshStandardMaterial({color: '#284bdf', metalness: .45, roughness: .15});
  const sculpture = new THREE.Group();
  scene.add(sculpture);
  const mainLoop = new THREE.Group();
  const innerLoop = new THREE.Group();
  const glassLoop = new THREE.Group();
  const frame = new THREE.Group();
  sculpture.add(mainLoop, innerLoop, glassLoop, frame);

  function roundedArc(radius, tube, arc, material) {
    const group = new THREE.Group();
    group.add(new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 32, 160, arc), material));
    [0, arc].forEach(angle => {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(tube, 24, 16), material);
      cap.position.set(radius * Math.cos(angle), radius * Math.sin(angle), 0);
      group.add(cap);
    });
    return group;
  }
  mainLoop.add(roundedArc(1.12, .30, Math.PI * 1.88, chrome));
  const blueArc = roundedArc(1.38, .115, Math.PI * 1.76, blue);
  blueArc.rotation.z = .7;
  innerLoop.add(blueArc);
  const transparentRing = new THREE.Mesh(new THREE.TorusGeometry(.91, .085, 24, 128), glass);
  glassLoop.add(transparentRing);
  const orbit = new THREE.Mesh(new THREE.TorusGeometry(1.86, .011, 8, 180), steel);
  frame.add(orbit);
  const orbit2 = new THREE.Mesh(new THREE.TorusGeometry(1.62, .006, 8, 180), steel);
  orbit2.rotation.x = 1.1;
  frame.add(orbit2);
  for (let i = 0; i < 12; i++) {
    const angle = i / 12 * Math.PI * 2;
    const dot = new THREE.Mesh(new THREE.SphereGeometry(.026, 8, 8), chrome);
    dot.position.set(Math.cos(angle) * 1.86, Math.sin(angle) * 1.86, 0);
    frame.add(dot);
  }
  const signal = new THREE.Mesh(new THREE.SphereGeometry(.10, 24, 24), signalMaterial);
  signal.position.set(1.86, 0, 0);
  frame.add(signal);
  const connector = new THREE.Mesh(new THREE.SphereGeometry(.085, 20, 16), chrome);
  connector.position.set(Math.cos(Math.PI * 1.88) * 1.12, Math.sin(Math.PI * 1.88) * 1.12, .26);
  mainLoop.add(connector);

  const configurations = {
    evaluation: {root: [.55, .55, -.57], inner: [.25, .85, .4], glass: [1.2, .3, -.4], frame: [.6, -.35, .2], color: '#3156ef'},
    agents: {root: [.75, -.3, -.25], inner: [1.15, .35, -.5], glass: [.35, -.8, .1], frame: [.35, .6, -.4], color: '#167caa'},
    robotics: {root: [.3, .8, .15], inner: [1.3, .8, .2], glass: [.1, 1.4, .4], frame: [1.1, -.15, .3], color: '#5d4cd8'}
  };
  let mode = document.querySelector('[data-scene][aria-pressed=true]').dataset.scene;
  let pointerX = 0;
  let pointerY = 0;
  let yaw = 0;
  let pitch = 0;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let visible = true;
  let frameId = 0;
  let previousTime = 0;
  sculpture.rotation.set(-.1, -.6, -.7);
  const targetColor = new THREE.Color(configurations[mode].color);
  function resize() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.set(0, .05, camera.aspect < 1.1 ? 8.0 : 7.35);
    camera.lookAt(0, .05, 0);
    camera.updateProjectionMatrix();
    requestDraw();
  }
  function requestDraw() {
    if (!frameId && visible && !document.hidden) frameId = requestAnimationFrame(draw);
  }
  function adjustRotation(object, values, factor) {
    let remaining = 0;
    ['x', 'y', 'z'].forEach((axis, index) => {
      object.rotation[axis] = THREE.MathUtils.lerp(object.rotation[axis], values[index], factor);
      remaining += Math.abs(object.rotation[axis] - values[index]);
    });
    return remaining;
  }
  function draw(time) {
    frameId = 0;
    if (!visible || document.hidden) { previousTime = 0; return; }
    const delta = previousTime ? Math.min(time - previousTime, 50) : 16;
    previousTime = time;
    const amount = reducedMotion.matches ? 1 : 1 - Math.pow(.84, delta / 16);
    const config = configurations[mode];
    const root = [config.root[0] + pitch + pointerY * .13, config.root[1] + yaw + pointerX * .2, config.root[2]];
    let remaining = adjustRotation(sculpture, root, amount);
    remaining += adjustRotation(innerLoop, config.inner, amount);
    remaining += adjustRotation(glassLoop, config.glass, amount);
    remaining += adjustRotation(frame, config.frame, amount);
    blue.color.lerp(targetColor, amount);
    signalMaterial.color.lerp(targetColor, amount);
    remaining += Math.abs(blue.color.r-targetColor.r) + Math.abs(blue.color.g-targetColor.g) + Math.abs(blue.color.b-targetColor.b);
    renderer.render(scene, camera);
    if (remaining > .002 && !reducedMotion.matches) requestDraw();
    else previousTime = 0;
  }
  canvas.addEventListener('pointerdown', event => {
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (dragging) {
      yaw += (event.clientX - lastX) * .009;
      pitch = THREE.MathUtils.clamp(pitch + (event.clientY - lastY) * .006, -.65, .65);
      lastX = event.clientX;
      lastY = event.clientY;
    } else if (event.pointerType !== 'touch' && !reducedMotion.matches) {
      const bounds = canvas.getBoundingClientRect();
      pointerX = (event.clientX - bounds.left) / bounds.width - .5;
      pointerY = (event.clientY - bounds.top) / bounds.height - .5;
    }
    requestDraw();
  });
  function endDrag(event) {
    dragging = false;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  }
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; requestDraw(); });
  canvas.tabIndex = 0;
  canvas.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') yaw -= .16;
    else if (event.key === 'ArrowRight') yaw += .16;
    else if (event.key === 'ArrowUp') pitch = Math.max(-.65, pitch-.12);
    else if (event.key === 'ArrowDown') pitch = Math.min(.65, pitch+.12);
    else if (event.key === 'Enter') { pitch = 0; yaw = 0; }
    else return;
    event.preventDefault();
    requestDraw();
  });
  window.addEventListener('portfolio-focus', event => {
    if (!configurations[event.detail]) return;
    mode = event.detail;
    yaw = 0;
    pitch = 0;
    targetColor.set(configurations[mode].color);
    requestDraw();
  });
  reducedMotion.addEventListener('change', requestDraw);
  document.addEventListener('visibilitychange', requestDraw);
  new ResizeObserver(resize).observe(stage);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) requestDraw();
  }).observe(stage);
  canvas.addEventListener('webglcontextlost', () => {
    stage.classList.remove('is-ready');
    document.getElementById('scene-hint').textContent = 'Choose a focus';
    visible = false;
  });
  stage.classList.add('is-ready');
  document.getElementById('scene-hint').textContent = 'Drag to rotate';
  resize();
} catch (error) {
  stage.classList.remove('is-ready');
  canvas.hidden = true;
}

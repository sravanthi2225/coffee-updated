import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

interface ThreePageLoaderProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

export const ThreePageLoader: React.FC<ThreePageLoaderProps> = ({
  onComplete,
  minDurationMs = 2400,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Selecting Single-Origin Microlots...');

  const isCompletingRef = useRef(false);

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. THREE.JS 3D SCENE (SEAMLESS UNIFIED COFFEE BEAN + CHAFF + GOLDEN AURA)
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const width = container.clientWidth || Math.min(window.innerWidth, 600);
    const height = container.clientHeight || 450;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const fov = 38;
    const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 100);

    const updateCameraPosition = (w: number, h: number) => {
      const aspect = w / h;
      // Guarantee entire ring geometry (radius 1.62 + oscillation + generous margin = ~1.95) is 100% visible in frame
      const halfFovRad = (fov * Math.PI) / 360;
      const targetRadius = 1.95;
      const distY = targetRadius / Math.tan(halfFovRad);
      const distX = targetRadius / (Math.tan(halfFovRad) * aspect);
      camera.aspect = aspect;
      camera.position.set(0, 0, Math.max(distY, distX, 5.4));
      camera.updateProjectionMatrix();
    };

    updateCameraPosition(width, height);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    container.appendChild(renderer.domElement);

    // Parent group for all rotating elements
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // ── Procedural Textures for Roasted Coffee Bean ──
    const texWidth = 1024;
    const texHeight = 1024;

    // 1. Diffuse Color Map (Roasted Mahogany & Warm Chestnut)
    const diffCanvas = document.createElement('canvas');
    diffCanvas.width = texWidth;
    diffCanvas.height = texHeight;
    const diffCtx = diffCanvas.getContext('2d')!;

    const grad = diffCtx.createRadialGradient(
      texWidth * 0.45,
      texHeight * 0.45,
      50,
      texWidth * 0.5,
      texHeight * 0.5,
      texWidth * 0.65
    );
    grad.addColorStop(0, '#5C331D');
    grad.addColorStop(0.4, '#482414');
    grad.addColorStop(0.8, '#32160A');
    grad.addColorStop(1, '#200B04');
    diffCtx.fillStyle = grad;
    diffCtx.fillRect(0, 0, texWidth, texHeight);

    const diffImg = diffCtx.getImageData(0, 0, texWidth, texHeight);
    const diffData = diffImg.data;
    for (let i = 0; i < diffData.length; i += 4) {
      const noise = (Math.random() - 0.5) * 14;
      diffData[i] = Math.min(255, Math.max(0, diffData[i] + noise));
      diffData[i + 1] = Math.min(255, Math.max(0, diffData[i + 1] + noise * 0.6));
      diffData[i + 2] = Math.min(255, Math.max(0, diffData[i + 2] + noise * 0.35));
    }
    diffCtx.putImageData(diffImg, 0, 0);
    const diffTexture = new THREE.CanvasTexture(diffCanvas);

    // 2. Bump Map
    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 512;
    bumpCanvas.height = 512;
    const bumpCtx = bumpCanvas.getContext('2d')!;
    bumpCtx.fillStyle = '#808080';
    bumpCtx.fillRect(0, 0, 512, 512);

    const bumpImg = bumpCtx.getImageData(0, 0, 512, 512);
    const bData = bumpImg.data;
    for (let i = 0; i < bData.length; i += 4) {
      const val = 128 + (Math.random() - 0.5) * 26;
      bData[i] = val;
      bData[i + 1] = val;
      bData[i + 2] = val;
    }
    bumpCtx.putImageData(bumpImg, 0, 0);
    const bumpTexture = new THREE.CanvasTexture(bumpCanvas);

    // ── Build Continuous Whole 3D Coffee Bean Geometry (ZERO horizontal seams) ──
    const createWholeBeanGeometry = () => {
      const wSeg = 64;
      const hSeg = 48;
      const geo = new THREE.SphereGeometry(1.0, wSeg, hSeg);

      const posAttr = geo.attributes.position;
      const v = new THREE.Vector3();

      for (let i = 0; i < posAttr.count; i++) {
        v.fromBufferAttribute(posAttr, i);

        const u = Math.min(1, Math.max(-1, v.y));
        const profile = Math.sqrt(Math.max(0, 1 - u * u));

        // Organic center fissure path (natural vertical S-curve)
        const creaseX = 0.075 * Math.sin(v.y * 2.3) + 0.02 * Math.cos(v.y * 4.6);
        const distFromCrease = v.x - creaseX;
        const absDist = Math.abs(distFromCrease);

        // Front face fissure (z > 0) vs Back convex dome (z <= 0)
        if (v.z > 0.01) {
          if (absDist < 0.45) {
            const normDist = absDist / 0.45;
            const cleftDepth = 0.58 * Math.pow(Math.cos(normDist * (Math.PI / 2)), 1.3) * profile;
            v.z -= cleftDepth;

            const lobeBulge = 0.15 * Math.sin(normDist * Math.PI) * profile;
            v.z += lobeBulge;
          }
          v.z *= 0.78;
        } else {
          v.z *= 0.82;
        }

        const taper = 1 - 0.07 * v.y;
        v.x *= 1.08 * taper;
        v.y *= 1.38;

        posAttr.setXYZ(i, v.x, v.y, v.z);
      }

      geo.computeVertexNormals();
      return geo;
    };

    const wholeBeanGeo = createWholeBeanGeometry();

    // Roasted Coffee Material
    const beanMat = new THREE.MeshPhysicalMaterial({
      map: diffTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.028,
      color: new THREE.Color('#4E2A18'),
      roughness: 0.36,
      metalness: 0.06,
      clearcoat: 0.48,
      clearcoatRoughness: 0.25,
      reflectivity: 0.88,
    });

    const beanParentGroup = new THREE.Group();
    beanParentGroup.rotation.x = THREE.MathUtils.degToRad(12);
    beanParentGroup.rotation.z = THREE.MathUtils.degToRad(-10);
    mainGroup.add(beanParentGroup);

    const beanMesh = new THREE.Mesh(wholeBeanGeo, beanMat);
    beanParentGroup.add(beanMesh);

    // Warm Golden Center PointLight
    const centerLight = new THREE.PointLight(0xffd59e, 1.2, 10);
    centerLight.position.set(0, 0, 0.4);
    beanParentGroup.add(centerLight);

    // ── Silverskin Chaff (Parchment line along the vertical fissure) ──
    const chaffPoints: THREE.Vector3[] = [];
    const steps = 24;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const py = -1.22 + t * 2.44;
      const px = 0.075 * Math.sin(py * 2.3) + 0.02 * Math.cos(py * 4.6);
      const pz = 0.05 + 0.09 * Math.sin(t * Math.PI);
      chaffPoints.push(new THREE.Vector3(px, py, pz));
    }

    const chaffCurve = new THREE.CatmullRomCurve3(chaffPoints);
    const chaffGeo = new THREE.TubeGeometry(chaffCurve, 36, 0.026, 8, false);
    const chaffMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E0CAA3'),
      emissive: new THREE.Color('#2C1C10'),
      roughness: 0.78,
      metalness: 0.02,
      transparent: true,
      opacity: 1,
    });
    const chaffMesh = new THREE.Mesh(chaffGeo, chaffMat);
    beanParentGroup.add(chaffMesh);

    // ── Dual Golden Rings of Planetary Extraction ──
    const ringGeo1 = new THREE.TorusGeometry(1.42, 0.012, 16, 120);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#F2CF98'),
      transparent: true,
      opacity: 0.65,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2.6;
    ring1.rotation.y = Math.PI / 8;
    beanParentGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(1.62, 0.008, 16, 120);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#C59B63'),
      transparent: true,
      opacity: 0.4,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 3.2;
    ring2.rotation.y = -Math.PI / 5;
    beanParentGroup.add(ring2);

    // ── Swirling Coffee Aroma Dust Particles ──
    const particleCount = 160;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleAngles = new Float32Array(particleCount);
    const particleSpeeds = new Float32Array(particleCount);
    const particleRadii = new Float32Array(particleCount);
    const particleYOffsets = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particleAngles[i] = Math.random() * Math.PI * 2;
      particleSpeeds[i] = 0.4 + Math.random() * 0.8;
      particleRadii[i] = 0.8 + Math.random() * 1.5;
      particleYOffsets[i] = (Math.random() - 0.5) * 3.0;

      particlePositions[i * 3] = Math.cos(particleAngles[i]) * particleRadii[i];
      particlePositions[i * 3 + 1] = particleYOffsets[i];
      particlePositions[i * 3 + 2] = Math.sin(particleAngles[i]) * particleRadii[i];
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d')!;
    const pGrad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    pGrad.addColorStop(0, 'rgba(255,240,210,1)');
    pGrad.addColorStop(0.35, 'rgba(218,175,115,0.7)');
    pGrad.addColorStop(1, 'rgba(218,175,115,0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 32, 32);
    const pTexture = new THREE.CanvasTexture(pCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.065,
      map: pTexture,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    beanParentGroup.add(particles);

    // ── Lighting Studio ──
    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.4);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf2cf98, 3.2);
    rimLight.position.set(-3, -2, -2.5);
    scene.add(rimLight);

    const topWarmLight = new THREE.DirectionalLight(0xffb86c, 1.8);
    topWarmLight.position.set(0, 5, 1);
    scene.add(topWarmLight);

    const ambientLight = new THREE.AmbientLight(0x28160c, 1.2);
    scene.add(ambientLight);

    // Mouse parallax tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetRotY = 0;
    let targetRotX = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetRotY = mouseX * 0.28;
      targetRotX = -mouseY * 0.18;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Render loop
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animateLoop = () => {
      animationFrameId = requestAnimationFrame(animateLoop);
      const elapsed = clock.getElapsedTime();

      // Mouse parallax smooth lerp
      mainGroup.rotation.y += (targetRotY - mainGroup.rotation.y) * 0.05;
      mainGroup.rotation.x += (targetRotX - mainGroup.rotation.x) * 0.05;

      // Bean organic rotation & floating
      beanParentGroup.rotation.y = elapsed * 0.72;
      beanParentGroup.position.y = Math.sin(elapsed * 1.8) * 0.08;

      if (isCompletingRef.current) {
        // Smooth dissolve and scale on completion
        beanParentGroup.scale.multiplyScalar(1.015);
        centerLight.intensity = Math.min(10, centerLight.intensity + 0.3);
      }

      // Orbit rings spin
      ring1.rotation.z = elapsed * 0.38;
      ring2.rotation.z = -elapsed * 0.5;

      // Update aroma spiral particles
      const pos = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        particleAngles[i] += particleSpeeds[i] * 0.012;

        particleYOffsets[i] += 0.008 * particleSpeeds[i];
        if (particleYOffsets[i] > 1.8) {
          particleYOffsets[i] = -1.8;
        }

        const r = particleRadii[i] + Math.sin(elapsed * 2 + i) * 0.06;
        const py = particleYOffsets[i];

        pos[i3] = Math.cos(particleAngles[i]) * r;
        pos[i3 + 1] = py;
        pos[i3 + 2] = Math.sin(particleAngles[i]) * r;
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animateLoop();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth || window.innerWidth;
      const h = mountRef.current.clientHeight || 450;
      updateCameraPosition(w, h);
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      wholeBeanGeo.dispose();
      beanMat.dispose();
      chaffGeo.dispose();
      chaffMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      pTexture.dispose();
      diffTexture.dispose();
      bumpTexture.dispose();
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. PROGRESS TIMELINE
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const startTime = performance.now();
    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const rawPct = Math.min(100, Math.floor((elapsed / minDurationMs) * 100));

      setProgress(rawPct);

      if (rawPct < 25) {
        setStatusMessage('Selecting Single-Origin Microlots...');
      } else if (rawPct < 55) {
        setStatusMessage('Roasting to Golden Caramel Profile...');
      } else if (rawPct < 85) {
        setStatusMessage('Extracting Silky Crema & Unhurried Aromas...');
      } else if (rawPct < 100) {
        setStatusMessage('Unhurried Sanctuary Ready.');
      }

      if (rawPct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          isCompletingRef.current = true;
          setIsCompleting(true);

          setTimeout(() => {
            setIsFinished(true);
            onComplete?.();
          }, 450);
        }, 150);
      }
    }, 28);

    return () => clearInterval(interval);
  }, [minDurationMs, onComplete]);

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: isCompleting ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] select-none overflow-hidden bg-[#0E0603] flex flex-col justify-between items-center"
        >
          {/* Ambient Warm Radial Background Glow - ONE Unified Center Gradient with ZERO seams */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgba(197, 155, 99, 0.22) 0%, rgba(35, 15, 7, 0.35) 45%, transparent 75%)',
            }}
          />

          {/* Top Brand Monogram */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="pt-6 sm:pt-10 flex flex-col items-center gap-1 z-20 pointer-events-none"
          >
            <span className="font-serif text-lg sm:text-xl font-bold tracking-[0.22em] text-[#FDF8F0] uppercase">
              Brew &amp; Bloom
            </span>
            <div className="flex items-center gap-2">
              <div className="w-5 h-[1px] bg-[#C59B63]/60" />
              <span className="text-[9px] tracking-[0.32em] text-[#C59B63] uppercase font-semibold">
                SPECIALTY ROASTERY
              </span>
              <div className="w-5 h-[1px] bg-[#C59B63]/60" />
            </div>
          </motion.div>

          {/* Center 3D WebGL Canvas */}
          <div className="relative w-full max-w-2xl flex-1 min-h-[250px] sm:min-h-[380px] max-h-[540px] flex items-center justify-center z-20 pointer-events-none my-auto">
            <div ref={mountRef} className="w-full h-full flex items-center justify-center" />
          </div>

          {/* Bottom Progress UI & Editorial Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md px-5 sm:px-6 pb-6 sm:pb-14 flex flex-col items-center gap-3.5 sm:gap-4 z-20 pointer-events-none"
          >
            {/* Percentage Counter & Status */}
            <div className="w-full flex items-center justify-between text-xs tracking-wider">
              <span className="text-[#FAF3EA]/70 text-[11px] font-medium tracking-wide">
                {statusMessage}
              </span>
              <span className="font-mono text-sm sm:text-base font-bold text-[#C59B63]">
                {progress < 10 ? `0${progress}` : progress}%
              </span>
            </div>

            {/* Hairline Luxury Progress Bar */}
            <div className="relative w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#8C5824] via-[#C59B63] to-[#F2CF98] shadow-[0_0_12px_rgba(242,207,152,0.8)]"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut', duration: 0.1 }}
              />
            </div>

            {/* Est. tag */}
            <div className="text-[9.5px] uppercase tracking-[0.28em] text-[#FAF3EA]/40 pt-1">
              EST. 2021 • ARTISAN COFFEE EXPERIENCE
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ThreePageLoader;

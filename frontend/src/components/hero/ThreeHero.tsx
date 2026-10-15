import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * ThreeHero — Procedural 3D coffee cup with particle steam.
 * Single Three.js scene for the entire site (performance rule #1).
 * Lazy-initialized: canvas only renders after component mounts.
 */
export const ThreeHero: React.FC<{ scrollProgress?: number }> = ({ scrollProgress = 0 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cupGroupRef = useRef<THREE.Group | null>(null);
  const steamParticlesRef = useRef<THREE.Points | null>(null);
  const frameIdRef = useRef<number>(0);
  const clockRef = useRef(new THREE.Clock());
  const reducedMotion = useReducedMotion();

  // Steam particle initial positions (memoized)
  const steamData = useMemo(() => {
    const count = 180;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const lifetimes = new Float32Array(count);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Random position around cup rim (radius ~0.35)
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.15 + Math.random() * 0.2;
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = 0.8 + Math.random() * 0.3; // Start just above cup rim
      positions[i3 + 2] = Math.sin(angle) * radius;

      // Velocities: drift upward with slight horizontal wander
      velocities[i3] = (Math.random() - 0.5) * 0.008;
      velocities[i3 + 1] = 0.01 + Math.random() * 0.015;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.008;

      lifetimes[i] = Math.random(); // Random start phase
      sizes[i] = 2 + Math.random() * 4;
    }

    return { positions, velocities, lifetimes, sizes, count };
  }, []);

  // Create coffee cup geometry using LatheGeometry
  const createCupGeometry = useCallback(() => {
    // Cup profile points (cross-section)
    const cupPoints: THREE.Vector2[] = [];
    // Bottom (flat)
    cupPoints.push(new THREE.Vector2(0, 0));
    cupPoints.push(new THREE.Vector2(0.35, 0));
    // Walls curve outward slightly
    cupPoints.push(new THREE.Vector2(0.38, 0.05));
    cupPoints.push(new THREE.Vector2(0.42, 0.2));
    cupPoints.push(new THREE.Vector2(0.45, 0.4));
    cupPoints.push(new THREE.Vector2(0.47, 0.55));
    cupPoints.push(new THREE.Vector2(0.48, 0.65));
    // Rim flare
    cupPoints.push(new THREE.Vector2(0.50, 0.72));
    cupPoints.push(new THREE.Vector2(0.52, 0.76));
    cupPoints.push(new THREE.Vector2(0.51, 0.80));

    return new THREE.LatheGeometry(cupPoints, 48);
  }, []);

  // Create saucer geometry
  const createSaucerGeometry = useCallback(() => {
    const saucerPoints: THREE.Vector2[] = [];
    saucerPoints.push(new THREE.Vector2(0, -0.02));
    saucerPoints.push(new THREE.Vector2(0.3, -0.02));
    saucerPoints.push(new THREE.Vector2(0.55, -0.01));
    saucerPoints.push(new THREE.Vector2(0.7, 0));
    saucerPoints.push(new THREE.Vector2(0.75, 0.02));
    saucerPoints.push(new THREE.Vector2(0.7, 0.04));
    saucerPoints.push(new THREE.Vector2(0.55, 0.05));
    saucerPoints.push(new THREE.Vector2(0.3, 0.04));
    saucerPoints.push(new THREE.Vector2(0, 0.02));

    return new THREE.LatheGeometry(saucerPoints, 48);
  }, []);

  // Create handle with TorusGeometry
  const createHandle = useCallback(() => {
    const handleGeom = new THREE.TorusGeometry(0.14, 0.035, 12, 24, Math.PI);
    return handleGeom;
  }, []);

  useEffect(() => {
    if (!containerRef.current || reducedMotion) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x140804, 0.15);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.6, 3.5);
    camera.lookAt(0, 0.3, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // === LIGHTING ===
    const ambientLight = new THREE.AmbientLight(0xfff5e6, 0.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffecd2, 1.2);
    keyLight.position.set(3, 4, 2);
    keyLight.castShadow = false;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd4a06a, 0.4);
    fillLight.position.set(-2, 2, -1);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xc9914e, 0.8, 10);
    rimLight.position.set(-1, 1, 3);
    scene.add(rimLight);

    // === CUP GROUP ===
    const cupGroup = new THREE.Group();
    cupGroupRef.current = cupGroup;

    // Cup material — matte ceramic with warm tones
    const cupMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5ede3,
      roughness: 0.65,
      metalness: 0.05,
      envMapIntensity: 0.3,
    });

    // Coffee liquid surface
    const coffeeMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a1f0e,
      roughness: 0.15,
      metalness: 0.2,
    });

    // Saucer material
    const saucerMaterial = new THREE.MeshStandardMaterial({
      color: 0xf0e4d4,
      roughness: 0.6,
      metalness: 0.05,
    });

    // Cup body
    const cupGeom = createCupGeometry();
    const cup = new THREE.Mesh(cupGeom, cupMaterial);
    cupGroup.add(cup);

    // Coffee surface (disk inside cup)
    const coffeeGeom = new THREE.CircleGeometry(0.46, 32);
    const coffee = new THREE.Mesh(coffeeGeom, coffeeMaterial);
    coffee.rotation.x = -Math.PI / 2;
    coffee.position.y = 0.72;
    cupGroup.add(coffee);

    // Handle
    const handleGeom = createHandle();
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: 0xf0e0d0,
      roughness: 0.6,
      metalness: 0.05,
    });
    const handle = new THREE.Mesh(handleGeom, handleMaterial);
    handle.position.set(0.52, 0.45, 0);
    handle.rotation.z = Math.PI / 2;
    cupGroup.add(handle);

    // Saucer
    const saucerGeom = createSaucerGeometry();
    const saucer = new THREE.Mesh(saucerGeom, saucerMaterial);
    saucer.position.y = -0.02;
    cupGroup.add(saucer);

    // Position the cup group
    cupGroup.position.set(0.4, -0.3, 0);
    cupGroup.rotation.y = -0.3;
    scene.add(cupGroup);

    // === STEAM PARTICLES ===
    const steamGeometry = new THREE.BufferGeometry();
    steamGeometry.setAttribute('position', new THREE.Float32BufferAttribute(steamData.positions.slice(), 3));
    steamGeometry.setAttribute('size', new THREE.Float32BufferAttribute(steamData.sizes.slice(), 1));

    const steamMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.06,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const steamPoints = new THREE.Points(steamGeometry, steamMaterial);
    steamPoints.position.copy(cupGroup.position);
    scene.add(steamPoints);
    steamParticlesRef.current = steamPoints;

    // === ANIMATION LOOP ===
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();

      // Slow cup rotation
      if (cupGroup) {
        cupGroup.rotation.y = -0.3 + Math.sin(elapsed * 0.3) * 0.15;
        cupGroup.position.y = -0.3 + Math.sin(elapsed * 0.5) * 0.02;
      }

      // Steam particles: animate upward with drift
      if (steamPoints) {
        const posAttr = steamGeometry.attributes.position as THREE.BufferAttribute;
        const posArray = posAttr.array as Float32Array;

        for (let i = 0; i < steamData.count; i++) {
          const i3 = i * 3;
          steamData.lifetimes[i] += 0.004;

          if (steamData.lifetimes[i] > 1) {
            // Reset particle
            steamData.lifetimes[i] = 0;
            const angle = Math.random() * Math.PI * 2;
            const radius = 0.15 + Math.random() * 0.2;
            posArray[i3] = Math.cos(angle) * radius + cupGroup.position.x;
            posArray[i3 + 1] = cupGroup.position.y + 0.8 + Math.random() * 0.3;
            posArray[i3 + 2] = Math.sin(angle) * radius + cupGroup.position.z;
          } else {
            // Drift upward with noise-like wander
            posArray[i3] += Math.sin(elapsed * 2 + i * 0.5) * 0.001;
            posArray[i3 + 1] += steamData.velocities[i3 + 1];
            posArray[i3 + 2] += Math.cos(elapsed * 1.5 + i * 0.7) * 0.001;
          }
        }

        posAttr.needsUpdate = true;

        // Fade based on collective life
        steamMaterial.opacity = 0.2 + Math.sin(elapsed * 0.8) * 0.05;
      }

      // Camera gentle breathing
      camera.position.x = Math.sin(elapsed * 0.15) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // Camera dolly-in on load
    const startZ = 4.5;
    const endZ = 3.5;
    camera.position.z = startZ;
    const dollyDuration = 2000;
    const dollyStart = performance.now();

    const dollyIn = (now: number) => {
      const t = Math.min((now - dollyStart) / dollyDuration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      camera.position.z = startZ + (endZ - startZ) * eased;
      if (t < 1) requestAnimationFrame(dollyIn);
    };
    requestAnimationFrame(dollyIn);

    // Handle resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameIdRef.current);
      renderer.dispose();
      scene.clear();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [reducedMotion, steamData, createCupGeometry, createSaucerGeometry, createHandle]);

  // Apply scroll-driven transforms externally
  useEffect(() => {
    if (!cupGroupRef.current || !cameraRef.current || !steamParticlesRef.current) return;

    const progress = Math.max(0, Math.min(1, scrollProgress));
    const cup = cupGroupRef.current;
    const steam = steamParticlesRef.current;

    // Cup shrinks and rotates away on scroll
    const scale = 1 - progress * 0.6;
    cup.scale.setScalar(scale);
    cup.rotation.x = progress * 0.5;

    // Fade steam
    (steam.material as THREE.PointsMaterial).opacity = 0.25 * (1 - progress);

    // Overall scene opacity via renderer
    if (rendererRef.current) {
      const domElement = rendererRef.current.domElement;
      domElement.style.opacity = String(1 - progress * 0.8);
    }
  }, [scrollProgress]);

  if (reducedMotion) {
    // Static fallback for reduced motion
    return (
      <div
        ref={containerRef}
        className="absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse at 55% 45%, #8B5E3C 0%, #3A1E0D 50%, #140804 100%)',
        }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="three-canvas-container absolute inset-0 z-0"
      aria-hidden="true"
    />
  );
};

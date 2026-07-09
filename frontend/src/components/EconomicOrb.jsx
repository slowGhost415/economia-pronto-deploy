import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const EconomicOrb = ({ compact = false }) => {
  const mountRef = useRef(null);
  const loadedRef = useRef(false);
  const [fallback, setFallback] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    loadedRef.current = false;
    setLoaded(false);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    if (prefersReduced || isMobile) {
      setFallback(true);
      setLoaded(true);
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, compact ? 4.2 : 5);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setFallback(true);
      setLoaded(true);
      return undefined;
    }

    setFallback(false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(compact ? 0.82 : 1.06, 4),
      new THREE.MeshStandardMaterial({
        color: 0x13243a,
        metalness: 0.45,
        roughness: 0.34,
        emissive: 0x071629,
        emissiveIntensity: 0.42,
      }),
    );
    scene.add(core);

    const wire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(compact ? 0.9 : 1.16, 2),
      new THREE.MeshBasicMaterial({
        color: 0x6ea8fe,
        wireframe: true,
        transparent: true,
        opacity: 0.2,
      }),
    );
    scene.add(wire);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xf3b23c,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });

    const rings = [0, 1].map((i) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(compact ? 1.24 + i * 0.18 : 1.52 + i * 0.24, 0.007, 12, 128),
        ringMaterial.clone(),
      );
      ring.rotation.x = Math.PI / (2.35 + i * 0.26);
      ring.rotation.y = i * 0.78;
      scene.add(ring);
      return ring;
    });

    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = compact ? 90 : 150;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      const radius = 1.75 + Math.random() * 1.1;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(
      particlesGeometry,
      new THREE.PointsMaterial({
        color: 0xd9e7ff,
        size: compact ? 0.01 : 0.014,
        transparent: true,
        opacity: 0.46,
      }),
    );
    scene.add(particles);

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const blue = new THREE.PointLight(0x6ea8fe, 2.1, 12);
    blue.position.set(3, 2, 4);
    scene.add(blue);
    const green = new THREE.PointLight(0x39c980, 1.4, 12);
    green.position.set(-4, -2, 3);
    scene.add(green);

    let frame = 0;
    let rafId = 0;

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const animate = () => {
      frame += 0.01;
      core.rotation.y += 0.0035;
      core.rotation.x = Math.sin(frame) * 0.06;
      wire.rotation.y -= 0.0024;
      particles.rotation.y += 0.001;
      rings.forEach((ring, i) => {
        ring.rotation.z += 0.0024 + i * 0.001;
        ring.rotation.x += 0.0007;
      });
      renderer.render(scene, camera);
      if (!loadedRef.current) {
        loadedRef.current = true;
        setLoaded(true);
      }
      rafId = requestAnimationFrame(animate);
    };

    resize();
    animate();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      renderer.dispose();
      particlesGeometry.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [compact]);

  return (
    <div className={`eco-orb-shell${fallback ? ' fallback' : ''}`} aria-label="Visualizacao abstrata de indicadores economicos">
      {!loaded && <div className="orb-skeleton" aria-hidden="true" />}
      {fallback && (
        <div className="orb-fallback" aria-hidden="true">
          <div className="orb-fallback-core" />
          <span className="orb-ring ring-one" />
          <span className="orb-ring ring-two" />
          <span className="orb-ring ring-three" />
        </div>
      )}
      <div className="eco-orb" ref={mountRef} aria-hidden="true" />
    </div>
  );
};

export default EconomicOrb;

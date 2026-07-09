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
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
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
      new THREE.IcosahedronGeometry(compact ? 0.86 : 1.12, 4),
      new THREE.MeshStandardMaterial({
        color: 0x101722,
        metalness: 0.7,
        roughness: 0.22,
        emissive: 0x05111b,
        emissiveIntensity: 0.55,
      }),
    );
    scene.add(core);

    const wire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(compact ? 0.91 : 1.18, 2),
      new THREE.MeshBasicMaterial({
        color: 0x2cf2ff,
        wireframe: true,
        transparent: true,
        opacity: 0.28,
      }),
    );
    scene.add(wire);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xffb703,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide,
    });

    const rings = [0, 1, 2].map((i) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(compact ? 1.28 + i * 0.16 : 1.62 + i * 0.22, 0.009, 12, 128),
        ringMaterial.clone(),
      );
      ring.rotation.x = Math.PI / (2.2 + i * 0.22);
      ring.rotation.y = i * 0.82;
      scene.add(ring);
      return ring;
    });

    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = compact ? 130 : 220;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      const radius = 1.8 + Math.random() * 1.35;
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
        color: 0xf1f5f9,
        size: compact ? 0.012 : 0.016,
        transparent: true,
        opacity: 0.58,
      }),
    );
    scene.add(particles);

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const cyan = new THREE.PointLight(0x2cf2ff, 2.3, 12);
    cyan.position.set(3, 2, 4);
    scene.add(cyan);
    const amber = new THREE.PointLight(0xffb703, 1.6, 12);
    amber.position.set(-4, -2, 3);
    scene.add(amber);

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
      core.rotation.y += 0.004;
      core.rotation.x = Math.sin(frame) * 0.08;
      wire.rotation.y -= 0.003;
      particles.rotation.y += 0.0014;
      rings.forEach((ring, i) => {
        ring.rotation.z += 0.003 + i * 0.001;
        ring.rotation.x += 0.001;
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
    <div className={`eco-orb-shell${fallback ? ' fallback' : ''}`} aria-label="Visualização abstrata de pressão econômica">
      {!loaded && <div className="orb-skeleton" aria-hidden="true" />}
      {fallback && (
        <div className="orb-fallback" aria-hidden="true">
          <div className="orb-fallback-core" />
          <span className="orb-ring ring-one" />
          <span className="orb-ring ring-two" />
          <span className="orb-ring ring-three" />
          <div className="orb-data-card top">
            <span>Selic</span>
            <strong>juros</strong>
          </div>
          <div className="orb-data-card bottom">
            <span>IPCA</span>
            <strong>preços</strong>
          </div>
        </div>
      )}
      <div className="eco-orb" ref={mountRef} aria-hidden="true" />
    </div>
  );
};

export default EconomicOrb;

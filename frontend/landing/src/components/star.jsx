"use client"

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

const Star = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    camera.position.z = 5;

    // Star shape creation
    function createStarShape(radius, innerRadius) {
      const shape = new THREE.Shape();
      const points = 5;
      const angleStep = (Math.PI * 2) / points;
      shape.moveTo(radius, 0);
      for (let i = 1; i < points * 2; i++) {
        const angle = i * angleStep;
        const r = i % 2 === 0 ? radius : innerRadius;
        shape.lineTo(r * Math.cos(angle), r * Math.sin(angle));
      }
      shape.closePath();
      return shape;
    }

    const shape = createStarShape(1, 0.5);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.2, bevelEnabled: false });

    // Shader material with moving gradient
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color('#ff6b6b') },
        color2: { value: new THREE.Color('#4ecdc4') },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;
        void main() {
          float mixFactor = sin(vUv.y * 3.1416 + time) * 0.5 + 0.5;
          vec3 color = mix(color1, color2, mixFactor);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    const star = new THREE.Mesh(geometry, material);
    scene.add(star);

    // Post-processing for bloom effect
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 1.5, 0.4, 0.85);
    bloomPass.strength = 1.2;
    bloomPass.radius = 0.5;
    composer.addPass(bloomPass);

    // Mouse interaction setup
    const mouse = { x: 0, y: 0 };
    const target = new THREE.Vector3(0, 0, 0);
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    const onMouseMove = (event) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      const time = clock.getElapsedTime();
      material.uniforms.time.value = time;

      // Continuous rotation
      star.rotation.y += 0.01;

      // Mouse attraction
      raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);
      const intersect = raycaster.ray.intersectPlane(plane);
      if (intersect) {
        const starScreen = star.position.clone().project(camera);
        const distance = Math.sqrt(
          (starScreen.x - mouse.x) ** 2 + (starScreen.y - mouse.y) ** 2
        );

        if (distance < 0.2) {
          target.copy(intersect);
        } else {
          target.set(0, 0, 0);
        }
        star.position.lerp(target, 0.1);
      }

      composer.render();
      requestAnimationFrame(animate);
    };
    animate();

    // Handle window resize
    const onResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      renderer.setSize(newWidth, newHeight);
      composer.setSize(newWidth, newHeight);
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default Star;
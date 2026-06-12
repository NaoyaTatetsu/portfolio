"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const vertexShader = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

// タップル風メタボール: 複数のブロブが漂いながら融合し、
// 縁にハイライトを乗せてシャボン玉のような質感を出す
const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec2 uResolution;

const int BLOB_COUNT = 6;

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 p = gl_FragCoord.xy / uResolution;
  p.x *= aspect;

  float t = uTime;

  vec2 centers[BLOB_COUNT];
  vec3 colors[BLOB_COUNT];
  float radii[BLOB_COUNT];

  centers[0] = vec2((0.25 + 0.18 * sin(t * 0.32 + 1.7)) * aspect, 0.65 + 0.20 * cos(t * 0.21));
  colors[0] = vec3(1.0, 0.50, 0.69);
  radii[0] = 0.22;

  centers[1] = vec2((0.75 + 0.20 * sin(t * 0.24 + 4.2)) * aspect, 0.70 + 0.16 * cos(t * 0.33 + 0.8));
  colors[1] = vec3(1.0, 0.75, 0.25);
  radii[1] = 0.18;

  centers[2] = vec2((0.55 + 0.24 * sin(t * 0.18 + 2.6)) * aspect, 0.30 + 0.18 * cos(t * 0.27 + 3.1));
  colors[2] = vec3(0.40, 0.80, 0.80);
  radii[2] = 0.24;

  centers[3] = vec2((0.20 + 0.15 * sin(t * 0.36 + 5.5)) * aspect, 0.25 + 0.22 * cos(t * 0.19 + 1.2));
  colors[3] = vec3(0.50, 0.70, 1.0);
  radii[3] = 0.16;

  centers[4] = vec2((0.85 + 0.14 * sin(t * 0.22 + 0.4)) * aspect, 0.30 + 0.24 * cos(t * 0.30 + 5.0));
  colors[4] = vec3(0.71, 0.60, 1.0);
  radii[4] = 0.20;

  centers[5] = vec2((0.50 + 0.22 * sin(t * 0.28 + 3.8)) * aspect, 0.80 + 0.14 * cos(t * 0.23 + 2.2));
  colors[5] = vec3(1.0, 0.45, 0.66);
  radii[5] = 0.15;

  float field = 0.0;
  vec3 colSum = vec3(0.0);
  for (int i = 0; i < BLOB_COUNT; i++) {
    float d = length(p - centers[i]);
    float c = (radii[i] * radii[i]) / (d * d + 0.003);
    field += c;
    colSum += colors[i] * c;
  }

  vec3 col = colSum / max(field, 0.0001);
  float alpha = (1.0 - exp(-field * 0.6)) * 0.5;
  float rim = exp(-pow((field - 1.1) * 3.5, 2.0));
  col = mix(col, vec3(1.0), rim * 0.3);

  gl_FragColor = vec4(col, alpha);
}
`;

export default function BubbleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // WebGLが使えない環境(コンテキスト上限超過など)では背景なしで動作させる。
    // ここで例外を投げるとNext.jsのdevオーバーレイがbodyにoverflow:hiddenを
    // 設定し、ページ全体がスクロール不能になる
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = {
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    const clock = new THREE.Clock();
    let frameId = 0;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const renderFrame = () => {
      uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    };
    const loop = () => {
      renderFrame();
      frameId = requestAnimationFrame(loop);
    };
    if (reduceMotion) {
      renderFrame();
    } else {
      loop();
    }

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
      if (reduceMotion) {
        renderFrame();
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      mesh.geometry.dispose();
      material.dispose();
      renderer.dispose();
      // HMRでの再マウントごとにWebGLコンテキストが溜まり上限超過で
      // 生成失敗するのを防ぐため、明示的にコンテキストを解放する
      renderer.forceContextLoss();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  );
}

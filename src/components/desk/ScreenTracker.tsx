"use client";

import { useFrame, useThree } from "@react-three/fiber";
import type { RefObject } from "react";
import { Vector3 } from "three";

const SCREEN_CENTER = new Vector3(0, 1.55, -1.758);
const SCREEN_HALF_W = 0.75;
const SCREEN_HALF_H = 0.45;

// Native resolution at which MacDesktop is rendered before transform.
export const DESKTOP_NATIVE_WIDTH = 1500;
export const DESKTOP_NATIVE_HEIGHT = 900;

// Order: TL, TR, BL, BR (matches +Y/-Y on the plane)
const CORNERS = [
  new Vector3(-SCREEN_HALF_W, SCREEN_HALF_H, 0).add(SCREEN_CENTER),
  new Vector3(SCREEN_HALF_W, SCREEN_HALF_H, 0).add(SCREEN_CENTER),
  new Vector3(-SCREEN_HALF_W, -SCREEN_HALF_H, 0).add(SCREEN_CENTER),
  new Vector3(SCREEN_HALF_W, -SCREEN_HALF_H, 0).add(SCREEN_CENTER),
];

const tmp = new Vector3();

interface ScreenTrackerProps {
  innerRef: RefObject<HTMLDivElement | null>;
}

export default function ScreenTracker({ innerRef }: ScreenTrackerProps) {
  const { camera, size } = useThree();

  useFrame(() => {
    const inner = innerRef.current;
    if (!inner) return;

    // OrbitControls/CameraRig mutate camera.position & camera.rotation,
    // but matrixWorld / matrixWorldInverse are only refreshed inside
    // renderer.render(). Force update so projection uses the latest matrix.
    camera.updateMatrixWorld();

    const px: number[] = new Array(4);
    const py: number[] = new Array(4);
    for (let i = 0; i < 4; i++) {
      tmp.copy(CORNERS[i]).project(camera);
      px[i] = ((tmp.x + 1) / 2) * size.width;
      py[i] = ((1 - tmp.y) / 2) * size.height;
    }

    // Map source rectangle (0,0)-(W,0)-(W,H)-(0,H) to target quad
    //   (0,0) -> TL = px[0],py[0]
    //   (W,0) -> TR = px[1],py[1]
    //   (W,H) -> BR = px[3],py[3]
    //   (0,H) -> BL = px[2],py[2]
    const x0 = px[0];
    const y0 = py[0];
    const x1 = px[1];
    const y1 = py[1];
    const x2 = px[3];
    const y2 = py[3];
    const x3 = px[2];
    const y3 = py[2];

    // Solve for projective parameters g, h (last row of 3x3 homography)
    // Equations derived from forcing the homography to match the 4th corner.
    const m11 = x1 - x2;
    const m12 = x3 - x2;
    const m21 = y1 - y2;
    const m22 = y3 - y2;
    const det = m11 * m22 - m12 * m21;
    const rx = x0 - x1 - x3 + x2;
    const ry = y0 - y1 - y3 + y2;

    let g = 0;
    let h = 0;
    if (Math.abs(det) > 1e-9) {
      g = (rx * m22 - m12 * ry) / det;
      h = (m11 * ry - rx * m21) / det;
    }

    // Remaining 3x3 elements (a..f map unit square to target)
    const a = x1 * (g + 1) - x0;
    const d = y1 * (g + 1) - y0;
    const b = x3 * (h + 1) - x0;
    const e = y3 * (h + 1) - y0;
    const c = x0;
    const f = y0;

    // Compose with scale (rectangle W x H -> unit square): divide columns by W and H
    const aS = a / DESKTOP_NATIVE_WIDTH;
    const bS = b / DESKTOP_NATIVE_HEIGHT;
    const dS = d / DESKTOP_NATIVE_WIDTH;
    const eS = e / DESKTOP_NATIVE_HEIGHT;
    const gS = g / DESKTOP_NATIVE_WIDTH;
    const hS = h / DESKTOP_NATIVE_HEIGHT;

    // CSS matrix3d, column-major, embedding 2D homography in 4x4:
    //  | a b 0 c |
    //  | d e 0 f |
    //  | 0 0 1 0 |
    //  | g h 0 1 |
    inner.style.transform = `matrix3d(${aS}, ${dS}, 0, ${gS}, ${bS}, ${eS}, 0, ${hS}, 0, 0, 1, 0, ${c}, ${f}, 0, 1)`;
  });

  return null;
}

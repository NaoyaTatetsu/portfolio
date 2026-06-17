"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import {
  mulberry32,
  PLANET_RADIUS,
  surfacePos,
  surfaceQuat,
} from "./planet-config";

const ROOF_COLORS = [
  "#c95a4e",
  "#5c8acb",
  "#e8a14a",
  "#7da66a",
  "#e8c44e",
  "#d97a4e",
  "#a86ec3",
  "#5fb8c5",
];

const WALL_COLORS = ["#fff4dc", "#f4e5cc", "#f7dab2", "#fdebd0", "#e9d6a6"];

interface CONTINENT {
  phi: number;
  theta: number;
  size: number;
  buildings: number;
  trees: number;
}

const CONTINENTS: CONTINENT[] = [
  { phi: 0.75, theta: 0.4, size: 1.7, buildings: 9, trees: 7 },
  { phi: 1.25, theta: 1.9, size: 1.55, buildings: 8, trees: 6 },
  { phi: 1.55, theta: 3.6, size: 1.8, buildings: 10, trees: 8 },
  { phi: 2.0, theta: 1.1, size: 1.35, buildings: 6, trees: 5 },
  { phi: 0.9, theta: 5.1, size: 1.45, buildings: 7, trees: 6 },
  { phi: 1.7, theta: 5.3, size: 1.15, buildings: 5, trees: 4 },
];

const MIN_BUILDING_GAP = 0.14; // arc gap needed so a CHARACTER_RADIUS=0.07 player can slip between

interface Placement {
  id: string;
  phi: number;
  theta: number;
  typeIndex: number;
  colorIndex: number;
  wallIndex: number;
  rotation: number;
  scale: number;
}

interface TreePlacement {
  id: string;
  phi: number;
  theta: number;
  variant: number;
  rotation: number;
  scale: number;
}

interface CloudPlacement {
  id: string;
  position: [number, number, number];
  scale: number;
  parts: number;
}

interface LampPlacement {
  id: string;
  phi: number;
  theta: number;
}

function buildingRadius(typeIndex: number, scale: number): number {
  // Use inscribed-circle radius (half min-side) so the character can squeeze
  // through visible gaps. Corners may visually overlap the character slightly
  // when approached diagonally — acceptable trade.
  const w = 0.2 * scale;
  switch (typeIndex) {
    case 0:
      return w * 0.5; // cottage (square w × w)
    case 1:
      return w * 0.4; // townhouse (0.8w × 0.8w)
    case 2:
      return w * 0.5; // shop (1.45w × 0.95w → bounded by depth)
    case 3:
      return w * 0.55; // tower (cylinder of radius 0.5w + slight overhang)
    case 4:
      return w * 0.4; // cabin (0.98w × 0.7w → bounded by depth)
    default:
      return w * 0.5;
  }
}

function generateData() {
  const rand = mulberry32(7);
  const buildings: Placement[] = [];
  const buildingPositions: THREE.Vector3[] = [];
  const buildingRadii: number[] = [];
  const trees: TreePlacement[] = [];
  const lamps: LampPlacement[] = [];

  const tryPlaceBuilding = (
    c: CONTINENT,
    lonScale: number,
    id: string,
    typeIndex: number,
    colorIndex: number,
    wallIndex: number,
    rotation: number,
    scale: number,
  ): boolean => {
    const myR = buildingRadius(typeIndex, scale);
    for (let attempt = 0; attempt < 45; attempt++) {
      const a = rand() * Math.PI * 2;
      const dist = rand() * 0.5 * c.size;
      const phi = c.phi + Math.cos(a) * dist;
      const theta = c.theta + Math.sin(a) * dist * lonScale;
      const pos = surfacePos(phi, theta);
      let ok = true;
      for (let i = 0; i < buildingPositions.length; i++) {
        const minD = myR + buildingRadii[i] + MIN_BUILDING_GAP;
        if (pos.distanceToSquared(buildingPositions[i]) < minD * minD) {
          ok = false;
          break;
        }
      }
      if (ok) {
        buildings.push({
          id,
          phi,
          theta,
          typeIndex,
          colorIndex,
          wallIndex,
          rotation,
          scale,
        });
        buildingPositions.push(pos);
        buildingRadii.push(myR);
        return true;
      }
    }
    return false;
  };

  CONTINENTS.forEach((c, ci) => {
    const lonScale = 1 / Math.max(0.25, Math.sin(c.phi));
    // Lamp posts (2 per continent at edge)
    for (let l = 0; l < 2; l++) {
      const a = rand() * Math.PI * 2;
      const dist = 0.13 + rand() * 0.07;
      lamps.push({
        id: `l-${ci}-${l}`,
        phi: c.phi + Math.cos(a) * dist,
        theta: c.theta + Math.sin(a) * dist * lonScale,
      });
    }
    // Buildings with rejection sampling for spacing
    for (let b = 0; b < c.buildings; b++) {
      // attribute draws happen BEFORE placement attempts so the rand sequence
      // doesn't shift across retries
      const typeIndex = Math.floor(rand() * 5);
      const colorIndex = Math.floor(rand() * ROOF_COLORS.length);
      const wallIndex = Math.floor(rand() * WALL_COLORS.length);
      const rotation = rand() * Math.PI * 2;
      const scale = 0.85 + rand() * 0.45;
      tryPlaceBuilding(
        c,
        lonScale,
        `b-${ci}-${b}`,
        typeIndex,
        colorIndex,
        wallIndex,
        rotation,
        scale,
      );
    }
    // Trees (placed in gaps between buildings)
    for (let t = 0; t < c.trees; t++) {
      const a = rand() * Math.PI * 2;
      const dist = rand() * 0.45 * c.size;
      trees.push({
        id: `t-${ci}-${t}`,
        phi: c.phi + Math.cos(a) * dist,
        theta: c.theta + Math.sin(a) * dist * lonScale,
        variant: Math.floor(rand() * 2),
        rotation: rand() * Math.PI * 2,
        scale: 0.75 + rand() * 0.5,
      });
    }
  });

  // Scattered lone trees on the open ocean continents (between landmasses)
  for (let i = 0; i < 6; i++) {
    const phi = 0.3 + rand() * (Math.PI - 0.6);
    const theta = rand() * Math.PI * 2;
    trees.push({
      id: `lone-${i}`,
      phi,
      theta,
      variant: Math.floor(rand() * 2),
      rotation: rand() * Math.PI * 2,
      scale: 0.65 + rand() * 0.3,
    });
  }

  const clouds: CloudPlacement[] = [];
  for (let i = 0; i < 10; i++) {
    const a = rand() * Math.PI * 2;
    const elev = -1.6 + rand() * 3.4;
    const dist = 2.6 + rand() * 0.6;
    clouds.push({
      id: `cl-${i}`,
      position: [Math.cos(a) * dist, elev, Math.sin(a) * dist],
      scale: 0.45 + rand() * 0.55,
      parts: 3 + Math.floor(rand() * 3),
    });
  }

  return { buildings, trees, clouds, lamps };
}

const DATA = generateData();

export interface Obstacle {
  position: THREE.Vector3;
  radius: number;
}

export const OBSTACLES: Obstacle[] = (() => {
  const arr: Obstacle[] = [];
  for (const b of DATA.buildings) {
    arr.push({
      position: surfacePos(b.phi, b.theta),
      radius: buildingRadius(b.typeIndex, b.scale),
    });
  }
  for (const t of DATA.trees) {
    arr.push({
      position: surfacePos(t.phi, t.theta),
      // collision only at trunk-ish footprint, not leaf canopy
      radius: 0.04 * t.scale,
    });
  }
  for (const l of DATA.lamps) {
    arr.push({
      position: surfacePos(l.phi, l.theta),
      radius: 0.014,
    });
  }
  // Windmill + Lighthouse (fixed positions matching render)
  arr.push({ position: surfacePos(1.05, 1.65), radius: 0.05 });
  arr.push({ position: surfacePos(1.7, 4.7), radius: 0.035 });
  return arr;
})();

interface BuildingMeshProps {
  type: number;
  rotation: number;
  scale: number;
  roof: string;
  wall: string;
}

const FOUNDATION_COLOR = "#6b6055";
const DOOR_COLOR = "#3d2818";
const TRIM_COLOR = "#4a3a28";
const RIDGE_COLOR = "#2a2018";
const WAINSCOT_COLOR = "#9c8060";
const CHIMNEY_BRICK = "#8a4a2e";
const WINDOW_LIT = "#f8d97a";
const WINDOW_DIM = "#88a8bf";
const LAMP_POST = "#2d2820";
const LAMP_GLOW = "#ffd870";

function pickWindow(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h) % 3 === 0 ? WINDOW_LIT : WINDOW_DIM;
}

const UNIT_GABLED_ROOF_GEO = (() => {
  // unit-sized triangular prism: width=1 (X), depth=1 (Z), ridge at y=1
  const v: number[] = [];
  const push = (...pts: number[][]) => {
    for (const p of pts) v.push(...p);
  };
  // front gable (CCW from outside, facing +Z)
  push([-0.5, 0, 0.5], [0.5, 0, 0.5], [0, 1, 0.5]);
  // back gable (facing -Z)
  push([0, 1, -0.5], [0.5, 0, -0.5], [-0.5, 0, -0.5]);
  // left slope
  push([-0.5, 0, -0.5], [-0.5, 0, 0.5], [0, 1, 0.5]);
  push([-0.5, 0, -0.5], [0, 1, 0.5], [0, 1, -0.5]);
  // right slope
  push([0.5, 0, 0.5], [0.5, 0, -0.5], [0, 1, -0.5]);
  push([0.5, 0, 0.5], [0, 1, -0.5], [0, 1, 0.5]);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(v), 3),
  );
  geo.computeVertexNormals();
  return geo;
})();

interface WinProps {
  width: number;
  height: number;
  color: string;
}

function Win({ width, height, color }: WinProps) {
  return (
    <>
      <mesh castShadow>
        <boxGeometry args={[width + 0.014, height + 0.014, 0.005]} />
        <meshStandardMaterial color={TRIM_COLOR} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.002]} castShadow>
        <boxGeometry args={[width, height, 0.005]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
          roughness={0.25}
        />
      </mesh>
      {/* cross frame */}
      <mesh position={[0, 0, 0.004]}>
        <boxGeometry args={[width + 0.001, 0.003, 0.002]} />
        <meshStandardMaterial color={TRIM_COLOR} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.004]}>
        <boxGeometry args={[0.003, height + 0.001, 0.002]} />
        <meshStandardMaterial color={TRIM_COLOR} roughness={0.8} />
      </mesh>
    </>
  );
}

interface DoorProps {
  width: number;
  height: number;
}

function Door({ width, height }: DoorProps) {
  return (
    <>
      {/* frame */}
      <mesh castShadow>
        <boxGeometry args={[width + 0.012, height + 0.008, 0.005]} />
        <meshStandardMaterial color={TRIM_COLOR} roughness={0.85} />
      </mesh>
      {/* door panel */}
      <mesh position={[0, 0, 0.002]} castShadow>
        <boxGeometry args={[width, height, 0.005]} />
        <meshStandardMaterial color={DOOR_COLOR} roughness={0.8} />
      </mesh>
      {/* doorknob */}
      <mesh position={[width * 0.32, 0, 0.005]} castShadow>
        <sphereGeometry args={[0.0035, 8, 6]} />
        <meshStandardMaterial color="#d4b870" metalness={0.7} roughness={0.3} />
      </mesh>
    </>
  );
}

function BuildingMesh({
  type,
  rotation,
  scale,
  roof,
  wall,
}: BuildingMeshProps) {
  const w = 0.2 * scale;
  const h = 0.16 * scale;
  const windowColor = pickWindow(roof + wall);
  const FRONT_OFFSET = 0.0018;

  if (type === 0) {
    // Cottage with gabled roof
    const wallH = h * 1.05;
    const foundH = 0.014 * scale;
    const baseY = foundH;
    const eaveH = 0.012 * scale;
    const roofH = 0.085 * scale;
    const wainscotH = wallH * 0.22;
    const winW = w * 0.22;
    const winH = wallH * 0.26;
    const winY = baseY + wallH * 0.6;
    const doorW = w * 0.22;
    const doorH = wallH * 0.55;
    return (
      <group rotation={[0, rotation, 0]}>
        {/* foundation */}
        <mesh position={[0, foundH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[w * 1.1, foundH, w * 1.1]} />
          <meshStandardMaterial color={FOUNDATION_COLOR} roughness={0.95} />
        </mesh>
        {/* walls */}
        <mesh position={[0, baseY + wallH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, wallH, w]} />
          <meshStandardMaterial color={wall} roughness={0.78} />
        </mesh>
        {/* wainscot (darker bottom band) */}
        <mesh position={[0, baseY + wainscotH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[w * 1.005, wainscotH, w * 1.005]} />
          <meshStandardMaterial color={WAINSCOT_COLOR} roughness={0.85} />
        </mesh>
        {/* door + step */}
        <group position={[0, baseY + doorH / 2, w / 2 + FRONT_OFFSET]}>
          <Door width={doorW} height={doorH} />
        </group>
        <mesh
          position={[0, baseY + 0.005, w / 2 + 0.012 * scale]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[doorW * 1.5, 0.01 * scale, 0.018 * scale]} />
          <meshStandardMaterial color={FOUNDATION_COLOR} roughness={0.95} />
        </mesh>
        {/* windows on 4 sides */}
        <group
          position={[w / 2 + FRONT_OFFSET, winY, w * 0.22]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <Win width={winW} height={winH} color={windowColor} />
        </group>
        <group
          position={[w / 2 + FRONT_OFFSET, winY, -w * 0.22]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <Win width={winW} height={winH} color={windowColor} />
        </group>
        <group
          position={[-w / 2 - FRONT_OFFSET, winY, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        >
          <Win width={winW * 1.1} height={winH} color={windowColor} />
        </group>
        <group
          position={[0, winY, -w / 2 - FRONT_OFFSET]}
          rotation={[0, Math.PI, 0]}
        >
          <Win width={winW * 1.1} height={winH} color={windowColor} />
        </group>
        {/* eave (overhang) */}
        <mesh position={[0, baseY + wallH + eaveH / 2, 0]} castShadow>
          <boxGeometry args={[w * 1.22, eaveH, w * 1.22]} />
          <meshStandardMaterial color={TRIM_COLOR} roughness={0.75} />
        </mesh>
        {/* gabled roof (ridge along Z) */}
        <mesh
          geometry={UNIT_GABLED_ROOF_GEO}
          position={[0, baseY + wallH + eaveH, 0]}
          scale={[w * 1.22, roofH, w * 1.22]}
          castShadow
        >
          <meshStandardMaterial color={roof} roughness={0.72} />
        </mesh>
        {/* ridge cap */}
        <mesh position={[0, baseY + wallH + eaveH + roofH, 0]} castShadow>
          <boxGeometry args={[0.012, 0.009, w * 1.24]} />
          <meshStandardMaterial color={RIDGE_COLOR} roughness={0.8} />
        </mesh>
      </group>
    );
  }

  if (type === 1) {
    // Townhouse with gabled roof, 2 floors
    const wallW = w * 0.8;
    const wallH = 0.32 * scale;
    const foundH = 0.014 * scale;
    const baseY = foundH;
    const eaveH = 0.014 * scale;
    const roofH = 0.16 * scale;
    const wainscotH = wallH * 0.15;
    const winW = wallW * 0.22;
    const winH = wallH * 0.16;
    const floorMidY = baseY + wallH * 0.5;
    const f1Y = baseY + wallH * 0.27;
    const f2Y = baseY + wallH * 0.74;
    const doorW = wallW * 0.26;
    const doorH = wallH * 0.3;
    return (
      <group rotation={[0, rotation, 0]}>
        <mesh position={[0, foundH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[wallW * 1.12, foundH, wallW * 1.12]} />
          <meshStandardMaterial color={FOUNDATION_COLOR} roughness={0.95} />
        </mesh>
        <mesh position={[0, baseY + wallH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[wallW, wallH, wallW]} />
          <meshStandardMaterial color={wall} roughness={0.78} />
        </mesh>
        {/* wainscot */}
        <mesh position={[0, baseY + wainscotH / 2, 0]} castShadow>
          <boxGeometry args={[wallW * 1.005, wainscotH, wallW * 1.005]} />
          <meshStandardMaterial color={WAINSCOT_COLOR} roughness={0.85} />
        </mesh>
        {/* mid floor stripe */}
        <mesh position={[0, floorMidY, 0]} castShadow>
          <boxGeometry args={[wallW + 0.005, 0.01 * scale, wallW + 0.005]} />
          <meshStandardMaterial color={TRIM_COLOR} roughness={0.7} />
        </mesh>
        {/* door + step */}
        <group position={[0, baseY + doorH / 2, wallW / 2 + FRONT_OFFSET]}>
          <Door width={doorW} height={doorH} />
        </group>
        <mesh
          position={[0, baseY + 0.005, wallW / 2 + 0.012 * scale]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[doorW * 1.5, 0.01 * scale, 0.018 * scale]} />
          <meshStandardMaterial color={FOUNDATION_COLOR} roughness={0.95} />
        </mesh>
        {/* floor1 front windows (2) */}
        <group position={[wallW * 0.28, f1Y, wallW / 2 + FRONT_OFFSET]}>
          <Win width={winW} height={winH} color={windowColor} />
        </group>
        <group position={[-wallW * 0.28, f1Y, wallW / 2 + FRONT_OFFSET]}>
          <Win width={winW} height={winH} color={windowColor} />
        </group>
        {/* floor2 front windows (2) */}
        <group position={[wallW * 0.25, f2Y, wallW / 2 + FRONT_OFFSET]}>
          <Win width={winW} height={winH} color={windowColor} />
        </group>
        <group position={[-wallW * 0.25, f2Y, wallW / 2 + FRONT_OFFSET]}>
          <Win width={winW} height={winH} color={windowColor} />
        </group>
        {/* side windows (one per floor on +X) */}
        <group
          position={[wallW / 2 + FRONT_OFFSET, f1Y, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <Win width={winW} height={winH} color={windowColor} />
        </group>
        <group
          position={[wallW / 2 + FRONT_OFFSET, f2Y, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <Win width={winW} height={winH} color={windowColor} />
        </group>
        {/* side windows (one per floor on -X) */}
        <group
          position={[-wallW / 2 - FRONT_OFFSET, f1Y, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        >
          <Win width={winW} height={winH} color={windowColor} />
        </group>
        <group
          position={[-wallW / 2 - FRONT_OFFSET, f2Y, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        >
          <Win width={winW} height={winH} color={windowColor} />
        </group>
        {/* eave */}
        <mesh position={[0, baseY + wallH + eaveH / 2, 0]} castShadow>
          <boxGeometry args={[wallW * 1.18, eaveH, wallW * 1.18]} />
          <meshStandardMaterial color={TRIM_COLOR} roughness={0.75} />
        </mesh>
        {/* gabled roof */}
        <mesh
          geometry={UNIT_GABLED_ROOF_GEO}
          position={[0, baseY + wallH + eaveH, 0]}
          scale={[wallW * 1.18, roofH, wallW * 1.18]}
          castShadow
        >
          <meshStandardMaterial color={roof} roughness={0.72} />
        </mesh>
        {/* ridge cap */}
        <mesh position={[0, baseY + wallH + eaveH + roofH, 0]} castShadow>
          <boxGeometry args={[0.012, 0.009, wallW * 1.2]} />
          <meshStandardMaterial color={RIDGE_COLOR} roughness={0.8} />
        </mesh>
        {/* chimney on roof */}
        <mesh
          position={[
            wallW * 0.28,
            baseY + wallH + eaveH + roofH * 0.4,
            wallW * 0.15,
          ]}
          castShadow
        >
          <boxGeometry args={[0.024, 0.075 * scale, 0.024]} />
          <meshStandardMaterial color={CHIMNEY_BRICK} roughness={0.9} />
        </mesh>
      </group>
    );
  }

  if (type === 2) {
    // Shop with awning + signboard
    const wallW = w * 1.45;
    const wallD = w * 0.95;
    const wallH = h * 0.95;
    const foundH = 0.012 * scale;
    const baseY = foundH;
    const eaveH = 0.014 * scale;
    const doorW = wallW * 0.16;
    const doorH = wallH * 0.65;
    const winColor = windowColor;
    return (
      <group rotation={[0, rotation, 0]}>
        <mesh position={[0, foundH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[wallW + 0.014, foundH, wallD + 0.014]} />
          <meshStandardMaterial color={FOUNDATION_COLOR} roughness={0.95} />
        </mesh>
        <mesh position={[0, baseY + wallH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[wallW, wallH, wallD]} />
          <meshStandardMaterial color={wall} roughness={0.78} />
        </mesh>
        {/* signboard above the entrance */}
        <mesh
          position={[0, baseY + wallH * 0.92, wallD / 2 + 0.005]}
          castShadow
        >
          <boxGeometry args={[wallW * 0.85, wallH * 0.12, 0.012]} />
          <meshStandardMaterial color={roof} roughness={0.6} />
        </mesh>
        <mesh
          position={[0, baseY + wallH * 0.92, wallD / 2 + 0.012]}
          castShadow
        >
          <boxGeometry args={[wallW * 0.83, wallH * 0.07, 0.005]} />
          <meshStandardMaterial
            color="#fff4dc"
            emissive="#fff4dc"
            emissiveIntensity={0.15}
            roughness={0.5}
          />
        </mesh>
        {/* shop window (front-right) — bigger, framed */}
        <group
          position={[
            wallW * 0.22,
            baseY + wallH * 0.5,
            wallD / 2 + FRONT_OFFSET,
          ]}
        >
          <Win width={wallW * 0.45} height={wallH * 0.55} color={winColor} />
        </group>
        {/* small front window above */}
        <group
          position={[
            wallW * 0.32,
            baseY + wallH * 0.78,
            wallD / 2 + FRONT_OFFSET,
          ]}
        >
          <Win width={wallW * 0.18} height={wallH * 0.12} color={winColor} />
        </group>
        {/* door */}
        <group
          position={[
            -wallW * 0.32,
            baseY + doorH / 2,
            wallD / 2 + FRONT_OFFSET,
          ]}
        >
          <Door width={doorW} height={doorH} />
        </group>
        {/* step in front of door */}
        <mesh
          position={[-wallW * 0.32, baseY + 0.005, wallD / 2 + 0.013 * scale]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[doorW * 1.6, 0.012 * scale, 0.022 * scale]} />
          <meshStandardMaterial color={FOUNDATION_COLOR} roughness={0.95} />
        </mesh>
        {/* awning above door */}
        <mesh
          position={[
            -wallW * 0.32,
            baseY + doorH + 0.018 * scale,
            wallD / 2 + 0.02 * scale,
          ]}
          rotation={[-Math.PI / 14, 0, 0]}
          castShadow
        >
          <boxGeometry args={[doorW * 1.7, 0.008 * scale, 0.045 * scale]} />
          <meshStandardMaterial color={roof} roughness={0.7} />
        </mesh>
        {/* side window */}
        <group
          position={[wallW / 2 + FRONT_OFFSET, baseY + wallH * 0.55, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <Win width={wallD * 0.4} height={wallH * 0.32} color={winColor} />
        </group>
        {/* flat roof */}
        <mesh position={[0, baseY + wallH + eaveH / 2, 0]} castShadow>
          <boxGeometry args={[wallW * 1.06, eaveH, wallD * 1.08]} />
          <meshStandardMaterial color={roof} roughness={0.7} />
        </mesh>
        {/* parapet edge */}
        <mesh position={[0, baseY + wallH + eaveH + 0.004, 0]} castShadow>
          <boxGeometry args={[wallW * 1.04, 0.008, wallD * 1.06]} />
          <meshStandardMaterial color={TRIM_COLOR} roughness={0.8} />
        </mesh>
        {/* chimney */}
        <mesh
          position={[wallW * 0.35, baseY + wallH + 0.05 * scale, wallD * 0.2]}
          castShadow
        >
          <boxGeometry args={[0.028, 0.075 * scale, 0.028]} />
          <meshStandardMaterial color={CHIMNEY_BRICK} roughness={0.85} />
        </mesh>
        {/* chimney cap */}
        <mesh
          position={[wallW * 0.35, baseY + wallH + 0.092 * scale, wallD * 0.2]}
          castShadow
        >
          <boxGeometry args={[0.036, 0.006 * scale, 0.036]} />
          <meshStandardMaterial color={TRIM_COLOR} roughness={0.85} />
        </mesh>
      </group>
    );
  }

  if (type === 3) {
    // Tower
    const tw = w * 0.5;
    const wallH = 0.38 * scale;
    const foundH = 0.014 * scale;
    const baseY = foundH;
    const roofH = 0.17 * scale;
    const winW = tw * 0.32;
    const winH = 0.028 * scale;
    const doorW = tw * 0.5;
    const doorH = wallH * 0.32;
    return (
      <group rotation={[0, rotation, 0]}>
        {/* octagonal foundation */}
        <mesh position={[0, foundH / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[tw * 1.2, tw * 1.2, foundH, 8]} />
          <meshStandardMaterial color={FOUNDATION_COLOR} roughness={0.95} />
        </mesh>
        {/* main shaft */}
        <mesh position={[0, baseY + wallH / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[tw, tw * 1.06, wallH, 16]} />
          <meshStandardMaterial color={wall} roughness={0.78} />
        </mesh>
        {/* stone base course (lower 25%) */}
        <mesh position={[0, baseY + wallH * 0.12, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[tw * 1.04, tw * 1.07, wallH * 0.24, 16]} />
          <meshStandardMaterial color={WAINSCOT_COLOR} roughness={0.9} />
        </mesh>
        {/* door (front +Z) */}
        <group position={[0, baseY + doorH / 2, tw + FRONT_OFFSET]}>
          <Door width={doorW} height={doorH} />
        </group>
        {/* mid-level windows (4 around) */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((a) => (
          <group
            key={`tw-mid-${a}`}
            position={[
              Math.sin(a) * (tw + FRONT_OFFSET),
              baseY + wallH * 0.45,
              Math.cos(a) * (tw + FRONT_OFFSET),
            ]}
            rotation={[0, a, 0]}
          >
            <Win width={winW} height={winH} color={windowColor} />
          </group>
        ))}
        {/* upper-level windows (4 around) */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((a) => (
          <group
            key={`tw-top-${a}`}
            position={[
              Math.sin(a) * (tw + FRONT_OFFSET),
              baseY + wallH * 0.76,
              Math.cos(a) * (tw + FRONT_OFFSET),
            ]}
            rotation={[0, a, 0]}
          >
            <Win width={winW * 0.8} height={winH * 0.8} color={windowColor} />
          </group>
        ))}
        {/* corbel ring (decorative ledge under crown) */}
        <mesh position={[0, baseY + wallH * 0.93, 0]} castShadow>
          <cylinderGeometry args={[tw * 1.16, tw * 1.08, 0.012 * scale, 16]} />
          <meshStandardMaterial color={TRIM_COLOR} roughness={0.75} />
        </mesh>
        {/* trim ring at top */}
        <mesh position={[0, baseY + wallH + 0.006 * scale, 0]} castShadow>
          <cylinderGeometry args={[tw * 1.14, tw * 1.14, 0.014 * scale, 16]} />
          <meshStandardMaterial color={TRIM_COLOR} roughness={0.75} />
        </mesh>
        {/* conical roof */}
        <mesh
          position={[0, baseY + wallH + 0.014 * scale + roofH / 2, 0]}
          castShadow
        >
          <coneGeometry args={[tw * 1.14, roofH, 16]} />
          <meshStandardMaterial color={roof} roughness={0.7} />
        </mesh>
        {/* finial spike */}
        <mesh
          position={[0, baseY + wallH + 0.014 * scale + roofH + 0.018, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.003, 0.003, 0.04, 6]} />
          <meshStandardMaterial color={TRIM_COLOR} metalness={0.6} />
        </mesh>
        <mesh
          position={[0, baseY + wallH + 0.014 * scale + roofH + 0.042, 0]}
          castShadow
        >
          <sphereGeometry args={[0.008, 10, 8]} />
          <meshStandardMaterial
            color="#d4b870"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
      </group>
    );
  }

  // type 4: log cabin with gabled roof
  const cabinW = w * 0.98;
  const cabinD = w * 0.7;
  const cabinH = h * 0.8;
  const foundH = 0.018 * scale;
  const baseY = foundH;
  const roofH = 0.055 * scale;
  const doorW = cabinW * 0.22;
  const doorH = cabinH * 0.55;
  const winW = cabinW * 0.18;
  const winH = cabinH * 0.26;
  return (
    <group rotation={[0, rotation, 0]}>
      {/* stone foundation (broader, taller) */}
      <mesh position={[0, foundH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[cabinW + 0.018, foundH, cabinD + 0.018]} />
        <meshStandardMaterial color={WAINSCOT_COLOR} roughness={0.95} />
      </mesh>
      {/* wood walls */}
      <mesh position={[0, baseY + cabinH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[cabinW, cabinH, cabinD]} />
        <meshStandardMaterial color="#a87750" roughness={0.92} />
      </mesh>
      {/* horizontal log stripes (4 levels) */}
      {[0.2, 0.4, 0.6, 0.8].map((p) => (
        <mesh key={`log-${p}`} position={[0, baseY + cabinH * p, 0]} castShadow>
          <boxGeometry args={[cabinW + 0.004, 0.005 * scale, cabinD + 0.004]} />
          <meshStandardMaterial color="#6e4628" roughness={0.95} />
        </mesh>
      ))}
      {/* corner posts (4) */}
      {[
        [cabinW / 2, cabinD / 2],
        [-cabinW / 2, cabinD / 2],
        [cabinW / 2, -cabinD / 2],
        [-cabinW / 2, -cabinD / 2],
      ].map(([x, z]) => (
        <mesh
          key={`post-${x}-${z}`}
          position={[x, baseY + cabinH / 2, z]}
          castShadow
        >
          <boxGeometry args={[0.012, cabinH, 0.012]} />
          <meshStandardMaterial color="#5a3a1e" roughness={0.95} />
        </mesh>
      ))}
      {/* door + step */}
      <group position={[0, baseY + doorH / 2, cabinD / 2 + FRONT_OFFSET]}>
        <Door width={doorW} height={doorH} />
      </group>
      <mesh
        position={[0, baseY + 0.006, cabinD / 2 + 0.014 * scale]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[doorW * 1.6, 0.012 * scale, 0.02 * scale]} />
        <meshStandardMaterial color={WAINSCOT_COLOR} roughness={0.95} />
      </mesh>
      {/* front window */}
      <group
        position={[
          cabinW * 0.28,
          baseY + cabinH * 0.55,
          cabinD / 2 + FRONT_OFFSET,
        ]}
      >
        <Win width={winW} height={winH} color={windowColor} />
      </group>
      {/* side window */}
      <group
        position={[cabinW / 2 + FRONT_OFFSET, baseY + cabinH * 0.55, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <Win width={winW} height={winH * 0.9} color={windowColor} />
      </group>
      {/* eave trim */}
      <mesh position={[0, baseY + cabinH + 0.006 * scale, 0]} castShadow>
        <boxGeometry args={[cabinW * 1.1, 0.012 * scale, cabinD * 1.18]} />
        <meshStandardMaterial color="#5a3a1e" roughness={0.9} />
      </mesh>
      {/* gabled wooden roof */}
      <mesh
        geometry={UNIT_GABLED_ROOF_GEO}
        position={[0, baseY + cabinH + 0.012 * scale, 0]}
        scale={[cabinW * 1.1, roofH, cabinD * 1.18]}
        castShadow
      >
        <meshStandardMaterial color={roof} roughness={0.78} />
      </mesh>
      {/* ridge */}
      <mesh
        position={[0, baseY + cabinH + 0.012 * scale + roofH, 0]}
        castShadow
      >
        <boxGeometry args={[0.014, 0.01, cabinD * 1.2]} />
        <meshStandardMaterial color={RIDGE_COLOR} roughness={0.8} />
      </mesh>
      {/* chimney */}
      <mesh
        position={[
          cabinW * 0.32,
          baseY + cabinH + 0.05 * scale,
          -cabinD * 0.18,
        ]}
        castShadow
      >
        <boxGeometry args={[0.028, 0.085 * scale, 0.028]} />
        <meshStandardMaterial color={CHIMNEY_BRICK} roughness={0.92} />
      </mesh>
      {/* chimney cap */}
      <mesh
        position={[
          cabinW * 0.32,
          baseY + cabinH + 0.098 * scale,
          -cabinD * 0.18,
        ]}
        castShadow
      >
        <boxGeometry args={[0.036, 0.006 * scale, 0.036]} />
        <meshStandardMaterial color={TRIM_COLOR} roughness={0.85} />
      </mesh>
    </group>
  );
}

function Building({
  phi,
  theta,
  typeIndex,
  colorIndex,
  wallIndex,
  rotation,
  scale,
}: Placement) {
  const position = useMemo(() => surfacePos(phi, theta), [phi, theta]);
  const quaternion = useMemo(() => surfaceQuat(phi, theta), [phi, theta]);
  return (
    <group position={position} quaternion={quaternion}>
      <BuildingMesh
        type={typeIndex}
        rotation={rotation}
        scale={scale}
        roof={ROOF_COLORS[colorIndex]}
        wall={WALL_COLORS[wallIndex]}
      />
    </group>
  );
}

function Tree({ phi, theta, variant, rotation, scale }: TreePlacement) {
  const position = useMemo(() => surfacePos(phi, theta), [phi, theta]);
  const quaternion = useMemo(() => surfaceQuat(phi, theta), [phi, theta]);

  if (variant === 1) {
    // tall pine
    const trunkH = 0.1 * scale;
    const coneR = 0.11 * scale;
    const coneH = 0.3 * scale;
    return (
      <group position={position} quaternion={quaternion}>
        <group rotation={[0, rotation, 0]}>
          <mesh position={[0, trunkH / 2, 0]} castShadow>
            <cylinderGeometry args={[0.022 * scale, 0.03 * scale, trunkH, 6]} />
            <meshStandardMaterial color="#5a3a1a" />
          </mesh>
          <mesh position={[0, trunkH + coneH / 2, 0]} castShadow>
            <coneGeometry args={[coneR, coneH, 7]} />
            <meshStandardMaterial color="#3d7236" flatShading roughness={0.9} />
          </mesh>
        </group>
      </group>
    );
  }
  // default round tree
  const trunkH = 0.1 * scale;
  const leafR = 0.13 * scale;
  return (
    <group position={position} quaternion={quaternion}>
      <group rotation={[0, rotation, 0]}>
        <mesh position={[0, trunkH / 2, 0]} castShadow>
          <cylinderGeometry args={[0.022 * scale, 0.03 * scale, trunkH, 6]} />
          <meshStandardMaterial color="#5a3a1a" />
        </mesh>
        <mesh position={[0, trunkH + leafR * 0.7, 0]} castShadow>
          <icosahedronGeometry args={[leafR, 0]} />
          <meshStandardMaterial color="#4f8a3a" flatShading roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

function LampPost({ phi, theta }: { phi: number; theta: number }) {
  const position = useMemo(() => surfacePos(phi, theta), [phi, theta]);
  const quaternion = useMemo(() => surfaceQuat(phi, theta), [phi, theta]);
  return (
    <group position={position} quaternion={quaternion}>
      {/* base */}
      <mesh position={[0, 0.006, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.012, 0.014, 0.012, 8]} />
        <meshStandardMaterial color={FOUNDATION_COLOR} roughness={0.95} />
      </mesh>
      {/* pole */}
      <mesh position={[0, 0.055, 0]} castShadow>
        <cylinderGeometry args={[0.0035, 0.005, 0.1, 8]} />
        <meshStandardMaterial color={LAMP_POST} roughness={0.6} />
      </mesh>
      {/* lantern cap (top) */}
      <mesh position={[0, 0.118, 0]} castShadow>
        <coneGeometry args={[0.015, 0.012, 8]} />
        <meshStandardMaterial color={LAMP_POST} roughness={0.7} />
      </mesh>
      {/* lit glass */}
      <mesh position={[0, 0.108, 0]} castShadow>
        <sphereGeometry args={[0.011, 12, 10]} />
        <meshStandardMaterial
          color={LAMP_GLOW}
          emissive={LAMP_GLOW}
          emissiveIntensity={1.2}
          roughness={0.3}
        />
      </mesh>
      {/* tiny actual light */}
      <pointLight
        position={[0, 0.108, 0]}
        intensity={0.08}
        distance={0.4}
        color={LAMP_GLOW}
      />
    </group>
  );
}

function Windmill({ phi, theta }: { phi: number; theta: number }) {
  const position = useMemo(() => surfacePos(phi, theta), [phi, theta]);
  const quaternion = useMemo(() => surfaceQuat(phi, theta), [phi, theta]);
  const bladesRef = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (bladesRef.current) bladesRef.current.rotation.z += dt * 0.7;
  });
  return (
    <group position={position} quaternion={quaternion}>
      <mesh position={[0, 0.11, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.038, 0.05, 0.22, 10]} />
        <meshStandardMaterial color="#fff4dc" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.24, 0]} castShadow>
        <coneGeometry args={[0.05, 0.05, 10]} />
        <meshStandardMaterial color="#c95a4e" roughness={0.7} />
      </mesh>
      <group ref={bladesRef} position={[0, 0.21, 0.05]}>
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((a) => (
          <group key={a} rotation={[0, 0, a]}>
            <mesh position={[0, 0.07, 0]} castShadow>
              <boxGeometry args={[0.014, 0.13, 0.006]} />
              <meshStandardMaterial color="#f4e5cc" />
            </mesh>
          </group>
        ))}
        <mesh>
          <sphereGeometry args={[0.012, 8, 6]} />
          <meshStandardMaterial color="#7a4a2a" />
        </mesh>
      </group>
    </group>
  );
}

function Lighthouse({ phi, theta }: { phi: number; theta: number }) {
  const position = useMemo(() => surfacePos(phi, theta), [phi, theta]);
  const quaternion = useMemo(() => surfaceQuat(phi, theta), [phi, theta]);
  return (
    <group position={position} quaternion={quaternion}>
      <mesh position={[0, 0.14, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.025, 0.04, 0.28, 12]} />
        <meshStandardMaterial color="#ffffff" roughness={0.7} />
      </mesh>
      {/* red stripe */}
      <mesh position={[0, 0.17, 0]} castShadow>
        <cylinderGeometry args={[0.033, 0.033, 0.045, 12]} />
        <meshStandardMaterial color="#c95a4e" roughness={0.7} />
      </mesh>
      {/* lamp room */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.028, 0.028, 0.03, 8]} />
        <meshStandardMaterial
          color="#ffd96b"
          emissive="#ffb840"
          emissiveIntensity={0.9}
        />
      </mesh>
      <mesh position={[0, 0.33, 0]} castShadow>
        <coneGeometry args={[0.032, 0.035, 8]} />
        <meshStandardMaterial color="#1f3a3a" />
      </mesh>
    </group>
  );
}

function Cloud({ position, scale, parts }: CloudPlacement) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.015;
  });
  const offsets = useMemo(() => {
    const arr: { id: string; x: number; y: number; z: number; r: number }[] =
      [];
    for (let i = 0; i < parts; i++) {
      const a = (i / parts) * Math.PI * 2;
      const dist = 0.13 + (i % 2) * 0.05;
      arr.push({
        id: `puff-${i}`,
        x: Math.cos(a) * dist,
        y: (i % 2) * 0.02,
        z: Math.sin(a) * dist * 0.5,
        r: 0.13 + (i % 3) * 0.025,
      });
    }
    return arr;
  }, [parts]);
  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh>
        <sphereGeometry args={[0.17, 12, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
      {offsets.map((o) => (
        <mesh key={o.id} position={[o.x, o.y, o.z]}>
          <sphereGeometry args={[o.r, 12, 8]} />
          <meshStandardMaterial color="#ffffff" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function ColoredPlanet() {
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(PLANET_RADIUS, 5);
    const ocean = new THREE.Color("#5fbeb7");
    const land = new THREE.Color("#86c46a");
    const shore = new THREE.Color("#cfd99a");
    const positions = geo.attributes.position;
    const colors = new Float32Array(positions.count * 3);
    const v = new THREE.Vector3();
    const tmp = new THREE.Color();

    const landPoints = CONTINENTS.map((c) => ({
      center: new THREE.Vector3(
        Math.sin(c.phi) * Math.cos(c.theta),
        Math.cos(c.phi),
        Math.sin(c.phi) * Math.sin(c.theta),
      ),
      cosThreshold: Math.cos(0.55 * c.size),
    }));

    for (let i = 0; i < positions.count; i++) {
      v.fromBufferAttribute(positions, i).normalize();
      let landMix = 0;
      for (const lp of landPoints) {
        const dot = v.dot(lp.center);
        if (dot > lp.cosThreshold) {
          const t = (dot - lp.cosThreshold) / (1 - lp.cosThreshold);
          if (t > landMix) landMix = t;
        }
      }
      const smooth = landMix * landMix * (3 - 2 * landMix);
      // narrow ocean band, fast transition to land so the planet reads as
      // mostly green ground with small water gaps between continents.
      if (smooth < 0.04) {
        tmp.copy(ocean);
      } else if (smooth < 0.14) {
        const k = (smooth - 0.04) / (0.14 - 0.04);
        tmp.copy(ocean).lerp(shore, k);
      } else {
        const k = (smooth - 0.14) / (1 - 0.14);
        tmp.copy(shore).lerp(land, Math.min(1, k));
      }
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.6} metalness={0.05} />
    </mesh>
  );
}

export default function PlanetWorld() {
  return (
    <>
      <ColoredPlanet />

      {DATA.buildings.map((b) => (
        <Building
          key={b.id}
          id={b.id}
          phi={b.phi}
          theta={b.theta}
          typeIndex={b.typeIndex}
          colorIndex={b.colorIndex}
          wallIndex={b.wallIndex}
          rotation={b.rotation}
          scale={b.scale}
        />
      ))}

      {DATA.trees.map((t) => (
        <Tree
          key={t.id}
          id={t.id}
          phi={t.phi}
          theta={t.theta}
          variant={t.variant}
          rotation={t.rotation}
          scale={t.scale}
        />
      ))}

      {DATA.lamps.map((l) => (
        <LampPost key={l.id} phi={l.phi} theta={l.theta} />
      ))}

      <Windmill phi={1.05} theta={1.65} />
      <Lighthouse phi={1.7} theta={4.7} />

      {DATA.clouds.map((c) => (
        <Cloud
          key={c.id}
          id={c.id}
          position={c.position}
          scale={c.scale}
          parts={c.parts}
        />
      ))}
    </>
  );
}

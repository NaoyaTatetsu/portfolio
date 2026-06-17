"use client";

import { Html, Stars } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import PlanetWorld, { OBSTACLES } from "./PlanetWorld";
import { PLANET_RADIUS, surfacePos, surfaceQuat } from "./planet-config";

const MOVE_SPEED = 0.55;
const TURN_RATE = 4; // smaller = more gradual viewpoint turn while strafing
const MARKER_PROXIMITY = 0.42;
const JUMP_SPEED = 1.05;
const GRAVITY = 3.2;
const CHARACTER_RADIUS = 0.045;

interface ProfileItem {
  title: string;
  description: string;
}

interface PlanetSceneProps {
  items: ProfileItem[];
}

interface InputState {
  forward: number;
  right: number;
  jumpQueued: boolean;
}

interface MarkerProps {
  id: string;
  phi: number;
  theta: number;
  title: string;
  color: string;
  isActive: boolean;
  visited: boolean;
}

function Marker({ phi, theta, title, color, isActive, visited }: MarkerProps) {
  const position = useMemo(() => surfacePos(phi, theta), [phi, theta]);
  const quaternion = useMemo(() => surfaceQuat(phi, theta), [phi, theta]);
  const orbRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!orbRef.current) return;
    const t = state.clock.elapsedTime;
    orbRef.current.position.y = 0.26 + Math.sin(t * 2.4) * 0.015;
  });
  const emissiveIntensity = isActive ? 1.4 : visited ? 0.5 : 0.7;
  return (
    <group position={position} quaternion={quaternion}>
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.01, 0.013, 0.2, 6]} />
        <meshStandardMaterial color="#7a4a2a" />
      </mesh>
      <mesh ref={orbRef} position={[0, 0.26, 0]} castShadow>
        <icosahedronGeometry args={[0.04, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          roughness={0.4}
        />
      </mesh>
      <Html position={[0, 0.38, 0]} center distanceFactor={5}>
        <div
          className={`font-display font-semibold text-xs md:text-sm whitespace-nowrap pointer-events-none drop-shadow-[0_1px_0_rgba(255,255,255,0.7)] ${
            isActive
              ? "text-zinc-900 dark:text-zinc-50 scale-110"
              : visited
                ? "text-zinc-500 dark:text-zinc-400"
                : "text-zinc-800 dark:text-zinc-100"
          } transition-transform`}
        >
          {title}
        </div>
      </Html>
    </group>
  );
}

interface CharacterProps {
  inputRef: React.RefObject<InputState>;
  positionRef: React.RefObject<THREE.Vector3 | null>;
}

function Character({ inputRef, positionRef }: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const stateRef = useRef({
    position: new THREE.Vector3(0, PLANET_RADIUS, 0),
    forward: new THREE.Vector3(0, 0, 1),
    up: new THREE.Vector3(0, 1, 0),
    bob: 0,
    verticalOffset: 0,
    verticalVelocity: 0,
  });

  useFrame((_, dt) => {
    const st = stateRef.current;
    const input = inputRef.current;
    const fwdInput = input.forward;
    const rightInput = input.right;
    const grounded = st.verticalOffset <= 0.0001 && st.verticalVelocity <= 0;

    // consume jump request
    if (input.jumpQueued) {
      input.jumpQueued = false;
      if (grounded) {
        st.verticalVelocity = JUMP_SPEED;
      }
    }

    // integrate vertical (jump) physics
    st.verticalVelocity -= GRAVITY * dt;
    st.verticalOffset += st.verticalVelocity * dt;
    if (st.verticalOffset < 0) {
      st.verticalOffset = 0;
      st.verticalVelocity = 0;
    }

    const moveMag = Math.hypot(fwdInput, rightInput);
    const wantsToMove = moveMag > 0;

    // movement: only on ground (mid-air movement disabled for clarity)
    if (wantsToMove && grounded) {
      // walking animation tick — runs even when collision blocks travel so
      // the legs keep swinging while pushing against a wall.
      st.bob += dt * 8;

      // world-space movement direction = forward * fwdInput + right * rightInput.
      // "right" here is screen-right (camera-relative), which is cross(forward, up)
      // for our third-person camera that sits behind the character.
      const rightAxis = new THREE.Vector3()
        .crossVectors(st.forward, st.up)
        .normalize();
      const moveDir = new THREE.Vector3()
        .addScaledVector(st.forward, fwdInput)
        .addScaledVector(rightAxis, rightInput);
      const moveLen = moveDir.length();
      if (moveLen > 0) {
        moveDir.divideScalar(moveLen);
        const speed = Math.min(moveMag, 1) * MOVE_SPEED;
        // axis to rotate position around so it travels along moveDir
        const moveAxis = new THREE.Vector3()
          .crossVectors(st.up, moveDir)
          .normalize();
        const q = new THREE.Quaternion().setFromAxisAngle(moveAxis, speed * dt);
        const candidate = st.position.clone().applyQuaternion(q);
        let blocked = false;
        for (const obs of OBSTACLES) {
          const dx = candidate.x - obs.position.x;
          const dy = candidate.y - obs.position.y;
          const dz = candidate.z - obs.position.z;
          const r = CHARACTER_RADIUS + obs.radius;
          if (dx * dx + dy * dy + dz * dz < r * r) {
            blocked = true;
            break;
          }
        }
        if (!blocked) {
          st.position.copy(candidate);
          st.up.copy(st.position).normalize();
          // keep forward tangent to the new surface by applying the same q
          st.forward.applyQuaternion(q);
          const dot = st.forward.dot(st.up);
          st.forward.sub(st.up.clone().multiplyScalar(dot)).normalize();
        }
        // smoothly slew the facing toward the movement direction. The amount
        // is proportional to elapsed time, so the viewpoint turns gradually
        // while the player keeps holding the input (e.g. holding left rotates
        // the camera left in proportion to how far the character travels).
        const target = moveDir.clone();
        target.sub(st.up.clone().multiplyScalar(target.dot(st.up)));
        if (target.lengthSq() > 0.0001) {
          target.normalize();
          const turnAmt = 1 - Math.exp(-dt * TURN_RATE);
          st.forward.lerp(target, turnAmt);
          const d = st.forward.dot(st.up);
          st.forward.sub(st.up.clone().multiplyScalar(d)).normalize();
        }
      }
    }

    // worldPos includes vertical offset for rendering
    const worldPos = st.position
      .clone()
      .add(st.up.clone().multiplyScalar(st.verticalOffset));

    if (positionRef.current) {
      positionRef.current.copy(st.position);
    }

    if (groupRef.current) {
      groupRef.current.position.copy(worldPos);
      const right = new THREE.Vector3()
        .crossVectors(st.up, st.forward)
        .normalize();
      const m = new THREE.Matrix4().makeBasis(right, st.up, st.forward);
      groupRef.current.quaternion.setFromRotationMatrix(m);
    }

    const moving = wantsToMove && grounded;
    if (bodyRef.current) {
      bodyRef.current.position.y = moving
        ? Math.abs(Math.sin(st.bob)) * 0.02
        : 0;
    }
    // leg swing — sin(bob) swings forward/back, opposite phase per leg.
    const swing = moving ? Math.sin(st.bob) * 0.7 : 0;
    if (leftLegRef.current) {
      leftLegRef.current.rotation.x = swing;
    }
    if (rightLegRef.current) {
      rightLegRef.current.rotation.x = -swing;
    }

    const camDistance = 1.1;
    const camHeight = 0.7;
    const desiredCam = st.position
      .clone()
      .add(st.forward.clone().multiplyScalar(-camDistance))
      .add(st.up.clone().multiplyScalar(camHeight + st.verticalOffset * 0.4));
    camera.position.lerp(desiredCam, 1 - Math.exp(-dt * 6));
    camera.up.copy(st.up);
    const look = worldPos.clone().add(st.up.clone().multiplyScalar(0.1));
    camera.lookAt(look);
  });

  return (
    <group ref={groupRef}>
      <group ref={bodyRef}>
        {/* left leg — pivot at hip (top of leg) */}
        <group ref={leftLegRef} position={[-0.018, 0.05, 0]}>
          <mesh position={[0, -0.025, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.05, 6]} />
            <meshStandardMaterial color="#3a3a3a" />
          </mesh>
        </group>
        {/* right leg — pivot at hip (top of leg) */}
        <group ref={rightLegRef} position={[0.018, 0.05, 0]}>
          <mesh position={[0, -0.025, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.05, 6]} />
            <meshStandardMaterial color="#3a3a3a" />
          </mesh>
        </group>
        <mesh position={[0, 0.09, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.04, 0.075, 8]} />
          <meshStandardMaterial color="#c95a4e" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.16, 0]} castShadow>
          <sphereGeometry args={[0.04, 16, 12]} />
          <meshStandardMaterial color="#f4c89f" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.205, 0]} castShadow>
          <coneGeometry args={[0.045, 0.05, 12]} />
          <meshStandardMaterial color="#1f3a3a" />
        </mesh>
        <mesh position={[0, 0.16, 0.04]} castShadow>
          <sphereGeometry args={[0.008, 8, 6]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
    </group>
  );
}

interface MarkerDef {
  id: string;
  phi: number;
  theta: number;
  color: string;
}

interface ProximityWatcherProps {
  markers: MarkerDef[];
  positionRef: React.RefObject<THREE.Vector3 | null>;
  onActiveChange: (id: string | null) => void;
}

function ProximityWatcher({
  markers,
  positionRef,
  onActiveChange,
}: ProximityWatcherProps) {
  const lastActiveRef = useRef<string | null>(null);
  const positions = useMemo(
    () => markers.map((m) => surfacePos(m.phi, m.theta)),
    [markers],
  );
  useFrame(() => {
    const p = positionRef.current;
    if (!p) return;
    let closest: { id: string; dist: number } | null = null;
    for (let i = 0; i < markers.length; i++) {
      const d = positions[i].distanceTo(p);
      if (d < MARKER_PROXIMITY && (!closest || d < closest.dist)) {
        closest = { id: markers[i].id, dist: d };
      }
    }
    const newId = closest?.id ?? null;
    if (newId !== lastActiveRef.current) {
      lastActiveRef.current = newId;
      onActiveChange(newId);
    }
  });
  return null;
}

const MARKER_COLORS = [
  "#f4a05a",
  "#e8d24a",
  "#7dc473",
  "#5fb8c5",
  "#7e9ed4",
  "#b88ad4",
  "#e58aa3",
  "#d97a4e",
];

const MARKER_POSITIONS = [
  { phi: 0.6, theta: 0.4 },
  { phi: 0.95, theta: 1.65 },
  { phi: 1.25, theta: 1.9 },
  { phi: 1.55, theta: 3.4 },
  { phi: 1.7, theta: 4.7 },
  { phi: 2.0, theta: 1.1 },
  { phi: 0.9, theta: 5.1 },
  { phi: 1.7, theta: 5.3 },
];

function useKeyboard(inputRef: React.RefObject<InputState>) {
  useEffect(() => {
    const keys = new Set<string>();
    const update = () => {
      let f = 0;
      let r = 0;
      if (keys.has("w") || keys.has("arrowup")) f += 1;
      if (keys.has("s") || keys.has("arrowdown")) f -= 1;
      if (keys.has("d") || keys.has("arrowright")) r += 1;
      if (keys.has("a") || keys.has("arrowleft")) r -= 1;
      inputRef.current.forward = f;
      inputRef.current.right = r;
    };
    const onDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === " " || k === "spacebar") {
        e.preventDefault();
        inputRef.current.jumpQueued = true;
        return;
      }
      if (
        [
          "w",
          "a",
          "s",
          "d",
          "arrowup",
          "arrowdown",
          "arrowleft",
          "arrowright",
        ].includes(k)
      ) {
        e.preventDefault();
        keys.add(k);
        update();
      }
    };
    const onUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (keys.has(k)) {
        keys.delete(k);
        update();
      }
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [inputRef]);
}

function ControlPad({ inputRef }: { inputRef: React.RefObject<InputState> }) {
  const press =
    (key: "f" | "b" | "l" | "r", value: number) => (e: React.PointerEvent) => {
      e.preventDefault();
      if (key === "f")
        inputRef.current.forward = Math.max(inputRef.current.forward, value);
      else if (key === "b")
        inputRef.current.forward = Math.min(inputRef.current.forward, -value);
      else if (key === "l")
        inputRef.current.right = Math.min(inputRef.current.right, -value);
      else if (key === "r")
        inputRef.current.right = Math.max(inputRef.current.right, value);
    };
  const release = (key: "f" | "b" | "l" | "r") => () => {
    if (key === "f" && inputRef.current.forward > 0)
      inputRef.current.forward = 0;
    if (key === "b" && inputRef.current.forward < 0)
      inputRef.current.forward = 0;
    if (key === "l" && inputRef.current.right < 0) inputRef.current.right = 0;
    if (key === "r" && inputRef.current.right > 0) inputRef.current.right = 0;
  };

  const btnBase =
    "select-none w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-xl border-2 border-zinc-900 dark:border-zinc-50 bg-white/85 dark:bg-zinc-900/85 text-zinc-900 dark:text-zinc-50 font-display font-bold text-xl active:translate-y-0.5 active:translate-x-0.5 active:shadow-none shadow-[3px_3px_0_0_rgba(0,0,0,0.85)] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.7)] touch-none";

  return (
    <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-10 grid grid-cols-3 grid-rows-3 gap-1.5">
      <div />
      <button
        type="button"
        className={btnBase}
        onPointerDown={press("f", 1)}
        onPointerUp={release("f")}
        onPointerLeave={release("f")}
        aria-label="forward"
      >
        ↑
      </button>
      <div />
      <button
        type="button"
        className={btnBase}
        onPointerDown={press("l", 1)}
        onPointerUp={release("l")}
        onPointerLeave={release("l")}
        aria-label="turn left"
      >
        ←
      </button>
      <div />
      <button
        type="button"
        className={btnBase}
        onPointerDown={press("r", 1)}
        onPointerUp={release("r")}
        onPointerLeave={release("r")}
        aria-label="turn right"
      >
        →
      </button>
      <div />
      <button
        type="button"
        className={btnBase}
        onPointerDown={press("b", 1)}
        onPointerUp={release("b")}
        onPointerLeave={release("b")}
        aria-label="backward"
      >
        ↓
      </button>
      <div />
    </div>
  );
}

function JumpButton({ inputRef }: { inputRef: React.RefObject<InputState> }) {
  const onPress = (e: React.PointerEvent) => {
    e.preventDefault();
    inputRef.current.jumpQueued = true;
  };
  return (
    <button
      type="button"
      onPointerDown={onPress}
      aria-label="jump"
      className="md:hidden absolute bottom-6 right-4 z-10 select-none w-16 h-16 rounded-full border-2 border-zinc-900 dark:border-zinc-50 bg-amber-200 text-zinc-900 font-display font-bold text-sm shadow-[3px_3px_0_0_rgba(0,0,0,0.85)] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none touch-none"
    >
      JUMP
    </button>
  );
}

interface InfoPanelProps {
  item: ProfileItem | null;
}

function InfoPanel({ item }: InfoPanelProps) {
  return (
    <div className="pointer-events-none absolute left-2 right-2 md:left-4 md:right-4 bottom-20 md:bottom-4 flex justify-center z-10">
      <div
        className={`max-w-md w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-xl border-2 border-zinc-900 dark:border-zinc-50 px-4 py-3 shadow-[3px_3px_0_0_rgba(0,0,0,0.85)] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.7)] transition-all duration-200 ${
          item ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <div className="font-display font-semibold text-zinc-900 dark:text-zinc-50 text-sm md:text-base">
          {item?.title ?? "—"}
        </div>
        <div className="text-xs md:text-sm text-zinc-700 dark:text-zinc-200 mt-0.5">
          {item?.description ?? "近づくとここに表示されます"}
        </div>
      </div>
    </div>
  );
}

export default function PlanetScene({ items }: PlanetSceneProps) {
  const [mounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const { resolvedTheme } = useTheme();
  const isNight = mounted && resolvedTheme === "dark";

  const inputRef = useRef<InputState>({
    forward: 0,
    right: 0,
    jumpQueued: false,
  });
  const characterPosRef = useRef<THREE.Vector3 | null>(
    new THREE.Vector3(0, PLANET_RADIUS, 0),
  );

  useKeyboard(inputRef);

  useEffect(() => setMounted(true), []);

  const markers = useMemo(
    () =>
      items.map((item, i) => ({
        id: item.title,
        title: item.title,
        phi: MARKER_POSITIONS[i % MARKER_POSITIONS.length].phi,
        theta: MARKER_POSITIONS[i % MARKER_POSITIONS.length].theta,
        color: MARKER_COLORS[i % MARKER_COLORS.length],
        item,
      })),
    [items],
  );

  useEffect(() => {
    if (activeId) {
      setVisited((v) => {
        if (v.has(activeId)) return v;
        const next = new Set(v);
        next.add(activeId);
        return next;
      });
    }
  }, [activeId]);

  const activeItem = activeId
    ? (markers.find((m) => m.id === activeId)?.item ?? null)
    : null;

  if (!mounted) {
    return <div className="w-full h-full" aria-hidden="true" />;
  }

  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, PLANET_RADIUS + 0.7, 1.1], fov: 50 }}
        style={{ width: "100%", height: "100%" }}
      >
        <color attach="background" args={[isNight ? "#0a1430" : "#dff1ed"]} />
        <fog attach="fog" args={[isNight ? "#0a1430" : "#dff1ed", 6, 15]} />
        <ambientLight
          intensity={isNight ? 0.7 : 0.85}
          color={isNight ? "#8aa0d4" : "#ffffff"}
        />
        <hemisphereLight
          args={[
            isNight ? "#b8c8ec" : "#ffffff",
            isNight ? "#3a4c78" : "#9cbf9c",
            isNight ? 0.5 : 0,
          ]}
        />
        <directionalLight
          position={isNight ? [-3, 5, -2] : [3.5, 5, 4]}
          intensity={isNight ? 0.95 : 1.05}
          color={isNight ? "#d4dcf0" : "#ffffff"}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight
          position={[-4, 2, -3]}
          intensity={isNight ? 0.35 : 0.25}
          color={isNight ? "#8aa0d4" : "#ffffff"}
        />
        {isNight && (
          <Stars
            radius={50}
            depth={20}
            count={1200}
            factor={3}
            saturation={0.4}
            fade
            speed={0.4}
          />
        )}

        <PlanetWorld />

        {markers.map((m) => (
          <Marker
            key={m.id}
            id={m.id}
            phi={m.phi}
            theta={m.theta}
            title={m.title}
            color={m.color}
            isActive={activeId === m.id}
            visited={visited.has(m.id)}
          />
        ))}
        <Character inputRef={inputRef} positionRef={characterPosRef} />
        <ProximityWatcher
          markers={markers}
          positionRef={characterPosRef}
          onActiveChange={setActiveId}
        />
      </Canvas>
      <div className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 text-[10px] md:text-xs text-zinc-700 dark:text-zinc-300 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm rounded-full px-3 py-1 z-10">
        <span className="hidden md:inline">
          WASD / 矢印 で移動 · Space でジャンプ ·{" "}
        </span>
        <span>
          {visited.size}/{markers.length} 見つけた
        </span>
      </div>
      <ControlPad inputRef={inputRef} />
      <JumpButton inputRef={inputRef} />
      <InfoPanel item={activeItem} />
    </div>
  );
}

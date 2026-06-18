"use client";

import type { ThreeEvent } from "@react-three/fiber";

interface SceneProps {
  view: "room" | "pc";
  onMonitorClick: () => void;
}

export default function Scene({ view, onMonitorClick }: SceneProps) {
  const wallColor = "#ffffff";
  const wallSideColor = "#f5f5f5";
  const floorColor = "#f0f0f0";
  const deskColor = "#a87248";
  const deskTopColor = "#c69267";
  const monitorBackColor = "#3a3a44";
  const standColor = "#4a4a52";
  const keyboardColor = "#e6e6ea";
  const mouseColor = "#dcdce0";

  const handleMonitorClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (view === "room") {
      onMonitorClick();
    }
  };

  return (
    <group>
      <ambientLight intensity={1.05} />
      <hemisphereLight args={["#fff7d8", "#7a5a3a", 0.7]} />
      <directionalLight position={[3.5, 5.5, 3]} intensity={1.1} />
      <directionalLight position={[-4, 4, 2]} intensity={0.5} color="#fde7b8" />
      <pointLight
        position={[-2.4, 2.2, 0.5]}
        intensity={0.5}
        color="#fde68a"
        distance={6}
      />
      <pointLight
        position={[0, 1.55, -1.0]}
        intensity={view === "pc" ? 1.4 : 0.9}
        color="#a0c4ff"
        distance={3}
      />

      <mesh position={[0, 2.2, -2]}>
        <boxGeometry args={[8, 4.4, 0.1]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      <mesh position={[4, 2.2, 0.5]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[5, 4.4, 0.1]} />
        <meshStandardMaterial color={wallSideColor} />
      </mesh>
      <mesh position={[0, 0, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 5]} />
        <meshStandardMaterial color={floorColor} />
      </mesh>

      <group position={[-2.3, 2.3, -1.94]}>
        <mesh>
          <boxGeometry args={[1.4, 1.0, 0.05]} />
          <meshStandardMaterial color="#c19a6b" />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[1.28, 0.9]} />
          <meshStandardMaterial
            color="#f7c89c"
            emissive="#f7c89c"
            emissiveIntensity={0.05}
          />
        </mesh>
        <mesh position={[0.2, -0.05, 0.04]}>
          <circleGeometry args={[0.14, 24]} />
          <meshStandardMaterial
            color="#fde68a"
            emissive="#fde68a"
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>

      <group position={[2.4, 2.3, -1.94]}>
        <mesh>
          <boxGeometry args={[1.2, 1.4, 0.05]} />
          <meshStandardMaterial color="#e7d6b8" />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[1.05, 1.25]} />
          <meshStandardMaterial
            color="#bcd4ff"
            emissive="#bcd4ff"
            emissiveIntensity={0.05}
          />
        </mesh>
        <mesh position={[0, 0, 0.035]}>
          <planeGeometry args={[1.0, 0.02]} />
          <meshStandardMaterial color="#e7d6b8" />
        </mesh>
        <mesh position={[0, 0, 0.04]} rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[1.2, 0.02]} />
          <meshStandardMaterial color="#e7d6b8" />
        </mesh>
      </group>

      <group position={[0, 1.0, -1.45]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3.2, 0.06, 1.3]} />
          <meshStandardMaterial color={deskTopColor} />
        </mesh>
        <mesh position={[0, -0.025, 0.65]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.2, 0.06]} />
          <meshStandardMaterial color={deskColor} />
        </mesh>

        <mesh position={[-1.5, -0.5, -0.55]}>
          <boxGeometry args={[0.08, 1.0, 0.08]} />
          <meshStandardMaterial color={deskColor} />
        </mesh>
        <mesh position={[1.5, -0.5, -0.55]}>
          <boxGeometry args={[0.08, 1.0, 0.08]} />
          <meshStandardMaterial color={deskColor} />
        </mesh>
        <mesh position={[-1.5, -0.5, 0.55]}>
          <boxGeometry args={[0.08, 1.0, 0.08]} />
          <meshStandardMaterial color={deskColor} />
        </mesh>
        <mesh position={[1.5, -0.5, 0.55]}>
          <boxGeometry args={[0.08, 1.0, 0.08]} />
          <meshStandardMaterial color={deskColor} />
        </mesh>
      </group>

      <group position={[0, 1.04, -1.78]}>
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.22, 0.24, 0.02, 24]} />
          <meshStandardMaterial color={standColor} />
        </mesh>
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.05, 0.22, 0.04]} />
          <meshStandardMaterial color={standColor} />
        </mesh>
      </group>

      {/* biome-ignore lint/a11y/noStaticElementInteractions: three.js group is not a DOM element */}
      <group position={[0, 1.55, -1.78]} onClick={handleMonitorClick}>
        <mesh position={[0, 0, -0.025]}>
          <boxGeometry args={[1.55, 0.95, 0.05]} />
          <meshStandardMaterial color={monitorBackColor} />
        </mesh>
        <mesh position={[0, 0, 0.005]}>
          <boxGeometry args={[1.54, 0.94, 0.03]} />
          <meshStandardMaterial color="#0a0a14" />
        </mesh>
        <mesh position={[0, 0, 0.022]}>
          <planeGeometry args={[1.5, 0.9]} />
          <meshStandardMaterial color="#0a0a14" />
        </mesh>
        <mesh position={[0, 0.46, 0.022]}>
          <circleGeometry args={[0.01, 16]} />
          <meshStandardMaterial color="#888" />
        </mesh>
      </group>

      <mesh position={[0, 1.04, -0.95]}>
        <boxGeometry args={[1.0, 0.03, 0.32]} />
        <meshStandardMaterial color={keyboardColor} />
      </mesh>
      <mesh position={[0, 1.06, -0.95]}>
        <boxGeometry args={[0.96, 0.005, 0.28]} />
        <meshStandardMaterial color="#26262a" />
      </mesh>

      <mesh position={[0.75, 1.04, -0.7]}>
        <boxGeometry args={[0.1, 0.025, 0.16]} />
        <meshStandardMaterial color={mouseColor} />
      </mesh>

      <group position={[-1.25, 1.08, -1.65]}>
        <mesh>
          <cylinderGeometry args={[0.12, 0.1, 0.16, 18]} />
          <meshStandardMaterial color="#c8704a" />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <sphereGeometry args={[0.18, 18, 18]} />
          <meshStandardMaterial color="#3a9d6b" />
        </mesh>
        <mesh position={[-0.08, 0.26, 0.04]}>
          <sphereGeometry args={[0.1, 14, 14]} />
          <meshStandardMaterial color="#48b07a" />
        </mesh>
        <mesh position={[0.08, 0.26, -0.04]}>
          <sphereGeometry args={[0.1, 14, 14]} />
          <meshStandardMaterial color="#48b07a" />
        </mesh>
      </group>

      <group position={[1.2, 1.04, -1.55]}>
        <mesh position={[0, 0.025, 0]}>
          <boxGeometry args={[0.16, 0.05, 0.22]} />
          <meshStandardMaterial color="#6b7bff" />
        </mesh>
        <mesh position={[0.01, 0.075, 0]}>
          <boxGeometry args={[0.16, 0.05, 0.22]} />
          <meshStandardMaterial color="#e6913f" />
        </mesh>
        <mesh position={[-0.01, 0.125, 0]}>
          <boxGeometry args={[0.16, 0.05, 0.22]} />
          <meshStandardMaterial color="#d24e63" />
        </mesh>
      </group>

      <group position={[1.45, 1.04, -1.05]}>
        <mesh>
          <cylinderGeometry args={[0.07, 0.07, 0.12, 24]} />
          <meshStandardMaterial color="#f49778" />
        </mesh>
        <mesh position={[0, 0.061, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.005, 24]} />
          <meshStandardMaterial color="#5c2f1d" />
        </mesh>
      </group>

      <group position={[-2.4, 0, 0.4]}>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.1, 24]} />
          <meshStandardMaterial color="#3a3338" />
        </mesh>
        <mesh position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 1.9, 12]} />
          <meshStandardMaterial color="#4c4148" />
        </mesh>
        <mesh position={[0, 2.05, 0]}>
          <coneGeometry args={[0.32, 0.4, 24, 1, true]} />
          <meshStandardMaterial
            color="#fde68a"
            emissive="#fde68a"
            emissiveIntensity={0.25}
            side={2}
          />
        </mesh>
      </group>

      <group position={[-2.6, 1.05, -1.6]}>
        <mesh>
          <cylinderGeometry args={[0.18, 0.22, 0.18, 24]} />
          <meshStandardMaterial color="#8a6a4a" />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.32, 22, 22]} />
          <meshStandardMaterial color="#42a877" />
        </mesh>
        <mesh position={[-0.18, 0.46, 0.07]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#5cbb89" />
        </mesh>
        <mesh position={[0.16, 0.48, -0.05]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#5cbb89" />
        </mesh>
      </group>

      <group position={[2.5, 0.55, -1.4]}>
        <mesh>
          <boxGeometry args={[0.9, 0.06, 0.9]} />
          <meshStandardMaterial color="#4a3f37" />
        </mesh>
        <mesh position={[0, 0.5, -0.4]}>
          <boxGeometry args={[0.9, 1.0, 0.1]} />
          <meshStandardMaterial color="#4a3f37" />
        </mesh>
        <mesh position={[-0.4, -0.25, 0.4]}>
          <boxGeometry args={[0.06, 0.55, 0.06]} />
          <meshStandardMaterial color="#4a3f37" />
        </mesh>
        <mesh position={[0.4, -0.25, 0.4]}>
          <boxGeometry args={[0.06, 0.55, 0.06]} />
          <meshStandardMaterial color="#4a3f37" />
        </mesh>
        <mesh position={[-0.4, -0.25, -0.4]}>
          <boxGeometry args={[0.06, 0.55, 0.06]} />
          <meshStandardMaterial color="#4a3f37" />
        </mesh>
        <mesh position={[0.4, -0.25, -0.4]}>
          <boxGeometry args={[0.06, 0.55, 0.06]} />
          <meshStandardMaterial color="#4a3f37" />
        </mesh>
      </group>
    </group>
  );
}
